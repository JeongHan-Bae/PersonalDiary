import Dexie, { type Table } from 'dexie';

import {
  type AppStateRecord,
  CURRENT_DATABASE_VERSION,
  DATABASE_NAME,
  databaseVersionStores,
} from '@/database/schema';
import type { PersonalDataV1 } from '@/models/personalData';

export class DiaryDatabase extends Dexie {
  entries!: Table<PersonalDataV1.DiaryEntry, string>;

  tags!: Table<PersonalDataV1.Tag, string>;

  avatarAssets!: Table<PersonalDataV1.AvatarAsset, string>;

  users!: Table<PersonalDataV1.UserProfile, string>;

  appState!: Table<AppStateRecord, string>;

  constructor() {
    super(DATABASE_NAME);

    for (let version = 1; version <= CURRENT_DATABASE_VERSION; version += 1) {
      const stores = databaseVersionStores[version];

      if (stores === undefined) {
        throw new Error(`Missing IndexedDB schema definition for version ${version}.`);
      }

      this.version(version).stores({ ...stores });
    }
  }
}

export const db = new DiaryDatabase();
