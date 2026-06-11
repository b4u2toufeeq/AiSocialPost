"use client";

import { useLocale } from "@/components/providers/locale-provider";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FaqSection() {
  const { t } = useLocale();

  return (
    <section id="faq" className="py-24 relative">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.landing.faq.title}
          </h2>
        </div>

        <Accordion className="border-white/5 bg-white/[0.02]">
          {t.landing.faq.items.map(
            (item: { q: string; a: string }, i: number) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-zinc-200 hover:text-white px-4 py-3 text-sm">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 px-4 text-xs leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            )
          )}
        </Accordion>
      </div>
    </section>
  );
}
