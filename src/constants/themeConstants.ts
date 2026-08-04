export interface ThemeSelectOption {
  id: string;
  label: string;
}

export interface AppThemeConfig {
  id: string;
  label: string;
  colors: Record<`--color-${string}`, string>;
}

export const APP_THEME_STORAGE_KEY = 'personal-diary-ui-theme';

export const APP_THEME_CONFIGS = {
  warm: {
    id: 'warm',
    label: 'Warm',
    colors: {
      '--color-app': '220 209 194',
      '--color-surface': '247 242 234',
      '--color-panel': '255 255 255',
      '--color-panel-muted': '239 229 216',
      '--color-panel-strong': '32 32 30',
      '--color-profile-surface': '239 229 216',
      '--color-main': '255 255 255',
      '--color-main-text': '22 22 22',
      '--color-main-body-text': '104 91 80',
      '--color-main-muted-text': '124 110 97',
      '--color-title-text': '22 22 22',
      '--color-body-text': '104 91 80',
      '--color-muted-text': '124 110 97',
      '--color-inverse-text': '255 255 255',
      '--color-accent': '185 130 93',
      '--color-level-good': '61 139 92',
      '--color-level-neutral': '198 158 70',
      '--color-level-bad': '190 70 61',
      '--color-danger': '181 54 45',
      '--color-danger-surface': '255 238 236',
      '--color-border-base': '203 189 171',
      '--color-nav-surface': '247 242 234',
      '--color-avatar-border': '185 130 93',
      '--color-nav-avatar-surface': '236 225 211',
      '--color-profile-avatar-surface': '228 214 196',
      '--color-mask-background': '255 255 255',
      '--color-mask-subject': '0 0 0',
    },
  },
  contrast: {
    id: 'contrast',
    label: 'Contrast',
    colors: {
      '--color-app': '20 20 24',
      '--color-surface': '30 30 36',
      '--color-panel': '42 42 50',
      '--color-panel-muted': '54 54 64',
      '--color-panel-strong': '246 246 246',
      '--color-profile-surface': '54 54 64',
      '--color-main': '246 246 246',
      '--color-main-text': '18 18 18',
      '--color-main-body-text': '44 44 52',
      '--color-main-muted-text': '82 82 92',
      '--color-title-text': '246 246 246',
      '--color-body-text': '214 214 222',
      '--color-muted-text': '168 168 178',
      '--color-inverse-text': '18 18 18',
      '--color-accent': '255 143 82',
      '--color-level-good': '74 190 119',
      '--color-level-neutral': '232 194 76',
      '--color-level-bad': '255 108 96',
      '--color-danger': '255 116 102',
      '--color-danger-surface': '72 38 37',
      '--color-border-base': '96 96 108',
      '--color-nav-surface': '30 30 36',
      '--color-avatar-border': '255 143 82',
      '--color-nav-avatar-surface': '34 34 42',
      '--color-profile-avatar-surface': '44 44 54',
      '--color-mask-background': '255 255 255',
      '--color-mask-subject': '0 0 0',
    },
  },
} as const satisfies Record<string, AppThemeConfig>;

export type AppThemeName = keyof typeof APP_THEME_CONFIGS;

export const DEFAULT_APP_THEME_NAME: AppThemeName = 'warm';

export const APP_THEME_OPTIONS: ThemeSelectOption[] = Object.values(
  APP_THEME_CONFIGS,
).map((theme) => ({
  id: theme.id,
  label: theme.label,
}));
