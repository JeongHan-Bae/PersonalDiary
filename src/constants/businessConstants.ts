export {
  APP_VERSION,
  APP_VERSION_LABEL,
  DIARY_EXPORT_SCHEMA,
  DIARY_EXPORT_VERSION,
  PERSONAL_DATA_SCHEMA,
  PERSONAL_DATA_VERSION,
  PERSONAL_DATA_VERSION_LABEL,
} from '@/constants/metadataConstants';

export const BUILTIN_MOOD_TYPES = [
  'joyful',
  'calm',
  'neutral',
  'tired',
  'sad',
  'angry',
  'anxious',
] as const;

export type DiaryLevelFieldId = 'moodLevel' | 'anxietyLevel' | 'energyLevel';

export type DiaryLevelTone = 'good' | 'neutral' | 'bad';

export interface DiaryLevelFieldConfig {
  inputMin: number;
  inputMax: number;
  displayMin: number;
  displayMax: number;
  defaultValue: number;
  toneRanges: Record<DiaryLevelTone, { min: number; max: number }>;
}

export const DIARY_LEVEL_FIELD_CONFIGS: Record<
  DiaryLevelFieldId,
  DiaryLevelFieldConfig
> = {
  moodLevel: {
    inputMin: 1,
    inputMax: 10,
    displayMin: 0,
    displayMax: 10,
    defaultValue: 6,
    toneRanges: {
      good: { min: 7, max: 10 },
      neutral: { min: 4, max: 6 },
      bad: { min: 1, max: 3 },
    },
  },
  anxietyLevel: {
    inputMin: 1,
    inputMax: 10,
    displayMin: 0,
    displayMax: 10,
    defaultValue: 3,
    toneRanges: {
      good: { min: 1, max: 3 },
      neutral: { min: 4, max: 6 },
      bad: { min: 7, max: 10 },
    },
  },
  energyLevel: {
    inputMin: 1,
    inputMax: 10,
    displayMin: 0,
    displayMax: 10,
    defaultValue: 7,
    toneRanges: {
      good: { min: 7, max: 10 },
      neutral: { min: 4, max: 6 },
      bad: { min: 1, max: 3 },
    },
  },
};

export interface DiaryPromptMessage {
  id: string;
  tag: string;
  text: string;
}

export const DIARY_PROMPT_MESSAGES = {
  lateNightCare: {
    id: 'lateNightCare',
    tag: 'late-night-care',
    text: 'Is something on your mind? You are doing enough. You are going to be okay.',
  },
  earlyDawnCare: {
    id: 'earlyDawnCare',
    tag: 'early-dawn-care',
    text: 'Did you wake up early, or are you still awake? You can tell me what is happening.',
  },
  morningStart: {
    id: 'morningStart',
    tag: 'morning-start',
    text: 'You are up early today. I hope the day feels kind to you. What would you like to write?',
  },
  lateMorningCheckIn: {
    id: 'lateMorningCheckIn',
    tag: 'late-morning-check-in',
    text: 'How is the weather today? I hope your morning is going smoothly.',
  },
  lunchCare: {
    id: 'lunchCare',
    tag: 'lunch-care',
    text: 'Did you eat well at lunch? Remember to care for yourself.',
  },
  afternoonCare: {
    id: 'afternoonCare',
    tag: 'afternoon-care',
    text: 'How are you feeling today? Remember to care for yourself.',
  },
  eveningReflection: {
    id: 'eveningReflection',
    tag: 'evening-reflection',
    text: 'Today was another full day. What would you like to keep from it?',
  },
  nightRest: {
    id: 'nightRest',
    tag: 'night-rest',
    text: 'You worked hard today. Rest early if you can, and remember that you are loved.',
  },
} as const satisfies Record<string, DiaryPromptMessage>;

export type DiaryPromptMessageId = keyof typeof DIARY_PROMPT_MESSAGES;

export const DIARY_FALLBACK_PROMPT_ID: DiaryPromptMessageId = 'afternoonCare';

