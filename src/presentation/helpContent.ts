import {
  APP_VERSION,
  APP_VERSION_LABEL,
  PERSONAL_DATA_VERSION,
  PERSONAL_DATA_VERSION_LABEL,
} from '@/constants/metadataConstants';

export interface HelpArchitectureCopy {
  title: string;
  body: string;
  hoverEasterEgg: string;
}

export interface HelpCopyrightCopy {
  title: string;
  symbol: string;
  year: number;
  author: string;
  email: string;
}

export interface HelpProductCopy {
  title: string;
  paragraphs: string[];
}

export interface HelpVersionCopy {
  title: string;
  appLabel: string;
  dataLabel: string;
  appVersion: readonly [number, number, number];
  dataVersion: number;
  appVersionLabel: string;
  dataVersionLabel: string;
}

export interface HelpContentViewModel {
  title: string;
  architecture: HelpArchitectureCopy;
  copyright: HelpCopyrightCopy;
  product: HelpProductCopy;
  version: HelpVersionCopy;
  closeLabel: string;
}

export const HELP_CONTENT: HelpContentViewModel = {
  title: 'Diary Guide',
  architecture: {
    title: 'Pure Frontend, TypeScript-driven',
    body: 'This local-first Diary runs entirely in the browser. Its application behavior is organized through typed TypeScript models, presentation state, service facades, use cases, and IndexedDB adapters.',
    hoverEasterEgg: 'TypeScript is not one of the greatest languages of the 21st century; it is the greatest language of the 21st century.',
  },
  copyright: {
    title: 'Copyright',
    symbol: '©',
    year: 2026,
    author: 'JeongHan-Bae/배정한',
    email: 'mastropseudo@gmail.com',
  },
  product: {
    title: 'About This Diary',
    paragraphs: [
      'Use this Diary to create entries, track mood and energy, manage local users, and keep avatar assets with your private data.',
      'Create or switch local users from User, write entries from New Diary, filter entries from the bottom controls, and use JSON import/export to back up, restore, or move your data.',
      'Import reconciles current state by UUID and updated time. Duplicate entries, tags, users, and avatar assets keep the latest updated record.',
      'If one duplicate entry is deleted and another is not, the latest updated record wins. When the deleted record is newer, the current state remains deleted.',
      'Deletion is a content behavior, not physical removal.',
      'Merging user B into user A keeps A as the target identity, so B does not overwrite A non-avatar profile fields. The merged avatar uses the avatar asset with the latest updated time.',
      'Importing duplicate user UUIDs is different from user merge: import keeps the latest updated user profile.',
      'This app is a pure frontend current-state service. It is not a log, version-history system, or Git-style history tool.',
      'If an old state is overwritten or updated, it cannot be recovered unless you made a JSON backup before that change.',
    ],
  },
  version: {
    title: 'Version',
    appLabel: 'App',
    dataLabel: 'Data',
    appVersion: APP_VERSION,
    dataVersion: PERSONAL_DATA_VERSION,
    appVersionLabel: APP_VERSION_LABEL,
    dataVersionLabel: PERSONAL_DATA_VERSION_LABEL,
  },
  closeLabel: 'Close',
};
