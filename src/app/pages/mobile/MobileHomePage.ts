import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { CSSProperties } from 'vue';

import { usePersonalDataHomePage } from '@/presentation/usePersonalDataHomePage';
import { useAppChrome } from '@/presentation/useAppChrome';
import { HELP_CONTENT } from '@/presentation/helpContent';
import {
  CSS_LENGTHS,
  DROPDOWN_MEASUREMENT,
  MOBILE_HOME_LAYOUT,
  USER_MENU_MEASUREMENT,
} from '@/constants/visualConstants';
import { USER_MENU_ACTIONS } from '@/constants/businessConstants';
import { APP_CHROME_CONTENT } from '@/presentation/appChromeContent';
import { buildTwoLineMiddleEllipsisLabel } from '@/presentation/twoLineMiddleEllipsis';

const getViewportWidth = (): number =>
  typeof window === 'undefined'
    ? MOBILE_HOME_LAYOUT.fallbackViewportWidthPx
    : Math.floor(window.visualViewport?.width ?? window.innerWidth);

const clamp = (min: number, value: number, max: number): number =>
  Math.min(max, Math.max(min, Math.round(value)));

let textMeasureCanvas: HTMLCanvasElement | undefined;

const measureTextWidth = (text: string, font: string): number => {
  if (typeof document === 'undefined') {
    return text.length * USER_MENU_MEASUREMENT.fallbackCharacterWidthPx;
  }

  textMeasureCanvas ??= document.createElement('canvas');
  const context = textMeasureCanvas.getContext('2d');

  if (context === null) {
    return text.length * USER_MENU_MEASUREMENT.fallbackCharacterWidthPx;
  }

  context.font = font;

  return context.measureText(text).width;
};

const measureWrappedTextMinimumWidth = (text: string, font: string): number => {
  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    return 0;
  }

  const words = trimmedText.split(/\s+/u);

  if (words.length > 1) {
    return Math.ceil(
      Math.max(0, ...words.map((word) => measureTextWidth(word, font))),
    );
  }

  return Math.ceil(
    measureTextWidth(trimmedText, font) / Array.from(trimmedText).length,
  );
};

const getDangerMenuItemRequiredWidth = (): number => {
  const dangerActions = USER_MENU_ACTIONS.filter((action) => action.danger);

  return Math.ceil(
    Math.max(
      0,
      ...dangerActions.map(
        (action) =>
          measureTextWidth(action.label, USER_MENU_MEASUREMENT.menuFont) +
          USER_MENU_MEASUREMENT.dangerBadgeGapPx +
          measureTextWidth(
            APP_CHROME_CONTENT.labels.danger,
            USER_MENU_MEASUREMENT.dangerBadgeFont,
          ) +
          USER_MENU_MEASUREMENT.dangerBadgeHorizontalPaddingPx +
          USER_MENU_MEASUREMENT.itemHorizontalPaddingPx +
          USER_MENU_MEASUREMENT.panelHorizontalPaddingPx,
      ),
    ),
  );
};

const getCompactDropdownRequiredWidth = (
  label: string,
  selectedLabel: string,
): number =>
  Math.ceil(
    Math.max(
      measureTextWidth(label, DROPDOWN_MEASUREMENT.labelFont),
      measureTextWidth(selectedLabel, DROPDOWN_MEASUREMENT.compactOptionFont) +
        DROPDOWN_MEASUREMENT.compactOptionHorizontalPaddingPx +
        DROPDOWN_MEASUREMENT.optionMarkerWidthPx +
        DROPDOWN_MEASUREMENT.optionMarkerGapPx,
    ),
  );

