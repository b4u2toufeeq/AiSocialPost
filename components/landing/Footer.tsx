"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { LOCALES } from "@/services/i18n";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InstagramIcon,
  NewTwitterIcon as TwitterIcon,
  Linkedin01Icon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";

const socialIcons = [
  { icon: TwitterIcon, href: "#" },
  { icon: InstagramIcon, href: "#" },
  { icon: Linkedin01Icon, href: "#" },
  { icon: YoutubeIcon, href: "#" },
];

export default function Footer() {
  const { t, locale, setLocale } = useLocale();

  const links = {
    product: [
      { key: "productFeatures", href: "#features" },
      { key: "productPricing", href: "#pricing" },
      { key: "productIntegrations", href: "#" },
      { key: "productChangelog", href: "#" },
    ],
    company: [
      { key: "companyAbout", href: "#" },
      { key: "companyBlog", href: "#" },
      { key: "companyCareers", href: "#" },
      { key: "companyContact", href: "#" },
    ],
    legal: [
      { key: "legalPrivacy", href: "#" },
      { key: "legalTerms", href: "#" },
      { key: "legalCookies", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0a0a0f]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AS</span>
              </div>
              <span className="font-bold text-base text-gray-900 dark:text-white">
                AeroSocial Agent
              </span>
            </div>
            <p className="text-gray-500 dark:text-zinc-500 text-sm leading-relaxed max-w-xs mb-6">
              {t.landing.footer.description}
            </p>
            <div className="flex items-center gap-3">
              {socialIcons.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="size-9 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                >
                  <HugeiconsIcon icon={s.icon} size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white text-sm font-semibold mb-4">
              {t.landing.footer.product}
            </h4>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-gray-500 dark:text-zinc-500 text-sm hover:text-gray-900 dark:hover:text-zinc-300 transition-colors"
                  >
                    {t.landing.footer[link.key as keyof typeof t.landing.footer] as string}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white text-sm font-semibold mb-4">
              {t.landing.footer.company}
            </h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-gray-500 dark:text-zinc-500 text-sm hover:text-gray-900 dark:hover:text-zinc-300 transition-colors"
                  >
                    {t.landing.footer[link.key as keyof typeof t.landing.footer] as string}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white text-sm font-semibold mb-4">
              {t.landing.footer.legal}
            </h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-gray-500 dark:text-zinc-500 text-sm hover:text-gray-900 dark:hover:text-zinc-300 transition-colors"
                  >
                    {t.landing.footer[link.key as keyof typeof t.landing.footer] as string}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 dark:text-zinc-600 text-xs">
            &copy; {new Date().getFullYear()} AeroSocial Agent.{" "}
            {t.landing.footer.rights}
          </p>

          <div className="flex items-center gap-2">
            {LOCALES.map((lc) => (
              <button
                key={lc}
                type="button"
                onClick={() => setLocale(lc)}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  locale === lc
                    ? "bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-zinc-200"
                    : "text-gray-400 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-400"
                }`}
              >
                {lc === "ar" ? "العربية" : "English"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
