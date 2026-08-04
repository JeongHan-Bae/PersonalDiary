import type { JsonFilePort } from '@/ports/jsonFilePort';

const readJsonFile = async (file: File): Promise<unknown> => {
  const rawText = await file.text();

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    throw new Error('Invalid JSON file.');
  }
};

const downloadJsonFile = (fileName: string, payload: unknown): void => {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], {
    type: 'application/json;charset=utf-8',
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
};

export const createBrowserJsonFileAdapter = (): JsonFilePort => ({
  readJsonFile,
  downloadJsonFile,
});
