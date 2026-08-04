# AGENTS.md

This project is a local-first personal data management application for Diary, mood, life-log, tag, local user, and avatar data.

The user's private data belongs to the user. The website must not store private business data on a server. The browser is the primary storage location, using IndexedDB through Dexie.js.

Users should not need to edit JSON directly, but all core user-owned data must be exportable and restorable as readable plaintext JSON.

## 1. Language, Architecture, And Technical Choices

### Required Stack

- Vue 3.
- TypeScript.
- Vite.
- Tailwind CSS.
- Dexie.js.

All business code must be TypeScript. Do not add untyped JavaScript for application logic.

### Architecture Style

The frontend follows a hexagonal architecture. Vue is not allowed to directly own persistence logic.

Data flow:

```text
User operation
  -> Vue page
  -> Service Facade
  -> Application Use Cases
  -> Persistence Port
  -> IndexedDB Adapter
  -> Dexie
  -> IndexedDB
```

Layer responsibilities:

```text
Vue Desktop/Mobile UI
  -> src/services/
     Service facade used by components.
     Composes default application use cases and adapters.

  -> src/application/
     Core use cases and main business operations.
     Depends on ports, not Dexie, IndexedDB, DOM APIs, or Vue components.
     Split responsibilities into dedicated files:
       - CRUD use cases
       - file import/export use cases
       - file version migrations
       - pure image/pixel algorithms

  -> src/ports/
     TypeScript interfaces for delegated capabilities.
     Repository interfaces, file gateways, image gateways, timers,
     future sync providers, ID generation, and current time belong here.

  -> src/adapters/
     Concrete implementations of ports.
     Adapters may use Dexie, IndexedDB, File, Blob, canvas, browser download APIs,
     or other external/browser APIs.

  -> src/database/
     Dexie database definition, schema, and database migrations only.
```

Rules:

- Vue components call service facades only.
- Application use cases receive dependencies through typed ports/delegates.
- Implementations must be separated from business logic.
- TypeScript ports are repository/gateway/timer interfaces, similar to Java interfaces.
- Adapters implement ports. Services and application use cases call the port interface, not the concrete adapter.
- The concrete adapter binding belongs in a composition root such as `src/services/serviceDependencies.ts`.
- Business logic calls delegated implementations through ports or service facades; implementation details must not be coupled into business logic.
- Adapters translate delegated calls into external API operations.
- Do not put business decisions into adapters.
- Do not import `db` from Vue components, pages, stores, or application use cases.
- Do not import adapters from application use cases, ports, or models.
- Do not import services from application use cases, ports, models, or adapters.
- ID generation and time access must go through `IdAndClockPort`, not direct `crypto`, `Date.now`, or `new Date()` inside core use cases.
- `src/services/personalDataService.ts` is the current public persistence facade. New persistence reads/writes must go through it or through a new facade with the same port/use-case/adapter pattern.

### Local-First Storage

Business data must not be stored in:

- Cookies.
- Server-side persistence.
- `localStorage`.

Cookies are allowed only for non-business consent state that records the user's permission to use cookies and IndexedDB. Cookies must not contain Diary, user, avatar, tag, mood, or other private business data.

The app must ask for cookie and IndexedDB permission before rendering business UI or touching IndexedDB. If the user allows it, store the consent tag in a cookie and do not ask again. If the user does not allow it, close the page and do not store a rejection tag.

`localStorage` is only allowed for UI settings, non-critical preferences, and temporary configuration.

Allowed example:

```json
{
  "theme": "dark"
}
```

Forbidden example:

```json
{
  "diaryEntries": []
}
```

IndexedDB is the runtime local persistence layer. JSON is only an import/export protocol for backup, transfer, and rebuilding IndexedDB state. Do not describe JSON as the primary storage layer.

### Language And UI Preferences

The default UI language is English.

Rules:

- UI language selection is a non-business preference and may be stored in `localStorage`.
- Language configuration belongs in `src/constants/metadataConstants.ts`.
- Each supported language must have one typed configuration object that maps the internal ID, display label, HTML `lang` value, and `Intl` locale.
- Vue templates must consume prepared language options and labels; do not hard-code language display mappings in templates.
- Future translation content should be loaded through presentation/content TypeScript modules, not embedded as literal strings in Vue templates.

