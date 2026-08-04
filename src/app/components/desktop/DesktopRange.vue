<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import RangeBase from '@/app/components/RangeBase.vue';
import type { RangePointerPayload, RangeThumb } from '@/app/components/rangeTypes';
import { PERCENT_FULL } from '@/constants/visualConstants';

const props = withDefaults(defineProps<{
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  label: string;
  density?: 'regular' | 'compact';
}>(), {
  density: 'regular',
});

const emit = defineEmits<{
  (event: 'update:minValue', value: number): void;
  (event: 'update:maxValue', value: number): void;
}>();

const activeThumb = ref<'min' | 'max'>();

const valueRange = computed(() => props.max - props.min);

const minPercent = computed(() =>
  ((props.minValue - props.min) / valueRange.value) * PERCENT_FULL,
);

const maxPercent = computed(() =>
  ((props.maxValue - props.min) / valueRange.value) * PERCENT_FULL,
);

const clampValue = (value: number): number =>
  Math.min(props.max, Math.max(props.min, Math.round(value)));

const getValueFromPointer = (
  clientX: number,
  trackElement: HTMLElement | undefined,
): number => {
  const rect = trackElement?.getBoundingClientRect();

  if (rect === undefined || rect.width === 0) {
    return props.min;
  }

  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));

  return clampValue(props.min + ratio * valueRange.value);
};

let activeTrackElement: HTMLElement | undefined;

const updateThumb = (clientX: number): void => {
  const nextValue = getValueFromPointer(clientX, activeTrackElement);

  if (activeThumb.value === 'min') {
    emit('update:minValue', Math.min(nextValue, props.maxValue));
    return;
  }

  if (activeThumb.value === 'max') {
    emit('update:maxValue', Math.max(nextValue, props.minValue));
  }
};

const stopDrag = (): void => {
  activeThumb.value = undefined;
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', stopDrag);
};

const handlePointerMove = (event: PointerEvent): void => {
  updateThumb(event.clientX);
};

const startDrag = (
  thumb: RangeThumb,
  event: PointerEvent,
  trackElement: HTMLElement | undefined,
): void => {
  activeTrackElement = trackElement;
  activeThumb.value = thumb;
  updateThumb(event.clientX);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', stopDrag);
};

const startNearestThumbDrag = (payload: RangePointerPayload): void => {
  const nextValue = getValueFromPointer(payload.event.clientX, payload.trackElement);
  const minDistance = Math.abs(nextValue - props.minValue);
  const maxDistance = Math.abs(nextValue - props.maxValue);

  startDrag(
    minDistance <= maxDistance ? 'min' : 'max',
    payload.event,
    payload.trackElement,
  );
};

const startThumbDrag = (payload: RangePointerPayload): void => {
  if (payload.thumb !== undefined) {
    startDrag(payload.thumb, payload.event, payload.trackElement);
  }
};

onBeforeUnmount(() => {
  stopDrag();
});
</script>

<template>
  <RangeBase
    mode="interactive"
    :density="density ?? 'regular'"
    :label="label"
    :max="max"
    :max-percent="maxPercent"
    :max-value="maxValue"
    :min="min"
    :min-percent="minPercent"
    :min-value="minValue"
    @track-pointerdown="startNearestThumbDrag"
    @thumb-pointerdown="startThumbDrag"
  />
</template>
