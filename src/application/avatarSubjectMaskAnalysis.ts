import type {
  AvatarImageData,
  SubjectMask,
  SubjectMaskAnalysisResult,
  SubjectMaskMetadata,
} from '@/models/avatar';
import {
  COLOR_CHANNEL_LIMITS,
  PIXEL_BUFFER_LAYOUT,
  SUBJECT_MASK_ANALYSIS_CONFIG,
  SUBJECT_MASK_GEOMETRY,
  SUBJECT_MASK_METADATA_VERSION,
  SUBJECT_MASK_PIXEL_VALUES,
} from '@/constants/algorithmConstants';

interface SubjectMaskAnalysisConfig {
  outerRingRatio: number;
  transparentAlphaThreshold: number;
  minimumTransparentOuterRingRatio: number;
  minimumSolidOuterRingVisibleRatio: number;
  maximumSolidOuterRingColorDistance: number;
  minimumSolidOuterRingMatchRatio: number;
  solidForegroundColorDistance: number;
  maximumPriorityOuterEdgeContactRatio: readonly [number, number];
  edgeExtrapolationStrongBandRatio: readonly [number, number];
  edgeExtrapolationFadeEndRatio: readonly [number, number];
  edgeExtrapolationBackgroundColorBucketSize: number;
  edgeExtrapolationBackgroundColorLimit: number;
  minimumEdgeExtrapolationBackgroundBucketRatio: readonly [number, number];
  edgeExtrapolationForegroundColorDistance: number;
  minimumForegroundAreaRatio: number;
  maximumForegroundAreaRatio: number;
  minimumComponentDominance: number;
  minimumHullCompactness: number;
  minimumSolidity: number;
  minimumCenterScore: number;
}

interface Point {
  x: number;
  y: number;
}

