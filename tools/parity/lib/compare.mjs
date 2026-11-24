// Compares the two apps' captures for one scenario x viewport, checkpoint by checkpoint.
import fs from 'node:fs'
import path from 'node:path'
import { MAX_DOM_DIFFS, REGIONS } from './config.mjs'
import { diffTrees, rootLabel } from './dom.mjs'
import { compareImages, crop, decode, encode } from './pixels.mjs'

export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'x'

const show = (v) => (v === undefined ? '(absent)' : JSON.stringify(v))
const clip = (s, n = 90) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

/* First difference between two stored strings, as a JSON path when both parse. */
export function storageDiff(a, b) {
  if (a === b) return null
  if (a == null || b == null) return `stored value ${a == null ? 'is empty in legacy' : 'present in legacy'} but ${b == null ? 'empty' : 'present'} in target`
  let A, B
  try { A = JSON.parse(a); B = JSON.parse(b) } catch { A = B = undefined }
  if (A !== undefined) {
    const walk = (x, y, p) => {
      if (x && y && typeof x === 'object' && typeof y === 'object' && Array.isArray(x) === Array.isArray(y)) {
        const kx = Object.keys(x)
        const ky = Object.keys(y)
        for (const k of new Set([...kx, ...ky])) {
          const r = walk(x[k], y[k], p ? `${p}.${k}` : k)
          if (r) return r
        }
        if (kx.join('\u0000') !== ky.join('\u0000')) return `${p || '(root)'}: key order ${show(kx)} → target ${show(ky)}`
        return null
      }
      return JSON.stringify(x) === JSON.stringify(y) ? null : `${p || '(root)'}: ${clip(show(x))} → target ${clip(show(y))}`
    }
    const r = walk(A, B, '')
    if (r) return r
  }
  let i = 0
  while (i < a.length && a[i] === b[i]) i++
  return `text differs at char ${i}: …${show(a.slice(Math.max(0, i - 20), i + 20))} → target …${show(b.slice(Math.max(0, i - 20), i + 20))}`
}

const edges = (b) => [Math.floor(b.x), Math.floor(b.y), Math.ceil(b.x + b.width), Math.ceil(b.y + b.height)].join()
const sameBox = (a, b) => edges(a) === edges(b)

function overlaps(box, bbox) {
  return box && bbox && box.x < bbox.x + bbox.width && bbox.x < box.x + box.width && box.y < bbox.y + bbox.height && bbox.y < box.y + box.height
}

/* Returns an array of checkpoint results: { name, ok, failures: [...] }.
   Writes images for failures (and for passes when keepPassing). */
