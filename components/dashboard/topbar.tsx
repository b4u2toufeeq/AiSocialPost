"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { useLocale } from "@/components/providers/locale-provider";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";

const pageTitleKeys: Record<string, string> = {
  "/dashboard": "dashboard",
  "/compose": "compose",
  "/calendar": "calendar",
  "/media": "mediaLibrary",
  "/accounts": "accounts",
  "/auto-reply": "autoReply",
  "/analytics": "analytics",
  "/billing": "billing",
  "/settings": "settings",
};

export default function DashboardTopbar({
  onMenuToggle,
}: {
  onMenuToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { locale, setLocale, t } = useLocale();
  const { theme, setTheme } = useTheme();

  const pageTitle = pageTitleKeys[pathname]
    ? (t.pages as Record<string, string>)[pageTitleKeys[pathname]]
    : "Dashboard";

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-20 transition-colors">
      {/* Topbar Left */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h1 className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
          {pageTitle}
        </h1>
      </div>

      {/* Topbar Right */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Language Switcher */}
        <button
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          title="Switch Language / تغيير اللغة"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 00-6-.371m0 0c-1.52 0-3-.18-4.5-.54m5.04-1.948a48.074 48.074 0 01-2.183 7.96m0 0a48.484 48.484 0 01-10.985-5.51m10.985 5.51l-4.907 4.907m4.907-4.907l4.907 4.907m-13.818-4.907L3 5.621m0 0a48.134 48.134 0 014.5-.369m0 0A48.583 48.583 0 0113.5 3"
            />
          </svg>
          <span className="hidden sm:inline">{locale === "en" ? "العربية" : "English"}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-455"
          title="Toggle Theme"
        >
          <span className="sr-only">Toggle Theme</span>
          {theme === "dark" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-455"
          title="Notifications"
        >
          <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Compose Shortcut */}
        <button
          onClick={() => router.push("/compose")}
          className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-700 text-white font-medium text-xs transition-colors shadow-xs"
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2.5} className="w-3.5 h-3.5" />
          <span>{t.composer.title}</span>
        </button>

        {/* Clerk User Button */}
        <div className="flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
