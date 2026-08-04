<script setup lang="ts">
import DesktopDateRange from '@/app/components/desktop/DesktopDateRange.vue';
import MobileDateRange from '@/app/components/mobile/MobileDateRange.vue';

const props = defineProps<{
  variant: 'desktop' | 'mobile';
  startValue: string;
  endValue: string;
}>();

const emit = defineEmits<{
  (event: 'update:startValue', value: string): void;
  (event: 'update:endValue', value: string): void;
}>();
</script>

<template>
  <MobileDateRange
    v-if="props.variant === 'mobile'"
    :end-value="props.endValue"
    :start-value="props.startValue"
    @update:start-value="emit('update:startValue', $event)"
    @update:end-value="emit('update:endValue', $event)"
  />
  <DesktopDateRange
    v-else
    :end-value="props.endValue"
    :start-value="props.startValue"
    @update:start-value="emit('update:startValue', $event)"
    @update:end-value="emit('update:endValue', $event)"
  />
</template>
