import {
  APP_THEME_CONFIGS,
  APP_THEME_STORAGE_KEY,
  DEFAULT_APP_THEME_NAME,
  type AppThemeName,
} from '@/constants/themeConstants';

export const isThemeName = (value: string): value is AppThemeName =>
  value in APP_THEME_CONFIGS;

export const getInitialTheme = (): AppThemeName => {
  const storedTheme = localStorage.getItem(APP_THEME_STORAGE_KEY);

  return storedTheme !== null && isThemeName(storedTheme)
    ? storedTheme
    : DEFAULT_APP_THEME_NAME;
};

export const applyTheme = (theme: AppThemeName): void => {
  const themeConfig = APP_THEME_CONFIGS[theme];

  document.documentElement.dataset.theme = themeConfig.id;

  Object.entries(themeConfig.colors).forEach(([variableName, value]) => {
    document.documentElement.style.setProperty(variableName, value);
  });

  localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
};
