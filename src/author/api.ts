import { AUTHOR_ENDPOINT } from './protocol'
import type { AuthorContent, AuthorStatus, PublishResult } from './protocol'

async function call<T>(path: string, method: 'GET' | 'PUT' | 'POST', body?: unknown): Promise<T> {
  const response = await fetch(AUTHOR_ENDPOINT + path, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    // Lets a save that starts as the tab closes finish.
    keepalive: method === 'PUT',
  })
  const answer: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const reason = (answer as { error?: string } | null)?.error
    throw new Error(reason ?? `The dev server answered ${response.status}.`)
  }
  return answer as T
}

/** The dev server's author endpoints. They exist only while author mode is on. */
export interface AuthorApi {
  status(): Promise<AuthorStatus>
  /** Writes the content files. */
  save(content: AuthorContent): Promise<AuthorStatus>
  /** Commits the content files with this message and pushes. */
  publish(message: string): Promise<PublishResult>
}

export const authorApi: AuthorApi = {
  status: () => call('/status', 'GET'),
  save: (content) => call('/content', 'PUT', content),
  publish: (message) => call('/publish', 'POST', { message }),
}
