import {
  APP_LANGUAGE_CONFIGS,
  APP_LANGUAGE_STORAGE_KEY,
  DEFAULT_APP_LANGUAGE_ID,
  type AppLanguageId,
} from '@/constants/metadataConstants';

export const isLanguageId = (value: string): value is AppLanguageId =>
  value in APP_LANGUAGE_CONFIGS;

export const getInitialLanguage = (): AppLanguageId => {
  const storedLanguage = localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);

  return storedLanguage !== null && isLanguageId(storedLanguage)
    ? storedLanguage
    : DEFAULT_APP_LANGUAGE_ID;
};

export const applyLanguage = (language: AppLanguageId): void => {
  document.documentElement.lang = APP_LANGUAGE_CONFIGS[language].htmlLang;
  localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
};
