export type DeviceKind = 'desktop' | 'mobile';

import { DEVICE_DETECTION } from '@/constants/visualConstants';

const mobileUserAgentPattern =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export const detectDeviceKind = (): DeviceKind => {
  if (typeof navigator === 'undefined') {
    return 'desktop';
  }

  const hasMobileUserAgent = mobileUserAgentPattern.test(navigator.userAgent);
  const hasTouchOnlyProfile =
    navigator.maxTouchPoints > 1 && !navigator.userAgent.includes('Macintosh');
  const hasInsufficientDesktopWidth =
    typeof window !== 'undefined' &&
    (window.visualViewport?.width ?? window.innerWidth) <
      DEVICE_DETECTION.desktopEntryMinWidthPx;

  return hasMobileUserAgent ||
    hasTouchOnlyProfile ||
    hasInsufficientDesktopWidth
    ? 'mobile'
    : 'desktop';
};
