// User actions for scenarios. Only hooks both apps share: element types, legacy class
// names, text, ARIA and data-code. Never ids or data-act style hooks.
import { ACTION_TIMEOUT_MS, NAV_TIMEOUT_MS } from './config.mjs'

export class ActionError extends Error {
  constructor(what, cause) {
    const lines = String(cause?.message || cause).split('\n').map((l) => l.trim()).filter(Boolean)
    // Playwright's call log ends with why it kept waiting (hidden, intercepted, unstable, …)
    const why = lines.filter((l) => l.startsWith('- ')).slice(-1)[0]
    super(`could not ${what}: ${lines[0]}${why && why !== lines[0] ? ` (last: ${why.slice(2)})` : ''}`)
  }
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const exact = (s) => new RegExp(`^\\s*${escapeRe(s)}\\s*$`)
const AXES = { usefulness: 0, danger: 1, management: 2 }

export function makeUI(page, state, { settle }) {
  const act = async (what, fn) => {
    try {
      await fn()
    } catch (e) {
      throw new ActionError(what, e)
    }
  }
  const byText = (sel, text) => page.locator(sel).filter({ hasText: exact(text) }).first()
  /* Scroll with plain scrollIntoView first: Playwright's own scrolling retries with different
     alignments when an element moves (the sticky file panel does), which makes the resulting
     scroll offsets timing-dependent. */
  const reveal = (locator) => locator.evaluate((el) => el.scrollIntoView({ block: 'nearest', inline: 'nearest' }), null, { timeout: ACTION_TIMEOUT_MS })
  const click = (what, locator) =>
    act(what, async () => {
      await reveal(locator)
      await locator.click({ timeout: ACTION_TIMEOUT_MS })
    })
  const axisIndex = (axis) => (typeof axis === 'number' ? axis : AXES[axis.toLowerCase()])
  const seg = (axis, level) => page.locator('.file .axis').nth(axisIndex(axis)).locator('.seg').nth(level - 1)

  const ui = {
    page,
    locators: { seg, tile: (code) => page.locator(`.unit[data-code="${code}"]`) },

    /* roster */
    search: (text) => act(`type "${text}" in .search`, () => page.locator('.search').fill(text)),
    clearSearch: () => act('clear .search', () => page.locator('.search').fill('')),
    chip: (label) => click(`click .chip "${label}"`, byText('.chip', label)),
    openTile: (code) => click(`click .unit[data-code="${code}"]`, page.locator(`.unit[data-code="${code}"]`)),

    /* Below 1000px the open file covers the grid, so close it before opening another. */
    compact: () => (page.viewportSize()?.width ?? 0) < 1000,
    switchTile: async (code) => {
      if (ui.compact()) await ui.closeFile()
      await ui.openTile(code)
    },

    /* file */
    closeFile: () => click('click .file .linkish "Back to the log"', byText('.file .linkish', 'Back to the log')),
    logEncounter: () => click('click .file .btn "Log encounter"', byText('.file .btn', 'Log encounter')),
    rate: (axis, level) => click(`click .seg ${level} of .axis ${axis}`, seg(axis, level)),
    fan: () => click('click .file .fan', page.locator('.file .fan')),
    work: (name) =>
      click(`click .work "${name}"`, page.locator('.file .work').filter({ has: page.locator('b', { hasText: exact(name) }) }).first()),
    lostMore: () => click('click .step "One more"', page.locator('.file .step[aria-label="One more"]')),
    lostLess: () => click('click .step "One fewer"', page.locator('.file .step[aria-label="One fewer"]')),
    typeNote: (text) =>
      act('type in the .file notes textarea', async () => {
        const box = page.locator('.file textarea')
        await reveal(box)
        await box.click({ timeout: ACTION_TIMEOUT_MS })
        await box.pressSequentially(text, { timeout: ACTION_TIMEOUT_MS * 4 })
      }),
    focusNote: () => click('click the .file notes textarea', page.locator('.file textarea')),
    removeFromLog: () => click('click .file .linkish "Remove from log"', byText('.file .linkish', 'Remove from log')),
    confirmRemove: () => click('click .file .btn "Remove from log"', byText('.file .btn', 'Remove from log')),
    keepIt: () => click('click .file .btn "Keep it"', byText('.file .btn', 'Keep it')),

    /* settings */
    openSettings: () => click('click .settings summary', page.locator('.settings summary')),
    toggleShield: () => click('click .check input', page.locator('.settings .check input')),
    copyBackup: () => click('click .settings .btn "Copy backup"', byText('.settings .btn', 'Copy backup')),
    fillBackup: (text) => act('fill .settings textarea', () => page.locator('.settings textarea').fill(text)),
    restoreBackup: () => click('click .settings .btn "Restore backup"', byText('.settings .btn', 'Restore backup')),
    erase: () => click('click .settings .linkish "Erase the whole log"', byText('.settings .linkish', 'Erase the whole log')),
    eraseConfirm: () => click('click .settings .btn "Erase the whole log"', byText('.settings .btn', 'Erase the whole log')),
    eraseKeep: () => click('click .settings .btn "Keep it"', byText('.settings .btn', 'Keep it')),
    /* What the app last handed to navigator.clipboard.writeText (null if nothing). */
    clipboardText: () => page.evaluate(() => window.__parityClip),

    /* keyboard, pointer, viewport */
    press: (key) => act(`press ${key}`, () => page.keyboard.press(key)),
    /* Keep the pointer on this element for every screenshot until unhover(). */
    hover: (locatorFn, what = 'element') =>
      act(`hover ${what}`, async () => {
        await reveal(locatorFn())
        await locatorFn().hover({ timeout: ACTION_TIMEOUT_MS })
        state.hover = locatorFn
      }),
    unhover: async () => { state.hover = null },
    resize: (width, height) => act(`resize to ${width}x${height}`, () => page.setViewportSize({ width, height })),
    scrollToBottom: (sel) =>
      act(`scroll ${sel || 'page'} to the bottom`, () =>
        page.evaluate((s) => {
          if (!s) { scrollTo(0, document.documentElement.scrollHeight); return }
          const el = document.querySelector(s)
          if (!el) throw new Error(`${s} not found`)
          el.scrollTop = el.scrollHeight
        }, sel || null),
      ),
    scrollToTop: () => act('scroll page to the top', () => page.evaluate(() => scrollTo(0, 0))),
    reload: () =>
      act('reload the page', async () => {
        await page.reload({ waitUntil: 'load', timeout: NAV_TIMEOUT_MS })
        await settle()
      }),
  }
  return ui
}
