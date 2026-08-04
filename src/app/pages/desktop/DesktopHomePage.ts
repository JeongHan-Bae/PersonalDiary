import { usePersonalDataHomePage } from '@/presentation/usePersonalDataHomePage';
import { useAppChrome } from '@/presentation/useAppChrome';
import { DESKTOP_HOME_LAYOUT } from '@/constants/visualConstants';
import { HELP_CONTENT } from '@/presentation/helpContent';
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  type CSSProperties,
} from 'vue';

const getDesktopViewportWidth = (): number =>
  typeof window === 'undefined'
    ? DESKTOP_HOME_LAYOUT.fallbackViewportWidthPx
    : Math.floor(window.visualViewport?.width ?? window.innerWidth);

let textMeasureCanvas: HTMLCanvasElement | undefined;

const measureTextWidth = (text: string, font: string): number => {
  if (typeof document === 'undefined') {
    return text.length * DESKTOP_HOME_LAYOUT.dateTimeFallbackCharacterWidthPx;
  }

  textMeasureCanvas ??= document.createElement('canvas');
  const context = textMeasureCanvas.getContext('2d');

  if (context === null) {
    return text.length * DESKTOP_HOME_LAYOUT.dateTimeFallbackCharacterWidthPx;
  }

  context.font = font;

  return context.measureText(text).width;
};

const measureMinimumTextWidthForLines = (
  text: string,
  font: string,
  maxLines: number,
): number => {
  const words = text.trim().split(/\s+/);

  if (words.length <= 1 || maxLines <= 1) {
    return measureTextWidth(text, font);
  }

  let minimumWidth = measureTextWidth(text, font);

  for (let splitIndex = 1; splitIndex < words.length; splitIndex += 1) {
    const firstLineWidth = measureTextWidth(
      words.slice(0, splitIndex).join(' '),
      font,
    );
    const secondLineWidth = measureTextWidth(
      words.slice(splitIndex).join(' '),
      font,
    );

    minimumWidth = Math.min(
      minimumWidth,
      Math.max(firstLineWidth, secondLineWidth),
    );
  }

  return minimumWidth;
};

const measureChildrenWidth = (element: HTMLElement): number =>
  Array.from(element.children).reduce(
    (totalWidth, child) =>
      totalWidth + child.getBoundingClientRect().width,
    0,
  );

