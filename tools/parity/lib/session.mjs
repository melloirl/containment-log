// Runs one scenario against one app at one viewport and captures every checkpoint.
import {
  ACTION_TIMEOUT_MS, ALWAYS_COMPUTED, DROPPED_ATTRIBUTES, FIXED_TIME, IGNORED_TAGS,
  NAV_TIMEOUT_MS, PARK, REGIONS, SETTLE_TIMEOUT_MS, STORAGE_KEY, VIEWPORTS, WIKI_PATTERN,
} from './config.mjs'
import { installAssetRoutes } from './assets.mjs'
import { serializeInPage } from './dom.mjs'
import { makeUI, ActionError } from './ui.mjs'

/* Installed before any page script runs. Same code for both apps. */
function initScript({ key, fixture, storage, clipboard }) {
  try {
    if (!sessionStorage.getItem('__parity_seeded')) {
      sessionStorage.setItem('__parity_seeded', '1')
      localStorage.clear()
      if (fixture != null) localStorage.setItem(key, fixture)
    }
  } catch {}
  const setItem = Storage.prototype.setItem
  if (storage === 'blocked') {
    Storage.prototype.setItem = function () { throw new DOMException('The operation is insecure.', 'SecurityError') }
  } else if (storage === 'save-fails') {
    Storage.prototype.setItem = function (k, v) {
      if (this === window.localStorage && k === key) throw new DOMException('Quota exceeded', 'QuotaExceededError')
      return setItem.call(this, k, v)
    }
  }
  window.__parityClip = null
  if (clipboard === 'missing') {
    Object.defineProperty(Navigator.prototype, 'clipboard', { get() { return undefined }, configurable: true })
  } else if (navigator.clipboard) {
    const real = navigator.clipboard.writeText.bind(navigator.clipboard)
    navigator.clipboard.writeText = function (text) {
      window.__parityClip = String(text)
      if (clipboard === 'blocked') return Promise.reject(new DOMException('Write permission denied.', 'NotAllowedError'))
      return real(text)
    }
  }
  window.__parityMutations = 0
  new MutationObserver((list) => { window.__parityMutations += list.length })
    .observe(document, { subtree: true, childList: true, attributes: true, characterData: true })
}

/* Waits for fonts, images and DOM churn to settle. Runs in the page. */
async function settleInPage(timeout) {
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()))
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const end = performance.now() + timeout
  await Promise.race([document.fonts.ready, sleep(timeout)])
  const sig = () =>
    document.readyState + '|' + document.fonts.status + '|' + (window.__parityMutations || 0) + '|' +
    Array.from(document.images, (i) => (i.complete ? 1 : 0) + (i.parentElement && i.parentElement.classList.contains('image-loaded') ? 2 : 0)).join('')
  let last = null
  let stable = 0
  while (performance.now() < end) {
    await frame()
    const s = sig()
    if (s === last) { if (++stable >= 2) break } else { stable = 0; last = s }
  }
}

function describeFocus() {
  const el = document.activeElement
  if (!el || el === document.body || el === document.documentElement) return 'body'
  const classes = [...el.classList].filter((c) => !c.startsWith('data-v-')).sort().join('.')
  const label = el.getAttribute('aria-label') || (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)
  const type = el.localName === 'input' ? `[type=${el.type}]` : ''
  return `${el.localName}${type}${classes ? '.' + classes : ''}${label ? ` "${label}"` : ''}`
}

function regionInfo(regions) {
  const out = {}
  for (const [name, sel] of Object.entries(regions)) {
    const el = document.querySelector(sel)
    if (!el) { out[name] = { state: 'missing' }; continue }
    const r = el.getBoundingClientRect()
    const visible = r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
    out[name] = {
      state: visible ? 'visible' : 'hidden',
      box: { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height },
    }
  }
  return out
}

