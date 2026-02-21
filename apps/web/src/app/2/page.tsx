import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/concepts/concept2/HeroSection";
import { FeaturesSection } from "@/components/concepts/concept2/FeaturesSection";
import { SocialProofSection } from "@/components/concepts/concept2/SocialProofSection";
import { DashboardMockSection } from "@/components/concepts/concept2/DashboardMockSection";
import { CTASection } from "@/components/concepts/concept2/CTASection";

export const metadata = {
  title: "Concept 2: Arcade / Neon — Community Tier Lists",
};

export default function Concept2Page() {
  return (
    <div className="min-h-screen bg-black">
      <Nav variant="dark" />
      <main>
        <HeroSection />
        <FeaturesSection />
        <SocialProofSection />
        <DashboardMockSection />
        <CTASection />
      </main>
      <Footer variant="dark" />
    </div>
  );
}
