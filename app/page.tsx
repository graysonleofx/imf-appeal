import { Header } from "@/components/header"
import  {MainSection}  from "@/components/main-section.jsx"
import HeroSection from "@/components/hero-section"
import { AppealSection } from "@/components/appeal-section.jsx"
import { Footer } from "@/components/footer"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-none text-foreground flex flex-col justify-between">
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
