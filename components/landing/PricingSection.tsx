"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: string;
};

export default function PricingSection() {
  const { t } = useLocale();

  const tiers: PricingTier[] = [
    { ...t.landing.pricing.free },
    { ...t.landing.pricing.pro },
    { ...t.landing.pricing.business },
  ];

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.landing.pricing.title}
          </h2>
          <p className="text-zinc-400">
            {t.landing.pricing.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                tier.popular
                  ? "border-[#7c6ff7] bg-[#7c6ff7]/5 scale-105 md:scale-110"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 inset-x-0 flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-[#7c6ff7] text-white text-[10px] font-semibold uppercase tracking-wider">
                    {tier.popular}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {tier.name}
                </h3>
                <p className="text-zinc-400 text-xs mb-4">
                  {tier.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {tier.price}
                  </span>
                  <span className="text-zinc-500 text-sm">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature: string, j: number) => (
                  <li key={j} className="flex items-start gap-2">
                    <HugeiconsIcon
                      icon={Tick01Icon}
                      size={16}
                      className="text-[#7c6ff7] shrink-0 mt-0.5"
                    />
                    <span className="text-zinc-300 text-xs">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                render={<Link href="/sign-up" />}
                className={`w-full rounded-xl ${
                  tier.popular
                    ? "bg-[#7c6ff7] hover:bg-[#6b5ee6] text-white"
                    : "border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                }`}
                variant={tier.popular ? "default" : "outline"}
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
