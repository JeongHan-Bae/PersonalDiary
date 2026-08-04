import type { ImportPersonalDataOptions } from '@/models/personalData';
import {
  importPersonalDataFromFile,
  importPersonalDataFromUnknown,
  readJsonFile as readPersonalDataJsonFile,
} from '@/services/personalDataService';

export interface ImportDiaryResult {
  importedEntries: number;
  importedAvatarAssets: number;
  importedUsers: number;
  schema: string;
  version: number;
}

export const readJsonFile = async (file: File): Promise<unknown> => {
  return readPersonalDataJsonFile(file);
};

export const importDiaryDataFromUnknown = async (
  value: unknown,
  options: ImportPersonalDataOptions = {},
): Promise<ImportDiaryResult> => {
  const result = await importPersonalDataFromUnknown(value, options);

  return {
    importedEntries: result.importedEntries,
    importedAvatarAssets: result.importedAvatarAssets,
    importedUsers: result.importedUsers,
    schema: result.schema,
    version: result.version,
  };
};

export const importDiaryDataFromFile = async (
  file: File,
  options: ImportPersonalDataOptions = {},
): Promise<ImportDiaryResult> => {
  const result = await importPersonalDataFromFile(file, options);

  return {
    importedEntries: result.importedEntries,
    importedAvatarAssets: result.importedAvatarAssets,
    importedUsers: result.importedUsers,
    schema: result.schema,
    version: result.version,
  };
};
