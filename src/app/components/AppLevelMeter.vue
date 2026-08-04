<script setup lang="ts">
import { computed } from 'vue';
import type { CSSProperties } from 'vue';
import { CSS_LENGTHS, PERCENT_FULL } from '@/constants/visualConstants';

export type AppLevelMeterTone = 'good' | 'neutral' | 'bad';

const props = defineProps<{
  percent: number;
  tone: AppLevelMeterTone;
  trackClass?: string;
}>();

const normalizedPercent = computed(() =>
  Math.min(PERCENT_FULL, Math.max(0, props.percent)),
);

const fillStyle = computed<CSSProperties>(() => ({
  width: `${normalizedPercent.value}${CSS_LENGTHS.percentUnit}`,
}));

const fillClass = computed(() => {
  if (props.tone === 'good') {
    return 'bg-levelGood';
  }

  if (props.tone === 'bad') {
    return 'bg-levelBad';
  }

  return 'bg-levelNeutral';
});
</script>

<template>
  <div
    class="h-2 w-full overflow-hidden rounded-full"
    :class="trackClass ?? 'bg-app'"
  >
    <div
      class="h-full rounded-full"
      :class="fillClass"
      :style="fillStyle"
    />
  </div>
</template>
