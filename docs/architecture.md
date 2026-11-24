# Architecture

The app is a Vue 3 single-page app built with Vite, TypeScript and SCSS. It was rewritten from a single `index.html`; that file, at git ref `66c1755:dist/index.html`, is called **the legacy app** below and is the reference for how everything looks and behaves.

## Layers

Dependencies point one way: components → composables → services and domain.

| Layer | Folder | May import | Holds |
| --- | --- | --- | --- |
| Domain | `src/domain` | nothing outside the folder | Roster data, rating vocabulary, scoring, filtering, the persisted schema. Pure TypeScript: no Vue, no DOM, no `localStorage`. |
| Services | `src/services` | domain | Browser edges behind small interfaces. Today that is storage. |
| Composables | `src/composables` | domain, services, Vue | Reactive state and the actions that change it. |
| Components | `src/components` | all of the above | Markup, scoped styles, focus handling. |
| Styles | `src/styles` | | Tokens, mixins, element defaults, shared primitives. |

## Seams

### 1. Domain: `src/domain`

`types.ts` is the contract. Everything else in the folder is a pure function or a constant, tested with Vitest.

| File | Exports |
| --- | --- |
| `types.ts` | The catalog types, the persisted types, `UnitView`, `RosterQuery`, `RestoreResult`. |
| `catalog.ts` | `RISKS`, `ORIGIN`, `FORM`, `WORKS`, `AXES`, `VERDICTS`, `ABNORMALITIES`, `byCode(code)`. |
| `portrait.ts` | `WIKI_ORIGIN`, `spriteOffset(cell)`, `portraitUrl(abnormality)`. |
| `verdict.ts` | `verdict(entry)`, which returns `Verdict` or `null`. |
| `decode.ts` | `decode(abnormality)`: the "Original origin, humanoid form" line. |
| `log-state.ts` | `blankState()`, `blankEntry(now)`, `normalize(raw)`: the schema v1 gatekeeper. |
| `roster.ts` | `visibleUnits(state, query)`, `emptyMessage(query)`, `countLabel(n)`, `isRiskFilter(filter)`. |
| `format.ts` | `formatDate(timestamp)`, `lostRemark(lost)`. |

### 2. Persistence: `src/services/storage.ts`

`LogStorage` has `load()` and `save(state)`, and reports whether the browser accepted the call. The one implementation, `createLocalLogStorage()`, wraps `localStorage` under `STORAGE_KEY` (`containment-log-v1`). Nothing else touches `localStorage`.

The persisted shape is frozen. Field names, value ranges and key order match the legacy app, so the stored text and the backup text stay byte-identical between the two apps for the same history of actions.

### 3. State: `src/composables`

Two page-wide singletons. Their interfaces are in the files.

- `useContainmentLog()` is the only writer of persisted state. Components read `state` (read-only) and call actions. Every action persists before it returns.
- `useLogBrowser()` holds session state: search text, filter, open file, the removal confirmation, the `fresh` flag. It derives `units`, the list of tiles to draw.
- `useMediaQuery()` and `useIsCompact()` make the 1000px breakpoint reactive in script.

Each has a factory, `createContainmentLog(storage)` and `createLogBrowser(log)`, which the tests use with an in-memory storage. The `use…` functions return the page's one instance.

The log store knows nothing about the browser state. A component that needs both, such as restoring a backup and then closing the open file, calls both.

### 4. Components: `src/components`

