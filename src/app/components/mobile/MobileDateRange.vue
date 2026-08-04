<script setup lang="ts">
import { ref } from 'vue';
import type { CSSProperties } from 'vue';
import DateRangeBase from '@/app/components/DateRangeBase.vue';
import {
  DATE_RANGE_CONTROL_LABELS,
  DATE_RANGE_CONTROL_LAYOUT,
} from '@/constants/visualConstants';

const props = defineProps<{
  startValue: string;
  endValue: string;
}>();

const emit = defineEmits<{
  (event: 'update:startValue', value: string): void;
  (event: 'update:endValue', value: string): void;
}>();

const isModalOpen = ref(false);
const draftStartValue = ref('');
const draftEndValue = ref('');
const mobileDateRangeOverlayStyle = {
  zIndex: DATE_RANGE_CONTROL_LAYOUT.mobileModalOverlayLayerZIndex,
} satisfies CSSProperties;

const toDisplayDate = (value: string): string => value.split('-').join('/');

const openModal = (): void => {
  draftStartValue.value = props.startValue;
  draftEndValue.value = props.endValue;
  isModalOpen.value = true;
};

const closeModal = (): void => {
  isModalOpen.value = false;
};

const clearModal = (): void => {
  draftStartValue.value = '';
  draftEndValue.value = '';
};

const applyModal = (): void => {
  emit('update:startValue', draftStartValue.value);
  emit('update:endValue', draftEndValue.value);
  closeModal();
};
</script>

<template>
  <DateRangeBase :label="DATE_RANGE_CONTROL_LABELS.label">
    <div
      class="date-range-input-grid relative grid h-9 items-center rounded-lg border border-borderBase bg-panel"
    >
      <button
        class="h-full min-w-0 truncate bg-transparent px-1 text-left text-typo-tiny outline-none"
        type="button"
        :aria-label="DATE_RANGE_CONTROL_LABELS.startAriaLabel"
        @click="openModal"
      >
        {{ props.startValue ? toDisplayDate(props.startValue) : DATE_RANGE_CONTROL_LABELS.emptyDate }}
      </button>
      <div class="h-5 w-px bg-borderBase" />
      <button
        class="h-full min-w-0 truncate bg-transparent px-1 text-left text-typo-tiny outline-none"
        type="button"
        :aria-label="DATE_RANGE_CONTROL_LABELS.endAriaLabel"
        @click="openModal"
      >
        {{ props.endValue ? toDisplayDate(props.endValue) : DATE_RANGE_CONTROL_LABELS.emptyDate }}
      </button>
    </div>
  </DateRangeBase>

  <Teleport to="body">
    <div
      v-if="isModalOpen"
      class="mobile-date-range-modal-overlay fixed inset-0 flex items-center justify-center bg-app/70 p-5 backdrop-blur-md"
      :style="mobileDateRangeOverlayStyle"
    >
      <section
        class="w-full rounded-lg border border-borderBase bg-panel p-5 text-titleText"
        role="dialog"
        aria-modal="true"
        :aria-label="DATE_RANGE_CONTROL_LABELS.dialogLabel"
      >
        <p class="text-xs font-medium uppercase text-mutedText">
          {{ DATE_RANGE_CONTROL_LABELS.label }}
        </p>
        <h2 class="mt-2 text-2xl font-semibold">
          {{ DATE_RANGE_CONTROL_LABELS.title }}
        </h2>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <label class="block min-w-0">
            <span class="mb-2 block text-xs font-medium text-mutedText">
              {{ DATE_RANGE_CONTROL_LABELS.start }}
            </span>
            <input
              v-model="draftStartValue"
              class="h-11 w-full rounded-lg border border-borderBase bg-surface px-3 text-sm outline-none focus:border-accent"
              type="date"
            />
          </label>
          <label class="block min-w-0">
            <span class="mb-2 block text-xs font-medium text-mutedText">
              {{ DATE_RANGE_CONTROL_LABELS.end }}
            </span>
            <input
              v-model="draftEndValue"
              class="h-11 w-full rounded-lg border border-borderBase bg-surface px-3 text-sm outline-none focus:border-accent"
              type="date"
            />
          </label>
        </div>
        <div class="mt-5 grid grid-cols-3 gap-2">
          <button
            class="h-10 rounded-lg border border-borderBase px-3 text-sm"
            type="button"
            @click="closeModal"
          >
            {{ DATE_RANGE_CONTROL_LABELS.cancel }}
          </button>
          <button
            class="h-10 rounded-lg border border-borderBase px-3 text-sm"
            type="button"
            @click="clearModal"
          >
            {{ DATE_RANGE_CONTROL_LABELS.clear }}
          </button>
          <button
            class="h-10 rounded-lg bg-accent px-3 text-sm font-medium text-inverseText"
            type="button"
            @click="applyModal"
          >
            {{ DATE_RANGE_CONTROL_LABELS.apply }}
          </button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