interface Component {
  pixels: Point[];
  area: number;
  centroidX: number;
  centroidY: number;
  centerScore: number;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface RgbaColor extends RgbColor {
  a: number;
}

interface WeightedRgbaColor {
  color: RgbaColor;
  weight: number;
}

interface GeometryQuality {
  accepted: boolean;
  foregroundAreaRatio: number;
  componentDominance: number;
  hullCompactness: number;
  solidity: number;
  centerScore: number;
  confidence: number;
}

interface MaskCandidate {
  mask: SubjectMask;
  recognized: boolean;
}

type PriorityMaskStrategy = 'transparent-background' | 'solid-background';
type MaskStrategy = PriorityMaskStrategy | 'edge-extrapolated-background' | 'classic-background';

export const DEFAULT_SUBJECT_MASK_ANALYSIS_CONFIG: SubjectMaskAnalysisConfig = {
  ...SUBJECT_MASK_ANALYSIS_CONFIG,
};

const createZeroMask = (width: number, height: number): SubjectMask => ({
  width,
  height,
  values: new Uint8Array(width * height),
});

const createMetadata = (
  status: SubjectMaskMetadata['status'],
  width: number,
  height: number,
  quality?: GeometryQuality,
): SubjectMaskMetadata => ({
  version: SUBJECT_MASK_METADATA_VERSION,
  status,
  width,
  height,
  foregroundAreaRatio: quality?.foregroundAreaRatio ?? 0,
  componentDominance: quality?.componentDominance ?? 0,
  hullCompactness: quality?.hullCompactness ?? 0,
  solidity: quality?.solidity ?? 0,
  centerScore: quality?.centerScore ?? 0,
  confidence: quality?.confidence ?? 0,
});

const getPixelOffset = (
  width: number,
  x: number,
  y: number,
): number => (y * width + x) * PIXEL_BUFFER_LAYOUT.rgbaChannelCount;

const getMaskOffset = (width: number, x: number, y: number): number =>
  y * width + x;

const getRgb = (image: AvatarImageData, x: number, y: number): RgbaColor => {
  const offset = getPixelOffset(image.width, x, y);

  return {
    r:
      image.rgba[offset + PIXEL_BUFFER_LAYOUT.redOffset] ??
      COLOR_CHANNEL_LIMITS.min,
    g:
      image.rgba[offset + PIXEL_BUFFER_LAYOUT.greenOffset] ??
      COLOR_CHANNEL_LIMITS.min,
    b:
      image.rgba[offset + PIXEL_BUFFER_LAYOUT.blueOffset] ??
      COLOR_CHANNEL_LIMITS.min,
    a:
      image.rgba[offset + PIXEL_BUFFER_LAYOUT.alphaOffset] ??
      COLOR_CHANNEL_LIMITS.maxByteValue,
  };
};

const isOuterRingPixel = (
  x: number,
  y: number,
  width: number,
  height: number,
  ringWidth: number,
): boolean =>
  x < ringWidth ||
  y < ringWidth ||
  x >= width - ringWidth ||
  y >= height - ringWidth;

const computeCenterPrior = (
  x: number,
  y: number,
  width: number,
  height: number,
): number => {
  const cx = width / 2;
  const cy = height / 2;
  const sx = width * SUBJECT_MASK_GEOMETRY.centerPriorWidthScale;
  const sy = height * SUBJECT_MASK_GEOMETRY.centerPriorHeightScale;

  return Math.exp(
    SUBJECT_MASK_GEOMETRY.centerPriorExponentScale *
      (((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2),
  );
};

const computeRingBackgroundMean = (
  image: AvatarImageData,
  ringWidth: number,
  alphaThreshold: number,
): {
  r: number;
  g: number;
  b: number;
} => {
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (!isOuterRingPixel(x, y, image.width, image.height, ringWidth)) {
        continue;
      }

      const pixel = getRgb(image, x, y);

      if (pixel.a <= alphaThreshold) {
        continue;
      }

      red += pixel.r;
      green += pixel.g;
      blue += pixel.b;
      count += 1;
    }
  }

  if (count === 0) {
    return {
      r: 0,
      g: 0,
      b: 0,
    };
  }

  return {
    r: red / count,
    g: green / count,
    b: blue / count,
  };
};

const colorDistanceToBackground = (
  image: AvatarImageData,
  x: number,
  y: number,
  background: RgbColor,
): number => {
  const pixel = getRgb(image, x, y);

  return Math.sqrt(
    (pixel.r - background.r) ** 2 +
      (pixel.g - background.g) ** 2 +
      (pixel.b - background.b) ** 2,
  );
};

const colorDistance = (color: RgbColor, background: RgbColor): number =>
  Math.sqrt(
    (color.r - background.r) ** 2 +
      (color.g - background.g) ** 2 +
      (color.b - background.b) ** 2,
  );

const getColorBucketKey = (
  color: RgbColor,
  bucketSize: number,
): string =>
  [
    Math.floor(color.r / bucketSize),
    Math.floor(color.g / bucketSize),
    Math.floor(color.b / bucketSize),
  ].join(',');

const meetsRatio = (
  count: number,
  total: number,
  ratio: readonly [number, number],
): boolean => {
  const [numerator, denominator] = ratio;

  return count * denominator >= total * numerator;
};

const ratioToCeilPixel = (
  length: number,
  ratio: readonly [number, number],
): number => {
  const [numerator, denominator] = ratio;

  return Math.ceil((length * numerator) / denominator);
};

const getEdgeExtrapolationBand = (
  length: number,
  config: SubjectMaskAnalysisConfig,
): {
  strongEnd: number;
  fadeEnd: number;
} => {
  const strongEnd = Math.max(
    1,
    Math.min(
      length,
      ratioToCeilPixel(length, config.edgeExtrapolationStrongBandRatio),
    ),
  );
  const fadeEnd = Math.max(
    strongEnd + 1,
    Math.min(
      length,
      ratioToCeilPixel(length, config.edgeExtrapolationFadeEndRatio),
    ),
  );

  return { strongEnd, fadeEnd };
};

const getEdgeExtrapolationSampleWeight = (
  distanceFromEdge: number,
  band: {
    strongEnd: number;
    fadeEnd: number;
  },
): number => {
  const fadeWidth = Math.max(1, band.fadeEnd - band.strongEnd);

  if (distanceFromEdge < band.strongEnd) {
    return fadeWidth;
  }

  return Math.max(0, band.fadeEnd - distanceFromEdge);
};

const getOuterRingPixels = (
  width: number,
  height: number,
  ringWidth: number,
): Point[] => {
  const pixels: Point[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isOuterRingPixel(x, y, width, height, ringWidth)) {
        pixels.push({ x, y });
      }
    }
  }

  return pixels;
};

