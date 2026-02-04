import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ConvocatoriaSection } from "@/components/convocatoria-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ConvocatoriaSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
