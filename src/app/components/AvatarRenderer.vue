<script setup lang="ts">
import {
  useAvatarRenderer,
  type AvatarRendererProps,
} from '@/app/components/AvatarRenderer';

const props = defineProps<AvatarRendererProps>();
const {
  canvas,
  isProgressiveFrameVisible,
  isProgressiveVisible,
  isSourceImageVisible,
  markSourceImageLoaded,
} =
  useAvatarRenderer(props);
</script>

<template>
  <div v-if="originalImageDataUrl" class="relative h-full w-full overflow-hidden">
    <img
      class="absolute inset-0 h-full w-full object-cover"
      :class="{ 'opacity-0': !isSourceImageVisible }"
      :alt="alt"
      :src="originalImageDataUrl"
      @load="markSourceImageLoaded"
    />
    <canvas
      v-if="isProgressiveVisible"
      ref="canvas"
      aria-hidden="true"
      class="absolute inset-0 h-full w-full object-cover"
      :class="{ 'opacity-0': !isProgressiveFrameVisible }"
    />
  </div>
</template>
