// Screenshot comparison: exact fast path, then pixelmatch for the count, the bounding box and a diff image.
import pixelmatch from 'pixelmatch'
import pngjs from 'pngjs'
import { PIXEL_INCLUDE_AA, PIXEL_THRESHOLD } from './config.mjs'

const { PNG } = pngjs

function pad(png, w, h) {
  if (png.width === w && png.height === h) return png.data
  const out = Buffer.alloc(w * h * 4)
  for (let i = 0; i < out.length; i += 4) { out[i] = 255; out[i + 1] = 0; out[i + 2] = 255; out[i + 3] = 255 }
  for (let y = 0; y < png.height; y++) {
    png.data.copy(out, y * w * 4, y * png.width * 4, (y + 1) * png.width * 4)
  }
  return out
}

export const decode = (buf) => PNG.sync.read(buf)
export const encode = (img) => PNG.sync.write(Object.assign(new PNG({ width: img.width, height: img.height }), { data: img.data }))

/* Region rectangle (CSS px, page coordinates) cut out of a decoded full-page image. */
export function crop(img, box) {
  const x0 = Math.max(0, Math.floor(box.x))
  const y0 = Math.max(0, Math.floor(box.y))
  const x1 = Math.min(img.width, Math.ceil(box.x + box.width))
  const y1 = Math.min(img.height, Math.ceil(box.y + box.height))
  const width = Math.max(0, x1 - x0)
  const height = Math.max(0, y1 - y0)
  const data = Buffer.alloc(width * height * 4)
  for (let y = 0; y < height; y++) img.data.copy(data, y * width * 4, ((y0 + y) * img.width + x0) * 4, ((y0 + y) * img.width + x1) * 4)
  return { width, height, data }
}

/* Compares two decoded images. Returns null when identical, else { reason, pixels, bbox, diff }. */
export function compareImages(L, T) {
  const sameSize = L.width === T.width && L.height === T.height
  if (sameSize && L.data.equals(T.data)) return null
  const w = Math.max(L.width, T.width)
  const h = Math.max(L.height, T.height)
  if (!w || !h) return { reason: `size ${L.width}x${L.height} → target ${T.width}x${T.height}`, pixels: 0, bbox: null, diff: null }
  const a = pad(L, w, h)
  const b = pad(T, w, h)
  const diff = { width: w, height: h, data: Buffer.alloc(w * h * 4) }
  const pixels = pixelmatch(a, b, diff.data, w, h, { threshold: PIXEL_THRESHOLD, includeAA: PIXEL_INCLUDE_AA, alpha: 0.15 })
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  const bbox = x1 < 0 ? null : { x: x0, y: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }
  const reason = sameSize
    ? `${pixels} px differ, within x=${bbox.x} y=${bbox.y} ${bbox.width}x${bbox.height}`
    : `size ${L.width}x${L.height} → target ${T.width}x${T.height}` + (bbox ? ` (first difference at y=${bbox.y})` : '')
  return { reason, pixels, bbox, diff }
}
