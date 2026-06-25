import {
  AboutSection,
  BenefitsSection,
  BookingSection,
  FinalCtaSection,
  Footer,
  HeroSection,
  ProgramsSection,
  TestimonialsSection,
  TransformationsSection,
} from "@/sections/landing-sections";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050706] text-white">
      <HeroSection />
      <AboutSection />
      <ProgramsSection />
      <TransformationsSection />
      <TestimonialsSection />
      <BenefitsSection />
      <BookingSection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}