const getAnalysisRingWidth = (
  image: AvatarImageData,
  config: SubjectMaskAnalysisConfig,
): number =>
  Math.max(
    1,
    Math.round(Math.min(image.width, image.height) * config.outerRingRatio),
  );

const buildVisibleAlphaMask = (
  image: AvatarImageData,
  alphaThreshold: number,
): SubjectMask => {
  const mask = createZeroMask(image.width, image.height);

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixel = getRgb(image, x, y);

      if (pixel.a > alphaThreshold) {
        mask.values[getMaskOffset(image.width, x, y)] =
          SUBJECT_MASK_PIXEL_VALUES.subject;
      }
    }
  }

  return mask;
};

const buildTransparentBackgroundCandidate = (
  image: AvatarImageData,
  config: SubjectMaskAnalysisConfig,
): MaskCandidate => {
  const ringPixels = getOuterRingPixels(
    image.width,
    image.height,
    getAnalysisRingWidth(image, config),
  );

  if (ringPixels.length === 0) {
    return {
      mask: createZeroMask(image.width, image.height),
      recognized: false,
    };
  }

  const transparentRingPixels = ringPixels.filter((pixel) => {
    const color = getRgb(image, pixel.x, pixel.y);

    return color.a <= config.transparentAlphaThreshold;
  });
  const transparentOuterRingRatio =
    transparentRingPixels.length / ringPixels.length;

  return {
    mask: buildVisibleAlphaMask(image, config.transparentAlphaThreshold),
    recognized:
      transparentOuterRingRatio >= config.minimumTransparentOuterRingRatio,
  };
};

const computeMeanColor = (
  image: AvatarImageData,
  pixels: Point[],
): RgbColor => {
  let red = 0;
  let green = 0;
  let blue = 0;

  for (const pixel of pixels) {
    const color = getRgb(image, pixel.x, pixel.y);

    red += color.r;
    green += color.g;
    blue += color.b;
  }

  if (pixels.length === 0) {
    return {
      r: 0,
      g: 0,
      b: 0,
    };
  }

  return {
    r: red / pixels.length,
    g: green / pixels.length,
    b: blue / pixels.length,
  };
};

const computeLineEdgeBackgroundColors = (
  edgePixels: WeightedRgbaColor[],
  config: SubjectMaskAnalysisConfig,
): RgbColor[] => {
  const buckets = new Map<
    string,
    {
      weight: number;
      r: number;
      g: number;
      b: number;
    }
  >();
  let visibleSampleWeight = 0;

  for (const sample of edgePixels) {
    const { color: pixel, weight } = sample;

    if (pixel.a <= config.transparentAlphaThreshold) {
      continue;
    }

    visibleSampleWeight += weight;

    const key = getColorBucketKey(
      pixel,
      config.edgeExtrapolationBackgroundColorBucketSize,
    );
    const bucket = buckets.get(key) ?? {
      weight: 0,
      r: 0,
      g: 0,
      b: 0,
    };

    bucket.weight += weight;
    bucket.r += pixel.r * weight;
    bucket.g += pixel.g * weight;
    bucket.b += pixel.b * weight;
    buckets.set(key, bucket);
  }

  if (visibleSampleWeight === 0) {
    return [];
  }

  return [...buckets.values()]
    .filter((bucket) =>
      meetsRatio(
        bucket.weight,
        visibleSampleWeight,
        config.minimumEdgeExtrapolationBackgroundBucketRatio,
      ),
    )
    .sort((a, b) => b.weight - a.weight)
    .slice(0, config.edgeExtrapolationBackgroundColorLimit)
    .map((bucket) => ({
      r: bucket.r / bucket.weight,
      g: bucket.g / bucket.weight,
      b: bucket.b / bucket.weight,
    }));
};

const computeRowEdgeBackgroundColors = (
  image: AvatarImageData,
  y: number,
  band: {
    strongEnd: number;
    fadeEnd: number;
  },
  config: SubjectMaskAnalysisConfig,
): RgbColor[] => {
  const edgePixels: WeightedRgbaColor[] = [];

  for (let x = 0; x < band.fadeEnd; x += 1) {
    const weight = getEdgeExtrapolationSampleWeight(x, band);

    if (weight <= 0) {
      continue;
    }

    edgePixels.push({
      color: getRgb(image, x, y),
      weight,
    });
    edgePixels.push({
      color: getRgb(image, image.width - 1 - x, y),
      weight,
    });
  }

  return computeLineEdgeBackgroundColors(edgePixels, config);
};

