# Abnormality Containment Log

A fan-made field guide for Lobotomy Corporation. Log encounters, rate each abnormality, and keep field notes in your browser.

## Run locally

Clone the repository with Git and serve the app with Python 3.

```sh
git clone https://github.com/melloirl/containment-log.git
cd containment-log
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Open the local app in your browser. [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

Edit `dist/index.html` and refresh the page to see your changes.

## Assets and saved data

The app uses plain HTML, CSS, and JavaScript. The silhouette atlas is embedded in `dist/index.html`. Fonts and Project Moon's in-game portraits load at runtime, with local fallbacks when they're unavailable. [Google Fonts](https://fonts.google.com/), [Lobotomy Corporation Wiki portrait gallery](https://lobotomycorporation.wiki.gg/wiki/Category:Abnormality_Portraits)

Encounter records live in browser `localStorage` for the current origin. Use **Settings and backup** to move your log between the hosted site and your local copy.
