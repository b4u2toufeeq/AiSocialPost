"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LOCALES, TRANSLATIONS, type Locale } from "@/lib/i18n";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("locale");
    if (savedLocale === "ar" || savedLocale === "en") {
      setLocale(savedLocale);
    }
  }, []);

  const t = TRANSLATIONS[locale];

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    window.localStorage.setItem("locale", newLocale);
  };

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
    >
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-stretch justify-center p-8">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20">
          <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
            {LOCALES.map((localeCode) => (
              <Button
                key={localeCode}
                type="button"
                variant={localeCode === locale ? "secondary" : "outline"}
                onClick={() => handleLocaleChange(localeCode)}
              >
                {TRANSLATIONS[localeCode][localeCode === "ar" ? "arabic" : "english"]}
              </Button>
            ))}
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight">{t.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                {t.description}
              </p>
            </div>

            <Button type="button">{t.button}</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
