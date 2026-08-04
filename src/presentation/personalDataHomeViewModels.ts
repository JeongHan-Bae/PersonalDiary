import type { PersonalDataV1 } from '@/models/personalData';
import { diaryEntryFieldDefinitions } from '@/presentation/diaryEntryFieldDefinitions';
import {
  DIARY_FALLBACK_PROMPT_ID,
  DIARY_LEVEL_FIELD_CONFIGS,
  DIARY_PROMPT_CANDIDATES_BY_HALF_HOUR_SEGMENT,
  DIARY_PROMPT_MESSAGES,
  type DiaryLevelFieldId,
  type DiaryLevelTone,
  type DiaryPromptMessage,
} from '@/constants/businessConstants';
import { APP_DATE_TIME_FORMATS, PERCENT_FULL } from '@/constants/visualConstants';

export interface DiaryEntryFieldViewModel {
  id: string;
  label: string;
  value: string;
  multiline: boolean;
}

export interface DiaryEntryLevelFieldViewModel {
  id: string;
  label: string;
  valueLabel: string;
  percent: number;
  tone: DiaryLevelTone;
}

export interface DiaryEntryCardViewModel {
  id: string;
  title: string;
  submittedAtLabel: string;
  updatedAtLabel: string;
  levelFields: DiaryEntryLevelFieldViewModel[];
  fields: DiaryEntryFieldViewModel[];
}

const getHalfHourSegment = (date: Date): number =>
  date.getHours() * 2 + (date.getMinutes() >= 30 ? 1 : 0);

export const getDiaryPromptForDate = (date: Date): DiaryPromptMessage => {
  const promptCandidates =
    DIARY_PROMPT_CANDIDATES_BY_HALF_HOUR_SEGMENT[getHalfHourSegment(date)] ?? [
      DIARY_FALLBACK_PROMPT_ID,
    ];
  const promptId = promptCandidates[0] ?? DIARY_FALLBACK_PROMPT_ID;

  return DIARY_PROMPT_MESSAGES[promptId] ?? DIARY_PROMPT_MESSAGES[DIARY_FALLBACK_PROMPT_ID];
};

export const getEntryCount = (
  entries: PersonalDataV1.DiaryEntry[],
): number => entries.length;

export const hasPersonalDataEntries = (
  entries: PersonalDataV1.DiaryEntry[],
): boolean => getEntryCount(entries) > 0;

const formatSubmittedAt = (value: string): string =>
  `${new Intl.DateTimeFormat(APP_DATE_TIME_FORMATS.locale, {
    month: APP_DATE_TIME_FORMATS.entryTimestamp.month,
  }).format(new Date(value))} ${new Intl.DateTimeFormat(
    APP_DATE_TIME_FORMATS.locale,
    {
      day: APP_DATE_TIME_FORMATS.entryTimestamp.day,
    },
  ).format(new Date(value))} ${new Intl.DateTimeFormat(
    APP_DATE_TIME_FORMATS.locale,
    {
      year: APP_DATE_TIME_FORMATS.entryTimestamp.year,
    },
  ).format(new Date(value))}, ${new Intl.DateTimeFormat(
    APP_DATE_TIME_FORMATS.locale,
    {
      hour: APP_DATE_TIME_FORMATS.entryTimestamp.hour,
      minute: APP_DATE_TIME_FORMATS.entryTimestamp.minute,
    },
  ).format(new Date(value))}`;

const clampLevelPercent = (id: DiaryLevelFieldId, value: number): number => {
  const config = DIARY_LEVEL_FIELD_CONFIGS[id];

  return ((Math.min(config.displayMax, Math.max(config.displayMin, value)) -
    config.displayMin) /
    (config.displayMax - config.displayMin)) *
  PERCENT_FULL;
};

const getLevelTone = (
  id: DiaryLevelFieldId,
  value: number,
): DiaryLevelTone =>
  (Object.entries(DIARY_LEVEL_FIELD_CONFIGS[id].toneRanges) as Array<
    [DiaryLevelTone, { min: number; max: number }]
  >).find(([, range]) => value >= range.min && value <= range.max)?.[0] ??
  'neutral';

const createLevelFieldViewModel = (
  id: DiaryLevelFieldId,
  label: string,
  value: number,
): DiaryEntryLevelFieldViewModel => ({
  id,
  label,
  valueLabel: `${value}/${DIARY_LEVEL_FIELD_CONFIGS[id].displayMax}`,
  percent: clampLevelPercent(id, value),
  tone: getLevelTone(id, value),
});

const getEntryLevelValue = (
  entry: PersonalDataV1.DiaryEntry,
  id: DiaryLevelFieldId,
): number | undefined => {
  if (id === 'moodLevel') {
    return entry.moodLevel;
  }

  if (id === 'anxietyLevel') {
    return entry.anxietyLevel;
  }

  if (id === 'energyLevel') {
    return entry.energyLevel;
  }

  return undefined;
};

export const createDiaryEntryCardViewModels = (
  entries: PersonalDataV1.DiaryEntry[],
): DiaryEntryCardViewModel[] =>
  entries.map((entry) => {
    const submittedAt = entry.submittedAt ?? entry.createdAt;
    const fields: DiaryEntryFieldViewModel[] = [];
    const levelFields: DiaryEntryLevelFieldViewModel[] = [];

    diaryEntryFieldDefinitions.forEach((definition) => {
        const renderValue = definition.getRenderValue(entry);

        if (renderValue === undefined) {
          return;
        }

        const field = {
          id: definition.id,
          label: definition.label,
          value: renderValue.value,
          multiline: renderValue.multiline,
        };

        if (
          definition.id === 'moodLevel' ||
          definition.id === 'anxietyLevel' ||
          definition.id === 'energyLevel'
        ) {
          const levelValue = getEntryLevelValue(entry, definition.id);

          if (levelValue !== undefined) {
            levelFields.push(
              createLevelFieldViewModel(
                definition.id,
                definition.label,
                levelValue,
              ),
            );
          }
          return;
        }

        fields.push(field);
      });

    return {
      id: entry.id,
      title: entry.title?.trim() || 'Untitled Diary',
      submittedAtLabel: formatSubmittedAt(submittedAt),
      updatedAtLabel: formatSubmittedAt(entry.updatedAt),
      levelFields,
      fields,
    };
  });
