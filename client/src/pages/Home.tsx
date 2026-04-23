/* Home — Terradom Landing Page
   Dark Tech PropTech Design
   Assembles all sections in order */

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ContractorsSection from "@/components/ContractorsSection";
import SuppliersSection from "@/components/SuppliersSection";
import SecuritySection from "@/components/SecuritySection";
import StatsSection from "@/components/StatsSection";
import DownloadSection from "@/components/DownloadSection";
import FaqSection from "@/components/FaqSection";
import PartnerCtaSection from "@/components/PartnerCtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.09 0.015 255)" }}>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <ContractorsSection />
      <SuppliersSection />
      <SecuritySection />
      <DownloadSection />
      <FaqSection />
      <PartnerCtaSection />
      <Footer />
    </div>
  );
}
