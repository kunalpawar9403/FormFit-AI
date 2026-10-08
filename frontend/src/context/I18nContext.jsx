import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../constants/translations.js';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('formfit_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('formfit_lang', lang);
  }, [lang]);

  const t = (key) => {
    const dict = translations[lang] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  const cycleLang = () => {
    const order = ['en', 'hi', 'mr'];
    const idx = order.indexOf(lang);
    setLang(order[(idx + 1) % order.length]);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, cycleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
