import { createI18n } from 'vue-i18n'
import en from './locales/en'

/** Every locale file has this shape. `abnormalities` and `notes` may be partial outside English. */
export type Messages = typeof en

export const DEFAULT_LOCALE = 'en'

// To add a language: copy locales/en.ts, translate it, type its default export
// as Messages, and add it to `messages` here.
export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { en },
})

type AuthoredSection = 'abnormalities' | 'notes'

/**
 * Text written by hand per classification code: a name or a note. It is read
 * exactly as written, without message syntax, so authors can type anything.
 * Falls back to English; undefined when there is none.
 */
export function authored(section: AuthoredSection, code: string): string | undefined {
  const { locale, getLocaleMessage } = i18n.global
  for (const tag of [locale.value, DEFAULT_LOCALE]) {
    const text = (getLocaleMessage(tag) as Messages)[section][code]
    if (typeof text === 'string') return text
  }
  return undefined
}
