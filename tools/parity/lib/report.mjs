// Console summary, report.json and report.html.
import fs from 'node:fs'
import path from 'node:path'

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export function failureLines(r, { verbose }) {
  const lines = []
  for (const f of r.failures) {
    const tag = f.kind === 'pixels' ? f.region : f.region ? `${f.kind} ${f.region}` : f.kind
    lines.push(`${r.scenario} / ${r.viewport} / ${r.name} / ${tag}: ${f.reason}`)
    if (verbose && f.details) for (const d of f.details) lines.push(`    ${d}`)
  }
  return lines
}

export function printConsole(results, { verbose, limit = 150 }) {
  const failing = results.filter((r) => !r.ok)
  let printed = 0
  let hidden = 0
  for (const r of failing) {
    for (const line of failureLines(r, { verbose })) {
      if (verbose || printed < limit) { console.log(line); printed++ } else hidden++
    }
  }
  if (hidden) console.log(`… ${hidden} more failure lines (see report.html, or run with --verbose)`)
}

export function writeReports(outDir, report) {
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
  fs.writeFileSync(path.join(outDir, 'report.html'), html(report))
}

function html(report) {
  const failing = report.results.filter((r) => !r.ok)
  const kept = report.results.filter((r) => r.ok && r.images && Object.keys(r.images).length)
  const head = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Parity report</title><style>
:root{--bg:#fff;--fg:#1b1b1b;--muted:#666;--line:#ddd;--bad:#b3261e;--ok:#1e7a3a;--code:#f5f5f5}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#e8e8e8;--muted:#9a9a9a;--line:#333;--bad:#ff8a80;--ok:#7bd88f;--code:#1f1f1f}}
body{margin:0;padding:16px;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,sans-serif}
h1{font-size:20px;margin:0 0 4px}h2{font-size:15px;margin:28px 0 6px;padding-top:12px;border-top:1px solid var(--line)}
.meta{color:var(--muted)}.bad{color:var(--bad)}.ok{color:var(--ok)}
.f{margin:8px 0}.f b{font-weight:600}
pre{background:var(--code);padding:8px;overflow:auto;white-space:pre-wrap;word-break:break-word;margin:4px 0;font-size:12px}
.imgs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:6px 0}
.imgs figure{margin:0}.imgs figcaption{color:var(--muted);font-size:12px}
.imgs img{max-width:100%;border:1px solid var(--line);display:block;background:repeating-conic-gradient(#8883 0 25%,transparent 0 50%) 0 0/16px 16px}
nav a{display:block;color:inherit}
@media (max-width:700px){.imgs{grid-template-columns:1fr}}
</style></head><body>`
  const m = report.meta
  let body = `<h1>Parity report</h1><p class="meta">${esc(m.mode)} · target ${esc(m.target)} · ${m.checkpoints} checkpoints in ${m.runs} runs · ${(m.ms / 1000).toFixed(1)}s · ${esc(m.startedAt)}${m.scope ? ' · scope ' + esc(m.scope.join(', ')) : ''}</p>`
  if (report.buildError) body += `<h2 class="bad">Target build failed</h2><pre>${esc(report.buildError)}</pre>`
  body += failing.length ? `<p class="bad">${failing.length} failing checkpoints</p>` : `<p class="ok">All checkpoints match.</p>`
  if (failing.length > 1) {
    body += `<nav>${failing.map((r, i) => `<a href="#f${i}">${esc(`${r.scenario} / ${r.viewport} / ${r.name}`)} <span class="meta">(${r.failures.map((f) => f.region || f.kind).join(', ')})</span></a>`).join('')}</nav>`
  }
  const block = (r, i, idPrefix) => {
    let s = `<h2 id="${idPrefix}${i}">${esc(`${r.scenario} / ${r.viewport} / ${r.name}`)}</h2>`
    for (const f of r.failures) {
      s += `<div class="f"><b class="bad">${esc(f.kind)}${f.region ? ' · ' + esc(f.region) : ''}</b>: ${esc(f.reason)}`
      if (f.images) s += imgs(f.images)
      if (f.details?.length) s += `<pre>${esc(f.details.join('\n'))}</pre>`
      s += '</div>'
    }
    if (r.images) for (const [shot, im] of Object.entries(r.images)) if (!r.failures.some((f) => f.region === shot)) s += `<div class="f"><b>${esc(shot)}</b>${imgs(im)}</div>`
    return s
  }
  body += failing.map((r, i) => block(r, i, 'f')).join('')
  if (kept.length) body += `<h2>Passing checkpoints (kept)</h2>` + kept.map((r, i) => block(r, i, 'p')).join('')
  return head + body + '</body></html>'
}

function imgs(im) {
  const fig = (label, src) => (src ? `<figure><figcaption>${label}</figcaption><a href="${esc(src)}"><img loading="lazy" src="${esc(src)}" alt="${label}"></a></figure>` : '<figure></figure>')
  return `<div class="imgs">${fig('legacy', im.legacy)}${fig('target', im.target)}${fig('diff', im.diff)}</div>`
}
