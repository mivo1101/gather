import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { InteractiveExperience } from "@/components/landing/InteractiveExperience";
import { Features } from "@/components/landing/Features";
import { TemplatePreview } from "@/components/landing/TemplatePreview";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <HowItWorks />
        <InteractiveExperience />
        <Features />
        <TemplatePreview />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
