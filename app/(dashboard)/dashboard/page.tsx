"use client";

import { useLocale } from "@/components/providers/locale-provider";

export default function DashboardPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t.nav.dashboard}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.description}</p>
      </div>
      
      {/* Premium Dashboard Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t.stats.totalPosts}
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">12</div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t.stats.scheduled}
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">3</div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t.stats.activeChannels}
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">4</div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t.stats.repliesSent}
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">48</div>
        </div>
      </div>
    </div>
  );
}
