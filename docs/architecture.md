# Architecture

The app is a static, read-only field guide: a Vue 3 single-page app built with Vite, TypeScript and SCSS. Everything it shows is code in this repository. Nothing is saved in the browser.

## Where things live

Dependencies point one way: components → composables → content, i18n and domain.

| Layer | Folder | Holds |
| --- | --- | --- |
| Domain | `src/domain` | The roster, the rating vocabulary, scoring and filtering. Pure TypeScript: no Vue, no DOM, and no text for the reader. It deals in codes and keys. |
| Content | `src/content` | `entries.json`: the logged abnormalities with their ratings. Author mode writes it. |
| i18n | `src/i18n` | One locale per language under `locales/`. Every word the reader sees is there: interface labels and abnormality names in `en.ts`, field notes in `en.notes.json`. |
| Composables | `src/composables` | Reactive state for the page. |
| Components | `src/components` | Markup and scoped styles. |
| Author mode | `src/author`, `tools/author-plugin.ts` | The editor and the dev-server endpoints behind it. Not in a build. |
| Styles | `src/styles` | Tokens, mixins, element defaults, shared primitives. |

## Content and text

A logged abnormality has two parts:

- its **entry** in `src/content/entries.json`: the day it was logged, the three ratings, the fan flag, work results and agents lost. Ratings are written as level keys (`'useful'`, `'safeish'`), which `src/domain/types.ts` lists.
- its **note** in the locale's notes file (`src/i18n/locales/en.notes.json`), because a note is prose and gets translated.

Both are JSON so that author mode can write them. `en.ts` imports the notes file as its `notes` section.

The locale has two kinds of text. Interface messages use vue-i18n syntax (`{name}` placeholders, `one | many` plurals) and are read with `$t`. The `abnormalities` and `notes` sections are read exactly as written through `authored()` in `src/i18n/index.ts`, so a note can contain any character.

English is the reference locale and the fallback. To add a language, copy `locales/en.ts` and `locales/en.notes.json`, translate them, and register the locale in `src/i18n/index.ts`.

`src/content/content.test.ts` checks the content: every entry code is in the roster, every rating word and work result is one the catalog knows, every abnormality has a name, notes belong to logged entries, and every key the catalog uses has a label.

## State

Two page-wide singletons, both session-only:

- `useContainmentLog()` joins the roster with its names, the entries and the notes, and holds the spoiler shield. It reads the entries and notes through a `LogSource`: the built-in content for readers, the draft in author mode. The shield is the only thing a reader can change. It starts on at every visit and hides the name, silhouette and risk of abnormalities that have no entry.
- `useLogBrowser()` holds the search text, the filter and the open file, and derives `units`, the list of tiles to draw.

`useMediaQuery()` and `useIsCompact()` make the 1000px breakpoint reactive in script.

## Author mode

Author mode is the dev server with `VITE_AUTHOR=true` (`pnpm author`, or `.env.local`). It has two halves:

- **In the page**, `src/main.ts` imports `src/author` only when `import.meta.env.DEV` and the variable are both set. A build replaces `DEV` with `false`, so the import and everything behind it are dropped from the bundle. `installAuthoring()` points `useContainmentLog()` at the draft and provides the editor components; `App` and `AbnormalityFile` render them through `useAuthorTools()`, which is null for readers.
- **In the dev server**, `tools/author-plugin.ts` adds three endpoints under `/__author`: read the repository's status, write the two content files, and publish (commit those two files, then `git push`). It answers only requests from the page itself.

`useDraft()` holds the working copy. Edits show at once because the page reads the draft, and they are written to disk 400 ms after the last one, in roster order and with empty values left out, so the same edits always produce the same file. The plugin stops Vite from reloading the page when those files change, since the page already shows what it saved.

Publishing is a commit to `main`, so the history of the two files is the history of the guide.

## Components

Containers call composables. Leaves take props.

```
App                                  .hazard, .wrap, .layout
├─ header/AppHeader         container   header.top
│  ├─ ContainmentGauge                  .gauge
│  └─ LogStats                          .stats
├─ controls/RosterControls  container   .controls, .search, .count
│  └─ FilterChips                       .chips, .chip
├─ roster/UnitGrid          container   .grid, .empty, .note
│  └─ UnitTile                          .unit and everything inside it
│     ├─ shared/AbnormalityPortrait     .portrait, .u-portrait, .file-portrait, .game-portrait
│     └─ shared/StarIcon                the fan star svg
├─ file/AbnormalityFile     container   aside.file, .file-bar, .file-body, .file-status
│  ├─ FileHeader                        .file-head, .file-code, .tag, .file-name, .file-decode
│  ├─ (author/EntryEditor)              author mode only: .author
│  ├─ FileNotes                         .file-notes
│  ├─ PerformanceReview                 .review and the section around it
│  │  ├─ RatingAxis                     .axis, .axis-top, .meter, .seg
│  │  ├─ VerdictCard                    .verdict
│  │  └─ FanBadge                       .fan
│  ├─ WorkResults                       .works, .work
│  └─ AgentsLost                        .lost
├─ settings/SettingsPanel   container   details.settings, .box
│  └─ SpoilerShieldToggle               .check
├─ AppFooter                            footer
└─ (author/PublishBar)                  author mode only: form.bar
```

The file is a sticky side panel from 1000px up and a full-screen sheet below. As a sheet it locks the page behind it, takes focus on its name when it opens, closes on Escape, and returns focus to the tile it came from.

## Styles

- `_tokens.scss` holds the palette, fonts and the corner cut as CSS custom properties. They are custom properties, not Sass variables, because components re-point `--c` (risk colour), `--k` (review axis colour) and `--w` (work type colour) per element.
- `_mixins.scss` emits no CSS. A component that needs it starts its style block with `@use '@/styles/mixins' as *;`.
- `_base.scss` holds element defaults. `_primitives.scss` holds the classes used by more than one component: `.linkish`, `.sec`, `.hint`.
- Everything else is `<style scoped lang="scss">` in the component that renders the element. A parent may style a child component's root element (the star svg under `.u-meta` or `.fan`), because Vue gives a child's root the parent's scope.
