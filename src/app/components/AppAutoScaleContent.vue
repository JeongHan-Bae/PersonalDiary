<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import {
  AUTO_SCALE_CONTENT_DEFAULT_MIN_SCALE,
  AUTO_SCALE_CONTENT_LIMITS,
  PERCENT_FULL,
} from '@/constants/visualConstants';

const props = withDefaults(defineProps<{
  minScale?: number;
  fitMode?: 'both' | 'width' | 'height';
  overflowMode?: 'managed' | 'visible';
}>(), {
  minScale: AUTO_SCALE_CONTENT_DEFAULT_MIN_SCALE,
  fitMode: 'both',
  overflowMode: 'managed',
});

const viewportRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const contentHeight = ref(1);
const contentWidth = ref(1);
const viewportHeight = ref(0);
const viewportWidth = ref(0);
const scale = ref(1);

let viewportResizeObserver: ResizeObserver | null = null;
let contentResizeObserver: ResizeObserver | null = null;

const normalizedMinScale = computed(() =>
  Math.min(
    AUTO_SCALE_CONTENT_LIMITS.maxScale,
    Math.max(AUTO_SCALE_CONTENT_LIMITS.minScaleFloor, props.minScale),
  ),
);

const frameStyle = computed(() => ({
  height: `${Math.ceil(contentHeight.value * scale.value)}px`,
}));

const surfaceStyle = computed<CSSProperties>(() => ({
  transform: `scale(${scale.value})`,
  transformOrigin: 'top left',
  width:
    props.fitMode === 'width'
      ? 'max-content'
      : `${PERCENT_FULL / scale.value}%`,
}));

const viewportStyle = computed<CSSProperties>(() => ({
  overflowX: props.overflowMode === 'visible' ? 'visible' : 'hidden',
  overflowY:
    props.overflowMode === 'visible'
      ? 'visible'
      : contentHeight.value * scale.value > viewportHeight.value + 1
      ? 'auto'
      : 'hidden',
}));

function measure(): void {
  const viewport = viewportRef.value;
  const content = contentRef.value;

  if (viewport === null || content === null) {
    return;
  }

  const nextContentHeight = Math.max(content.scrollHeight, content.offsetHeight, 1);
  const nextContentWidth = Math.max(content.scrollWidth, content.offsetWidth, 1);
  const availableHeight = viewport.clientHeight;
  const availableWidth = viewport.clientWidth;
  contentHeight.value = nextContentHeight;
  contentWidth.value = nextContentWidth;
  viewportHeight.value = availableHeight;
  viewportWidth.value = availableWidth;

  if (availableHeight <= 0 || availableWidth <= 0) {
    scale.value = AUTO_SCALE_CONTENT_LIMITS.maxScale;
    return;
  }

  if (
    nextContentHeight <= availableHeight &&
    nextContentWidth <= availableWidth
  ) {
    scale.value = AUTO_SCALE_CONTENT_LIMITS.maxScale;
    return;
  }

  const heightFitScale = availableHeight / nextContentHeight;
  const widthFitScale = availableWidth / nextContentWidth;
  const fitScale =
    props.fitMode === 'width'
      ? widthFitScale
      : props.fitMode === 'height'
      ? heightFitScale
      : Math.min(heightFitScale, widthFitScale);
  scale.value = Math.max(
    normalizedMinScale.value,
    Math.min(AUTO_SCALE_CONTENT_LIMITS.maxScale, fitScale),
  );
}

onMounted(async () => {
  await nextTick();
  measure();

  if (typeof ResizeObserver === 'undefined') {
    return;
  }

  if (viewportRef.value !== null) {
    viewportResizeObserver = new ResizeObserver(() => {
      measure();
    });
    viewportResizeObserver.observe(viewportRef.value);
  }

  if (contentRef.value !== null) {
    contentResizeObserver = new ResizeObserver(() => {
      measure();
    });
    contentResizeObserver.observe(contentRef.value);
  }
});

watch(
  () => props.minScale,
  () => {
    measure();
  },
);

onBeforeUnmount(() => {
  viewportResizeObserver?.disconnect();
  contentResizeObserver?.disconnect();
  viewportResizeObserver = null;
  contentResizeObserver = null;
});
</script>

<template>
  <div ref="viewportRef" class="h-full min-h-0" :style="viewportStyle">
    <div class="relative w-full" :style="frameStyle">
      <div ref="contentRef" class="absolute left-0 top-0 origin-top-left" :style="surfaceStyle">
        <slot />
      </div>
    </div>
  </div>
</template>
