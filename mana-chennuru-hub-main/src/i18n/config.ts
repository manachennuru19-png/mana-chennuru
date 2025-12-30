import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import teTranslations from '../locales/te.json';

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
const language = savedLanguage === 'te' ? 'te' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      te: {
        translation: teTranslations,
      },
    },
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Save language preference to localStorage whenever it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;

