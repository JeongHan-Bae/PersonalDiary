import {
  type AvatarImageData,
  type ProgressiveRenderConfig,
  type RenderCell,
  type RenderLevel,
  type RGBA,
  type RenderPlan,
  type RGB,
  type SubjectMask,
} from '@/models/avatar';
import {
  AVATAR_RENDER_TRANSPARENCY,
  COLOR_CHANNEL_LIMITS,
  DEFAULT_PROGRESSIVE_RENDER_CONFIG,
  PIXEL_BUFFER_LAYOUT,
  PROGRESSIVE_RENDER_SAMPLING,
  SRGB_LINEAR_CONVERSION,
} from '@/constants/algorithmConstants';

interface PixelCoordinate {
  x: number;
  y: number;
}

interface SourceRectangle {
  sourceX0: number;
  sourceY0: number;
  sourceX1: number;
  sourceY1: number;
}

interface ModalSample {
  x: number;
  y: number;
  bucket: [number, number, number];
  originalColor: RGBA;
}

const assertSameDimensions = (
  image: AvatarImageData,
  mask: SubjectMask,
): void => {
  if (image.width !== mask.width || image.height !== mask.height) {
    throw new Error('Avatar image and subject mask dimensions must match.');
  }
};

const getPixelOffset = (
  width: number,
  x: number,
  y: number,
): number => (y * width + x) * PIXEL_BUFFER_LAYOUT.rgbaChannelCount;

const getMaskOffset = (width: number, x: number, y: number): number =>
  y * width + x;

const getRgba = (image: AvatarImageData, pixel: PixelCoordinate): RGBA => {
  const offset = getPixelOffset(image.width, pixel.x, pixel.y);

  return [
    image.rgba[offset + PIXEL_BUFFER_LAYOUT.redOffset] ??
      COLOR_CHANNEL_LIMITS.min,
    image.rgba[offset + PIXEL_BUFFER_LAYOUT.greenOffset] ??
      COLOR_CHANNEL_LIMITS.min,
    image.rgba[offset + PIXEL_BUFFER_LAYOUT.blueOffset] ??
      COLOR_CHANNEL_LIMITS.min,
    image.rgba[offset + PIXEL_BUFFER_LAYOUT.alphaOffset] ??
      AVATAR_RENDER_TRANSPARENCY.opaqueAlpha,
  ];
};

const getRgb = (image: AvatarImageData, pixel: PixelCoordinate): RGB => {
  const [red, green, blue] = getRgba(image, pixel);

  return [red, green, blue];
};

const isVisiblePixel = (
  image: AvatarImageData,
  pixel: PixelCoordinate,
): boolean =>
  getRgba(image, pixel)[3] > AVATAR_RENDER_TRANSPARENCY.visibleAlphaThreshold;

const filterVisiblePixels = (
  image: AvatarImageData,
  pixels: PixelCoordinate[],
): PixelCoordinate[] => pixels.filter((pixel) => isVisiblePixel(image, pixel));

const srgbToLinear = (value: number): number => {
  const normalized = value / COLOR_CHANNEL_LIMITS.maxByteValue;

  if (normalized <= SRGB_LINEAR_CONVERSION.lowGammaThreshold) {
    return normalized / SRGB_LINEAR_CONVERSION.lowGammaDivisor;
  }

  return (
    (normalized + SRGB_LINEAR_CONVERSION.offset) /
    SRGB_LINEAR_CONVERSION.scale
  ) ** SRGB_LINEAR_CONVERSION.exponent;
};

const linearToSrgb = (value: number): number => {
  const clamped = Math.min(1, Math.max(COLOR_CHANNEL_LIMITS.min, value));
  const srgb =
    clamped <= SRGB_LINEAR_CONVERSION.linearLowThreshold
      ? clamped * SRGB_LINEAR_CONVERSION.lowGammaDivisor
      : SRGB_LINEAR_CONVERSION.scale *
          clamped ** (1 / SRGB_LINEAR_CONVERSION.exponent) -
        SRGB_LINEAR_CONVERSION.offset;

  return Math.round(srgb * COLOR_CHANNEL_LIMITS.maxByteValue);
};

