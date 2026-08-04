export type RangeThumb = 'min' | 'max';

export type RangePointerPayload = {
  event: PointerEvent;
  trackElement: HTMLElement | undefined;
  thumb?: RangeThumb;
};
