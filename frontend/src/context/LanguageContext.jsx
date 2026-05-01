import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Charger la langue depuis le localStorage ou utiliser FR par défaut
  const [language, setLanguage] = useState(localStorage.getItem('kandjou_lang') || 'FR');

  useEffect(() => {
    localStorage.setItem('kandjou_lang', language);
    // Optionnel: Mettre à jour la direction du texte pour l'arabe/n'ko
    document.dir = (language === 'AR' || language === 'NK') ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['FR']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
