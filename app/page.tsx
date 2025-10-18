import { Header } from "@/components/header"
import  MainSection  from "@/components/MainSection.jsx"
import HeroSection from "@/components/hero-section"
import { AppealSection } from "@/components/appeal-section.jsx"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <MainSection />
        <AppealSection />
      </main>
      <Footer />
    </div>
  )
}
