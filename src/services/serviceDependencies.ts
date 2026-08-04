import { createBrowserAvatarImageAdapter } from '@/adapters/browserAvatarImageAdapter';
import { createBrowserFrameSchedulerAdapter } from '@/adapters/browserFrameSchedulerAdapter';
import { createBrowserIdAndClockAdapter } from '@/adapters/browserIdAndClockAdapter';
import { createBrowserJsonFileAdapter } from '@/adapters/browserJsonFileAdapter';
import { createIndexedDbPersonalDataPersistenceAdapter } from '@/adapters/indexedDbPersonalDataPersistenceAdapter';

export const personalDataRepository =
  createIndexedDbPersonalDataPersistenceAdapter();

export const idAndClockPort = createBrowserIdAndClockAdapter();

export const jsonFilePort = createBrowserJsonFileAdapter();

export const avatarImagePort = createBrowserAvatarImageAdapter();

export const frameSchedulerPort = createBrowserFrameSchedulerAdapter();
