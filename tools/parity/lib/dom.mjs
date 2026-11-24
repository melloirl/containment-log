// DOM structure: an in-page serialiser that applies the Parity contract's allowed
// differences, and a tree diff that reports readable paths.

/* Runs inside the page (passed to page.evaluate). Must be self-contained. */
export function serializeInPage({ roots, dropped, ignoredTags, alwaysComputed }) {
  const drop = new Set(dropped)
  const ignore = new Set(ignoredTags)

  function elementNode(el) {
    const tag = el.localName
    const node = { t: tag, a: {}, c: [], cv: {}, cs: {}, sp: [], k: [] }
    for (const attr of el.attributes) {
      const n = attr.name
      if (drop.has(n) || n.startsWith('data-v-') || n === 'class' || n === 'style') continue
      if ((tag === 'input' || tag === 'textarea') && (n === 'value' || n === 'checked')) continue
      node.a[n] = attr.value
    }
    node.c = [...el.classList].filter((c) => !/^data-v-/.test(c)).sort()
    const style = el.style
    const plain = new Set()
    if (style) {
      for (let i = 0; i < style.length; i++) {
        const p = style[i]
        if (p.startsWith('--')) node.cv[p] = style.getPropertyValue(p).trim()
        else plain.add(p)
      }
    }
    node.sp = [...plain].sort()
    const wanted = new Set([...plain, ...alwaysComputed])
    if (wanted.size) {
      const cs = getComputedStyle(el)
      for (const p of wanted) node.cs[p] = cs.getPropertyValue(p)
    }
    if (tag === 'input') {
      const type = (el.type || 'text').toLowerCase()
      if (type === 'checkbox' || type === 'radio') node.checked = el.checked
      else node.value = el.value
    } else if (tag === 'textarea') {
      node.value = el.value
      return node // its text children are the default value, not content
    } else if (tag === 'select') {
      node.value = el.value
    }
    node.k = childrenOf(el)
    return node
  }

  function childrenOf(parent) {
    const out = []
    let text = ''
    const flush = () => {
      const t = text.replace(/\s+/g, ' ')
      if (t.trim()) out.push(t)
      text = ''
    }
    const walk = (p) => {
      for (const n of p.childNodes) {
        if (n.nodeType === 3) text += n.data
        else if (n.nodeType === 1) {
          const tag = n.localName
          if (ignore.has(tag) || n.hasAttribute('hidden')) continue
          if (n.id === 'app' && tag === 'div') { walk(n); continue } // unwrap the Vue mount point
          flush()
          out.push(elementNode(n))
        }
        // comments and processing instructions are dropped
      }
    }
    walk(parent)
    flush()
    return out
  }

  if (!roots) return { whole: { t: 'body', a: {}, c: [], cv: {}, cs: {}, sp: [], k: childrenOf(document.body) } }
  const result = {}
  for (const [name, sel] of Object.entries(roots)) {
    const el = document.querySelector(sel)
    result[name] = el && !el.hasAttribute('hidden') ? elementNode(el) : null
  }
  return result
}

/* ---------- diff (Node side) ---------- */

function label(node, index, siblings) {
  if (typeof node === 'string') return '#text'
  let s = node.t + (node.c.length ? '.' + node.c.join('.') : '')
  if (node.a['data-code'] != null) return `${s}[data-code="${node.a['data-code']}"]`
  const same = siblings.filter((n) => typeof n !== 'string' && n.t === node.t && n.c.join() === node.c.join())
  if (same.length > 1) s += `[${same.indexOf(node)}]`
  return s
}

function keyOf(node) {
  if (typeof node === 'string') return '#text'
  return node.a['data-code'] != null ? `${node.t}@${node.a['data-code']}` : node.t
}

/* Longest common subsequence on child keys, so one missing tile does not shift every later one. */
function align(a, b) {
  const ka = a.map(keyOf)
  const kb = b.map(keyOf)
  const n = ka.length
  const m = kb.length
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = ka[i] === kb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  const ops = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (ka[i] === kb[j]) ops.push(['pair', i++, j++])
    else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push(['del', i++, -1])
    else ops.push(['add', -1, j++])
  }
  while (i < n) ops.push(['del', i++, -1])
  while (j < m) ops.push(['add', -1, j++])
  return ops
}

const q = (v) => (v === undefined ? '(none)' : JSON.stringify(v))
const short = (s, n = 70) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

function compareNodes(L, T, path, out) {
  if (typeof L === 'string' || typeof T === 'string') {
    if (L !== T) out.push(`${path}: text ${q(short(String(L)))} → target ${q(short(String(T)))}`)
    return
  }
  const cl = new Set(L.c)
  const ct = new Set(T.c)
  const plus = T.c.filter((c) => !cl.has(c)).map((c) => '+' + c)
  const minus = L.c.filter((c) => !ct.has(c)).map((c) => '-' + c)
  if (plus.length || minus.length) out.push(`${path}: class ${[...minus, ...plus].join(' ')}`)

  const names = new Set([...Object.keys(L.a), ...Object.keys(T.a)])
  for (const n of [...names].sort()) {
    if (L.a[n] !== T.a[n]) out.push(`${path}: [${n}] ${q(L.a[n])} → target ${q(T.a[n])}`)
  }
  const vars = new Set([...Object.keys(L.cv), ...Object.keys(T.cv)])
  for (const v of [...vars].sort()) {
    if (L.cv[v] !== T.cv[v]) out.push(`${path}: style ${v} ${q(L.cv[v])} → target ${q(T.cv[v])}`)
  }
  for (const p of new Set([...L.sp, ...T.sp])) {
    if (L.cs[p] === undefined || T.cs[p] === undefined || L.cs[p] !== T.cs[p]) {
      out.push(`${path}: inline ${p} computes to ${q(L.cs[p])} → target ${q(T.cs[p])}`)
    }
  }
  if (L.value !== T.value) out.push(`${path}: value ${q(L.value && short(L.value))} → target ${q(T.value && short(T.value))}`)
  if (L.checked !== T.checked) out.push(`${path}: checked ${q(L.checked)} → target ${q(T.checked)}`)

  for (const [op, i, j] of align(L.k, T.k)) {
    if (op === 'pair') {
      const child = L.k[i]
      const step = typeof child === 'string' ? `#text` : label(child, i, L.k)
      compareNodes(child, T.k[j], `${path} > ${step}`, out)
    } else if (op === 'del') {
      const c = L.k[i]
      out.push(`${path} > ${label(c, i, L.k)}: missing in target${typeof c === 'string' ? ' ' + q(short(c)) : ''}`)
    } else {
      const c = T.k[j]
      out.push(`${path} > ${label(c, j, T.k)}: only in target${typeof c === 'string' ? ' ' + q(short(c)) : ''}`)
    }
  }
}

/* Returns { count, diffs: [first N lines] } */
export function diffTrees(L, T, rootPath, max) {
  const out = []
  if (!L && !T) return { count: 0, diffs: [] }
  if (!L || !T) return { count: 1, diffs: [`${rootPath}: ${L ? 'missing in target' : 'only in target'}`] }
  if (L.t !== T.t) return { count: 1, diffs: [`${rootPath}: tag <${L.t}> → target <${T.t}>`] }
  compareNodes(L, T, rootPath, out)
  return { count: out.length, diffs: out.slice(0, max) }
}

export function rootLabel(node) {
  if (!node) return '?'
  return node.t + (node.c.length ? '.' + node.c.join('.') : '')
}
