import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

export type Locale = "en" | "ar";

export type Translation = typeof en;

export const LOCALES: Locale[] = ["en", "ar"];

export const TRANSLATIONS: Record<Locale, Translation> = {
  en,
  ar,
};

