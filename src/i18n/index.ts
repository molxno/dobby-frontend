import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';

/**
 * Extracts the base language from a locale string.
 * e.g. 'es-CO' → 'es', 'en-US' → 'en'
 */
export function localeToLang(locale: string): string {
  const base = locale.split('-')[0];
  return base === 'en' ? 'en' : 'es'; // fallback to 'es' for any non-English
}

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