const computeColumnEdgeBackgroundColors = (
  image: AvatarImageData,
  x: number,
  band: {
    strongEnd: number;
    fadeEnd: number;
  },
  config: SubjectMaskAnalysisConfig,
): RgbColor[] => {
  const edgePixels: WeightedRgbaColor[] = [];

  for (let y = 0; y < band.fadeEnd; y += 1) {
    const weight = getEdgeExtrapolationSampleWeight(y, band);

    if (weight <= 0) {
      continue;
    }

    edgePixels.push({
      color: getRgb(image, x, y),
      weight,
    });
    edgePixels.push({
      color: getRgb(image, x, image.height - 1 - y),
      weight,
    });
  }

  return computeLineEdgeBackgroundColors(edgePixels, config);
};

const buildRowEdgeExtrapolatedBackgroundMask = (
  image: AvatarImageData,
  config: SubjectMaskAnalysisConfig,
): SubjectMask => {
  const mask = createZeroMask(image.width, image.height);
  const edgeBand = getEdgeExtrapolationBand(image.width, config);
  const rowBackgroundColors = Array.from({ length: image.height }, (_, y) =>
    computeRowEdgeBackgroundColors(image, y, edgeBand, config),
  );

  for (let y = 0; y < image.height; y += 1) {
    const backgrounds = rowBackgroundColors[y] ?? [];

    if (backgrounds.length === 0) {
      continue;
    }

    for (let x = 0; x < image.width; x += 1) {
      const pixel = getRgb(image, x, y);

      if (pixel.a <= config.transparentAlphaThreshold) {
        continue;
      }

      const nearestBackgroundDistance = Math.min(
        ...backgrounds.map((background) => colorDistance(pixel, background)),
      );

      if (
        nearestBackgroundDistance >
        config.edgeExtrapolationForegroundColorDistance
      ) {
        mask.values[getMaskOffset(image.width, x, y)] =
          SUBJECT_MASK_PIXEL_VALUES.subject;
      }
    }
  }

  return mask;
};

const buildColumnEdgeExtrapolatedBackgroundMask = (
  image: AvatarImageData,
  config: SubjectMaskAnalysisConfig,
): SubjectMask => {
  const mask = createZeroMask(image.width, image.height);
  const edgeBand = getEdgeExtrapolationBand(image.height, config);
  const columnBackgroundColors = Array.from({ length: image.width }, (_, x) =>
    computeColumnEdgeBackgroundColors(image, x, edgeBand, config),
  );

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const backgrounds = columnBackgroundColors[x] ?? [];

      if (backgrounds.length === 0) {
        continue;
      }

      const pixel = getRgb(image, x, y);

      if (pixel.a <= config.transparentAlphaThreshold) {
        continue;
      }

      const nearestBackgroundDistance = Math.min(
        ...backgrounds.map((background) => colorDistance(pixel, background)),
      );

      if (
        nearestBackgroundDistance >
        config.edgeExtrapolationForegroundColorDistance
      ) {
        mask.values[getMaskOffset(image.width, x, y)] =
          SUBJECT_MASK_PIXEL_VALUES.subject;
      }
    }
  }

  return mask;
};

const buildSolidBackgroundMask = (
  image: AvatarImageData,
  background: {
    r: number;
    g: number;
    b: number;
  },
  config: SubjectMaskAnalysisConfig,
): SubjectMask => {
  const mask = createZeroMask(image.width, image.height);

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixel = getRgb(image, x, y);

      if (
        pixel.a > config.transparentAlphaThreshold &&
        colorDistanceToBackground(image, x, y, background) >
          config.solidForegroundColorDistance
      ) {
        mask.values[getMaskOffset(image.width, x, y)] =
          SUBJECT_MASK_PIXEL_VALUES.subject;
      }
    }
  }

  return mask;
};

