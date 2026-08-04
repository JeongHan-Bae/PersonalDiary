import type {
  AvatarRenderAsset,
} from '@/models/avatar';
import type {
  CreateDiaryEntryInput,
  CreateTagInput,
  CreateUserProfileInput,
  PersonalDataV1,
  UpdateDiaryEntryInput,
  UpdateTagInput,
  UpdateUserProfileInput,
} from '@/models/personalData';
import type { PersonalDataRepository } from '@/ports/personalDataRepository';
import type { IdAndClockPort } from '@/ports/idAndClockPort';
import { LOCAL_USER_NAME } from '@/constants/businessConstants';

export interface PersonalDataCrudUseCases {
  createEmptyPersonalData(): PersonalDataV1;
  loadPersonalData(): Promise<PersonalDataV1>;
  replacePersonalData(data: PersonalDataV1): Promise<void>;

  listDiaryEntries(): Promise<PersonalDataV1.DiaryEntry[]>;
  getDiaryEntry(id: string): Promise<PersonalDataV1.DiaryEntry | undefined>;
  createDiaryEntry(
    input: CreateDiaryEntryInput,
  ): Promise<PersonalDataV1.DiaryEntry>;
  updateDiaryEntry(
    id: string,
    input: UpdateDiaryEntryInput,
  ): Promise<PersonalDataV1.DiaryEntry>;
  deleteDiaryEntry(id: string): Promise<void>;

  listTags(): Promise<PersonalDataV1.Tag[]>;
  getTag(id: string): Promise<PersonalDataV1.Tag | undefined>;
  createTag(input: CreateTagInput): Promise<PersonalDataV1.Tag>;
  updateTag(id: string, input: UpdateTagInput): Promise<PersonalDataV1.Tag>;
  deleteTag(id: string): Promise<void>;

