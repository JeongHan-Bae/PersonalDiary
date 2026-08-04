import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import type {
  CreateDiaryEntryInput,
  PersonalDataV1,
  UpdateDiaryEntryInput,
} from '@/models/personalData';
import {
  createDiaryEntry,
  deleteDiaryEntry,
  exportPersonalDataToJsonFile,
  importPersonalDataFromFile,
  listDiaryEntries,
  updateDiaryEntry,
} from '@/services/personalDataService';
import {
  createDiaryEntryCardViewModels,
  getDiaryPromptForDate,
  hasPersonalDataEntries,
} from '@/presentation/personalDataHomeViewModels';
import type { SelectOptionViewModel } from '@/presentation/formControlViewModels';
import { hasDraftModalContent, useDraftModal } from '@/presentation/useDraftModal';
import {
  FILTER_MODE_OPTIONS,
  INCLUDE_OPTIONS,
  DIARY_LEVEL_FIELD_CONFIGS,
  type DiaryLevelFieldId,
  DIARY_TIME_PERIODS,
  DIARY_TIME_PERIOD_OPTIONS,
  TIME_ZONE_FILTER_MODE_OPTIONS,
  type DiaryTimePeriodId,
} from '@/constants/businessConstants';
import {
  APP_DATE_TIME_FORMATS,
  LOADING_PLACEHOLDER_DELAYS,
} from '@/constants/visualConstants';
import { useDelayedVisibility } from '@/presentation/useDelayedVisibility';
import { PERSONAL_DATA_HOME_CONTENT } from '@/presentation/personalDataHomeContent';

export interface DiaryLevelFilterState {
  enabled: boolean;
  min: number;
  max: number;
}

export type DiaryTimeZoneFilterMode = 'current' | 'submitted';

const includeOptions: SelectOptionViewModel[] = INCLUDE_OPTIONS;
const filterModeOptions: SelectOptionViewModel[] = FILTER_MODE_OPTIONS;
const timePeriodOptions: SelectOptionViewModel[] = DIARY_TIME_PERIOD_OPTIONS;
const timeZoneFilterModeOptions: SelectOptionViewModel[] =
  TIME_ZONE_FILTER_MODE_OPTIONS;

const createLevelFilter = (fieldId: DiaryLevelFieldId): DiaryLevelFilterState => ({
  enabled: false,
  min: DIARY_LEVEL_FIELD_CONFIGS[fieldId].inputMin,
  max: DIARY_LEVEL_FIELD_CONFIGS[fieldId].inputMax,
});

const clampLevel = (fieldId: DiaryLevelFieldId, value: number): number =>
  Math.min(
    DIARY_LEVEL_FIELD_CONFIGS[fieldId].inputMax,
    Math.max(DIARY_LEVEL_FIELD_CONFIGS[fieldId].inputMin, Math.round(value)),
  );

const normalizeRange = (
  fieldId: DiaryLevelFieldId,
  filter: DiaryLevelFilterState,
): DiaryLevelFilterState => {
  const min = clampLevel(fieldId, filter.min);
  const max = clampLevel(fieldId, filter.max);

  return {
    ...filter,
    min: Math.min(min, max),
    max: Math.max(min, max),
  };
};

const matchesLevelFilter = (
  value: number | undefined,
  filter: DiaryLevelFilterState,
): boolean => {
  if (!filter.enabled) {
    return true;
  }

  return value !== undefined && value >= filter.min && value <= filter.max;
};

const getEntrySubmittedAt = (entry: PersonalDataV1.DiaryEntry): string =>
  entry.submittedAt ?? entry.createdAt;

const getEntrySubmittedDate = (entry: PersonalDataV1.DiaryEntry): string =>
  getEntrySubmittedAt(entry).slice(0, 10);

const getLocalTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

const getHourInTimeZone = (timestamp: string, timeZone: string | undefined): number => {
  try {
    const formatter = new Intl.DateTimeFormat(APP_DATE_TIME_FORMATS.locale, {
      ...APP_DATE_TIME_FORMATS.hourInTimeZone,
      ...(timeZone !== undefined ? { timeZone } : {}),
    });
    const hour = formatter
      .formatToParts(new Date(timestamp))
      .find((part) => part.type === 'hour')?.value;

    return hour === undefined ? new Date(timestamp).getHours() : Number(hour) % 24;
  } catch {
    return new Date(timestamp).getHours();
  }
};