const buildSolidBackgroundCandidate = (
  image: AvatarImageData,
  config: SubjectMaskAnalysisConfig,
): MaskCandidate => {
  const ringPixels = getOuterRingPixels(
    image.width,
    image.height,
    getAnalysisRingWidth(image, config),
  );
  const visibleRingPixels = ringPixels.filter((pixel) => {
    const color = getRgb(image, pixel.x, pixel.y);

    return color.a > config.transparentAlphaThreshold;
  });

  if (
    ringPixels.length === 0 ||
    visibleRingPixels.length / ringPixels.length <
      config.minimumSolidOuterRingVisibleRatio
  ) {
    return {
      mask: createZeroMask(image.width, image.height),
      recognized: false,
    };
  }

  const background = computeMeanColor(image, visibleRingPixels);
  const matchingRingPixels = visibleRingPixels.filter(
    (pixel) =>
      colorDistanceToBackground(image, pixel.x, pixel.y, background) <=
      config.maximumSolidOuterRingColorDistance,
  );
  const matchingOuterRingRatio =
    matchingRingPixels.length / visibleRingPixels.length;

  return {
    mask: buildSolidBackgroundMask(image, background, config),
    recognized:
      matchingOuterRingRatio >= config.minimumSolidOuterRingMatchRatio,
  };
};

const computeResidualStats = (
  image: AvatarImageData,
  background: {
    r: number;
    g: number;
    b: number;
  },
): {
  mean: number;
  standardDeviation: number;
} => {
  let sum = 0;
  let squaredSum = 0;
  let count = 0;

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const distance = colorDistanceToBackground(image, x, y, background);
      sum += distance;
      squaredSum += distance * distance;
      count += 1;
    }
  }

  const mean = count === 0 ? 0 : sum / count;
  const variance = count === 0 ? 0 : squaredSum / count - mean * mean;

  return {
    mean,
    standardDeviation: Math.sqrt(Math.max(0, variance)),
  };
};

const buildInitialCandidateMask = (
  image: AvatarImageData,
  config: SubjectMaskAnalysisConfig,
): SubjectMask => {
  const ringWidth = Math.max(
    1,
    Math.round(Math.min(image.width, image.height) * config.outerRingRatio),
  );
  const background = computeRingBackgroundMean(
    image,
    ringWidth,
    config.transparentAlphaThreshold,
  );
  const residualStats = computeResidualStats(image, background);
  const threshold =
    residualStats.mean +
    residualStats.standardDeviation *
      SUBJECT_MASK_GEOMETRY.residualStandardDeviationMultiplier;
  const mask = createZeroMask(image.width, image.height);

  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixel = getRgb(image, x, y);
      const centerPrior = computeCenterPrior(x, y, image.width, image.height);
      const residual = colorDistanceToBackground(image, x, y, background);
      const likelyForeground =
        pixel.a > config.transparentAlphaThreshold &&
        residual > threshold &&
        centerPrior > SUBJECT_MASK_GEOMETRY.residualMinimumCenterPrior;

      if (likelyForeground) {
        mask.values[getMaskOffset(image.width, x, y)] =
          SUBJECT_MASK_PIXEL_VALUES.subject;
      }
    }
  }

  return mask;
};

const getConnectedComponents = (mask: SubjectMask): Component[] => {
  const visited = new Uint8Array(mask.width * mask.height);
  const components: Component[] = [];
  const directions: Point[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  for (let y = 0; y < mask.height; y += 1) {
    for (let x = 0; x < mask.width; x += 1) {
      const offset = getMaskOffset(mask.width, x, y);

      if (
        visited[offset] === SUBJECT_MASK_PIXEL_VALUES.visited ||
        (mask.values[offset] ?? SUBJECT_MASK_PIXEL_VALUES.background) ===
          SUBJECT_MASK_PIXEL_VALUES.background
      ) {
        continue;
      }

      const queue: Point[] = [{ x, y }];
      const pixels: Point[] = [];
      visited[offset] = SUBJECT_MASK_PIXEL_VALUES.visited;

      for (let index = 0; index < queue.length; index += 1) {
        const current = queue[index];

        if (current === undefined) {
          continue;
        }

        pixels.push(current);

        for (const direction of directions) {
          const nextX = current.x + direction.x;
          const nextY = current.y + direction.y;

          if (
            nextX < 0 ||
            nextY < 0 ||
            nextX >= mask.width ||
            nextY >= mask.height
          ) {
            continue;
          }

          const nextOffset = getMaskOffset(mask.width, nextX, nextY);

          if (
            visited[nextOffset] === SUBJECT_MASK_PIXEL_VALUES.visited ||
            (mask.values[nextOffset] ??
              SUBJECT_MASK_PIXEL_VALUES.background) ===
              SUBJECT_MASK_PIXEL_VALUES.background
          ) {
            continue;
          }

          visited[nextOffset] = SUBJECT_MASK_PIXEL_VALUES.visited;
          queue.push({ x: nextX, y: nextY });
        }
      }

      const area = pixels.length;
      const centroid = pixels.reduce(
        (accumulator, point) => ({
          x: accumulator.x + point.x,
          y: accumulator.y + point.y,
        }),
        { x: 0, y: 0 },
      );
      const centroidX = centroid.x / area;
      const centroidY = centroid.y / area;

      components.push({
        pixels,
        area,
        centroidX,
        centroidY,
        centerScore: computeCenterPrior(centroidX, centroidY, mask.width, mask.height),
      });
    }
  }

  return components;
};

const selectBestCentralComponent = (
  components: Component[],
): Component | undefined => {
  let best: Component | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const component of components) {
    const score =
      component.area *
      (SUBJECT_MASK_GEOMETRY.centralComponentScoreBase + component.centerScore);

    if (score > bestScore) {
      best = component;
      bestScore = score;
    }
  }

  return best;
};