export const useDesktopHomePage = () => {
  const chrome = useAppChrome();
  const homePage = usePersonalDataHomePage();
  const desktopViewportWidth = ref(getDesktopViewportWidth());
  const desktopNavElement = ref<HTMLElement>();
  const desktopNavLeftElement = ref<HTMLElement>();
  const desktopNavRightElement = ref<HTMLElement>();
  const desktopNavWidth = ref(getDesktopViewportWidth());
  const desktopNavLeftItemsWidth = ref(0);
  const desktopNavRightItemsWidth = ref(0);
  const desktopProfileAvatarElement = ref<HTMLElement>();
  const desktopProfileAvatarStyle = ref<CSSProperties>({});
  const desktopUserMenuStyle = {
    zIndex: DESKTOP_HOME_LAYOUT.userMenuLayerZIndex,
  } satisfies CSSProperties;
  const desktopFullScreenOverlayStyle = {
    zIndex: DESKTOP_HOME_LAYOUT.fullScreenOverlayZIndex,
  } satisfies CSSProperties;
  const desktopFullScreenOverlayPrimaryStyle = {
    zIndex: DESKTOP_HOME_LAYOUT.fullScreenOverlayPrimaryZIndex,
  } satisfies CSSProperties;
  const desktopFullScreenOverlaySecondaryStyle = {
    zIndex: DESKTOP_HOME_LAYOUT.fullScreenOverlaySecondaryZIndex,
  } satisfies CSSProperties;
  const desktopNavLayout = computed(() => {
    const viewportWidth = desktopViewportWidth.value;
    const minimumDateTimeGap = Math.round(
      viewportWidth * DESKTOP_HOME_LAYOUT.dateTimeGapMinViewportRatio,
    );
    const minimumDateTimeSidePadding = Math.round(
      viewportWidth *
        DESKTOP_HOME_LAYOUT.dateTimeSidePaddingMinViewportRatio,
    );
    const defaultNavHorizontalPadding =
      viewportWidth * DESKTOP_HOME_LAYOUT.navHorizontalPaddingDefaultRatio;
    const minimumNavHorizontalPadding =
      viewportWidth * DESKTOP_HOME_LAYOUT.navHorizontalPaddingMinRatio;
    const minimumNavGroupGap =
      viewportWidth * DESKTOP_HOME_LAYOUT.navGroupGapMinViewportRatio;
    const dateTextWidth = measureTextWidth(
      chrome.currentDateLabel.value,
      DESKTOP_HOME_LAYOUT.dateTimeFont,
    );
    const timeTextWidth = measureTextWidth(
      chrome.currentTimeLabel.value,
      DESKTOP_HOME_LAYOUT.timeFont,
    );
    const minimumTwoLineDateWidth = measureMinimumTextWidthForLines(
      chrome.currentDateLabel.value,
      DESKTOP_HOME_LAYOUT.dateTimeFont,
      DESKTOP_HOME_LAYOUT.dateTimeMaxLineCount,
    );
    const minimumTwoLineTimeWidth = measureMinimumTextWidthForLines(
      chrome.currentTimeLabel.value,
      DESKTOP_HOME_LAYOUT.timeFont,
      DESKTOP_HOME_LAYOUT.dateTimeMaxLineCount,
    );
    const minimumTwoLineCenterWidth =
      minimumTwoLineDateWidth +
      minimumTwoLineTimeWidth +
      minimumDateTimeGap;
    const defaultAvailableCenterWidth =
      desktopNavWidth.value -
      desktopNavLeftItemsWidth.value -
      desktopNavRightItemsWidth.value -
      defaultNavHorizontalPadding * 2 -
      DESKTOP_HOME_LAYOUT.navSettingsGapDefaultPx -
      DESKTOP_HOME_LAYOUT.navActionsGapDefaultPx -
      minimumDateTimeSidePadding * 2;
    const centerWidthShortfall = Math.max(
      0,
      minimumTwoLineCenterWidth - defaultAvailableCenterWidth,
    );
    const maximumPeripheralCompression =
      (defaultNavHorizontalPadding - minimumNavHorizontalPadding) * 2 +
      (DESKTOP_HOME_LAYOUT.navSettingsGapDefaultPx - minimumNavGroupGap) +
      (DESKTOP_HOME_LAYOUT.navActionsGapDefaultPx - minimumNavGroupGap);
    const peripheralCompressionRatio =
      maximumPeripheralCompression <= 0
        ? 1
        : Math.min(1, centerWidthShortfall / maximumPeripheralCompression);
    const navHorizontalPadding =
      defaultNavHorizontalPadding -
      (defaultNavHorizontalPadding - minimumNavHorizontalPadding) *
        peripheralCompressionRatio;
    const navSettingsGap =
      DESKTOP_HOME_LAYOUT.navSettingsGapDefaultPx -
      (DESKTOP_HOME_LAYOUT.navSettingsGapDefaultPx - minimumNavGroupGap) *
        peripheralCompressionRatio;
    const navActionsGap =
      DESKTOP_HOME_LAYOUT.navActionsGapDefaultPx -
      (DESKTOP_HOME_LAYOUT.navActionsGapDefaultPx - minimumNavGroupGap) *
        peripheralCompressionRatio;
    const availableCenterWidth = Math.max(
      1,
      desktopNavWidth.value -
        desktopNavLeftItemsWidth.value -
        desktopNavRightItemsWidth.value -
        navHorizontalPadding * 2 -
        navSettingsGap -
        navActionsGap -
        minimumDateTimeSidePadding * 2,
    );
    const dateTimeTextWidth = dateTextWidth + timeTextWidth;
    const naturalCenterWidth =
      dateTimeTextWidth + DESKTOP_HOME_LAYOUT.dateTimeGapDefaultPx;
    const centerWidth = Math.min(naturalCenterWidth, availableCenterWidth);
    const dateTimeGap = Math.max(
      minimumDateTimeGap,
      Math.min(
        DESKTOP_HOME_LAYOUT.dateTimeGapDefaultPx,
        centerWidth - dateTimeTextWidth,
      ),
    );
    const availableTextWidth = Math.max(0, centerWidth - dateTimeGap);
    const minimumTwoLineTextWidth =
      minimumTwoLineDateWidth + minimumTwoLineTimeWidth;
    const totalTextCompressionCapacity =
      dateTimeTextWidth - minimumTwoLineTextWidth;
    let renderedDateWidth: number;
    let renderedTimeWidth: number;

    if (availableTextWidth >= dateTimeTextWidth) {
      renderedDateWidth = dateTextWidth;
      renderedTimeWidth = timeTextWidth;
    } else if (
      availableTextWidth >= minimumTwoLineTextWidth &&
      totalTextCompressionCapacity > 0
    ) {
      const requiredTextCompression = dateTimeTextWidth - availableTextWidth;
      renderedDateWidth =
        dateTextWidth -
        requiredTextCompression *
          ((dateTextWidth - minimumTwoLineDateWidth) /
            totalTextCompressionCapacity);
      renderedTimeWidth = availableTextWidth - renderedDateWidth;
    } else {
      const belowTwoLineScale =
        minimumTwoLineTextWidth <= 0
          ? 0
          : availableTextWidth / minimumTwoLineTextWidth;
      renderedDateWidth = minimumTwoLineDateWidth * belowTwoLineScale;
      renderedTimeWidth = minimumTwoLineTimeWidth * belowTwoLineScale;
    }

    return {
      dateStyle: {
        flex: `0 0 ${renderedDateWidth}px`,
        width: `${renderedDateWidth}px`,
      } satisfies CSSProperties,
      dateTimeStyle: {
        flex: `0 0 ${centerWidth}px`,
        gap: `${dateTimeGap}px`,
        width: `${centerWidth}px`,
      } satisfies CSSProperties,
      leftGroupStyle: {
        gap: `${navSettingsGap}px`,
      } satisfies CSSProperties,
      navStyle: {
        paddingLeft: `${navHorizontalPadding}px`,
        paddingRight: `${navHorizontalPadding}px`,
      } satisfies CSSProperties,
      rightGroupStyle: {
        gap: `${navActionsGap}px`,
      } satisfies CSSProperties,
      timeStyle: {
        flex: `0 0 ${renderedTimeWidth}px`,
        width: `${renderedTimeWidth}px`,
      } satisfies CSSProperties,
    };
  });
  const desktopDateStyle = computed(() => desktopNavLayout.value.dateStyle);
  const desktopDateTimeStyle = computed(
    () => desktopNavLayout.value.dateTimeStyle,
  );
  const desktopNavStyle = computed(() => desktopNavLayout.value.navStyle);
  const desktopNavLeftStyle = computed(
    () => desktopNavLayout.value.leftGroupStyle,
  );
  const desktopNavRightStyle = computed(
    () => desktopNavLayout.value.rightGroupStyle,
  );
  const desktopTimeStyle = computed(() => desktopNavLayout.value.timeStyle);
  const desktopProfileJsonActionStyle = computed<CSSProperties>(() => {
    const horizontalPadding =
      desktopViewportWidth.value *
      DESKTOP_HOME_LAYOUT.profileJsonActionHorizontalPaddingViewportRatio;

    return {
      paddingLeft: `${horizontalPadding}px`,
      paddingRight: `${horizontalPadding}px`,
    };
  });
  let desktopNavResizeObserver: ResizeObserver | undefined;
  let desktopProfileAvatarResizeObserver: ResizeObserver | undefined;

  const refreshDesktopViewportWidth = (): void => {
    desktopViewportWidth.value = getDesktopViewportWidth();
  };

  const updateDesktopProfileAvatarSize = (shouldResetSize = false): void => {
    const avatarElement = desktopProfileAvatarElement.value;

    if (avatarElement === undefined) {
      return;
    }

    if (shouldResetSize) {
      desktopProfileAvatarStyle.value = {};
    }

    window.requestAnimationFrame(() => {
      const avatarRect = avatarElement.getBoundingClientRect();
      const avatarWidth = avatarRect.width;
      const avatarHeight = avatarRect.height;

      if (avatarWidth <= 0 || avatarHeight <= 0) {
        return;
      }

      const shouldKeepCircle =
        avatarHeight >=
        avatarWidth * DESKTOP_HOME_LAYOUT.profileAvatarPillThresholdRatio;
      const avatarSize = Math.min(avatarWidth, avatarHeight);

      desktopProfileAvatarStyle.value = shouldKeepCircle
        ? {
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
          }
        : {
            width: `${avatarWidth}px`,
            height: `${avatarHeight}px`,
          };
    });
  };

  const refreshDesktopNavMeasurements = (): void => {
    const navElement = desktopNavElement.value;
    const leftElement = desktopNavLeftElement.value;
    const rightElement = desktopNavRightElement.value;

    if (
      navElement === undefined ||
      leftElement === undefined ||
      rightElement === undefined
    ) {
      return;
    }

    desktopNavWidth.value = navElement.clientWidth;
    desktopNavLeftItemsWidth.value = measureChildrenWidth(leftElement);
    desktopNavRightItemsWidth.value = measureChildrenWidth(rightElement);
  };

  const handleDesktopWindowResize = (): void => {
    refreshDesktopViewportWidth();
    refreshDesktopNavMeasurements();
    updateDesktopProfileAvatarSize(true);
  };

  onMounted(() => {
    refreshDesktopViewportWidth();
    refreshDesktopNavMeasurements();

    if (typeof ResizeObserver !== 'undefined') {
      desktopNavResizeObserver = new ResizeObserver(() => {
        refreshDesktopNavMeasurements();
      });
      [
        desktopNavElement.value,
        desktopNavLeftElement.value,
        desktopNavRightElement.value,
      ].forEach((element) => {
        if (element !== undefined) {
          desktopNavResizeObserver?.observe(element);
        }
      });
    }

    void nextTick(() => {
      updateDesktopProfileAvatarSize();

      if (
        typeof ResizeObserver !== 'undefined' &&
        desktopProfileAvatarElement.value !== undefined
      ) {
        desktopProfileAvatarResizeObserver = new ResizeObserver(() => {
          updateDesktopProfileAvatarSize();
        });
        desktopProfileAvatarResizeObserver.observe(
          desktopProfileAvatarElement.value,
        );
      }
    });

    window.addEventListener('resize', handleDesktopWindowResize);
    window.visualViewport?.addEventListener('resize', handleDesktopWindowResize);
  });

  onUnmounted(() => {
    desktopNavResizeObserver?.disconnect();
    desktopProfileAvatarResizeObserver?.disconnect();
    window.removeEventListener('resize', handleDesktopWindowResize);
    window.visualViewport?.removeEventListener('resize', handleDesktopWindowResize);
  });

  const importJsonFile = async (event: Event): Promise<void> => {
    await homePage.importJsonFile(event);
    await chrome.refreshUsers();
    chrome.closeUserActionModal();
  };

  return {
    ...chrome,
    ...homePage,
    desktopLayout: DESKTOP_HOME_LAYOUT,
    desktopDateStyle,
    desktopDateTimeStyle,
    desktopNavElement,
    desktopNavLeftElement,
    desktopNavRightElement,
    desktopNavLeftStyle,
    desktopNavRightStyle,
    desktopNavStyle,
    desktopProfileAvatarElement,
    desktopProfileAvatarStyle,
    desktopProfileJsonActionStyle,
    desktopTimeStyle,
    desktopFullScreenOverlayPrimaryStyle,
    desktopFullScreenOverlaySecondaryStyle,
    desktopFullScreenOverlayStyle,
    desktopUserMenuStyle,
    helpContent: HELP_CONTENT,
    importJsonFile,
  };
};
