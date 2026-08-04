import type { AvatarRenderAsset } from '@/models/avatar';
import { BUILTIN_MOOD_TYPES } from '@/constants/businessConstants';
import type {
  PERSONAL_DATA_SCHEMA,
  PERSONAL_DATA_VERSION,
} from '@/constants/businessConstants';
export {
  BUILTIN_MOOD_TYPES,
  PERSONAL_DATA_SCHEMA,
  PERSONAL_DATA_VERSION,
} from '@/constants/businessConstants';

export interface PersonalDataV1 {
  entries: PersonalDataV1.DiaryEntry[];
  tags: PersonalDataV1.Tag[];
  avatarAssets: PersonalDataV1.AvatarAsset[];
  users: PersonalDataV1.UserProfile[];
  activeUserId?: string;
}

export interface PersonalDataFileContentV1 {
  entries: PersonalDataV1.DiaryEntry[];
  tags: PersonalDataV1.Tag[];
  users: PersonalDataV1.UserProfile[];
  activeUserId?: string;
}

export namespace PersonalDataV1 {
  export type BuiltinMoodType = (typeof BUILTIN_MOOD_TYPES)[number];

  export type CustomMoodType = `custom:${string}`;

  export type MoodType = BuiltinMoodType | CustomMoodType;

  export interface DiaryEntry {
    id: string;
    userId?: string;
    createdAt: string;
    updatedAt: string;
    date: string;
    submittedAt?: string;
    submittedTimeZone?: string;
    title?: string;
    content?: string;
    mood?: MoodType;
    moodLevel?: number;
    anxietyLevel?: number;
    energyLevel?: number;
    highlight?: string;
    trouble?: string;
    bodyFeeling?: string;
    tags: string[];
    deleted?: boolean;
    metadata?: Record<string, unknown>;
  }

  export interface Tag {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, unknown>;
  }

  export type AvatarAsset = AvatarRenderAsset;

  export interface UserProfile {
    id: string;
    createdAt: string;
    updatedAt: string;
    displayName: string;
    avatarAssetId?: string;
    metadata?: Record<string, unknown>;
  }
}

export interface PersonalDataFileV1 {
  schema: typeof PERSONAL_DATA_SCHEMA;
  version: typeof PERSONAL_DATA_VERSION;
  exportTime: string;
  data: PersonalDataFileContentV1;
  avatarAssets: PersonalDataV1.AvatarAsset[];
}

export type SupportedPersonalDataFile = PersonalDataFileV1;

export interface CreateDiaryEntryInput {
  userId?: string;
  date?: string;
  submittedAt?: string;
  submittedTimeZone?: string;
  title?: string;
  content?: string;
  mood?: PersonalDataV1.MoodType;
  moodLevel?: number;
  anxietyLevel?: number;
  energyLevel?: number;
  highlight?: string;
  trouble?: string;
  bodyFeeling?: string;
  tags?: string[];
  deleted?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateDiaryEntryInput {
  userId?: string | undefined;
  date?: string | undefined;
  submittedAt?: string | undefined;
  submittedTimeZone?: string | undefined;
  title?: string | undefined;
  content?: string | undefined;
  mood?: PersonalDataV1.MoodType | undefined;
  moodLevel?: number | undefined;
  anxietyLevel?: number | undefined;
  energyLevel?: number | undefined;
  highlight?: string | undefined;
  trouble?: string | undefined;
  bodyFeeling?: string | undefined;
  tags?: string[] | undefined;
  deleted?: boolean | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface CreateTagInput {
  name: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateTagInput {
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateUserProfileInput {
  displayName?: string;
  avatarAssetId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  avatarAssetId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ImportPersonalDataResult {
  importedEntries: number;
  importedTags: number;
  importedAvatarAssets: number;
  importedUsers: number;
  schema: typeof PERSONAL_DATA_SCHEMA;
  version: typeof PERSONAL_DATA_VERSION;
}

export interface ImportPersonalDataOptions {
  removeEmptyUsers?: boolean;
}
