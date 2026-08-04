<script setup lang="ts">
import type { CSSProperties } from 'vue';

import { COOKIE_CONSENT_LAYOUT } from '@/constants/visualConstants';
import { COOKIE_CONSENT_CONTENT } from '@/presentation/cookieConsentContent';

const emit = defineEmits<{
  accept: [];
  reject: [];
}>();

const cookieConsentOverlayStyle = {
  zIndex: COOKIE_CONSENT_LAYOUT.overlayLayerZIndex,
} satisfies CSSProperties;
</script>

<template>
  <div
    class="cookie-consent-overlay fixed inset-0 flex items-center justify-center bg-app/80 p-5 backdrop-blur-md"
    :style="cookieConsentOverlayStyle"
  >
    <section
      class="cookie-consent-panel w-full rounded-lg border border-borderBase bg-panel p-6 text-titleText"
      role="dialog"
      aria-modal="true"
      :aria-label="COOKIE_CONSENT_CONTENT.title"
    >
      <h1 class="text-xl font-semibold">
        {{ COOKIE_CONSENT_CONTENT.title }}
      </h1>
      <p class="mt-4 text-sm leading-6 text-bodyText">
        {{ COOKIE_CONSENT_CONTENT.body }}
      </p>
      <p class="mt-3 text-sm leading-6 text-mutedText">
        {{ COOKIE_CONSENT_CONTENT.detail }}
      </p>
      <p class="mt-3 text-sm leading-6 text-bodyText">
        {{ COOKIE_CONSENT_CONTENT.requiredNotice }}
      </p>
      <div class="mt-6 flex gap-3">
        <button
          type="button"
          class="h-11 flex-1 rounded-md bg-accent px-4 text-sm font-semibold text-inverseText"
          @click="emit('accept')"
        >
          {{ COOKIE_CONSENT_CONTENT.acceptLabel }}
        </button>
        <button
          type="button"
          class="h-11 flex-1 rounded-md border border-danger bg-dangerSurface px-4 text-sm font-semibold text-danger"
          @click="emit('reject')"
        >
          {{ COOKIE_CONSENT_CONTENT.rejectLabel }}
        </button>
      </div>
    </section>
  </div>
</template>
