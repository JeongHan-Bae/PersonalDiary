export const APP_VERSION = [0, 0, 1] as const;

const createVersionLabel = (version: readonly number[]): string =>
  `V${version.join('.')}`;

const createDataVersionLabel = (version: number): string => `V${version}`;

export const PERSONAL_DATA_SCHEMA = 'diary-app';

export const PERSONAL_DATA_VERSION = 1;

export const APP_VERSION_LABEL = createVersionLabel(APP_VERSION);

export const PERSONAL_DATA_VERSION_LABEL = createDataVersionLabel(
  PERSONAL_DATA_VERSION,
);

export const DIARY_EXPORT_SCHEMA = PERSONAL_DATA_SCHEMA;

export const DIARY_EXPORT_VERSION = PERSONAL_DATA_VERSION;

export interface AppLanguageConfig {
  id: string;
  label: string;
  htmlLang: string;
  intlLocale: string;
}

export const APP_LANGUAGE_STORAGE_KEY = 'personal-diary-ui-language';

export const APP_LANGUAGE_CONFIGS = {
  english: {
    id: 'english',
    label: 'English',
    htmlLang: 'en',
    intlLocale: 'en-US',
  },
} as const satisfies Record<string, AppLanguageConfig>;

export type AppLanguageId = keyof typeof APP_LANGUAGE_CONFIGS;

export const DEFAULT_APP_LANGUAGE_ID: AppLanguageId = 'english';

export const APP_LANGUAGE_OPTIONS = Object.values(APP_LANGUAGE_CONFIGS).map(
  (language) => ({
    id: language.id,
    label: language.label,
  }),
);
