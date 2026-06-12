"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import DashboardSidebar from "@/components/dashboard/sidebar";
import DashboardTopbar from "@/components/dashboard/topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useLocale();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse on medium screens (md: 768px-1023px)
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsCollapsed(e.matches);
    };
    handleChange(mql);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-1 relative overflow-hidden">
        {/* MOBILE SHEET DRAWER */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side={locale === "ar" ? "right" : "left"}
            className="w-64 p-0 border-slate-200 dark:border-slate-800"
            showCloseButton={false}
          >
            <DashboardSidebar
              isCollapsed={false}
              onToggleCollapse={() => {}}
              onNavClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* DESKTOP SIDEBAR - hidden on mobile */}
        <aside
          className={`hidden md:flex flex-col border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-25 shrink-0 ${
            locale === "ar" ? "border-l" : "border-r"
          } ${isCollapsed ? "w-20" : "w-64"}`}
        >
          <DashboardSidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-safe">
          <DashboardTopbar onMenuToggle={() => setMobileOpen(true)} />

          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
