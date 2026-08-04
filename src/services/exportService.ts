import type { PersonalDataFileV1 } from '@/models/personalData';
import {
  buildPersonalDataFile,
  downloadJsonFile,
  exportPersonalDataToJsonFile,
} from '@/services/personalDataService';

export const buildDiaryExport = async (): Promise<PersonalDataFileV1> =>
  buildPersonalDataFile();

export const exportDiaryData = async (): Promise<void> => {
  await exportPersonalDataToJsonFile();
};

export { downloadJsonFile };
