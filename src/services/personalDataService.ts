import { createPersonalDataUseCases } from '@/application/personalDataUseCases';
import type {
  ImportPersonalDataOptions,
  ImportPersonalDataResult,
} from '@/models/personalData';
import {
  idAndClockPort,
  jsonFilePort,
  personalDataRepository,
} from '@/services/serviceDependencies';

const personalDataUseCases = createPersonalDataUseCases(
  personalDataRepository,
  idAndClockPort,
);

export const {
  buildPersonalDataFile,
  createAvatarAsset,
  createEmptyPersonalData,
  createDiaryEntry,
  createTag,
  createUserProfile,
  clearAllPersonalData,
  deleteDiaryEntry,
  deleteTag,
  deleteAvatarAsset,
  deleteUserProfile,
  getAvatarAsset,
  getActiveUser,
  getDiaryEntry,
  getTag,
  getUser,
  importPersonalDataFromUnknown,
  listAvatarAssets,
  listDiaryEntries,
  listTags,
  listUsers,
  loadPersonalData,
  replacePersonalData,
  saveAvatarAsset,
  switchActiveUser,
  mergeUserProfiles,
  updateDiaryEntry,
  updateTag,
  updateUserProfile,
} = personalDataUseCases;

export const readJsonFile = (file: File): Promise<unknown> =>
  jsonFilePort.readJsonFile(file);

export const importPersonalDataFromFile = async (
  file: File,
  options: ImportPersonalDataOptions = {},
): Promise<ImportPersonalDataResult> => {
  const parsed = await readJsonFile(file);

  return importPersonalDataFromUnknown(parsed, options);
};

export const downloadJsonFile = (fileName: string, payload: unknown): void => {
  jsonFilePort.downloadJsonFile(fileName, payload);
};

export const exportPersonalDataToJsonFile = async (): Promise<void> => {
  const payload = await buildPersonalDataFile();
  const dateStamp = idAndClockPort.nowIso().slice(0, 10);

  downloadJsonFile(`personal-data-export-${dateStamp}.json`, payload);
};
