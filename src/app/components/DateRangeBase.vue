<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFittedTextStyle } from '@/app/components/useFittedTextStyle';
import { FITTED_TEXT_MEASUREMENT } from '@/constants/visualConstants';

const props = defineProps<{
  label: string;
}>();

const labelElement = ref<HTMLElement>();
const labelText = computed(() => props.label);
const { textStyle: labelStyle } = useFittedTextStyle(labelElement, {
  text: labelText,
  defaultFontPx: FITTED_TEXT_MEASUREMENT.labelDefaultFontPx,
  minFontPx: FITTED_TEXT_MEASUREMENT.labelMinFontPx,
});
</script>

<template>
  <label class="block min-w-0">
    <span
      ref="labelElement"
      class="mb-2 block overflow-hidden whitespace-nowrap font-medium text-mutedText"
      :style="labelStyle"
    >
      {{ props.label }}
    </span>
    <slot />
  </label>
</template>