### Fixed Canvas UI Architecture

This is not a responsive web app. It uses Fixed Canvas Design.

Desktop and Mobile must be separate app structures:

- `src/app/DesktopApp.vue`
- `src/app/MobileApp.vue`
- Desktop-specific app pages and page drivers under `src/app/pages/desktop/`
- Mobile-specific app pages and page drivers under `src/app/pages/mobile/`
- Desktop-specific app components under `src/app/components/desktop/`
- Mobile-specific app components under `src/app/components/mobile/`
- Desktop-specific styles under `src/app/styles/desktop/`
- Mobile-specific styles under `src/app/styles/mobile/`

Desktop must not be transformed into Mobile through CSS.

Required:

- Select Desktop or Mobile entry based on device type.
- Desktop and Mobile must be different entry components.
- Desktop entry minimum width thresholds belong in visual constants.
- The app shell must fill the browser viewport exactly: `100dvw x 100dvh`.
- Fixed-canvas scaling and proportional calculations are allowed when they preserve the active Desktop or Mobile structure.
- Screen width may be used only to select Desktop versus Mobile, or to calculate fixed-canvas dimensions, scale, spacing, and bounded panel sizes inside the active app.
- Desktop top navigation occupies 10% of viewport height.
- Desktop content occupies the remaining 90%.
- Desktop internal panels may scroll inside their own bounded areas.
- Mobile top navigation uses fixed pixel/layout calculations and floats at the top.
- Mobile content may scroll as a page beneath the fixed top navigation.

Forbidden:

- CSS media queries for layout adaptation.
- Tailwind breakpoint modifiers: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.
- Responsive grids such as `grid-cols-4 md:grid-cols-2 sm:grid-cols-1`.
- Layouts that reflow, collapse, or reorder based on screen width.
- Changing item counts, column counts, order, or page structure because the screen became narrower.

Desktop layout can use proportional relationships to the app shell. It must not reflow into mobile layout while the Desktop entry is active.
Scaling is allowed; responsive web-layout behavior is not.

## 2. Project Structure

Primary structure:

```text
src/
  main.ts
  app/
    DesktopApp.vue
    MobileApp.vue
    components/
      AppDropdown.vue
      AvatarRenderer.vue
      RangeBase.vue
      DateRangeBase.vue
      desktop/
      mobile/
    styles/
      components.css
      desktop/
      mobile/
    pages/
      desktop/
        DesktopHomePage.ts
        DesktopHomePage.vue
      mobile/
        MobileHomePage.ts
        MobileHomePage.vue
  presentation/
    helpContent.ts
    personalDataHomeViewModels.ts
    usePersonalDataHomePage.ts
  application/
    avatarProgressiveRenderPlan.ts
    avatarSubjectMaskAnalysis.ts
    personalDataCrudUseCases.ts
    personalDataFileMigrations.ts
    personalDataFileUseCases.ts
    personalDataUseCases.ts
  ports/
    avatarImagePort.ts
    frameSchedulerPort.ts
    idAndClockPort.ts
    jsonFilePort.ts
    personalDataRepository.ts
  adapters/
    browserAvatarImageAdapter.ts
    browserFrameSchedulerAdapter.ts
    browserIdAndClockAdapter.ts
    browserJsonFileAdapter.ts
    indexedDbPersonalDataPersistenceAdapter.ts
  database/
    db.ts
    schema.ts
  models/
    avatar.ts
    personalData.ts
    personalDataVersions.ts
    diary.ts
  constants/
    assetConstants.ts
    businessConstants.ts
    algorithmConstants.ts
    metadataConstants.ts
    storageConstants.ts
    visualConstants.ts
    themeConstants.ts
  services/
    avatarFramePlaybackService.ts
    avatarRenderService.ts
    exportService.ts
    importService.ts
    personalDataService.ts
    serviceDependencies.ts
  utils/
    device.ts
    useFixedCanvasScale.ts
```

Rules:

