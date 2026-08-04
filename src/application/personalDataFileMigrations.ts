import {
  BUILTIN_MOOD_TYPES,
  PERSONAL_DATA_SCHEMA,
  PERSONAL_DATA_VERSION,
  type PersonalDataFileV1,
  type PersonalDataV1,
  type SupportedPersonalDataFile,
} from '@/models/personalData';
import type { IdAndClockPort } from '@/ports/idAndClockPort';

export type UnknownPersonalDataFileEnvelope = {
  schema?: unknown;
  version?: unknown;
  exportTime?: unknown;
  data?: unknown;
  avatarAssets?: unknown;
};

const EMPTY_SUBJECT_MASK_NUMERIC_VALUE = 0;
const EMPTY_SUBJECT_MASK_METADATA_VERSION = '';
const DEFAULT_SUBJECT_MASK_STATUS = 'analysis-failed';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

const isDiaryLevel = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= 10;

const isMoodType = (value: unknown): value is PersonalDataV1.MoodType => {
  return (
    typeof value === 'string' &&
    (BUILTIN_MOOD_TYPES.includes(value as (typeof BUILTIN_MOOD_TYPES)[number]) ||
      value.startsWith('custom:'))
  );
};

const isMetadata = (value: unknown): value is Record<string, unknown> => {
  return isRecord(value);
};

const getString = (
  record: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = record[key];

  return typeof value === 'string' ? value : undefined;
};

const getBoolean = (
  record: Record<string, unknown>,
  key: string,
): boolean | undefined => {
  const value = record[key];

  return typeof value === 'boolean' ? value : undefined;
};

const getNumber = (
  record: Record<string, unknown>,
  key: string,
): number | undefined => {
  const value = record[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
};

const getStringArray = (
  record: Record<string, unknown>,
  key: string,
): string[] => {
  const value = record[key];

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
};

const getMetadata = (
  record: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined => {
  const value = record[key];

  return isMetadata(value) ? value : undefined;
};

const getTimestamp = (
  record: Record<string, unknown>,
  preferredKey: string,
  fallbackKey: string,
  fallbackTimestamp: string,
): string => {
  return (
    getString(record, preferredKey) ??
    getString(record, fallbackKey) ??
    fallbackTimestamp
  );
};

const isDiaryEntryV1 = (
  value: unknown,
): value is PersonalDataV1.DiaryEntry => {
  if (!isRecord(value)) {
    return false;
  }

  const hasRequiredFields =
    typeof value.id === 'string' &&
    (value.userId === undefined || typeof value.userId === 'string') &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.date === 'string' &&
    (value.submittedAt === undefined || typeof value.submittedAt === 'string') &&
    (value.submittedTimeZone === undefined ||
      typeof value.submittedTimeZone === 'string') &&
    (value.content === undefined || typeof value.content === 'string') &&
    (value.deleted === undefined || typeof value.deleted === 'boolean') &&
    isStringArray(value.tags);

  if (!hasRequiredFields) {
    return false;
  }

  return (
    (value.title === undefined || typeof value.title === 'string') &&
    (value.mood === undefined || isMoodType(value.mood)) &&
    (value.moodLevel === undefined || isDiaryLevel(value.moodLevel)) &&
    (value.anxietyLevel === undefined || isDiaryLevel(value.anxietyLevel)) &&
    (value.energyLevel === undefined || isDiaryLevel(value.energyLevel)) &&
    (value.highlight === undefined || typeof value.highlight === 'string') &&
    (value.trouble === undefined || typeof value.trouble === 'string') &&
    (value.bodyFeeling === undefined || typeof value.bodyFeeling === 'string') &&
    (value.metadata === undefined || isMetadata(value.metadata))
  );
};

const isTagV1 = (value: unknown): value is PersonalDataV1.Tag => {
  if (!isRecord(value)) {
    return false;
  }

  const hasRequiredFields =
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string';

  if (!hasRequiredFields) {
    return false;
  }

  return value.metadata === undefined || isMetadata(value.metadata);
};

const isSubjectMaskMetadata = (
  value: unknown,
): value is PersonalDataV1.AvatarAsset['maskMetadata'] => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.version === 'string' &&
    (value.status === 'success' ||
      value.status === 'no-subject' ||
      value.status === 'analysis-failed') &&
    typeof value.width === 'number' &&
    typeof value.height === 'number' &&
    typeof value.foregroundAreaRatio === 'number' &&
    typeof value.componentDominance === 'number' &&
    typeof value.hullCompactness === 'number' &&
    typeof value.solidity === 'number' &&
    typeof value.centerScore === 'number' &&
    typeof value.confidence === 'number'
  );
};