const averageLinearRgba = (
  image: AvatarImageData,
  pixels: PixelCoordinate[],
): RGBA => {
  if (pixels.length === 0) {
    return [
      COLOR_CHANNEL_LIMITS.min,
      COLOR_CHANNEL_LIMITS.min,
      COLOR_CHANNEL_LIMITS.min,
      AVATAR_RENDER_TRANSPARENCY.transparentAlpha,
    ];
  }

  let red = COLOR_CHANNEL_LIMITS.min;
  let green = COLOR_CHANNEL_LIMITS.min;
  let blue = COLOR_CHANNEL_LIMITS.min;
  let alpha = COLOR_CHANNEL_LIMITS.min;

  for (const pixel of pixels) {
    const [r, g, b, a] = getRgba(image, pixel);
    const normalizedAlpha = a / AVATAR_RENDER_TRANSPARENCY.opaqueAlpha;

    red += srgbToLinear(r) * normalizedAlpha;
    green += srgbToLinear(g) * normalizedAlpha;
    blue += srgbToLinear(b) * normalizedAlpha;
    alpha += normalizedAlpha;
  }

  if (alpha === COLOR_CHANNEL_LIMITS.min) {
    return [
      COLOR_CHANNEL_LIMITS.min,
      COLOR_CHANNEL_LIMITS.min,
      COLOR_CHANNEL_LIMITS.min,
      AVATAR_RENDER_TRANSPARENCY.transparentAlpha,
    ];
  }

  return [
    linearToSrgb(red / alpha),
    linearToSrgb(green / alpha),
    linearToSrgb(blue / alpha),
    Math.round(
      (alpha / pixels.length) * AVATAR_RENDER_TRANSPARENCY.opaqueAlpha,
    ),
  ];
};

const averageLinearRgbaInRect = (
  image: AvatarImageData,
  rect: SourceRectangle,
): RGBA => {
  const pixelCount =
    (rect.sourceX1 - rect.sourceX0) * (rect.sourceY1 - rect.sourceY0);

  if (pixelCount === 0) {
    return [
      COLOR_CHANNEL_LIMITS.min,
      COLOR_CHANNEL_LIMITS.min,
      COLOR_CHANNEL_LIMITS.min,
      AVATAR_RENDER_TRANSPARENCY.transparentAlpha,
    ];
  }

  let red = COLOR_CHANNEL_LIMITS.min;
  let green = COLOR_CHANNEL_LIMITS.min;
  let blue = COLOR_CHANNEL_LIMITS.min;
  let alpha = COLOR_CHANNEL_LIMITS.min;

  for (let y = rect.sourceY0; y < rect.sourceY1; y += 1) {
    for (let x = rect.sourceX0; x < rect.sourceX1; x += 1) {
      const offset = getPixelOffset(image.width, x, y);
      const r =
        image.rgba[offset + PIXEL_BUFFER_LAYOUT.redOffset] ??
        COLOR_CHANNEL_LIMITS.min;
      const g =
        image.rgba[offset + PIXEL_BUFFER_LAYOUT.greenOffset] ??
        COLOR_CHANNEL_LIMITS.min;
      const b =
        image.rgba[offset + PIXEL_BUFFER_LAYOUT.blueOffset] ??
        COLOR_CHANNEL_LIMITS.min;
      const a =
        image.rgba[offset + PIXEL_BUFFER_LAYOUT.alphaOffset] ??
        AVATAR_RENDER_TRANSPARENCY.opaqueAlpha;
      const normalizedAlpha = a / AVATAR_RENDER_TRANSPARENCY.opaqueAlpha;

      red += srgbToLinear(r) * normalizedAlpha;
      green += srgbToLinear(g) * normalizedAlpha;
      blue += srgbToLinear(b) * normalizedAlpha;
      alpha += normalizedAlpha;
    }
  }

  if (alpha === COLOR_CHANNEL_LIMITS.min) {
    return [
      COLOR_CHANNEL_LIMITS.min,
      COLOR_CHANNEL_LIMITS.min,
      COLOR_CHANNEL_LIMITS.min,
      AVATAR_RENDER_TRANSPARENCY.transparentAlpha,
    ];
  }

  return [
    linearToSrgb(red / alpha),
    linearToSrgb(green / alpha),
    linearToSrgb(blue / alpha),
    Math.round((alpha / pixelCount) * AVATAR_RENDER_TRANSPARENCY.opaqueAlpha),
  ];
};

