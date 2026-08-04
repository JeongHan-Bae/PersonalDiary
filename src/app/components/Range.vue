<script setup lang="ts">
import DesktopRange from '@/app/components/desktop/DesktopRange.vue';
import MobileRange from '@/app/components/mobile/MobileRange.vue';

const props = withDefaults(defineProps<{
  variant: 'desktop' | 'mobile';
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
</script>

<template>
  <MobileRange
    v-if="props.variant === 'mobile'"
    :density="props.density ?? 'regular'"
    :label="props.label"
    :max="props.max"
    :max-value="props.maxValue"
    :min="props.min"
    :min-value="props.minValue"
    @update:min-value="emit('update:minValue', $event)"
    @update:max-value="emit('update:maxValue', $event)"
  />
  <DesktopRange
    v-else
    :density="props.density ?? 'regular'"
    :label="props.label"
    :max="props.max"
    :max-value="props.maxValue"
    :min="props.min"
    :min-value="props.minValue"
    @update:min-value="emit('update:minValue', $event)"
    @update:max-value="emit('update:maxValue', $event)"
  />
</template>
