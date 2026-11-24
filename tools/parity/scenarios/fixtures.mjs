// Stored states written to localStorage['containment-log-v1'] before the app boots.
// Key order inside entries follows the legacy normalize(), as a real saved log would.

const DAY = 86400000
const T0 = Date.UTC(2026, 0, 5, 9, 30, 0)

function entry(i, u, d, m, extra = {}) {
  return { met: T0 + i * DAY + i * 3607000, a: { u, d, m }, fan: false, w: {}, lost: 0, note: '', scraps: [], ...extra }
}

/* Covers every verdict tier, partial and empty reviews, fan on/off, each lost remark,
   work results in all three states, notes with newlines and a trailing blank line,
   a tool, the non-standard code, and all five risk levels. */
export function richEntries() {
  return {
    'O-03-03': entry(0, 3, 1, 1, { fan: true, w: { instinct: 1, insight: 1, attachment: 1, repression: 1 }, note: 'Confess every sin.\nIt still smiles.' }), // ZAYIN, Always pick 10
    'F-01-02': entry(1, 3, 3, 2, { fan: true, lost: 3 }), // TETH, Good pick 7.8, "Acceptable losses."
    'F-01-37': entry(2, 2, 3, 2, { w: { instinct: 1, insight: -1, repression: 1 } }), // HE, Fair trade 5.3, mixed work results
    'O-02-40': entry(3, 2, 5, 4, { lost: 9 }), // WAW, Only if desperate 2.5 (tier edge), "HR has questions."
    'O-06-20': entry(4, 1, 5, 4, { fan: true, lost: 20, w: { instinct: -1, insight: -1, attachment: -1, repression: -1 } }), // ALEPH, Never again 0
    'O-02-56': entry(5, 2, 0, 1), // TETH, partial review
    'O-04-08': entry(6, 0, 0, 0, { note: 'Line one\nLine two\n\nLine four, after a gap' }), // HE, not reviewed, multi-line note
    'O-01-04': entry(7, 0, 0, 0, { fan: true, note: 'Ends with a blank line\n' }), // WAW, only a fan icon on the tile
    'T-09-85': entry(8, 3, 2, 2), // ZAYIN tool, no work results section
    'Bald-Is-Awesome!': entry(9, 2, 1, 1, { note: `<b>"Bald" & proud</b> it's fine` }), // non-standard code, escaping
    'T-04-53': entry(10, 0, 0, 0, { lost: 1 }), // WAW, lost only
  }
}

export const EMPTY = null
export const EMPTY_SHIELD_OFF = { v: 1, shield: false, entries: {} }
export const RICH = { v: 1, shield: true, entries: richEntries() }
export const RICH_SHIELD_OFF = { v: 1, shield: false, entries: richEntries() }

/* Written by an older version: the r field, scraps (one invalid, one without a time),
   out-of-range and string values, an unknown code, an entry without met, no shield key. */
export const LEGACY_SHAPED = {
  v: 1,
  entries: {
    'O-01-45': {
      met: T0, a: { u: 2, d: '3', m: 9 }, r: { useful: 2, danger: 1, care: 3 }, fan: 1,
      w: { instinct: 1, insight: 2, attachment: -1 }, lost: '1', note: 'Old note from v0',
      scraps: [{ t: T0 + 1000, x: 'first scrap' }, { t: 'bad', x: '   ' }, { x: 'a scrap without a time' }],
      extra: 'junk',
    },
    'T-01-54': { met: String(T0 + 5 * DAY), a: {}, r: 'not an object', scraps: 'nope' },
    'X-99-99': { met: T0, a: { u: 1, d: 1, m: 1 } },
    'F-02-44': { a: { u: 1 } },
  },
}

const ROSTER = ['O-03-03', 'F-04-83', 'F-05-52', 'O-01-45', 'O-05-47', 'O-09-81', 'T-09-85', 'T-09-94', 'T-09-97', 'Bald-Is-Awesome!', 'D-01-106', 'O-00-00', 'T-06-27', 'F-02-44', 'O-09-96', 'T-05-51', 'O-05-61', 'T-01-54', 'O-03-60', 'O-04-100', 'O-09-95', 'O-04-84', 'O-01-12', 'D-02-107', 'O-02-56', 'F-01-02', 'T-09-90', 'T-02-43', 'T-09-77', 'F-01-18', 'T-09-09', 'O-01-92', 'T-02-99', 'T-05-41', 'O-01-55', 'F-01-69', 'T-01-68', 'T-09-80', 'T-04-06', 'O-01-67', 'O-01-15', 'T-09-78', 'O-02-98', 'O-09-91', 'O-04-08', 'F-02-49', 'F-01-87', 'O-05-76', 'T-09-82', 'O-05-30', 'F-01-37', 'F-05-32', 'T-04-53', 'D-09-104', 'F-02-58', 'O-02-40', 'D-01-110', 'O-03-88', 'F-02-70', 'T-09-86', 'T-09-79', 'D-01-105', 'O-02-62', 'F-01-57', 'D-04-108', 'T-04-50', 'F-04-42', 'O-04-72', 'T-02-71', 'O-02-101', 'O-01-64', 'O-01-73', 'O-04-66', 'O-02-74', 'O-01-04', 'O-07-103', 'O-05-102', 'O-02-63', 'O-03-93', 'O-03-89', 'D-03-109', 'T-01-75', 'O-06-20', 'T-01-31', 'T-03-46']

/* Every abnormality logged: a full gauge, one fan club, one agent lost. */
export const FULL = {
  v: 1,
  shield: true,
  entries: Object.fromEntries(
    ROSTER.map((code, i) => [code, entry(i, (i % 4), (i * 3) % 6, (i * 7) % 5, i === 7 ? { fan: true, lost: 1 } : {})]),
  ),
}