const computeSourceRectangle = (
  gridX: number,
  gridY: number,
  level: number,
  width: number,
  height: number,
): SourceRectangle => ({
  sourceX0: Math.floor((gridX * width) / level),
  sourceY0: Math.floor((gridY * height) / level),
  sourceX1: Math.floor(((gridX + 1) * width) / level),
  sourceY1: Math.floor(((gridY + 1) * height) / level),
});

const collectPixels = (rect: SourceRectangle): PixelCoordinate[] => {
  const pixels: PixelCoordinate[] = [];

  for (let y = rect.sourceY0; y < rect.sourceY1; y += 1) {
    for (let x = rect.sourceX0; x < rect.sourceX1; x += 1) {
      pixels.push({ x, y });
    }
  }

  return pixels;
};

const isSubjectPixel = (mask: SubjectMask, pixel: PixelCoordinate): boolean =>
  (mask.values[getMaskOffset(mask.width, pixel.x, pixel.y)] ?? 0) > 0;

const splitByMask = (
  mask: SubjectMask,
  pixels: PixelCoordinate[],
): {
  subjectPixels: PixelCoordinate[];
  backgroundPixels: PixelCoordinate[];
} => {
  const subjectPixels: PixelCoordinate[] = [];
  const backgroundPixels: PixelCoordinate[] = [];

  for (const pixel of pixels) {
    if (isSubjectPixel(mask, pixel)) {
      subjectPixels.push(pixel);
    } else {
      backgroundPixels.push(pixel);
    }
  }

  return {
    subjectPixels,
    backgroundPixels,
  };
};

const classifyCell = (
  mask: SubjectMask,
  rect: SourceRectangle,
  coverage: number,
  threshold: number,
  useCenterTieBreak: boolean,
): boolean => {
  if (coverage >= threshold) {
    return true;
  }

  if (
    !useCenterTieBreak ||
    coverage < threshold - PROGRESSIVE_RENDER_SAMPLING.centerTieBreakCoverageSlack
  ) {
    return false;
  }

  const centerX = Math.floor((rect.sourceX0 + rect.sourceX1 - 1) / 2);
  const centerY = Math.floor((rect.sourceY0 + rect.sourceY1 - 1) / 2);

  return isSubjectPixel(mask, { x: centerX, y: centerY });
};

const stableCoordinateCompare = (
  a: PixelCoordinate,
  b: PixelCoordinate,
): number => {
  if (a.y !== b.y) {
    return a.y - b.y;
  }

  return a.x - b.x;
};

const squaredDistanceToRectCenter = (
  pixel: PixelCoordinate,
  rect: SourceRectangle,
): number => {
  const centerX = (rect.sourceX0 + rect.sourceX1 - 1) / 2;
  const centerY = (rect.sourceY0 + rect.sourceY1 - 1) / 2;

  return (pixel.x - centerX) ** 2 + (pixel.y - centerY) ** 2;
};

