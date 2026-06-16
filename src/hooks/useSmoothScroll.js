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
    // Proximity snap: when scrolling comes to rest near a section top, it gently
    // settles onto it. It engages within a distance window + after a debounce, so
    // it never traps scroll mid-section — important because several sections are
    // pinned/scrubbed (Manifesto, Capabilities, Edge, Sectors, ProjectsGallery)
    // and must stay freely scrollable through their long pins.
    const snap = new Snap(lenis, {
      type: 'proximity',
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // catch window is wide enough that the densely-stacked lower sections
      // (Growth, Why, Studio, Clients) reliably settle, not just the tall ones.
      distanceThreshold: '50%',
      debounce: 450,
    })

    // Targets are added as explicit numeric offsets rather than Lenis' auto-
    // measured elements: ScrollTrigger inserts pin-spacers that resize <body>
    // mid-scroll, which makes the library re-measure section tops at a transient
    // layout and snap ~100px short. We recompute the offsets ourselves, only when
    // the layout is settled (on every ScrollTrigger refresh). Pinned sections get
    // wrapped in a .pin-spacer, so match those too.
    const sectionEls = () =>
      Array.from(document.querySelectorAll('main > section, main > footer, main > .pin-spacer > section'))
    let removeSnaps = []
    const buildSnaps = () => {
      removeSnaps.forEach((remove) => remove())
      removeSnaps = sectionEls().map((el) =>
        snap.add(Math.round(el.getBoundingClientRect().top + window.scrollY)),
      )
    }
    buildSnaps()

    // recompute targets after pins/fonts/resize shift the layout
    const onRefresh = () => buildSnaps()
    ScrollTrigger.addEventListener('refresh', onRefresh)

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefresh)
      removeSnaps.forEach((remove) => remove())
      snap.destroy()
      gsap.ticker.remove(raf)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])
}
