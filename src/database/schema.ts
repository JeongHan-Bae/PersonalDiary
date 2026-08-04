import type { PersonalDataV1 } from '@/models/personalData';
export {
  CURRENT_DATABASE_VERSION,
  DATABASE_NAME,
  DATABASE_VERSION_STORES as databaseVersionStores,
} from '@/constants/storageConstants';
export {
  DIARY_EXPORT_SCHEMA,
  DIARY_EXPORT_VERSION as CURRENT_EXPORT_VERSION,
} from '@/constants/businessConstants';

export interface DatabaseTables {
  entries: PersonalDataV1.DiaryEntry;
  tags: PersonalDataV1.Tag;
  avatarAssets: PersonalDataV1.AvatarAsset;
  users: PersonalDataV1.UserProfile;
  appState: AppStateRecord;
}

export interface AppStateRecord {
  key: string;
  value: string;
}
