import { COOKIE_STORAGE_CONSENT } from '@/constants/storageConstants';

const getCookieValue = (cookieName: string): string | undefined => {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const encodedName = `${encodeURIComponent(cookieName)}=`;
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(encodedName));

  if (cookie === undefined) {
    return undefined;
  }

  return decodeURIComponent(cookie.slice(encodedName.length));
};

export const hasCookieStorageConsent = (): boolean =>
  getCookieValue(COOKIE_STORAGE_CONSENT.cookieName) ===
  COOKIE_STORAGE_CONSENT.acceptedValue;

export const acceptCookieStorageConsent = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = [
    `${encodeURIComponent(COOKIE_STORAGE_CONSENT.cookieName)}=${encodeURIComponent(
      COOKIE_STORAGE_CONSENT.acceptedValue,
    )}`,
    `Max-Age=${COOKIE_STORAGE_CONSENT.maxAgeSeconds}`,
    `Path=${COOKIE_STORAGE_CONSENT.path}`,
    `SameSite=${COOKIE_STORAGE_CONSENT.sameSite}`,
  ].join('; ');
};

export const closePageAfterCookieStorageConsentRejection = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.close();
  window.setTimeout(() => {
    window.location.replace('about:blank');
  }, 0);
};