export function compareJob({ scenario, viewport, legacy, target, scope, imgRoot, outDir, keepPassing }) {
  const results = []
  const jobDir = path.join(imgRoot, slug(scenario.name), viewport)
  const save = (cpName, file, buf) => {
    const dir = path.join(jobDir, slug(cpName))
    fs.mkdirSync(dir, { recursive: true })
    const p = path.join(dir, file)
    fs.writeFileSync(p, buf)
    return path.relative(outDir, p)
  }

  if (legacy.error || legacy.derailed) {
    results.push({ name: '(scenario)', ok: false, failures: [{ kind: 'harness', reason: `the scenario failed on the legacy app, fix the scenario: ${legacy.derailed || legacy.error}` }] })
  }
  if (target.error) {
    results.push({ name: '(scenario)', ok: false, failures: [{ kind: 'harness', reason: `harness error on the target run: ${target.error.split('\n')[0]}` }] })
  }

  const byName = new Map(target.checkpoints.map((c) => [c.name, c]))
  for (const L of legacy.checkpoints) {
    const T = byName.get(L.name)
    const failures = []
    const images = {}
    if (L.errors.length) failures.push({ kind: 'harness', reason: `legacy capture: ${L.errors.join('; ')}` })
    if (!T) {
      failures.push({
        kind: 'action',
        reason: target.derailed ? `not reached; the target run stopped: ${target.derailed}` : 'not reached by the target run',
      })
      results.push({ name: L.name, ok: false, failures })
      continue
    }
    for (const e of T.errors) failures.push({ kind: 'capture', reason: e })
    if (T.pageErrors?.length && !L.pageErrors?.length) {
      failures.push({ kind: 'page error', reason: `uncaught in target: ${T.pageErrors.join(' | ')}` })
    }

    // behaviour
    const sd = storageDiff(L.stored, T.stored)
    if (sd) failures.push({ kind: 'storage', reason: sd, details: [`legacy: ${L.stored}`, `target: ${T.stored}`] })
    const focusInScope = !scope || [...(L.focusIn || []), ...(T.focusIn || [])].some((r) => scope.includes(r))
    if (focusInScope && L.focus !== T.focus) failures.push({ kind: 'focus', reason: `${L.focus} → target ${T.focus}` })
    const ls = L.scroll || {}
    const ts = T.scroll || {}
    if (!scope && (Math.round(ls.y) !== Math.round(ts.y) || Math.round(ls.x) !== Math.round(ts.x))) {
      failures.push({ kind: 'scroll', reason: `window scrolled to ${Math.round(ls.x)},${Math.round(ls.y)} → target ${Math.round(ts.x)},${Math.round(ts.y)}` })
    }
    if (Math.round(ls.file) !== Math.round(ts.file) && (!scope || scope.includes('file'))) {
      failures.push({ kind: 'scroll', region: 'file', reason: `.file scrollTop ${Math.round(ls.file)} → target ${Math.round(ts.file)}` })
    }
    if (L.clipboard !== T.clipboard) {
      failures.push({ kind: 'clipboard', reason: storageDiff(L.clipboard, T.clipboard) || 'differs', details: [`legacy: ${L.clipboard}`, `target: ${T.clipboard}`] })
    }

    // pixels
    const regionNames = Object.keys(L.regions || {})
    for (const r of regionNames) {
      const ls = L.regions[r]?.state
      const ts = T.regions?.[r]?.state
      if (ls !== ts) failures.push({ kind: 'pixels', region: r, reason: `${REGIONS[r]} is ${ls} in legacy but ${ts || 'missing'} in target` })
    }
    if (L.fileShot && T.fileShot && regionNames.includes('file')) {
      const same = L.fileShot.equals(T.fileShot)
      if (!same || keepPassing) {
        const a = decode(L.fileShot)
        const b = decode(T.fileShot)
        const d = same ? null : compareImages(a, b)
        images.file = { legacy: save(L.name, 'file-legacy.png', L.fileShot), target: save(L.name, 'file-target.png', T.fileShot) }
        if (d?.diff) images.file.diff = save(L.name, 'file-diff.png', encode(d.diff))
        const sc = (c) => `window ${Math.round(c.scroll?.x)},${Math.round(c.scroll?.y)}, .file scrollTop ${Math.round(c.scroll?.file)}`
        if (d) failures.push({ kind: 'pixels', region: 'file', reason: d.reason, images: images.file, details: [`scroll: legacy ${sc(L)}; target ${sc(T)}`] })
      }
    }
    if (L.full && T.full) {
      // regions are crops of the full-page capture; decode only when something differs
      const sameFull = L.full.equals(T.full)
      let dl = null
      let dt = null
      const decoded = () => { if (!dl) { dl = decode(L.full); dt = decode(T.full) } }
      for (const shot of scope ? regionNames : ['page', ...regionNames]) {
        let a, b
        if (shot === 'page') {
          if (sameFull && !keepPassing) continue
          decoded()
          a = dl
          b = dt
        } else {
          if (shot === 'file') continue // compared from its own element screenshot above
          const lb = L.regions[shot]
          const tb = T.regions?.[shot]
          if (lb?.state !== 'visible' || tb?.state !== 'visible') continue
          if (sameFull && sameBox(lb.box, tb.box) && !keepPassing) continue
          decoded()
          a = crop(dl, lb.box)
          b = crop(dt, tb.box)
        }
        const d = compareImages(a, b)
        if (keepPassing || d) {
          images[shot] = { legacy: save(L.name, `${shot}-legacy.png`, encode(a)), target: save(L.name, `${shot}-target.png`, encode(b)) }
          if (d?.diff) images[shot].diff = save(L.name, `${shot}-diff.png`, encode(d.diff))
        }
        if (d) {
          let where = ''
          if (shot === 'page' && d.bbox) {
            const hit = regionNames.filter((r) => overlaps(L.regions[r]?.box, d.bbox))
            if (hit.length) where = ` (overlaps ${hit.join(', ')})`
          }
          const pos = shot === 'page' ? '' : ` [region at x=${Math.floor(L.regions[shot].box.x)} y=${Math.floor(L.regions[shot].box.y)} in legacy, x=${Math.floor(T.regions[shot].box.x)} y=${Math.floor(T.regions[shot].box.y)} in target]`
          const sc = (c) => `window ${Math.round(c.scroll?.x)},${Math.round(c.scroll?.y)}, .file scrollTop ${Math.round(c.scroll?.file)}`
          failures.push({ kind: 'pixels', region: shot, reason: d.reason + where + pos, images: images[shot], details: [`scroll before capture: legacy ${sc(L)}; target ${sc(T)}`] })
        }
      }
    }

    // markup
    if (L.dom) {
      const pairs = scope ? scope.map((r) => [r, L.dom[r], T.dom?.[r]]) : [['document', L.dom.whole, T.dom?.whole]]
      for (const [r, a, b] of pairs) {
        const root = r === 'document' ? 'body' : rootLabel(a || b)
        const d = diffTrees(a, b, root, MAX_DOM_DIFFS)
        if (d.count) failures.push({ kind: 'dom', region: r, reason: `${d.count} markup difference${d.count === 1 ? '' : 's'}; first: ${d.diffs[0]}`, details: d.diffs })
      }
    }

    results.push({ name: L.name, ok: failures.length === 0, failures, images: keepPassing ? images : undefined })
  }
  // checkpoints only the target produced (a diverging scenario path)
  const legacyNames = new Set(legacy.checkpoints.map((c) => c.name))
  for (const T of target.checkpoints) {
    if (!legacyNames.has(T.name)) results.push({ name: T.name, ok: false, failures: [{ kind: 'harness', reason: 'checkpoint only reached on the target; scenarios must not branch on page content' }] })
  }
  return results
}
