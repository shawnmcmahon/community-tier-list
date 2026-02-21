import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/concepts/concept5/HeroSection";
import { FeaturesSection } from "@/components/concepts/concept5/FeaturesSection";
import { SocialProofSection } from "@/components/concepts/concept5/SocialProofSection";
import { DashboardMockSection } from "@/components/concepts/concept5/DashboardMockSection";
import { CTASection } from "@/components/concepts/concept5/CTASection";

export const metadata = {
  title: "Concept 5: Ops Dashboard — Community Tier Lists",
};

export default function Concept5Page() {
  return (
    <div className="min-h-screen bg-zinc-950">
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