const getTimePeriodId = (
  entry: PersonalDataV1.DiaryEntry,
  mode: DiaryTimeZoneFilterMode,
): DiaryTimePeriodId => {
  const timeZone =
    mode === 'submitted' ? entry.submittedTimeZone ?? getLocalTimeZone() : undefined;
  const hour = getHourInTimeZone(getEntrySubmittedAt(entry), timeZone);

  if (hour < DIARY_TIME_PERIODS.morning.startHour) {
    return 'dawn';
  }

  if (hour < DIARY_TIME_PERIODS.afternoon.startHour) {
    return 'morning';
  }

  if (hour < DIARY_TIME_PERIODS.evening.startHour) {
    return 'afternoon';
  }

  return 'evening';
};

const hasText = (value: string): boolean => value.trim() !== '';

const buildDiaryEntryInput = (
  form: ReturnType<typeof useDraftModal>['draftModalForm']['value'],
): CreateDiaryEntryInput => {
  const input: CreateDiaryEntryInput = {
    tags: [],
  };

  if (hasText(form.title)) {
    input.title = form.title.trim();
  }

  if (form.includeMood) {
    input.moodLevel = clampLevel('moodLevel', form.moodLevel);
  }

  if (form.includeAnxiety) {
    input.anxietyLevel = clampLevel('anxietyLevel', form.anxietyLevel);
  }

  if (form.includeEnergy) {
    input.energyLevel = clampLevel('energyLevel', form.energyLevel);
  }

  if (form.includeHighlight && hasText(form.highlight)) {
    input.highlight = form.highlight.trim();
  }

  if (form.includeTrouble && hasText(form.trouble)) {
    input.trouble = form.trouble.trim();
  }

  if (form.includeBodyFeeling && hasText(form.bodyFeeling)) {
    input.bodyFeeling = form.bodyFeeling.trim();
  }

  if (form.includeContent && hasText(form.content)) {
    input.content = form.content.trim();
  }

  return input;
};

const buildDiaryEntryUpdateInput = (
  form: ReturnType<typeof useDraftModal>['draftModalForm']['value'],
): UpdateDiaryEntryInput => ({
  title: hasText(form.title) ? form.title.trim() : undefined,
  moodLevel: form.includeMood ? clampLevel('moodLevel', form.moodLevel) : undefined,
  anxietyLevel: form.includeAnxiety
    ? clampLevel('anxietyLevel', form.anxietyLevel)
    : undefined,
  energyLevel: form.includeEnergy
    ? clampLevel('energyLevel', form.energyLevel)
    : undefined,
  highlight:
    form.includeHighlight && hasText(form.highlight)
      ? form.highlight.trim()
      : undefined,
  trouble:
    form.includeTrouble && hasText(form.trouble) ? form.trouble.trim() : undefined,
  bodyFeeling:
    form.includeBodyFeeling && hasText(form.bodyFeeling)
      ? form.bodyFeeling.trim()
      : undefined,
  content:
    form.includeContent && hasText(form.content) ? form.content.trim() : undefined,
});

