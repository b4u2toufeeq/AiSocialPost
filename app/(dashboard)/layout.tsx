"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { useLocale } from "@/components/providers/locale-provider";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  Calendar01Icon,
  Settings01Icon,
  Analytics01Icon,
  BubbleChatIcon,
  Add01Icon,
  UserIcon
} from "@hugeicons/core-free-icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { locale, setLocale, t } = useLocale();
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Nav items configuration
  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, icon: DashboardCircleIcon },
    { href: "/compose", label: t.nav.compose, icon: Add01Icon },
    { href: "/calendar", label: t.nav.calendar, icon: Calendar01Icon },
    { href: "/accounts", label: t.nav.accounts, icon: UserIcon },
    { href: "/auto-reply", label: t.nav.autoReply, icon: BubbleChatIcon },
    { href: "/analytics", label: t.nav.analytics, icon: Analytics01Icon },
    { href: "/settings", label: t.nav.settings, icon: Settings01Icon },
  ];

  // Mock billing details
  const postLimit = 10;
  const currentScheduled = 3;
  const usagePercentage = (currentScheduled / postLimit) * 100;

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "ar" : "en");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-1 relative overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-25 shrink-0 ${
            locale === "ar" ? "border-l" : "border-r"
          } ${isCollapsed ? "w-20" : "w-64"}`}
        >
          {/* Logo / Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
            {!isCollapsed && (
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
                Social Copilot
              </span>
            )}
            {isCollapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mx-auto">
                SC
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus:outline-none transition-colors"
            >
              {/* Custom arrow/collapse icon depending on state and dir */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-5 h-5 transition-transform duration-300 ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group duration-200 ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-450 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                  } ${isCollapsed ? "justify-center px-0" : ""}`}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    strokeWidth={2}
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer - Usage and Upgrade */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            {!isCollapsed ? (
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {t.billing.freeTier}
                    </span>
                    <span className="text-slate-400">
                      {currentScheduled}/{postLimit}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${usagePercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {t.stats.usageMeter.replace("{count}", String(currentScheduled)).replace("{max}", String(postLimit))}
                  </p>
                </div>
                <Button className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-650 hover:to-pink-650 text-white font-medium shadow-md transition-all rounded-xl py-2 text-xs">
                  {t.billing.upgrade}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-500">
                  3/10
                </div>
                <Button className="w-8 h-8 p-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 text-white flex items-center justify-center shadow-md">
                  🚀
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-0">
          {/* TOPBAR */}
          <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-20 transition-colors">
            {/* Topbar Left - Greeting / Welcome */}
            <div>
              <h1 className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200">
                {user ? (
                  `${locale === "ar" ? "مرحباً بك،" : "Welcome back,"} ${user.firstName || user.username || ""}`
                ) : (
                  "Welcome back"
                )}
              </h1>
            </div>

            {/* Topbar Right - Actions & Controls */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
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
                <span>{locale === "en" ? "العربية" : "English"}</span>
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                    />
                  </svg>
                )}
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

          {/* MAIN PAGE SLOTS */}
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 pb-safe z-30 shadow-lg">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <HugeiconsIcon
                icon={item.icon}
                strokeWidth={2}
                className={`w-5 h-5 mb-0.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {/* Mobile Settings Shortcut */}
        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
            pathname === "/settings" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <HugeiconsIcon
            icon={Settings01Icon}
            strokeWidth={2}
            className={`w-5 h-5 mb-0.5 ${pathname === "/settings" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
          />
          <span>{t.nav.settings}</span>
        </Link>
      </nav>
    </div>
  );
}
