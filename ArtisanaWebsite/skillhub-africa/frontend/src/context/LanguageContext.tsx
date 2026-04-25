"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";

type Language = "en" | "fr";
type Dictionary = typeof en; // Refreshed dictionary type

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("app_language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "fr")) {
      setLanguage(savedLang);
    }
    setMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_language", lang);
  };

  const t = language === "fr" ? (fr as Dictionary) : en;

  // Render children immediately to avoid hydration mismatch, but return early if not mounted if needed.
  // We just let the default "en" render on server, then snap to "fr" on client if needed.
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      <div>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
