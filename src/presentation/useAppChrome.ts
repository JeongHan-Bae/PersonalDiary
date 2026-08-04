import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';

import type { AvatarRenderAsset } from '@/models/avatar';
import type { PersonalDataV1 } from '@/models/personalData';
import {
  clearAllPersonalData,
  createAvatarAsset,
  createUserProfile,
  deleteAvatarAsset,
  deleteUserProfile,
  getActiveUser,
  getAvatarAsset,
  listUsers,
  mergeUserProfiles,
  saveAvatarAsset,
  switchActiveUser,
  updateUserProfile,
} from '@/services/personalDataService';
import type { SelectOptionViewModel } from '@/presentation/formControlViewModels';
import {
  buildAvatarAssetDraftFromDataUrl,
  createAvatarThumbnailDataUrl,
  createAvatarCropSourceFromFile,
  cropAvatarSourceToSquareDataUrl,
  type AvatarCropSource,
} from '@/services/avatarRenderService';
import {
  PRONOUN_OBJECT_OPTIONS,
  PRONOUN_SUBJECT_OPTIONS,
  STATUS_VISIBILITY_OPTIONS,
  USER_MENU_ACTIONS,
  USER_PROFILE_TEXT_LIMITS,
  AVATAR_CROP_LIMITS,
  DEFAULT_USER_PROFILE_METADATA,
  LOCAL_USER_NAME,
} from '@/constants/businessConstants';
import {
  APP_DATE_TIME_FORMATS,
  CLOCK_TICK,
  LOADING_PLACEHOLDER_DELAYS,
  PERCENT_FULL,
  USER_MENU_MEASUREMENT,
} from '@/constants/visualConstants';
import {
  APP_LANGUAGE_OPTIONS,
  DEFAULT_APP_LANGUAGE_ID,
  type AppLanguageId,
} from '@/constants/metadataConstants';
import {
  APP_THEME_OPTIONS,
  DEFAULT_APP_THEME_NAME,
  type AppThemeName,
} from '@/constants/themeConstants';
import {
  applyLanguage,
  getInitialLanguage,
  isLanguageId,
} from '@/presentation/languageRuntime';
import {
  applyTheme,
  getInitialTheme,
  isThemeName,
} from '@/presentation/themeRuntime';
import { useDelayedVisibility } from '@/presentation/useDelayedVisibility';
import { APP_CHROME_CONTENT } from '@/presentation/appChromeContent';
import { buildTwoLineMiddleEllipsisLabel } from '@/presentation/twoLineMiddleEllipsis';

export type UserActionModalKind =
  | 'create-user'
  | 'update-data'
  | 'merge-users'
  | 'switch-user'
  | 'empty-users';

export type ConfirmationKind = 'delete-user' | 'clear-data';

export interface UserOptionViewModel extends SelectOptionViewModel {
  id: string;
  label: string;
}

interface UserProfileMetadataViewModel {
  pronounsVisible: boolean;
  pronounSubject: string;
  pronounObject: string;
  statusEmoji: string;
  statusText: string;
  bio: string;
  statusVisible: boolean;
}

interface UpdateUserSnapshot {
  displayName: string;
  pronounsVisible: boolean;
  pronounSubject: string;
  pronounObject: string;
  statusVisible: boolean;
  statusEmoji: string;
  statusText: string;
  bio: string;
}

let textMeasureCanvas: HTMLCanvasElement | undefined;

const measureTextWidth = (text: string, font: string): number => {
  if (typeof document === 'undefined') {
    return text.length * USER_MENU_MEASUREMENT.fallbackCharacterWidthPx;
  }

  textMeasureCanvas ??= document.createElement('canvas');
  const context = textMeasureCanvas.getContext('2d');

  if (context === null) {
    return text.length * USER_MENU_MEASUREMENT.fallbackCharacterWidthPx;
  }

  context.font = font;

  return context.measureText(text).width;
};

const getViewportWidth = (): number =>
  typeof window === 'undefined'
    ? USER_MENU_MEASUREMENT.fallbackViewportWidthPx
    : Math.floor(window.visualViewport?.width ?? window.innerWidth);

const getUserMenuBaseWidth = (): number => {
  return Math.ceil(
    Math.max(
      ...USER_MENU_ACTIONS.map((action) => {
        const actionLabelNoWrapWidth = measureTextWidth(
          action.label,
          USER_MENU_MEASUREMENT.menuFont,
        );
        const badgeWidth = action.danger
          ? USER_MENU_MEASUREMENT.dangerBadgeGapPx +
            measureTextWidth(
              APP_CHROME_CONTENT.labels.danger,
              USER_MENU_MEASUREMENT.dangerBadgeFont,
            ) +
            USER_MENU_MEASUREMENT.dangerBadgeHorizontalPaddingPx
          : 0;

        return (
          actionLabelNoWrapWidth +
          badgeWidth +
          USER_MENU_MEASUREMENT.itemHorizontalPaddingPx +
          USER_MENU_MEASUREMENT.panelHorizontalPaddingPx
        );
      }),
    ),
  );
};

const getUserButtonTextWidth = (
  containerWidth: number,
  avatarWidth: number,
  gap: number,
  horizontalPadding: number,
): number => {
  return Math.max(1, containerWidth - avatarWidth - gap - horizontalPadding);
};

const themeOptions: SelectOptionViewModel[] = APP_THEME_OPTIONS;
const languageOptions: SelectOptionViewModel[] = APP_LANGUAGE_OPTIONS;
const pronounSubjectOptions: SelectOptionViewModel[] = PRONOUN_SUBJECT_OPTIONS;
const pronounObjectOptions: SelectOptionViewModel[] = PRONOUN_OBJECT_OPTIONS;
const statusVisibilityOptions: SelectOptionViewModel[] =
  STATUS_VISIBILITY_OPTIONS;

const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return 'th';
  }

  const lastDigit = day % 10;

  if (lastDigit === 1) {
    return 'st';
  }

  if (lastDigit === 2) {
    return 'nd';
  }

  if (lastDigit === 3) {
    return 'rd';
  }

  return 'th';
};

