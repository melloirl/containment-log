// Every knob the harness has, in one place.
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const LEGACY_REF = '66c1755:dist/index.html'

export const PARITY_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
export const REPO_ROOT = path.resolve(PARITY_DIR, '..', '..')
export const OUT_ROOT = path.join(PARITY_DIR, 'out')
export const CACHE_DIR = path.join(OUT_ROOT, '.cache')

export const STORAGE_KEY = 'containment-log-v1'

/* pixelmatch colour threshold (0..1). 0 = any change in any channel counts. */
export const PIXEL_THRESHOLD = 0
/* Count anti-aliased pixels as differences too (pixelmatch ignores them by default). */
export const PIXEL_INCLUDE_AA = true

/* Fixed wall clock for both apps: Date.now() and "Logged on …" dates. */
export const FIXED_TIME = Date.UTC(2026, 2, 14, 15, 9, 26)

/* How long one user action may wait for its element before the run is declared derailed. */
export const ACTION_TIMEOUT_MS = 4000
/* Upper bound for page load and for the settle wait before a screenshot. */
export const NAV_TIMEOUT_MS = 15000
export const SETTLE_TIMEOUT_MS = 5000

export const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  edge: { width: 1000, height: 800 },
  desktop: { width: 1440, height: 900 },
  'desktop-tall': { width: 1440, height: 2600 },
}

/* Region name -> selector. Selectors use only hooks present in both apps. */
export const REGIONS = {
  header: 'header.top',
  controls: '.controls',
  grid: 'main',
  file: '.file',
  settings: '.settings',
  footer: 'footer',
}

/* Allowed markup differences (docs/architecture.md, "Parity contract"). */
export const DROPPED_ATTRIBUTES = [
  'id',
  'data-act', 'data-k', 'data-n', 'data-d', 'data-w',
  'data-name', 'data-set', 'data-filter', 'data-logged',
]
/* Non-markup elements that never take part in the comparison. */
export const IGNORED_TAGS = ['script', 'style', 'link', 'meta', 'noscript', 'template']
/* Computed properties always captured, so a legacy inline declaration can be
   matched by a scoped class on the target (only margin-top and color are inline in legacy). */
export const ALWAYS_COMPUTED = ['margin-top', 'color']

export const WIKI_PATTERN = 'https://lobotomycorporation.wiki.gg/**'
export const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']

/* Mouse parking spot: the left page gutter at the very top, over nothing interactive. */
export const PARK = { x: 0, y: 0 }

export const MAX_DOM_DIFFS = 8
