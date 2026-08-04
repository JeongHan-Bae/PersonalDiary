<script setup lang="ts">
import AppAutoScaleContent from '@/app/components/AppAutoScaleContent.vue';
import DateRange from '@/app/components/DateRange.vue';
import AppDropdown from '@/app/components/AppDropdown.vue';
import AppLevelMeter from '@/app/components/AppLevelMeter.vue';
import Range from '@/app/components/Range.vue';
import AppSingleSlider from '@/app/components/AppSingleSlider.vue';
import AvatarRenderer from '@/app/components/AvatarRenderer.vue';
import { PUBLIC_ASSET_PATHS } from '@/constants/assetConstants';
import { useDesktopHomePage } from '@/app/pages/desktop/DesktopHomePage';

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
  currentDateLabel,
  currentTimeLabel,
  deleteActiveUserAvatar,
  deleteActiveUserMask,
  desktopLayout,
  desktopDateStyle,
  desktopDateTimeStyle,
  desktopFullScreenOverlayPrimaryStyle,
  desktopFullScreenOverlaySecondaryStyle,
  desktopFullScreenOverlayStyle,
  desktopUserMenuButtonLabel,
  desktopNavElement,
  desktopNavLeftElement,
  desktopNavLeftStyle,
  desktopNavRightElement,
  desktopNavRightStyle,
  desktopNavStyle,
  desktopProfileAvatarElement,
  desktopProfileAvatarStyle,
  desktopProfileJsonActionStyle,
  desktopTimeStyle,
  desktopUserMenuStyle,
  desktopUserMenuWidthStyle,
  anxietyFilter,
  draftModalErrorMessage,
  draftModalEyebrow,
  draftModalForm,
  draftModalSubmitLabel,
  draftModalTitle,
  endDateFilter,
  energyFilter,
  exportJsonFile,
  filterModeOptions,
  hasEntries,
  helpContent,
  homeContent,
  includeOptions,
  importFileInput,
  importJsonFile,
  isDraftCloseConfirmationOpen,
  isDraftModalDirty,
  isDraftModalOpen,
  isHelpModalOpen,
  isLoading,
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
  diaryDeleteConfirmationEntryId,
  diaryDeleteConfirmationBody,
  diaryDeleteConfirmationEntryLabel,
  diaryEntryCountLabel,
  diaryLevelFieldConfigs,
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
} = useDesktopHomePage();
</script>

