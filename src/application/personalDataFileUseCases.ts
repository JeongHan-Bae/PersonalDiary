import { extractPersonalDataFile } from '@/application/personalDataFileMigrations';
import {
  PERSONAL_DATA_SCHEMA,
  PERSONAL_DATA_VERSION,
  type ImportPersonalDataOptions,
  type ImportPersonalDataResult,
  type PersonalDataFileV1,
  type PersonalDataV1,
} from '@/models/personalData';
import type { PersonalDataRepository } from '@/ports/personalDataRepository';
import type { IdAndClockPort } from '@/ports/idAndClockPort';

export interface PersonalDataFileUseCases {
  buildPersonalDataFile(): Promise<PersonalDataFileV1>;
  importPersonalDataFromUnknown(
    value: unknown,
    options?: ImportPersonalDataOptions,
  ): Promise<ImportPersonalDataResult>;
}

const removeEmptyUsers = (data: PersonalDataV1): PersonalDataV1 => {
  const userIdsWithEntries = new Set(
    data.entries
      .filter((entry) => entry.deleted !== true)
      .map((entry) => entry.userId)
      .filter((userId): userId is string => userId !== undefined),
  );
  const users = data.users.filter(
    (user) =>
      user.avatarAssetId !== undefined ||
      userIdsWithEntries.has(user.id),
  );
  const activeUserId =
    data.activeUserId !== undefined &&
    users.some((user) => user.id === data.activeUserId)
      ? data.activeUserId
      : users[0]?.id;
  const nextData: PersonalDataV1 = {
    ...data,
    users,
  };

  if (activeUserId !== undefined) {
    nextData.activeUserId = activeUserId;
  } else {
    delete nextData.activeUserId;
  }

  return nextData;
};

const isIncomingNewer = (
  current: { updatedAt: string },
  incoming: { updatedAt: string },
): boolean => incoming.updatedAt > current.updatedAt;

const mergeByUpdatedAt = <T extends { id: string; updatedAt: string }>(
  currentItems: T[],
  incomingItems: T[],
): T[] => {
  const itemById = new Map<string, T>();

  currentItems.forEach((item) => {
    itemById.set(item.id, item);
  });

  incomingItems.forEach((incomingItem) => {
    const currentItem = itemById.get(incomingItem.id);

    if (currentItem === undefined || isIncomingNewer(currentItem, incomingItem)) {
      itemById.set(incomingItem.id, incomingItem);
    }
  });

  return Array.from(itemById.values());
};

const isPersonalDataEmpty = (data: PersonalDataV1): boolean =>
  data.entries.length === 0 &&
  data.tags.length === 0 &&
  data.avatarAssets.length === 0 &&
  data.users.length === 0 &&
  data.activeUserId === undefined;

const mergePersonalData = (
  currentData: PersonalDataV1,
  incomingData: PersonalDataV1,
): PersonalDataV1 => {
  if (isPersonalDataEmpty(currentData)) {
    return incomingData;
  }

  const users = mergeByUpdatedAt(currentData.users, incomingData.users);
  const activeUserId =
    currentData.activeUserId !== undefined &&
    users.some((user) => user.id === currentData.activeUserId)
      ? currentData.activeUserId
      : incomingData.activeUserId !== undefined &&
          users.some((user) => user.id === incomingData.activeUserId)
        ? incomingData.activeUserId
        : users[0]?.id;
  const mergedData: PersonalDataV1 = {
    entries: mergeByUpdatedAt(currentData.entries, incomingData.entries),
    tags: mergeByUpdatedAt(currentData.tags, incomingData.tags),
    avatarAssets: mergeByUpdatedAt(
      currentData.avatarAssets,
      incomingData.avatarAssets,
    ),
    users,
  };

  if (activeUserId !== undefined) {
    mergedData.activeUserId = activeUserId;
  }

  return mergedData;
};

export const createPersonalDataFileUseCases = (
  persistence: PersonalDataRepository,
  idAndClock: IdAndClockPort,
): PersonalDataFileUseCases => ({
  async buildPersonalDataFile(): Promise<PersonalDataFileV1> {
    const data = await persistence.loadPersonalData();
    const fileData: PersonalDataFileV1['data'] = {
      entries: data.entries,
      tags: data.tags,
      users: data.users,
    };

    if (data.activeUserId !== undefined) {
      fileData.activeUserId = data.activeUserId;
    }

    return {
      schema: PERSONAL_DATA_SCHEMA,
      version: PERSONAL_DATA_VERSION,
      exportTime: idAndClock.nowIso(),
      data: fileData,
      avatarAssets: data.avatarAssets,
    };
  },

  async importPersonalDataFromUnknown(
    value: unknown,
    options: ImportPersonalDataOptions = {},
  ): Promise<ImportPersonalDataResult> {
    const extractedFile = extractPersonalDataFile(value, idAndClock);
    const extractedData: PersonalDataV1 = {
      ...extractedFile.data,
      avatarAssets: extractedFile.avatarAssets,
    };
    const incomingData =
      options.removeEmptyUsers === true
        ? removeEmptyUsers(extractedData)
        : extractedData;
    const currentData = await persistence.loadPersonalData();
    const mixedData = mergePersonalData(currentData, incomingData);

    await persistence.replacePersonalData(mixedData);

    return {
      importedEntries: incomingData.entries.length,
      importedTags: incomingData.tags.length,
      importedAvatarAssets: incomingData.avatarAssets.length,
      importedUsers: incomingData.users.length,
      schema: extractedFile.schema,
      version: extractedFile.version,
    };
  },
});
