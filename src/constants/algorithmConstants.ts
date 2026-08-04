import type { ProgressiveRenderConfig } from '@/models/avatar';

export const PIXEL_BUFFER_LAYOUT = {
  rgbaChannelCount: 4,
  redOffset: 0,
  greenOffset: 1,
  blueOffset: 2,
  alphaOffset: 3,
} as const;

export const COLOR_CHANNEL_LIMITS = {
  min: 0,
  maxByteValue: 255,
  exclusiveByteRange: 256,
} as const;

export const AVATAR_RENDER_TRANSPARENCY = {
  transparentAlpha: COLOR_CHANNEL_LIMITS.min,
  visibleAlphaThreshold: 8,
  opaqueAlpha: COLOR_CHANNEL_LIMITS.maxByteValue,
} as const;

export const SRGB_LINEAR_CONVERSION = {
  lowGammaThreshold: 0.04045,
  lowGammaDivisor: 12.92,
  offset: 0.055,
  scale: 1.055,
  exponent: 2.4,
  linearLowThreshold: 0.0031308,
} as const;

export const PROGRESSIVE_RENDER_SAMPLING = {
  centerTieBreakCoverageSlack: 0.1,
  minimumRepeatedBucketCount: 1,
  fallbackBucketWidth: 64,
} as const;

export const AVATAR_FRAME_PLAYBACK = {
  initialFrameDelayMs: 125,
  frameDelayIncrementMs: 62.5,
  maxFrameDelayMs: 375,
} as const;

export const AVATAR_FRAME_RENDERING = {
  minimumCellSizePx: 1,
  singleAverageGridSize: 1,
  minimumMaskedEdgeCellSizePx: 4,
  fineFrameBlurRadiusPx: 0.45,
  edgeBlurInnerRadiusRatio: 0.4,
  edgeBlurLayerCount: 4,
  edgeBlurMaxRadiusRatio: 0.5,
  edgeBlurMinimumMaxRadiusPx: 2,
  edgeBlurMaskOpaqueAlpha: COLOR_CHANNEL_LIMITS.maxByteValue,
} as const;

export const SUBJECT_MASK_METADATA_VERSION = 'subject-mask-priority-v1';

export const SUBJECT_MASK_PIXEL_VALUES = {
  background: 0,
  subject: COLOR_CHANNEL_LIMITS.maxByteValue,
  visited: 1,
} as const;

export const SUBJECT_MASK_GEOMETRY = {
  centerPriorWidthScale: 0.3,
  centerPriorHeightScale: 0.35,
  centerPriorExponentScale: -0.5,
  residualStandardDeviationMultiplier: 0.9,
  residualMinimumCenterPrior: 0.08,
  centralComponentScoreBase: 0.35,
  compactnessCircleFactor: 4,
  confidenceMetricCount: 4,
} as const;

export const SUBJECT_MASK_ANALYSIS_CONFIG = {
  outerRingRatio: 0.1,
  transparentAlphaThreshold: 8,
  minimumTransparentOuterRingRatio: 0.75,
  minimumSolidOuterRingVisibleRatio: 0.95,
  maximumSolidOuterRingColorDistance: 18,
  minimumSolidOuterRingMatchRatio: 0.92,
  solidForegroundColorDistance: 28,
  maximumPriorityOuterEdgeContactRatio: [1, 3],
  edgeExtrapolationStrongBandRatio: [1, 20],
  edgeExtrapolationFadeEndRatio: [3, 25],
  edgeExtrapolationBackgroundColorBucketSize: 16,
  edgeExtrapolationBackgroundColorLimit: 2,
  minimumEdgeExtrapolationBackgroundBucketRatio: [1, 5],
  edgeExtrapolationForegroundColorDistance: 32,
  minimumForegroundAreaRatio: 0.03,
  maximumForegroundAreaRatio: 0.85,
  minimumComponentDominance: 0.75,
  minimumHullCompactness: 0.15,
  minimumSolidity: 0.35,
  minimumCenterScore: 0.2,
} as const;

export const DEFAULT_PROGRESSIVE_RENDER_CONFIG: ProgressiveRenderConfig = {
  levels: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
  subjectSamplingStartLevel: 16,
  colorQuantum: 16,
  subjectCellCoverageThreshold: 0.5,
  useCenterMaskTieBreak: true,
};

export const AVATAR_RENDER_SEQUENCE_PROGRESSIVE_CONFIG: ProgressiveRenderConfig = {
  levels: DEFAULT_PROGRESSIVE_RENDER_CONFIG.levels,
  subjectSamplingStartLevel: 16,
  colorQuantum: 16,
  subjectCellCoverageThreshold: 0.5,
  useCenterMaskTieBreak: true,
};
