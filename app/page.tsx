"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useLocale } from "@/components/providers/locale-provider";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import PlatformStrip from "@/components/landing/PlatformStrip";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import Testimonials from "@/components/landing/Testimonials";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";
import PromoPopup from "@/components/landing/PromoPopup";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const { locale } = useLocale();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#7c6ff7] border-r-2"></div>
          <span className="text-xs text-gray-400 dark:text-zinc-500">Loading AeroSocial Agent...</span>
        </div>
      </div>
    );
  }

  if (userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#7c6ff7] border-r-2"></div>
          <span className="text-xs text-gray-400 dark:text-zinc-500">Redirecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="bg-gray-50 dark:bg-[#0a0a0f] text-gray-900 dark:text-zinc-100 min-h-screen">
      <Navbar />
      <HeroSection />
      <PlatformStrip />
      <FeaturesGrid />
      <HowItWorks />
      <PricingSection />
      <Testimonials />
      <FaqSection />
      <Footer />
      <PromoPopup />
    </div>
  );
}
