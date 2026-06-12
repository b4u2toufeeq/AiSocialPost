"use client";

import { useLocale } from "@/components/providers/locale-provider";

export default function MediaLibraryPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t.nav.mediaLibrary}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload and manage your media assets.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs max-w-2xl">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Media library interface placeholder.
        </p>
      </div>
    </div>
  );
}