export const useMobileHomePage = () => {
  const chrome = useAppChrome();
  const homePage = usePersonalDataHomePage();
  const viewportWidth = ref(getViewportWidth());
  const isMobileNavCollapsed = ref(false);
  const isFilterDockCollapsed = ref(false);
  const mobileFullScreenOverlayStyle = {
    zIndex: MOBILE_HOME_LAYOUT.fullScreenOverlayZIndex,
  } satisfies CSSProperties;
  const mobileFullScreenOverlayPrimaryStyle = {
    zIndex: MOBILE_HOME_LAYOUT.fullScreenOverlayPrimaryZIndex,
  } satisfies CSSProperties;
  const mobileFullScreenOverlaySecondaryStyle = {
    zIndex: MOBILE_HOME_LAYOUT.fullScreenOverlaySecondaryZIndex,
  } satisfies CSSProperties;

  const refreshViewportWidth = (): void => {
    viewportWidth.value = getViewportWidth();
  };

  const collapseFilterDock = (): void => {
    isFilterDockCollapsed.value = true;
  };

  const expandFilterDock = (): void => {
    isFilterDockCollapsed.value = false;
  };

  const collapseMobileNav = (): void => {
    isMobileNavCollapsed.value = true;
  };

  const expandMobileNav = (): void => {
    isMobileNavCollapsed.value = false;
  };

  const mobileUserMenuProfileActionLabel = computed(() =>
    chrome.hasActiveUser.value
      ? APP_CHROME_CONTENT.labels.updateProfile
      : APP_CHROME_CONTENT.labels.createUser,
  );

  const mobileProfileActionLabel = computed(() =>
    chrome.hasActiveUser.value
      ? APP_CHROME_CONTENT.labels.editProfile
      : APP_CHROME_CONTENT.labels.createUser,
  );

  const mobileLayout = computed(() => {
    const selectedLanguageLabel =
      chrome.languageOptions.find((option) => option.id === chrome.languageId.value)
        ?.label ?? '';
    const navPaddingX = Math.min(
      MOBILE_HOME_LAYOUT.navPaddingXMaxPx,
      Math.round(viewportWidth.value * MOBILE_HOME_LAYOUT.navPaddingXRatio),
    );
    const availableNavWidth =
      viewportWidth.value - navPaddingX * 2 - MOBILE_HOME_LAYOUT.navGapPx * 2;
    const navContentMinWidth = MOBILE_HOME_LAYOUT.navContentMinWidthPx;
    const navInnerWidth = Math.max(1, viewportWidth.value - navPaddingX * 2);
    const navScale = Math.min(
      1,
      Math.max(MOBILE_HOME_LAYOUT.navMinScale, navInnerWidth / navContentMinWidth),
    );
    const scaledNavContentHeight =
      MOBILE_HOME_LAYOUT.navContentHeightPx * navScale;
    const navHeight = Math.ceil(
      scaledNavContentHeight * MOBILE_HOME_LAYOUT.navFrameHeightRatio,
    );
    const visibleNavHeight = isMobileNavCollapsed.value
      ? MOBILE_HOME_LAYOUT.navCollapsedBarHeightPx
      : navHeight;
    const themeControlWidth = clamp(
      MOBILE_HOME_LAYOUT.themeControlMinWidthPx,
      viewportWidth.value * MOBILE_HOME_LAYOUT.themeControlWidthRatio,
      MOBILE_HOME_LAYOUT.themeControlMaxWidthPx,
    );
    const settingsControlWidth = Math.max(
      themeControlWidth,
      getCompactDropdownRequiredWidth(
        APP_CHROME_CONTENT.labels.language,
        selectedLanguageLabel,
      ),
    );
    const userControlWidth = clamp(
      MOBILE_HOME_LAYOUT.userControlMinWidthPx,
      viewportWidth.value * MOBILE_HOME_LAYOUT.userControlWidthRatio,
      MOBILE_HOME_LAYOUT.userControlMaxWidthPx,
    );
    const dateControlWidth = Math.max(
      MOBILE_HOME_LAYOUT.dateControlMinWidthPx,
      availableNavWidth - settingsControlWidth - userControlWidth,
    );
    const profileActionsWidth = clamp(
      MOBILE_HOME_LAYOUT.profileActionsMinWidthPx,
      viewportWidth.value * MOBILE_HOME_LAYOUT.profileActionsWidthRatio,
      MOBILE_HOME_LAYOUT.profileActionsMaxWidthPx,
    );
    const defaultProfileAvatarSize = clamp(
      MOBILE_HOME_LAYOUT.profileAvatarMinSizePx,
      viewportWidth.value * MOBILE_HOME_LAYOUT.profileAvatarSizeRatio,
      MOBILE_HOME_LAYOUT.profileAvatarMaxSizePx,
    );
    const helpLogoRightInset = Math.min(
      MOBILE_HOME_LAYOUT.helpLogoRightInsetMaxPx,
      Math.round(viewportWidth.value * MOBILE_HOME_LAYOUT.helpLogoRightInsetRatio),
    );
    const helpHeaderTextWidth = Math.ceil(
      Math.max(
        measureTextWidth(
          APP_CHROME_CONTENT.labels.help,
          MOBILE_HOME_LAYOUT.helpEyebrowFont,
        ),
        measureTextWidth(HELP_CONTENT.title, MOBILE_HOME_LAYOUT.helpTitleFont),
      ),
    );
    const helpHeaderContentWidth =
      viewportWidth.value -
      MOBILE_HOME_LAYOUT.helpOverlayHorizontalPaddingPx -
      MOBILE_HOME_LAYOUT.helpHeaderHorizontalPaddingPx;
    const helpLogoAvailableWidth =
      helpHeaderContentWidth -
      helpHeaderTextWidth -
      MOBILE_HOME_LAYOUT.helpLogoMinGapPx -
      helpLogoRightInset;
    const helpLogoScale = Math.min(
      1,
      helpLogoAvailableWidth / MOBILE_HOME_LAYOUT.helpLogoFullSizePx,
    );
    const isHelpLogoVisible =
      helpLogoScale >= MOBILE_HOME_LAYOUT.helpLogoMinScale;
    const helpLogoStyle = {
      right: `${helpLogoRightInset}px`,
      height: CSS_LENGTHS.fullPercent,
      transform: `scale(${helpLogoScale})`,
      transformOrigin: 'right center',
    } satisfies CSSProperties;
    const filterDockInset = Math.min(
      MOBILE_HOME_LAYOUT.filterDockInsetPx,
      Math.max(
        MOBILE_HOME_LAYOUT.filterDockMinInsetPx,
        Math.round(viewportWidth.value * MOBILE_HOME_LAYOUT.filterDockInsetRatio),
      ),
    );
    const filterDockPadding = MOBILE_HOME_LAYOUT.filterDockPaddingPx;
    const filterDockGap = MOBILE_HOME_LAYOUT.filterDockGapPx;
    const profilePanelContentWidth =
      viewportWidth.value -
      filterDockInset * 2 -
      MOBILE_HOME_LAYOUT.profilePanelPaddingPx * 2;
    const profileIdentityAvailableWidth = Math.max(
      1,
      profilePanelContentWidth -
        profileActionsWidth -
        MOBILE_HOME_LAYOUT.profileActionsGridGapPx,
    );
    const profileTextAvailableWidthWithDefaultAvatar = Math.max(
      1,
      profileIdentityAvailableWidth -
        defaultProfileAvatarSize -
        MOBILE_HOME_LAYOUT.profileIdentityGapPx,
    );
    const profileNameWidth = measureTextWidth(
      chrome.activeUserLabel.value,
      MOBILE_HOME_LAYOUT.profileNameFont,
    );
    const profileNameWrappedMinimumWidth = measureWrappedTextMinimumWidth(
      chrome.activeUserLabel.value,
      MOBILE_HOME_LAYOUT.profileNameFont,
    );
    const profilePronounsWidth = chrome.activeUserPronounsVisible.value
      ? measureTextWidth(
          chrome.activeUserPronounsLabel.value,
          MOBILE_HOME_LAYOUT.profilePronounsFont,
        )
      : 0;
    const profilePronounsWrappedMinimumWidth =
      chrome.activeUserPronounsVisible.value
        ? measureWrappedTextMinimumWidth(
            chrome.activeUserPronounsLabel.value,
            MOBILE_HOME_LAYOUT.profilePronounsFont,
          )
        : 0;
    const horizontalProfileTextWidth =
      profileNameWidth +
      (chrome.activeUserPronounsVisible.value
        ? MOBILE_HOME_LAYOUT.profileNamePronounsGapPx + profilePronounsWidth
        : 0);
    const horizontalProfileTextFitsDefaultAvatar =
      horizontalProfileTextWidth <= profileTextAvailableWidthWithDefaultAvatar;
    const useStackedProfileIdentity =
      chrome.activeUserPronounsVisible.value &&
      !horizontalProfileTextFitsDefaultAvatar;
    const stackedProfileMinimumTextWidth = Math.max(
      profileNameWrappedMinimumWidth,
      profilePronounsWrappedMinimumWidth,
    );
    const profileMinimumTextWidthAfterLineChoice = useStackedProfileIdentity
      ? stackedProfileMinimumTextWidth
      : profileNameWrappedMinimumWidth +
        (chrome.activeUserPronounsVisible.value
          ? MOBILE_HOME_LAYOUT.profileNamePronounsGapPx +
            profilePronounsWrappedMinimumWidth
          : 0);
    const profileTextFitsDefaultAvatarAfterLineChoice =
      profileMinimumTextWidthAfterLineChoice <=
      profileTextAvailableWidthWithDefaultAvatar;
    const profileAvatarSize = profileTextFitsDefaultAvatarAfterLineChoice
      ? defaultProfileAvatarSize
      : clamp(
          MOBILE_HOME_LAYOUT.profileAvatarCompressedMinSizePx,
          profileIdentityAvailableWidth -
            MOBILE_HOME_LAYOUT.profileIdentityGapPx -
            profileMinimumTextWidthAfterLineChoice,
          defaultProfileAvatarSize,
        );
    const filterContentWidth =
      viewportWidth.value - filterDockPadding * 2;
    const filterColumnWidth = Math.floor(
      (filterContentWidth -
        filterDockGap * (MOBILE_HOME_LAYOUT.filterColumnCount - 1)) /
        MOBILE_HOME_LAYOUT.filterColumnCount,
    );
    const filterGridTemplateColumns = Array.from(
      { length: MOBILE_HOME_LAYOUT.filterColumnCount },
      () => `${filterColumnWidth}px`,
    ).join(' ');

    const contentStyle = {
      paddingLeft: `${filterDockInset}px`,
      paddingRight: `${filterDockInset}px`,
      paddingTop: `${visibleNavHeight + MOBILE_HOME_LAYOUT.contentTopGapPx}px`,
      paddingBottom: `${
        isFilterDockCollapsed.value
          ? MOBILE_HOME_LAYOUT.filterCollapsedContentPaddingBottomPx
          : MOBILE_HOME_LAYOUT.filterExpandedContentPaddingBottomPx
      }px`,
    } satisfies CSSProperties;
    const settingsControlStyle = {
      width: `${settingsControlWidth}px`,
    } satisfies CSSProperties;
    const userControlStyle = {
      width: `${userControlWidth}px`,
    } satisfies CSSProperties;
    const mobileUserMenuButtonTextWidth = Math.max(
      1,
      userControlWidth -
        USER_MENU_MEASUREMENT.mobileAvatarWidthPx -
        USER_MENU_MEASUREMENT.mobileButtonGapPx -
        USER_MENU_MEASUREMENT.mobileButtonHorizontalPaddingPx,
    );
    const mobileUserMenuButtonLabel = buildTwoLineMiddleEllipsisLabel({
      text: chrome.activeUserLabel.value,
      maxWidthPx: mobileUserMenuButtonTextWidth,
      maxLines: USER_MENU_MEASUREMENT.maxButtonLabelLines,
      ellipsis: USER_MENU_MEASUREMENT.middleEllipsis,
      font: USER_MENU_MEASUREMENT.userFont,
      measureTextWidth,
    });
    const profileActionsGridStyle = {
      gridTemplateColumns: `minmax(0, 1fr) ${profileActionsWidth}px`,
      gap: `${MOBILE_HOME_LAYOUT.profileActionsGridGapPx}px`,
    } satisfies CSSProperties;
    const profilePanelStyle = {
      padding: `${MOBILE_HOME_LAYOUT.profilePanelPaddingPx}px`,
    } satisfies CSSProperties;
    const profileIdentityStyle = {
      gap: `${MOBILE_HOME_LAYOUT.profileIdentityGapPx}px`,
    } satisfies CSSProperties;
    const profileAvatarStyle = {
      width: `${profileAvatarSize}px`,
      height: `${profileAvatarSize}px`,
    } satisfies CSSProperties;
    const profileNamePronounsStyle = {
      gap: `${
        useStackedProfileIdentity
          ? MOBILE_HOME_LAYOUT.profileStackedNamePronounsGapPx
          : MOBILE_HOME_LAYOUT.profileNamePronounsGapPx
      }px`,
    } satisfies CSSProperties;
    const filterDockStyle = {
      left: CSS_LENGTHS.zeroPx,
      right: CSS_LENGTHS.zeroPx,
      padding: `${filterDockPadding}px`,
      zIndex: MOBILE_HOME_LAYOUT.filterDockLayerZIndex,
    } satisfies CSSProperties;
    const filterDockControlStyle = {
      zIndex: MOBILE_HOME_LAYOUT.filterDockControlLayerZIndex,
    } satisfies CSSProperties;
    const filterGridStyle = {
      gridTemplateColumns: filterGridTemplateColumns,
      gap: `${filterDockGap}px`,
    } satisfies CSSProperties;
    const collapsedFilterDockStyle = {
      left: CSS_LENGTHS.zeroPx,
      right: CSS_LENGTHS.zeroPx,
      height: `${MOBILE_HOME_LAYOUT.filterCollapsedBarHeightPx}px`,
      zIndex: MOBILE_HOME_LAYOUT.filterDockLayerZIndex,
    } satisfies CSSProperties;
    const navCollapseButtonStyle = {
      zIndex: chrome.isUserMenuOpen.value
        ? MOBILE_HOME_LAYOUT.navCoveredControlLayerZIndex
        : MOBILE_HOME_LAYOUT.navCollapseButtonLayerZIndex,
    } satisfies CSSProperties;
    const navPopupLayerStyle = {
      zIndex: MOBILE_HOME_LAYOUT.navPopupLayerZIndex,
    } satisfies CSSProperties;

    return {
      ...MOBILE_HOME_LAYOUT,
      collapsedFilterDockStyle,
      contentStyle,
      filterDockStyle,
      filterDockControlStyle,
      filterGridStyle,
      useStackedDate: availableNavWidth < navContentMinWidth,
      profileIdentityMinWidth: `${MOBILE_HOME_LAYOUT.profileIdentityMinWidthPx}px`,
      profileIdentityMinScale: MOBILE_HOME_LAYOUT.profileIdentityMinScale,
      profileActionsGridStyle,
      profileAvatarStyle,
      profileIdentityStyle,
      profileNamePronounsStyle,
      profilePanelStyle,
      useStackedProfileIdentity,
      navCollapseButtonStyle,
      navPopupLayerStyle,
      settingsControlStyle,
      userControlStyle,
      mobileUserMenuButtonLabel,
      showUserMenuDangerBadges:
        userControlWidth >= getDangerMenuItemRequiredWidth(),
      userMenuLabelStyle: {
        paddingLeft: `${Math.min(
          MOBILE_HOME_LAYOUT.userMenuLabelMaxInsetPx,
          Math.max(
            0,
            (userControlWidth - MOBILE_HOME_LAYOUT.userMenuLabelBaseWidthPx) *
              MOBILE_HOME_LAYOUT.userMenuLabelInsetRatio,
          ),
        )}px`,
      } satisfies CSSProperties,
      navOuterStyle: {
        height: `${visibleNavHeight}px`,
        paddingLeft: `${navPaddingX}px`,
        paddingRight: `${navPaddingX}px`,
        zIndex: MOBILE_HOME_LAYOUT.navOuterLayerZIndex,
      } satisfies CSSProperties,
      navFrameStyle: {
        height: `${navHeight}px`,
      } satisfies CSSProperties,
      navGridStyle: {
        position: 'absolute',
        left: CSS_LENGTHS.zeroPx,
        top: `${scaledNavContentHeight * MOBILE_HOME_LAYOUT.navFrameTopInsetRatio}px`,
        width: `${navContentMinWidth}px`,
        minWidth: `${navContentMinWidth}px`,
        height: `${MOBILE_HOME_LAYOUT.navContentHeightPx}px`,
        gap: `${MOBILE_HOME_LAYOUT.navGapPx}px`,
        gridTemplateColumns: `${settingsControlWidth}px minmax(${dateControlWidth}px, 1fr) ${userControlWidth}px`,
        zIndex: MOBILE_HOME_LAYOUT.navContentLayerZIndex,
        transform: `scale(${navScale})`,
        transformOrigin: 'top left',
      } satisfies CSSProperties,
      helpLogoStyle,
      isHelpLogoVisible,
    };
  });

  const importJsonFile = async (event: Event): Promise<void> => {
    await homePage.importJsonFile(event);
    await chrome.refreshUsers();
    chrome.closeUserActionModal();
  };

  onMounted(() => {
    window.addEventListener('resize', refreshViewportWidth);
    window.visualViewport?.addEventListener('resize', refreshViewportWidth);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', refreshViewportWidth);
    window.visualViewport?.removeEventListener('resize', refreshViewportWidth);
  });

  return {
    ...chrome,
    ...homePage,
    collapseMobileNav,
    collapseFilterDock,
    expandMobileNav,
    expandFilterDock,
    isFilterDockCollapsed,
    isMobileNavCollapsed,
    helpContent: HELP_CONTENT,
    mobileLayout,
    mobileFullScreenOverlayPrimaryStyle,
    mobileFullScreenOverlaySecondaryStyle,
    mobileFullScreenOverlayStyle,
    mobileProfileActionLabel,
    mobileUserMenuProfileActionLabel,
    importJsonFile,
  };
};