- Do not keep empty directories with `.gitkeep`.
- Desktop/Mobile are app presentation variants nested under the relevant app object type: `src/app/components/`, `src/app/pages/`, and `src/app/styles/`.
- Do not create top-level `src/app/desktop/` or `src/app/mobile/` directories.
- Create `src/app/components/desktop/` or `src/app/components/mobile/` only when there are actual Desktop-only or Mobile-only components to store.
- Create a store directory only when the project introduces a real store layer.
- Shared presentation behavior belongs under `src/presentation/`.
- Reusable display calculations, empty-state decisions, fallback labels, help copy, and derived view models belong in standalone TypeScript files under `src/presentation/`.
- All constants must be extracted into constants-related files. Do not introduce new magic numbers or special strings inline.
- Algorithm parameters, pixel-buffer layout values, color conversion constants, mask analysis thresholds, progressive render levels, subject sampling thresholds, frame timing values, and algorithm decode limits belong in `src/constants/algorithmConstants.ts`.
- Visual dimensions, typography sizes, spacing values, fixed-canvas thresholds, scale ratios, and measurement values belong in `src/constants/visualConstants.ts`.
- Static public asset paths belong in `src/constants/assetConstants.ts`.
- Database names, consent-cookie keys, IndexedDB table names, and storage schema/index definitions belong in `src/constants/storageConstants.ts`.
- User-facing copy belongs in presentation files or constants selected for that feature; do not hide business copy in Vue templates when it is reused or derived.
- App version, app version label, data schema, data version, data version label, export schema, and export version belong in `src/constants/metadataConstants.ts`.
- IndexedDB database version, exported data version, and current personal data version must strictly follow the same `PERSONAL_DATA_VERSION`.
- Storage constants must show the table/index structure for each supported database/data version with named table fields, not positional arrays.
- Help content reads version and metadata labels from metadata constants; Help content does not define version values itself.
- Layering and z-index values belong in `src/constants/visualConstants.ts`.
- Relative popups such as dropdown menus use the relative popup z-index constant.
- Full-screen overlays, blocking consent prompts, and modal stacks use the full-screen overlay z-index constants.
- Vue templates must not use Tailwind `z-*` utilities for app-owned layers; bind z-index through page/component TypeScript styles sourced from visual constants.

### Vue Template Family Structure

When a visual feature has different Desktop and Mobile presentations, build it as a template family:

- A shared base template/view-model/composable owns shared display state and interaction contracts.
- A Desktop template owns Desktop-specific presentation.
- A Mobile template owns Mobile-specific presentation.
- A unified template dispatches to Desktop or Mobile based on the current device mode.

Rules:

- Callers should use the unified template, not directly choose Desktop or Mobile internals.
- Shared updates must flow through the base/shared layer so Desktop and Mobile stay synchronized.
- Desktop and Mobile Vue files exist to express different visual presentation, not to duplicate business behavior.

## 3. Business Logic

### Project Intent

The app provides:

- A polished visual UI for managing personal data.
- Tools to organize Diary, mood, life-log, and tag data.
- Conversion from user operations into typed structured data.
- Full plaintext JSON export and restore.
- User-owned avatar image assets, subject masks, mask metadata, and thumbnails.

### Current-State Model

The app maintains current state only.

Rules:

- It is not a log system.
- It does not provide version history.
- It is not Git-style history management.
- Import conflict resolution is current-state reconciliation by stable IDs and `updatedAt`, not event replay.
- Because this is a pure frontend current-state app, overwritten or updated old states cannot be recovered unless the user made a JSON backup before the overwrite/update.
- Help and user-facing copy must describe import and merge behavior using current-state language. Do not imply audit logs, version history, or Git-style recovery.

### Root Data Model

The project must use one explicit root data type for user-owned business data.

Current root type:

- `PersonalDataV1` in `src/models/personalData.ts`.

Nested business entities must be modeled under that root type namespace:

- `PersonalDataV1.DiaryEntry`
- `PersonalDataV1.Tag`
- `PersonalDataV1.MoodType`
- `PersonalDataV1.AvatarAsset`
- `PersonalDataV1.UserProfile`

Requirements:

- IndexedDB persistence must be able to reconstruct a complete `PersonalDataV1`.
- JSON export must serialize the complete `PersonalDataFileV1`.
- JSON import must accept the same complete `PersonalDataFileV1` shape after validation and extraction.
- New business data collections must be added under `PersonalDataV1` first, then wired into migrations, persistence ports, adapters, and import/export.

