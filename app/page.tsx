import { CtaSection } from "@/components/marketing/cta-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ResultsSection } from "@/components/marketing/results-section";
import { ShowcaseSection } from "@/components/marketing/showcase-section";

export default function RootPage() {
  return (
    <div className="flex min-h-full flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <HeroSection />
        <ShowcaseSection />
        <FeaturesSection />
        <ResultsSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
