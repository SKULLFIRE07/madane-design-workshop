import { useState, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import HeroIntro from './components/HeroIntro'
import { Nav } from './components/Nav'
import { ArchGrid } from './components/ArchGrid'
import { ScrollProgress } from './components/ScrollProgress'
import { Hero } from './sections/Hero'
import { Manifesto } from './sections/Manifesto'
import PhilosophyReveal from './sections/PhilosophyReveal'
import { Stats } from './sections/Stats'
import { Capabilities } from './sections/Capabilities'
import { Edge } from './sections/Edge'
import { Sectors } from './sections/Sectors'
import { Works } from './sections/Works'
import { Growth } from './sections/Growth'
import { WhyMadane } from './sections/WhyMadane'
import { Studio } from './sections/Studio'
import { Clients } from './sections/Clients'
import { Contact } from './sections/Contact'
import { ProjectOverlay } from './sections/ProjectOverlay'
import './styles/sections.css'
import './styles/refine.css'
import './styles/premium.css'
import './styles/mature.css'
import './styles/sectors.css'
import './styles/pipeline.css'
import './styles/charts.css'
import './styles/gallery.css'
import './styles/manifesto.css'
import './styles/edge.css'
import './styles/philosophy.css'
import './styles/scatter.css'
import './styles/arch.css'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [active, setActive] = useState(null) // active project for overlay
  useSmoothScroll()

  const onComplete = useCallback(() => setLoaded(true), [])

  // CRITICAL: Fraunces loads async and shifts layout, which throws every
  // ScrollTrigger position off (content appears pre-revealed = looks static).
  // Refresh after fonts load + on resize so all section reveals fire correctly.
  useEffect(() => {
    if (!loaded) return
    const refresh = () => ScrollTrigger.refresh()
    const ids = [gsap.delayedCall(0.4, refresh), gsap.delayedCall(1.4, refresh), gsap.delayedCall(3, refresh)]
    window.addEventListener('load', refresh)
    window.addEventListener('resize', refresh)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh)
    return () => { ids.forEach((c) => c.kill()); window.removeEventListener('load', refresh); window.removeEventListener('resize', refresh) }
  }, [loaded])

  // lock scroll when overlay open
  useEffect(() => {
    const l = window.__lenis
    if (!l) return
    if (active) l.stop()
    else l.start()
  }, [active])

  return (
    <>
      <HeroIntro onComplete={onComplete} />
      <ArchGrid />
      <ScrollProgress />
      <Nav />
      <main className={loaded ? 'is-ready' : ''}>
        <Hero started={loaded} />
        <Manifesto />
        <PhilosophyReveal />
        <Stats />
        <Capabilities />
        <Edge />
        <Sectors />
        <Works onOpen={setActive} />
        <Growth />
        <WhyMadane />
        <Studio />
        <Clients />
        <Contact />
      </main>
      <ProjectOverlay project={active} onClose={() => setActive(null)} onNavigate={setActive} />
    </>
  )
}
