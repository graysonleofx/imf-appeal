import { Header } from "@/components/header"
import { MainSection } from "@/components/main-section.jsx"
import { AppealSection } from "@/components/appeal-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <MainSection />
        <AppealSection />
      </main>
      <Footer />
    </div>
  )
}
