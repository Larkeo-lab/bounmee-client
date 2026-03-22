import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import enTranslations from './messages/en.json';
import loTranslations from './messages/lo.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  lo: {
    translation: loTranslations,
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      // Prioritize localStorage, then fallback to navigator
      // URL-based detection will be handled by our routing system
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;