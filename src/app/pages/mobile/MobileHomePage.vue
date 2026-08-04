<script setup lang="ts">
import DateRange from '@/app/components/DateRange.vue';
import AppDropdown from '@/app/components/AppDropdown.vue';
import AppLevelMeter from '@/app/components/AppLevelMeter.vue';
import Range from '@/app/components/Range.vue';
import AppSingleSlider from '@/app/components/AppSingleSlider.vue';
import AvatarRenderer from '@/app/components/AvatarRenderer.vue';
import { PUBLIC_ASSET_PATHS } from '@/constants/assetConstants';
import { useMobileHomePage } from '@/app/pages/mobile/MobileHomePage';

const {
  activeAvatarDataUrl,
  activeAvatarThumbnailDataUrl,
  activeAvatarMaskDataUrl,
  activeUserBioLabel,
  activeUserLabel,
  activeUserPronounsLabel,
  activeUserPronounsVisible,
  activeUserStatusEmoji,
  activeUserStatusText,
  activeUserStatusVisible,
  appChromeContent,
  applyAvatarCrop,
  avatarFileInput,
  canSubmitDraftModal,
  collapseMobileNav,
  closeDeleteDiaryEntryConfirmation,
  closeDraftCloseConfirmation,
  closeConfirmation,
  closeHelpModal,
  closeUserActionCloseConfirmation,
  closeUserActionModal,
  confirmationBody,
  confirmationKind,
  confirmationStep,
  confirmationStepLabel,
  confirmationTitle,
  confirmDeleteDiaryEntry,
  confirmCloseDraftModal,
  confirmCloseUserActionModal,
  confirmCurrentAction,
  createAndSwitchUser,
  createUserName,
  collapseFilterDock,
  currentDateLabel,
  currentTimeLabel,
  currentMobileDateLine,
  currentWeekdayLabel,
  deleteActiveUserAvatar,
  deleteActiveUserMask,
  anxietyFilter,
  draftModalErrorMessage,
  draftModalEyebrow,
  draftModalForm,
  draftModalSubmitLabel,
  draftModalTitle,
  endDateFilter,
  energyFilter,
  expandFilterDock,
  expandMobileNav,
  exportJsonFile,
  filterModeOptions,
  hasEntries,
  hasActiveUser,
  helpContent,
  homeContent,
  includeOptions,
  importFileInput,
  importJsonFile,
  isDraftCloseConfirmationOpen,
  isDraftModalDirty,
  isDraftModalOpen,
  isFilterDockCollapsed,
  isHelpModalOpen,
  isLoading,
  isMobileNavCollapsed,
  shouldShowDiaryLoadingLabel,
  isUserActionModalOpen,
  isUserActionCloseConfirmationOpen,
  isUserMenuOpen,
  mergeSelectedUsers,
  mergeSourceUserIds,
  mergeSourceUserOptions,
  mergeTargetUserId,
  mergeTargetUserOptions,
  mergeUsersErrorMessage,
  normalizeUpdateUserStatusEmojiInput,
  mobileFullScreenOverlayPrimaryStyle,
  mobileFullScreenOverlaySecondaryStyle,
  mobileFullScreenOverlayStyle,
  mobileProfileActionLabel,
  mobileUserMenuProfileActionLabel,
  diaryDeleteConfirmationEntryId,
  diaryDeleteConfirmationBody,
  diaryDeleteConfirmationEntryLabel,
  diaryEntryCountLabel,
  diaryLevelFieldConfigs,
  mobileLayout,
  diaryPrompt,
  languageId,
  languageOptions,
  moodFilter,
  openAvatarFilePicker,
  openClearDataConfirmation,
  openCreateUserModal,
  openDeleteDiaryEntryConfirmation,
  openDeleteUserConfirmation,
  openDraftModal,
  openHelpModal,
  openImportFilePicker,
  openMergeUsersModal,
  openSwitchUserModal,
  openUpdateDataModal,
  openUpdateDiaryEntry,
  pronounObjectOptions,
  pronounSubjectOptions,
  requestCloseDraftModal,
  requestCloseUserActionModal,
  setAnxietyFilterMode,
  setDraftIncludeAnxiety,
  setDraftIncludeBodyFeeling,
  setDraftIncludeContent,
  setDraftIncludeEnergy,
  setDraftIncludeHighlight,
  setDraftIncludeMood,
  setDraftIncludeTrouble,
  setEnergyFilterMode,
  setLanguage,
  setMergeTargetUserId,
  setMoodFilterMode,
  setTimeZoneFilterMode,
  setTheme,
  setUpdateUserPronounObjectPreset,
  setUpdateUserPronounSubjectPreset,
  setUpdateUserStatusVisibility,
  startDateFilter,
  statusVisibilityOptions,
  submitDiaryEntry,
  switchUserById,
  selectedTimePeriodIds,
  themeId,
  themeOptions,
  timePeriodOptions,
  timeZoneFilterMode,
  timeZoneFilterModeOptions,
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
  updateUserBio,
  updateUserBioCount,
  updateUserName,
  updateUserPronounObject,
  updateUserPronounObjectPreset,
  updateUserPronounSubject,
  updateUserPronounSubjectPreset,
  updateUserPronounsVisible,
  updateUserStatusEmoji,
  updateUserStatusTextCount,
  updateUserStatusText,
  updateUserStatusVisibilityId,
  userProfileTextLimits,
  avatarCropLimits,
  uploadAvatar,
  userActionModalKind,
  userActionModalTitle,
  userMenuRoot,
  userOptions,
  visibleEntryCards,
} = useMobileHomePage();
</script>

