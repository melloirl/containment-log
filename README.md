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

The guide is read-only. Its content is code, and it changes by commit.

1. Add the abnormality to `src/content/entries.ts` under its classification code, with the day it was logged and whatever is rated so far.
2. If it has a field note, add it under `notes` in `src/i18n/locales/en.ts`.
3. Run `pnpm test`. It catches a mistyped code or a missing label.

```ts
// src/content/entries.ts
'O-03-60': {
  logged: '2026-11-24',
  rating: { usefulness: 'neutral', danger: 'dangerous', management: 'periodic' },
  fan: true,
  works: { attachment: 'good', repression: 'bad' },
  agentsLost: 2,
},
```

Every label and name on the page is in `src/i18n/locales/en.ts` too. To add a language, copy that file, translate it, and register it in `src/i18n/index.ts`.

## Build and check

| Command | What it does |
| --- | --- |
| `pnpm build` | Type-checks, then writes the static site to `dist/`. |
| `pnpm preview` | Serves `dist/` locally. |
| `pnpm test` | Runs the unit tests, including the checks on the hand-written content. |
| `pnpm typecheck` | Type-checks without building. |

The build uses relative URLs, so `dist/` works from any path on any static host.

## Deploy

Every push to `main` runs the tests, builds the site, and publishes it to GitHub Pages. The workflow is `.github/workflows/deploy.yml`.

## How it is built

The app is a Vue 3 single-page app written in TypeScript and SCSS, with vue-i18n for text. `docs/architecture.md` describes the layers and where each kind of content lives.

## Assets

The silhouette atlas is `src/assets/silhouette-atlas.png`. Fonts and Project Moon's in-game portraits load at runtime, with local fallbacks when they're unavailable. [Google Fonts](https://fonts.google.com/), [Lobotomy Corporation Wiki portrait gallery](https://lobotomycorporation.wiki.gg/wiki/Category:Abnormality_Portraits)

Nothing is stored in the browser. The spoiler shield is the one thing a reader can switch, and it resets on every visit.
