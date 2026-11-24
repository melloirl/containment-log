#!/usr/bin/env node
// Parity harness: drives the legacy app and the Vue rewrite through the same scenarios
// in headless Chrome and compares pixels, stored data, focus and DOM structure.
// Usage: see tools/parity/README.md, or `pnpm parity --help`.
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright-core'
import { LEGACY_REF, OUT_ROOT, REGIONS, VIEWPORTS, WIKI_PATTERN } from './lib/config.mjs'
import { buildTarget, extractLegacy, TargetBuildError } from './lib/build.mjs'
import { serveDir } from './lib/serve.mjs'
import { installAssetRoutes, makePortraitPng, fontStats } from './lib/assets.mjs'
import { runSession } from './lib/session.mjs'
import { compareJob } from './lib/compare.mjs'
import { printConsole, writeReports } from './lib/report.mjs'
import { scenarios as ALL_SCENARIOS } from './scenarios/index.mjs'

const HELP = `pnpm parity [options]

  (no options)        build the target with Vite into the out dir and compare it with the legacy app
  --target <url>      compare against a running server instead of building (e.g. a vite dev server)
  --self              use the legacy app as the target too (proves the harness is deterministic)
  --only <text>       run scenarios whose name contains the text (repeatable or comma-separated)
  --viewport <names>  subset of viewports: ${Object.keys(VIEWPORTS).join(', ')}
  --scope <names>     compare only these regions: ${Object.keys(REGIONS).join(', ')}
                      (skips the full-page screenshot and the whole-document DOM check)
  --out <dir>         output directory (default: tools/parity/out/run-<time>-<pid>)
  --workers <n>       scenario x viewport runs in parallel (default: ${defaultWorkers()})
  --keep-passing      keep screenshots of passing checkpoints too
  --verbose           print every failure line with its details
  --list              list scenarios and their viewports, then exit
`

/* Scrollbars stay hidden (Playwright's default): a full-page capture enlarges the viewport, a
   classic scrollbar then disappears and the page reflows ~10px wider mid-capture, which makes
   captures depend on timing. The cost: the custom scrollbar colours are not compared. */
const CHROME_ARGS = ['--font-render-hinting=none', '--disable-lcd-text', '--disable-partial-raster']

function defaultWorkers() {
  return Math.max(2, Math.min(10, Math.floor(os.availableParallelism() * 0.75)))
}

function parseArgs(argv) {
  const o = { only: [], viewports: null, scope: null, workers: defaultWorkers(), keepPassing: false, self: false, target: null, out: null, verbose: false, list: false }
  const list = (v) => v.split(',').map((s) => s.trim()).filter(Boolean)
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const [flag, inline] = a.includes('=') ? [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)] : [a, undefined]
    const val = () => {
      if (inline !== undefined) return inline
      if (i + 1 >= argv.length) fail(`${flag} needs a value`)
      return argv[++i]
    }
    switch (flag) {
      case '--': break
      case '--help': case '-h': console.log(HELP); process.exit(0)
      case '--target': o.target = val(); break
      case '--self': o.self = true; break
      case '--only': o.only.push(...list(val())); break
      case '--viewport': case '--viewports': (o.viewports ||= []).push(...list(val())); break
      case '--scope': (o.scope ||= []).push(...list(val())); break
      case '--out': o.out = path.resolve(val()); break
      case '--workers': o.workers = Math.max(1, parseInt(val(), 10) || 1); break
      case '--keep-passing': o.keepPassing = true; break
      case '--verbose': o.verbose = true; break
      case '--list': o.list = true; break
      default: fail(`unknown option ${a}\n\n${HELP}`)
    }
  }
  if (o.self && o.target) fail('--self and --target cannot be combined')
  for (const v of o.viewports || []) if (!VIEWPORTS[v]) fail(`unknown viewport "${v}"; known: ${Object.keys(VIEWPORTS).join(', ')}`)
  for (const r of o.scope || []) if (!REGIONS[r]) fail(`unknown region "${r}"; known: ${Object.keys(REGIONS).join(', ')}`)
  return o
}

function fail(msg, code = 2) {
  console.error(`parity: ${msg}`)
  process.exit(code)
}

async function pool(items, n, fn) {
  let next = 0
  const workers = Array.from({ length: Math.min(n, items.length) }, async (_, w) => {
    while (next < items.length) {
      const i = next++
      await fn(items[i], w)
    }
  })
  await Promise.all(workers)
}

