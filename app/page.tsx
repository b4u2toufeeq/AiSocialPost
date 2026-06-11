"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LOCALES, TRANSLATIONS, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/providers/locale-provider";
import Link from "next/link";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, router]);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  if (!isLoaded || userId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2"></div>
          <span className="text-xs text-slate-400">Loading Social Copilot...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"></div>

      <main className="w-full max-w-lg relative z-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl space-y-8">
          {/* Header language toggles */}
          <div className="flex justify-end gap-2">
            {LOCALES.map((localeCode) => (
              <Button
                key={localeCode}
                type="button"
                variant={localeCode === locale ? "secondary" : "outline"}
                className={`text-xs h-8 ${
                  localeCode === locale
                    ? "bg-slate-800 border-slate-700 text-slate-100"
                    : "border-slate-805 bg-transparent text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => handleLocaleChange(localeCode)}
              >
                {TRANSLATIONS[localeCode][localeCode === "ar" ? "arabic" : "english"]}
              </Button>
            ))}
          </div>

          {/* Hero Content */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              {t.description}
            </p>
          </div>

          {/* Auth call to action buttons */}
          <div className="flex flex-col gap-3">
            <Button
              render={<Link href="/sign-in" />}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold shadow-md py-6 rounded-2xl text-sm transition-all"
            >
              {locale === "ar" ? "تسجيل الدخول للبدء" : "Sign In to Get Started"}
            </Button>
            <Button
              render={<Link href="/sign-up" />}
              variant="outline"
              className="w-full border-slate-800 bg-transparent text-slate-300 hover:text-white hover:bg-slate-900 py-6 rounded-2xl text-sm transition-all"
            >
              {locale === "ar" ? "إنشاء حساب جديد" : "Create a New Account"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