const cross = (origin: Point, a: Point, b: Point): number =>
  (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x);

const computeConvexHull = (points: Point[]): Point[] => {
  const sorted = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  if (sorted.length <= 1) {
    return sorted;
  }

  const lower: Point[] = [];
  for (const point of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2] as Point, lower[lower.length - 1] as Point, point) <=
        0
    ) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper: Point[] = [];
  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const point = sorted[index];

    if (point === undefined) {
      continue;
    }

    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2] as Point, upper[upper.length - 1] as Point, point) <=
        0
    ) {
      upper.pop();
    }
    upper.push(point);
  }

  lower.pop();
  upper.pop();

  return [...lower, ...upper];
};

const computePolygonArea = (points: Point[]): number => {
  if (points.length < 3) {
    return 0;
  }

  let area = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];

    if (current === undefined || next === undefined) {
      continue;
    }

    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area) / 2;
};

const computePolygonPerimeter = (points: Point[]): number => {
  if (points.length < 2) {
    return 0;
  }

  let perimeter = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];

    if (current === undefined || next === undefined) {
      continue;
    }

    perimeter += Math.sqrt((current.x - next.x) ** 2 + (current.y - next.y) ** 2);
  }

  return perimeter;
};

const computeConfidence = (quality: Omit<GeometryQuality, 'confidence'>): number => {
  if (!quality.accepted) {
    return SUBJECT_MASK_PIXEL_VALUES.background;
  }

  return Math.min(
    1,
    (quality.componentDominance +
      quality.hullCompactness +
      quality.solidity +
      quality.centerScore) /
      SUBJECT_MASK_GEOMETRY.confidenceMetricCount,
  );
};

const validateMaskGeometry = (
  mask: SubjectMask,
  config: SubjectMaskAnalysisConfig,
): {
  quality: GeometryQuality;
  component?: Component;
} => {
  const components = getConnectedComponents(mask);

  if (components.length === 0) {
    return {
      quality: {
        accepted: false,
        foregroundAreaRatio: 0,
        componentDominance: 0,
        hullCompactness: 0,
        solidity: 0,
        centerScore: 0,
        confidence: 0,
      },
    };
  }

  const component = selectBestCentralComponent(components);

  if (component === undefined) {
    return {
      quality: {
        accepted: false,
        foregroundAreaRatio: 0,
        componentDominance: 0,
        hullCompactness: 0,
        solidity: 0,
        centerScore: 0,
        confidence: 0,
      },
    };
  }

  const totalArea = components.reduce(
    (accumulator, item) => accumulator + item.area,
    0,
  );
  const imageArea = mask.width * mask.height;
  const hull = computeConvexHull(component.pixels);
  const hullArea = computePolygonArea(hull);
  const hullPerimeter = computePolygonPerimeter(hull);
  const foregroundAreaRatio = component.area / imageArea;
  const componentDominance = component.area / Math.max(totalArea, 1);
  const hullCompactness =
    hullArea <= 0 || hullPerimeter <= 0
      ? 0
      : (SUBJECT_MASK_GEOMETRY.compactnessCircleFactor * Math.PI * hullArea) /
        (hullPerimeter * hullPerimeter);
  const solidity = hullArea <= 0 ? 0 : component.area / hullArea;
  const accepted =
    foregroundAreaRatio >= config.minimumForegroundAreaRatio &&
    foregroundAreaRatio <= config.maximumForegroundAreaRatio &&
    componentDominance >= config.minimumComponentDominance &&
    hullCompactness >= config.minimumHullCompactness &&
    solidity >= config.minimumSolidity &&
    component.centerScore >= config.minimumCenterScore;
  const qualityWithoutConfidence = {
    accepted,
    foregroundAreaRatio,
    componentDominance,
    hullCompactness,
    solidity,
    centerScore: component.centerScore,
  };

  return {
    component,
    quality: {
      ...qualityWithoutConfidence,
      confidence: computeConfidence(qualityWithoutConfidence),
    },
  };
};

