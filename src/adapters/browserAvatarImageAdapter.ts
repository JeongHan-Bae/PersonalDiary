import type { AvatarImageData, SubjectMask } from '@/models/avatar';
import type {
  AvatarCropRectangle,
  AvatarImageDimensions,
  AvatarImagePort,
} from '@/ports/avatarImagePort';
import {
  AVATAR_IMAGE_STORAGE_LIMITS,
} from '@/constants/businessConstants';

const loadImage = async (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener(
      'error',
      () => reject(new Error('Failed to load avatar image.')),
      { once: true },
    );
    image.src = dataUrl;
  });

const readFileAsDataUrl = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read avatar file as data URL.'));
      }
    });
    reader.addEventListener('error', () => {
      reject(new Error('Failed to read avatar file.'));
    });
    reader.readAsDataURL(file);
  });

const getDataUrlImageDimensions = async (
  dataUrl: string,
): Promise<AvatarImageDimensions> => {
  const image = await loadImage(dataUrl);

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
};

const cropDataUrlToSquare = async (
  dataUrl: string,
  crop: AvatarCropRectangle,
  outputSize = getStoredAvatarOutputSize(crop.size),
): Promise<string> => {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context === null) {
    throw new Error('Canvas is not available for avatar cropping.');
  }

  canvas.width = outputSize;
  canvas.height = outputSize;
  context.imageSmoothingEnabled = outputSize <= crop.size;
  context.clearRect(0, 0, outputSize, outputSize);
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.size,
    crop.size,
    0,
    0,
    outputSize,
    outputSize,
  );

  return canvas.toDataURL('image/png');
};

const getSmallAvatarPixelArtMultiplier = (sourceSize: number): number =>
  (Math.floor(
    AVATAR_IMAGE_STORAGE_LIMITS.pixelArtUpscaleFormulaOffsetPx / sourceSize,
  ) +
    1) *
  AVATAR_IMAGE_STORAGE_LIMITS.pixelArtUpscaleEvenMultiplier;

export const getStoredAvatarOutputSize = (sourceSize: number): number => {
  const roundedSourceSize = Math.max(
    AVATAR_IMAGE_STORAGE_LIMITS.minSourceSizePx,
    Math.round(sourceSize),
  );
  const requestedSize =
    roundedSourceSize < AVATAR_IMAGE_STORAGE_LIMITS.pixelArtUpscaleThresholdPx
      ? roundedSourceSize * getSmallAvatarPixelArtMultiplier(roundedSourceSize)
      : roundedSourceSize;

  return Math.min(
    AVATAR_IMAGE_STORAGE_LIMITS.maxStoredSizePx,
    requestedSize,
  );
};

const resizeDataUrlToSquare = async (
  dataUrl: string,
  outputSize = AVATAR_IMAGE_STORAGE_LIMITS.thumbnailSizePx,
): Promise<string> => {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context === null) {
    throw new Error('Canvas is not available for avatar resizing.');
  }

  canvas.width = outputSize;
  canvas.height = outputSize;
  context.imageSmoothingEnabled = outputSize <= image.naturalWidth;
  context.clearRect(0, 0, outputSize, outputSize);
  context.drawImage(image, 0, 0, outputSize, outputSize);

  return canvas.toDataURL('image/png');
};

const decodeDataUrlToAvatarImageData = async (
  dataUrl: string,
): Promise<AvatarImageData> => {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', {
    willReadFrequently: true,
  });

  if (context === null) {
    throw new Error('Canvas is not available for avatar decoding.');
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  context.clearRect(0, 0, image.naturalWidth, image.naturalHeight);
  context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    rgba: new Uint8Array(
      context.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data,
    ),
  };
};

const encodeSubjectMaskToPngDataUrl = (mask: SubjectMask): string => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context === null) {
    throw new Error('Canvas is not available for mask encoding.');
  }

  canvas.width = mask.width;
  canvas.height = mask.height;

  const imageData = context.createImageData(mask.width, mask.height);

  for (let index = 0; index < mask.values.length; index += 1) {
    const value = mask.values[index] ?? 0;
    const offset = index * 4;

    imageData.data[offset] = value;
    imageData.data[offset + 1] = value;
    imageData.data[offset + 2] = value;
    imageData.data[offset + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/png');
};

const decodeMaskDataUrlToSubjectMask = async (
  dataUrl: string,
  width: number,
  height: number,
): Promise<SubjectMask> => {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', {
    willReadFrequently: true,
  });

  if (context === null) {
    throw new Error('Canvas is not available for mask decoding.');
  }

  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const rgba = context.getImageData(0, 0, width, height).data;
  const values = new Uint8Array(width * height);

  for (let index = 0; index < values.length; index += 1) {
    const offset = index * 4;
    const red = rgba[offset] ?? 0;
    const green = rgba[offset + 1] ?? 0;
    const blue = rgba[offset + 2] ?? 0;

    values[index] = red + green + blue > 384 ? 255 : 0;
  }

  return {
    width,
    height,
    values,
  };
};

const createEmptySubjectMask = (
  width: number,
  height: number,
): SubjectMask => ({
  width,
  height,
  values: new Uint8Array(width * height),
});

export const createBrowserAvatarImageAdapter = (): AvatarImagePort => ({
  readFileAsDataUrl,
  getDataUrlImageDimensions,
  cropDataUrlToSquare,
  resizeDataUrlToSquare,
  decodeDataUrlToAvatarImageData,
  encodeSubjectMaskToPngDataUrl,
  decodeMaskDataUrlToSubjectMask,
  createEmptySubjectMask,
});