async function main() {
  const t0 = Date.now()
  const opts = parseArgs(process.argv.slice(2))

  const scenarios = ALL_SCENARIOS.filter((s) => !opts.only.length || opts.only.some((t) => s.name.toLowerCase().includes(t.toLowerCase())))
  const jobs = []
  for (const s of scenarios) {
    for (const v of s.viewports || Object.keys(VIEWPORTS)) {
      if (!opts.viewports || opts.viewports.includes(v)) jobs.push({ scenario: s, viewport: v })
    }
  }
  if (opts.list) {
    for (const s of ALL_SCENARIOS) console.log(`${s.name}  [${(s.viewports || Object.keys(VIEWPORTS)).join(', ')}]`)
    return 0
  }
  if (!jobs.length) fail(`no scenario matches --only ${opts.only.join(',')} with these viewports (try --list)`)

  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-')
  const outDir = opts.out || path.join(OUT_ROOT, `run-${stamp}-${process.pid}-${crypto.randomBytes(2).toString('hex')}`)
  fs.mkdirSync(outDir, { recursive: true })
  const mode = opts.self ? 'self' : opts.target ? 'url' : 'build'
  const meta = { mode, legacyRef: LEGACY_REF, target: '', scope: opts.scope, startedAt: new Date(t0).toISOString(), outDir, checkpoints: 0, runs: jobs.length, ms: 0 }

  const legacyDir = extractLegacy(path.join(outDir, 'legacy'))
  let targetDir = null
  if (mode === 'self') targetDir = legacyDir
  else if (mode === 'build') {
    try {
      targetDir = await buildTarget(path.join(outDir, 'target'))
    } catch (e) {
      if (!(e instanceof TargetBuildError)) throw e
      meta.ms = Date.now() - t0
      meta.target = 'vite build'
      writeReports(outDir, { meta, buildError: e.message, totals: { checkpoints: 0, passed: 0, failed: 0 }, results: [] })
      console.error(`parity: target build failed\n${e.message}\n(report: ${path.relative(process.cwd(), outDir)}/report.json)`)
      return 2
    }
  }

  const servers = []
  const cleanup = async () => { await Promise.all(servers.map((s) => s.close())) }
  const legacyServer = await serveDir(legacyDir)
  servers.push(legacyServer)
  let targetUrl = opts.target
  if (!targetUrl) {
    const ts = await serveDir(targetDir) // a second server even for --self: separate origin, separate storage
    servers.push(ts)
    targetUrl = ts.url
  }
  meta.target = mode === 'build' ? `vite build (${path.relative(process.cwd(), targetDir)})` : targetUrl

  const portraitPng = makePortraitPng()
  // Each worker owns two browsers, one per app. Pages sharing a browser share its raster and
  // GPU state, and a full-page capture in one page can shift anti-aliasing in another.
  const browsers = []
  const launch = async () => {
    const b = await chromium.launch({ channel: 'chrome', headless: true, args: CHROME_ARGS })
    browsers.push(b)
    return b
  }
  const slots = new Map()
  const slot = (w) => {
    if (!slots.has(w)) slots.set(w, Promise.all([launch(), launch()]))
    return slots.get(w)
  }
  const stop = async (code) => {
    await Promise.all(browsers.map((b) => b.close().catch(() => {})))
    await cleanup()
    process.exit(code)
  }
  process.on('SIGINT', () => stop(130))

  // Warm the font cache once, so parallel pages never race the network.
  {
    const ctx = await (await slot(0))[0].newContext()
    await installAssetRoutes(ctx, portraitPng, WIKI_PATTERN)
    const page = await ctx.newPage()
    await page.goto(legacyServer.url, { waitUntil: 'load', timeout: 30000 }).catch(() => {})
    await page.evaluate(() => document.fonts.ready).catch(() => {})
    await ctx.close()
  }

  const results = []
  const imgRoot = path.join(outDir, 'img')
  let done = 0
  const tty = process.stderr.isTTY
  await pool(jobs, opts.workers, async (job, w) => {
    const [bl, bt] = await slot(w)
    const common = { scenario: job.scenario, viewportName: job.viewport, scope: opts.scope, portraitPng }
    const [legacy, target] = await Promise.all([
      runSession({ ...common, browser: bl, app: 'legacy', baseUrl: legacyServer.url }),
      runSession({ ...common, browser: bt, app: 'target', baseUrl: targetUrl }),
    ])
    const cps = compareJob({ scenario: job.scenario, viewport: job.viewport, legacy, target, scope: opts.scope, imgRoot, outDir, keepPassing: opts.keepPassing })
    for (const [k, cp] of cps.entries()) results.push({ order: [jobs.indexOf(job), k], scenario: job.scenario.name, viewport: job.viewport, ...cp })
    done++
    if (tty) process.stderr.write(`\r${done}/${jobs.length} runs`)
  })
  if (tty) process.stderr.write('\r\x1b[K')

  results.sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1])
  for (const r of results) delete r.order
  const failed = results.filter((r) => !r.ok)
  meta.checkpoints = results.length
  meta.ms = Date.now() - t0
  meta.fonts = fontStats()
  const totals = { checkpoints: results.length, passed: results.length - failed.length, failed: failed.length }
  writeReports(outDir, { meta, totals, results })

  printConsole(results, { verbose: opts.verbose })
  const rel = path.relative(process.cwd(), outDir) || '.'
  const scen = new Set(jobs.map((j) => j.scenario.name)).size
  const vps = new Set(jobs.map((j) => j.viewport)).size
  console.log(
    `parity ${failed.length ? 'FAILED' : 'passed'}: ${totals.passed}/${totals.checkpoints} checkpoints match ` +
      `(${scen} scenarios, ${vps} viewports, ${jobs.length} runs${opts.scope ? `, scope ${opts.scope.join(',')}` : ''}) in ${(meta.ms / 1000).toFixed(1)}s` +
      (failed.length ? ` — report: ${rel}/report.html` : ''),
  )
  if (!failed.length && !opts.keepPassing && !opts.out) {
    // nothing worth keeping except the report; drop the build and legacy copy
    fs.rmSync(path.join(outDir, 'target'), { recursive: true, force: true })
  }
  await Promise.all(browsers.map((b) => b.close().catch(() => {})))
  await cleanup()
  return failed.length ? 1 : 0
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error(`parity: harness error: ${e && e.stack ? e.stack : e}`)
    process.exit(2)
  },
)
