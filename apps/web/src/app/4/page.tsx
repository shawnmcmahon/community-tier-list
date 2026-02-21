import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/concepts/concept4/HeroSection";
import { FeaturesSection } from "@/components/concepts/concept4/FeaturesSection";
import { SocialProofSection } from "@/components/concepts/concept4/SocialProofSection";
import { DashboardMockSection } from "@/components/concepts/concept4/DashboardMockSection";
import { CTASection } from "@/components/concepts/concept4/CTASection";

export const metadata = {
  title: "Concept 4: Sticker / Collectible — Community Tier Lists",
};

export default function Concept4Page() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
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
