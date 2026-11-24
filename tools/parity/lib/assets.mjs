// Deterministic stand-ins for network assets: the wiki portrait PNG and a disk cache for Google Fonts.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import pngjs from 'pngjs'
import { CACHE_DIR, FONT_HOSTS } from './config.mjs'

const { PNG } = pngjs

/* 96x96 portrait placeholder: a fixed diagonal pattern, so loaded portraits are visible in screenshots. */
export function makePortraitPng() {
  const size = 96
  const png = new PNG({ width: size, height: size })
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      const band = Math.floor((x + y) / 12) % 2
      const inside = (x - 48) ** 2 + (y - 40) ** 2 < 26 ** 2 || (y > 66 && Math.abs(x - 48) < 34)
      png.data[i] = inside ? (band ? 214 : 160) : 0
      png.data[i + 1] = inside ? (band ? 182 : 120) : 0
      png.data[i + 2] = inside ? (band ? 120 : 70) : 0
      png.data[i + 3] = inside ? 255 : 0
    }
  }
  return PNG.sync.write(png)
}

/* Fonts: fetched once from the network, then replayed from tools/parity/out/.cache/fonts.
   Writes are atomic (tmp + rename), so concurrent runs can share the cache. */
const memory = new Map()
const failed = new Set()
const fontDir = path.join(CACHE_DIR, 'fonts')

function keyOf(url) {
  return crypto.createHash('sha1').update(url).digest('hex')
}

function readCached(url) {
  if (memory.has(url)) return memory.get(url)
  const k = keyOf(url)
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(fontDir, k + '.json'), 'utf8'))
    const body = fs.readFileSync(path.join(fontDir, k + '.bin'))
    const hit = { body, contentType: meta.contentType }
    memory.set(url, hit)
    return hit
  } catch {
    return null
  }
}

function writeCached(url, hit) {
  memory.set(url, hit)
  fs.mkdirSync(fontDir, { recursive: true })
  const k = keyOf(url)
  const tmp = `.${process.pid}.${crypto.randomBytes(4).toString('hex')}`
  fs.writeFileSync(path.join(fontDir, k + '.bin' + tmp), hit.body)
  fs.writeFileSync(path.join(fontDir, k + '.json' + tmp), JSON.stringify({ url, contentType: hit.contentType }))
  fs.renameSync(path.join(fontDir, k + '.bin' + tmp), path.join(fontDir, k + '.bin'))
  fs.renameSync(path.join(fontDir, k + '.json' + tmp), path.join(fontDir, k + '.json'))
}

const inflight = new Map()

async function fetchFont(route, url) {
  if (inflight.has(url)) return inflight.get(url)
  const p = (async () => {
    try {
      const resp = await route.fetch({ timeout: 15000 })
      if (!resp.ok()) throw new Error(`HTTP ${resp.status()}`)
      const hit = { body: await resp.body(), contentType: resp.headers()['content-type'] || 'application/octet-stream' }
      writeCached(url, hit)
      return hit
    } catch {
      failed.add(url)
      return null
    } finally {
      inflight.delete(url)
    }
  })()
  inflight.set(url, p)
  return p
}

export async function installAssetRoutes(context, portraitPng, wikiPattern) {
  await context.route(wikiPattern, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: portraitPng, headers: { 'access-control-allow-origin': '*' } }),
  )
  await context.route((u) => FONT_HOSTS.includes(u.hostname), async (route) => {
    const url = route.request().url()
    let hit = readCached(url)
    if (!hit && !failed.has(url)) hit = await fetchFont(route, url)
    if (!hit) return route.abort('internetdisconnected').catch(() => {})
    return route
      .fulfill({ status: 200, body: hit.body, contentType: hit.contentType, headers: { 'access-control-allow-origin': '*', 'cache-control': 'max-age=31536000' } })
      .catch(() => {})
  })
}

export function fontStats() {
  return { cached: memory.size, failed: [...failed] }
}
