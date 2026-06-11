"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link01Icon,
  AiMagicIcon,
  CalendarCheckIcon,
} from "@hugeicons/core-free-icons";

const stepIcons = [Link01Icon, AiMagicIcon, CalendarCheckIcon];

export default function HowItWorks() {
  const { t } = useLocale();

  const steps = [
    { title: t.landing.howItWorks.step1Title, desc: t.landing.howItWorks.step1Desc },
    { title: t.landing.howItWorks.step2Title, desc: t.landing.howItWorks.step2Desc },
    { title: t.landing.howItWorks.step3Title, desc: t.landing.howItWorks.step3Desc },
  ];

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.landing.howItWorks.title}
          </h2>
          <p className="text-zinc-400">
            {t.landing.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-0.5 bg-gradient-to-r from-[#7c6ff7]/40 via-[#7c6ff7]/60 to-[#7c6ff7]/40" />

          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center group">
              <div className="size-14 rounded-2xl bg-[#7c6ff7]/10 border border-[#7c6ff7]/20 flex items-center justify-center mb-6 group-hover:bg-[#7c6ff7]/20 transition-colors relative z-10">
                <span className="absolute -top-2 -end-2 size-6 rounded-full bg-[#7c6ff7] text-white text-[11px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <HugeiconsIcon
                  icon={stepIcons[i]}
                  size={24}
                  className="text-[#7c6ff7]"
                />
              </div>
              <h3 className="text-white font-semibold text-base mb-3">
                {step.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
