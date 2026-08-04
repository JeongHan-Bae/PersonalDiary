import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  type ComputedRef,
  type CSSProperties,
} from 'vue';

export interface FixedCanvasSize {
  width: number;
  height: number;
}

export type FixedCanvasFitMode = 'cover' | 'contain';

export interface FixedCanvasScaleOptions {
  fitMode?: FixedCanvasFitMode;
}

export interface FixedCanvasScaleState {
  scale: ComputedRef<number>;
  viewportStyle: ComputedRef<CSSProperties>;
  canvasStyle: ComputedRef<CSSProperties>;
}

const getViewportSize = (): {
  width: number;
  height: number;
} => {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
    };
  }

  return {
    width: window.visualViewport?.width ?? window.innerWidth,
    height: window.visualViewport?.height ?? window.innerHeight,
  };
};

export const useFixedCanvasScale = (
  canvas: FixedCanvasSize,
  options: FixedCanvasScaleOptions = {},
): FixedCanvasScaleState => {
  const initialViewportSize = getViewportSize();
  const availableWidth = ref(initialViewportSize.width || canvas.width);
  const availableHeight = ref(initialViewportSize.height || canvas.height);
  const fitMode = options.fitMode ?? 'cover';

  const updateAvailableSize = (): void => {
    const viewportSize = getViewportSize();
    availableWidth.value = viewportSize.width;
    availableHeight.value = viewportSize.height;
  };

  onMounted(() => {
    updateAvailableSize();
    window.addEventListener('resize', updateAvailableSize);
    window.visualViewport?.addEventListener('resize', updateAvailableSize);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateAvailableSize);
    window.visualViewport?.removeEventListener('resize', updateAvailableSize);
  });

  const scale = computed(() => {
    const widthScale = availableWidth.value / canvas.width;
    const heightScale = availableHeight.value / canvas.height;

    return fitMode === 'cover'
      ? Math.max(widthScale, heightScale)
      : Math.min(widthScale, heightScale);
  });

  const viewportStyle = computed<CSSProperties>(() => ({
    width: '100dvw',
    height: '100dvh',
  }));

  const canvasStyle = computed<CSSProperties>(() => ({
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: `${canvas.width}px`,
    height: `${canvas.height}px`,
    transform: `translate(-50%, -50%) scale(${scale.value})`,
  }));

  return {
    scale,
    viewportStyle,
    canvasStyle,
  };
};
