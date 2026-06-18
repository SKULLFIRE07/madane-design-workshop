import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * ArchGrid — a site-wide architectural / blueprint line veil.
 *
 * A fixed, pointer-transparent overlay of very light technical line work
 * (blueprint grid + construction lines + compass arcs) that drifts as you
 * scroll: layers parallax at different rates and the compass slowly rotates,
 * so the whole drawing shifts "architecturally" rather than scrolling flat.
 * Pure GSAP + ScrollTrigger (scrubbed to page scroll). Kept faint so it reads
 * as texture under the content, never competing with it.
 */
export function ArchGrid() {
  const root = useRef(null)

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power2.out', delay: 0.6 })
      if (reduce) return

      const st = {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
      }
      // each layer drifts at its own rate + direction = architectural parallax
      gsap.to('.arch__l2', { yPercent: 11, xPercent: -2.5, ease: 'none', scrollTrigger: st })
      gsap.to('.arch__l3', { rotation: 26, yPercent: -4, ease: 'none', scrollTrigger: st, transformOrigin: '50% 50%' })
      gsap.to('.arch__l4', { yPercent: 6, xPercent: 2, ease: 'none', scrollTrigger: st })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div className="arch" ref={root} aria-hidden="true">
      {/* construction lines + dimension marks */}
      <svg className="arch__layer arch__l2 arch__svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M-40 120 L620 360" />
          <path d="M1480 200 L760 560" />
          <path d="M120 880 L900 300" strokeDasharray="6 7" />
          {/* horizontal dimension line + end ticks */}
          <path d="M180 220 L520 220" />
          <path d="M180 212 L180 228" /><path d="M520 212 L520 228" />
          {/* vertical measure */}
          <path d="M1240 300 L1240 640" />
          <path d="M1232 300 L1248 300" /><path d="M1232 640 L1248 640" />
          {/* crosshair datums */}
          <path d="M420 640 L460 640 M440 620 L440 660" />
          <path d="M980 760 L1010 760 M995 745 L995 775" />
          {/* angle arc + rays */}
          <path d="M160 720 L360 720 M160 720 L300 600" />
          <path d="M236 720 A 76 76 0 0 0 200 656" strokeDasharray="4 5" />
        </g>
      </svg>

      {/* compass circles — slowly rotate with scroll */}
      <svg className="arch__layer arch__l3 arch__svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="1180" cy="560" r="300" />
          <circle cx="1180" cy="560" r="300" strokeDasharray="2 26" strokeWidth="6" opacity="0.5" />
          <circle cx="1180" cy="560" r="210" strokeDasharray="5 9" />
          <path d="M880 560 L1480 560 M1180 260 L1180 860" strokeDasharray="6 8" />
          <circle cx="250" cy="180" r="120" strokeDasharray="4 8" />
          <path d="M130 180 L370 180 M250 60 L250 300" strokeDasharray="5 7" />
        </g>
      </svg>

      {/* scattered registration ticks */}
      <svg className="arch__layer arch__l4 arch__svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M700 120 L712 120 M706 114 L706 126" />
          <path d="M1340 740 L1352 740 M1346 734 L1346 746" />
          <path d="M520 820 L532 820 M526 814 L526 826" />
          <path d="M90 520 L102 520 M96 514 L96 526" />
        </g>
      </svg>
    </div>
  )
}
