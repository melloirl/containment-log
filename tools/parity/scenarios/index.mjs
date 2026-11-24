// Scenarios: each drives the page like a user and calls check() at every state worth comparing.
// The same function runs against both apps. Branch only on env (viewport), never on page content.
import { EMPTY, EMPTY_SHIELD_OFF, FULL, LEGACY_SHAPED, RICH, RICH_SHIELD_OFF } from './fixtures.mjs'

const CHIPS = ['All', 'ZAYIN', 'TETH', 'HE', 'WAW', 'ALEPH', 'Tools']
const COMPACT = ['mobile', 'tablet']
const WIDE = ['edge', 'desktop', 'desktop-tall']
/* The file panel scrolls inside itself everywhere except the tall desktop viewport. */
const fileScrolls = (env) => env.viewport !== 'desktop-tall'

async function everyChip(ui, check, prefix) {
  for (const chip of CHIPS) {
    await ui.chip(chip)
    await check(`${prefix}${chip}`)
  }
}

export const scenarios = [
  {
    name: 'first visit',
    fixture: EMPTY,
    async run(ui, check) {
      await check('empty store, shield on')
      await ui.openSettings()
      await check('settings open')
      await ui.toggleShield()
      await check('shield off')
      await ui.toggleShield()
      await check('shield back on')
    },
  },
  {
    name: 'rich log: shield on',
    fixture: RICH,
    async run(ui, check) {
      await check('no file open')
      await ui.hover(() => ui.locators.tile('O-03-03'), 'a logged tile')
      await check('hovering a logged tile')
      await ui.hover(() => ui.locators.tile('T-03-46'), 'a sealed tile')
      await check('hovering a sealed tile')
      await ui.unhover()
    },
  },
  {
    name: 'rich log: shield off',
    fixture: RICH_SHIELD_OFF,
    async run(ui, check) {
      await check('no file open')
    },
  },
  {
    name: 'full log',
    fixture: FULL,
    async run(ui, check) {
      await check('every abnormality logged')
      await ui.chip('Logged only')
      await check('logged only')
    },
  },
  {
    name: 'search: shield on',
    fixture: RICH,
    async run(ui, check) {
      await ui.search('O-03')
      await check('code fragment')
      await ui.search('wh')
      await check('two letters of an unlogged name stay hidden')
      await ui.search('whi')
      await check('three letters peek an unlogged name')
      await ui.search('snow')
      await check('logged name and a peeked name')
      await ui.search('  BALD ')
      await check('padded upper-case code')
      await ui.search('zzzz')
      await check('no match')
      await ui.clearSearch()
      await check('search cleared')
    },
  },
  {
    name: 'search: shield off',
    fixture: RICH_SHIELD_OFF,
    async run(ui, check) {
      await ui.search('wh')
      await check('two letters of an unlogged name')
      await ui.search('o-01')
      await check('code fragment')
    },
  },
  {
    name: 'filters: shield on',
    fixture: RICH,
    async run(ui, check) {
      await everyChip(ui, check, 'chip ')
      await ui.chip('Logged only')
      await everyChip(ui, check, 'logged only, chip ')
    },
  },
  {
    name: 'filters: shield off',
    fixture: RICH_SHIELD_OFF,
    async run(ui, check) {
      await everyChip(ui, check, 'chip ')
      await ui.chip('Logged only')
      await everyChip(ui, check, 'logged only, chip ')
    },
  },
  {
    name: 'filters: empty store',
    fixture: EMPTY,
    async run(ui, check) {
      await ui.chip('ZAYIN')
      await check('risk filter, nothing logged at this level')
      await ui.chip('All')
      await ui.chip('Logged only')
      await check('logged only, log is empty')
      await ui.chip('Tools')
      await check('logged only, tools')
      await ui.chip('Logged only')
      await check('tools')
      await ui.search('zzzz')
      await check('search matches nothing')
    },
  },
  {
    name: 'file: sealed',
    fixture: RICH,
    async run(ui, check) {
      await ui.openTile('T-03-46')
      await check('sealed unidentified file')
      await ui.switchTile('O-09-81')
      await check('sealed tool')
    },
  },
  {
    name: 'file: unlogged with shield off',
    fixture: RICH_SHIELD_OFF,
    async run(ui, check) {
      await ui.openTile('T-03-46')
      await check('unsealed unlogged file')
      await ui.switchTile('O-09-81')
      await check('unsealed unlogged tool')
    },
  },
  {
    name: 'file: logged entries',
    fixture: RICH,
    async run(ui, check, env) {
      const codes = ['O-03-03', 'O-02-56', 'T-09-85', 'Bald-Is-Awesome!', 'O-06-20', 'O-04-08', 'O-01-04', 'F-01-37', 'O-02-40', 'F-01-02']
      for (const [i, code] of codes.entries()) {
        await (i ? ui.switchTile(code) : ui.openTile(code))
        await check(code)
        if (fileScrolls(env)) {
          await ui.scrollToBottom('.file')
          await check(`${code}, file scrolled to the bottom`)
        }
      }
    },
  },
  {
    name: 'file: meter peek',
    fixture: RICH,
    async run(ui, check) {
      await ui.openTile('O-03-03')
      await ui.hover(() => ui.locators.seg('danger', 4), 'Danger: Dangerous')
      await check('hovering Danger: Dangerous')
      await ui.hover(() => ui.locators.seg('management', 1), 'Management: None')
      await check('hovering the zero cell of Management')
      await ui.unhover()
      await check('pointer parked again')
      await ui.focusNote()
      await ui.press('Tab')
      await check('keyboard focus on Usefulness: Useless')
      await ui.press('Tab')
      await check('keyboard focus on Usefulness: Neutral')
      await ui.press('Shift+Tab')
      await ui.press('Shift+Tab')
      await check('focus back in the note')
    },
  },
  {
    name: 'journey: log and review',
    fixture: RICH,
    async run(ui, check) {
      await ui.openTile('F-04-83')
      await check('sealed file')
      await ui.logEncounter()
      await check('logged')
      await ui.rate('usefulness', 3)
      await check('usefulness rated')
      await ui.rate('danger', 2)
      await check('danger rated')
      await ui.rate('management', 1)
      await check('all rated, verdict')
      await ui.rate('danger', 2)
      await check('danger un-rated by clicking it again')
      await ui.fan()
      await check('fan on')
      await ui.fan()
      await check('fan off')
      await ui.work('Instinct')
      await check('instinct goes well')
      await ui.work('Instinct')
      await check('instinct avoid')
      await ui.work('Instinct')
      await check('instinct unknown')
      await ui.lostMore()
      await check('lost 1')
      await ui.lostMore()
      await check('lost 2')
      await ui.lostLess()
      await check('lost back to 1')
      await ui.lostLess()
      await check('lost back to 0')
      await ui.lostLess()
      await check('fewer at zero stays at 0')
      await ui.typeNote('First line\nSecond line\n')
      await check('multi-line note typed')
      await ui.removeFromLog()
      await check('removal confirmation')
      await ui.keepIt()
      await check('kept')
      await ui.removeFromLog()
      await ui.confirmRemove()
      await check('removed')
    },
  },
  {
    name: 'journey: many losses',
    fixture: RICH,
    async run(ui, check) {
      await ui.openTile('F-01-02')
      for (let i = 0; i < 2; i++) await ui.lostMore()
      await check('lost 5, HR has questions')
      for (let i = 0; i < 10; i++) await ui.lostMore()
      await check('lost 15, try a different work type')
    },
  },
  {
    name: 'journey: log with shield off',
    fixture: EMPTY_SHIELD_OFF,
    async run(ui, check) {
      await ui.openTile('O-01-45')
      await check('unlogged file')
      await ui.logEncounter()
      await check('logged, portrait unlocked')
      await ui.removeFromLog()
      await ui.confirmRemove()
      await check('removed again')
    },
  },
  {
    name: 'compact: open and close',
    fixture: RICH,
    viewports: COMPACT,
    async run(ui, check) {
      await ui.openTile('O-03-03')
      await check('opened, focus on the name')
      await ui.closeFile()
      await check('closed with the button, focus on the tile')
      await ui.openTile('O-03-03')
      await check('reopened')
      await ui.press('Escape')
      await check('closed with Escape')
    },
  },
  {
    name: 'wide: Escape keeps the file',
    fixture: RICH,
    viewports: WIDE,
    async run(ui, check) {
      await ui.openTile('O-03-03')
      await ui.press('Escape')
      await check('file still open')
    },
  },
  {
    name: 'settings and backup',
    fixture: RICH,
    async run(ui, check) {
      await ui.openSettings()
      await check('settings open')
      // The open file covers the page below 1000px, so the settings can only be used with a file open on wide screens.
      if (!ui.compact()) await ui.openTile('T-03-46')
      await ui.toggleShield()
      await check(ui.compact() ? 'shield off' : 'shield off with a sealed file open')
      await ui.copyBackup()
      await check('backup copied')
      const backup = await ui.clipboardText()
      if (!ui.compact()) await ui.switchTile('O-03-03')
      await ui.erase()
      await check('erase confirmation')
      await ui.eraseKeep()
      await check('erase kept')
      await ui.erase()
      await ui.eraseConfirm()
      await check('log erased')
      await ui.toggleShield()
      await ui.restoreBackup()
      await check('restore with an empty box')
      await ui.fillBackup('{"entries": {')
      await ui.restoreBackup()
      await check('restore invalid JSON')
      await ui.fillBackup('{"hello": "world"}')
      await ui.restoreBackup()
      await check('restore JSON that is not a backup')
      await ui.fillBackup('{"entries": null}')
      await ui.restoreBackup()
      await check('restore entries null')
      await ui.fillBackup(backup || '')
      await ui.restoreBackup()
      await check('restore the backup copied earlier')
    },
  },
  {
    name: 'settings: clipboard blocked',
    fixture: RICH,
    clipboard: 'blocked',
    async run(ui, check) {
      await ui.openSettings()
      await ui.copyBackup()
      await check('fallback: backup selected in the box')
    },
  },
  {
    name: 'settings: no clipboard API',
    fixture: RICH,
    clipboard: 'missing',
    viewports: ['mobile', 'desktop'],
    async run(ui, check) {
      await ui.openSettings()
      await ui.copyBackup()
      await check('fallback: backup selected in the box')
    },
  },
  {
    name: 'storage blocked',
    fixture: RICH,
    storage: 'blocked',
    async run(ui, check) {
      await check('warning banner, empty log')
      await ui.openTile('O-03-03')
      await ui.logEncounter()
      await check('logged without saving')
    },
  },
  {
    name: 'storage fails on save',
    fixture: RICH,
    storage: 'save-fails',
    viewports: ['mobile', 'desktop'],
    async run(ui, check) {
      await check('loaded, no warning yet')
      await ui.openTile('O-02-56')
      await ui.fan()
      await check('save failed, warning shown')
    },
  },
  {
    name: 'resize across the breakpoint',
    fixture: RICH,
    viewports: ['edge'],
    async run(ui, check) {
      await ui.resize(999, 800)
      await ui.openTile('O-03-03')
      await check('999 with a file open')
      await ui.resize(1000, 800)
      await check('1000 with the same file')
      await ui.resize(999, 800)
      await check('back to 999')
      await ui.closeFile()
      await ui.resize(1000, 800)
      await ui.openTile('F-01-37')
      await ui.resize(999, 800)
      // The page lock is sampled on render in legacy and live in the rewrite (an allowed difference),
      // so compare only after an action has re-rendered the file at 999.
      await ui.fan()
      await check('opened at 1000, acted at 999')
    },
  },
  {
    name: 'persistence across reload',
    fixture: RICH,
    async run(ui, check) {
      await ui.openTile('O-02-56')
      await ui.rate('danger', 3)
      await ui.typeNote('kept after reload')
      await ui.reload()
      await check('reloaded')
      await ui.openTile('O-02-56')
      await check('file after reload')
    },
  },
  {
    name: 'legacy-shaped data',
    fixture: LEGACY_SHAPED,
    async run(ui, check) {
      await check('loaded, store untouched')
      await ui.openTile('O-01-45')
      await check('entry with r and scraps')
      await ui.fan()
      await check('saved, r and scraps survive')
      await ui.switchTile('T-01-54')
      await check('entry with a string met')
    },
  },
]
