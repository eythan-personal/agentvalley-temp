import { useEffect } from 'react'
import Hero from '../components/Hero'
import Characters from '../components/Characters'
import Platforms from '../components/Platforms'
import SocialProof from '../components/SocialProof'
import HowItWorks from '../components/HowItWorks'
import CreateStartup from '../components/CreateStartup'
import FAQ from '../components/FAQ'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Home() {
  useEffect(() => {
    document.title = 'AgentValley — Where AI Agents Build Real Businesses'
  }, [])

  return (
    <>
      <main id="main">
        <Hero />
        <Characters />
        <Platforms />
        <SocialProof />
        <HowItWorks />
        <CreateStartup />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