const createComponentMask = (
  width: number,
  height: number,
  component: Component,
): SubjectMask => {
  const mask = createZeroMask(width, height);

  for (const pixel of component.pixels) {
    mask.values[getMaskOffset(width, pixel.x, pixel.y)] =
      SUBJECT_MASK_PIXEL_VALUES.subject;
  }

  return mask;
};

const fillEnclosedBackgroundHoles = (mask: SubjectMask): SubjectMask => {
  const reachableBackground = new Uint8Array(mask.width * mask.height);
  const queue: Point[] = [];

  const enqueueBackground = (x: number, y: number): void => {
    if (x < 0 || y < 0 || x >= mask.width || y >= mask.height) {
      return;
    }

    const offset = getMaskOffset(mask.width, x, y);

    if (
      reachableBackground[offset] === SUBJECT_MASK_PIXEL_VALUES.visited ||
      (mask.values[offset] ?? SUBJECT_MASK_PIXEL_VALUES.background) >
        SUBJECT_MASK_PIXEL_VALUES.background
    ) {
      return;
    }

    reachableBackground[offset] = SUBJECT_MASK_PIXEL_VALUES.visited;
    queue.push({ x, y });
  };

  for (let x = 0; x < mask.width; x += 1) {
    enqueueBackground(x, 0);
    enqueueBackground(x, mask.height - 1);
  }

  for (let y = 0; y < mask.height; y += 1) {
    enqueueBackground(0, y);
    enqueueBackground(mask.width - 1, y);
  }

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];

    if (current === undefined) {
      continue;
    }

    enqueueBackground(current.x + 1, current.y);
    enqueueBackground(current.x - 1, current.y);
    enqueueBackground(current.x, current.y + 1);
    enqueueBackground(current.x, current.y - 1);
  }

  const filled = createZeroMask(mask.width, mask.height);

  for (let index = 0; index < filled.values.length; index += 1) {
    filled.values[index] =
      (mask.values[index] ?? SUBJECT_MASK_PIXEL_VALUES.background) >
        SUBJECT_MASK_PIXEL_VALUES.background ||
      reachableBackground[index] !== SUBJECT_MASK_PIXEL_VALUES.visited
        ? SUBJECT_MASK_PIXEL_VALUES.subject
        : SUBJECT_MASK_PIXEL_VALUES.background;
  }

  return filled;
};

const shouldFillEnclosedHoles = (strategy: MaskStrategy): boolean =>
  strategy !== 'transparent-background' && strategy !== 'solid-background';

const isComponentOuterEdgeContactTooHigh = (
  component: Component,
  width: number,
  height: number,
  maximumRatio: readonly [number, number],
): boolean => {
  const componentPixels = new Set(
    component.pixels.map((pixel) => `${pixel.x},${pixel.y}`),
  );
  const boundaryPixels = component.pixels.filter((pixel) => {
    const neighbors = [
      { x: pixel.x + 1, y: pixel.y },
      { x: pixel.x - 1, y: pixel.y },
      { x: pixel.x, y: pixel.y + 1 },
      { x: pixel.x, y: pixel.y - 1 },
    ];

    return neighbors.some(
      (neighbor) =>
        neighbor.x < 0 ||
        neighbor.y < 0 ||
        neighbor.x >= width ||
        neighbor.y >= height ||
        !componentPixels.has(`${neighbor.x},${neighbor.y}`),
    );
  });

  if (boundaryPixels.length === 0) {
    return false;
  }

  const outerEdgePixels = boundaryPixels.filter(
    (pixel) =>
      pixel.x === 0 ||
      pixel.y === 0 ||
      pixel.x === width - 1 ||
      pixel.y === height - 1,
  );

  const [numerator, denominator] = maximumRatio;

  return outerEdgePixels.length * denominator > boundaryPixels.length * numerator;
};

