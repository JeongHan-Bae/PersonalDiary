<div align="center">
    <img src="https://skillicons.dev/icons?i=ts"
         alt="TS"
         width="96"
         valign="middle">
</div>
<h1 align="center">
  <span style="font-size: x-large;">Personal Diary</span>
</h1>

<div align="center" style="margin-left: 8%; margin-right: 8%; font-size: medium;">

<strong>
Personal Diary is a local-first diary application built with Vue and TypeScript. 
<br>It runs entirely in the browser and stores private data in IndexedDB.
<br><br>
The project follows a hexagonal architecture with Vue as the presentation layer. 
<br>TypeScript handles the models, business logic, services, presentation state, browser implementations, and visual calculations. 
<br>Vue is mainly used as the view layer.
<br><br>
</strong>
</div>
<blockquote>
  <p>
    TypeScript is not <strong>one of</strong> the greatest languages of the 21st century;
    it is <strong>the greatest</strong> language of the 21st century.
  </p>
</blockquote>

<div align="center">
    <img src="https://raw.githubusercontent.com/JeongHan-Bae/PersonalDiary/main/public/assets/Logo.svg"
         alt="Personal Diary logo"
         width="192">
</div>

## Data Ownership And Transparency

Personal Diary has no backend service and does not encrypt diary data. It is a browser GUI for user-owned plaintext
data, not a hosted storage platform or a security boundary.

The diary data itself always belongs to the user. During normal use, the browser is the runtime persistence layer through
IndexedDB. JSON is only the readable export and restore protocol for backup, transfer, and rebuilding IndexedDB state.

The project uses UUIDs directly as local record IDs and does not separate business IDs from storage IDs. This keeps the
data easy to inspect, move, transform, and reuse with other tools, including AI agents that render or process the
exported JSON in different ways.

The goal is convenience: turning diary writing and personal data management from a higher-friction workflow, such as
platform-bound apps or manual Office/HTML files, into a simple browser-based GUI while keeping ownership and control
with the user.

## Project Structure

### `src/app`

Vue views, pages, components, and styles. Desktop and mobile interfaces are separated where their layouts or
interactions differ.

### `src/models`

Core models for diary entries, users, avatars, and data versions.

### `src/presentation`

Presentation state, view models, form definitions, UI content, themes, language behavior, and Vue composables.

### `src/application`

Application use cases and business rules, including CRUD operations, import reconciliation, data migration, and avatar
processing plans.

### `src/services`

Service facades that coordinate application use cases and external dependencies.

### `src/ports`

Interfaces for persistence, file access, image loading, frame scheduling, clocks, and ID generation.

### `src/adapters`

Browser implementations of the ports, including IndexedDB, JSON files, images, animation frames, time, and UUID
generation.

### `src/database`

IndexedDB initialization and schema definitions.

### `src/constants`

Business, storage, algorithm, theme, asset, metadata, and visual constants.

### `src/utils`

Shared browser and visual calculation utilities.

## Data Behavior

Personal Diary stores the current state of local users, diary entries, tags, and avatar assets.

JSON import reconciles duplicate records by UUID and update time. The latest updated record wins.

Deletion is stored as current application state, so older backups do not resurrect records deleted later.

The application is not a version-history or event-log system. Previous states can only be recovered from an exported
JSON backup.

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
./dev/starter.sh
```

The development launcher exposes the application to the local network, allowing it to be opened from other devices on
the same network for mobile testing.

Create a production build with:

```bash
npm run build
```

## Future Plans

* Add multilingual support.
* Add restricted rich-text editing with safety as the primary concern.
* The editor will not support unrestricted Markdown.

## Version

* App: `V0.0.1`
* Data: `V1`

## Contributing

See the [contribution guide](https://github.com/JeongHan-Bae/PersonalDiary?tab=contributing-ov-file#readme).

## License

This project is available under
the [MIT License](https://github.com/JeongHan-Bae/PersonalDiary?tab=MIT-1-ov-file#readme).

## Author

Copyright © 2026 JeongHan-Bae / 배정한

[mastropseudo@gmail.com](mailto:mastropseudo@gmail.com)