### Data Versioning, Export, And Import

All exported data must include a schema name and version.

Current export envelope:

```ts
{
  schema: "diary-app",
  version: 1,
  exportTime: string,
  avatarAssets: PersonalDataV1.AvatarAsset[],
  data: {
    entries: PersonalDataV1.DiaryEntry[],
    tags: PersonalDataV1.Tag[],
    users: PersonalDataV1.UserProfile[],
    activeUserId?: string
  }
}
```

The exported JSON file must have the same structural shape accepted by import:

```ts
PersonalDataFileV1 = {
  schema: "diary-app",
  version: 1,
  exportTime: string,
  avatarAssets: PersonalDataV1.AvatarAsset[],
  data: {
    entries: PersonalDataV1.DiaryEntry[],
    tags: PersonalDataV1.Tag[],
    users: PersonalDataV1.UserProfile[],
    activeUserId?: string
  }
}
```

Rules:

- Never mutate historical exported formats in place.
- Use `version` to distinguish formats.
- App V0.0.1 launches with Data V1 as the first supported production data format.
- Current IndexedDB database version, JSON export version, and personal data version are all Data V1 and must remain equal.
- Full Data V1 exports are the canonical import shape.
- Imports must first try to identify `schema` and `version`.
- If the version is unknown or missing, import must still attempt to extract recognizable Data V1 collections from the file.
- Import extraction must normalize missing required fields into safe current-shape values: missing collections become empty arrays, missing optional fields stay absent, missing string fields required by the current model become empty strings, and missing IDs/timestamps are supplied through the ID/clock port.
- Import is a three-step business flow: extract a batch of Data V1 data from the unknown file, merge that batch with current persistence state, then replace current persistence state with the merged result.
- Empty-current versus non-empty-current behavior belongs in the merge step. The adapter should only load current state and replace state; it must not own reconciliation decisions.
- Every import path must return `PersonalDataFileV1` after extraction.
- CRUD and UI-facing functions must return Data V1 application types.
- UI empty/fallback display must be handled in presentation view-model code, not by weakening the core data type.
- Migration code exists for future production upgrades when a new production data version is introduced.
- Future production data upgrades must add a new version type and explicit migration path from the previous production data version.
- Do not add named legacy support for development-era temporary formats; unknown versions use best-effort Data V1 extraction instead.

### Import Reconciliation

Rules:

- When an imported Diary entry has the same UUID as an existing entry, keep exactly one current entry record: the record with the latest `updatedAt` wins.
- Deleted Diary entries are still records.
- Deleting a Diary entry removes user-facing content and marks the entry as deleted; it does not create a historical log entry and does not remove the UUID from reconciliation.
- If duplicate UUID Diary entries include one deleted record and one non-deleted record, the latest `updatedAt` record is authoritative.
- If the deleted record is newer, the current state remains deleted.
- Deletion itself is a content behavior/current-state operation. It participates in import reconciliation like any other update.
- When imported users have duplicate UUIDs, treat them as the same local user and keep the user profile with the latest `updatedAt`.
- When imported avatar assets have duplicate UUIDs, keep the avatar asset with the latest `updatedAt`.
- During import, if duplicate user profiles point to avatar assets, the resolved user profile follows the latest `updatedAt` profile, while duplicate avatar asset content is resolved separately by latest avatar asset `updatedAt`.

### Local User Profiles

The app supports multiple local users without server authentication or security isolation.

Rules:

- User profiles are local-first user data.
- User IDs are base64 UUID strings.
- The active user is persisted locally and exported/imported with the data file.
- A fresh app with no users must not create a default user automatically.
- Empty user state must show explicit choices such as creating a local user or importing JSON data.
- A user without an avatar displays a transparent avatar interior inside a circular bordered frame.
- Clicking the avatar frame may open an avatar upload flow.
- Avatar upload stores the original image as an avatar asset, then links the active user to that asset.
- Import flows should offer to remove empty users.
- An empty user means no avatar and no Diary entries assigned to that user.
- User management should support deleting users, merging users, importing data, and clearing all data.
- Clearing all data requires two confirmations.