const getBucketTuple = (
  color: RGB,
  bucketWidth: number,
): [number, number, number] => [
  Math.min(
    Math.floor(color[0] / bucketWidth),
    Math.ceil(COLOR_CHANNEL_LIMITS.exclusiveByteRange / bucketWidth) - 1,
  ),
  Math.min(
    Math.floor(color[1] / bucketWidth),
    Math.ceil(COLOR_CHANNEL_LIMITS.exclusiveByteRange / bucketWidth) - 1,
  ),
  Math.min(
    Math.floor(color[2] / bucketWidth),
    Math.ceil(COLOR_CHANNEL_LIMITS.exclusiveByteRange / bucketWidth) - 1,
  ),
];

const getBucketKey = (
  bucket: [number, number, number],
  bucketCount: number,
): number => bucket[0] + bucket[1] * bucketCount + bucket[2] * bucketCount ** 2;

const quantizedModalCenterSampleWithBucketWidth = (
  image: AvatarImageData,
  subjectPixels: PixelCoordinate[],
  rect: SourceRectangle,
  bucketWidth: number,
): {
  sample: ModalSample;
  maximumCount: number;
} => {
  const bucketCount = Math.ceil(
    COLOR_CHANNEL_LIMITS.exclusiveByteRange / bucketWidth,
  );
  const buckets = new Map<
    number,
    {
      bucket: [number, number, number];
      pixels: PixelCoordinate[];
    }
  >();

  for (const pixel of subjectPixels) {
    const bucket = getBucketTuple(getRgb(image, pixel), bucketWidth);
    const key = getBucketKey(bucket, bucketCount);
    const existing = buckets.get(key);

    if (existing === undefined) {
      buckets.set(key, {
        bucket,
        pixels: [pixel],
      });
    } else {
      existing.pixels.push(pixel);
    }
  }

  let bestBucketKey = Number.POSITIVE_INFINITY;
  let bestBucket: [number, number, number] = [
    COLOR_CHANNEL_LIMITS.min,
    COLOR_CHANNEL_LIMITS.min,
    COLOR_CHANNEL_LIMITS.min,
  ];
  let bestPixel = subjectPixels[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  let maximumCount: number = COLOR_CHANNEL_LIMITS.min;

  for (const [bucketKey, bucketValue] of buckets) {
    const count = bucketValue.pixels.length;

    if (count > maximumCount) {
      maximumCount = count;
      bestBucketKey = Number.POSITIVE_INFINITY;
      bestDistance = Number.POSITIVE_INFINITY;
    }

    if (count !== maximumCount) {
      continue;
    }

    let nearestPixel = bucketValue.pixels[0];
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const pixel of bucketValue.pixels) {
      const distance = squaredDistanceToRectCenter(pixel, rect);

      if (
        distance < nearestDistance ||
        (distance === nearestDistance &&
          nearestPixel !== undefined &&
          stableCoordinateCompare(pixel, nearestPixel) < 0)
      ) {
        nearestPixel = pixel;
        nearestDistance = distance;
      }
    }

    if (
      nearestPixel !== undefined &&
      (nearestDistance < bestDistance ||
        (nearestDistance === bestDistance && bucketKey < bestBucketKey))
    ) {
      bestBucketKey = bucketKey;
      bestBucket = bucketValue.bucket;
      bestPixel = nearestPixel;
      bestDistance = nearestDistance;
    }
  }

  if (bestPixel === undefined) {
    throw new Error('Cannot sample an empty subject pixel set.');
  }

  return {
    maximumCount,
    sample: {
      x: bestPixel.x,
      y: bestPixel.y,
      bucket: bestBucket,
      originalColor: getRgba(image, bestPixel),
    },
  };
};

