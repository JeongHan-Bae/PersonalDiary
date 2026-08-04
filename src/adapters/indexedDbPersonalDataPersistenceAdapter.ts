import { db } from '@/database/db';
import type { PersonalDataV1 } from '@/models/personalData';
import type { PersonalDataRepository } from '@/ports/personalDataRepository';

export const createIndexedDbPersonalDataPersistenceAdapter =
  (): PersonalDataRepository => ({
    async loadPersonalData(): Promise<PersonalDataV1> {
      const [entries, tags, avatarAssets, users, activeUserRecord] = await Promise.all([
        db.entries.orderBy('date').reverse().toArray(),
        db.tags.orderBy('name').toArray(),
        db.avatarAssets.orderBy('createdAt').reverse().toArray(),
        db.users.orderBy('createdAt').toArray(),
        db.appState.get('activeUserId'),
      ]);

      const data: PersonalDataV1 = {
        entries,
        tags,
        avatarAssets,
        users,
      };

      if (activeUserRecord?.value !== undefined) {
        data.activeUserId = activeUserRecord.value;
      }

      return data;
    },

    async replacePersonalData(data: PersonalDataV1): Promise<void> {
      await db.transaction('rw', db.entries, db.tags, db.avatarAssets, db.users, db.appState, async () => {
        await Promise.all([
          db.entries.clear(),
          db.tags.clear(),
          db.avatarAssets.clear(),
          db.users.clear(),
        ]);
        await Promise.all([
          db.entries.bulkPut(data.entries),
          db.tags.bulkPut(data.tags),
          db.avatarAssets.bulkPut(data.avatarAssets),
          db.users.bulkPut(data.users),
        ]);

        if (data.activeUserId !== undefined) {
          await db.appState.put({
            key: 'activeUserId',
            value: data.activeUserId,
          });
        } else {
          await db.appState.delete('activeUserId');
        }
      });
    },

    async listDiaryEntries(): Promise<PersonalDataV1.DiaryEntry[]> {
      return db.entries.orderBy('date').reverse().toArray();
    },

    async getDiaryEntry(
      id: string,
    ): Promise<PersonalDataV1.DiaryEntry | undefined> {
      return db.entries.get(id);
    },

    async saveDiaryEntry(entry: PersonalDataV1.DiaryEntry): Promise<void> {
      await db.entries.put(entry);
    },

    async listTags(): Promise<PersonalDataV1.Tag[]> {
      return db.tags.orderBy('name').toArray();
    },

    async getTag(id: string): Promise<PersonalDataV1.Tag | undefined> {
      return db.tags.get(id);
    },

    async saveTag(tag: PersonalDataV1.Tag): Promise<void> {
      await db.tags.put(tag);
    },

    async deleteTag(id: string): Promise<void> {
      await db.tags.delete(id);
    },

    async listAvatarAssets(): Promise<PersonalDataV1.AvatarAsset[]> {
      return db.avatarAssets.orderBy('createdAt').reverse().toArray();
    },

    async getAvatarAsset(
      id: string,
    ): Promise<PersonalDataV1.AvatarAsset | undefined> {
      return db.avatarAssets.get(id);
    },

    async saveAvatarAsset(asset: PersonalDataV1.AvatarAsset): Promise<void> {
      await db.avatarAssets.put(asset);
    },

    async deleteAvatarAsset(id: string): Promise<void> {
      await db.avatarAssets.delete(id);
    },

    async listUsers(): Promise<PersonalDataV1.UserProfile[]> {
      return db.users.orderBy('createdAt').toArray();
    },

    async getUser(id: string): Promise<PersonalDataV1.UserProfile | undefined> {
      return db.users.get(id);
    },

    async saveUser(user: PersonalDataV1.UserProfile): Promise<void> {
      await db.users.put(user);
    },

    async deleteUser(id: string): Promise<void> {
      await db.users.delete(id);
    },

    async getActiveUserId(): Promise<string | undefined> {
      const record = await db.appState.get('activeUserId');

      return record?.value;
    },

    async saveActiveUserId(userId: string): Promise<void> {
      await db.appState.put({
        key: 'activeUserId',
        value: userId,
      });
    },
  });