export const usePersonalDataHomePage = () => {
  const entries = ref<PersonalDataV1.DiaryEntry[]>([]);
  const isLoading = ref(true);
  const delayedDiaryLoadingPlaceholder = useDelayedVisibility(
    LOADING_PLACEHOLDER_DELAYS.diaryEntriesMs,
  );
  const importFileInput = ref<HTMLInputElement>();
  const diaryPromptDate = ref(new Date());
  const moodFilter = ref<DiaryLevelFilterState>(createLevelFilter('moodLevel'));
  const anxietyFilter = ref<DiaryLevelFilterState>(
    createLevelFilter('anxietyLevel'),
  );
  const energyFilter = ref<DiaryLevelFilterState>(
    createLevelFilter('energyLevel'),
  );
  const selectedTimePeriodIds = ref<DiaryTimePeriodId[]>([]);
  const startDateFilter = ref('');
  const endDateFilter = ref('');
  const timeZoneFilterMode = ref<DiaryTimeZoneFilterMode>('submitted');
  const diaryDeleteConfirmationEntryId = ref<string>();
  let diaryPromptTimer: ReturnType<typeof window.setTimeout> | undefined;

  const {
    canSubmitDraftModal,
    closeDraftCloseConfirmation,
    confirmCloseDraftModal,
    draftModalErrorMessage,
    draftModalEyebrow,
    draftModalForm,
    draftModalMode,
    draftModalSubmitLabel,
    draftModalTitle,
    editingDiaryEntryId,
    isDraftCloseConfirmationOpen,
    isDraftModalDirty,
    isDraftModalOpen,
    openDraftModal,
    openDraftModalForUpdate,
    requestCloseDraftModal,
    setDraftModalErrorMessage,
    submitDraftModal,
  } = useDraftModal();

  const diaryPrompt = computed(() =>
    getDiaryPromptForDate(diaryPromptDate.value),
  );

  const filteredEntries = computed(() => {
    const normalizedMoodFilter = normalizeRange('moodLevel', moodFilter.value);
    const normalizedAnxietyFilter = normalizeRange(
      'anxietyLevel',
      anxietyFilter.value,
    );
    const normalizedEnergyFilter = normalizeRange(
      'energyLevel',
      energyFilter.value,
    );

    return entries.value
      .filter((entry) =>
        matchesLevelFilter(entry.moodLevel, normalizedMoodFilter) &&
        matchesLevelFilter(entry.anxietyLevel, normalizedAnxietyFilter) &&
        matchesLevelFilter(entry.energyLevel, normalizedEnergyFilter) &&
        (startDateFilter.value === '' ||
          getEntrySubmittedDate(entry) >= startDateFilter.value) &&
        (endDateFilter.value === '' ||
          getEntrySubmittedDate(entry) <= endDateFilter.value) &&
        (selectedTimePeriodIds.value.length === 0 ||
          selectedTimePeriodIds.value.includes(
            getTimePeriodId(entry, timeZoneFilterMode.value),
          )),
      )
      .sort((left, right) =>
        getEntrySubmittedAt(right).localeCompare(getEntrySubmittedAt(left)),
      );
  });

  const hasEntries = computed(() => hasPersonalDataEntries(filteredEntries.value));
  const shouldShowDiaryLoadingLabel = computed(
    () => isLoading.value && delayedDiaryLoadingPlaceholder.isVisible.value,
  );

  const diaryEntryCountLabel = computed(() =>
    `${filteredEntries.value.length}/${entries.value.length}`,
  );

  const visibleEntryCards = computed(() =>
    createDiaryEntryCardViewModels(filteredEntries.value),
  );

  const diaryDeleteConfirmationEntryLabel = computed(() => {
    const entry = entries.value.find(
      (candidate) => candidate.id === diaryDeleteConfirmationEntryId.value,
    );

    if (entry === undefined) {
      return PERSONAL_DATA_HOME_CONTENT.messages.thisDiary;
    }

    return `${PERSONAL_DATA_HOME_CONTENT.messages.diaryFromPrefix} ${getEntrySubmittedDate(entry)}`;
  });

  const diaryDeleteConfirmationBody = computed(
    () =>
      `Delete ${diaryDeleteConfirmationEntryLabel.value}? ${PERSONAL_DATA_HOME_CONTENT.messages.deleteDiarySuffix}`,
  );

  const refreshEntries = async (): Promise<void> => {
    entries.value = await listDiaryEntries();
  };

  const exportJsonFile = async (): Promise<void> => {
    await exportPersonalDataToJsonFile();
  };

  const openImportFilePicker = (): void => {
    importFileInput.value?.click();
  };

  const importJsonFile = async (event: Event): Promise<void> => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (file === undefined || file === null) {
      return;
    }

    await importPersonalDataFromFile(file);
    input.value = '';
    await refreshEntries();
  };

  const submitDiaryEntry = async (): Promise<void> => {
    try {
      setDraftModalErrorMessage('');

      if (!hasDraftModalContent(draftModalForm.value)) {
        setDraftModalErrorMessage(PERSONAL_DATA_HOME_CONTENT.messages.emptyDraft);
        return;
      }

      if (draftModalMode.value === 'update') {
        if (editingDiaryEntryId.value === undefined) {
          setDraftModalErrorMessage(
            PERSONAL_DATA_HOME_CONTENT.messages.missingUpdateSelection,
          );
          return;
        }

        await updateDiaryEntry(
          editingDiaryEntryId.value,
          buildDiaryEntryUpdateInput(draftModalForm.value),
        );
      } else {
        await createDiaryEntry(buildDiaryEntryInput(draftModalForm.value));
      }

      submitDraftModal();
      await refreshEntries();
    } catch (error) {
      setDraftModalErrorMessage(
        error instanceof Error
          ? error.message
          : PERSONAL_DATA_HOME_CONTENT.messages.diarySaveFailed,
      );
    }
  };

  const openUpdateDiaryEntry = (entryId: string): void => {
    const entry = entries.value.find((candidate) => candidate.id === entryId);

    if (entry === undefined) {
      setDraftModalErrorMessage(PERSONAL_DATA_HOME_CONTENT.messages.diaryNotFound);
      return;
    }

    openDraftModalForUpdate(entry);
  };

  const openDeleteDiaryEntryConfirmation = (entryId: string): void => {
    diaryDeleteConfirmationEntryId.value = entryId;
  };

  const closeDeleteDiaryEntryConfirmation = (): void => {
    diaryDeleteConfirmationEntryId.value = undefined;
  };

  const confirmDeleteDiaryEntry = async (): Promise<void> => {
    const entryId = diaryDeleteConfirmationEntryId.value;

    if (entryId === undefined) {
      return;
    }

    await deleteDiaryEntry(entryId);
    closeDeleteDiaryEntryConfirmation();
    await refreshEntries();
  };

  const setDraftIncludeMood = (value: string): void => {
    draftModalForm.value.includeMood = value === 'include';
  };

  const setDraftIncludeAnxiety = (value: string): void => {
    draftModalForm.value.includeAnxiety = value === 'include';
  };

  const setDraftIncludeEnergy = (value: string): void => {
    draftModalForm.value.includeEnergy = value === 'include';
  };

  const setDraftIncludeHighlight = (value: string): void => {
    draftModalForm.value.includeHighlight = value === 'include';
  };

  const setDraftIncludeTrouble = (value: string): void => {
    draftModalForm.value.includeTrouble = value === 'include';
  };

  const setDraftIncludeBodyFeeling = (value: string): void => {
    draftModalForm.value.includeBodyFeeling = value === 'include';
  };

  const setDraftIncludeContent = (value: string): void => {
    draftModalForm.value.includeContent = value === 'include';
  };

  const setMoodFilterMode = (value: string): void => {
    moodFilter.value.enabled = value === 'on';
  };

  const setAnxietyFilterMode = (value: string): void => {
    anxietyFilter.value.enabled = value === 'on';
  };

  const setEnergyFilterMode = (value: string): void => {
    energyFilter.value.enabled = value === 'on';
  };

  const setTimeZoneFilterMode = (value: string): void => {
    if (value !== 'current' && value !== 'submitted') {
      return;
    }

    timeZoneFilterMode.value = value;
  };

  const scheduleDiaryPromptTick = (): void => {
    const now = new Date();
    const nextHalfHour = new Date(now);
    const nextMinute = now.getMinutes() < 30 ? 30 : 60;

    nextHalfHour.setMinutes(nextMinute, 0, 0);

    diaryPromptTimer = window.setTimeout(() => {
      diaryPromptDate.value = new Date();
      scheduleDiaryPromptTick();
    }, nextHalfHour.getTime() - now.getTime());
  };

  onMounted(async () => {
    diaryPromptDate.value = new Date();
    scheduleDiaryPromptTick();
    delayedDiaryLoadingPlaceholder.start();

    try {
      await refreshEntries();
    } finally {
      isLoading.value = false;
      delayedDiaryLoadingPlaceholder.clear();
    }
  });

  onBeforeUnmount(() => {
    if (diaryPromptTimer !== undefined) {
      window.clearTimeout(diaryPromptTimer);
    }
  });

  return {
    anxietyFilter,
    canSubmitDraftModal,
    closeDeleteDiaryEntryConfirmation,
    closeDraftCloseConfirmation,
    confirmDeleteDiaryEntry,
    confirmCloseDraftModal,
    draftModalErrorMessage,
    draftModalEyebrow,
    draftModalForm,
    draftModalMode,
    draftModalSubmitLabel,
    draftModalTitle,
    endDateFilter,
    energyFilter,
    exportJsonFile,
    filterModeOptions,
    hasEntries,
    importFileInput,
    importJsonFile,
    includeOptions,
    isDraftCloseConfirmationOpen,
    isDraftModalDirty,
    isDraftModalOpen,
    isLoading,
    shouldShowDiaryLoadingLabel,
    diaryDeleteConfirmationEntryId,
    diaryDeleteConfirmationBody,
    diaryDeleteConfirmationEntryLabel,
    diaryEntryCountLabel,
    diaryPrompt,
    homeContent: PERSONAL_DATA_HOME_CONTENT,
    moodFilter,
    openDeleteDiaryEntryConfirmation,
    openDraftModal,
    openImportFilePicker,
    openUpdateDiaryEntry,
    refreshEntries,
    requestCloseDraftModal,
    setAnxietyFilterMode,
    setDraftIncludeAnxiety,
    setDraftIncludeBodyFeeling,
    setDraftIncludeContent,
    setDraftIncludeEnergy,
    setDraftIncludeHighlight,
    setDraftIncludeMood,
    setDraftIncludeTrouble,
    setEnergyFilterMode,
    setMoodFilterMode,
    diaryLevelFieldConfigs: DIARY_LEVEL_FIELD_CONFIGS,
    setTimeZoneFilterMode,
    selectedTimePeriodIds,
    startDateFilter,
    submitDiaryEntry,
    timePeriodOptions,
    timeZoneFilterMode,
    timeZoneFilterModeOptions,
    visibleEntryCards,
  };
};
