export interface FrameSchedulerPort {
  setDelay(callback: () => void, delayMs: number): number;
  clearDelay(timerId: number): void;
}
