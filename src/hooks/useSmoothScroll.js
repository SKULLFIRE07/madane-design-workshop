import { useEffect } from 'react'
import Lenis from 'lenis'
import Snap from 'lenis/snap'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Buttery smooth scroll (Lenis) driven by GSAP's ticker, with ScrollTrigger
 * kept in perfect sync. This is the backbone of every scroll animation.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    // keep GSAP's default lag smoothing ON — it gracefully drops frames
    // under load instead of trying to "catch up" (which can freeze a tab).
    gsap.ticker.lagSmoothing(500, 33)

    // expose for anchor scrolling
    window.__lenis = lenis

    // ── SOFT STOP at every section boundary ────────────────────────────────
    // Proximity snap: when scrolling comes to rest NEAR a section top, it gently
    // settles onto it. It only engages within a small distance window and after
    // a debounce, so it never traps scroll mid-section — important because four
    // sections are pinned/scrubbed (Capabilities, Edge, Sectors, ProjectsGallery)
    // and must stay freely scrollable through their long pins.
    const snap = new Snap(lenis, {
      type: 'proximity',
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      distanceThreshold: '28%',
      debounce: 450,
    })
    const sections = Array.from(document.querySelectorAll('main > section, main > footer'))
    if (sections.length) snap.addElements(sections, { align: ['start'] })

    // keep snap targets correct after pins/fonts/resize shift the layout
    const onRefresh = () => snap.resize()
    ScrollTrigger.addEventListener('refresh', onRefresh)

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      snap.destroy()
      gsap.ticker.remove(raf)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])
}