const normalizeSubjectMaskMetadata = (
  value: unknown,
): PersonalDataV1.AvatarAsset['maskMetadata'] => {
  if (isSubjectMaskMetadata(value)) {
    return value;
  }

  const metadata = isRecord(value) ? value : {};
  const status = metadata.status;

  return {
    version: getString(metadata, 'version') ?? EMPTY_SUBJECT_MASK_METADATA_VERSION,
    status:
      status === 'success' ||
      status === 'no-subject' ||
      status === 'analysis-failed'
        ? status
        : DEFAULT_SUBJECT_MASK_STATUS,
    width: getNumber(metadata, 'width') ?? EMPTY_SUBJECT_MASK_NUMERIC_VALUE,
    height: getNumber(metadata, 'height') ?? EMPTY_SUBJECT_MASK_NUMERIC_VALUE,
    foregroundAreaRatio:
      getNumber(metadata, 'foregroundAreaRatio') ??
      EMPTY_SUBJECT_MASK_NUMERIC_VALUE,
    componentDominance:
      getNumber(metadata, 'componentDominance') ??
      EMPTY_SUBJECT_MASK_NUMERIC_VALUE,
    hullCompactness:
      getNumber(metadata, 'hullCompactness') ??
      EMPTY_SUBJECT_MASK_NUMERIC_VALUE,
    solidity: getNumber(metadata, 'solidity') ?? EMPTY_SUBJECT_MASK_NUMERIC_VALUE,
    centerScore:
      getNumber(metadata, 'centerScore') ?? EMPTY_SUBJECT_MASK_NUMERIC_VALUE,
    confidence:
      getNumber(metadata, 'confidence') ?? EMPTY_SUBJECT_MASK_NUMERIC_VALUE,
  };
};

const isAvatarAssetV1 = (
  value: unknown,
): value is PersonalDataV1.AvatarAsset => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.originalImageDataUrl === 'string' &&
    typeof value.originalMimeType === 'string' &&
    (value.thumbnailImageDataUrl === undefined ||
      typeof value.thumbnailImageDataUrl === 'string') &&
    (value.maskImageDataUrl === undefined ||
      typeof value.maskImageDataUrl === 'string') &&
    isSubjectMaskMetadata(value.maskMetadata) &&
    (value.metadata === undefined || isMetadata(value.metadata))
  );
};

const isUserProfileV1 = (
  value: unknown,
): value is PersonalDataV1.UserProfile => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.displayName === 'string' &&
    (value.avatarAssetId === undefined || typeof value.avatarAssetId === 'string') &&
    (value.metadata === undefined || isMetadata(value.metadata))
  );
};

const isPersonalDataFileV1Content = (
  value: unknown,
): value is PersonalDataFileV1['data'] => {
  return (
    isRecord(value) &&
    Array.isArray(value.entries) &&
    value.entries.every(isDiaryEntryV1) &&
    Array.isArray(value.tags) &&
    value.tags.every(isTagV1) &&
    Array.isArray(value.users) &&
    value.users.every(isUserProfileV1) &&
    (value.activeUserId === undefined || typeof value.activeUserId === 'string')
  );
};

export const isPersonalDataFileV1 = (
  value: unknown,
): value is PersonalDataFileV1 => {
  if (!isRecord(value)) {
    return false;
  }

  const envelope = value as UnknownPersonalDataFileEnvelope;
  const data = envelope.data;

  return (
    envelope.schema === PERSONAL_DATA_SCHEMA &&
    envelope.version === PERSONAL_DATA_VERSION &&
    typeof envelope.exportTime === 'string' &&
    isPersonalDataFileV1Content(data) &&
    Array.isArray(envelope.avatarAssets) &&
    envelope.avatarAssets.every(isAvatarAssetV1)
  );
};

