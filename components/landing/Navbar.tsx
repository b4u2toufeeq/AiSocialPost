"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { LOCALES } from "@/lib/i18n";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

const navLinks = [
  { key: "features", href: "#features" },
  { key: "howItWorks", href: "#how-it-works" },
  { key: "pricing", href: "#pricing" },
  { key: "faq", href: "#faq" },
];

export default function Navbar() {
  const { locale, setLocale, t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="font-bold text-base text-white hidden sm:inline">
              Social Copilot
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {t.landing.nav[link.key as keyof typeof t.landing.nav] as string}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {LOCALES.map((lc) => (
                <button
                  key={lc}
                  type="button"
                  onClick={() => setLocale(lc)}
                  className={`text-xs px-2 py-1 rounded-md transition-colors ${
                    locale === lc
                      ? "bg-white/10 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {lc === "ar" ? "ع" : "EN"}
                </button>
              ))}
            </div>

            <Button
              render={<Link href="/sign-in" />}
              variant="ghost"
              className="hidden sm:inline-flex text-zinc-300 hover:text-white"
            >
              {t.landing.nav.signIn}
            </Button>

            <Button
              render={<Link href="/sign-up" />}
              className="bg-[#7c6ff7] hover:bg-[#6b5ee6] text-white hidden sm:inline-flex"
            >
              {t.landing.nav.getStarted}
            </Button>

            <button
              type="button"
              className="md:hidden text-zinc-300"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <HugeiconsIcon
                icon={mobileOpen ? Cancel01Icon : Menu01Icon}
                size={24}
              />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0f]">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {t.landing.nav[link.key as keyof typeof t.landing.nav] as string}
              </a>
            ))}
            <div className="pt-2 flex gap-2">
              <Button
                render={<Link href="/sign-in" />}
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300"
              >
                {t.landing.nav.signIn}
              </Button>
              <Button
                render={<Link href="/sign-up" />}
                className="flex-1 bg-[#7c6ff7] hover:bg-[#6b5ee6] text-white"
              >
                {t.landing.nav.getStarted}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
