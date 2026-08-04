import type { FrameSchedulerPort } from '@/ports/frameSchedulerPort';

export const createBrowserFrameSchedulerAdapter = (): FrameSchedulerPort => ({
  setDelay(callback: () => void, delayMs: number): number {
    return window.setTimeout(callback, delayMs);
  },

  clearDelay(timerId: number): void {
    window.clearTimeout(timerId);
  },
});