const formatDateLabel = (date: Date): string =>
  `${new Intl.DateTimeFormat(
    APP_DATE_TIME_FORMATS.locale,
    APP_DATE_TIME_FORMATS.monthLabel,
  ).format(date)} ${
    date.getDate()
  }${getOrdinalSuffix(date.getDate())} ${date.getFullYear()}, ${new Intl.DateTimeFormat(
    APP_DATE_TIME_FORMATS.locale,
    APP_DATE_TIME_FORMATS.weekdayLabel,
  ).format(date)}`;

const formatMobileDateLine = (date: Date): string =>
  `${new Intl.DateTimeFormat(
    APP_DATE_TIME_FORMATS.locale,
    APP_DATE_TIME_FORMATS.monthLabel,
  ).format(date)} ${date.getDate()}${getOrdinalSuffix(
    date.getDate(),
  )} ${date.getFullYear()}`;

const formatWeekdayLabel = (date: Date): string =>
  new Intl.DateTimeFormat(
    APP_DATE_TIME_FORMATS.locale,
    APP_DATE_TIME_FORMATS.weekdayLabel,
  ).format(date);

const formatTimeLabel = (date: Date): string =>
  new Intl.DateTimeFormat(
    APP_DATE_TIME_FORMATS.locale,
    APP_DATE_TIME_FORMATS.timeLabel,
  ).format(date);

const readStringMetadataValue = (
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | undefined => {
  const value = metadata?.[key];

  return typeof value === 'string' ? value : undefined;
};

const readBooleanMetadataValue = (
  metadata: Record<string, unknown> | undefined,
  key: string,
): boolean | undefined => {
  const value = metadata?.[key];

  return typeof value === 'boolean' ? value : undefined;
};

const isCombiningCharacter = (character: string): boolean =>
  /\p{Mark}/u.test(character) || character === '\u200d';

const isEmojiModifier = (character: string): boolean =>
  /\p{Emoji_Modifier}/u.test(character);

const getWideCharacterCount = (value: string): number =>
  Array.from(value).filter((character) => !isCombiningCharacter(character)).length;

const limitWideCharacters = (value: string, limit: number): string => {
  let count = 0;
  let result = '';

  for (const character of Array.from(value)) {
    if (!isCombiningCharacter(character)) {
      if (count >= limit) {
        break;
      }

      count += 1;
    }

    result += character;
  }

  return result;
};

interface GraphemeSegment {
  segment: string;
}

interface GraphemeSegmenter {
  segment(value: string): Iterable<GraphemeSegment>;
}

interface GraphemeSegmenterConstructor {
  new (
    locale: string | undefined,
    options: { granularity: 'grapheme' },
  ): GraphemeSegmenter;
}

const getIntlGraphemeSegmenter = ():
  | GraphemeSegmenterConstructor
  | undefined => {
  const maybeSegmenter = (Intl as unknown as { Segmenter?: unknown }).Segmenter;

  return typeof maybeSegmenter === 'function'
    ? maybeSegmenter as GraphemeSegmenterConstructor
    : undefined;
};

const getFirstVisualCharacterFallback = (value: string): string => {
  let result = '';
  let hasBaseCharacter = false;
  let shouldIncludeNextBaseCharacter = false;

  for (const character of Array.from(value.trim())) {
    if (!hasBaseCharacter) {
      if (isCombiningCharacter(character)) {
        continue;
      }

      result += character;
      hasBaseCharacter = true;
      continue;
    }

    if (isCombiningCharacter(character) || isEmojiModifier(character)) {
      result += character;
      shouldIncludeNextBaseCharacter = character === '\u200d';
      continue;
    }

    if (shouldIncludeNextBaseCharacter) {
      result += character;
      shouldIncludeNextBaseCharacter = false;
      continue;
    }

    break;
  }

  return result;
};

const getFirstVisualCharacter = (value: string): string => {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return DEFAULT_USER_PROFILE_METADATA.emptyText;
  }

  const Segmenter = getIntlGraphemeSegmenter();

  if (Segmenter !== undefined) {
    const segmenter = new Segmenter(undefined, { granularity: 'grapheme' });

    for (const segment of segmenter.segment(trimmedValue)) {
      if (
        Array.from(segment.segment).some(
          (character) => !isCombiningCharacter(character),
        )
      ) {
        return segment.segment;
      }
    }

    return DEFAULT_USER_PROFILE_METADATA.emptyText;
  }

  return getFirstVisualCharacterFallback(trimmedValue);
};

const getPronounObjectDefault = (subject: string): string => {
  if (subject === 'he') {
    return 'him';
  }

  if (subject === 'she') {
    return 'her';
  }

  if (subject === DEFAULT_USER_PROFILE_METADATA.pronounSubject) {
    return DEFAULT_USER_PROFILE_METADATA.pronounObject;
  }

  return DEFAULT_USER_PROFILE_METADATA.pronounObject;
};

const clonePlainJson = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

const createProfileMetadataViewModel = (
  user: PersonalDataV1.UserProfile | undefined,
): UserProfileMetadataViewModel => ({
  statusEmoji:
    readStringMetadataValue(user?.metadata, 'statusEmoji') ??
    DEFAULT_USER_PROFILE_METADATA.statusEmoji,
  statusText:
    readStringMetadataValue(user?.metadata, 'statusText') ??
    DEFAULT_USER_PROFILE_METADATA.statusText,
  bio:
    readStringMetadataValue(user?.metadata, 'bio') ??
    DEFAULT_USER_PROFILE_METADATA.bio,
  pronounsVisible:
    readBooleanMetadataValue(user?.metadata, 'pronounsVisible') ??
    DEFAULT_USER_PROFILE_METADATA.pronounsVisible,
  pronounSubject:
    readStringMetadataValue(user?.metadata, 'pronounSubject') ??
    DEFAULT_USER_PROFILE_METADATA.pronounSubject,
  pronounObject:
    readStringMetadataValue(user?.metadata, 'pronounObject') ??
    DEFAULT_USER_PROFILE_METADATA.pronounObject,
  statusVisible:
    readBooleanMetadataValue(user?.metadata, 'statusVisible') ??
    DEFAULT_USER_PROFILE_METADATA.statusVisible,
});