### Explicit User Merge

Rules:

- User merging is a current-state operation, not a historical log operation.
- User merging moves selected source users' entries to the target user, then sorts Diary entries by date.
- When explicitly merging source user B into target user A, A is the target identity.
- B's personal profile fields must not overwrite A's personal profile fields.
- Explicit user merge and import user reconciliation are different operations: explicit merge preserves target user A's profile, while import of duplicate user UUIDs keeps the latest `updatedAt` user profile.
- During explicit user merge, entries from B are reassigned to A and updated as current entries.
- During explicit user merge, avatar selection should prefer the avatar asset uploaded or updated latest when deciding between A and B avatar assets.
- Help and user-facing copy must clearly state the explicit merge avatar rule: when merging B into A, A's non-avatar profile fields remain authoritative, but the avatar should use the avatar asset with the latest `updatedAt` between the users being merged.

### Avatar Assets

Avatar images, generated subject masks, mask analysis metadata, and thumbnails are user data.

IndexedDB can store `Blob` values, but this project stores avatar assets as base64/data URL strings because:

- JSON export/import must be plaintext and self-contained.
- The same value can be written to IndexedDB and exported to JSON without binary side channels.
- Restore does not require a separate file bundle.

Current avatar asset type:

- `AvatarRenderAsset` in `src/models/avatar.ts`.
- Re-exported into the root data model as `PersonalDataV1.AvatarAsset`.

Storage rules:

- Original avatar image is stored as `originalImageDataUrl`.
- Applying an avatar crop stores the processed crop result as `originalImageDataUrl`.
- Stored original avatar images must be at least 128x128 and must not exceed 4096x4096.
- If the applied avatar crop is smaller than 128px, upscale it before storage with an even integer multiplier computed as `((63 // cropSize) + 1) * 2`.
- Small avatar crop upscaling must use nearest-neighbor pixel-art scaling, not smoothing, so a very small upload becomes a crisp pixel-style avatar instead of a blurry avatar.
- Avatar image storage sizing constants belong in TypeScript constants, not inline literals.
- Small avatar UI must not use progressive rendering.
- Small avatar UI should render a direct image from a 256x256 thumbnail.
- Small avatar thumbnail size is 256x256 and must be defined as a TypeScript constant.
- Avatar assets may store `thumbnailImageDataUrl` for the 256x256 small-avatar image.
- Large avatar UI may use progressive canvas rendering as an overlay, but the stored original cropped avatar image must be loaded through the final `<img>` display path from the beginning.
- The final large avatar frame must reveal the already-loaded original `<img>` and let the browser scale that full-resolution source down into the avatar frame.
- Large avatar UI must not use a low-resolution progressive frame, thumbnail, or display-sized intermediate image as the final avatar image.
- Large avatar UI must not switch image sources, create a new final image loader, or clear the current frame while waiting for the final source image.
- Large avatar UI must not show the clear original image before progressive rendering starts. The original `<img>` may preload, but it must stay hidden until the final reveal frame.
- Large avatar rendering must not inspect or depend on the visible avatar frame size, CSS display size, viewport size, or device pixel ratio to choose render resolution.
- Avatar asset loading and avatar rendering must not block unrelated page data from rendering. User/profile data should render as soon as it is available, while avatar image work continues independently.
- Subject mask image is stored as `maskImageDataUrl` when a mask exists.
- Deleting a mask removes `maskImageDataUrl`; do not replace deletion with an all-black or empty mask data URL.
- A mask is generated again only when the user updates the avatar image.
- Mask analysis metadata is stored as `maskMetadata`.
- Avatar assets are persisted in the `avatarAssets` IndexedDB table.
- Avatar assets are exported at the JSON root as `avatarAssets`, parallel to `schema`, `version`, `exportTime`, and `data`.
- Decoding a data URL into pixels and encoding a mask into PNG/data URL must be adapter-level work. Core algorithms receive typed pixel buffers only.

### Avatar Mask And Progressive Rendering Algorithms

The avatar pipeline is split into two independent pure TypeScript algorithms.

Algorithm one:

- Function: `analyzeSubjectMask` in `src/application/avatarSubjectMaskAnalysis.ts`.
- Input: decoded `AvatarImageData`.
- Output: `SubjectMaskAnalysisResult`.
- Responsibility: produce a binary subject mask and `SubjectMaskMetadata`.
- It must not perform semantic recognition such as face recognition, animal recognition, logo recognition, or neural-network segmentation.
- It must fail conservatively: if geometry checks are not accepted, return an all-black mask with status `no-subject`.
- It must not generate render grids or animation plans.
- Its thresholds, mask pixel values, geometry scoring parameters, and metadata version belong in `src/constants/algorithmConstants.ts`.

Algorithm two:

- Function: `buildProgressiveRenderPlan` in `src/application/avatarProgressiveRenderPlan.ts`.
- Input: decoded `AvatarImageData`, stored `SubjectMask`, and `ProgressiveRenderConfig`.
- Output: `RenderPlan`.
- It must not call algorithm one.
- It must not re-analyze the subject or modify the mask.
- If the mask is all black, the plan naturally becomes background-only progressive rendering.
- Its levels, color quantization, subject sampling start level, sampling tie-break thresholds, frame timing, and render decode limits belong in `src/constants/algorithmConstants.ts`.

Progressive rendering rules:

- Progressive rendering must converge to the stored source image resolution, not the visible CSS display size.
- Every avatar render frame must be rendered into a canvas with the stored source image width and height.
- Avatar render streams must include a final frame that reveals the already-loaded full-source-resolution image display.
- The browser may scale the final full-source-resolution image down into the avatar frame.
- Progressive avatar rendering must be streamed frame by frame. Do not precompute the complete frame sequence before playback.
- The first progressive avatar frame is a single full-image average pseudo-pixel frame. It must not wait for mask decoding, subject analysis, subject sampling, or edge blur work.
- Progressive avatar playback must not consume the first frame before the canvas is mounted. If a frame cannot be drawn, retry that same frame instead of advancing to the next level.
- The progressive avatar canvas may mount before the first frame, but it must remain visually hidden until the first frame is successfully drawn.
- Mask decoding for progressive avatar playback should start after the first average frame is available so early average frames and mask preparation can overlap.
- Frame playback target interval starts at the configured initial delay, increases by the configured increment after each frame, and caps at the configured maximum delay. Actual sleep time must subtract the current frame's calculation and drawing time from that target interval, using zero only when the frame work already consumed the full target interval.
- Progressive avatar playback is intentionally a frosted-glass mosaic that gradually becomes clear. It should avoid hard mosaic borders by using edge smoothing and fine-frame blur before the final clear image reveal.
- Progressive avatar playback should render one frame at a time. If a browser is slow, frame calculation may make the animation take longer, but the app must avoid front-loading all frame work in a way that blocks unrelated UI.
- Stored avatar images are capped at 4096x4096 and configured progressive render grids are capped at 512x512. The 1x1 average-color frame must not use Gaussian blur, and full-pixel frames must not use Gaussian blur. At the 4096px maximum, only the nine pseudo-pixel mosaic grid levels from 2x2 through 512x512 can require Gaussian smoothing.
- This bounded Gaussian workload is intentional. It should keep the browser responsive; slower browsers may stretch frame timing, but the rendering design must not collapse into a long blocking precomputation step.
- Progressive render levels are bounded by the stored source image width and height, not by viewport size, CSS display size, device pixel ratio, or fixed decode caps such as 128 or 4096.
- Pseudo-pixel edge smoothing is decided once per frame from source dimensions and grid size. If multiplying the grid size by the masked-edge minimum cell size equals or exceeds the source image minimum side length, the whole frame must skip per-cell edge smoothing.
- Pseudo-pixel edge smoothing must use cached mask tiles keyed by cell width and height. Do not recalculate inner-circle and outer-square geometry for every painted cell.
- Pseudo-pixel edge smoothing composites multiple increasing-radius blurred copies of the complete crisp mosaic frame through cached band masks. Every blur layer must use the same crisp mosaic source, not a previously composited blur result.
- Pseudo-pixel edge smoothing maximum Gaussian radius must scale from the pseudo-pixel cell half diagonal. It must not use a fixed small pixel radius for all grid sizes.
- Fine pseudo-pixel frames whose cells are larger than 1px but not larger than the masked-edge minimum cell size should use a light full-frame Gaussian blur instead of per-cell mask smoothing.
- Before `subjectSamplingStartLevel`, every cell uses full-cell linear RGB average.
- At or after `subjectSamplingStartLevel`, background cells use background-only linear RGB average.
- Subject cells use quantized modal center sampling from original subject pixels.
- Quantization is only for finding the mode. Final color must be the original RGB of the selected source pixel.
- Do not convert a bucket back to RGB with `bucket * quantum + midpoint`.
- For 16-wide quantization, bucket key must be computed as:

```ts
key = rBucket + gBucket * 16 + bBucket * 256
```

- More generally:

```ts
key = rBucket + gBucket * bucketCount + bBucket * bucketCount ** 2
```

- If the primary 16-wide quantization has no repeated bucket and the cell has multiple subject pixels, retry with 64-wide quantization, producing 4 buckets per channel.
- Tie-breaking must be deterministic: nearest pixel to cell center first, then stable bucket key, then stable pixel coordinate.

## 4. Syntax, Template, And Style Rules

This section defines how TypeScript, Vue, and CSS must be written.

### TypeScript Rules

- Define explicit `interface` or `type` declarations for all core data models.
- Avoid `any`.
- Prefer `unknown` when the shape is intentionally open-ended.
- Service and database layers must expose typed APIs.
- All constants must be extracted to constants files. Do not leave magic numbers, magic strings, special dimensions, special labels, schema names, version values, or algorithm parameters inline.
- Algorithm constants belong in `src/constants/algorithmConstants.ts`, even when the value is passed into an algorithm by a caller instead of being embedded inside the algorithm file.
- Metadata constants such as app version, data schema, data version, export schema, and display labels belong in `src/constants/metadataConstants.ts`.
- Business rules belong in application use cases and model/presentation logic as appropriate, not in Vue templates and not in adapters.
- Pure algorithms must receive typed data structures and return typed data structures.
- Browser/API work such as canvas decoding, file reading, Blob/File handling, IndexedDB, download APIs, and Dexie belongs in adapters or services, not in core algorithms.
- New business data collections must start in the root model namespace, then be wired into migrations, persistence ports, adapters, and import/export.
- Avatar rendering is service-driven. A renderer service returns a typed frame stream; the component requests, receives, and draws only the current frame.
- Avatar frame timing is a separate service. It schedules each next frame through a timer port and must not know how frame content is generated.
- Progressive avatar rendering is only one implementation behind the avatar render service. Vue components must not depend on progressive-specific render-plan details.
- Diary data rendering follows a controller/view-model boundary. Presentation controllers map `PersonalDataV1.DiaryEntry` data into frontend view models before Vue templates render them.

### Vue Template Rules

- Vue components must use the Composition API.
- `.vue` files should be display shells.
- Vue templates must not contain business logic.
- `<script setup>` inside `.vue` files must contain only visual rendering state, DOM measurement, pointer/keyboard interaction, emitted events, and binding to page/component TypeScript.
- Vue template TypeScript is for interaction logic, not business logic.
- `.vue` files must not contain persistence calls, import/export orchestration, data migration, merge/reconciliation rules, or duplicated page behavior.
- `.vue` files must not import `src/services/`, `src/application/`, `src/adapters/`, `src/database/`, or `src/ports/` directly.
- If a `.vue` component needs behavior beyond simple binding, move that behavior into a same-directory TypeScript composable for visual/component behavior, or into `src/presentation/`, `src/services/`, and use cases for business behavior.
- A `.vue` page must import its page model from its own same-directory TypeScript file.
- Example: `DesktopHomePage.vue` imports `useDesktopHomePage` from `DesktopHomePage.ts`.
- Example: `MobileHomePage.vue` imports `useMobileHomePage` from `MobileHomePage.ts`.
- Page-specific TypeScript files may define display configuration and presentation copy for that page.
- If Desktop and Mobile page TypeScript files need the same behavior, extract that behavior to a shared presentation module and import it from both page TypeScript files.
- Shared presentation modules that serve Desktop and Mobile pages may call service facades as part of the page-to-service boundary.
- Those shared presentation modules must not import adapters, database modules, ports, or application use cases directly.
- Business persistence decisions still belong in service facades and application use cases, not in presentation modules.
- Vue templates should receive prepared view-model fields where practical.
- Avoid putting transformations such as slicing lists, fallback title selection, or business condition logic directly in templates.
- Vue templates must not import service facades, application use cases, ports, adapters, database modules, or models directly unless a narrow type-only display need makes it unavoidable.
- Persistence-related behavior must flow through the page TypeScript file into shared presentation functions, then into `src/services/personalDataService.ts`.

