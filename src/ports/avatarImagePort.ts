import type { AvatarImageData, SubjectMask } from '@/models/avatar';

export interface AvatarCropRectangle {
  x: number;
  y: number;
  size: number;
}

export interface AvatarImageDimensions {
  width: number;
  height: number;
}

export interface AvatarImagePort {
  readFileAsDataUrl(file: File): Promise<string>;
  getDataUrlImageDimensions(dataUrl: string): Promise<AvatarImageDimensions>;
  cropDataUrlToSquare(
    dataUrl: string,
    crop: AvatarCropRectangle,
  ): Promise<string>;
  resizeDataUrlToSquare(dataUrl: string): Promise<string>;
  decodeDataUrlToAvatarImageData(dataUrl: string): Promise<AvatarImageData>;
  encodeSubjectMaskToPngDataUrl(mask: SubjectMask): string;
  decodeMaskDataUrlToSubjectMask(
    dataUrl: string,
    width: number,
    height: number,
  ): Promise<SubjectMask>;
  createEmptySubjectMask(width: number, height: number): SubjectMask;
}
