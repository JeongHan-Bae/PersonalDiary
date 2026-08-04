export {
  BUILTIN_MOOD_TYPES,
  PERSONAL_DATA_SCHEMA as DIARY_EXPORT_SCHEMA,
  PERSONAL_DATA_VERSION as DIARY_EXPORT_VERSION,
  type CreateDiaryEntryInput,
  type PersonalDataFileV1 as DiaryExportV1,
  type PersonalDataV1,
  type SupportedPersonalDataFile as SupportedDiaryExport,
  type UpdateDiaryEntryInput,
} from '@/models/personalData';

export type {
  CreateTagInput,
  ImportPersonalDataResult,
  PersonalDataFileContentV1,
  PersonalDataFileV1,
  SupportedPersonalDataFile,
  UpdateTagInput,
} from '@/models/personalData';

import type { PersonalDataV1 } from '@/models/personalData';
import type { PersonalDataFileContentV1 } from '@/models/personalData';

export type BuiltinMoodType = PersonalDataV1.BuiltinMoodType;
export type CustomMoodType = PersonalDataV1.CustomMoodType;
export type MoodType = PersonalDataV1.MoodType;
export type DiaryEntry = PersonalDataV1.DiaryEntry;
export type Tag = PersonalDataV1.Tag;
export type DiaryExportV1Data = PersonalDataFileContentV1;
