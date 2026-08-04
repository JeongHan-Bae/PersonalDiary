<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { CSSProperties } from 'vue';

import { useFittedTextStyle } from '@/app/components/useFittedTextStyle';
import type { SelectOptionViewModel } from '@/presentation/formControlViewModels';
import {
  DROPDOWN_LABELS,
  DROPDOWN_MEASUREMENT,
  FITTED_TEXT_MEASUREMENT,
} from '@/constants/visualConstants';

const props = withDefaults(
  defineProps<{
    label: string;
    mode: 'single' | 'multiple';
    options: SelectOptionViewModel[];
    selectedId?: string;
    selectedIds?: string[];
    placeholder?: string;
    emptyLabel?: string;
    disabled?: boolean;
    labelPlacement?: 'top' | 'left';
    labelInsetRatio?: number;
    labelDefaultFontPx?: number;
    fitLabel?: boolean;
    controlClass?: string;
    size?: 'regular' | 'compact';
  }>(),
  {
    placeholder: DROPDOWN_LABELS.placeholder,
    emptyLabel: DROPDOWN_LABELS.emptyLabel,
    disabled: false,
    labelPlacement: 'top',
    labelInsetRatio: 0,
    labelDefaultFontPx: FITTED_TEXT_MEASUREMENT.labelDefaultFontPx,
    fitLabel: true,
    controlClass: '',
    size: 'regular',
  },
);

const emit = defineEmits<{
  (event: 'update:selectedId', value: string): void;
  (event: 'update:selectedIds', value: string[]): void;
}>();

const root = ref<HTMLElement>();
const labelElement = ref<HTMLElement>();
const control = ref<HTMLElement>();
const isOpen = ref(false);
const dropdownDirection = ref<'down' | 'up'>('down');
const rootWidth = ref(0);
const controlWidth = ref(0);
let rootResizeObserver: ResizeObserver | undefined;
let controlResizeObserver: ResizeObserver | undefined;
let textMeasureCanvas: HTMLCanvasElement | undefined;

const measureTextWidth = (text: string, font: string): number => {
  if (typeof document === 'undefined') {
    return text.length * DROPDOWN_MEASUREMENT.fallbackCharacterWidthPx;
  }

  textMeasureCanvas ??= document.createElement('canvas');
  const context = textMeasureCanvas.getContext('2d');

  if (context === null) {
    return text.length * DROPDOWN_MEASUREMENT.fallbackCharacterWidthPx;
  }

  context.font = font;

  return context.measureText(text).width;
};

const selectedIds = computed(() => props.selectedIds ?? []);
const labelText = computed(() => props.label);
const { textStyle: fittedLabelTextStyle } = useFittedTextStyle(labelElement, {
  text: labelText,
  defaultFontPx: props.labelDefaultFontPx,
  minFontPx: FITTED_TEXT_MEASUREMENT.labelMinFontPx,
});
const baseLabelTextStyle = computed<CSSProperties>(() => ({
  fontSize: `${props.labelDefaultFontPx}px`,
}));

const selectedLabel = computed(() => {
  if (props.mode === 'single') {
    return (
      props.options.find((option) => option.id === props.selectedId)?.label ??
      props.placeholder
    );
  }

  const labels = props.options
    .filter((option) => selectedIds.value.includes(option.id))
    .map((option) => option.label);

  if (labels.length === 0) {
    return props.emptyLabel;
  }

  if (labels.length === props.options.length) {
    return DROPDOWN_LABELS.allSelected;
  }

  if (labels.length <= DROPDOWN_LABELS.maxInlineSelectedLabels) {
    return labels.join(', ');
  }

  const excludedOptions = props.options.filter(
    (option) => !selectedIds.value.includes(option.id),
  );

  if (
    props.options.length > DROPDOWN_LABELS.preferExceptMinOptionCount &&
    labels.length > excludedOptions.length
  ) {
    return `${DROPDOWN_LABELS.exceptPrefix} ${excludedOptions
      .map((option) => option.label)
      .join(', ')}`;
  }

  return `${labels.length} ${DROPDOWN_LABELS.selectedSuffix}`;
});

const isSelected = (optionId: string): boolean => {
  if (props.mode === 'single') {
    return props.selectedId === optionId;
  }

  return selectedIds.value.includes(optionId);
};

const maxOptionLabelWidth = computed(() => {
  const font =
    props.size === 'compact'
      ? DROPDOWN_MEASUREMENT.compactOptionFont
      : DROPDOWN_MEASUREMENT.regularOptionFont;

  return Math.max(
    0,
    ...props.options.map((option) => measureTextWidth(option.label, font)),
  );
});

const optionWidthWithMarker = computed(
  () =>
    maxOptionLabelWidth.value +
    DROPDOWN_MEASUREMENT.menuHorizontalPaddingPx +
    DROPDOWN_MEASUREMENT.optionHorizontalPaddingPx +
    DROPDOWN_MEASUREMENT.optionMarkerWidthPx +
    DROPDOWN_MEASUREMENT.optionMarkerGapPx,
);

const shouldShowOptionMarkers = computed(
  () =>
    controlWidth.value === 0 ||
    optionWidthWithMarker.value <= controlWidth.value,
);

const labelStyle = computed<CSSProperties>(() => {
  const baseStyle = props.fitLabel
    ? fittedLabelTextStyle.value
    : baseLabelTextStyle.value;

  if (props.labelPlacement === 'left' || props.labelInsetRatio <= 0) {
    return baseStyle;
  }

  const labelWidth = measureTextWidth(
    props.label,
    DROPDOWN_MEASUREMENT.labelFont,
  );
  const inset = Math.min(
    DROPDOWN_MEASUREMENT.maxLabelInsetPx,
    Math.max(0, (rootWidth.value - labelWidth) * props.labelInsetRatio),
  );

  return {
    ...baseStyle,
    paddingLeft: `${inset}px`,
  };
});

