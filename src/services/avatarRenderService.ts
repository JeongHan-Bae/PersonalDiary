import {
  analyzeSubjectMask,
} from '@/application/avatarSubjectMaskAnalysis';
import {
  buildProgressiveAverageRenderLevel,
  buildProgressiveRenderLevel,
} from '@/application/avatarProgressiveRenderPlan';
import { AVATAR_RENDER_SEQUENCE_PROGRESSIVE_CONFIG } from '@/constants/algorithmConstants';
import type {
  AvatarCropRectangle,
  AvatarImageDimensions,
} from '@/ports/avatarImagePort';
import type {
  AvatarRenderFrame,
  AvatarRenderAsset,
  ProgressiveRenderConfig,
  SubjectMask,
} from '@/models/avatar';
import { avatarImagePort } from '@/services/serviceDependencies';

export interface AvatarCropSource {
  dataUrl: string;
  mimeType: string;
  fileName: string;
  dimensions: AvatarImageDimensions;
  crop: AvatarCropRectangle;
}

export interface AvatarRenderFrameStream {
  width: number;
  height: number;
  nextFrame(): Promise<AvatarRenderFrame | undefined>;
}

const createCenteredSquareCrop = (
  dimensions: AvatarImageDimensions,
): AvatarCropRectangle => {
  const size = Math.min(dimensions.width, dimensions.height);

  return {
    x: Math.floor((dimensions.width - size) / 2),
    y: Math.floor((dimensions.height - size) / 2),
    size,
  };
};

export const createAvatarCropSourceFromFile = async (
  file: File,
): Promise<AvatarCropSource> => {
  const dataUrl = await avatarImagePort.readFileAsDataUrl(file);
  const dimensions = await avatarImagePort.getDataUrlImageDimensions(dataUrl);

  return {
    dataUrl,
    mimeType: file.type || 'image/png',
    fileName: file.name,
    dimensions,
    crop: createCenteredSquareCrop(dimensions),
  };
};

export const cropAvatarSourceToSquareDataUrl = async (
  source: AvatarCropSource,
  crop: AvatarCropRectangle,
): Promise<string> => avatarImagePort.cropDataUrlToSquare(source.dataUrl, crop);

export const createAvatarThumbnailDataUrl = async (
  originalImageDataUrl: string,
): Promise<string> => avatarImagePort.resizeDataUrlToSquare(originalImageDataUrl);

const buildSourceSizedProgressiveConfig = (
  config: ProgressiveRenderConfig,
  sourceWidth: number,
  sourceHeight: number,
): ProgressiveRenderConfig => {
  const maximumGridSize = Math.min(sourceWidth, sourceHeight);

  return {
    ...config,
    levels: config.levels.filter((level) => level <= maximumGridSize),
  };
};

export const buildAvatarAssetDraftFromDataUrl = async (
  originalImageDataUrl: string,
  originalMimeType: string,
  uploadFileName?: string,
): Promise<Omit<AvatarRenderAsset, 'id' | 'createdAt' | 'updatedAt'>> => {
  const image = await avatarImagePort.decodeDataUrlToAvatarImageData(
    originalImageDataUrl,
  );
  const thumbnailImageDataUrl =
    await avatarImagePort.resizeDataUrlToSquare(originalImageDataUrl);
  const analysis = analyzeSubjectMask(image);

  return {
    originalImageDataUrl,
    originalMimeType,
    thumbnailImageDataUrl,
    maskImageDataUrl: avatarImagePort.encodeSubjectMaskToPngDataUrl(
      analysis.mask,
    ),
    maskMetadata: analysis.metadata,
    metadata: {
      uploadFileName,
    },
  };
};

export const createAvatarRenderFrameStream = async (
  originalImageDataUrl: string,
  maskImageDataUrl: string | undefined,
): Promise<AvatarRenderFrameStream> => {
  const image = await avatarImagePort.decodeDataUrlToAvatarImageData(
    originalImageDataUrl,
  );
  const config = buildSourceSizedProgressiveConfig(
    AVATAR_RENDER_SEQUENCE_PROGRESSIVE_CONFIG,
    image.width,
    image.height,
  );
  let maskPromise: Promise<SubjectMask> | undefined;
  let levelIndex = 0;
  let didEmitFinalFrame = false;

  const getMask = (): Promise<SubjectMask> => {
    maskPromise ??=
      maskImageDataUrl === undefined
        ? Promise.resolve(
            avatarImagePort.createEmptySubjectMask(image.width, image.height),
          )
        : avatarImagePort.decodeMaskDataUrlToSubjectMask(
            maskImageDataUrl,
            image.width,
            image.height,
          );

    return maskPromise;
  };

  const preloadMask = (): void => {
    void getMask().catch(() => undefined);
  };

  return {
    width: image.width,
    height: image.height,
    async nextFrame(): Promise<AvatarRenderFrame | undefined> {
      const level = config.levels[levelIndex];

      if (level !== undefined) {
        levelIndex += 1;
        const renderLevel =
          level < config.subjectSamplingStartLevel
            ? buildProgressiveAverageRenderLevel(image, level)
            : buildProgressiveRenderLevel(image, await getMask(), level, config);

        if (levelIndex === 1) {
          preloadMask();
        }

        return {
          kind: 'cells',
          width: image.width,
          height: image.height,
          gridSize: level,
          cells: renderLevel.cells,
        };
      }

      if (didEmitFinalFrame) {
        return undefined;
      }

      didEmitFinalFrame = true;

      return {
        kind: 'image',
        width: image.width,
        height: image.height,
      };
    },
  };
};