export const useAppChrome = () => {
  const currentDateLabel = ref(formatDateLabel(new Date()));
  const currentMobileDateLine = ref(formatMobileDateLine(new Date()));
  const currentWeekdayLabel = ref(formatWeekdayLabel(new Date()));
  const currentTimeLabel = ref(formatTimeLabel(new Date()));
  let dateTimeTimer: ReturnType<typeof window.setTimeout> | undefined;
  let avatarRefreshRunId = 0;
  const theme = ref<AppThemeName>(DEFAULT_APP_THEME_NAME);
  const languageId = ref<AppLanguageId>(DEFAULT_APP_LANGUAGE_ID);
  const viewportWidth = ref(getViewportWidth());
  const users = ref<PersonalDataV1.UserProfile[]>([]);
  const activeUser = ref<PersonalDataV1.UserProfile>();
  const activeAvatarDataUrl = ref<string>();
  const activeAvatarThumbnailDataUrl = ref<string>();
  const activeAvatarMaskDataUrl = ref<string>();
  const activeAvatarAsset = ref<PersonalDataV1.AvatarAsset>();
  const isUserLoading = ref(true);
  const delayedUserPlaceholder = useDelayedVisibility(
    LOADING_PLACEHOLDER_DELAYS.userProfileMs,
  );
  const avatarFileInput = ref<HTMLInputElement>();
  const userMenuRoot = ref<HTMLElement>();
  const isUserMenuOpen = ref(false);
  const isHelpModalOpen = ref(false);
  const userActionModalKind = ref<UserActionModalKind>();
  const isUserActionCloseConfirmationOpen = ref(false);
  const confirmationKind = ref<ConfirmationKind>();
  const confirmationStep = ref(1);
  const createUserName = ref('');
  const mergeTargetUserId = ref('');
  const mergeSourceUserIds = ref<string[]>([]);
  const mergeUsersErrorMessage = ref('');
  const updateUserName = ref('');
  const updateUserPronounsVisible = ref(false);
  const updateUserPronounSubject = ref('');
  const updateUserPronounObject = ref('');
  const updateUserStatusVisible = ref(true);
  const updateUserStatusEmoji = ref('');
  const updateUserStatusText = ref('');
  const updateUserBio = ref('');
  const updateAvatarCropSource = ref<AvatarCropSource>();
  const updateAvatarCropX = ref(0);
  const updateAvatarCropY = ref(0);
  const updateAvatarCropSize = ref(1);
  const updateAvatarDraft = ref<Omit<
    AvatarRenderAsset,
    'id' | 'createdAt' | 'updatedAt'
  >>();
  const updateAvatarPreviewDataUrl = ref<string>();
  const updateAvatarMaskPreviewDataUrl = ref<string>();
  const isUpdateAvatarDeleted = ref(false);
  const isUpdateAvatarMaskDeleted = ref(false);
  const updateProfileErrorMessage = ref('');
  const savedUpdateUserSnapshot = ref<UpdateUserSnapshot>({
    displayName: '',
    pronounsVisible: DEFAULT_USER_PROFILE_METADATA.pronounsVisible,
    pronounSubject: DEFAULT_USER_PROFILE_METADATA.pronounSubject,
    pronounObject: DEFAULT_USER_PROFILE_METADATA.pronounObject,
    statusVisible: DEFAULT_USER_PROFILE_METADATA.statusVisible,
    statusEmoji: DEFAULT_USER_PROFILE_METADATA.statusEmoji,
    statusText: DEFAULT_USER_PROFILE_METADATA.statusText,
    bio: DEFAULT_USER_PROFILE_METADATA.bio,
  });

  const themeId = computed(() => theme.value);

  const userOptions = computed<UserOptionViewModel[]>(() =>
    users.value.map((user) => ({
      id: user.id,
      label: user.displayName,
    })),
  );

  const activeUserLabel = computed(
    () =>
      activeUser.value?.displayName ??
      (!isUserLoading.value || delayedUserPlaceholder.isVisible.value
        ? APP_CHROME_CONTENT.labels.noUser
        : ''),
  );

  const activeUserProfile = computed(() =>
    createProfileMetadataViewModel(activeUser.value),
  );

  const activeUserBio = computed(() => activeUserProfile.value.bio);

  const activeUserBioLabel = computed(() =>
    activeUser.value === undefined
      ? ''
      : activeUserProfile.value.bio.trim() === ''
      ? APP_CHROME_CONTENT.messages.noBio
      : activeUserProfile.value.bio,
  );

  const activeUserPronounsVisible = computed(
    () => activeUserProfile.value.pronounsVisible,
  );

  const activeUserPronounsLabel = computed(
    () =>
      `${activeUserProfile.value.pronounSubject}/${activeUserProfile.value.pronounObject}`,
  );

  const activeUserStatusEmoji = computed(
    () => activeUserProfile.value.statusEmoji,
  );

  const activeUserStatusText = computed(
    () => activeUserProfile.value.statusText,
  );

  const activeUserStatusVisible = computed(
    () =>
      activeUserProfile.value.statusVisible &&
      (activeUserProfile.value.statusEmoji.trim() !== '' ||
        activeUserProfile.value.statusText.trim() !== ''),
  );

  const hasActiveUser = computed(() => activeUser.value !== undefined);

  const updateUserStatusTextCount = computed(() =>
    getWideCharacterCount(updateUserStatusText.value),
  );

  const updateUserBioCount = computed(() =>
    getWideCharacterCount(updateUserBio.value),
  );

  const updateUserStatusVisibilityId = computed(() =>
    updateUserStatusVisible.value ? 'show' : 'hide',
  );

  const updateAvatarCropMaxX = computed(() => {
    const source = updateAvatarCropSource.value;

    return source === undefined
      ? 0
      : Math.max(0, source.dimensions.width - updateAvatarCropSize.value);
  });

  const updateAvatarCropMaxY = computed(() => {
    const source = updateAvatarCropSource.value;

    return source === undefined
      ? 0
      : Math.max(0, source.dimensions.height - updateAvatarCropSize.value);
  });

  const updateAvatarCropMaxSize = computed(() => {
    const source = updateAvatarCropSource.value;

    return source === undefined
      ? 1
      : Math.min(source.dimensions.width, source.dimensions.height);
  });

  const updateAvatarCropPreviewStyle = computed<CSSProperties>(() => {
    const source = updateAvatarCropSource.value;

    if (source === undefined) {
      return {};
    }

    return {
      width: `${
        (source.dimensions.width / updateAvatarCropSize.value) * PERCENT_FULL
      }%`,
      height: `${
        (source.dimensions.height / updateAvatarCropSize.value) * PERCENT_FULL
      }%`,
      left: `-${
        (updateAvatarCropX.value / updateAvatarCropSize.value) * PERCENT_FULL
      }%`,
      top: `-${
        (updateAvatarCropY.value / updateAvatarCropSize.value) * PERCENT_FULL
      }%`,
    };
  });

  const updateUserPronounSubjectPreset = computed(() =>
    !updateUserPronounsVisible.value
      ? 'none'
      : PRONOUN_SUBJECT_OPTIONS.some(
        (option) => option.id === updateUserPronounSubject.value,
      ) &&
        updateUserPronounSubject.value !== 'none' &&
        updateUserPronounSubject.value !== 'customize'
      ? updateUserPronounSubject.value
      : 'customize',
  );

  const updateUserPronounObjectPreset = computed(() =>
    !updateUserPronounsVisible.value
      ? 'none'
      : PRONOUN_OBJECT_OPTIONS.some(
        (option) => option.id === updateUserPronounObject.value,
      ) && updateUserPronounObject.value !== 'customize'
      ? updateUserPronounObject.value
      : 'customize',
  );

  const setUpdateUserPronounSubjectPreset = (subject: string): void => {
    if (subject === 'none') {
      updateUserPronounsVisible.value = false;
      updateUserPronounSubject.value = '';
      updateUserPronounObject.value = '';
      return;
    }

    updateUserPronounsVisible.value = true;

    if (subject === 'customize') {
      updateUserPronounSubject.value = '';
      updateUserPronounObject.value = '';
      return;
    }

    updateUserPronounSubject.value = subject;
    updateUserPronounObject.value = getPronounObjectDefault(subject);
  };

  const setUpdateUserPronounObjectPreset = (object: string): void => {
    updateUserPronounObject.value = object === 'customize' ? '' : object;
  };

  const setUpdateUserStatusVisibility = (visibility: string): void => {
    updateUserStatusVisible.value = visibility === 'show';
  };

  const normalizeUpdateUserStatusEmojiInput = (): void => {
    updateUserStatusEmoji.value = getFirstVisualCharacter(
      updateUserStatusEmoji.value,
    );
  };

  const isUpdateProfileDirty = computed(() => {
    const snapshot = savedUpdateUserSnapshot.value;

    return (
      updateUserName.value !== snapshot.displayName ||
      updateUserPronounsVisible.value !== snapshot.pronounsVisible ||
      updateUserPronounSubject.value !== snapshot.pronounSubject ||
      updateUserPronounObject.value !== snapshot.pronounObject ||
      updateUserStatusVisible.value !== snapshot.statusVisible ||
      updateUserStatusEmoji.value !== snapshot.statusEmoji ||
      updateUserStatusText.value !== snapshot.statusText ||
      updateUserBio.value !== snapshot.bio ||
      updateAvatarDraft.value !== undefined ||
      updateAvatarCropSource.value !== undefined ||
      isUpdateAvatarDeleted.value ||
      isUpdateAvatarMaskDeleted.value
    );
  });

  const isUpdateAvatarMaskPreviewPending = computed(
    () => updateAvatarCropSource.value !== undefined,
  );

  const isUserActionModalOpen = computed(
    () => userActionModalKind.value !== undefined,
  );

  const mergeTargetUserOptions = computed<SelectOptionViewModel[]>(() =>
    users.value.map((user) => ({
      id: user.id,
      label: user.displayName,
    })),
  );

  const mergeSourceUserOptions = computed<SelectOptionViewModel[]>(() =>
    users.value
      .filter((user) => user.id !== mergeTargetUserId.value)
      .map((user) => ({
        id: user.id,
        label: user.displayName,
      })),
  );

  const desktopUserMenuButtonContentWidth = computed(() => {
    const buttonContentWidth = Math.ceil(
      measureTextWidth(activeUserLabel.value, USER_MENU_MEASUREMENT.userFont) +
        USER_MENU_MEASUREMENT.desktopAvatarWidthPx +
        USER_MENU_MEASUREMENT.desktopButtonGapPx +
        USER_MENU_MEASUREMENT.desktopButtonHorizontalPaddingPx,
    );
    const maxButtonContentWidth = Math.max(
      1,
      Math.floor(
        viewportWidth.value *
          USER_MENU_MEASUREMENT.desktopButtonMaxViewportWidthRatio,
      ),
    );

    return Math.min(buttonContentWidth, maxButtonContentWidth);
  });

  const desktopUserMenuWidth = computed(() =>
    Math.max(getUserMenuBaseWidth(), desktopUserMenuButtonContentWidth.value),
  );

  const desktopUserMenuButtonTextWidth = computed(() =>
    getUserButtonTextWidth(
      desktopUserMenuWidth.value,
      USER_MENU_MEASUREMENT.desktopAvatarWidthPx,
      USER_MENU_MEASUREMENT.desktopButtonGapPx,
      USER_MENU_MEASUREMENT.desktopButtonHorizontalPaddingPx,
    ),
  );

  const desktopUserMenuButtonLabel = computed(() =>
    buildTwoLineMiddleEllipsisLabel({
      text: activeUserLabel.value,
      maxWidthPx: desktopUserMenuButtonTextWidth.value,
      maxLines: USER_MENU_MEASUREMENT.maxButtonLabelLines,
      ellipsis: USER_MENU_MEASUREMENT.middleEllipsis,
      font: USER_MENU_MEASUREMENT.userFont,
      measureTextWidth,
    }),
  );

  const desktopUserMenuWidthStyle = computed<CSSProperties>(() => ({
    width: `${desktopUserMenuWidth.value}px`,
  }));

  const mobileUserMenuWidthStyle = computed<CSSProperties>(() => ({
    width: `${getUserMenuBaseWidth()}px`,
  }));

  const mobileUserMenuLabelStyle = computed<CSSProperties>(() => {
    const menuWidth = getUserMenuBaseWidth();
    const labelWidth = measureTextWidth(
      APP_CHROME_CONTENT.labels.user,
      USER_MENU_MEASUREMENT.mobileLabelFont,
    );

    return {
      paddingLeft: `${Math.min(
        USER_MENU_MEASUREMENT.mobileMaxLabelInsetPx,
        Math.max(
          0,
          (menuWidth - labelWidth) *
            USER_MENU_MEASUREMENT.mobileLabelInsetRatio,
        ),
      )}px`,
    };
  });

  const confirmationTitle = computed(() => {
    if (confirmationKind.value === 'delete-user') {
      return confirmationStep.value === 1
        ? APP_CHROME_CONTENT.messages.deleteUserFirstStepTitle
        : APP_CHROME_CONTENT.messages.deleteUserSecondStepTitle;
    }

    return confirmationStep.value === 1
      ? APP_CHROME_CONTENT.messages.clearDataFirstStepTitle
      : APP_CHROME_CONTENT.messages.clearDataSecondStepTitle;
  });

  const confirmationBody = computed(() => {
    if (confirmationKind.value === 'delete-user') {
      return confirmationStep.value === 1
        ? `${APP_CHROME_CONTENT.messages.deleteUserFirstStepPrefix} "${activeUserLabel.value}" ${APP_CHROME_CONTENT.messages.deleteUserFirstStepSuffix}`
        : APP_CHROME_CONTENT.messages.deleteUserSecondStep;
    }

    return confirmationStep.value === 1
      ? APP_CHROME_CONTENT.messages.clearDataFirstStep
      : APP_CHROME_CONTENT.messages.clearDataSecondStep;
  });

  const confirmationStepLabel = computed(
    () => `Step ${confirmationStep.value} of 2`,
  );

  const userActionModalTitle = computed(() => {
    if (userActionModalKind.value === 'create-user') {
      return APP_CHROME_CONTENT.labels.createUser;
    }

    if (userActionModalKind.value === 'update-data') {
      return APP_CHROME_CONTENT.labels.updateProfile;
    }

    if (userActionModalKind.value === 'merge-users') {
      return APP_CHROME_CONTENT.labels.mergeUsers;
    }

    if (userActionModalKind.value === 'switch-user') {
      return APP_CHROME_CONTENT.labels.chooseUser;
    }

    return APP_CHROME_CONTENT.labels.noUsers;
  });

  const refreshActiveAvatar = async (): Promise<void> => {
    const currentAvatarRefreshRunId = avatarRefreshRunId + 1;

    avatarRefreshRunId = currentAvatarRefreshRunId;

    const avatarAssetId = activeUser.value?.avatarAssetId;

    if (avatarAssetId === undefined) {
      activeAvatarDataUrl.value = undefined;
      activeAvatarThumbnailDataUrl.value = undefined;
      activeAvatarMaskDataUrl.value = undefined;
      activeAvatarAsset.value = undefined;
      return;
    }

    const avatarAsset = await getAvatarAsset(avatarAssetId);

    if (currentAvatarRefreshRunId !== avatarRefreshRunId) {
      return;
    }

    activeAvatarAsset.value = avatarAsset;
    activeAvatarDataUrl.value = avatarAsset?.originalImageDataUrl;
    activeAvatarThumbnailDataUrl.value = avatarAsset?.thumbnailImageDataUrl;
    activeAvatarMaskDataUrl.value = avatarAsset?.maskImageDataUrl;

    if (
      avatarAsset?.thumbnailImageDataUrl === undefined &&
      avatarAsset?.originalImageDataUrl !== undefined
    ) {
      const thumbnailImageDataUrl = await createAvatarThumbnailDataUrl(
        avatarAsset.originalImageDataUrl,
      );

      if (currentAvatarRefreshRunId === avatarRefreshRunId) {
        activeAvatarThumbnailDataUrl.value = thumbnailImageDataUrl;
      }
    }
  };

  const refreshActiveAvatarAfterUserLoad = (): void => {
    void refreshActiveAvatar().catch(() => {
      activeAvatarDataUrl.value = undefined;
      activeAvatarThumbnailDataUrl.value = undefined;
      activeAvatarMaskDataUrl.value = undefined;
      activeAvatarAsset.value = undefined;
    });
  };

  const refreshUsers = async (): Promise<void> => {
    isUserLoading.value = true;
    delayedUserPlaceholder.start();

    try {
      activeUser.value = await getActiveUser();
      users.value = await listUsers();
      refreshActiveAvatarAfterUserLoad();
    } finally {
      isUserLoading.value = false;
      delayedUserPlaceholder.clear();
    }
  };

  const setTheme = (themeName: string): void => {
    if (!isThemeName(themeName)) {
      return;
    }

    theme.value = themeName;
    applyTheme(theme.value);
  };

  const setLanguage = (nextLanguageId: string): void => {
    if (!isLanguageId(nextLanguageId)) {
      return;
    }

    languageId.value = nextLanguageId;
    applyLanguage(languageId.value);
  };

  const openHelpModal = (): void => {
    isHelpModalOpen.value = true;
    closeUserMenu();
  };

  const closeHelpModal = (): void => {
    isHelpModalOpen.value = false;
  };

  const toggleUserMenu = (): void => {
    isUserMenuOpen.value = !isUserMenuOpen.value;
  };

  const closeUserMenu = (): void => {
    isUserMenuOpen.value = false;
  };

  const handleDocumentPointerDown = (event: PointerEvent): void => {
    const target = event.target;

    if (!(target instanceof Node) || userMenuRoot.value?.contains(target) === true) {
      return;
    }

    closeUserMenu();
  };

  const openCreateUserModal = (): void => {
    createUserName.value = `${LOCAL_USER_NAME.numberedPrefix} ${
      users.value.length + 1
    }`;
    userActionModalKind.value = 'create-user';
    closeUserMenu();
  };

  const openUpdateDataModal = (): void => {
    const profile = createProfileMetadataViewModel(activeUser.value);
    const snapshot = {
      displayName: activeUser.value?.displayName ?? '',
      pronounsVisible: profile.pronounsVisible,
      pronounSubject: profile.pronounSubject,
      pronounObject: profile.pronounObject,
      statusVisible: profile.statusVisible,
      statusEmoji: profile.statusEmoji,
      statusText: profile.statusText,
      bio: profile.bio,
    };

    updateUserName.value = snapshot.displayName;
    updateUserPronounsVisible.value = snapshot.pronounsVisible;
    updateUserPronounSubject.value = snapshot.pronounSubject;
    updateUserPronounObject.value = snapshot.pronounObject;
    updateUserStatusVisible.value = snapshot.statusVisible;
    updateUserStatusEmoji.value = snapshot.statusEmoji;
    updateUserStatusText.value = snapshot.statusText;
    updateUserBio.value = snapshot.bio;
    updateAvatarDraft.value = undefined;
    updateAvatarCropSource.value = undefined;
    updateAvatarPreviewDataUrl.value = activeAvatarDataUrl.value;
    updateAvatarMaskPreviewDataUrl.value = activeAvatarMaskDataUrl.value;
    isUpdateAvatarDeleted.value = false;
    isUpdateAvatarMaskDeleted.value = false;
    updateProfileErrorMessage.value = '';
    savedUpdateUserSnapshot.value = snapshot;
    userActionModalKind.value = 'update-data';
    closeUserMenu();
  };

  const openSwitchUserModal = (): void => {
    userActionModalKind.value = users.value.length > 0 ? 'switch-user' : 'empty-users';
    closeUserMenu();
  };

  const openMergeUsersModal = (): void => {
    mergeTargetUserId.value = activeUser.value?.id ?? users.value[0]?.id ?? '';
    mergeSourceUserIds.value = [];
    mergeUsersErrorMessage.value =
      users.value.length < 2
        ? APP_CHROME_CONTENT.messages.mergeRequiresTwoUsers
        : '';
    userActionModalKind.value = users.value.length > 0 ? 'merge-users' : 'empty-users';
    closeUserMenu();
  };

  const closeUserActionModal = (): void => {
    userActionModalKind.value = undefined;
    isUserActionCloseConfirmationOpen.value = false;
  };

  const requestCloseUserActionModal = (): void => {
    if (userActionModalKind.value !== 'update-data' || !isUpdateProfileDirty.value) {
      closeUserActionModal();
      return;
    }

    isUserActionCloseConfirmationOpen.value = true;
  };

  const closeUserActionCloseConfirmation = (): void => {
    isUserActionCloseConfirmationOpen.value = false;
  };

  const confirmCloseUserActionModal = (): void => {
    closeUserActionModal();
  };

  const setMergeTargetUserId = (userId: string): void => {
    mergeTargetUserId.value = userId;
    mergeSourceUserIds.value = mergeSourceUserIds.value.filter(
      (sourceUserId) => sourceUserId !== userId,
    );
  };

  const mergeSelectedUsers = async (): Promise<void> => {
    if (mergeTargetUserId.value === '' || mergeSourceUserIds.value.length === 0) {
      mergeUsersErrorMessage.value =
        APP_CHROME_CONTENT.messages.mergeSelectionRequired;
      return;
    }

    try {
      mergeUsersErrorMessage.value = '';
      await mergeUserProfiles(mergeSourceUserIds.value, mergeTargetUserId.value);
      closeUserActionModal();
      await refreshUsers();
    } catch (error) {
      mergeUsersErrorMessage.value =
        error instanceof Error
          ? error.message
          : APP_CHROME_CONTENT.messages.mergeFailed;
    }
  };

  const createAndSwitchUser = async (): Promise<void> => {
    await createUserProfile({
      displayName:
        createUserName.value.trim() || LOCAL_USER_NAME.defaultDisplayName,
    });
    closeUserActionModal();
    await refreshUsers();
  };

  const updateActiveUserData = async (): Promise<void> => {
    if (activeUser.value === undefined) {
      return;
    }

    try {
      updateProfileErrorMessage.value = '';

      if (updateAvatarCropSource.value !== undefined) {
        updateProfileErrorMessage.value =
          APP_CHROME_CONTENT.messages.avatarCropRequired;
        return;
      }

      const statusEmoji = getFirstVisualCharacter(updateUserStatusEmoji.value);
      const statusText = limitWideCharacters(
        updateUserStatusText.value.trim(),
        USER_PROFILE_TEXT_LIMITS.status,
      );
      const hasStatusContent =
        statusEmoji.trim() !== '' || statusText.trim() !== '';
      const userUpdate: Parameters<typeof updateUserProfile>[1] = {
        displayName: updateUserName.value.trim() || activeUser.value.displayName,
        metadata: {
          ...activeUser.value.metadata,
          pronounsVisible: updateUserPronounsVisible.value,
          pronounSubject: updateUserPronounsVisible.value
            ? updateUserPronounSubject.value.trim() ||
              DEFAULT_USER_PROFILE_METADATA.pronounSubject
            : DEFAULT_USER_PROFILE_METADATA.emptyText,
          pronounObject: updateUserPronounsVisible.value
            ? updateUserPronounObject.value.trim() ||
              DEFAULT_USER_PROFILE_METADATA.pronounObject
            : DEFAULT_USER_PROFILE_METADATA.emptyText,
          statusEmoji,
          statusText,
          statusVisible: updateUserStatusVisible.value && hasStatusContent,
          bio: limitWideCharacters(
            updateUserBio.value.trim(),
            USER_PROFILE_TEXT_LIMITS.bio,
          ),
        },
      };
      const previousAvatarAssetId = activeUser.value.avatarAssetId;

      if (isUpdateAvatarDeleted.value) {
        userUpdate.avatarAssetId = null;
      } else if (updateAvatarDraft.value !== undefined) {
        const avatarDraft = clonePlainJson(updateAvatarDraft.value);

        if (isUpdateAvatarMaskDeleted.value) {
          delete avatarDraft.maskImageDataUrl;
        }

        const avatarAsset = await createAvatarAsset(clonePlainJson(avatarDraft));

        userUpdate.avatarAssetId = avatarAsset.id;
      } else if (
        isUpdateAvatarMaskDeleted.value &&
        activeAvatarAsset.value !== undefined
      ) {
        const avatarAssetWithoutMask = clonePlainJson(activeAvatarAsset.value);

        delete avatarAssetWithoutMask.maskImageDataUrl;
        await saveAvatarAsset(avatarAssetWithoutMask);
      }

      await updateUserProfile(activeUser.value.id, clonePlainJson(userUpdate));

      if (
        previousAvatarAssetId !== undefined &&
        (isUpdateAvatarDeleted.value || updateAvatarDraft.value !== undefined)
      ) {
        await deleteAvatarAsset(previousAvatarAssetId);
      }

      closeUserActionModal();
      await refreshUsers();
    } catch (error) {
      updateProfileErrorMessage.value =
        error instanceof Error
          ? error.message
          : APP_CHROME_CONTENT.messages.profileUpdateFailed;
    }
  };

  const switchUserById = async (userId: string): Promise<void> => {
    await switchActiveUser(userId);
    closeUserActionModal();
    closeUserMenu();
    await refreshUsers();
  };

  const openAvatarFilePicker = (): void => {
    avatarFileInput.value?.click();
  };

  const openDeleteUserConfirmation = (): void => {
    if (activeUser.value === undefined) {
      userActionModalKind.value = 'empty-users';
      closeUserMenu();
      return;
    }

    confirmationKind.value = 'delete-user';
    confirmationStep.value = 1;
    closeUserMenu();
  };

  const openClearDataConfirmation = (): void => {
    confirmationKind.value = 'clear-data';
    confirmationStep.value = 1;
    closeUserMenu();
  };

  const closeConfirmation = (): void => {
    confirmationKind.value = undefined;
    confirmationStep.value = 1;
  };

  const continueAfterUserRemoval = async (): Promise<void> => {
    await refreshUsers();

    if (users.value.length > 0) {
      userActionModalKind.value = 'switch-user';
      return;
    }

    userActionModalKind.value = 'empty-users';
  };

  const confirmCurrentAction = async (): Promise<void> => {
    if (confirmationStep.value === 1) {
      confirmationStep.value = 2;
      return;
    }

    const kindToRun = confirmationKind.value;
    closeConfirmation();

    if (kindToRun === 'delete-user' && activeUser.value !== undefined) {
      await deleteUserProfile(activeUser.value.id);
      await continueAfterUserRemoval();
      return;
    }

    if (kindToRun === 'clear-data') {
      await clearAllPersonalData({
        firstConfirmation: true,
        secondConfirmation: true,
      });
      await continueAfterUserRemoval();
    }
  };

  const uploadAvatar = async (event: Event): Promise<void> => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);

    if (file === null || file === undefined || activeUser.value === undefined) {
      return;
    }

    const cropSource = await createAvatarCropSourceFromFile(file);

    updateAvatarCropSource.value = cropSource;
    updateAvatarCropX.value = cropSource.crop.x;
    updateAvatarCropY.value = cropSource.crop.y;
    updateAvatarCropSize.value = cropSource.crop.size;
    updateAvatarDraft.value = undefined;
    updateAvatarMaskPreviewDataUrl.value = undefined;
    userActionModalKind.value = 'update-data';
    isUpdateAvatarDeleted.value = false;
    isUpdateAvatarMaskDeleted.value = false;
    input.value = '';
  };

  const applyAvatarCrop = async (): Promise<void> => {
    const cropSource = updateAvatarCropSource.value;

    if (cropSource === undefined) {
      return;
    }

    try {
      updateProfileErrorMessage.value = '';

      const squareDataUrl = await cropAvatarSourceToSquareDataUrl(cropSource, {
        x: updateAvatarCropX.value,
        y: updateAvatarCropY.value,
        size: updateAvatarCropSize.value,
      });
      const avatarDraft = await buildAvatarAssetDraftFromDataUrl(
        squareDataUrl,
        'image/png',
        cropSource.fileName,
      );

      updateAvatarDraft.value = avatarDraft;
      updateAvatarPreviewDataUrl.value = avatarDraft.originalImageDataUrl;
      updateAvatarMaskPreviewDataUrl.value = avatarDraft.maskImageDataUrl;
      updateAvatarCropSource.value = undefined;
      isUpdateAvatarDeleted.value = false;
      isUpdateAvatarMaskDeleted.value = false;
    } catch (error) {
      updateProfileErrorMessage.value =
        error instanceof Error
          ? error.message
          : APP_CHROME_CONTENT.messages.avatarCropFailed;
    }
  };

  const deleteActiveUserAvatar = async (): Promise<void> => {
    if (activeUser.value === undefined) {
      return;
    }

    if (userActionModalKind.value === 'update-data') {
      updateAvatarDraft.value = undefined;
      updateAvatarPreviewDataUrl.value = undefined;
      updateAvatarMaskPreviewDataUrl.value = undefined;
      updateAvatarCropSource.value = undefined;
      isUpdateAvatarDeleted.value = true;
      isUpdateAvatarMaskDeleted.value = true;
      return;
    }

    const avatarAssetId = activeUser.value.avatarAssetId;

    await updateUserProfile(activeUser.value.id, {
      avatarAssetId: null,
    });

    if (avatarAssetId !== undefined) {
      await deleteAvatarAsset(avatarAssetId);
    }

    await refreshUsers();
  };

  const deleteActiveUserMask = async (): Promise<void> => {
    if (userActionModalKind.value === 'update-data') {
      updateAvatarMaskPreviewDataUrl.value = undefined;
      isUpdateAvatarMaskDeleted.value = true;
      return;
    }

    const avatarAsset = activeAvatarAsset.value;

    if (avatarAsset === undefined) {
      return;
    }

    const avatarAssetWithoutMask = clonePlainJson(avatarAsset);

    delete avatarAssetWithoutMask.maskImageDataUrl;
    await saveAvatarAsset(avatarAssetWithoutMask);
    await refreshUsers();
  };

  const refreshCurrentDateTime = (): void => {
    const now = new Date();

    currentDateLabel.value = formatDateLabel(now);
    currentMobileDateLine.value = formatMobileDateLine(now);
    currentWeekdayLabel.value = formatWeekdayLabel(now);
    currentTimeLabel.value = formatTimeLabel(now);
  };

  const refreshViewportWidth = (): void => {
    viewportWidth.value = getViewportWidth();
  };

  const scheduleNextMinuteTick = (): void => {
    const now = new Date();
    const nextMinuteDelayMs =
      CLOCK_TICK.minuteMs -
      now.getSeconds() * CLOCK_TICK.secondMs -
      now.getMilliseconds();

    dateTimeTimer = window.setTimeout(() => {
      refreshCurrentDateTime();
      scheduleNextMinuteTick();
    }, nextMinuteDelayMs);
  };

  watch(updateUserStatusText, (value) => {
    const nextValue = limitWideCharacters(
      value,
      USER_PROFILE_TEXT_LIMITS.status,
    );

    if (value !== nextValue) {
      updateUserStatusText.value = nextValue;
    }
  });

  watch(updateUserBio, (value) => {
    const nextValue = limitWideCharacters(value, USER_PROFILE_TEXT_LIMITS.bio);

    if (value !== nextValue) {
      updateUserBio.value = nextValue;
    }
  });

  watch(updateAvatarCropSize, (value) => {
    const source = updateAvatarCropSource.value;

    if (source === undefined) {
      return;
    }

    const nextSize = Math.min(
      Math.max(AVATAR_CROP_LIMITS.minSize, value),
      Math.min(source.dimensions.width, source.dimensions.height),
    );

    if (nextSize !== value) {
      updateAvatarCropSize.value = nextSize;
      return;
    }

    updateAvatarCropX.value = Math.min(updateAvatarCropX.value, updateAvatarCropMaxX.value);
    updateAvatarCropY.value = Math.min(updateAvatarCropY.value, updateAvatarCropMaxY.value);
  });

  onMounted(async () => {
    document.addEventListener('pointerdown', handleDocumentPointerDown);
    window.addEventListener('resize', refreshViewportWidth);
    window.visualViewport?.addEventListener('resize', refreshViewportWidth);
    refreshViewportWidth();
    refreshCurrentDateTime();
    scheduleNextMinuteTick();
    theme.value = getInitialTheme();
    applyTheme(theme.value);
    languageId.value = getInitialLanguage();
    applyLanguage(languageId.value);
    await refreshUsers();

    if (users.value.length === 0 && userActionModalKind.value === undefined) {
      userActionModalKind.value = 'empty-users';
    }
  });

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', handleDocumentPointerDown);
    window.removeEventListener('resize', refreshViewportWidth);
    window.visualViewport?.removeEventListener('resize', refreshViewportWidth);
    if (dateTimeTimer !== undefined) {
      window.clearTimeout(dateTimeTimer);
    }
  });

  return {
    activeAvatarDataUrl,
    appChromeContent: APP_CHROME_CONTENT,
    activeAvatarThumbnailDataUrl,
    activeAvatarMaskDataUrl,
    activeUserBio,
    activeUserBioLabel,
    activeUserLabel,
    desktopUserMenuButtonLabel,
    activeUserPronounsLabel,
    activeUserPronounsVisible,
    activeUserStatusEmoji,
    activeUserStatusText,
    activeUserStatusVisible,
    applyAvatarCrop,
    avatarFileInput,
    closeConfirmation,
    closeHelpModal,
    closeUserActionCloseConfirmation,
    closeUserActionModal,
    confirmationBody,
    confirmationKind,
    confirmationStep,
    confirmationStepLabel,
    confirmationTitle,
    confirmCloseUserActionModal,
    confirmCurrentAction,
    createAndSwitchUser,
    createUserName,
    currentDateLabel,
    currentMobileDateLine,
    currentTimeLabel,
    currentWeekdayLabel,
    deleteActiveUserAvatar,
    deleteActiveUserMask,
    desktopUserMenuWidthStyle,
    hasActiveUser,
    isHelpModalOpen,
    isUserActionModalOpen,
    isUserActionCloseConfirmationOpen,
    isUserLoading,
    isUserMenuOpen,
    languageId,
    languageOptions,
    mergeSelectedUsers,
    mergeSourceUserIds,
    mergeSourceUserOptions,
    mergeTargetUserId,
    mergeTargetUserOptions,
    mergeUsersErrorMessage,
    mobileUserMenuLabelStyle,
    mobileUserMenuWidthStyle,
    openAvatarFilePicker,
    openClearDataConfirmation,
    openCreateUserModal,
    openDeleteUserConfirmation,
    openHelpModal,
    openMergeUsersModal,
    openSwitchUserModal,
    openUpdateDataModal,
    refreshUsers,
    requestCloseUserActionModal,
    setLanguage,
    setTheme,
    setMergeTargetUserId,
    setUpdateUserPronounObjectPreset,
    setUpdateUserPronounSubjectPreset,
    setUpdateUserStatusVisibility,
    normalizeUpdateUserStatusEmojiInput,
    statusVisibilityOptions,
    switchUserById,
    themeId,
    themeOptions,
    userProfileTextLimits: USER_PROFILE_TEXT_LIMITS,
    avatarCropLimits: AVATAR_CROP_LIMITS,
    toggleUserMenu,
    updateActiveUserData,
    updateAvatarCropMaxSize,
    updateAvatarCropMaxX,
    updateAvatarCropMaxY,
    updateAvatarCropPreviewStyle,
    updateAvatarCropSize,
    updateAvatarCropSource,
    updateAvatarCropX,
    updateAvatarCropY,
    isUpdateAvatarMaskPreviewPending,
    updateAvatarMaskPreviewDataUrl,
    updateAvatarPreviewDataUrl,
    updateProfileErrorMessage,
    pronounObjectOptions,
    pronounSubjectOptions,
    updateUserBio,
    updateUserBioCount,
    updateUserName,
    updateUserPronounObject,
    updateUserPronounObjectPreset,
    updateUserPronounSubject,
    updateUserPronounSubjectPreset,
    updateUserPronounsVisible,
    updateUserStatusEmoji,
    updateUserStatusVisibilityId,
    updateUserStatusTextCount,
    updateUserStatusText,
    updateUserStatusVisible,
    uploadAvatar,
    userActionModalKind,
    userActionModalTitle,
    userMenuRoot,
    userOptions,
  };
};