const dropdownMenuStyle = computed<CSSProperties>(() => ({
  zIndex: DROPDOWN_MEASUREMENT.menuLayerZIndex,
  maxHeight: `${DROPDOWN_MEASUREMENT.maxMenuHeightPx}px`,
  ...(dropdownDirection.value === 'up'
    ? { bottom: DROPDOWN_MEASUREMENT.menuOffset }
    : { top: DROPDOWN_MEASUREMENT.menuOffset }),
}));

const toggleOpen = (): void => {
  if (props.disabled) {
    return;
  }

  if (props.mode === 'multiple' && props.options.length === 0) {
    isOpen.value = false;
    return;
  }

  if (!isOpen.value && root.value !== undefined) {
    const rect = root.value.getBoundingClientRect();
    const optionHeight =
      props.size === 'compact'
        ? DROPDOWN_MEASUREMENT.compactOptionHeightPx
        : DROPDOWN_MEASUREMENT.regularOptionHeightPx;
    const menuHeight = Math.min(
      DROPDOWN_MEASUREMENT.maxMenuHeightPx,
      props.options.length * optionHeight +
        DROPDOWN_MEASUREMENT.menuVerticalPaddingPx,
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    dropdownDirection.value =
      spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'up' : 'down';
  }

  isOpen.value = !isOpen.value;
};

const selectOption = (optionId: string): void => {
  if (props.mode === 'single') {
    emit('update:selectedId', optionId);
    isOpen.value = false;
    return;
  }

  const nextSelectedIds = isSelected(optionId)
    ? selectedIds.value.filter((selectedId) => selectedId !== optionId)
    : [...selectedIds.value, optionId];

  emit('update:selectedIds', nextSelectedIds);
};

const handleDocumentPointerDown = (event: PointerEvent): void => {
  const target = event.target;

  if (!(target instanceof Node) || root.value?.contains(target) === true) {
    return;
  }

  isOpen.value = false;
};

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown);

  if (root.value !== undefined && typeof ResizeObserver !== 'undefined') {
    rootWidth.value = root.value.getBoundingClientRect().width;
    rootResizeObserver = new ResizeObserver(([entry]) => {
      if (entry === undefined) {
        return;
      }

      rootWidth.value = entry.contentRect.width;
    });
    rootResizeObserver.observe(root.value);
  }

  if (control.value !== undefined && typeof ResizeObserver !== 'undefined') {
    controlWidth.value = control.value.getBoundingClientRect().width;
    controlResizeObserver = new ResizeObserver(([entry]) => {
      if (entry === undefined) {
        return;
      }

      controlWidth.value = entry.contentRect.width;
    });
    controlResizeObserver.observe(control.value);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown);
  rootResizeObserver?.disconnect();
  controlResizeObserver?.disconnect();
});
</script>

<template>
  <div
    ref="root"
    class="relative min-w-0"
    :class="labelPlacement === 'left' ? 'flex items-center gap-3' : ''"
  >
    <p
      ref="labelElement"
      class="shrink-0 overflow-hidden whitespace-nowrap font-medium text-mutedText"
      :class="labelPlacement === 'left' ? '' : 'mb-2'"
      :style="labelStyle"
    >
      {{ label }}
    </p>
    <div ref="control" class="relative min-w-0 flex-1" :class="controlClass">
      <button
        class="flex w-full items-center justify-between gap-3 rounded-lg border border-borderBase bg-panel text-left text-titleText disabled:cursor-not-allowed disabled:opacity-50"
        :class="size === 'compact' ? 'h-9 px-2 text-xs' : 'h-11 px-3 text-sm'"
        type="button"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :disabled="disabled"
        @click="toggleOpen"
      >
        <span class="min-w-0 truncate">{{ selectedLabel }}</span>
        <span
          aria-hidden="true"
          class="h-2 w-2 shrink-0 rotate-45 border-b-2 border-r-2 border-mutedText"
        />
      </button>

      <div
        v-if="isOpen && options.length > 0"
        class="absolute left-0 w-full overflow-y-auto rounded-lg border border-borderBase bg-panel p-2"
        :style="dropdownMenuStyle"
        role="listbox"
        :aria-multiselectable="mode === 'multiple'"
      >
        <button
          v-for="option in options"
          :key="option.id"
          class="flex w-full items-start rounded-lg text-left hover:bg-panelMuted"
          :class="[
            size === 'compact' ? 'py-1.5' : 'py-2',
            shouldShowOptionMarkers ? 'gap-3 px-3' : 'gap-0 px-2',
            !shouldShowOptionMarkers && isSelected(option.id) ? 'bg-panelMuted' : '',
          ]"
          type="button"
          role="option"
          :aria-selected="isSelected(option.id)"
          @click="selectOption(option.id)"
        >
          <input
            v-if="mode === 'multiple' && shouldShowOptionMarkers"
            class="pointer-events-none mt-1 h-4 w-4"
            type="checkbox"
            :checked="isSelected(option.id)"
            tabindex="-1"
            readonly
          />
          <span
            v-else-if="shouldShowOptionMarkers"
            class="mt-1 h-3 w-3 rounded-full border border-borderBase"
            :class="isSelected(option.id) ? 'bg-accent' : 'bg-panel'"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1">
            <span class="block font-medium text-titleText" :class="size === 'compact' ? 'text-xs' : 'text-sm'">
              {{ option.label }}
            </span>
            <span
              v-if="option.description"
              class="mt-1 block text-xs leading-5 text-mutedText"
            >
              {{ option.description }}
            </span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