  listAvatarAssets(): Promise<PersonalDataV1.AvatarAsset[]>;
  getAvatarAsset(id: string): Promise<PersonalDataV1.AvatarAsset | undefined>;
  saveAvatarAsset(asset: AvatarRenderAsset): Promise<PersonalDataV1.AvatarAsset>;
  deleteAvatarAsset(id: string): Promise<void>;
  createAvatarAsset(
    input: Omit<AvatarRenderAsset, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PersonalDataV1.AvatarAsset>;

  listUsers(): Promise<PersonalDataV1.UserProfile[]>;
  getUser(id: string): Promise<PersonalDataV1.UserProfile | undefined>;
  getActiveUser(): Promise<PersonalDataV1.UserProfile | undefined>;
  createUserProfile(
    input?: CreateUserProfileInput,
  ): Promise<PersonalDataV1.UserProfile>;
  updateUserProfile(
    id: string,
    input: UpdateUserProfileInput,
  ): Promise<PersonalDataV1.UserProfile>;
  switchActiveUser(userId: string): Promise<PersonalDataV1.UserProfile>;
  deleteUserProfile(userId: string): Promise<void>;
  mergeUserProfiles(
    sourceUserIds: string[],
    targetUserId: string,
  ): Promise<PersonalDataV1.UserProfile>;
  clearAllPersonalData(confirmations: {
    firstConfirmation: boolean;
    secondConfirmation: boolean;
  }): Promise<void>;
}

const getLatestReferencedAvatarAsset = (
  users: PersonalDataV1.UserProfile[],
  avatarAssets: PersonalDataV1.AvatarAsset[],
): PersonalDataV1.AvatarAsset | undefined => {
  const referencedAvatarAssetIds = new Set(
    users
      .map((user) => user.avatarAssetId)
      .filter((avatarAssetId): avatarAssetId is string => avatarAssetId !== undefined),
  );
  const referencedAvatarAssets = avatarAssets.filter((avatarAsset) =>
    referencedAvatarAssetIds.has(avatarAsset.id),
  );

  return referencedAvatarAssets.reduce<PersonalDataV1.AvatarAsset | undefined>(
    (latestAvatarAsset, avatarAsset) =>
      latestAvatarAsset === undefined ||
      avatarAsset.updatedAt > latestAvatarAsset.updatedAt
        ? avatarAsset
        : latestAvatarAsset,
    undefined,
  );
};

export const createPersonalDataCrudUseCases = (
  persistence: PersonalDataRepository,
  idAndClock: IdAndClockPort,
): PersonalDataCrudUseCases => ({
  createEmptyPersonalData(): PersonalDataV1 {
    return {
      entries: [],
      tags: [],
      avatarAssets: [],
      users: [],
    };
  },

  loadPersonalData(): Promise<PersonalDataV1> {
    return persistence.loadPersonalData();
  },

  replacePersonalData(data: PersonalDataV1): Promise<void> {
    return persistence.replacePersonalData(data);
  },

  listDiaryEntries(): Promise<PersonalDataV1.DiaryEntry[]> {
    return persistence
      .listDiaryEntries()
      .then((entries) => entries.filter((entry) => entry.deleted !== true));
  },

  getDiaryEntry(
    id: string,
  ): Promise<PersonalDataV1.DiaryEntry | undefined> {
    return persistence.getDiaryEntry(id);
  },

  async createDiaryEntry(
    input: CreateDiaryEntryInput,
  ): Promise<PersonalDataV1.DiaryEntry> {
    const timestamp = idAndClock.nowIso();
    const submittedAt = input.submittedAt ?? timestamp;
    const activeUserId = await persistence.getActiveUserId();
    const ownerUserId = input.userId ?? activeUserId;
    const entry: PersonalDataV1.DiaryEntry = {
      id: idAndClock.createBase64Uuid(),
      createdAt: timestamp,
      updatedAt: timestamp,
      date: input.date ?? submittedAt.slice(0, 10),
      submittedAt,
      submittedTimeZone: input.submittedTimeZone ?? idAndClock.getLocalTimeZone(),
      tags: input.tags ?? [],
    };

    if (ownerUserId !== undefined) {
      entry.userId = ownerUserId;
    }

    if (input.title !== undefined) {
      entry.title = input.title;
    }

    if (input.mood !== undefined) {
      entry.mood = input.mood;
    }

    if (input.moodLevel !== undefined) {
      entry.moodLevel = input.moodLevel;
    }

    if (input.anxietyLevel !== undefined) {
      entry.anxietyLevel = input.anxietyLevel;
    }

    if (input.energyLevel !== undefined) {
      entry.energyLevel = input.energyLevel;
    }

    if (input.highlight !== undefined) {
      entry.highlight = input.highlight;
    }

    if (input.trouble !== undefined) {
      entry.trouble = input.trouble;
    }

    if (input.bodyFeeling !== undefined) {
      entry.bodyFeeling = input.bodyFeeling;
    }

    if (input.content !== undefined) {
      entry.content = input.content;
    }

    if (input.deleted !== undefined) {
      entry.deleted = input.deleted;
    }

    if (input.metadata !== undefined) {
      entry.metadata = input.metadata;
    }

    await persistence.saveDiaryEntry(entry);

    return entry;
  },

  async updateDiaryEntry(
    id: string,
    input: UpdateDiaryEntryInput,
  ): Promise<PersonalDataV1.DiaryEntry> {
    const existing = await persistence.getDiaryEntry(id);

    if (existing === undefined) {
      throw new Error(`Diary entry not found: ${id}`);
    }

    const updated: PersonalDataV1.DiaryEntry = {
      ...existing,
      updatedAt: idAndClock.nowIso(),
    };

    if (input.date !== undefined) {
      updated.date = input.date;
    }

    if (input.tags !== undefined) {
      updated.tags = input.tags;
    }

    const hasInputKey = (key: keyof UpdateDiaryEntryInput): boolean =>
      Object.prototype.hasOwnProperty.call(input, key);

    if (hasInputKey('userId')) {
      if (input.userId === undefined) {
        delete updated.userId;
      } else {
        updated.userId = input.userId;
      }
    }

    if (hasInputKey('submittedAt')) {
      if (input.submittedAt === undefined) {
        delete updated.submittedAt;
      } else {
        updated.submittedAt = input.submittedAt;
      }
    }

    if (hasInputKey('submittedTimeZone')) {
      if (input.submittedTimeZone === undefined) {
        delete updated.submittedTimeZone;
      } else {
        updated.submittedTimeZone = input.submittedTimeZone;
      }
    }

    if (hasInputKey('title')) {
      if (input.title === undefined) {
        delete updated.title;
      } else {
        updated.title = input.title;
      }
    }

    if (hasInputKey('content')) {
      if (input.content === undefined) {
        delete updated.content;
      } else {
        updated.content = input.content;
      }
    }

    if (hasInputKey('mood')) {
      if (input.mood === undefined) {
        delete updated.mood;
      } else {
        updated.mood = input.mood;
      }
    }

    if (hasInputKey('moodLevel')) {
      if (input.moodLevel === undefined) {
        delete updated.moodLevel;
      } else {
        updated.moodLevel = input.moodLevel;
      }
    }

    if (hasInputKey('anxietyLevel')) {
      if (input.anxietyLevel === undefined) {
        delete updated.anxietyLevel;
      } else {
        updated.anxietyLevel = input.anxietyLevel;
      }
    }

    if (hasInputKey('energyLevel')) {
      if (input.energyLevel === undefined) {
        delete updated.energyLevel;
      } else {
        updated.energyLevel = input.energyLevel;
      }
    }

    if (hasInputKey('highlight')) {
      if (input.highlight === undefined) {
        delete updated.highlight;
      } else {
        updated.highlight = input.highlight;
      }
    }

    if (hasInputKey('trouble')) {
      if (input.trouble === undefined) {
        delete updated.trouble;
      } else {
        updated.trouble = input.trouble;
      }
    }

    if (hasInputKey('bodyFeeling')) {
      if (input.bodyFeeling === undefined) {
        delete updated.bodyFeeling;
      } else {
        updated.bodyFeeling = input.bodyFeeling;
      }
    }

    if (hasInputKey('deleted')) {
      if (input.deleted === undefined) {
        delete updated.deleted;
      } else {
        updated.deleted = input.deleted;
      }
    }

    if (hasInputKey('metadata')) {
      if (input.metadata === undefined) {
        delete updated.metadata;
      } else {
        updated.metadata = input.metadata;
      }
    }

    await persistence.saveDiaryEntry(updated);

    return updated;
  },

  async deleteDiaryEntry(id: string): Promise<void> {
    const existing = await persistence.getDiaryEntry(id);

    if (existing === undefined) {
      throw new Error(`Diary entry not found: ${id}`);
    }

    await persistence.saveDiaryEntry({
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: idAndClock.nowIso(),
      date: existing.date,
      tags: [],
      deleted: true,
    });
  },

  listTags(): Promise<PersonalDataV1.Tag[]> {
    return persistence.listTags();
  },

  getTag(id: string): Promise<PersonalDataV1.Tag | undefined> {
    return persistence.getTag(id);
  },

  async createTag(input: CreateTagInput): Promise<PersonalDataV1.Tag> {
    const timestamp = idAndClock.nowIso();
    const tag: PersonalDataV1.Tag = {
      id: idAndClock.createId(),
      name: input.name,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (input.metadata !== undefined) {
      tag.metadata = input.metadata;
    }

    await persistence.saveTag(tag);

    return tag;
  },

  async updateTag(
    id: string,
    input: UpdateTagInput,
  ): Promise<PersonalDataV1.Tag> {
    const existing = await persistence.getTag(id);

    if (existing === undefined) {
      throw new Error(`Tag not found: ${id}`);
    }

    const updated: PersonalDataV1.Tag = {
      ...existing,
      ...input,
      updatedAt: idAndClock.nowIso(),
    };

    await persistence.saveTag(updated);

    return updated;
  },

  deleteTag(id: string): Promise<void> {
    return persistence.deleteTag(id);
  },

  listAvatarAssets(): Promise<PersonalDataV1.AvatarAsset[]> {
    return persistence.listAvatarAssets();
  },

  getAvatarAsset(id: string): Promise<PersonalDataV1.AvatarAsset | undefined> {
    return persistence.getAvatarAsset(id);
  },

  async saveAvatarAsset(
    asset: AvatarRenderAsset,
  ): Promise<PersonalDataV1.AvatarAsset> {
    const timestamp = idAndClock.nowIso();
    const normalizedAsset: PersonalDataV1.AvatarAsset = {
      ...asset,
      updatedAt: timestamp,
    };

    await persistence.saveAvatarAsset(normalizedAsset);

    return normalizedAsset;
  },

  deleteAvatarAsset(id: string): Promise<void> {
    return persistence.deleteAvatarAsset(id);
  },

  async createAvatarAsset(
    input: Omit<AvatarRenderAsset, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PersonalDataV1.AvatarAsset> {
    const timestamp = idAndClock.nowIso();
    const asset: PersonalDataV1.AvatarAsset = {
      ...input,
      id: idAndClock.createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await persistence.saveAvatarAsset(asset);

    return asset;
  },

  listUsers(): Promise<PersonalDataV1.UserProfile[]> {
    return persistence.listUsers();
  },

  getUser(id: string): Promise<PersonalDataV1.UserProfile | undefined> {
    return persistence.getUser(id);
  },

  async getActiveUser(): Promise<PersonalDataV1.UserProfile | undefined> {
    const [users, activeUserId] = await Promise.all([
      persistence.listUsers(),
      persistence.getActiveUserId(),
    ]);
    const activeUser = users.find((user) => user.id === activeUserId) ?? users[0];

    if (activeUser !== undefined) {
      return activeUser;
    }

    return undefined;
  },

  async createUserProfile(
    input: CreateUserProfileInput = {},
  ): Promise<PersonalDataV1.UserProfile> {
    const timestamp = idAndClock.nowIso();
    const user: PersonalDataV1.UserProfile = {
      id: idAndClock.createBase64Uuid(),
      createdAt: timestamp,
      updatedAt: timestamp,
      displayName: input.displayName ?? LOCAL_USER_NAME.defaultDisplayName,
    };

    if (input.avatarAssetId !== undefined) {
      user.avatarAssetId = input.avatarAssetId;
    }

    if (input.metadata !== undefined) {
      user.metadata = input.metadata;
    }

    await persistence.saveUser(user);
    await persistence.saveActiveUserId(user.id);

    return user;
  },

  async updateUserProfile(
    id: string,
    input: UpdateUserProfileInput,
  ): Promise<PersonalDataV1.UserProfile> {
    const existing = await persistence.getUser(id);

    if (existing === undefined) {
      throw new Error(`User profile not found: ${id}`);
    }

    const { avatarAssetId, ...profileInput } = input;
    const updated: PersonalDataV1.UserProfile = {
      ...existing,
      ...profileInput,
      updatedAt: idAndClock.nowIso(),
    };

    if (avatarAssetId === null) {
      delete updated.avatarAssetId;
    } else if (avatarAssetId !== undefined) {
      updated.avatarAssetId = avatarAssetId;
    }

    await persistence.saveUser(updated);

    return updated;
  },

  async switchActiveUser(userId: string): Promise<PersonalDataV1.UserProfile> {
    const user = await persistence.getUser(userId);

    if (user === undefined) {
      throw new Error(`User profile not found: ${userId}`);
    }

    await persistence.saveActiveUserId(userId);

    return user;
  },

  async deleteUserProfile(userId: string): Promise<void> {
    const data = await persistence.loadPersonalData();
    const remainingUsers = data.users.filter((user) => user.id !== userId);
    const activeUserId =
      data.activeUserId === userId ? remainingUsers[0]?.id : data.activeUserId;
    const nextData: PersonalDataV1 = {
      ...data,
      users: remainingUsers,
      entries: data.entries.filter((entry) => entry.userId !== userId),
    };

    if (activeUserId !== undefined) {
      nextData.activeUserId = activeUserId;
    } else {
      delete nextData.activeUserId;
    }

    await persistence.replacePersonalData(nextData);
  },

  async mergeUserProfiles(
    sourceUserIds: string[],
    targetUserId: string,
  ): Promise<PersonalDataV1.UserProfile> {
    const sourceSet = new Set(sourceUserIds.filter((id) => id !== targetUserId));
    const data = await persistence.loadPersonalData();
    const targetUser = data.users.find((user) => user.id === targetUserId);

    if (targetUser === undefined) {
      throw new Error(`Target user profile not found: ${targetUserId}`);
    }

    const mergeParticipantUsers = data.users.filter(
      (user) => user.id === targetUserId || sourceSet.has(user.id),
    );
    const latestAvatarAsset = getLatestReferencedAvatarAsset(
      mergeParticipantUsers,
      data.avatarAssets,
    );
    const mergedTargetUser =
      latestAvatarAsset !== undefined &&
      targetUser.avatarAssetId !== latestAvatarAsset.id
        ? {
            ...targetUser,
            avatarAssetId: latestAvatarAsset.id,
            updatedAt: idAndClock.nowIso(),
          }
        : targetUser;
    const mergedEntries = data.entries
      .map((entry) =>
        entry.userId !== undefined && sourceSet.has(entry.userId)
          ? {
              ...entry,
              userId: targetUserId,
              updatedAt: idAndClock.nowIso(),
            }
          : entry,
      )
      .sort((left, right) => left.date.localeCompare(right.date));
    const remainingUsers = data.users
      .filter((user) => !sourceSet.has(user.id))
      .map((user) => (user.id === targetUserId ? mergedTargetUser : user));

    await persistence.replacePersonalData({
      ...data,
      entries: mergedEntries,
      users: remainingUsers,
      activeUserId: targetUserId,
    });

    return mergedTargetUser;
  },

  async clearAllPersonalData(confirmations: {
    firstConfirmation: boolean;
    secondConfirmation: boolean;
  }): Promise<void> {
    if (!confirmations.firstConfirmation || !confirmations.secondConfirmation) {
      throw new Error('Clearing all personal data requires two confirmations.');
    }

    await persistence.replacePersonalData({
      entries: [],
      tags: [],
      avatarAssets: [],
      users: [],
    });
  },
});
