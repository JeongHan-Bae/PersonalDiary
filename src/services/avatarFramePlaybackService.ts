import { AVATAR_FRAME_PLAYBACK } from '@/constants/algorithmConstants';
import { frameSchedulerPort } from '@/services/serviceDependencies';

export interface AvatarFramePlaybackController {
  start(renderNextFrame: () => boolean | Promise<boolean>): void;
  stop(): void;
}

export const createAvatarFramePlaybackController =
  (): AvatarFramePlaybackController => {
    let frameTimer: number | undefined;
    let nextFrameDelayMs: number = AVATAR_FRAME_PLAYBACK.initialFrameDelayMs;
    let playbackId = 0;

    const clearFrameTimer = (): void => {
      if (frameTimer !== undefined) {
        frameSchedulerPort.clearDelay(frameTimer);
        frameTimer = undefined;
      }
    };

    const stop = (): void => {
      playbackId += 1;
      clearFrameTimer();
    };

    const start = (renderNextFrame: () => boolean | Promise<boolean>): void => {
      stop();

      const currentPlaybackId = playbackId;

      nextFrameDelayMs = AVATAR_FRAME_PLAYBACK.initialFrameDelayMs;

      const renderAndScheduleNextFrame = async (): Promise<void> => {
        const frameStartTime = performance.now();
        const shouldContinue = await Promise.resolve(renderNextFrame()).catch(
          () => false,
        );

        if (currentPlaybackId !== playbackId || !shouldContinue) {
          return;
        }

        const frameElapsedMs = performance.now() - frameStartTime;
        const remainingDelayMs = Math.max(0, nextFrameDelayMs - frameElapsedMs);

        nextFrameDelayMs = Math.min(
          AVATAR_FRAME_PLAYBACK.maxFrameDelayMs,
          nextFrameDelayMs + AVATAR_FRAME_PLAYBACK.frameDelayIncrementMs,
        );
        frameTimer = frameSchedulerPort.setDelay(() => {
          void renderAndScheduleNextFrame();
        }, remainingDelayMs);
      };

      void renderAndScheduleNextFrame();
    };

    return {
      start,
      stop,
    };
  };
