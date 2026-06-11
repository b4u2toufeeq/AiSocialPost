"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { LOCALES, TRANSLATIONS, type Locale, type Translation } from "@/lib/i18n";

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translation;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("locale");
    if (savedLocale === "ar" || savedLocale === "en") {
      setLocaleState(savedLocale);
    }
  }, []);

  useEffect(() => {
    // Dynamically set lang and dir on the <html> element
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    window.localStorage.setItem("locale", newLocale);
  };

  const t = TRANSLATIONS[locale];

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
