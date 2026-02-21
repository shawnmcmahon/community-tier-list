import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/concepts/concept1/HeroSection";
import { FeaturesSection } from "@/components/concepts/concept1/FeaturesSection";
import { SocialProofSection } from "@/components/concepts/concept1/SocialProofSection";
import { DashboardMockSection } from "@/components/concepts/concept1/DashboardMockSection";
import { CTASection } from "@/components/concepts/concept1/CTASection";

export const metadata = {
  title: "Concept 1: Minimal Editorial — Community Tier Lists",
};

export default function Concept1Page() {
  return (
    <div className="min-h-screen bg-white">
      <Nav variant="transparent" />
      <main>
        <HeroSection />
        <FeaturesSection />
        <SocialProofSection />
        <DashboardMockSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
