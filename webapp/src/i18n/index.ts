import { createI18n } from 'vue-i18n'
import * as en from './en'
import * as ru from './ru'

export const messages = {
  en,
  ru,
}

const instance = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export default instance
