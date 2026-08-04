import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue';

import {
  AVATAR_FRAME_RENDERING,
  AVATAR_RENDER_TRANSPARENCY,
} from '@/constants/algorithmConstants';
import type {
  AvatarRenderCellFrame,
  AvatarRenderFrame,
} from '@/models/avatar';
import { createAvatarFramePlaybackController } from '@/services/avatarFramePlaybackService';
import {
  createAvatarRenderFrameStream,
  type AvatarRenderFrameStream,
} from '@/services/avatarRenderService';

export interface AvatarRendererProps {
  originalImageDataUrl: string | undefined;
  maskImageDataUrl: string | undefined;
  alt: string;
}

export interface AvatarRendererViewModel {
  canvas: Ref<HTMLCanvasElement | undefined>;
  isProgressiveFrameVisible: Ref<boolean>;
  isProgressiveVisible: Ref<boolean>;
  isSourceImageVisible: Ref<boolean>;
  markSourceImageLoaded(): void;
}

export const useAvatarRenderer = (
  props: AvatarRendererProps,
): AvatarRendererViewModel => {
  const canvas = ref<HTMLCanvasElement>();
  const isProgressiveVisible = ref(false);
  const isProgressiveFrameVisible = ref(false);
  const isSourceImageVisible = ref(false);
  const isSourceImageLoaded = ref(false);
  const framePlayback = createAvatarFramePlaybackController();
  const edgeBlurBandMaskTiles = new Map<string, HTMLCanvasElement>();
  let shouldRevealSourceImage = false;
  let renderRunId = 0;

  const setCanvasSize = (
    target: HTMLCanvasElement,
    frame: AvatarRenderCellFrame,
  ): CanvasRenderingContext2D | null => {
    target.width = frame.width;
    target.height = frame.height;

    const context = target.getContext('2d');

    if (context === null) {
      return null;
    }

    context.clearRect(0, 0, target.width, target.height);

    return context;
  };

  const revealSourceImageWhenReady = (): void => {
    if (isSourceImageLoaded.value) {
      isSourceImageVisible.value = true;
      isProgressiveFrameVisible.value = false;
      isProgressiveVisible.value = false;
      shouldRevealSourceImage = false;
      return;
    }

    shouldRevealSourceImage = true;
  };

  const markSourceImageLoaded = (): void => {
    isSourceImageLoaded.value = true;

    if (shouldRevealSourceImage) {
      revealSourceImageWhenReady();
    }
  };

  const shouldSoftenFrameEdges = (frame: AvatarRenderCellFrame): boolean =>
    frame.gridSize > AVATAR_FRAME_RENDERING.singleAverageGridSize &&
    frame.gridSize * AVATAR_FRAME_RENDERING.minimumMaskedEdgeCellSizePx <
    Math.min(frame.width, frame.height);

  const shouldApplyFineFrameBlur = (frame: AvatarRenderCellFrame): boolean =>
    frame.gridSize > AVATAR_FRAME_RENDERING.singleAverageGridSize &&
    !shouldSoftenFrameEdges(frame) &&
    frame.gridSize < Math.min(frame.width, frame.height);

  const clampRatio = (value: number): number => Math.min(1, Math.max(0, value));

  const getEdgeBlurBandAlphaRatio = (
    blurRatio: number,
    bandIndex: number,
  ): number => {
    const bandCount = AVATAR_FRAME_RENDERING.edgeBlurLayerCount;
    const bandStart = bandIndex / bandCount;
    const bandEnd = (bandIndex + 1) / bandCount;

    return (
      clampRatio((blurRatio - bandStart) * bandCount) -
      clampRatio((blurRatio - bandEnd) * bandCount)
    );
  };

  const getEdgeBlurMaxRadiusPx = (frame: AvatarRenderCellFrame): number => {
    const averageCellWidth = frame.width / frame.gridSize;
    const averageCellHeight = frame.height / frame.gridSize;
    const averageCellHalfDiagonal =
      Math.sqrt(averageCellWidth ** 2 + averageCellHeight ** 2) / 2;

    return Math.max(
      AVATAR_FRAME_RENDERING.edgeBlurMinimumMaxRadiusPx,
      averageCellHalfDiagonal * AVATAR_FRAME_RENDERING.edgeBlurMaxRadiusRatio,
    );
  };

  const getCssColor = (
    red: number,
    green: number,
    blue: number,
    alpha: number,
  ): string =>
    `rgba(${red}, ${green}, ${blue}, ${alpha / AVATAR_RENDER_TRANSPARENCY.opaqueAlpha})`;

  const paintCellRect = (
    context: CanvasRenderingContext2D,
    cell: AvatarRenderCellFrame['cells'][number],
  ): void => {
    const [red, green, blue, alpha] = cell.color;

    if (alpha <= AVATAR_RENDER_TRANSPARENCY.transparentAlpha) {
      return;
    }

    context.fillStyle = getCssColor(red, green, blue, alpha);
    context.fillRect(
      cell.sourceX0,
      cell.sourceY0,
      Math.max(
        AVATAR_FRAME_RENDERING.minimumCellSizePx,
        cell.sourceX1 - cell.sourceX0,
      ),
      Math.max(
        AVATAR_FRAME_RENDERING.minimumCellSizePx,
        cell.sourceY1 - cell.sourceY0,
      ),
    );
  };

  const paintCells = (
    context: CanvasRenderingContext2D,
    frame: AvatarRenderCellFrame,
  ): void => {
    for (const cell of frame.cells) {
      paintCellRect(context, cell);
    }
  };

  const createEdgeBlurBandMaskTile = (
    width: number,
    height: number,
    bandIndex: number,
  ): HTMLCanvasElement => {
    const tile = document.createElement('canvas');
    const context = tile.getContext('2d');

    tile.width = width;
    tile.height = height;

    if (context === null) {
      return tile;
    }

    const imageData = context.createImageData(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDiagonal = Math.sqrt(width ** 2 + height ** 2) / 2;
    const innerRadius =
      halfDiagonal * AVATAR_FRAME_RENDERING.edgeBlurInnerRadiusRatio;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const dx = x + 0.5 - centerX;
        const dy = y + 0.5 - centerY;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const offset = (y * width + x) * 4;

        if (distance <= innerRadius || distance === 0) {
          continue;
        }

        const squareProgress = Math.max(
          Math.abs(dx) / halfWidth,
          Math.abs(dy) / halfHeight,
        );

        if (squareProgress === 0) {
          continue;
        }

        const boundaryDistance = distance / squareProgress;
        const blurRatio = clampRatio(
          (distance - innerRadius) / (boundaryDistance - innerRadius),
        );
        const bandAlphaRatio = getEdgeBlurBandAlphaRatio(blurRatio, bandIndex);

        imageData.data[offset + 3] = Math.round(
          bandAlphaRatio * AVATAR_FRAME_RENDERING.edgeBlurMaskOpaqueAlpha,
        );
      }
    }

    context.putImageData(imageData, 0, 0);

    return tile;
  };

  const getEdgeBlurBandMaskTile = (
    width: number,
    height: number,
    bandIndex: number,
  ): HTMLCanvasElement => {
    const maskTileKey = `${width}x${height}:${bandIndex}`;
    let maskTile = edgeBlurBandMaskTiles.get(maskTileKey);

    if (maskTile === undefined) {
      maskTile = createEdgeBlurBandMaskTile(width, height, bandIndex);
      edgeBlurBandMaskTiles.set(maskTileKey, maskTile);
    }

    return maskTile;
  };

  const paintSoftenedCells = (
    target: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    frame: AvatarRenderCellFrame,
  ): void => {
    const crispCanvas = document.createElement('canvas');
    const crispContext = crispCanvas.getContext('2d');

    if (crispContext === null) {
      paintCells(context, frame);
      return;
    }

    crispCanvas.width = target.width;
    crispCanvas.height = target.height;
    paintCells(crispContext, frame);
    context.drawImage(crispCanvas, 0, 0);

    for (
      let bandIndex = 0;
      bandIndex < AVATAR_FRAME_RENDERING.edgeBlurLayerCount;
      bandIndex += 1
    ) {
      const blurredCanvas = document.createElement('canvas');
      const maskCanvas = document.createElement('canvas');
      const blurredContext = blurredCanvas.getContext('2d');
      const maskContext = maskCanvas.getContext('2d');

      if (blurredContext === null || maskContext === null) {
        return;
      }

      const blurRadiusPx =
        (getEdgeBlurMaxRadiusPx(frame) * (bandIndex + 1)) /
        AVATAR_FRAME_RENDERING.edgeBlurLayerCount;

      blurredCanvas.width = target.width;
      blurredCanvas.height = target.height;
      maskCanvas.width = target.width;
      maskCanvas.height = target.height;

      for (const cell of frame.cells) {
        const cellWidth = cell.sourceX1 - cell.sourceX0;
        const cellHeight = cell.sourceY1 - cell.sourceY0;
        const maskTile = getEdgeBlurBandMaskTile(
          cellWidth,
          cellHeight,
          bandIndex,
        );

        maskContext.drawImage(maskTile, cell.sourceX0, cell.sourceY0);
      }

      blurredContext.filter = `blur(${blurRadiusPx}px)`;
      blurredContext.drawImage(crispCanvas, 0, 0);
      blurredContext.filter = 'none';
      blurredContext.globalCompositeOperation = 'destination-in';
      blurredContext.drawImage(maskCanvas, 0, 0);
      context.drawImage(blurredCanvas, 0, 0);
    }
  };

  const paintFineBlurredCells = (
    target: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    frame: AvatarRenderCellFrame,
  ): void => {
    const blurredCanvas = document.createElement('canvas');
    const blurredContext = blurredCanvas.getContext('2d');

    paintCells(context, frame);

    if (blurredContext === null) {
      return;
    }

    blurredCanvas.width = target.width;
    blurredCanvas.height = target.height;
    blurredContext.filter = `blur(${AVATAR_FRAME_RENDERING.fineFrameBlurRadiusPx}px)`;
    blurredContext.drawImage(target, 0, 0);
    blurredContext.filter = 'none';
    context.clearRect(0, 0, target.width, target.height);
    context.drawImage(blurredCanvas, 0, 0);
  };

  const renderFrame = (frame: AvatarRenderFrame): boolean => {
    if (frame.kind === 'image') {
      revealSourceImageWhenReady();
      return true;
    }

    const target = canvas.value;

    if (target === undefined) {
      return false;
    }

    const context = setCanvasSize(target, frame);

    if (context === null) {
      return false;
    }

    if (shouldSoftenFrameEdges(frame)) {
      paintSoftenedCells(target, context, frame);
      isProgressiveFrameVisible.value = true;
      return true;
    }

    if (shouldApplyFineFrameBlur(frame)) {
      paintFineBlurredCells(target, context, frame);
      isProgressiveFrameVisible.value = true;
      return true;
    }

    paintCells(context, frame);
    isProgressiveFrameVisible.value = true;
    return true;
  };

  const stopRendering = (): void => {
    renderRunId += 1;
    framePlayback.stop();
  };

  const startPlayback = (
    stream: AvatarRenderFrameStream,
    currentRenderRunId: number,
  ): void => {
    let pendingFrame: AvatarRenderFrame | undefined;

    framePlayback.start(async () => {
      if (currentRenderRunId !== renderRunId) {
        return false;
      }

      const frame = pendingFrame ?? (await stream.nextFrame());

      if (frame === undefined) {
        return false;
      }

      if (!renderFrame(frame)) {
        pendingFrame = frame;
        return true;
      }

      pendingFrame = undefined;

      return frame.kind !== 'image';
    });
  };

  const startStreamingRender = async (
    originalImageDataUrl: string,
    maskImageDataUrl: string | undefined,
    currentRenderRunId: number,
  ): Promise<void> => {
    await nextTick();

    if (currentRenderRunId !== renderRunId || canvas.value === undefined) {
      return;
    }

    const stream = await createAvatarRenderFrameStream(
      originalImageDataUrl,
      maskImageDataUrl,
    );

    if (currentRenderRunId !== renderRunId || canvas.value === undefined) {
      return;
    }

    startPlayback(stream, currentRenderRunId);
  };

  watch(
    () => [props.originalImageDataUrl, props.maskImageDataUrl] as const,
    ([originalImageDataUrl, maskImageDataUrl]) => {
      stopRendering();
      isSourceImageLoaded.value = false;
      isSourceImageVisible.value = false;
      shouldRevealSourceImage = false;

      if (originalImageDataUrl === undefined) {
        isProgressiveFrameVisible.value = false;
        isProgressiveVisible.value = false;
        return;
      }

      isProgressiveFrameVisible.value = false;
      isProgressiveVisible.value = true;
      void startStreamingRender(
        originalImageDataUrl,
        maskImageDataUrl,
        renderRunId,
      );
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    stopRendering();
  });

  return {
    canvas,
    isProgressiveFrameVisible,
    isProgressiveVisible,
    isSourceImageVisible,
    markSourceImageLoaded,
  };
};