export const DIARY_PROMPT_CANDIDATES_BY_HALF_HOUR_SEGMENT: readonly (readonly DiaryPromptMessageId[])[] = [
  ['lateNightCare'],
  ['lateNightCare'],
  ['lateNightCare'],
  ['lateNightCare'],
  ['lateNightCare'],
  ['lateNightCare'],
  ['lateNightCare'],
  ['lateNightCare'],
  ['earlyDawnCare'],
  ['earlyDawnCare'],
  ['earlyDawnCare'],
  ['earlyDawnCare'],
  ['morningStart'],
  ['morningStart'],
  ['morningStart'],
  ['morningStart'],
  ['morningStart'],
  ['morningStart'],
  ['lateMorningCheckIn'],
  ['lateMorningCheckIn'],
  ['lateMorningCheckIn'],
  ['lateMorningCheckIn'],
  ['lateMorningCheckIn'],
  ['lunchCare'],
  ['lunchCare'],
  ['lunchCare'],
  ['lunchCare'],
  ['afternoonCare'],
  ['afternoonCare'],
  ['afternoonCare'],
  ['afternoonCare'],
  ['afternoonCare'],
  ['afternoonCare'],
  ['afternoonCare'],
  ['afternoonCare'],
  ['afternoonCare'],
  ['eveningReflection'],
  ['eveningReflection'],
  ['eveningReflection'],
  ['eveningReflection'],
  ['nightRest'],
  ['nightRest'],
  ['nightRest'],
  ['nightRest'],
  ['nightRest'],
  ['nightRest'],
  ['nightRest'],
  ['nightRest'],
] as const;

export const DIARY_TIME_PERIODS = {
  dawn: {
    id: 'dawn',
    label: 'Dawn',
    startHour: 0,
    endHour: 6,
  },
  morning: {
    id: 'morning',
    label: 'Morning',
    startHour: 6,
    endHour: 12,
  },
  afternoon: {
    id: 'afternoon',
    label: 'Afternoon',
    startHour: 12,
    endHour: 18,
  },
  evening: {
    id: 'evening',
    label: 'Evening',
    startHour: 18,
    endHour: 24,
  },
} as const;

export type DiaryTimePeriodId = keyof typeof DIARY_TIME_PERIODS;

export interface ConstantSelectOption {
  id: string;
  label: string;
}

export const DIARY_TIME_PERIOD_OPTIONS: ConstantSelectOption[] =
  Object.values(DIARY_TIME_PERIODS).map((period) => ({
    id: period.id,
    label: period.label,
  }));

export const INCLUDE_OPTIONS: ConstantSelectOption[] = [
  {
    id: 'include',
    label: 'Include',
  },
  {
    id: 'skip',
    label: 'Skip',
  },
];

export const FILTER_MODE_OPTIONS: ConstantSelectOption[] = [
  {
    id: 'off',
    label: 'Off',
  },
  {
    id: 'on',
    label: 'On',
  },
];

export const TIME_ZONE_FILTER_MODE_OPTIONS: ConstantSelectOption[] = [
  {
    id: 'submitted',
    label: 'Submitted Zone',
  },
  {
    id: 'current',
    label: 'Current Zone',
  },
];

export const USER_PROFILE_TEXT_LIMITS = {
  status: 20,
  bio: 100,
} as const;

export const AVATAR_CROP_LIMITS = {
  minSize: 1,
} as const;

export const AVATAR_IMAGE_STORAGE_LIMITS = {
  minSourceSizePx: 1,
  minStoredSizePx: 128,
  pixelArtUpscaleThresholdPx: 128,
  pixelArtUpscaleFormulaOffsetPx: 63,
  pixelArtUpscaleEvenMultiplier: 2,
  thumbnailSizePx: 256,
  maxStoredSizePx: 4096,
} as const;

export const DEFAULT_USER_PROFILE_METADATA = {
  emptyText: '',
  statusEmoji: '',
  statusText: '',
  bio: '',
  pronounsVisible: false,
  pronounSubject: 'they',
  pronounObject: 'them',
  statusVisible: false,
} as const;

export const LOCAL_USER_NAME = {
  defaultDisplayName: 'Local User',
  numberedPrefix: 'Local User',
} as const;

export const PRONOUN_SUBJECT_OPTIONS: ConstantSelectOption[] = [
  {
    id: 'none',
    label: 'Do not specify',
  },
  {
    id: 'he',
    label: 'he',
  },
  {
    id: 'she',
    label: 'she',
  },
  {
    id: 'they',
    label: 'they',
  },
  {
    id: 'customize',
    label: 'Customize',
  },
];

export const PRONOUN_OBJECT_OPTIONS: ConstantSelectOption[] = [
  {
    id: 'him',
    label: 'him',
  },
  {
    id: 'her',
    label: 'her',
  },
  {
    id: 'them',
    label: 'them',
  },
  {
    id: 'customize',
    label: 'Customize',
  },
];

export const STATUS_VISIBILITY_OPTIONS: ConstantSelectOption[] = [
  {
    id: 'show',
    label: 'Show',
  },
  {
    id: 'hide',
    label: 'Hide',
  },
];

export const USER_MENU_ACTIONS = [
  {
    label: 'Switch User',
    danger: false,
  },
  {
    label: 'Merge Users',
    danger: false,
  },
  {
    label: 'Update Profile',
    danger: false,
  },
  {
    label: 'Create User',
    danger: false,
  },
  {
    label: 'Delete User',
    danger: true,
  },
  {
    label: 'Clear Data',
    danger: true,
  },
] as const;
