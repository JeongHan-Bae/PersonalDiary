export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];

export interface AvatarImageData {
  width: number;
  height: number;
  rgba: Uint8Array;
}

export interface SubjectMask {
  width: number;
  height: number;
  values: Uint8Array;
}

export interface SubjectMaskMetadata {
  version: string;
  status: 'success' | 'no-subject' | 'analysis-failed';
  width: number;
  height: number;
  foregroundAreaRatio: number;
  componentDominance: number;
  hullCompactness: number;
  solidity: number;
  centerScore: number;
  confidence: number;
}

export interface SubjectMaskAnalysisResult {
  mask: SubjectMask;
  metadata: SubjectMaskMetadata;
}

export interface ProgressiveRenderConfig {
  levels: number[];
  subjectSamplingStartLevel: number;
  colorQuantum: number;
  subjectCellCoverageThreshold: number;
  useCenterMaskTieBreak: boolean;
}

export interface RenderCell {
  gridX: number;
  gridY: number;
  sourceX0: number;
  sourceY0: number;
  sourceX1: number;
  sourceY1: number;
  type: 'average' | 'background-average' | 'subject-sample';
  subjectCoverage: number;
  color: RGBA;
  sampledSourceX?: number;
  sampledSourceY?: number;
  dominantBucket?: [number, number, number];
}

export interface RenderLevel {
  gridSize: number;
  cells: RenderCell[];
}

export interface RenderPlan {
  width: number;
  height: number;
  maskStatus: 'subject' | 'no-subject';
  levels: RenderLevel[];
}

export interface AvatarRenderCellFrame {
  kind: 'cells';
  width: number;
  height: number;
  gridSize: number;
  cells: RenderCell[];
}

export interface AvatarRenderImageFrame {
  kind: 'image';
  width: number;
  height: number;
}

export type AvatarRenderFrame = AvatarRenderCellFrame | AvatarRenderImageFrame;

export interface AvatarRenderAsset {
  id: string;
  createdAt: string;
  updatedAt: string;
  originalImageDataUrl: string;
  originalMimeType: string;
  thumbnailImageDataUrl?: string;
  maskImageDataUrl?: string;
  maskMetadata: SubjectMaskMetadata;
  metadata?: Record<string, unknown>;
}
