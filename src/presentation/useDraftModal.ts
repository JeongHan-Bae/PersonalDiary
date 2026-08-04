import { computed, ref } from 'vue';

import type { PersonalDataV1 } from '@/models/personalData';
import { DIARY_LEVEL_FIELD_CONFIGS } from '@/constants/businessConstants';
import { PERSONAL_DATA_HOME_CONTENT } from '@/presentation/personalDataHomeContent';

export interface DraftModalForm {
  title: string;
  includeMood: boolean;
  moodLevel: number;
  includeAnxiety: boolean;
  anxietyLevel: number;
  includeEnergy: boolean;
  energyLevel: number;
  includeHighlight: boolean;
  highlight: string;
  includeTrouble: boolean;
  trouble: string;
  includeBodyFeeling: boolean;
  bodyFeeling: string;
  includeContent: boolean;
  content: string;
}

export type DraftModalMode = 'create' | 'update';

const createEmptyDraftModalForm = (): DraftModalForm => ({
  title: '',
  includeMood: false,
  moodLevel: DIARY_LEVEL_FIELD_CONFIGS.moodLevel.defaultValue,
  includeAnxiety: false,
  anxietyLevel: DIARY_LEVEL_FIELD_CONFIGS.anxietyLevel.defaultValue,
  includeEnergy: false,
  energyLevel: DIARY_LEVEL_FIELD_CONFIGS.energyLevel.defaultValue,
  includeHighlight: false,
  highlight: '',
  includeTrouble: false,
  trouble: '',
  includeBodyFeeling: false,
  bodyFeeling: '',
  includeContent: true,
  content: '',
});

const cloneDraftModalForm = (form: DraftModalForm): DraftModalForm => ({
  ...form,
});

const createDraftModalFormFromEntry = (
  entry: PersonalDataV1.DiaryEntry,
): DraftModalForm => ({
  title: entry.title ?? '',
  includeMood: entry.moodLevel !== undefined,
  moodLevel: entry.moodLevel ?? DIARY_LEVEL_FIELD_CONFIGS.moodLevel.defaultValue,
  includeAnxiety: entry.anxietyLevel !== undefined,
  anxietyLevel:
    entry.anxietyLevel ?? DIARY_LEVEL_FIELD_CONFIGS.anxietyLevel.defaultValue,
  includeEnergy: entry.energyLevel !== undefined,
  energyLevel:
    entry.energyLevel ?? DIARY_LEVEL_FIELD_CONFIGS.energyLevel.defaultValue,
  includeHighlight: entry.highlight !== undefined && entry.highlight.trim() !== '',
  highlight: entry.highlight ?? '',
  includeTrouble: entry.trouble !== undefined && entry.trouble.trim() !== '',
  trouble: entry.trouble ?? '',
  includeBodyFeeling:
    entry.bodyFeeling !== undefined && entry.bodyFeeling.trim() !== '',
  bodyFeeling: entry.bodyFeeling ?? '',
  includeContent: entry.content !== undefined && entry.content.trim() !== '',
  content: entry.content ?? '',
});

export const hasDraftModalContent = (form: DraftModalForm): boolean =>
  form.title.trim() !== '' ||
  form.includeMood ||
  form.includeAnxiety ||
  form.includeEnergy ||
  (form.includeHighlight && form.highlight.trim() !== '') ||
  (form.includeTrouble && form.trouble.trim() !== '') ||
  (form.includeBodyFeeling && form.bodyFeeling.trim() !== '') ||
  (form.includeContent && form.content.trim() !== '');

const hasSameDraftModalForm = (
  left: DraftModalForm,
  right: DraftModalForm,
): boolean =>
  left.title === right.title &&
  left.includeMood === right.includeMood &&
  left.moodLevel === right.moodLevel &&
  left.includeAnxiety === right.includeAnxiety &&
  left.anxietyLevel === right.anxietyLevel &&
  left.includeEnergy === right.includeEnergy &&
  left.energyLevel === right.energyLevel &&
  left.includeHighlight === right.includeHighlight &&
  left.highlight === right.highlight &&
  left.includeTrouble === right.includeTrouble &&
  left.trouble === right.trouble &&
  left.includeBodyFeeling === right.includeBodyFeeling &&
  left.bodyFeeling === right.bodyFeeling &&
  left.includeContent === right.includeContent &&
  left.content === right.content;

