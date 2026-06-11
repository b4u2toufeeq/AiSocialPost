"use client";

import { useLocale } from "@/components/providers/locale-provider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { HugeiconsIcon } from "@hugeicons/react";
import { QuoteDownIcon } from "@hugeicons/core-free-icons";

export default function Testimonials() {
  const { t } = useLocale();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.landing.testimonials.title}
          </h2>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="max-w-4xl mx-auto"
        >
          <CarouselContent>
            {t.landing.testimonials.items.map(
              (item: { name: string; role: string; content: string }, i: number) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <div className="h-full p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                    <HugeiconsIcon
                      icon={QuoteDownIcon}
                      size={20}
                      className="text-[#7c6ff7]/40 mb-4"
                    />
                    <p className="text-zinc-300 text-xs leading-relaxed mb-6 line-clamp-5">
                      {item.content}
                    </p>
                    <div>
                      <p className="text-white text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="text-zinc-500 text-xs">{item.role}</p>
                    </div>
                  </div>
                </CarouselItem>
              )
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