const rejectQuality = (quality: GeometryQuality): GeometryQuality => ({
  ...quality,
  accepted: false,
  confidence: 0,
});

const createNoSubjectResult = (
  image: AvatarImageData,
  quality: GeometryQuality,
): SubjectMaskAnalysisResult => ({
  mask: createZeroMask(image.width, image.height),
  metadata: createMetadata('no-subject', image.width, image.height, quality),
});

const finalizeCandidateMask = (
  image: AvatarImageData,
  candidateMask: SubjectMask,
  config: SubjectMaskAnalysisConfig,
  strategy: MaskStrategy,
): SubjectMaskAnalysisResult => {
  const validation = validateMaskGeometry(candidateMask, config);

  if (validation.component === undefined) {
    return createNoSubjectResult(image, validation.quality);
  }

  if (
    !validation.quality.accepted &&
    !shouldFillEnclosedHoles(strategy)
  ) {
    return createNoSubjectResult(image, validation.quality);
  }

  if (strategy === 'transparent-background' || strategy === 'solid-background') {
    const outerEdgeContactTooHigh = isComponentOuterEdgeContactTooHigh(
      validation.component,
      image.width,
      image.height,
      config.maximumPriorityOuterEdgeContactRatio,
    );

    if (outerEdgeContactTooHigh) {
      return createNoSubjectResult(image, rejectQuality(validation.quality));
    }
  }

  const subjectMask = createComponentMask(
    image.width,
    image.height,
    validation.component,
  );
  const normalizedSubjectMask = shouldFillEnclosedHoles(strategy)
    ? fillEnclosedBackgroundHoles(subjectMask)
    : subjectMask;
  const finalValidation = validateMaskGeometry(normalizedSubjectMask, config);

  if (!finalValidation.quality.accepted) {
    return createNoSubjectResult(image, finalValidation.quality);
  }

  return {
    mask: normalizedSubjectMask,
    metadata: createMetadata(
      'success',
      image.width,
      image.height,
      finalValidation.quality,
    ),
  };
};

export const analyzeSubjectMask = (
  image: AvatarImageData,
  config: SubjectMaskAnalysisConfig = DEFAULT_SUBJECT_MASK_ANALYSIS_CONFIG,
): SubjectMaskAnalysisResult => {
  if (image.width <= 0 || image.height <= 0) {
    const mask = createZeroMask(Math.max(0, image.width), Math.max(0, image.height));

    return {
      mask,
      metadata: createMetadata('analysis-failed', mask.width, mask.height),
    };
  }

  const transparentCandidate = buildTransparentBackgroundCandidate(image, config);

  if (transparentCandidate.recognized) {
    return finalizeCandidateMask(
      image,
      transparentCandidate.mask,
      config,
      'transparent-background',
    );
  }

  const solidCandidate = buildSolidBackgroundCandidate(image, config);

  if (solidCandidate.recognized) {
    return finalizeCandidateMask(
      image,
      solidCandidate.mask,
      config,
      'solid-background',
    );
  }

  const rowEdgeExtrapolationResult = finalizeCandidateMask(
    image,
    buildRowEdgeExtrapolatedBackgroundMask(image, config),
    config,
    'edge-extrapolated-background',
  );

  if (rowEdgeExtrapolationResult.metadata.status === 'success') {
    return rowEdgeExtrapolationResult;
  }

  const columnEdgeExtrapolationResult = finalizeCandidateMask(
    image,
    buildColumnEdgeExtrapolatedBackgroundMask(image, config),
    config,
    'edge-extrapolated-background',
  );

  if (columnEdgeExtrapolationResult.metadata.status === 'success') {
    return columnEdgeExtrapolationResult;
  }

  return finalizeCandidateMask(
    image,
    buildInitialCandidateMask(image, config),
    config,
    'classic-background',
  );
};
