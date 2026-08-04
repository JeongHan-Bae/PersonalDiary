import type { PersonalDataV1 } from '@/models/personalData';
import {
  DIARY_LEVEL_FIELD_CONFIGS,
  type DiaryLevelFieldId,
} from '@/constants/businessConstants';

export type DiaryEntrySupportedFieldId =
  | 'moodLevel'
  | 'anxietyLevel'
  | 'energyLevel'
  | 'highlight'
  | 'trouble'
  | 'bodyFeeling'
  | 'content';

export interface DiaryEntryRenderValue {
  value: string;
  multiline: boolean;
}

export interface DiaryEntryFieldDefinition {
  id: DiaryEntrySupportedFieldId;
  label: string;
  getRenderValue(entry: PersonalDataV1.DiaryEntry): DiaryEntryRenderValue | undefined;
}

const renderLevel = (
  value: number | undefined,
  fieldId: DiaryLevelFieldId,
): DiaryEntryRenderValue | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return {
    value: `${value}/${DIARY_LEVEL_FIELD_CONFIGS[fieldId].displayMax}`,
    multiline: false,
  };
};

const renderText = (value: string | undefined): DiaryEntryRenderValue | undefined => {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }

  return {
    value,
    multiline: true,
  };
};

export const diaryEntryFieldDefinitions: DiaryEntryFieldDefinition[] = [
  {
    id: 'moodLevel',
    label: 'Mood',
    getRenderValue: (entry) => renderLevel(entry.moodLevel, 'moodLevel'),
  },
  {
    id: 'anxietyLevel',
    label: 'Anxiety',
    getRenderValue: (entry) => renderLevel(entry.anxietyLevel, 'anxietyLevel'),
  },
  {
    id: 'energyLevel',
    label: 'Energy',
    getRenderValue: (entry) => renderLevel(entry.energyLevel, 'energyLevel'),
  },
  {
    id: 'highlight',
    label: 'Highlight',
    getRenderValue: (entry) => renderText(entry.highlight),
  },
  {
    id: 'trouble',
    label: 'Trouble',
    getRenderValue: (entry) => renderText(entry.trouble),
  },
  {
    id: 'bodyFeeling',
    label: 'Body Feeling',
    getRenderValue: (entry) => renderText(entry.bodyFeeling),
  },
  {
    id: 'content',
    label: 'Body',
    getRenderValue: (entry) => renderText(entry.content),
  },
];