export const useDraftModal = () => {
  const isDraftModalOpen = ref(false);
  const draftModalMode = ref<DraftModalMode>('create');
  const editingDiaryEntryId = ref<string>();
  const savedSnapshot = ref<DraftModalForm>(createEmptyDraftModalForm());
  const draftModalForm = ref<DraftModalForm>(createEmptyDraftModalForm());
  const draftModalErrorMessage = ref('');
  const isDraftCloseConfirmationOpen = ref(false);

  const isDraftModalDirty = computed(
    () => !hasSameDraftModalForm(draftModalForm.value, savedSnapshot.value),
  );

  const draftModalTitle = computed(() =>
    draftModalMode.value === 'create'
      ? PERSONAL_DATA_HOME_CONTENT.labels.createDraftTitle
      : PERSONAL_DATA_HOME_CONTENT.labels.updateDraftTitle,
  );

  const draftModalEyebrow = computed(() =>
    draftModalMode.value === 'create'
      ? PERSONAL_DATA_HOME_CONTENT.labels.createDraftEyebrow
      : PERSONAL_DATA_HOME_CONTENT.labels.updateDraftEyebrow,
  );

  const draftModalSubmitLabel = computed(() =>
    draftModalMode.value === 'create'
      ? PERSONAL_DATA_HOME_CONTENT.labels.createDraftSubmit
      : PERSONAL_DATA_HOME_CONTENT.labels.updateDraftSubmit,
  );

  const canSubmitDraftModal = computed(() =>
    hasDraftModalContent(draftModalForm.value),
  );

  const resetDraftModalForm = (): void => {
    const nextDraft = createEmptyDraftModalForm();
    draftModalForm.value = cloneDraftModalForm(nextDraft);
    savedSnapshot.value = cloneDraftModalForm(nextDraft);
    draftModalMode.value = 'create';
    editingDiaryEntryId.value = undefined;
    draftModalErrorMessage.value = '';
    isDraftCloseConfirmationOpen.value = false;
  };

  const openDraftModal = (): void => {
    resetDraftModalForm();
    isDraftModalOpen.value = true;
  };

  const openDraftModalForUpdate = (entry: PersonalDataV1.DiaryEntry): void => {
    const nextDraft = createDraftModalFormFromEntry(entry);
    draftModalForm.value = cloneDraftModalForm(nextDraft);
    savedSnapshot.value = cloneDraftModalForm(nextDraft);
    draftModalMode.value = 'update';
    editingDiaryEntryId.value = entry.id;
    draftModalErrorMessage.value = '';
    isDraftCloseConfirmationOpen.value = false;
    isDraftModalOpen.value = true;
  };

  const closeDraftModal = (): void => {
    isDraftModalOpen.value = false;
    isDraftCloseConfirmationOpen.value = false;
  };

  const requestCloseDraftModal = (): void => {
    if (!isDraftModalDirty.value) {
      closeDraftModal();
      return;
    }

    isDraftCloseConfirmationOpen.value = true;
  };

  const closeDraftCloseConfirmation = (): void => {
    isDraftCloseConfirmationOpen.value = false;
  };

  const confirmCloseDraftModal = (): void => {
    closeDraftModal();
  };

  const submitDraftModal = (): void => {
    savedSnapshot.value = cloneDraftModalForm(draftModalForm.value);
    closeDraftModal();
  };

  const setDraftModalErrorMessage = (message: string): void => {
    draftModalErrorMessage.value = message;
  };

  return {
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
    hasDraftModalContent,
    isDraftCloseConfirmationOpen,
    isDraftModalDirty,
    isDraftModalOpen,
    openDraftModal,
    openDraftModalForUpdate,
    requestCloseDraftModal,
    setDraftModalErrorMessage,
    submitDraftModal,
  };
};
