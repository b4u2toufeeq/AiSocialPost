"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

export default function PromoPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] shadow-2xl shadow-indigo-500/10">
          {/* Glow accent */}
          <div className="absolute -top-20 -right-20 size-40 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-purple-500/15 blur-3xl" />

          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 z-10 p-1 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>

          <div className="relative p-6 sm:p-8">
            {/* Icon */}
            <div className="mx-auto mb-4 size-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-2">
              Wait &mdash; don&apos;t leave empty-handed!
            </h2>

            {/* Body */}
            <p className="text-sm sm:text-base text-zinc-400 text-center leading-relaxed mb-6">
              Try AI-powered content generation for your business &mdash;
              completely free for 7 days. No credit card needed.
            </p>

            {/* CTA Button */}
            <Link
              href="/sign-up"
              onClick={() => setOpen(false)}
              className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold text-sm text-center transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Start My Free Trial
            </Link>

            {/* Dismiss link */}
            <button
              onClick={() => setOpen(false)}
              className="block w-full mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-center"
            >
              No thanks, I&apos;ll keep doing it manually
            </button>

            {/* Footer */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-xs text-zinc-600">
              <span>Free 7-day trial</span>
              <span className="text-zinc-700">&bull;</span>
              <span>No card required</span>
              <span className="text-zinc-700">&bull;</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