const normalizeDiaryEntryV1 = (
  value: unknown,
  idAndClock: IdAndClockPort,
  fallbackTimestamp: string,
): PersonalDataV1.DiaryEntry | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const createdAt = getTimestamp(
    value,
    'createdAt',
    'updatedAt',
    fallbackTimestamp,
  );
  const entry: PersonalDataV1.DiaryEntry = {
    id: getString(value, 'id') ?? idAndClock.createBase64Uuid(),
    createdAt,
    updatedAt: getString(value, 'updatedAt') ?? createdAt,
    date: getString(value, 'date') ?? '',
    tags: getStringArray(value, 'tags'),
  };
  const userId = getString(value, 'userId');
  const submittedAt = getString(value, 'submittedAt');
  const submittedTimeZone = getString(value, 'submittedTimeZone');
  const title = getString(value, 'title');
  const content = getString(value, 'content');
  const mood = value.mood;
  const moodLevel = value.moodLevel;
  const anxietyLevel = value.anxietyLevel;
  const energyLevel = value.energyLevel;
  const highlight = getString(value, 'highlight');
  const trouble = getString(value, 'trouble');
  const bodyFeeling = getString(value, 'bodyFeeling');
  const deleted = getBoolean(value, 'deleted');
  const metadata = getMetadata(value, 'metadata');

  if (userId !== undefined) {
    entry.userId = userId;
  }

  if (submittedAt !== undefined) {
    entry.submittedAt = submittedAt;
  }

  if (submittedTimeZone !== undefined) {
    entry.submittedTimeZone = submittedTimeZone;
  }

  if (title !== undefined) {
    entry.title = title;
  }

  if (content !== undefined) {
    entry.content = content;
  }

  if (isMoodType(mood)) {
    entry.mood = mood;
  }

  if (isDiaryLevel(moodLevel)) {
    entry.moodLevel = moodLevel;
  }

  if (isDiaryLevel(anxietyLevel)) {
    entry.anxietyLevel = anxietyLevel;
  }

  if (isDiaryLevel(energyLevel)) {
    entry.energyLevel = energyLevel;
  }

  if (highlight !== undefined) {
    entry.highlight = highlight;
  }

  if (trouble !== undefined) {
    entry.trouble = trouble;
  }

  if (bodyFeeling !== undefined) {
    entry.bodyFeeling = bodyFeeling;
  }

  if (deleted !== undefined) {
    entry.deleted = deleted;
  }

  if (metadata !== undefined) {
    entry.metadata = metadata;
  }

  return entry;
};

const normalizeTagV1 = (
  value: unknown,
  idAndClock: IdAndClockPort,
  fallbackTimestamp: string,
): PersonalDataV1.Tag | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const createdAt = getTimestamp(
    value,
    'createdAt',
    'updatedAt',
    fallbackTimestamp,
  );
  const tag: PersonalDataV1.Tag = {
    id: getString(value, 'id') ?? idAndClock.createId(),
    name: getString(value, 'name') ?? '',
    createdAt,
    updatedAt: getString(value, 'updatedAt') ?? createdAt,
  };
  const metadata = getMetadata(value, 'metadata');

  if (metadata !== undefined) {
    tag.metadata = metadata;
  }

  return tag;
};

const normalizeUserProfileV1 = (
  value: unknown,
  idAndClock: IdAndClockPort,
  fallbackTimestamp: string,
): PersonalDataV1.UserProfile | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const createdAt = getTimestamp(
    value,
    'createdAt',
    'updatedAt',
    fallbackTimestamp,
  );
  const user: PersonalDataV1.UserProfile = {
    id: getString(value, 'id') ?? idAndClock.createBase64Uuid(),
    displayName: getString(value, 'displayName') ?? '',
    createdAt,
    updatedAt: getString(value, 'updatedAt') ?? createdAt,
  };
  const avatarAssetId = getString(value, 'avatarAssetId');
  const metadata = getMetadata(value, 'metadata');

  if (avatarAssetId !== undefined) {
    user.avatarAssetId = avatarAssetId;
  }

  if (metadata !== undefined) {
    user.metadata = metadata;
  }

  return user;
};

