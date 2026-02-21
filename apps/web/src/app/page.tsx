import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/concepts/concept3/HeroSection";
import { FeaturesSection } from "@/components/concepts/concept3/FeaturesSection";
import { SocialProofSection } from "@/components/concepts/concept3/SocialProofSection";
import { DashboardMockSection } from "@/components/concepts/concept3/DashboardMockSection";
import { CTASection } from "@/components/concepts/concept3/CTASection";

export default function HomePage() {
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
