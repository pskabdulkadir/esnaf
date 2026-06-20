import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import trTranslations from '../../public/locales/tr.json';
import enTranslations from '../../public/locales/en.json';
import deTranslations from '../../public/locales/de.json';

const resources = {
  tr: { translation: trTranslations },
  en: { translation: enTranslations },
  de: { translation: deTranslations }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('app_language') || 'tr',
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
