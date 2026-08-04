export const AUTO_SCALE_CONTENT_DEFAULT_MIN_SCALE = 0.85;

export const PERCENT_FULL = 100;

export const CSS_LENGTHS = {
  zeroPx: '0px',
  fullPercent: '100%',
  percentUnit: '%',
} as const;

export const APP_LAYER_Z_INDEX = {
  relativePopup: 40,
  fullScreenOverlay: 1000,
  fullScreenOverlaySecondary: 1010,
  fullScreenOverlayPrimary: 1020,
  blockingFullScreenOverlay: 1100,
} as const;

export const APP_TYPOGRAPHY = {
  fontFamily: {
    sansStack: [
      'Inter',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'sans-serif',
    ],
    sansCss:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  fontWeight: {
    medium: 500,
    semibold: 600,
  },
  fixedFontSizePx: {
    micro: 10,
    tiny: 11,
    caption: 12,
    bodySmall: 14,
    body: 16,
    bodyLarge: 18,
    titleSmall: 20,
    titleMedium: 24,
    titleLarge: 30,
    displaySmall: 36,
  },
  lineHeight: {
    compact: '1rem',
    bodySmall: '1.25rem',
    body: '1.5rem',
    bodyLarge: '1.75rem',
    titleSmall: '1.75rem',
    titleMedium: '2rem',
    titleLarge: '2.25rem',
    displaySmall: '2.5rem',
  },
  fittedFontSizePx: {
    label: {
      defaultFontPx: 12,
      minFontPx: 8,
    },
    button: {
      defaultFontPx: 10,
      minFontPx: 7,
    },
  },
  measurement: {
    fallbackCharacterWidthPx: 8,
    safetyInsetPx: 2,
  },
} as const;

export const DEVICE_DETECTION = {
  desktopEntryMinWidthPx: 920,
} as const;

export const AUTO_SCALE_CONTENT_LIMITS = {
  minScaleFloor: 0.1,
  maxScale: 1,
  overflowTolerancePx: 1,
} as const;

export const DESKTOP_HOME_LAYOUT = {
  fallbackViewportWidthPx: 1024,
  filtersMinScale: AUTO_SCALE_CONTENT_DEFAULT_MIN_SCALE,
  profileAvatarPillThresholdRatio: 0.5,
  navHorizontalPaddingDefaultRatio: 0.03,
  navHorizontalPaddingMinRatio: 0.01,
  navSettingsGapDefaultPx: 16,
  navActionsGapDefaultPx: 12,
  navGroupGapMinViewportRatio: 0.005,
  dateTimeGapDefaultPx: 32,
  dateTimeGapMinViewportRatio: 0.01,
  dateTimeSidePaddingMinViewportRatio: 0.01,
  dateTimeMaxLineCount: 2,
  dateTimeFallbackCharacterWidthPx:
    APP_TYPOGRAPHY.measurement.fallbackCharacterWidthPx,
  dateTimeFont: `${APP_TYPOGRAPHY.fontWeight.semibold} ${APP_TYPOGRAPHY.fixedFontSizePx.bodyLarge}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  timeFont: `${APP_TYPOGRAPHY.fontWeight.medium} ${APP_TYPOGRAPHY.fixedFontSizePx.body}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  userMenuLayerZIndex: APP_LAYER_Z_INDEX.relativePopup,
  fullScreenOverlayZIndex: APP_LAYER_Z_INDEX.fullScreenOverlay,
  fullScreenOverlayPrimaryZIndex: APP_LAYER_Z_INDEX.fullScreenOverlayPrimary,
  fullScreenOverlaySecondaryZIndex:
    APP_LAYER_Z_INDEX.fullScreenOverlaySecondary,
  dropdownLabelDefaultFontPx: APP_TYPOGRAPHY.fixedFontSizePx.bodySmall,
  dropdownControlClass: 'w-[128px]',
  profileJsonActionHorizontalPaddingViewportRatio: 0.01,
  dangerMenuGridClass: 'grid-cols-[minmax(0,1fr)_auto] gap-3',
} as const;

export const MOBILE_HOME_LAYOUT = {
  fallbackViewportWidthPx: 390,
  navContentHeightPx: 128,
  navFrameHeightRatio: 1.3,
  navFrameTopInsetRatio: 0.1,
  navCollapsedBarHeightPx: 40,
  navOuterLayerZIndex: 10,
  navCoveredControlLayerZIndex: 0,
  navContentLayerZIndex: 10,
  navCollapseButtonLayerZIndex: 20,
  navPopupLayerZIndex: APP_LAYER_Z_INDEX.relativePopup,
  fullScreenOverlayZIndex: APP_LAYER_Z_INDEX.fullScreenOverlay,
  fullScreenOverlayPrimaryZIndex: APP_LAYER_Z_INDEX.fullScreenOverlayPrimary,
  fullScreenOverlaySecondaryZIndex:
    APP_LAYER_Z_INDEX.fullScreenOverlaySecondary,
  navPaddingXRatio: 0.04,
  navPaddingXMaxPx: 16,
  navGapPx: 8,
  themeControlMinWidthPx: 96,
  themeControlMaxWidthPx: 128,
  themeControlWidthRatio: 0.29,
  userControlMinWidthPx: 120,
  userControlMaxWidthPx: 152,
  userControlWidthRatio: 0.36,
  profileActionsMinWidthPx: 104,
  profileActionsMaxWidthPx: 120,
  profileActionsWidthRatio: 0.29,
  profileAvatarMinSizePx: 64,
  profileAvatarCompressedMinSizePx: 48,
  profileAvatarMaxSizePx: 80,
  profileAvatarSizeRatio: 0.19,
  profilePanelPaddingPx: 20,
  profileActionsGridGapPx: 16,
  profileIdentityGapPx: 8,
  profileNamePronounsGapPx: 8,
  profileStackedNamePronounsGapPx: 4,
  profileNameFont: `${APP_TYPOGRAPHY.fontWeight.semibold} ${APP_TYPOGRAPHY.fixedFontSizePx.titleMedium}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  profilePronounsFont: `${APP_TYPOGRAPHY.fixedFontSizePx.bodySmall}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  filterDockInsetPx: 12,
  filterDockLayerZIndex: 20,
  filterDockControlLayerZIndex: 10,
  filterDockPaddingPx: 8,
  filterDockGapPx: 8,
  filterColumnCount: 3,
  filterExpandedContentPaddingBottomPx: 196,
  filterCollapsedContentPaddingBottomPx: 48,
  filterCollapsedBarHeightPx: 40,
  helpLogoRightInsetMaxPx: 16,
  helpLogoRightInsetRatio: 0.04,
  helpLogoFullSizePx: 100,
  helpLogoMinGapPx: 8,
  helpLogoMinScale: 0.42,
  helpOverlayHorizontalPaddingPx: 40,
  helpHeaderHorizontalPaddingPx: 48,
  helpEyebrowFont: `${APP_TYPOGRAPHY.fontWeight.medium} ${APP_TYPOGRAPHY.fixedFontSizePx.caption}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  helpTitleFont: `${APP_TYPOGRAPHY.fontWeight.semibold} ${APP_TYPOGRAPHY.fixedFontSizePx.titleMedium}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  navContentMinWidthPx: 420,
  navMinScale: 0.5,
  dateControlMinWidthPx: 72,
  contentTopGapPx: 20,
  filterDockInsetRatio: 0.03,
  filterDockMinInsetPx: 8,
  profileIdentityMinWidthPx: 260,
  profileIdentityMinScale: 0.5,
  userMenuLabelMaxInsetPx: 12,
  userMenuLabelBaseWidthPx: 24,
  userMenuLabelInsetRatio: 0.1,
  dropdownLabelInsetRatio: 0.1,
  dangerMenuGridClass: 'grid-cols-[minmax(0,1fr)_auto] gap-3',
  dangerMenuSingleColumnClass: 'grid-cols-1',
} as const;

export const RANGE_CONTROL_LAYOUT = {
  mobileModifyButtonHorizontalPaddingPx: 8,
  mobileEditorLayerZIndex: APP_LAYER_Z_INDEX.fullScreenOverlayPrimary,
} as const;

export const FITTED_TEXT_MEASUREMENT = {
  fallbackCharacterWidthPx:
    APP_TYPOGRAPHY.measurement.fallbackCharacterWidthPx,
  labelDefaultFontPx: APP_TYPOGRAPHY.fittedFontSizePx.label.defaultFontPx,
  labelMinFontPx: APP_TYPOGRAPHY.fittedFontSizePx.label.minFontPx,
  buttonDefaultFontPx: APP_TYPOGRAPHY.fittedFontSizePx.button.defaultFontPx,
  buttonMinFontPx: APP_TYPOGRAPHY.fittedFontSizePx.button.minFontPx,
  fontFamily: APP_TYPOGRAPHY.fontFamily.sansCss,
  fontWeightMedium: APP_TYPOGRAPHY.fontWeight.medium,
  safetyInsetPx: APP_TYPOGRAPHY.measurement.safetyInsetPx,
} as const;

export const RANGE_CONTROL_LABELS = {
  modify: 'Modify',
  start: 'Start',
  end: 'End',
  cancel: 'Cancel',
  apply: 'Apply',
  valueRangeSeparator: 'to',
  valueAriaSuffix: 'value',
  minimumAriaSuffix: 'minimum',
  maximumAriaSuffix: 'maximum',
  editorDialogSuffix: 'range editor',
} as const;

export const DATE_RANGE_CONTROL_LABELS = {
  label: 'Date Range',
  dialogLabel: 'Date range picker',
  startAriaLabel: 'Date Range Start',
  endAriaLabel: 'Date Range End',
  title: 'Choose Dates',
  start: 'Start',
  end: 'End',
  cancel: 'Cancel',
  clear: 'Clear',
  apply: 'Apply',
  emptyDate: 'yyyy/mm/dd',
} as const;

export const DATE_RANGE_CONTROL_LAYOUT = {
  mobileModalOverlayLayerZIndex: APP_LAYER_Z_INDEX.fullScreenOverlayPrimary,
} as const;

export const COOKIE_CONSENT_LAYOUT = {
  overlayLayerZIndex: APP_LAYER_Z_INDEX.blockingFullScreenOverlay,
} as const;

export const DROPDOWN_LABELS = {
  placeholder: 'Select',
  emptyLabel: 'None',
  allSelected: 'All',
  exceptPrefix: 'Except',
  selectedSuffix: 'selected',
  maxInlineSelectedLabels: 2,
  preferExceptMinOptionCount: 3,
} as const;

export const USER_MENU_MEASUREMENT = {
  fallbackViewportWidthPx: 1024,
  fallbackCharacterWidthPx:
    APP_TYPOGRAPHY.measurement.fallbackCharacterWidthPx,
  menuFont: `${APP_TYPOGRAPHY.fixedFontSizePx.bodySmall}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  userFont: `${APP_TYPOGRAPHY.fontWeight.semibold} ${APP_TYPOGRAPHY.fixedFontSizePx.bodySmall}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  mobileLabelFont: `${APP_TYPOGRAPHY.fontWeight.medium} ${APP_TYPOGRAPHY.fixedFontSizePx.caption}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  dangerBadgeFont: `${APP_TYPOGRAPHY.fontWeight.medium} ${APP_TYPOGRAPHY.fixedFontSizePx.tiny}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  panelHorizontalPaddingPx: 16,
  itemHorizontalPaddingPx: 24,
  dangerBadgeHorizontalPaddingPx: 16,
  dangerBadgeGapPx: 12,
  desktopAvatarWidthPx: 40,
  desktopButtonGapPx: 12,
  desktopButtonHorizontalPaddingPx: 24,
  desktopButtonMaxViewportWidthRatio: 0.15,
  mobileAvatarWidthPx: 36,
  mobileButtonGapPx: 8,
  mobileButtonHorizontalPaddingPx: 16,
  maxButtonLabelLines: 2,
  middleEllipsis: '...',
  mobileLabelInsetRatio: 0.1,
  mobileMaxLabelInsetPx: 12,
} as const;

export const DROPDOWN_MEASUREMENT = {
  fallbackCharacterWidthPx:
    APP_TYPOGRAPHY.measurement.fallbackCharacterWidthPx,
  labelFont: `${APP_TYPOGRAPHY.fontWeight.medium} ${APP_TYPOGRAPHY.fixedFontSizePx.caption}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  compactOptionFont: `${APP_TYPOGRAPHY.fontWeight.medium} ${APP_TYPOGRAPHY.fixedFontSizePx.caption}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  regularOptionFont: `${APP_TYPOGRAPHY.fontWeight.medium} ${APP_TYPOGRAPHY.fixedFontSizePx.bodySmall}px ${APP_TYPOGRAPHY.fontFamily.sansCss}`,
  maxLabelInsetPx: 12,
  regularOptionHeightPx: 44,
  compactOptionHeightPx: 36,
  menuVerticalPaddingPx: 16,
  menuHorizontalPaddingPx: 16,
  optionHorizontalPaddingPx: 24,
  compactOptionHorizontalPaddingPx: 16,
  optionMarkerWidthPx: 16,
  optionMarkerGapPx: 12,
  maxMenuHeightPx: 256,
  menuLayerZIndex: APP_LAYER_Z_INDEX.relativePopup,
  menuOffset: 'calc(100% + 0.5rem)',
} as const;

export const LOADING_PLACEHOLDER_DELAYS = {
  userProfileMs: 450,
  diaryEntriesMs: 450,
} as const;

export const APP_DATE_TIME_FORMATS = {
  locale: 'en-US',
  monthLabel: {
    month: 'long',
  },
  weekdayLabel: {
    weekday: 'long',
  },
  timeLabel: {
    hour: 'numeric',
    minute: '2-digit',
  },
  entryTimestamp: {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
  hourInTimeZone: {
    hour: '2-digit',
    hourCycle: 'h23',
  },
} as const;

export const CLOCK_TICK = {
  minuteMs: 60_000,
  secondMs: 1_000,
} as const;

export const RANGE_SLIDER_INTERACTION = {
  mobileLongPressMs: 450,
} as const;
