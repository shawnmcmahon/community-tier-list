import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/concepts/concept3/HeroSection";
import { FeaturesSection } from "@/components/concepts/concept3/FeaturesSection";
import { SocialProofSection } from "@/components/concepts/concept3/SocialProofSection";
import { DashboardMockSection } from "@/components/concepts/concept3/DashboardMockSection";
import { CTASection } from "@/components/concepts/concept3/CTASection";

export const metadata = {
  title: "Concept 3: Pro Studio — Community Tier Lists",
};

export default function Concept3Page() {
  return (
    <div className="min-h-screen">
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