<template>
  <section class="flex h-full w-full flex-col bg-app text-titleText">
    <nav
      ref="desktopNavElement"
      class="desktop-home-nav flex w-full items-center justify-between bg-navSurface"
      :style="desktopNavStyle"
    >
      <div
        ref="desktopNavLeftElement"
        class="flex shrink-0 items-center"
        :style="desktopNavLeftStyle"
      >
        <div class="w-auto">
          <AppDropdown
            :label="appChromeContent.labels.theme"
            mode="single"
            :options="themeOptions"
            :selected-id="themeId"
            label-placement="left"
            :label-default-font-px="desktopLayout.dropdownLabelDefaultFontPx"
            :fit-label="false"
            :control-class="desktopLayout.dropdownControlClass"
            @update:selected-id="setTheme"
          />
        </div>
        <div class="w-auto">
          <AppDropdown
            :label="appChromeContent.labels.language"
            mode="single"
            :options="languageOptions"
            :selected-id="languageId"
            label-placement="left"
            :label-default-font-px="desktopLayout.dropdownLabelDefaultFontPx"
            :fit-label="false"
            :control-class="desktopLayout.dropdownControlClass"
            @update:selected-id="setLanguage"
          />
        </div>
      </div>

      <div
        class="flex min-w-0 items-baseline justify-center text-center"
        :style="desktopDateTimeStyle"
      >
        <p
          class="min-w-0 text-lg font-semibold leading-tight"
          :style="desktopDateStyle"
        >
          {{ currentDateLabel }}
        </p>
        <p
          class="min-w-0 text-base font-medium leading-tight text-bodyText"
          :style="desktopTimeStyle"
        >
          {{ currentTimeLabel }}
        </p>
      </div>

      <div
        ref="desktopNavRightElement"
        class="flex shrink-0 items-center"
        :style="desktopNavRightStyle"
      >
        <div class="flex items-center gap-3">
          <p class="shrink-0 text-sm font-medium text-mutedText">
            {{ appChromeContent.labels.help }}
          </p>
          <button
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-borderBase bg-panel text-lg font-semibold text-titleText"
            type="button"
            :aria-label="appChromeContent.aria.openHelp"
            @click="openHelpModal"
          >
            {{ appChromeContent.labels.helpSymbol }}
          </button>
        </div>
        <div class="flex items-center gap-3">
          <p class="shrink-0 text-sm font-medium text-mutedText">
            {{ appChromeContent.labels.user }}
          </p>
          <div
            ref="userMenuRoot"
            class="relative"
            :style="desktopUserMenuWidthStyle"
          >
            <button
              class="flex h-14 w-full items-center justify-between gap-3 rounded-lg border border-borderBase bg-panel px-3"
              type="button"
              aria-haspopup="menu"
              :aria-expanded="isUserMenuOpen"
              @click="toggleUserMenu"
            >
              <span class="desktop-user-menu-button-label min-w-0 flex-1 text-left text-sm font-semibold">
                {{ desktopUserMenuButtonLabel }}
              </span>
              <span class="h-10 w-10 overflow-hidden rounded-full border-2 border-avatarBorder bg-navAvatarSurface">
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
              class="absolute right-0 top-16 w-full min-w-full rounded-lg border border-borderBase bg-panel p-2"
              :style="desktopUserMenuStyle"
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
                @click="openUpdateDataModal"
              >
                {{ appChromeContent.labels.updateProfile }}
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
                :class="desktopLayout.dangerMenuGridClass"
                type="button"
                role="menuitem"
                @click="openDeleteUserConfirmation"
              >
                <span class="shrink-0 whitespace-nowrap">
                  {{ appChromeContent.labels.deleteUser }}
                </span>
                <span class="justify-self-end whitespace-nowrap rounded-full bg-dangerSurface px-2 py-0.5 text-typo-tiny font-medium text-danger">
                  {{ appChromeContent.labels.danger }}
                </span>
              </button>
              <button
                class="grid w-full items-center rounded-lg px-3 py-3 text-left text-sm text-danger hover:bg-dangerSurface"
                :class="desktopLayout.dangerMenuGridClass"
                type="button"
                role="menuitem"
                @click="openClearDataConfirmation"
              >
                <span class="shrink-0 whitespace-nowrap">
                  {{ appChromeContent.labels.clearData }}
                </span>
                <span class="justify-self-end whitespace-nowrap rounded-full bg-dangerSurface px-2 py-0.5 text-typo-tiny font-medium text-danger">
                  {{ appChromeContent.labels.danger }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <input
        ref="avatarFileInput"
        accept="image/png,image/jpeg,image/webp"
        class="hidden"
        type="file"
        @change="uploadAvatar"
      />
    </nav>

    <div
      class="desktop-home-content flex w-full overflow-hidden"
    >
      <aside
        class="desktop-profile-panel flex h-full flex-col rounded-lg bg-profileSurface p-7"
      >
        <div class="desktop-profile-identity">
          <button
            ref="desktopProfileAvatarElement"
            class="desktop-profile-avatar overflow-hidden rounded-full border-2 border-avatarBorder bg-profileAvatarSurface"
            type="button"
            :style="desktopProfileAvatarStyle"
            @click="openUpdateDataModal"
          >
            <AvatarRenderer
              v-if="activeAvatarDataUrl"
              :alt="activeUserLabel"
              :original-image-data-url="activeAvatarDataUrl"
              :mask-image-data-url="activeAvatarMaskDataUrl"
            />
          </button>

          <div class="desktop-profile-text">
            <h1 class="desktop-profile-name text-center text-3xl font-semibold">
              {{ activeUserLabel }}
            </h1>

            <p
              v-if="activeUserPronounsVisible"
              class="desktop-profile-pronouns text-center text-sm text-mutedText"
            >
              {{ activeUserPronounsLabel }}
            </p>
          </div>
        </div>

        <div
          v-if="activeUserStatusVisible"
          class="desktop-profile-status inline-flex max-w-full items-center gap-2 rounded-full border border-borderBase bg-mainColor px-3 py-2 text-sm text-mainColorBodyText"
        >
          <span class="shrink-0">{{ activeUserStatusEmoji }}</span>
          <span class="min-w-0 truncate">{{ activeUserStatusText }}</span>
        </div>

        <div class="desktop-profile-bio rounded-lg border border-borderBase bg-surface px-4 py-3 text-sm leading-6 text-bodyText">
          {{ activeUserBioLabel }}
        </div>

        <div class="desktop-profile-actions space-y-3">
          <button
            class="profile-action-button w-full rounded-lg bg-accent px-5 py-4 text-sm font-medium text-inverseText"
            type="button"
            @click="openUpdateDataModal"
          >
            {{ appChromeContent.labels.editProfile }}
          </button>
          <div class="grid grid-cols-2 gap-3">
            <button
              class="profile-action-button profile-json-action-button rounded-lg border border-borderBase py-3 font-medium"
              type="button"
              :style="desktopProfileJsonActionStyle"
              @click="openImportFilePicker"
            >
              <span class="profile-json-action-label">
                {{ appChromeContent.labels.importFromJson }}
              </span>
            </button>
            <button
              class="profile-action-button profile-json-action-button rounded-lg border border-borderBase py-3 font-medium"
              type="button"
              :style="desktopProfileJsonActionStyle"
              @click="exportJsonFile"
            >
              <span class="profile-json-action-label">
                {{ appChromeContent.labels.exportToJson }}
              </span>
            </button>
          </div>
        </div>
      </aside>

      <main
        class="desktop-home-main flex min-w-0 flex-1 flex-col rounded-lg bg-panel pb-0"
      >
        <div
          class="desktop-home-main-header grid items-center gap-8"
        >
          <p class="min-w-0 text-3xl font-semibold leading-tight">
            {{ diaryPrompt.text }}
          </p>
          <button
            class="h-12 rounded-lg bg-accent px-6 text-sm font-medium text-inverseText"
            type="button"
            @click="openDraftModal"
          >
            {{ homeContent.labels.newDiary }}
          </button>
        </div>

        <div
          class="desktop-home-diary-body grid min-h-0 flex-1 gap-5"
        >
          <section class="flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-surface p-5">
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-2xl font-semibold">
                {{ homeContent.labels.notebookTitle }}
              </h2>
              <span class="rounded-full bg-panelMuted px-3 py-1 text-xs font-medium text-mutedText">
                {{ diaryEntryCountLabel }}
              </span>
            </div>
            <div v-if="isLoading" class="mt-6 text-bodyText">
              <span :class="shouldShowDiaryLoadingLabel ? '' : 'invisible'">
                {{ homeContent.labels.loading }}
              </span>
            </div>
            <div v-else-if="!hasEntries" class="mt-6 text-bodyText">
              {{ homeContent.labels.noEntries }}
            </div>
            <ul v-else class="desktop-home-panel-scroll desktop-home-diary-notebook-scroll mt-5 min-h-0 flex-1 space-y-5 overflow-y-auto">
              <li
                v-for="entry in visibleEntryCards"
                :key="entry.id"
                class="rounded-lg bg-mainColor p-5 text-mainColorText"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="space-y-1">
                    <h3 class="text-lg font-semibold text-mainColorText">
                      {{ entry.title }}
                    </h3>
                    <p class="text-sm font-medium text-mainColorMutedText">
                      Written {{ entry.submittedAtLabel }}
                    </p>
                    <p class="text-xs text-mainColorMutedText">
                      Updated {{ entry.updatedAtLabel }}
                    </p>
                  </div>
                  <div class="flex shrink-0 gap-2">
                    <button
                      class="h-8 rounded-lg border border-borderBase px-3 text-xs"
                      type="button"
                      @click="openUpdateDiaryEntry(entry.id)"
                    >
                      {{ homeContent.labels.edit }}
                    </button>
                    <button
                      class="h-8 rounded-lg border border-danger px-3 text-xs text-danger"
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
                    class="grid grid-cols-3 gap-3 rounded-lg border border-borderBase bg-profileSurface p-3"
                  >
                    <div
                      v-for="field in entry.levelFields"
                      :key="field.id"
                      class="min-w-0"
                    >
                      <p class="text-xs font-medium uppercase text-mutedText">
                        {{ field.label }}
                      </p>
                      <AppLevelMeter
                        class="mt-2"
                        :percent="field.percent"
                        :tone="field.tone"
                      />
                      <p class="mt-2 text-sm font-medium text-bodyText">
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

          <section class="flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-panelStrong p-5 text-inverseText">
            <h2 class="text-xl font-semibold">
              {{ homeContent.labels.filters }}
            </h2>
            <div class="mt-3 min-h-0 flex-1">
              <AppAutoScaleContent
                class="desktop-home-panel-scroll"
                :min-scale="desktopLayout.filtersMinScale"
              >
                <div class="space-y-2">
                  <section
                    class="desktop-home-level-filter-grid grid items-end gap-3"
                  >
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
                      variant="desktop"
                      :label="homeContent.labels.range"
                      :min="diaryLevelFieldConfigs.moodLevel.inputMin"
                      :max="diaryLevelFieldConfigs.moodLevel.inputMax"
                    />
                  </section>

                  <section
                    class="desktop-home-level-filter-grid grid items-end gap-3"
                  >
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
                      variant="desktop"
                      :label="homeContent.labels.range"
                      :min="diaryLevelFieldConfigs.anxietyLevel.inputMin"
                      :max="diaryLevelFieldConfigs.anxietyLevel.inputMax"
                    />
                  </section>

                  <section
                    class="desktop-home-level-filter-grid grid items-end gap-3"
                  >
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
                      variant="desktop"
                      :label="homeContent.labels.range"
                      :min="diaryLevelFieldConfigs.energyLevel.inputMin"
                      :max="diaryLevelFieldConfigs.energyLevel.inputMax"
                    />
                  </section>

                  <section class="space-y-2">
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
                  </section>

                  <DateRange
                    v-model:start-value="startDateFilter"
                    v-model:end-value="endDateFilter"
                    variant="desktop"
                  />
                </div>
              </AppAutoScaleContent>
            </div>
          </section>
        </div>
      </main>
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
        class="desktop-home-overlay fixed inset-0 flex items-center justify-center bg-app/70 backdrop-blur-md"
        :style="desktopFullScreenOverlayStyle"
      >
        <section
          class="desktop-draft-modal flex overflow-hidden rounded-lg border border-borderBase bg-panel text-titleText"
          role="dialog"
          aria-modal="true"
          :aria-label="homeContent.aria.desktopLargeModal"
        >
          <div
            class="desktop-draft-modal-side flex flex-col bg-panelMuted p-8"
          >
            <p class="text-xs font-medium uppercase text-mutedText">
              {{ draftModalEyebrow }}
            </p>
            <h2 class="mt-4 text-4xl font-semibold leading-tight">
              {{ draftModalTitle }}
            </h2>
            <p class="mt-5 text-sm leading-7 text-bodyText">
              {{ homeContent.messages.draftHelper }}
            </p>
            <div class="mt-auto rounded-lg border border-borderBase bg-panel p-4 text-sm text-bodyText">
              {{
                isDraftModalDirty
                  ? homeContent.labels.unsavedChanges
                  : homeContent.labels.noUnsavedChanges
              }}
            </div>
          </div>

          <div class="flex min-w-0 flex-1 flex-col">
            <header class="flex items-center justify-between border-b border-borderBase px-8 py-5">
              <div>
                <p class="text-xs uppercase text-mutedText">
                  {{ draftModalEyebrow }}
                </p>
                <h3 class="mt-1 text-2xl font-semibold">{{ draftModalTitle }}</h3>
              </div>
              <div class="flex gap-3">
                <button
                  class="h-10 rounded-lg border border-borderBase px-4 text-sm"
                  type="button"
                  @click="requestCloseDraftModal"
                >
                  {{ homeContent.labels.close }}
                </button>
                <button
                  class="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-inverseText disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  :disabled="!canSubmitDraftModal"
                  @click="submitDiaryEntry"
                >
                  {{ draftModalSubmitLabel }}
                </button>
              </div>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto px-8 py-6">
              <div
                v-if="draftModalErrorMessage"
                class="mb-5 rounded-lg border border-danger bg-dangerSurface px-4 py-3 text-sm text-danger"
              >
                {{ draftModalErrorMessage }}
              </div>

              <div class="space-y-5">
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
                  <div class="grid grid-cols-3 gap-4">
                    <div class="min-w-0">
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
                    </div>
                    <div class="min-w-0">
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
                    </div>
                    <div class="min-w-0">
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
                    </div>
                  </div>
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
                    class="desktop-diary-body-textarea mt-3 w-full resize-none rounded-lg border border-borderBase bg-panel p-3 text-sm leading-6 outline-none focus:border-accent"
                  />
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div
        v-if="isHelpModalOpen"
        class="desktop-home-overlay fixed inset-0 flex items-center justify-center bg-app/70 backdrop-blur-md"
        :style="desktopFullScreenOverlayStyle"
      >
        <section
          class="desktop-help-modal flex flex-col overflow-hidden rounded-lg border border-borderBase bg-panel text-titleText"
          role="dialog"
          aria-modal="true"
          :aria-label="appChromeContent.labels.help"
        >
          <header class="relative shrink-0 border-b border-borderBase p-8 pb-5">
            <div class="min-w-0">
              <p class="text-xs font-medium uppercase text-mutedText">
                {{ appChromeContent.labels.help }}
              </p>
              <h2 class="mt-3 text-2xl font-semibold">
                {{ helpContent.title }}
              </h2>
            </div>
            <img
              class="desktop-help-logo pointer-events-none absolute bottom-0 top-0 h-full w-auto object-contain"
              :src="PUBLIC_ASSET_PATHS.helpLogo"
              :alt="appChromeContent.alt.logo"
            />
          </header>
          <div class="min-h-0 flex-1 space-y-5 overflow-y-auto p-8">
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
          <footer class="flex shrink-0 items-end justify-between gap-4 border-t border-borderBase p-8 pt-5">
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
        v-if="isUserActionModalOpen"
        class="desktop-home-overlay fixed inset-0 flex items-center justify-center bg-app/70 backdrop-blur-md"
        :style="desktopFullScreenOverlayStyle"
      >
        <section
          class="desktop-user-action-modal flex flex-col overflow-hidden rounded-lg border border-borderBase bg-panel text-titleText"
          role="dialog"
          aria-modal="true"
          :aria-label="appChromeContent.aria.userActionModal"
        >
          <header class="flex items-center justify-between gap-4 border-b border-borderBase px-8 py-5">
            <h2 class="min-w-0 truncate text-2xl font-semibold">
              {{ userActionModalTitle }}
            </h2>
            <div v-if="userActionModalKind === 'update-data'" class="flex gap-3">
              <button
                class="h-10 rounded-lg border border-borderBase px-4 text-sm"
                type="button"
                @click="requestCloseUserActionModal"
              >
                {{ appChromeContent.labels.closeWithoutSaving }}
              </button>
              <button
                class="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-inverseText"
                type="button"
                @click="updateActiveUserData"
              >
                {{ appChromeContent.labels.saveChanges }}
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

          <div class="min-h-0 flex-1 overflow-y-auto p-8">
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
                class="h-11 rounded-lg bg-accent px-5 text-sm font-medium text-inverseText"
                type="button"
                @click="createAndSwitchUser"
              >
                {{ appChromeContent.labels.create }}
              </button>
            </div>

            <div v-else-if="userActionModalKind === 'update-data'" class="space-y-6">
              <section class="space-y-5">
                <label class="col-span-2 block">
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
                  <div class="mt-2 grid grid-cols-2 gap-3 rounded-lg border border-borderBase bg-surface p-3">
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
              </section>

              <section class="grid grid-cols-2 gap-5">
                <div class="rounded-lg border border-borderBase bg-surface p-4">
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
                  <div class="mt-3 grid grid-cols-2 gap-2">
                    <button
                      class="rounded-lg border border-borderBase px-3 py-2 text-left text-sm"
                      type="button"
                      @click="openAvatarFilePicker"
                    >
                      {{ appChromeContent.labels.upload }}
                    </button>
                    <button
                      class="rounded-lg border border-borderBase px-3 py-2 text-left text-sm text-danger"
                      type="button"
                      @click="deleteActiveUserAvatar"
                    >
                      {{ appChromeContent.labels.delete }}
                    </button>
                  </div>
                </div>

                <div class="rounded-lg border border-borderBase bg-surface p-4">
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
                class="h-11 rounded-lg bg-accent px-5 text-sm font-medium text-inverseText"
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
              <div class="flex gap-3">
                <button
                  class="h-11 rounded-lg bg-accent px-5 text-sm font-medium text-inverseText"
                  type="button"
                  @click="openCreateUserModal"
                >
                  {{ appChromeContent.labels.createUser }}
                </button>
                <button
                  class="h-11 rounded-lg border border-borderBase px-5 text-sm"
                  type="button"
                  @click="openImportFilePicker"
                >
                  {{ appChromeContent.labels.importFromJson }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div
        v-if="diaryDeleteConfirmationEntryId"
        class="desktop-confirmation-overlay-primary fixed inset-0 flex items-center justify-center bg-app/70 p-8 backdrop-blur-md"
        :style="desktopFullScreenOverlayPrimaryStyle"
      >
        <section
          class="desktop-confirmation-modal rounded-lg border border-borderBase bg-panel p-6 text-titleText"
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
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="h-10 rounded-lg border border-borderBase px-4 text-sm"
              type="button"
              @click="closeDeleteDiaryEntryConfirmation"
            >
              {{ homeContent.labels.cancel }}
            </button>
            <button
              class="h-10 rounded-lg bg-danger px-4 text-sm font-medium text-inverseText"
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
        class="desktop-confirmation-overlay-primary fixed inset-0 flex items-center justify-center bg-app/70 p-8 backdrop-blur-md"
        :style="desktopFullScreenOverlayPrimaryStyle"
      >
        <section
          class="desktop-confirmation-modal rounded-lg border border-borderBase bg-panel p-6 text-titleText"
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
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="h-10 rounded-lg border border-borderBase px-4 text-sm"
              type="button"
              @click="closeDraftCloseConfirmation"
            >
              {{ homeContent.labels.continueEditing }}
            </button>
            <button
              class="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-inverseText"
              type="button"
              @click="confirmCloseDraftModal"
            >
              {{ homeContent.labels.closeWithoutSaving }}
            </button>
          </div>
        </section>
      </div>

      <div
        v-if="isUserActionCloseConfirmationOpen"
        class="desktop-confirmation-overlay-primary fixed inset-0 flex items-center justify-center bg-app/70 p-8 backdrop-blur-md"
        :style="desktopFullScreenOverlayPrimaryStyle"
      >
        <section
          class="desktop-confirmation-modal rounded-lg border border-borderBase bg-panel p-6 text-titleText"
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
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="h-10 rounded-lg border border-borderBase px-4 text-sm"
              type="button"
              @click="closeUserActionCloseConfirmation"
            >
              {{ appChromeContent.labels.continueEditing }}
            </button>
            <button
              class="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-inverseText"
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
        class="desktop-confirmation-overlay-secondary fixed inset-0 flex items-center justify-center bg-app/70 p-8 backdrop-blur-md"
        :style="desktopFullScreenOverlaySecondaryStyle"
      >
        <section
          class="desktop-confirmation-modal rounded-lg border border-borderBase bg-panel p-6 text-titleText"
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
          <div class="mt-6 flex justify-end gap-3">
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