export const quantizedModalCenterSample = (
  image: AvatarImageData,
  subjectPixels: PixelCoordinate[],
  rect: SourceRectangle,
  quantum: number,
): ModalSample => {
  if (subjectPixels.length === 0) {
    throw new Error('Subject sampling requires at least one subject pixel.');
  }

  const primary = quantizedModalCenterSampleWithBucketWidth(
    image,
    subjectPixels,
    rect,
    quantum,
  );

  if (
    primary.maximumCount >
      PROGRESSIVE_RENDER_SAMPLING.minimumRepeatedBucketCount ||
    subjectPixels.length === PROGRESSIVE_RENDER_SAMPLING.minimumRepeatedBucketCount
  ) {
    return primary.sample;
  }

  return quantizedModalCenterSampleWithBucketWidth(
    image,
    subjectPixels,
    rect,
    PROGRESSIVE_RENDER_SAMPLING.fallbackBucketWidth,
  ).sample;
};

export const buildProgressiveAverageRenderLevel = (
  image: AvatarImageData,
  level: number,
): RenderLevel => {
  const cells: RenderCell[] = [];

  for (let gridY = 0; gridY < level; gridY += 1) {
    for (let gridX = 0; gridX < level; gridX += 1) {
      const rect = computeSourceRectangle(
        gridX,
        gridY,
        level,
        image.width,
        image.height,
      );

      cells.push({
        gridX,
        gridY,
        ...rect,
        type: 'average',
        subjectCoverage: 0,
        color: averageLinearRgbaInRect(image, rect),
      });
    }
  }

  return {
    gridSize: level,
    cells,
  };
};

export const buildProgressiveRenderLevel = (
  image: AvatarImageData,
  mask: SubjectMask,
  level: number,
  config: ProgressiveRenderConfig = DEFAULT_PROGRESSIVE_RENDER_CONFIG,
): RenderLevel => {
  const cells: RenderCell[] = [];

  assertSameDimensions(image, mask);

  if (level < config.subjectSamplingStartLevel) {
    return buildProgressiveAverageRenderLevel(image, level);
  }

  for (let gridY = 0; gridY < level; gridY += 1) {
    for (let gridX = 0; gridX < level; gridX += 1) {
      const rect = computeSourceRectangle(
        gridX,
        gridY,
        level,
        image.width,
        image.height,
      );
      const pixels = collectPixels(rect);
      const { subjectPixels, backgroundPixels } = splitByMask(mask, pixels);
      const subjectCoverage =
        pixels.length === 0 ? 0 : subjectPixels.length / pixels.length;

      const isSubjectCell = classifyCell(
        mask,
        rect,
        subjectCoverage,
        config.subjectCellCoverageThreshold,
        config.useCenterMaskTieBreak,
      );

      const visibleSubjectPixels = filterVisiblePixels(image, subjectPixels);

      if (isSubjectCell && visibleSubjectPixels.length > 0) {
        const sample = quantizedModalCenterSample(
          image,
          visibleSubjectPixels,
          rect,
          config.colorQuantum,
        );

        cells.push({
          gridX,
          gridY,
          ...rect,
          type: 'subject-sample',
          subjectCoverage,
          color: sample.originalColor,
          sampledSourceX: sample.x,
          sampledSourceY: sample.y,
          dominantBucket: sample.bucket,
        });
      } else {
        cells.push({
          gridX,
          gridY,
          ...rect,
          type: 'background-average',
          subjectCoverage,
          color: averageLinearRgba(
            image,
            backgroundPixels.length > 0 ? backgroundPixels : pixels,
          ),
        });
      }
    }
  }

  return {
    gridSize: level,
    cells,
  };
};

export const buildProgressiveRenderPlan = (
  image: AvatarImageData,
  mask: SubjectMask,
  config: ProgressiveRenderConfig = DEFAULT_PROGRESSIVE_RENDER_CONFIG,
): RenderPlan => {
  assertSameDimensions(image, mask);

  const hasSubject = mask.values.some((value) => value > 0);
  const levels = config.levels.map((level) =>
    buildProgressiveRenderLevel(image, mask, level, config),
  );

  return {
    width: image.width,
    height: image.height,
    maskStatus: hasSubject ? 'subject' : 'no-subject',
    levels,
  };
};
