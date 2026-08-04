import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { CSSProperties, Ref } from 'vue';
import { FITTED_TEXT_MEASUREMENT } from '@/constants/visualConstants';

export type FittedTextOptions = {
  text: Ref<string>;
  defaultFontPx: number;
  minFontPx: number;
  fontWeight?: number;
  horizontalPaddingPx?: number;
};

let textMeasureCanvas: HTMLCanvasElement | undefined;

const measureTextWidth = (
  text: string,
  fontSizePx: number,
  fontWeight: number,
): number => {
  if (typeof document === 'undefined') {
    return text.length * FITTED_TEXT_MEASUREMENT.fallbackCharacterWidthPx;
  }

  textMeasureCanvas ??= document.createElement('canvas');
  const context = textMeasureCanvas.getContext('2d');

  if (context === null) {
    return text.length * FITTED_TEXT_MEASUREMENT.fallbackCharacterWidthPx;
  }

  context.font = `${fontWeight} ${fontSizePx}px ${FITTED_TEXT_MEASUREMENT.fontFamily}`;

  return context.measureText(text).width;
};

export const useFittedTextStyle = (
  element: Ref<HTMLElement | undefined>,
  options: FittedTextOptions,
) => {
  const elementWidth = ref(0);
  let resizeObserver: ResizeObserver | undefined;

  const fontSizePx = computed(() => {
    if (elementWidth.value <= 0) {
      return options.defaultFontPx;
    }

    const fontWeight =
      options.fontWeight ?? FITTED_TEXT_MEASUREMENT.fontWeightMedium;
    const reservedWidth =
      (options.horizontalPaddingPx ?? 0) +
      FITTED_TEXT_MEASUREMENT.safetyInsetPx;
    const availableWidth = Math.max(0, elementWidth.value - reservedWidth);
    const textWidth = measureTextWidth(
      options.text.value,
      options.defaultFontPx,
      fontWeight,
    );

    if (textWidth <= availableWidth || textWidth === 0) {
      return options.defaultFontPx;
    }

    return Math.max(
      options.minFontPx,
      Math.floor((availableWidth / textWidth) * options.defaultFontPx),
    );
  });

  const textStyle = computed<CSSProperties>(() => ({
    fontSize: `${fontSizePx.value}px`,
  }));

  onMounted(() => {
    if (element.value === undefined || typeof ResizeObserver === 'undefined') {
      elementWidth.value = element.value?.getBoundingClientRect().width ?? 0;
      return;
    }

    elementWidth.value = element.value.getBoundingClientRect().width;
    resizeObserver = new ResizeObserver(([entry]) => {
      if (entry !== undefined) {
        elementWidth.value = entry.contentRect.width;
      }
    });
    resizeObserver.observe(element.value);
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
  });

  return {
    textStyle,
  };
};