export async function runSession({ browser, app, baseUrl, scenario, viewportName, scope, portraitPng }) {
  const viewport = VIEWPORTS[viewportName] || scenario.viewportSizes?.[viewportName]
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    locale: 'en-US',
    timezoneId: 'UTC',
    reducedMotion: 'reduce',
    colorScheme: 'light',
    serviceWorkers: 'block',
  })
  const result = { app, checkpoints: [], derailed: null, error: null }
  try {
    await context.clock.setFixedTime(FIXED_TIME)
    if (scenario.clipboard === 'granted' || scenario.clipboard === undefined) {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(baseUrl).origin })
    }
    await installAssetRoutes(context, portraitPng, WIKI_PATTERN)
    const fixture = scenario.fixture == null ? null : typeof scenario.fixture === 'string' ? scenario.fixture : JSON.stringify(scenario.fixture)
    await context.addInitScript(initScript, {
      key: STORAGE_KEY, fixture, storage: scenario.storage || 'ok', clipboard: scenario.clipboard || 'granted',
    })
    const page = await context.newPage()
    page.setDefaultTimeout(ACTION_TIMEOUT_MS)
    page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS)
    const pageErrors = []
    page.on('pageerror', (e) => pageErrors.push(String(e.message || e).split('\n')[0]))

    const state = { hover: null }
    const settle = () => page.evaluate(settleInPage, SETTLE_TIMEOUT_MS)
    const pointer = async () => {
      if (state.hover) {
        try { await state.hover().hover({ timeout: ACTION_TIMEOUT_MS, force: true }) } catch { await page.mouse.move(PARK.x, PARK.y) }
      } else await page.mouse.move(PARK.x, PARK.y)
    }
    const regions = scope ? Object.fromEntries(scope.map((r) => [r, REGIONS[r]])) : REGIONS
    const names = new Map()

    const check = async (name) => {
      const n = (names.get(name) || 0) + 1
      names.set(name, n)
      const cpName = n > 1 ? `${name} #${n}` : name
      const cp = { name: cpName, errors: [] }
      try {
        await settle()
        const scroll = await page.evaluate(() => {
          const f = document.querySelector('.file')
          return { x: scrollX, y: scrollY, file: f ? f.scrollTop : 0 }
        })
        await pointer()
        await settle()
        // The file panel is shot on its own, as the user sees it. It always fits in the viewport,
        // and a full-page capture enlarges the viewport, which grows the panel (its max-height
        // is in vh) and clamps its scroll offset at a timing-dependent moment of the capture.
        const fileVisible = !!regions.file && (await page.evaluate((sel) => {
          const el = document.querySelector(sel)
          if (!el) return false
          const r = el.getBoundingClientRect()
          if (!(r.width > 0 && r.height > 0)) return false
          el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
          return true
        }, REGIONS.file))
        if (fileVisible) {
          await pointer()
          cp.fileShot = await page.locator(REGIONS.file).first().screenshot({ animations: 'disabled', caret: 'hide', timeout: NAV_TIMEOUT_MS })
        }
        // Everything else is cropped from one full-page capture (cut at compare time), taken at
        // window scroll 0 so sticky and fixed elements sit at their layout position. Element
        // shots of elements taller than the viewport would also resize the viewport.
        if (!state.hover) await page.evaluate(() => scrollTo(0, 0))
        else await page.evaluate(({ x, y }) => scrollTo(x, y), scroll)
        await pointer()
        await settle()
        const facts = await page.evaluate(
          ({ key, regions, allRegions, serializeSrc, focusSrc, regionSrc, domArgs }) => {
            const serialize = new Function('return ' + serializeSrc)()
            const focus = new Function('return ' + focusSrc)()
            const regionsOf = new Function('return ' + regionSrc)()
            let stored
            try { stored = localStorage.getItem(key) } catch (e) { stored = '<<getItem threw>>' }
            return {
              stored,
              focus: focus(),
              focusIn: Object.keys(allRegions).filter((r) => {
                const el = document.querySelector(allRegions[r])
                return el && document.activeElement && el.contains(document.activeElement)
              }),
              clipboard: window.__parityClip,
              regions: regionsOf(regions),
              dom: serialize(domArgs),
            }
          },
          {
            key: STORAGE_KEY,
            regions,
            allRegions: REGIONS,
            serializeSrc: serializeInPage.toString(),
            focusSrc: describeFocus.toString(),
            regionSrc: regionInfo.toString(),
            domArgs: { roots: scope ? regions : null, dropped: DROPPED_ATTRIBUTES, ignoredTags: IGNORED_TAGS, alwaysComputed: ALWAYS_COMPUTED },
          },
        )
        Object.assign(cp, facts, { scroll })
        if (!scope || scope.some((r) => r !== 'file')) {
          cp.full = await page.screenshot({
            fullPage: true, animations: 'disabled', caret: 'hide', timeout: NAV_TIMEOUT_MS,
            mask: [page.locator(REGIONS.file)], maskColor: '#ff00ff',
          })
        }
        await page.evaluate(({ x, y, file }) => {
          scrollTo(x, y)
          const f = document.querySelector('.file')
          if (f) f.scrollTop = file
        }, scroll)
        await pointer()
      } catch (e) {
        cp.errors.push(`capture failed: ${firstLine(e)}`)
      }
      if (pageErrors.length) cp.pageErrors = pageErrors.splice(0)
      result.checkpoints.push(cp)
    }

    const ui = makeUI(page, state, { settle, viewport })
    try {
      await page.goto(baseUrl, { waitUntil: 'load' })
    } catch (e) {
      throw new ActionError('open the app', e)
    }
    await scenario.run(ui, check, { viewport: viewportName, app })
  } catch (e) {
    if (e instanceof ActionError) result.derailed = e.message
    else result.error = (e && e.stack) || String(e)
  } finally {
    await context.close().catch(() => {})
  }
  return result
}

function firstLine(e) {
  return String((e && e.message) || e).split('\n')[0]
}