const normalizeAvatarAssetV1 = (
  value: unknown,
  idAndClock: IdAndClockPort,
  fallbackTimestamp: string,
): PersonalDataV1.AvatarAsset | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const createdAt = getTimestamp(
    value,
    'createdAt',
    'updatedAt',
    fallbackTimestamp,
  );
  const avatarAsset: PersonalDataV1.AvatarAsset = {
    id: getString(value, 'id') ?? idAndClock.createId(),
    createdAt,
    updatedAt: getString(value, 'updatedAt') ?? createdAt,
    originalImageDataUrl: getString(value, 'originalImageDataUrl') ?? '',
    originalMimeType: getString(value, 'originalMimeType') ?? '',
    maskMetadata: normalizeSubjectMaskMetadata(value.maskMetadata),
  };
  const thumbnailImageDataUrl = getString(value, 'thumbnailImageDataUrl');
  const maskImageDataUrl = getString(value, 'maskImageDataUrl');
  const metadata = getMetadata(value, 'metadata');

  if (thumbnailImageDataUrl !== undefined) {
    avatarAsset.thumbnailImageDataUrl = thumbnailImageDataUrl;
  }

  if (maskImageDataUrl !== undefined) {
    avatarAsset.maskImageDataUrl = maskImageDataUrl;
  }

  if (metadata !== undefined) {
    avatarAsset.metadata = metadata;
  }

  return avatarAsset;
};

const normalizeCollection = <T>(
  value: unknown,
  normalizeItem: (item: unknown) => T | undefined,
): T[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const normalizedItem = normalizeItem(item);

    return normalizedItem === undefined ? [] : [normalizedItem];
  });
};

const normalizePersonalDataFileV1 = (
  value: unknown,
  idAndClock: IdAndClockPort,
): PersonalDataFileV1 => {
  if (!isRecord(value)) {
    throw new Error('Unsupported personal data file. Expected a JSON object.');
  }

  const fallbackTimestamp = idAndClock.nowIso();
  const envelope = value as UnknownPersonalDataFileEnvelope;
  const data = isRecord(envelope.data) ? envelope.data : value;
  const avatarAssetsValue = Array.isArray(envelope.avatarAssets)
    ? envelope.avatarAssets
    : data.avatarAssets;
  const fileData: PersonalDataFileV1['data'] = {
    entries: normalizeCollection(data.entries, (item) =>
      normalizeDiaryEntryV1(item, idAndClock, fallbackTimestamp),
    ),
    tags: normalizeCollection(data.tags, (item) =>
      normalizeTagV1(item, idAndClock, fallbackTimestamp),
    ),
    users: normalizeCollection(data.users, (item) =>
      normalizeUserProfileV1(item, idAndClock, fallbackTimestamp),
    ),
  };
  const activeUserId = getString(data, 'activeUserId');

  if (activeUserId !== undefined) {
    fileData.activeUserId = activeUserId;
  }

  return {
    schema: PERSONAL_DATA_SCHEMA,
    version: PERSONAL_DATA_VERSION,
    exportTime: getString(value, 'exportTime') ?? fallbackTimestamp,
    data: fileData,
    avatarAssets: normalizeCollection(avatarAssetsValue, (item) =>
      normalizeAvatarAssetV1(item, idAndClock, fallbackTimestamp),
    ),
  };
};

export const extractPersonalDataFile = (
  value: unknown,
  idAndClock: IdAndClockPort,
): SupportedPersonalDataFile => {
  if (isPersonalDataFileV1(value)) {
    return value;
  }

  return normalizePersonalDataFileV1(value, idAndClock);
};

export const migratePersonalDataFile = extractPersonalDataFile;

export const isDiaryExportV1 = isPersonalDataFileV1;

export const migrateDiaryExport = extractPersonalDataFile;
