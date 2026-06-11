"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiContentGenerator02Icon,
  CalendarAdd01Icon,
  Analytics01Icon,
  UserMultiple02Icon,
  AiChat02Icon,
  GlobeIcon,
} from "@hugeicons/core-free-icons";

const icons = [
  AiContentGenerator02Icon,
  CalendarAdd01Icon,
  Analytics01Icon,
  UserMultiple02Icon,
  AiChat02Icon,
  GlobeIcon,
];

export default function FeaturesGrid() {
  const { t } = useLocale();

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#7c6ff7]/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.landing.features.title}
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            {t.landing.features.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.landing.features.items.map((item: { title: string; description: string }, i: number) => (
            <div
              key={i}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#7c6ff7]/30 transition-all duration-300"
            >
              <div className="size-10 rounded-xl bg-[#7c6ff7]/10 flex items-center justify-center mb-4 group-hover:bg-[#7c6ff7]/20 transition-colors">
                <HugeiconsIcon
                  icon={icons[i]}
                  size={20}
                  className="text-[#7c6ff7]"
                />
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">
                {item.title}
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
