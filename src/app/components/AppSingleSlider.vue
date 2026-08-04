<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import type { CSSProperties } from 'vue';
import {
  CSS_LENGTHS,
  PERCENT_FULL,
  RANGE_CONTROL_LABELS,
} from '@/constants/visualConstants';

const props = defineProps<{
  min: number;
  max: number;
  modelValue: number;
  label: string;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void;
}>();

const track = ref<HTMLElement>();
const isDragging = ref(false);

const valueRange = computed(() => props.max - props.min);

const valuePercent = computed(() =>
  valueRange.value <= 0
    ? 0
    : ((props.modelValue - props.min) / valueRange.value) * PERCENT_FULL,
);

const valuePercentLength = computed(
  () => `${valuePercent.value}${CSS_LENGTHS.percentUnit}`,
);

const fillStyle = computed<CSSProperties>(() => ({
  width: valuePercentLength.value,
}));

const thumbStyle = computed<CSSProperties>(() => ({
  left: valuePercentLength.value,
}));

const valueThumbAriaLabel = computed(
  () => `${props.label} ${RANGE_CONTROL_LABELS.valueAriaSuffix}`,
);

const clampValue = (value: number): number =>
  Math.min(props.max, Math.max(props.min, Math.round(value)));

const getValueFromPointer = (clientX: number): number => {
  const rect = track.value?.getBoundingClientRect();

  if (rect === undefined || rect.width === 0 || valueRange.value <= 0) {
    return props.min;
  }

  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));

  return clampValue(props.min + ratio * valueRange.value);
};

const updateValue = (event: PointerEvent): void => {
  emit('update:modelValue', getValueFromPointer(event.clientX));
};

const stopDrag = (): void => {
  isDragging.value = false;
  window.removeEventListener('pointermove', updateValue);
  window.removeEventListener('pointerup', stopDrag);
};

const startDrag = (event: PointerEvent): void => {
  isDragging.value = true;
  updateValue(event);
  window.addEventListener('pointermove', updateValue);
  window.addEventListener('pointerup', stopDrag);
};

onBeforeUnmount(() => {
  stopDrag();
});
</script>

<template>
  <div class="relative select-none text-current">
    <div class="flex items-center justify-between gap-3 text-typo-tiny text-current/70">
      <span>{{ label }}</span>
      <span class="shrink-0 text-current">{{ modelValue }}/{{ max }}</span>
    </div>
    <div
      ref="track"
      class="relative mx-2 mt-1 h-5 cursor-pointer"
      role="slider"
      :aria-label="label"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
      @pointerdown="startDrag"
    >
      <div class="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-borderBase" />
      <div
        class="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
        :style="fillStyle"
      />
      <button
        class="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-accent"
        type="button"
        :style="thumbStyle"
        :aria-label="valueThumbAriaLabel"
        @pointerdown.stop="startDrag"
      />
    </div>
    <div class="flex items-center justify-between px-2 text-typo-tiny text-current/70">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>