### Vue Template Family Rules

Template family ownership is defined in Project Structure. In Vue files, enforce it with these implementation rules:

- Create or update the shared base template/view-model/composable before changing Desktop and Mobile variants.
- Desktop and Mobile variants may diverge visually, but their shared state and interaction contract must remain in the base/shared layer.
- Other templates should directly use the unified template.
- Do not make callers manually choose Desktop or Mobile implementations when a unified template exists.

### Tailwind And Theme Color Rules

Tailwind is used so templates reference semantic color names instead of concrete colors.

Rules:

- Do not hard-code product colors in Vue templates.
- Do not use arbitrary Tailwind color values such as `bg-[#...]`, `text-[#...]`, or `border-[#...]`.
- Semantic color names are defined in `tailwind.config.ts`.
- Concrete color values are CSS variables in `src/style.css`.
- Theme switching changes CSS variable values only.
- Components keep using the same semantic Tailwind class names across themes.
- If a new UI color role is needed, add a semantic name first, then use that name in templates.
- Do not use shadows or gradients anywhere in the UI.
- Do not add Tailwind shadow utilities, `drop-shadow` utilities, `bg-gradient-*`, `from-*`, `via-*`, or `to-*` classes.
- Do not use Tailwind `z-*` utilities for app-owned layers; layer values must be named visual constants and applied through TypeScript style bindings.
- Do not add CSS `box-shadow`, `filter: drop-shadow(...)`, `linear-gradient(...)`, `radial-gradient(...)`, or `conic-gradient(...)`.

Examples:

```text
bg-app
bg-panel
text-titleText
text-bodyText
border-borderBase
```

### CSS Ownership Rules

CSS validation has two required checks:

- PurgeCSS must reject no selectors in authored CSS files.
- Business Vue pages must not contain scoped CSS.

Rules:

- Run `npm run purgecss:check` after moving, adding, or deleting CSS selectors.
- Business-related Vue pages/components must not contain custom CSS classes defined inline in the component file.
- Business-related Vue pages/components must not contain `<style scoped>`.
- Business-related page-specific CSS belongs in `src/app/styles/desktop/` or `src/app/styles/mobile/`.
- Shared functional component CSS belongs under `src/app/styles/`.
- Component-owned functional CSS belongs under `src/app/styles/components/`, and the CSS file name must match the Vue component name.
- Functional visual components must not use scoped CSS.
- A non-business visual component may have a same-name CSS file to encapsulate its classes.
- Shared behavior between functional components belongs in a shared base CSS file under `src/app/styles/`, then component CSS may rely on that shared behavior.
- Desktop-only styles belong in `src/app/styles/desktop/`.
- Mobile-only styles belong in `src/app/styles/mobile/`.
- Do not add inline `<style>` blocks to functional components; split the CSS into the component style location above.

### Development Priorities

1. Data safety and user ownership.
2. Long-term data compatibility.
3. Independent Desktop/Mobile design.
4. Stable fixed-canvas UI.
5. Type safety.

When adding features, build through the typed service layer first, then wire UI behavior to it.

### Contribution Workflow

- Before writing commit messages or pull requests, read `CONTRIBUTING.md`.
- Commit messages and pull request descriptions must follow `CONTRIBUTING.md`.
- Pull request checks must include the relevant TypeScript, Vue, CSS, storage, architecture, and presentation rules from this `AGENTS.md`.
- If a change updates architecture, persistence boundaries, fixed-canvas behavior, data shape, language handling, or contribution rules, update this `AGENTS.md` in the same change.
