'use client'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import LoadingScreen from '@/components/LoadingScreen'
import ScrollProgress from '@/components/ScrollProgress'
import Navbar from '@/components/Navbar'
import HeroScroll from '@/components/HeroScroll'
import AboutSection from '@/components/AboutSection'
import SchoolsTicker from '@/components/SchoolsTicker'
import ServicesSection from '@/components/ServicesSection'
import ProcessSection from '@/components/ProcessSection'
import WhyUsSection from '@/components/WhyUsSection'
import CountriesSection from '@/components/CountriesSection'
import EvaluationForm from '@/components/EvaluationForm'
import TestimonialsSection from '@/components/TestimonialsSection'
import FAQSection from '@/components/FAQSection'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import StickyMobileCTA from '@/components/StickyMobileCTA'

export default function Home() {
  useSmoothScroll()

  return (
    <>
      {/* Frame-136 fixed background — subtle behind sections, full at footer */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: 'url(/Sec1/ezgif-frame-136.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        pointerEvents: 'none',
      }} />
      <LoadingScreen />
      <ScrollProgress />
      <main className="relative z-10 bg-transparent">
        <Navbar />
        <HeroScroll />
        <div style={{ marginTop: '-80vh' }}>
          <AboutSection />
          <SchoolsTicker />
          <ServicesSection />
          <ProcessSection />
          <CountriesSection />
          <EvaluationForm />
          <TestimonialsSection />
          <FAQSection />
          <Footer />
        </div>
      </main>
      <WhatsAppButton />
      <StickyMobileCTA />
    </>
  )
}
