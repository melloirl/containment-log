// Author mode's half of the dev server: writes the two content files and
// publishes them with git. It is never part of a build.
import { execFile } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import type { IncomingMessage } from 'node:http'
import path from 'node:path'
import { promisify } from 'node:util'
import type { Plugin } from 'vite'
import { AUTHOR_ENDPOINT } from '../src/author/protocol.ts'
import type { AuthorContent, AuthorStatus, Change, PublishResult } from '../src/author/protocol.ts'

const run = promisify(execFile)

const ENTRIES_FILE = 'src/content/entries.json'
const NOTES_FILE = 'src/i18n/locales/en.notes.json'
const FILES = [ENTRIES_FILE, NOTES_FILE]

class Refusal extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message)
  }
}

type Json = Record<string, unknown>

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function isContent(value: unknown): value is AuthorContent {
  return (
    isObject(value) &&
    isObject(value.entries) &&
    isObject(value.notes) &&
    Object.values(value.entries).every((entry) => isObject(entry) && typeof entry.logged === 'string') &&
    Object.values(value.notes).every((note) => typeof note === 'string')
  )
}

async function body(request: IncomingMessage): Promise<unknown> {
  let text = ''
  for await (const chunk of request) {
    text += chunk
    if (text.length > 4_000_000) throw new Refusal(413, 'That is too much content.')
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Refusal(400, 'The request was not JSON.')
  }
}

export function authoring(): Plugin {
  let root = process.cwd()

  async function git(...args: string[]): Promise<string> {
    try {
      const { stdout } = await run('git', args, {
        cwd: root,
        timeout: 60_000,
        // Fail instead of waiting at a prompt nobody can see.
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      })
      return stdout.trim()
    } catch (cause) {
      const { stderr, message } = cause as { stderr?: string; message: string }
      throw new Refusal(500, `git ${args[0]} failed: ${(stderr || message).trim()}`)
    }
  }

  const parse = (text: string): Json => {
    const value: unknown = JSON.parse(text)
    return isObject(value) ? value : {}
  }
  const onDisk = async (file: string): Promise<Json> =>
    readFile(path.join(root, file), 'utf8').then(parse, () => ({}))
  const atHead = async (file: string): Promise<Json> => git('show', `HEAD:./${file}`).then(parse, () => ({}))

  /** Abnormalities whose entry or note differs between the files and the last commit. */
  async function changes(): Promise<Change[]> {
    const [entries, notes, oldEntries, oldNotes] = await Promise.all([
      onDisk(ENTRIES_FILE),
      onDisk(NOTES_FILE),
      atHead(ENTRIES_FILE),
      atHead(NOTES_FILE),
    ])
    const out: Change[] = []
    for (const code of new Set([...Object.keys(oldEntries), ...Object.keys(entries)])) {
      if (!(code in oldEntries)) out.push({ code, kind: 'added' })
      else if (!(code in entries)) out.push({ code, kind: 'removed' })
      else if (
        JSON.stringify(entries[code]) !== JSON.stringify(oldEntries[code]) ||
        notes[code] !== oldNotes[code]
      ) {
        out.push({ code, kind: 'updated' })
      }
    }
    return out
  }

  async function status(): Promise<AuthorStatus> {
    const [branch, remote, unpushed, changed] = await Promise.all([
      git('rev-parse', '--abbrev-ref', 'HEAD'),
      git('remote', 'get-url', 'origin').catch(() => ''),
      // No upstream yet: nothing to count.
      git('rev-list', '--count', '@{upstream}..HEAD').catch(() => '0'),
      changes(),
    ])
    const github = /github\.com[:/](.+?)(?:\.git)?$/.exec(remote)
    return {
      branch,
      repo: github ? `https://github.com/${github[1]}` : null,
      changes: changed,
      unpushed: Number(unpushed) || 0,
    }
  }

  async function save(content: unknown): Promise<AuthorStatus> {
    if (!isContent(content)) throw new Refusal(400, 'That is not the shape of the content files.')
    const write = (file: string, data: unknown): Promise<void> =>
      writeFile(path.join(root, file), JSON.stringify(data, null, 2) + '\n')
    await Promise.all([write(ENTRIES_FILE, content.entries), write(NOTES_FILE, content.notes)])
    return status()
  }

  /** Commits the content files, and only those, then pushes the branch. */
  async function publish(request: unknown): Promise<PublishResult> {
    const message = isObject(request) && typeof request.message === 'string' ? request.message.trim() : ''
    if ((await changes()).length) {
      if (!message) throw new Refusal(400, 'A commit needs a message.')
      await git('add', '--', ...FILES)
      await git('commit', '-m', message, '--', ...FILES)
    }
    await git('push')
    return { commit: await git('rev-parse', '--short', 'HEAD'), status: await status() }
  }

  async function answer(request: IncomingMessage): Promise<unknown> {
    // Only this page may ask: another site open in the browser must not be able to write or push.
    const site = request.headers['sec-fetch-site']
    if (site !== undefined && site !== 'same-origin') throw new Refusal(403, 'Not from this page.')

    const route = `${request.method} ${request.url?.split('?')[0]}`
    if (route === 'GET /status') return status()
    if (route === 'PUT /content') return save(await body(request))
    if (route === 'POST /publish') return publish(await body(request))
    throw new Refusal(404, 'No such author endpoint.')
  }

  return {
    name: 'containment-log:author',
    apply: 'serve',

    configResolved(config) {
      root = config.root
    },

    configureServer(server) {
      server.middlewares.use(AUTHOR_ENDPOINT, (request, response) => {
        const send = (code: number, value: unknown): void => {
          response.statusCode = code
          response.setHeader('content-type', 'application/json')
          response.end(JSON.stringify(value))
        }
        answer(request).then(
          (value) => send(200, value),
          (cause: unknown) =>
            send(cause instanceof Refusal ? cause.code : 500, {
              error: cause instanceof Error ? cause.message : String(cause),
            }),
        )
      })
    },

    // The page already shows what it just saved. Reloading it would drop the
    // cursor out of the note being typed.
    handleHotUpdate({ file }) {
      if (FILES.some((name) => file === path.join(root, name))) return []
    },
  }
}
