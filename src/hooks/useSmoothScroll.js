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
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.15,
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

    // ── GENTLE STOP at the START of each section ───────────────────────────
    // Proximity snap, section TOPS only: if a single scroll comes to rest just
    // off a section top, it settles onto it (so the section/image starts clean).
    // It only engages once scrolling has come to REST near a top — if you're
    // actively scrolling (momentum in hand), it never fires. A tight window +
    // velocity guard keep it from grabbing during a real scroll.
    const snap = new Snap(lenis, {
      type: 'proximity',
      duration: 0.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // only catch when the rest position is genuinely close to a top
      distanceThreshold: '18%',
      // don't snap while still moving with speed — only after it settles
      velocityThreshold: 1,
      debounce: 220,
    })

    // Targets are explicit numeric offsets (section tops), recomputed on every
    // ScrollTrigger refresh so pin-spacers/font shifts don't leave them stale.
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