Containers call composables. Leaves take props and emit events, and never import a composable.

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
├─ file/AbnormalityFile     container   aside.file, .file-bar, .file-body, .file-empty
│  ├─ FileHeader                        .file-head, .file-code, .tag, .file-name, .file-decode
│  ├─ FileUnlogged                      the "Log encounter" block
│  ├─ FileStatus                        .file-status
│  ├─ FileNotes                         .file-notes
│  ├─ PerformanceReview                 .review and the section around it
│  │  ├─ RatingAxis                     .axis, .axis-top, .meter, .seg
│  │  ├─ VerdictCard                    .verdict
│  │  └─ FanButton                      .fan
│  ├─ WorkResults                       .works, .work
│  └─ AgentsLost                        .lost, .step
├─ settings/SettingsPanel               details.settings, .box
│  ├─ SpoilerShieldToggle               .check
│  ├─ BackupTools           container   the backup textarea, copy and restore
│  └─ EraseLog                          the erase confirmation
└─ AppFooter                            footer
```

### 5. Styles: `src/styles` and scoped blocks

- `_tokens.scss` holds the palette, fonts and the corner cut as CSS custom properties. They are custom properties, not Sass variables, because components re-point `--c`, `--k` and `--w` per element at runtime.
- `_mixins.scss` emits no CSS. Each component that needs it starts its style block with `@use '@/styles/mixins' as *;`.
- `_base.scss` holds element defaults. `_primitives.scss` holds the classes used by more than one component: `.btn`, `.linkish`, `.sec`, `.hint`, `.row`, `.msg`.
- Everything else is `<style scoped lang="scss">` in the component that owns the markup. A rule lives in the component that renders the element it targets.
- A rule that spans two components goes with the element its last selector part matches: `.settings textarea` lives in BackupTools, `.file-head.has-portrait` in FileHeader. A parent may style a child component's root element (the star svg under `.u-meta` or `.fan`), because Vue gives a child's root the parent's scope.
- Rules the tree above does not name: `.warn` belongs to AppHeader; `.m.k-f` and the `flash` keyframes to UnitTile; the `wipe` keyframes to FileHeader; the `.file` scrollbar to AbnormalityFile, through the `containment-scrollbar` mixin. Each animated component carries its own `@include reduced-motion`.
- The legacy stylesheet has one desktop media block. Here each component carries its own part of it through `@include desktop`.

## Parity contract

The rewrite changes structure, not appearance or behaviour.

**Markup.** The rendered DOM matches the legacy DOM: same elements, same nesting and order, same class names, same text, same ARIA and form attributes, same inline custom properties (`--c`, `--k`, `--w`, `--sprite-x`, `--sprite-y`). Allowed differences:

- the `#app` wrapper, Vue scope attributes and Vue comment nodes;
- `id` attributes and the legacy event hooks (`data-act`, `data-k`, `data-n`, `data-d`, `data-w`, `data-name`, `data-set`, `data-filter`, `data-logged`) may be dropped;
- an element the legacy app hides with the `hidden` attribute may be left out of the DOM instead;
- a legacy inline `style="margin-top:…"` or `style="color:…"` may become a scoped class with the same declaration.

Keep `data-code` on every `.unit` and `data-note` on `.file-notes`: the first is the focus and test hook, the second feeds the auto-growing note field.

**Styles.** Declarations are ported value for value. Do not round, reorder shorthands, swap units, or "tidy" a selector in a way that changes its specificity relative to a rule it competes with.

**Behaviour.** Text, sorting, filtering, scoring and stored data match exactly. Focus follows the legacy app:

| After | Focus goes to |
| --- | --- |
| Opening a tile on a compact screen | the file name (`h2`), and the file scrolls to the top |
| Closing the file (button, or Escape on a compact screen) | the tile that was open |
| Log encounter, or confirming removal | the file name, without scrolling |
| Remove from log | "Keep it" |
| Keep it (file) | "Remove from log" |
| Rating, fan, work result, agents lost | stays on the control that was pressed |
| Erase the whole log (settings) | "Keep it" |
| Keep it (settings) | "Erase the whole log" |

### Intended differences

The legacy app rebuilt whole regions of the page with `innerHTML` after every action. This app patches the elements that changed and leaves the rest in place. Stills look the same; four side effects of the rebuild are gone on purpose:

| Legacy | Here |
| --- | --- |
| Clicking a filter chip, or a tile on a wide screen, rebuilt the control under the pointer, so keyboard focus fell back to `body`. | Focus stays on the chip or tile that was pressed. |
| The rebuild discarded the browser's scroll anchor, so when content above the viewport changed height the page (or the file panel) kept its scroll offset and the content under the pointer jumped. | The browser keeps the content in view steady and adjusts the scroll offset instead. |
| The page lock on compact screens was sampled when the file rendered. | It follows the viewport live. |
| A loaded portrait was fetched again each time its tile or file was rebuilt. | It loads once. |

## Checking parity

`pnpm parity` builds the app, serves it next to the legacy app, drives both through the same scenarios in headless Chrome, and compares screenshots, stored data and DOM structure. Run `pnpm parity --help` for its options.
