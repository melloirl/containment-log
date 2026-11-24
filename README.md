# Abnormality Containment Log

A fan-made field guide for Lobotomy Corporation. Log encounters, rate each abnormality, and keep field notes in your browser.

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

## Build and check

| Command | What it does |
| --- | --- |
| `pnpm build` | Type-checks, then writes the static site to `dist/`. |
| `pnpm preview` | Serves `dist/` locally. |
| `pnpm test` | Runs the unit tests for the domain logic and the stores. |
| `pnpm typecheck` | Type-checks without building. |
| `pnpm parity` | Compares the app against the original single-file version in headless Chrome. Needs Google Chrome installed. |

The build uses relative URLs, so `dist/` works from any path on any static host.

## Deploy

Every push to `main` runs the tests, builds the site, and publishes it to GitHub Pages. The workflow is `.github/workflows/deploy.yml`.

## How it is built

The app is a Vue 3 single-page app written in TypeScript and SCSS. `docs/architecture.md` describes the layers, where each seam sits, and the rules that keep it looking and behaving like the original. Run `pnpm parity --help` for the comparison tool's options.

## Assets and saved data

The silhouette atlas is `src/assets/silhouette-atlas.png`. Fonts and Project Moon's in-game portraits load at runtime, with local fallbacks when they're unavailable. [Google Fonts](https://fonts.google.com/), [Lobotomy Corporation Wiki portrait gallery](https://lobotomycorporation.wiki.gg/wiki/Category:Abnormality_Portraits)

Encounter records live in browser `localStorage` for the current origin, so the hosted site and a local copy each keep their own log. Use **Settings and backup** to move your log between them. Backups from the original single-file version restore here unchanged.
