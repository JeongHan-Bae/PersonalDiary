import { PERSONAL_DATA_VERSION } from '@/constants/metadataConstants';

export const DATABASE_NAME = 'personal-diary-local-first-app';

export const CURRENT_DATABASE_VERSION = PERSONAL_DATA_VERSION;

export const COOKIE_STORAGE_CONSENT = {
  cookieName: 'personal-diary-cookie-storage-consent',
  acceptedValue: 'accepted',
  maxAgeSeconds: 31_536_000,
  path: '/',
  sameSite: 'Lax',
} as const;

export interface DatabaseVersionStoreSchema {
  entries: string;
  tags: string;
  avatarAssets: string;
  users: string;
  appState: string;
}

export const DATABASE_VERSION_STORES: Record<number, DatabaseVersionStoreSchema> = {
  [PERSONAL_DATA_VERSION]: {
    entries: 'id, date, createdAt, updatedAt, mood, *tags',
    tags: 'id, name, createdAt, updatedAt',
    avatarAssets: 'id, createdAt, updatedAt, originalMimeType, maskMetadata.status',
    users: 'id, createdAt, updatedAt, displayName, avatarAssetId',
    appState: 'key',
  },
};
