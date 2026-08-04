import type { IdAndClockPort } from '@/ports/idAndClockPort';

export const createBrowserIdAndClockAdapter = (): IdAndClockPort => ({
  createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  },

  createBase64Uuid(): string {
    const uuid = this.createId();

    return btoa(uuid).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  },

  nowIso(): string {
    return new Date().toISOString();
  },

  getLocalTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  },
});
