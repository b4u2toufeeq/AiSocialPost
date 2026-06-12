"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useLocale } from "@/components/providers/locale-provider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  Add01Icon,
  Calendar01Icon,
  GalleryVerticalIcon,
  BubbleChatIcon,
  Analytics01Icon,
  UserIcon,
  Diamond01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

type NavSection = {
  label: string;
  items: { href: string; label: string; icon: typeof DashboardCircleIcon }[];
};

export default function DashboardSidebar({
  isCollapsed,
  onToggleCollapse,
  onNavClick,
}: {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const { locale, setLocale, t } = useLocale();

  const navSections: NavSection[] = [
    {
      label: "Main",
      items: [
        { href: "/dashboard", label: t.nav.dashboard, icon: DashboardCircleIcon },
        { href: "/compose", label: t.nav.compose, icon: Add01Icon },
        { href: "/calendar", label: t.nav.calendar, icon: Calendar01Icon },
        { href: "/media", label: t.nav.mediaLibrary, icon: GalleryVerticalIcon },
      ],
    },
    {
      label: "Automation",
      items: [
        { href: "/auto-reply", label: t.nav.autoReply, icon: BubbleChatIcon },
        { href: "/analytics", label: t.nav.analytics, icon: Analytics01Icon },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/accounts", label: t.nav.accounts, icon: UserIcon },
        { href: "/billing", label: t.nav.billing, icon: Diamond01Icon },
        { href: "/settings", label: t.nav.settings, icon: Settings01Icon },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Logo / Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        {!isCollapsed ? (
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
            AeroSocial Agent
          </span>
        ) : (
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mx-auto">
            SC
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus:outline-none transition-colors"
        >
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

      {/* Navigation Links with Section Groupings */}
      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            {!isCollapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavClick}
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
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer - Language + User Info + Plan */}
      <div className="border-t border-slate-200 dark:border-slate-800 px-3 py-3 space-y-3">
        {/* Language Switcher */}
        <button
          onClick={() => setLocale(locale === "en" ? "ar" : "en")}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 00-6-.371m0 0c-1.52 0-3-.18-4.5-.54m5.04-1.948a48.074 48.074 0 01-2.183 7.96m0 0a48.484 48.484 0 01-10.985-5.51m10.985 5.51l-4.907 4.907m4.907-4.907l4.907 4.907m-13.818-4.907L3 5.621m0 0a48.134 48.134 0 014.5-.369m0 0A48.583 48.583 0 0113.5 3"
            />
          </svg>
          {!isCollapsed && (
            <span>{locale === "en" ? "العربية" : "English"}</span>
          )}
        </button>

        {/* User Info + Plan Badge */}
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-850">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.firstName || user?.username || "User"}
              </p>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                {t.billing.freeTier}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
