import { useState, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import LogoReveal from './components/LogoReveal'
import { Nav } from './components/Nav'
import { ScrollProgress } from './components/ScrollProgress'
import { Hero } from './sections/Hero'
import { Manifesto } from './sections/Manifesto'
import PhilosophyReveal from './sections/PhilosophyReveal'
import { Stats } from './sections/Stats'
import { Capabilities } from './sections/Capabilities'
import { Edge } from './sections/Edge'
import { Sectors } from './sections/Sectors'
import ProjectsGallery from './sections/ProjectsGallery'
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

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [active, setActive] = useState(null) // active project for overlay
  useSmoothScroll()

  const onComplete = useCallback(() => setLoaded(true), [])

  // recalc all pinned-scroll positions once layout is stable (prevents jumps)
  useEffect(() => {
    if (!loaded) return
    const refresh = () => ScrollTrigger.refresh()
    const ids = [gsap.delayedCall(0.3, refresh), gsap.delayedCall(1.2, refresh)]
    window.addEventListener('load', refresh)
    return () => { ids.forEach((c) => c.kill()); window.removeEventListener('load', refresh) }
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
      <LogoReveal onComplete={onComplete} />
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
        <ProjectsGallery onOpen={setActive} />
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
