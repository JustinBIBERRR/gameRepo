import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import en from './en.json'

const LOCALE_KEY = 'app-locale'
const SUPPORTED_LOCALES = ['zh-CN', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export function getSavedLocale(): SupportedLocale | null {
  try {
    const saved = localStorage.getItem(LOCALE_KEY)
    if (saved && SUPPORTED_LOCALES.includes(saved as SupportedLocale)) {
      return saved as SupportedLocale
    }
  } catch (_) {}
  return null
}

export function setSavedLocale(locale: string): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale)
  } catch (_) {}
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale() ?? 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    en
  }
})

export default i18n
