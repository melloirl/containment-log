// Producing the two apps: the legacy file from git, the target from a Vite build.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { LEGACY_REF, REPO_ROOT } from './config.mjs'

export function extractLegacy(dir) {
  fs.mkdirSync(dir, { recursive: true })
  const html = execFileSync('git', ['show', LEGACY_REF], {
    cwd: REPO_ROOT,
    maxBuffer: 64 * 1024 * 1024,
  })
  fs.writeFileSync(path.join(dir, 'index.html'), html)
  return dir
}

export class TargetBuildError extends Error {}

export async function buildTarget(outDir) {
  const { build } = await import('vite')
  try {
    await build({
      root: REPO_ROOT,
      configFile: path.join(REPO_ROOT, 'vite.config.ts'),
      logLevel: 'silent',
      clearScreen: false,
      build: {
        outDir,
        emptyOutDir: true,
        reportCompressedSize: false,
        // keep the original asset names readable in failures; no effect on output behaviour
        sourcemap: false,
      },
    })
  } catch (err) {
    const parts = [err?.message || String(err)]
    if (err?.id) parts.push(`  in ${err.id}`)
    if (err?.frame) parts.push(err.frame)
    throw new TargetBuildError(parts.join('\n'))
  }
  if (!fs.existsSync(path.join(outDir, 'index.html'))) {
    throw new TargetBuildError(`Vite finished but wrote no index.html to ${outDir}`)
  }
  return outDir
}
