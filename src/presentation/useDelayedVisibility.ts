import { onBeforeUnmount, ref } from 'vue';

export const useDelayedVisibility = (delayMs: number) => {
  const isVisible = ref(false);
  let timer: ReturnType<typeof window.setTimeout> | undefined;

  const start = (): void => {
    if (isVisible.value || timer !== undefined) {
      return;
    }

    timer = window.setTimeout(() => {
      isVisible.value = true;
      timer = undefined;
    }, delayMs);
  };

  const clear = (): void => {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }

    isVisible.value = false;
  };

  onBeforeUnmount(() => {
    clear();
  });

  return {
    clear,
    isVisible,
    start,
  };
};
