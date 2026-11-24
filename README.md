# Abnormality Containment Log

A fan-made field guide for Lobotomy Corporation: the abnormalities we've met, how we rate each one, and our field notes.

Open the live app. [melloirl.github.io/containment-log](https://melloirl.github.io/containment-log/)

## Run locally

You need Node 24 and pnpm 10.

```sh
git clone https://github.com/melloirl/containment-log.git
cd containment-log
pnpm install
pnpm dev
```

Vite prints the local address. Edit anything under `src/` and the page updates as you save.

## Add to the log

Readers get a read-only guide. You write it in author mode, which exists only in the dev server on your machine.

```sh
pnpm author
```

The guide opens with a dashed **Author** box in each abnormality's file and a bar along the bottom.

1. Open a containment unit. If it is new, press **Log this abnormality**.
2. Type the field note and click the ratings, work results and the rest. The reader's view below the box updates as you go, and your edits are written to the content files a moment after each change.
3. Press **Publish**. It commits the content files with the message in the bar, which you can reword, and pushes with your own git login. The push starts the deploy, and the site updates in about a minute.

To make plain `pnpm dev` an author session on one machine, put `VITE_AUTHOR=true` in `.env.local`, which git ignores. Without that variable there is no editor: a build never contains it.

Publish only commits the two content files, so unrelated work in progress stays out of it:

| File | Holds |
| --- | --- |
| `src/content/entries.json` | Each logged abnormality: the day, ratings, fan flag, work results, agents lost. |
| `src/i18n/locales/en.notes.json` | The field notes, in English. |

`pnpm test` checks both against the roster, and the deploy runs it first, so a broken file fails the deploy and leaves the live site as it was.

Every label and name on the page is in `src/i18n/locales/en.ts`. To add a language, copy that file and its notes file, translate them, and register the locale in `src/i18n/index.ts`.

## Build and check

| Command | What it does |
| --- | --- |
| `pnpm author` | Starts the dev server in author mode and opens the guide. |
| `pnpm build` | Type-checks, then writes the static site to `dist/`. |
| `pnpm preview` | Serves `dist/` locally. |
| `pnpm test` | Runs the unit tests, including the checks on the content files. |
| `pnpm typecheck` | Type-checks without building. |

The build uses relative URLs, so `dist/` works from any path on any static host.

## Deploy

Every push to `main` runs the tests, builds the site, and publishes it to GitHub Pages. The workflow is `.github/workflows/deploy.yml`.

## How it is built

The app is a Vue 3 single-page app written in TypeScript and SCSS, with vue-i18n for text. `docs/architecture.md` describes the layers and where each kind of content lives.

## Assets

The silhouette atlas is `src/assets/silhouette-atlas.png`. Fonts and Project Moon's in-game portraits load at runtime, with local fallbacks when they're unavailable. [Google Fonts](https://fonts.google.com/), [Lobotomy Corporation Wiki portrait gallery](https://lobotomycorporation.wiki.gg/wiki/Category:Abnormality_Portraits)

Nothing is stored in the browser. The spoiler shield is the one thing a reader can switch, and it resets on every visit.
