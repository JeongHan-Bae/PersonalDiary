<script setup lang="ts">
import { computed, ref } from 'vue';
import type { CSSProperties } from 'vue';
import RangeBase from '@/app/components/RangeBase.vue';
import { useFittedTextStyle } from '@/app/components/useFittedTextStyle';
import {
  FITTED_TEXT_MEASUREMENT,
  PERCENT_FULL,
  RANGE_CONTROL_LABELS,
  RANGE_CONTROL_LAYOUT,
} from '@/constants/visualConstants';

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

const isEditorOpen = ref(false);
const draftMinValue = ref(props.minValue);
const draftMaxValue = ref(props.maxValue);
const modifyButton = ref<HTMLElement>();
const modifyLabel = computed(() => RANGE_CONTROL_LABELS.modify);
const editorDialogLabel = computed(
  () => `${props.label} ${RANGE_CONTROL_LABELS.editorDialogSuffix}`,
);
const mobileRangeEditorStyle = {
  zIndex: RANGE_CONTROL_LAYOUT.mobileEditorLayerZIndex,
} satisfies CSSProperties;

const valueRange = computed(() => props.max - props.min);

const { textStyle: modifyTextStyle } = useFittedTextStyle(modifyButton, {
  text: modifyLabel,
  defaultFontPx: FITTED_TEXT_MEASUREMENT.buttonDefaultFontPx,
  minFontPx: FITTED_TEXT_MEASUREMENT.buttonMinFontPx,
  horizontalPaddingPx: RANGE_CONTROL_LAYOUT.mobileModifyButtonHorizontalPaddingPx,
});

const minPercent = computed(() =>
  ((props.minValue - props.min) / valueRange.value) * PERCENT_FULL,
);

const maxPercent = computed(() =>
  ((props.maxValue - props.min) / valueRange.value) * PERCENT_FULL,
);

const clampValue = (value: number): number =>
  Math.min(props.max, Math.max(props.min, Math.round(value)));

const openEditor = (): void => {
  draftMinValue.value = props.minValue;
  draftMaxValue.value = props.maxValue;
  isEditorOpen.value = true;
};

const closeEditor = (): void => {
  isEditorOpen.value = false;
};

const applyEditor = (): void => {
  const nextMin = clampValue(draftMinValue.value);
  const nextMax = clampValue(draftMaxValue.value);

  emit('update:minValue', Math.min(nextMin, nextMax));
  emit('update:maxValue', Math.max(nextMin, nextMax));
  closeEditor();
};
</script>

<template>
  <div class="relative select-none text-current" @contextmenu.prevent>
    <RangeBase
      mode="display"
      :show-bounds="false"
      control-grid-class="mobile-range-control-grid"
      :density="density ?? 'regular'"
      :label="label"
      :max="max"
      :max-percent="maxPercent"
      :max-value="maxValue"
      :min="min"
      :min-percent="minPercent"
      :min-value="minValue"
    >
      <template #sideControl>
      <button
        ref="modifyButton"
        class="h-7 overflow-hidden whitespace-nowrap rounded-lg border border-borderBase bg-panel px-1 text-center font-medium text-titleText"
        type="button"
        :style="modifyTextStyle"
        @click="openEditor"
      >
        {{ modifyLabel }}
      </button>
      </template>
    </RangeBase>

    <div
      v-if="isEditorOpen"
      class="mobile-range-editor fixed inset-x-4 rounded-lg border border-borderBase bg-panel p-4 text-titleText"
      :style="mobileRangeEditorStyle"
      role="dialog"
      aria-modal="true"
      :aria-label="editorDialogLabel"
    >
      <p class="text-sm font-semibold">{{ label }}</p>
      <div class="mt-3 grid grid-cols-2 gap-3">
        <label class="block">
          <span class="mb-2 block text-xs text-mutedText">{{ RANGE_CONTROL_LABELS.start }}</span>
          <input
            v-model.number="draftMinValue"
            class="h-10 w-full rounded-lg border border-borderBase bg-surface px-3 text-sm outline-none focus:border-accent"
            type="number"
            :min="min"
            :max="max"
          />
        </label>
        <label class="block">
          <span class="mb-2 block text-xs text-mutedText">{{ RANGE_CONTROL_LABELS.end }}</span>
          <input
            v-model.number="draftMaxValue"
            class="h-10 w-full rounded-lg border border-borderBase bg-surface px-3 text-sm outline-none focus:border-accent"
            type="number"
            :min="min"
            :max="max"
          />
        </label>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <button
          class="h-10 rounded-lg border border-borderBase px-4 text-sm"
          type="button"
          @click="closeEditor"
        >
          {{ RANGE_CONTROL_LABELS.cancel }}
        </button>
        <button
          class="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-inverseText"
          type="button"
          @click="applyEditor"
        >
          {{ RANGE_CONTROL_LABELS.apply }}
        </button>
      </div>
    </div>
  </div>
</template>
