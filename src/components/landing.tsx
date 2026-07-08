import {
  AboutSection,
  BenefitsSection,
  BookingSection,
  FinalCtaSection,
  Footer,
  HeroSection,
  TestimonialsSection,
  TransformationsSection,
} from "@/sections/landing-sections";
import { PlansSection } from "@/components/plans-section";

// NOTA: `ProgramsSection` ("Planes para distintos niveles": Base Fitness /
// Transformación 12 Semanas / Coaching Performance) se retiro de la landing para no
// duplicar secciones de planes. El componente y `src/data/programs.ts` NO se eliminan
// (siguen disponibles y los usa el resto de la app). Solo se muestra la nueva
// `PlansSection` (Básico / Intermedio / Elite).

export function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050706] text-white">
      <HeroSection />
      <AboutSection />
      <PlansSection />
      <TransformationsSection />
      <TestimonialsSection />
      <BenefitsSection />
      <BookingSection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}
