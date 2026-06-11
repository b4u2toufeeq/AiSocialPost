"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

const platforms = [
  "Instagram", "Twitter / X", "LinkedIn", "Facebook",
  "TikTok", "YouTube", "Pinterest", "Threads",
  "Bluesky", "Mastodon", "Telegram",
];

export default function HeroSection() {
  const { locale, t } = useLocale();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7c6ff7]/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-gradient-to-r from-transparent via-[#7c6ff7]/5 to-transparent blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-[fadeIn_0.8s_ease-out]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-400 mb-6">
            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            AI-Powered Social Media Management
          </div>
        </div>

        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-[fadeIn_0.8s_ease-out_0.15s_both] ${
            locale === "ar" ? "leading-[1.3]" : ""
          }`}
        >
          <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
            {t.landing.hero.title}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 animate-[fadeIn_0.8s_ease-out_0.3s_both]">
          {t.landing.hero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-[fadeIn_0.8s_ease-out_0.45s_both]">
          <Button
            render={<Link href="/sign-up" />}
            className="bg-[#7c6ff7] hover:bg-[#6b5ee6] text-white px-8 py-4 text-sm rounded-xl w-full sm:w-auto"
          >
            {t.landing.hero.ctaPrimary}
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 px-8 py-4 text-sm rounded-xl w-full sm:w-auto"
          >
            <HugeiconsIcon icon={PlayIcon} size={16} />
            {t.landing.hero.ctaSecondary}
          </Button>
        </div>

        <div className="animate-[fadeIn_0.8s_ease-out_0.6s_both]">
          <p className="text-xs text-zinc-500 mb-4">
            {t.landing.platformStrip.title}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {platforms.map((name) => (
              <span
                key={name}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20 transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