<template>
  <section class="h-full w-full overflow-y-auto bg-app text-titleText">
    <nav
      class="fixed left-0 top-0 w-full bg-navSurface"
      :style="mobileLayout.navOuterStyle"
    >
      <button
        v-if="isMobileNavCollapsed"
        class="absolute inset-0 flex w-full items-center justify-center border-b border-borderBase bg-panel text-sm font-medium text-titleText"
        type="button"
        :aria-label="homeContent.aria.expandNavigation"
        @click="expandMobileNav"
      >
        <span class="mr-2">{{ homeContent.labels.navigation }}</span>
        <span
          class="block h-2 w-2 rotate-45 border-b-2 border-r-2 border-current"
          aria-hidden="true"
        />
      </button>
      <div
        v-else
        class="relative overflow-visible"
        :style="mobileLayout.navFrameStyle"
      >
          <div
            class="grid items-center"
            :style="mobileLayout.navGridStyle"
          >
          <div
            class="flex min-w-0 flex-col items-center gap-2"
            :style="mobileLayout.settingsControlStyle"
          >
            <AppDropdown
              class="w-full"
              :label="appChromeContent.labels.theme"
              mode="single"
              :options="themeOptions"
              :selected-id="themeId"
              :label-inset-ratio="mobileLayout.dropdownLabelInsetRatio"
              size="compact"
              @update:selected-id="setTheme"
            />
            <AppDropdown
              class="w-full"
              :label="appChromeContent.labels.language"
              mode="single"
              :options="languageOptions"
              :selected-id="languageId"
              :label-inset-ratio="mobileLayout.dropdownLabelInsetRatio"
              size="compact"
              @update:selected-id="setLanguage"
            />
          </div>

          <div class="min-w-0 px-1 text-center">
            <template v-if="mobileLayout.useStackedDate">
              <p class="truncate text-xs font-semibold leading-tight">
                {{ currentMobileDateLine }}
              </p>
              <p class="mt-0.5 truncate text-xs font-semibold leading-tight">
                {{ currentWeekdayLabel }}
              </p>
              <p class="mt-0.5 text-xs font-medium leading-tight text-bodyText">
                {{ currentTimeLabel }}
              </p>
            </template>
            <template v-else>
              <p class="truncate text-xs font-semibold">
                {{ currentDateLabel }}
              </p>
              <p class="mt-1 text-xs font-medium text-bodyText">
                {{ currentTimeLabel }}
              </p>
            </template>
          </div>

          <div class="flex min-w-0 flex-col items-center gap-2">
            <div
              ref="userMenuRoot"
              class="relative min-w-0"
              :style="mobileLayout.userControlStyle"
            >
              <p
                class="mb-2 text-xs font-medium text-mutedText"
                :style="mobileLayout.userMenuLabelStyle"
              >
                {{ appChromeContent.labels.user }}
              </p>
              <button
                class="flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-borderBase bg-panel px-2"
                type="button"
                aria-haspopup="menu"
                :aria-expanded="isUserMenuOpen"
                @click="toggleUserMenu"
              >
                <span class="mobile-user-menu-button-label min-w-0 flex-1 text-left text-xs font-semibold">
                  {{ mobileLayout.mobileUserMenuButtonLabel }}
                </span>
                <span class="h-9 w-9 overflow-hidden rounded-full border-2 border-avatarBorder bg-navAvatarSurface">
                  <img
                    v-if="activeAvatarThumbnailDataUrl"
                    class="h-full w-full object-cover"
                    :alt="activeUserLabel"
                    :src="activeAvatarThumbnailDataUrl"
                  />
                </span>
              </button>

              <div
                v-if="isUserMenuOpen"
                class="mobile-user-menu absolute right-0 w-full min-w-full rounded-lg border border-borderBase bg-panel p-2"
                :style="mobileLayout.navPopupLayerStyle"
                role="menu"
              >
                <button
                  class="w-full whitespace-nowrap rounded-lg px-3 py-3 text-left text-sm hover:bg-panelMuted"
                  type="button"
                  role="menuitem"
                  @click="openSwitchUserModal"
                >
                  {{ appChromeContent.labels.switchUser }}
                </button>
                <button
                  class="w-full whitespace-nowrap rounded-lg px-3 py-3 text-left text-sm hover:bg-panelMuted"
                  type="button"
                  role="menuitem"
                  @click="openMergeUsersModal"
                >
                  {{ appChromeContent.labels.mergeUsers }}
                </button>
                <button
                  class="w-full whitespace-nowrap rounded-lg px-3 py-3 text-left text-sm hover:bg-panelMuted"
                  type="button"
                  role="menuitem"
                  @click="hasActiveUser ? openUpdateDataModal() : openCreateUserModal()"
                >
                  {{ mobileUserMenuProfileActionLabel }}
                </button>
                <button
                  class="w-full whitespace-nowrap rounded-lg px-3 py-3 text-left text-sm hover:bg-panelMuted"
                  type="button"
                  role="menuitem"
                  @click="openCreateUserModal"
                >
                  {{ appChromeContent.labels.createUser }}
                </button>
                <button
                  class="grid w-full items-center rounded-lg px-3 py-3 text-left text-sm text-danger hover:bg-dangerSurface"
                  :class="mobileLayout.showUserMenuDangerBadges ? mobileLayout.dangerMenuGridClass : mobileLayout.dangerMenuSingleColumnClass"
                  type="button"
                  role="menuitem"
                  @click="openDeleteUserConfirmation"
                >
                  <span class="min-w-0 truncate whitespace-nowrap">
                    {{ appChromeContent.labels.deleteUser }}
                  </span>
                  <span
                    v-if="mobileLayout.showUserMenuDangerBadges"
                    class="justify-self-end whitespace-nowrap rounded-full bg-dangerSurface px-2 py-0.5 text-typo-tiny font-medium text-danger"
                  >
                    {{ appChromeContent.labels.danger }}
                  </span>
                </button>
                <button
                  class="grid w-full items-center rounded-lg px-3 py-3 text-left text-sm text-danger hover:bg-dangerSurface"
                  :class="mobileLayout.showUserMenuDangerBadges ? mobileLayout.dangerMenuGridClass : mobileLayout.dangerMenuSingleColumnClass"
                  type="button"
                  role="menuitem"
                  @click="openClearDataConfirmation"
                >
                  <span class="min-w-0 truncate whitespace-nowrap">
                    {{ appChromeContent.labels.clearData }}
                  </span>
                  <span
                    v-if="mobileLayout.showUserMenuDangerBadges"
                    class="justify-self-end whitespace-nowrap rounded-full bg-dangerSurface px-2 py-0.5 text-typo-tiny font-medium text-danger"
                  >
                    {{ appChromeContent.labels.danger }}
                  </span>
                </button>
              </div>
            </div>
            <div class="flex flex-col items-center gap-1">
              <p class="text-xs font-medium text-mutedText">
                {{ appChromeContent.labels.help }}
              </p>
              <button
                class="flex h-9 w-9 items-center justify-center rounded-full border border-borderBase bg-panel text-base font-semibold text-titleText"
                type="button"
                :aria-label="appChromeContent.aria.openHelp"
                @click="openHelpModal"
              >
                {{ appChromeContent.labels.helpSymbol }}
              </button>
            </div>
          </div>
        </div>
        <button
          class="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border border-borderBase bg-panel text-mutedText"
          :style="mobileLayout.navCollapseButtonStyle"
          type="button"
          :aria-label="homeContent.aria.collapseNavigation"
          @click="collapseMobileNav"
        >
          <span
            class="block h-2 w-2 rotate-45 border-l-2 border-t-2 border-current"
            aria-hidden="true"
          />
        </button>
      </div>

      <input
        ref="avatarFileInput"
        accept="image/png,image/jpeg,image/webp"
        class="hidden"
        type="file"
        @change="uploadAvatar"
      />
    </nav>

    <div :style="mobileLayout.contentStyle">
      <section
        class="rounded-lg bg-profileSurface"
        :style="mobileLayout.profilePanelStyle"
      >
        <div
          class="grid"
          :style="mobileLayout.profileActionsGridStyle"
        >
          <div class="min-w-0">
            <div
              class="mobile-profile-identity"
              :style="mobileLayout.profileIdentityStyle"
            >
              <button
                class="mobile-profile-avatar overflow-hidden rounded-full border-2 border-avatarBorder bg-profileAvatarSurface"
                :style="mobileLayout.profileAvatarStyle"
                type="button"
                @click="hasActiveUser ? openUpdateDataModal() : openCreateUserModal()"
              >
                <AvatarRenderer
                  v-if="activeAvatarDataUrl"
                  :alt="activeUserLabel"
                  :original-image-data-url="activeAvatarDataUrl"
                  :mask-image-data-url="activeAvatarMaskDataUrl"
                />
              </button>
              <div class="min-w-0 flex-1">
                <div
                  class="flex min-w-0"
                  :class="mobileLayout.useStackedProfileIdentity ? 'flex-col items-start' : 'items-baseline'"
                  :style="mobileLayout.profileNamePronounsStyle"
                >
                  <h1 class="mobile-profile-name min-w-0 text-2xl font-semibold leading-tight">
                    {{ activeUserLabel }}
                  </h1>
                  <span
                    v-if="activeUserPronounsVisible"
                    class="mobile-profile-pronouns min-w-0 text-sm text-mutedText"
                  >
                    {{ activeUserPronounsLabel }}
                  </span>
                </div>
              </div>
            </div>

            <div
              v-if="activeUserStatusVisible"
              class="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-borderBase bg-mainColor px-3 py-2 text-sm text-mainColorBodyText"
            >
              <span class="shrink-0">{{ activeUserStatusEmoji }}</span>
              <span class="min-w-0 truncate">{{ activeUserStatusText }}</span>
            </div>

            <div class="mt-4 rounded-lg border border-borderBase bg-surface px-3 py-2 text-sm leading-6 text-bodyText">
              {{ activeUserBioLabel }}
            </div>
          </div>

          <div class="grid content-start gap-2">
            <button
              class="profile-action-button rounded-lg bg-accent px-3 py-3 text-xs font-medium text-inverseText"
              type="button"
              @click="hasActiveUser ? openUpdateDataModal() : openCreateUserModal()"
            >
              {{ mobileProfileActionLabel }}
            </button>
            <button
              class="profile-action-button profile-json-action-button rounded-lg border border-borderBase px-3 py-3 font-medium"
              type="button"
              @click="openImportFilePicker"
            >
              <span class="profile-json-action-label">
                {{ appChromeContent.labels.importFromJson }}
              </span>
            </button>
            <button
              class="profile-action-button profile-json-action-button rounded-lg border border-borderBase px-3 py-3 font-medium"
              type="button"
              @click="exportJsonFile"
            >
              <span class="profile-json-action-label">
                {{ appChromeContent.labels.exportToJson }}
              </span>
            </button>
          </div>
        </div>
      </section>

      <section class="mt-5 rounded-lg bg-panel p-5">
        <div class="space-y-4">
          <p class="text-2xl font-semibold leading-tight">
            {{ diaryPrompt.text }}
          </p>
          <button
            class="profile-action-button w-full rounded-lg bg-accent px-4 py-4 text-sm font-medium text-inverseText"
            type="button"
            @click="openDraftModal"
          >
            {{ homeContent.labels.newDiary }}
          </button>
        </div>
      </section>

      <section class="mt-5 rounded-lg bg-surface p-5">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-2xl font-semibold">
            {{ homeContent.labels.notebookTitle }}
          </h2>
          <span class="rounded-full bg-panelMuted px-3 py-1 text-xs font-medium text-mutedText">
            {{ diaryEntryCountLabel }}
          </span>
        </div>
        <div v-if="isLoading" class="mt-6 text-sm leading-6 text-bodyText">
          <span :class="shouldShowDiaryLoadingLabel ? '' : 'invisible'">
            {{ homeContent.labels.loading }}
          </span>
        </div>
        <div v-else-if="!hasEntries" class="mt-6 text-sm leading-6 text-bodyText">
          {{ homeContent.labels.noEntries }}
        </div>

        <ul v-else class="mt-5 space-y-3">
          <li
            v-for="entry in visibleEntryCards"
            :key="entry.id"
            class="rounded-lg bg-mainColor p-4 text-mainColorText"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <h3 class="text-base font-semibold text-mainColorText">
                  {{ entry.title }}
                </h3>
                <p class="text-xs font-medium text-mainColorMutedText">
                  Written {{ entry.submittedAtLabel }}
                </p>
                <p class="text-typo-tiny text-mainColorMutedText">
                  Updated {{ entry.updatedAtLabel }}
                </p>
              </div>
              <div class="grid shrink-0 grid-cols-2 gap-2">
                <button
                  class="h-8 rounded-lg border border-borderBase px-2 text-xs"
                  type="button"
                  @click="openUpdateDiaryEntry(entry.id)"
                >
                  {{ homeContent.labels.edit }}
                </button>
                <button
                  class="h-8 rounded-lg border border-danger px-2 text-xs text-danger"
                  type="button"
                  @click="openDeleteDiaryEntryConfirmation(entry.id)"
                >
                  {{ homeContent.labels.delete }}
                </button>
              </div>
            </div>
              <div class="mt-4 space-y-4">
                <section
                  v-if="entry.levelFields.length > 0"
                  class="grid grid-cols-3 gap-2 rounded-lg border border-borderBase bg-profileSurface p-3"
                >
                  <div
                    v-for="field in entry.levelFields"
                    :key="field.id"
                    class="min-w-0"
                  >
                    <p class="truncate text-typo-tiny font-medium uppercase text-mutedText">
                      {{ field.label }}
                    </p>
                    <AppLevelMeter
                      class="mt-2"
                      :percent="field.percent"
                      :tone="field.tone"
                    />
                    <p class="mt-2 text-xs font-medium text-bodyText">
                      {{ field.valueLabel }}
                    </p>
                  </div>
                </section>
                <section
                  v-for="field in entry.fields"
                  :key="field.id"
                >
                  <p class="text-xs font-medium uppercase text-mainColorMutedText">
                    {{ field.label }}
                  </p>
                  <p
                    class="mt-1 text-sm leading-6 text-mainColorBodyText"
                    :class="field.multiline ? 'whitespace-pre-wrap' : ''"
                  >
                    {{ field.value }}
                  </p>
                </section>
              </div>
            </li>
          </ul>
      </section>

      <section
        v-if="!isFilterDockCollapsed"
        class="mobile-home-filter-dock fixed bottom-0 border-t border-borderBase bg-panel"
        :style="mobileLayout.filterDockStyle"
      >
        <button
          class="absolute right-2 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-borderBase bg-panel text-mutedText"
          :style="mobileLayout.filterDockControlStyle"
          type="button"
          :aria-label="homeContent.aria.collapseFilters"
          @click="collapseFilterDock"
        >
          <span
            class="block h-2 w-2 rotate-45 border-b-2 border-r-2 border-current"
            aria-hidden="true"
          />
        </button>
        <div class="space-y-2">
          <div
            class="grid"
            :style="mobileLayout.filterGridStyle"
          >
            <div class="grid min-w-0 gap-1">
              <AppDropdown
                :label="homeContent.labels.mood"
                mode="single"
                :options="filterModeOptions"
                :selected-id="moodFilter.enabled ? 'on' : 'off'"
                size="compact"
                @update:selected-id="setMoodFilterMode"
              />
              <Range
                v-model:min-value="moodFilter.min"
                v-model:max-value="moodFilter.max"
                density="compact"
                variant="mobile"
                :label="homeContent.labels.range"
                :min="diaryLevelFieldConfigs.moodLevel.inputMin"
                :max="diaryLevelFieldConfigs.moodLevel.inputMax"
              />
            </div>
            <div class="grid min-w-0 gap-1">
              <AppDropdown
                :label="homeContent.labels.anxiety"
                mode="single"
                :options="filterModeOptions"
                :selected-id="anxietyFilter.enabled ? 'on' : 'off'"
                size="compact"
                @update:selected-id="setAnxietyFilterMode"
              />
              <Range
                v-model:min-value="anxietyFilter.min"
                v-model:max-value="anxietyFilter.max"
                density="compact"
                variant="mobile"
                :label="homeContent.labels.range"
                :min="diaryLevelFieldConfigs.anxietyLevel.inputMin"
                :max="diaryLevelFieldConfigs.anxietyLevel.inputMax"
              />
            </div>
            <div class="grid min-w-0 gap-1">
              <AppDropdown
                :label="homeContent.labels.energy"
                mode="single"
                :options="filterModeOptions"
                :selected-id="energyFilter.enabled ? 'on' : 'off'"
                size="compact"
                @update:selected-id="setEnergyFilterMode"
              />
              <Range
                v-model:min-value="energyFilter.min"
                v-model:max-value="energyFilter.max"
                density="compact"
                variant="mobile"
                :label="homeContent.labels.range"
                :min="diaryLevelFieldConfigs.energyLevel.inputMin"
                :max="diaryLevelFieldConfigs.energyLevel.inputMax"
              />
            </div>
          </div>
          <div
            class="grid"
            :style="mobileLayout.filterGridStyle"
          >
            <AppDropdown
              v-model:selected-ids="selectedTimePeriodIds"
              :label="homeContent.labels.writtenDuring"
              mode="multiple"
              :options="timePeriodOptions"
              :empty-label="homeContent.labels.all"
              size="compact"
            />
            <AppDropdown
              :label="homeContent.labels.timeZoneBasis"
              mode="single"
              :options="timeZoneFilterModeOptions"
              :selected-id="timeZoneFilterMode"
              size="compact"
              @update:selected-id="setTimeZoneFilterMode"
            />
            <DateRange
              v-model:start-value="startDateFilter"
              v-model:end-value="endDateFilter"
              variant="mobile"
            />
          </div>
        </div>
      </section>
      <button
        v-else
        class="mobile-home-filter-dock fixed bottom-0 flex w-full items-center justify-center border-t border-borderBase bg-panel text-sm font-medium text-titleText"
        :style="mobileLayout.collapsedFilterDockStyle"
        type="button"
        :aria-label="homeContent.aria.expandFilters"
        @click="expandFilterDock"
      >
        <span class="mr-2">{{ homeContent.labels.filters }}</span>
        <span
          class="block h-2 w-2 rotate-45 border-l-2 border-t-2 border-current"
          aria-hidden="true"
        />
      </button>
    </div>

    <input
      ref="importFileInput"
      accept="application/json"
      class="hidden"
      type="file"
      @change="importJsonFile"
    />

    <Teleport to="body">
      <div
        v-if="isDraftModalOpen"
        class="mobile-sheet-overlay fixed inset-0 flex items-end justify-center bg-app/70 p-3 backdrop-blur-md"
        :style="mobileFullScreenOverlayStyle"
      >
        <section
          class="mobile-draft-modal flex w-full flex-col overflow-hidden rounded-lg border border-borderBase bg-panel text-titleText"
          role="dialog"
          aria-modal="true"
          :aria-label="homeContent.aria.mobileLargeModal"
        >
          <header class="border-b border-borderBase p-5">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="text-xs font-medium uppercase text-mutedText">
                  {{ draftModalEyebrow }}
                </p>
                <h2 class="mt-2 text-2xl font-semibold">
                  {{ draftModalTitle }}
                </h2>
              </div>
              <div class="grid shrink-0 grid-cols-2 gap-2">
                <button
                  class="h-10 rounded-lg border border-borderBase px-3 text-sm"
                  type="button"
                  @click="requestCloseDraftModal"
                >
                  {{ homeContent.labels.close }}
                </button>
                <button
                  class="h-10 rounded-lg bg-accent px-3 text-sm font-medium text-inverseText disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  :disabled="!canSubmitDraftModal"
                  @click="submitDiaryEntry"
                >
                  {{ draftModalSubmitLabel }}
                </button>
              </div>
            </div>
            <p class="mt-3 text-sm text-mutedText">
              {{
                isDraftModalDirty
                  ? homeContent.labels.unsavedChanges
                  : homeContent.labels.noUnsavedChanges
              }}
            </p>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto p-5">
            <div
              v-if="draftModalErrorMessage"
              class="mb-5 rounded-lg border border-danger bg-dangerSurface px-4 py-3 text-sm text-danger"
            >
              {{ draftModalErrorMessage }}
            </div>

            <div class="space-y-4">
              <label class="block rounded-lg border border-borderBase bg-surface p-4">
                <span class="mb-2 block text-xs font-medium uppercase text-mutedText">
                  {{ homeContent.labels.title }}
                </span>
                <input
                  v-model="draftModalForm.title"
                  class="h-11 w-full rounded-lg border border-borderBase bg-panel px-3 text-sm outline-none focus:border-accent"
                  type="text"
                  :placeholder="homeContent.placeholders.untitledDiary"
                />
              </label>

              <section class="rounded-lg border border-borderBase bg-surface p-4">
                <AppDropdown
                  :label="homeContent.labels.mood"
                  mode="single"
                  :options="includeOptions"
                  :selected-id="draftModalForm.includeMood ? 'include' : 'skip'"
                  @update:selected-id="setDraftIncludeMood"
                />
                <AppSingleSlider
                  v-if="draftModalForm.includeMood"
                  v-model="draftModalForm.moodLevel"
                  class="mt-3"
                  :label="homeContent.labels.level"
                  :min="diaryLevelFieldConfigs.moodLevel.inputMin"
                  :max="diaryLevelFieldConfigs.moodLevel.inputMax"
                />
              </section>

              <section class="rounded-lg border border-borderBase bg-surface p-4">
                <AppDropdown
                  :label="homeContent.labels.anxiety"
                  mode="single"
                  :options="includeOptions"
                  :selected-id="draftModalForm.includeAnxiety ? 'include' : 'skip'"
                  @update:selected-id="setDraftIncludeAnxiety"
                />
                <AppSingleSlider
                  v-if="draftModalForm.includeAnxiety"
                  v-model="draftModalForm.anxietyLevel"
                  class="mt-3"
                  :label="homeContent.labels.level"
                  :min="diaryLevelFieldConfigs.anxietyLevel.inputMin"
                  :max="diaryLevelFieldConfigs.anxietyLevel.inputMax"
                />
              </section>

              <section class="rounded-lg border border-borderBase bg-surface p-4">
                <AppDropdown
                  :label="homeContent.labels.energy"
                  mode="single"
                  :options="includeOptions"
                  :selected-id="draftModalForm.includeEnergy ? 'include' : 'skip'"
                  @update:selected-id="setDraftIncludeEnergy"
                />
                <AppSingleSlider
                  v-if="draftModalForm.includeEnergy"
                  v-model="draftModalForm.energyLevel"
                  class="mt-3"
                  :label="homeContent.labels.level"
                  :min="diaryLevelFieldConfigs.energyLevel.inputMin"
                  :max="diaryLevelFieldConfigs.energyLevel.inputMax"
                />
              </section>

              <section class="rounded-lg border border-borderBase bg-surface p-4">
                <AppDropdown
                  :label="homeContent.labels.highlight"
                  mode="single"
                  :options="includeOptions"
                  :selected-id="draftModalForm.includeHighlight ? 'include' : 'skip'"
                  @update:selected-id="setDraftIncludeHighlight"
                />
                <textarea
                  v-if="draftModalForm.includeHighlight"
                  v-model="draftModalForm.highlight"
                  class="mt-3 h-28 w-full resize-none rounded-lg border border-borderBase bg-panel p-3 text-sm leading-6 outline-none focus:border-accent"
                />
              </section>

              <section class="rounded-lg border border-borderBase bg-surface p-4">
                <AppDropdown
                  :label="homeContent.labels.trouble"
                  mode="single"
                  :options="includeOptions"
                  :selected-id="draftModalForm.includeTrouble ? 'include' : 'skip'"
                  @update:selected-id="setDraftIncludeTrouble"
                />
                <textarea
                  v-if="draftModalForm.includeTrouble"
                  v-model="draftModalForm.trouble"
                  class="mt-3 h-28 w-full resize-none rounded-lg border border-borderBase bg-panel p-3 text-sm leading-6 outline-none focus:border-accent"
                />
              </section>

              <section class="rounded-lg border border-borderBase bg-surface p-4">
                <AppDropdown
                  :label="homeContent.labels.bodyFeeling"
                  mode="single"
                  :options="includeOptions"
                  :selected-id="draftModalForm.includeBodyFeeling ? 'include' : 'skip'"
                  @update:selected-id="setDraftIncludeBodyFeeling"
                />
                <textarea
                  v-if="draftModalForm.includeBodyFeeling"
                  v-model="draftModalForm.bodyFeeling"
                  class="mt-3 h-28 w-full resize-none rounded-lg border border-borderBase bg-panel p-3 text-sm leading-6 outline-none focus:border-accent"
                />
              </section>

              <section class="rounded-lg border border-borderBase bg-surface p-4">
                <AppDropdown
                  :label="homeContent.labels.body"
                  mode="single"
                  :options="includeOptions"
                  :selected-id="draftModalForm.includeContent ? 'include' : 'skip'"
                  @update:selected-id="setDraftIncludeContent"
                />
                <textarea
                  v-if="draftModalForm.includeContent"
                  v-model="draftModalForm.content"
                  class="mt-3 h-40 w-full resize-none rounded-lg border border-borderBase bg-panel p-3 text-sm leading-6 outline-none focus:border-accent"
                />
              </section>
            </div>
          </div>
        </section>
      </div>

      <div
        v-if="isUserActionModalOpen"
        class="mobile-sheet-overlay fixed inset-0 flex items-end justify-center bg-app/70 p-3 backdrop-blur-md"
        :style="mobileFullScreenOverlayStyle"
      >
        <section
          class="mobile-user-action-modal flex w-full flex-col overflow-hidden rounded-lg border border-borderBase bg-panel text-titleText"
          role="dialog"
          aria-modal="true"
          :aria-label="appChromeContent.aria.userActionModal"
        >
          <header class="flex items-center justify-between gap-3 border-b border-borderBase p-5">
            <h2 class="min-w-0 truncate text-xl font-semibold">
              {{ userActionModalTitle }}
            </h2>
            <div v-if="userActionModalKind === 'update-data'" class="grid shrink-0 grid-cols-2 gap-2">
              <button
                class="h-10 rounded-lg border border-borderBase px-3 text-sm"
                type="button"
                @click="requestCloseUserActionModal"
              >
                {{ appChromeContent.labels.close }}
              </button>
              <button
                class="h-10 rounded-lg bg-accent px-3 text-sm font-medium text-inverseText"
                type="button"
                @click="updateActiveUserData"
              >
                {{ appChromeContent.labels.save }}
              </button>
            </div>
            <button
              v-else
              class="h-10 rounded-lg border border-borderBase px-4 text-sm"
              type="button"
              @click="requestCloseUserActionModal"
            >
              {{ appChromeContent.labels.close }}
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto p-5">
            <div
              v-if="updateProfileErrorMessage"
              class="mb-5 rounded-lg border border-danger bg-dangerSurface px-4 py-3 text-sm text-danger"
            >
              {{ updateProfileErrorMessage }}
            </div>

            <div v-if="userActionModalKind === 'create-user'" class="space-y-5">
              <label class="block">
                <span class="mb-2 block text-xs font-medium uppercase text-mutedText">
                  {{ appChromeContent.labels.displayName }}
                </span>
                <input
                  v-model="createUserName"
                  class="h-11 w-full rounded-lg border border-borderBase bg-surface px-3 text-sm outline-none focus:border-accent"
                  type="text"
                />
              </label>
              <button
                class="h-11 w-full rounded-lg bg-accent px-5 text-sm font-medium text-inverseText"
                type="button"
                @click="createAndSwitchUser"
              >
                {{ appChromeContent.labels.create }}
              </button>
            </div>

            <div v-else-if="userActionModalKind === 'update-data'" class="space-y-5">
              <label class="block">
                <span class="mb-2 block text-xs font-medium uppercase text-mutedText">
                  {{ appChromeContent.labels.displayName }}
                </span>
                <input
                  v-model="updateUserName"
                  class="h-11 w-full rounded-lg border border-borderBase bg-surface px-3 text-sm outline-none focus:border-accent"
                  type="text"
                />
              </label>
              <section>
                <p class="text-xs font-medium uppercase text-mutedText">
                  {{ appChromeContent.labels.pronouns }}
                </p>
                <div class="mt-2 grid grid-cols-2 gap-3 rounded-lg border border-borderBase bg-surface p-3">
                  <div class="space-y-2">
                    <AppDropdown
                      :label="appChromeContent.labels.subject"
                      mode="single"
                      :options="pronounSubjectOptions"
                      :selected-id="updateUserPronounSubjectPreset"
                      @update:selected-id="setUpdateUserPronounSubjectPreset"
                    />
                    <input
                      v-if="updateUserPronounSubjectPreset === 'customize'"
                      v-model="updateUserPronounSubject"
                      class="h-11 w-full rounded-lg border border-borderBase bg-panel px-3 text-sm outline-none focus:border-accent"
                      type="text"
                      :aria-label="appChromeContent.aria.customSubjectPronoun"
                    />
                  </div>
                  <div
                    v-if="updateUserPronounSubjectPreset !== 'none'"
                    class="space-y-2"
                  >
                    <AppDropdown
                      :label="appChromeContent.labels.object"
                      mode="single"
                      :options="pronounObjectOptions"
                      :selected-id="updateUserPronounObjectPreset"
                      @update:selected-id="setUpdateUserPronounObjectPreset"
                    />
                    <input
                      v-if="updateUserPronounObjectPreset === 'customize'"
                      v-model="updateUserPronounObject"
                      class="h-11 w-full rounded-lg border border-borderBase bg-panel px-3 text-sm outline-none focus:border-accent"
                      type="text"
                      :aria-label="appChromeContent.aria.customObjectPronoun"
                    />
                  </div>
                </div>
              </section>
              <section>
                <p class="text-xs font-medium uppercase text-mutedText">
                  {{ appChromeContent.labels.status }}
                </p>
                <div class="mt-2 space-y-3 rounded-lg border border-borderBase bg-surface p-3">
                  <div class="grid grid-cols-2 gap-3">
                    <AppDropdown
                      :label="appChromeContent.labels.show"
                      mode="single"
                      :options="statusVisibilityOptions"
                      :selected-id="updateUserStatusVisibilityId"
                      @update:selected-id="setUpdateUserStatusVisibility"
                    />
                    <label class="block">
                      <span class="mb-2 block text-xs text-mutedText">
                        {{ appChromeContent.labels.emoji }}
                      </span>
                      <input
                        v-model="updateUserStatusEmoji"
                        class="h-11 w-full rounded-lg border border-borderBase bg-panel px-3 text-sm outline-none focus:border-accent"
                        :placeholder="appChromeContent.placeholders.emoji"
                        type="text"
                        @change="normalizeUpdateUserStatusEmojiInput"
                      />
                    </label>
                  </div>
                  <div>
                    <label class="block">
                      <span class="mb-2 block text-xs text-mutedText">
                        {{ appChromeContent.labels.text }}
                      </span>
                      <input
                        v-model="updateUserStatusText"
                        class="h-11 w-full rounded-lg border border-borderBase bg-panel px-3 text-sm outline-none focus:border-accent"
                        :placeholder="appChromeContent.placeholders.statusText"
                        type="text"
                      />
                      <span class="mt-1 block text-xs text-mutedText">
                        {{ updateUserStatusTextCount }}/{{ userProfileTextLimits.status }}
                      </span>
                    </label>
                  </div>
                </div>
              </section>
              <label class="block">
                <span class="mb-2 block text-xs font-medium uppercase text-mutedText">
                  {{ appChromeContent.labels.bio }}
                </span>
                <textarea
                  v-model="updateUserBio"
                  class="h-24 w-full resize-none rounded-lg border border-borderBase bg-surface p-3 text-sm leading-6 outline-none focus:border-accent"
                  :placeholder="appChromeContent.placeholders.noBio"
                />
                <span class="mt-1 block text-xs text-mutedText">
                  {{ updateUserBioCount }}/{{ userProfileTextLimits.bio }}
                </span>
              </label>
              <section class="grid grid-cols-2 gap-4">
                <div class="rounded-lg border border-borderBase bg-surface p-3">
                  <p class="mb-3 text-xs font-medium uppercase text-mutedText">
                    {{ appChromeContent.labels.avatar }}
                  </p>
                  <div class="aspect-square overflow-hidden rounded-lg border border-borderBase bg-panel">
                    <div
                      v-if="updateAvatarCropSource"
                      class="relative h-full w-full overflow-hidden"
                    >
                      <img
                        :alt="`${activeUserLabel} ${appChromeContent.alt.cropSourceSuffix}`"
                        class="absolute left-0 top-0 max-w-none"
                        :src="updateAvatarCropSource.dataUrl"
                        :style="updateAvatarCropPreviewStyle"
                      />
                    </div>
                    <img
                      v-else-if="updateAvatarPreviewDataUrl"
                      :alt="activeUserLabel"
                      class="h-full w-full object-cover"
                      :src="updateAvatarPreviewDataUrl"
                    />
                  </div>
                  <div v-if="updateAvatarCropSource" class="mt-3 space-y-3">
                    <AppSingleSlider
                      v-model="updateAvatarCropSize"
                      :label="appChromeContent.labels.cropSize"
                      :min="avatarCropLimits.minSize"
                      :max="updateAvatarCropMaxSize"
                    />
                    <AppSingleSlider
                      v-model="updateAvatarCropX"
                      :label="appChromeContent.labels.cropX"
                      :min="0"
                      :max="updateAvatarCropMaxX"
                    />
                    <AppSingleSlider
                      v-model="updateAvatarCropY"
                      :label="appChromeContent.labels.cropY"
                      :min="0"
                      :max="updateAvatarCropMaxY"
                    />
                    <button
                      class="w-full rounded-lg bg-accent px-3 py-2 text-left text-sm font-medium text-inverseText"
                      type="button"
                      @click="applyAvatarCrop"
                    >
                      {{ appChromeContent.labels.applyCrop }}
                    </button>
                  </div>
                  <button
                    class="mt-3 w-full rounded-lg border border-borderBase px-3 py-2 text-left text-sm"
                    type="button"
                    @click="openAvatarFilePicker"
                  >
                    {{ appChromeContent.labels.upload }}
                  </button>
                  <button
                    class="mt-2 w-full rounded-lg border border-borderBase px-3 py-2 text-left text-sm text-danger"
                    type="button"
                    @click="deleteActiveUserAvatar"
                  >
                    {{ appChromeContent.labels.delete }}
                  </button>
                </div>

                <div class="rounded-lg border border-borderBase bg-surface p-3">
                  <p class="mb-3 text-xs font-medium uppercase text-mutedText">
                    {{ appChromeContent.labels.mask }}
                  </p>
                  <div class="aspect-square overflow-hidden rounded-lg border border-borderBase bg-panel">
                    <div
                      v-if="isUpdateAvatarMaskPreviewPending"
                      class="flex h-full w-full items-center justify-center bg-panelMuted px-4 text-center text-sm text-mutedText"
                    >
                      {{ appChromeContent.messages.avatarMaskPending }}
                    </div>
                    <img
                      v-else-if="updateAvatarMaskPreviewDataUrl"
                      :alt="`${activeUserLabel} ${appChromeContent.alt.maskSuffix}`"
                      class="h-full w-full object-cover"
                      :src="updateAvatarMaskPreviewDataUrl"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center px-4 text-center text-sm text-mutedText"
                    >
                      {{ appChromeContent.labels.noMask }}
                    </div>
                  </div>
                  <button
                    class="mt-3 w-full rounded-lg border border-borderBase px-3 py-2 text-left text-sm text-danger"
                    type="button"
                    @click="deleteActiveUserMask"
                  >
                    {{ appChromeContent.labels.deleteMask }}
                  </button>
                </div>
              </section>
            </div>

            <div v-else-if="userActionModalKind === 'switch-user'" class="space-y-3">
              <button
                v-for="user in userOptions"
                :key="user.id"
                class="w-full rounded-lg border border-borderBase px-4 py-3 text-left text-sm hover:bg-panelMuted"
                type="button"
                @click="switchUserById(user.id)"
              >
                {{ user.label }}
              </button>
            </div>

            <div v-else-if="userActionModalKind === 'merge-users'" class="space-y-5">
              <div
                v-if="mergeUsersErrorMessage"
                class="rounded-lg border border-danger bg-dangerSurface px-4 py-3 text-sm text-danger"
              >
                {{ mergeUsersErrorMessage }}
              </div>
              <AppDropdown
                :label="appChromeContent.labels.keepUser"
                mode="single"
                :options="mergeTargetUserOptions"
                :selected-id="mergeTargetUserId"
                @update:selected-id="setMergeTargetUserId"
              />
              <AppDropdown
                v-model:selected-ids="mergeSourceUserIds"
                :label="appChromeContent.labels.mergeTheseUsers"
                mode="multiple"
                :options="mergeSourceUserOptions"
              />
              <p class="text-sm leading-6 text-bodyText">
                {{ appChromeContent.messages.mergeUsers }}
              </p>
              <button
                class="h-11 w-full rounded-lg bg-accent px-5 text-sm font-medium text-inverseText"
                type="button"
                @click="mergeSelectedUsers"
              >
                {{ appChromeContent.labels.mergeUsers }}
              </button>
            </div>

            <div v-else class="space-y-4">
              <p class="text-sm leading-6 text-bodyText">
                {{ appChromeContent.messages.emptyUsers }}
              </p>
              <button
                class="h-11 w-full rounded-lg bg-accent px-5 text-sm font-medium text-inverseText"
                type="button"
                @click="openCreateUserModal"
              >
                {{ appChromeContent.labels.createUser }}
              </button>
              <button
                class="h-11 w-full rounded-lg border border-borderBase px-5 text-sm"
                type="button"
                @click="openImportFilePicker"
              >
                {{ appChromeContent.labels.importFromJson }}
              </button>
            </div>
          </div>
        </section>
      </div>

      <div
        v-if="diaryDeleteConfirmationEntryId"
        class="mobile-confirmation-overlay-primary fixed inset-0 flex items-center justify-center bg-app/70 p-5 backdrop-blur-md"
        :style="mobileFullScreenOverlayPrimaryStyle"
      >
        <section
          class="w-full rounded-lg border border-borderBase bg-panel p-6 text-titleText"
          role="dialog"
          aria-modal="true"
          :aria-label="homeContent.aria.deleteDiaryConfirmation"
        >
          <p class="text-xs uppercase text-danger">
            {{ homeContent.labels.danger }}
          </p>
          <h2 class="mt-3 text-2xl font-semibold">
            {{ homeContent.labels.deleteDiary }}
          </h2>
          <p class="mt-4 text-sm leading-6 text-bodyText">
            {{ diaryDeleteConfirmationBody }}
          </p>
          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              class="h-10 rounded-lg border border-borderBase px-3 text-sm"
              type="button"
              @click="closeDeleteDiaryEntryConfirmation"
            >
              {{ homeContent.labels.cancel }}
            </button>
            <button
              class="h-10 rounded-lg bg-danger px-3 text-sm font-medium text-inverseText"
              type="button"
              @click="confirmDeleteDiaryEntry"
            >
              {{ homeContent.labels.delete }}
            </button>
          </div>
        </section>
      </div>

      <div
        v-if="isDraftCloseConfirmationOpen"
        class="mobile-confirmation-overlay-primary fixed inset-0 flex items-center justify-center bg-app/70 p-5 backdrop-blur-md"
        :style="mobileFullScreenOverlayPrimaryStyle"
      >
        <section
          class="w-full rounded-lg border border-borderBase bg-panel p-6 text-titleText"
          role="dialog"
          aria-modal="true"
          :aria-label="homeContent.aria.unsavedDiaryConfirmation"
        >
          <p class="text-xs uppercase text-mutedText">
            {{ homeContent.labels.unsavedChanges }}
          </p>
          <h2 class="mt-3 text-2xl font-semibold">
            {{ homeContent.labels.closeDiary }}
          </h2>
          <p class="mt-4 text-sm leading-6 text-bodyText">
            {{ homeContent.messages.unsavedDiary }}
          </p>
          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              class="h-10 rounded-lg border border-borderBase px-3 text-sm"
              type="button"
              @click="closeDraftCloseConfirmation"
            >
              {{ homeContent.labels.continueEditing }}
            </button>
            <button
              class="h-10 rounded-lg bg-accent px-3 text-sm font-medium text-inverseText"
              type="button"
              @click="confirmCloseDraftModal"
            >
              {{ homeContent.labels.closeWithoutSaving }}
            </button>
          </div>
        </section>
      </div>

      <div
        v-if="isHelpModalOpen"
        class="mobile-page-overlay fixed inset-0 flex items-center justify-center bg-app/70 p-5 backdrop-blur-md"
        :style="mobileFullScreenOverlayStyle"
      >
        <section
          class="mobile-help-modal flex w-full flex-col overflow-hidden rounded-lg border border-borderBase bg-panel text-titleText"
          role="dialog"
          aria-modal="true"
          :aria-label="appChromeContent.labels.help"
        >
          <header class="relative shrink-0 border-b border-borderBase p-6 pb-4">
            <div class="min-w-0">
              <p class="text-xs font-medium uppercase text-mutedText">
                {{ appChromeContent.labels.help }}
              </p>
              <h2 class="mt-3 text-2xl font-semibold">
                {{ helpContent.title }}
              </h2>
            </div>
            <img
              v-if="mobileLayout.isHelpLogoVisible"
              class="pointer-events-none absolute bottom-0 top-0 my-auto w-auto object-contain"
              :style="mobileLayout.helpLogoStyle"
              :src="PUBLIC_ASSET_PATHS.helpLogo"
              :alt="appChromeContent.alt.logo"
            />
          </header>
          <div class="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
            <section class="group" tabindex="0">
              <h3
                class="text-sm font-semibold text-titleText"
              >
                {{ helpContent.architecture.title }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-bodyText">
                {{ helpContent.architecture.body }}
              </p>
              <p class="mt-2 hidden rounded-lg border border-borderBase bg-panelStrong px-3 py-2 text-xs leading-5 text-inverseText group-hover:block group-focus:block">
                {{ helpContent.architecture.hoverEasterEgg }}
              </p>
            </section>
            <section>
              <p class="mt-2 text-sm leading-6 text-bodyText">
                <span class="font-semibold text-titleText">
                  {{ helpContent.copyright.title }}
                </span>
                {{ helpContent.copyright.symbol }}
                {{ helpContent.copyright.year }}
                {{ helpContent.copyright.author }}
              </p>
              <p class="text-sm leading-6 text-bodyText">
                {{ helpContent.copyright.email }}
              </p>
            </section>
            <section>
              <h3 class="text-sm font-semibold text-titleText">
                {{ helpContent.product.title }}
              </h3>
              <p
                v-for="paragraph in helpContent.product.paragraphs"
                :key="paragraph"
                class="mt-2 text-sm leading-6 text-bodyText"
              >
                {{ paragraph }}
              </p>
            </section>
          </div>
          <footer class="flex shrink-0 items-end justify-between gap-4 border-t border-borderBase p-6 pt-4">
            <button
              class="h-10 rounded-lg border border-borderBase px-4 text-sm"
              type="button"
              @click="closeHelpModal"
            >
              {{ helpContent.closeLabel }}
            </button>
            <div class="ml-auto flex min-w-0 items-center justify-end gap-4">
              <p class="shrink-0 text-sm font-semibold text-titleText">
                {{ helpContent.version.title }}
              </p>
              <div class="min-w-0 text-left">
                <p class="text-sm leading-5 text-bodyText">
                  {{ helpContent.version.appLabel }}
                  {{ helpContent.version.appVersionLabel }}
                </p>
                <p class="text-sm leading-5 text-bodyText">
                  {{ helpContent.version.dataLabel }}
                  {{ helpContent.version.dataVersionLabel }}
                </p>
              </div>
            </div>
          </footer>
        </section>
      </div>

      <div
        v-if="isUserActionCloseConfirmationOpen"
        class="mobile-confirmation-overlay-primary fixed inset-0 flex items-center justify-center bg-app/70 p-5 backdrop-blur-md"
        :style="mobileFullScreenOverlayPrimaryStyle"
      >
        <section
          class="w-full rounded-lg border border-borderBase bg-panel p-6 text-titleText"
          role="dialog"
          aria-modal="true"
          :aria-label="appChromeContent.aria.unsavedProfileConfirmation"
        >
          <p class="text-xs uppercase text-mutedText">
            {{ appChromeContent.labels.unsavedChanges }}
          </p>
          <h2 class="mt-3 text-2xl font-semibold">
            {{ appChromeContent.labels.closeProfile }}
          </h2>
          <p class="mt-4 text-sm leading-6 text-bodyText">
            {{ appChromeContent.messages.unsavedProfile }}
          </p>
          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              class="h-10 rounded-lg border border-borderBase px-3 text-sm"
              type="button"
              @click="closeUserActionCloseConfirmation"
            >
              {{ appChromeContent.labels.continueEditing }}
            </button>
            <button
              class="h-10 rounded-lg bg-accent px-3 text-sm font-medium text-inverseText"
              type="button"
              @click="confirmCloseUserActionModal"
            >
              {{ appChromeContent.labels.closeWithoutSaving }}
            </button>
          </div>
        </section>
      </div>

      <div
        v-if="confirmationKind"
        class="mobile-confirmation-overlay-secondary fixed inset-0 flex items-center justify-center bg-app/70 p-5 backdrop-blur-md"
        :style="mobileFullScreenOverlaySecondaryStyle"
      >
        <section
          class="w-full rounded-lg border border-borderBase bg-panel p-6 text-titleText"
          role="dialog"
          aria-modal="true"
          :aria-label="appChromeContent.aria.confirmationModal"
        >
          <p class="text-xs uppercase text-mutedText">
            {{ confirmationStepLabel }}
          </p>
          <h2 class="mt-3 text-2xl font-semibold">
            {{ confirmationTitle }}
          </h2>
          <p class="mt-4 text-sm leading-6 text-bodyText">
            {{ confirmationBody }}
          </p>
          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              class="h-10 rounded-lg border border-borderBase px-4 text-sm"
              type="button"
              @click="closeConfirmation"
            >
              {{ appChromeContent.labels.cancel }}
            </button>
            <button
              class="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-inverseText"
              type="button"
              @click="confirmCurrentAction"
            >
              {{ appChromeContent.labels.confirm }}
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </section>
</template>
