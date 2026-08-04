import type { Config } from 'tailwindcss';
import { APP_TYPOGRAPHY } from './src/constants/visualConstants';

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        app: 'rgb(var(--color-app) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        panelMuted: 'rgb(var(--color-panel-muted) / <alpha-value>)',
        panelStrong: 'rgb(var(--color-panel-strong) / <alpha-value>)',
        profileSurface: 'rgb(var(--color-profile-surface) / <alpha-value>)',
        mainColor: 'rgb(var(--color-main) / <alpha-value>)',
        mainColorText: 'rgb(var(--color-main-text) / <alpha-value>)',
        mainColorBodyText: 'rgb(var(--color-main-body-text) / <alpha-value>)',
        mainColorMutedText: 'rgb(var(--color-main-muted-text) / <alpha-value>)',
        titleText: 'rgb(var(--color-title-text) / <alpha-value>)',
        bodyText: 'rgb(var(--color-body-text) / <alpha-value>)',
        mutedText: 'rgb(var(--color-muted-text) / <alpha-value>)',
        inverseText: 'rgb(var(--color-inverse-text) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        levelGood: 'rgb(var(--color-level-good) / <alpha-value>)',
        levelNeutral: 'rgb(var(--color-level-neutral) / <alpha-value>)',
        levelBad: 'rgb(var(--color-level-bad) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        dangerSurface: 'rgb(var(--color-danger-surface) / <alpha-value>)',
        borderBase: 'rgb(var(--color-border-base) / <alpha-value>)',
        navSurface: 'rgb(var(--color-nav-surface) / <alpha-value>)',
        avatarBorder: 'rgb(var(--color-avatar-border) / <alpha-value>)',
        navAvatarSurface: 'rgb(var(--color-nav-avatar-surface) / <alpha-value>)',
        profileAvatarSurface: 'rgb(var(--color-profile-avatar-surface) / <alpha-value>)',
        maskBackground: 'rgb(var(--color-mask-background) / <alpha-value>)',
        maskSubject: 'rgb(var(--color-mask-subject) / <alpha-value>)',
      },
      fontFamily: {
        sans: [...APP_TYPOGRAPHY.fontFamily.sansStack],
      },
      fontSize: {
        'typo-micro': [
          `${APP_TYPOGRAPHY.fixedFontSizePx.micro}px`,
          { lineHeight: APP_TYPOGRAPHY.lineHeight.compact },
        ],
        'typo-tiny': [
          `${APP_TYPOGRAPHY.fixedFontSizePx.tiny}px`,
          { lineHeight: APP_TYPOGRAPHY.lineHeight.compact },
        ],
        'typo-caption': [
          `${APP_TYPOGRAPHY.fixedFontSizePx.caption}px`,
          { lineHeight: APP_TYPOGRAPHY.lineHeight.compact },
        ],
        'typo-body-small': [
          `${APP_TYPOGRAPHY.fixedFontSizePx.bodySmall}px`,
          { lineHeight: APP_TYPOGRAPHY.lineHeight.bodySmall },
        ],
        'typo-body': [
          `${APP_TYPOGRAPHY.fixedFontSizePx.body}px`,
          { lineHeight: APP_TYPOGRAPHY.lineHeight.body },
        ],
        'typo-body-large': [
          `${APP_TYPOGRAPHY.fixedFontSizePx.bodyLarge}px`,
          { lineHeight: APP_TYPOGRAPHY.lineHeight.bodyLarge },
        ],
        'typo-title-small': [
          `${APP_TYPOGRAPHY.fixedFontSizePx.titleSmall}px`,
          { lineHeight: APP_TYPOGRAPHY.lineHeight.titleSmall },
        ],
        'typo-title-medium': [
          `${APP_TYPOGRAPHY.fixedFontSizePx.titleMedium}px`,
          { lineHeight: APP_TYPOGRAPHY.lineHeight.titleMedium },
        ],
        'typo-title-large': [
          `${APP_TYPOGRAPHY.fixedFontSizePx.titleLarge}px`,
          { lineHeight: APP_TYPOGRAPHY.lineHeight.titleLarge },
        ],
        'typo-display-small': [
          `${APP_TYPOGRAPHY.fixedFontSizePx.displaySmall}px`,
          { lineHeight: APP_TYPOGRAPHY.lineHeight.displaySmall },
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
