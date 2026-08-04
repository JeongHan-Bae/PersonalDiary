<script setup lang="ts">
import DateRangeBase from '@/app/components/DateRangeBase.vue';
import { DATE_RANGE_CONTROL_LABELS } from '@/constants/visualConstants';

const props = defineProps<{
  startValue: string;
  endValue: string;
}>();

const emit = defineEmits<{
  (event: 'update:startValue', value: string): void;
  (event: 'update:endValue', value: string): void;
}>();
</script>

<template>
  <DateRangeBase :label="DATE_RANGE_CONTROL_LABELS.label">
    <div
      class="date-range-input-grid grid h-9 items-center rounded-lg border border-borderBase bg-panel"
    >
      <input
        :value="props.startValue"
        class="h-full min-w-0 bg-transparent px-2 text-xs text-titleText outline-none"
        type="date"
        :aria-label="DATE_RANGE_CONTROL_LABELS.startAriaLabel"
        @input="emit('update:startValue', ($event.target as HTMLInputElement).value)"
      />
      <div class="h-5 w-px bg-borderBase" />
      <input
        :value="props.endValue"
        class="h-full min-w-0 bg-transparent px-2 text-xs text-titleText outline-none"
        type="date"
        :aria-label="DATE_RANGE_CONTROL_LABELS.endAriaLabel"
        @input="emit('update:endValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </DateRangeBase>
</template>
