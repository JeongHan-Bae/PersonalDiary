<script setup lang="ts">
import { computed, type ComponentPublicInstance, type CSSProperties } from 'vue';
import type { RangePointerPayload, RangeThumb } from '@/app/components/rangeTypes';
import {
  CSS_LENGTHS,
  RANGE_CONTROL_LABELS,
} from '@/constants/visualConstants';

const props = withDefaults(defineProps<{
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  minPercent: number;
  maxPercent: number;
  label: string;
  density?: 'regular' | 'compact';
  mode: 'interactive' | 'display';
  showBounds?: boolean;
  controlGridClass?: string;
  controlGridStyle?: CSSProperties;
}>(), {
  density: 'regular',
  showBounds: true,
});

const emit = defineEmits<{
  (event: 'track-pointerdown', payload: RangePointerPayload): void;
  (event: 'thumb-pointerdown', payload: RangePointerPayload): void;
}>();

const minPercentLength = computed(
  () => `${props.minPercent}${CSS_LENGTHS.percentUnit}`,
);

const maxPercentLength = computed(
  () => `${props.maxPercent}${CSS_LENGTHS.percentUnit}`,
);

const selectedRangeStyle = computed<CSSProperties>(() => ({
  left: minPercentLength.value,
  width: `${props.maxPercent - props.minPercent}${CSS_LENGTHS.percentUnit}`,
}));

const minThumbStyle = computed<CSSProperties>(() => ({
  left: minPercentLength.value,
}));

const maxThumbStyle = computed<CSSProperties>(() => ({
  left: maxPercentLength.value,
}));

const rangeValueAriaText = computed(
  () =>
    `${props.minValue} ${RANGE_CONTROL_LABELS.valueRangeSeparator} ${props.maxValue}`,
);

const minThumbAriaLabel = computed(
  () => `${props.label} ${RANGE_CONTROL_LABELS.minimumAriaSuffix}`,
);

const maxThumbAriaLabel = computed(
  () => `${props.label} ${RANGE_CONTROL_LABELS.maximumAriaSuffix}`,
);

let trackElement: HTMLElement | undefined;

const setTrackElement = (
  element: Element | ComponentPublicInstance | null,
): void => {
  trackElement = element instanceof HTMLElement ? element : undefined;
};

const handleTrackPointerDown = (event: PointerEvent): void => {
  if (props.mode === 'interactive') {
    emit('track-pointerdown', { event, trackElement });
  }
};

const handleThumbPointerDown = (thumb: RangeThumb, event: PointerEvent): void => {
  if (props.mode === 'interactive') {
    emit('thumb-pointerdown', { event, trackElement, thumb });
  }
};
</script>

<template>
  <div class="relative select-none text-current">
    <div
      class="flex items-center justify-between text-current/70"
      :class="props.density === 'compact' ? 'gap-1 text-typo-micro' : 'gap-3 text-typo-tiny'"
    >
      <span>{{ props.label }}</span>
      <span class="shrink-0 text-current">{{ props.minValue }}-{{ props.maxValue }}</span>
    </div>
    <div
      class="grid items-center"
      :class="[$slots.sideControl ? 'gap-2' : '', props.controlGridClass]"
      :style="props.controlGridStyle"
    >
      <div
        :ref="setTrackElement"
        class="relative"
        :class="[
          props.mode === 'interactive' ? 'cursor-pointer' : 'cursor-default',
          props.density === 'compact' ? 'mx-1 mt-0.5 h-4' : 'mx-2 mt-1 h-5',
        ]"
        :role="props.mode === 'interactive' ? 'slider' : 'img'"
        :aria-label="props.label"
        :aria-valuemin="props.mode === 'interactive' ? props.min : undefined"
        :aria-valuemax="props.mode === 'interactive' ? props.max : undefined"
        :aria-valuetext="rangeValueAriaText"
        @pointerdown="handleTrackPointerDown"
      >
        <div class="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-borderBase" />
        <div
          class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
          :style="selectedRangeStyle"
        />
        <button
          v-if="props.mode === 'interactive'"
          class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-accent"
          :class="props.density === 'compact' ? 'h-2.5 w-2.5' : 'h-3 w-3'"
          type="button"
          :style="minThumbStyle"
          :aria-label="minThumbAriaLabel"
          @pointerdown.stop="handleThumbPointerDown('min', $event)"
        />
        <span
          v-else
          class="absolute top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-accent"
          :class="props.density === 'compact' ? 'h-2.5 w-2.5' : 'h-3 w-3'"
          :style="minThumbStyle"
          aria-hidden="true"
        />
        <button
          v-if="props.mode === 'interactive'"
          class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-accent"
          :class="props.density === 'compact' ? 'h-2.5 w-2.5' : 'h-3 w-3'"
          type="button"
          :style="maxThumbStyle"
          :aria-label="maxThumbAriaLabel"
          @pointerdown.stop="handleThumbPointerDown('max', $event)"
        />
        <span
          v-else
          class="absolute top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-accent"
          :class="props.density === 'compact' ? 'h-2.5 w-2.5' : 'h-3 w-3'"
          :style="maxThumbStyle"
          aria-hidden="true"
        />
      </div>
      <slot name="sideControl" />
    </div>
    <div
      v-if="props.showBounds"
      class="grid text-current/70"
      :class="[
        props.density === 'compact' ? 'px-1 text-typo-micro' : 'px-2 text-typo-tiny',
        props.controlGridClass,
      ]"
      :style="props.controlGridStyle"
    >
      <div class="flex items-center justify-between">
        <span>{{ props.minValue }}</span>
        <span>{{ props.maxValue }}</span>
      </div>
      <span v-if="$slots.sideControl" aria-hidden="true" />
    </div>
  </div>
</template>
