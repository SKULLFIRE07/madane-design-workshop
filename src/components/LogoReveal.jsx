import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

// Plays AT MOST ONCE per page load. Any remount completes instantly.
let hasPlayed = false

/**
 * <LogoReveal /> — cinematic monochrome logo-led intro overlay.
 *
 * Sequence (~3.8s master timeline):
 *  1. Black overlay. The mark arrives via a heavy clip + scale-from-large,
 *     two vertical halves driven apart then snapping together, with a fast
 *     white "shutter" sweep that prints the wordmark into view (~0.6s in).
 *  2. A tabular 000→100 counter in the corner is the master clock.
 *  3. The disciplines / wordmark line resolves up from a mask.
 *  4. Finale: the mark does one confident settle, then the whole black
 *     overlay performs a single clip-path curtain wipe upward, revealing the
 *     page and calling onComplete().
 *
 * prefers-reduced-motion: instant complete, no motion.
 */
export function LogoReveal({ onComplete }) {
  const root = useRef(null)
  const countRef = useRef(null)
  const [done, setDone] = useState(hasPlayed)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Guard: replay protection + reduced motion -> instant complete.
    if (hasPlayed || reduce) {
      hasPlayed = true
      setDone(true)
      onComplete?.()
      return
    }
    hasPlayed = true

    document.documentElement.classList.add('is-loading')
    const counter = { v: 0 }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          document.documentElement.classList.remove('is-loading')
          setDone(true)
          onComplete?.()
        },
      })

      // --- INITIAL STATE -------------------------------------------------
      tl.set('.lr__mark', { scale: 1.55, opacity: 0 })
        .set('.lr__half--l', { xPercent: -16, clipPath: 'inset(0 50% 0 0)' })
        .set('.lr__half--r', { xPercent: 16, clipPath: 'inset(0 0 0 50%)' })
        .set('.lr__shutter', { scaleX: 0, transformOrigin: 'left center' })
        .set('.lr__tag-i', { yPercent: 120 })
        .set('.lr__count, .lr__corner', { opacity: 0 })

      // --- 1 · ARRIVAL (mark forms within ~0.6s) -------------------------
      tl.to('.lr__mark', { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.12)
        // halves driven apart slightly then snap together (split-reveal)
        .to('.lr__half--l', {
          xPercent: 0, clipPath: 'inset(0 0% 0 0)',
          duration: 1.25, ease: 'power4.inOut',
        }, 0.18)
        .to('.lr__half--r', {
          xPercent: 0, clipPath: 'inset(0 0 0 0%)',
          duration: 1.25, ease: 'power4.inOut',
        }, 0.18)
        .to('.lr__mark', { scale: 1, duration: 1.4, ease: 'expo.out' }, 0.18)

      // fast white shutter sweep that "prints" the mark
      tl.to('.lr__shutter', { scaleX: 1, duration: 0.32, ease: 'power3.in' }, 0.46)
        .set('.lr__shutter', { transformOrigin: 'right center' })
        .to('.lr__shutter', { scaleX: 0, duration: 0.4, ease: 'power3.out' }, 0.78)

      // --- 2 · COUNTER (master clock 000→100) ----------------------------
      tl.to('.lr__count, .lr__corner', { opacity: 1, duration: 0.4 }, 0.2)
        .to(counter, {
          v: 100, duration: 2.6, ease: 'power1.inOut',
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
            }
          },
        }, 0.2)

      // --- 3 · WORDMARK / DISCIPLINES RESOLVE ----------------------------
      tl.to('.lr__tag-i', { yPercent: 0, duration: 1.0, ease: 'power4.out' }, 1.45)

      // --- 4 · FINALE: settle, then curtain wipe up ----------------------
      tl.to('.lr__mark', { scale: 1.035, y: -22, duration: 0.55, ease: 'power2.inOut' }, '+=0.3')
        .to('.lr__mark, .lr__tag', { opacity: 0, duration: 0.45, ease: 'power2.in' }, '<0.12')
        .to('.lr__count, .lr__corner', { opacity: 0, duration: 0.35 }, '<')
        .to('.lr', {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.05, ease: 'expo.inOut',
        }, '-=0.28')
    }, root)

    return () => ctx.revert()
  }, [onComplete])

  if (done) return null

  return (
    <div className="lr" ref={root} aria-hidden>
      <div className="lr__grain" />

      <div className="lr__stage">
        <div className="lr__mark">
          {/* split-reveal halves of the real mark */}
          <div className="lr__half lr__half--l">
            <img src="/assets/logo-white.png" alt="" draggable="false" />
          </div>
          <div className="lr__half lr__half--r">
            <img src="/assets/logo-white.png" alt="" draggable="false" />
          </div>
          {/* fast white shutter sweep */}
          <div className="lr__shutter" />
        </div>

        <div className="lr__tag">
          <span className="lr__tag-i">architecture &middot; interiors &middot; turnkey</span>
        </div>
      </div>

      <div className="lr__count">
        <span ref={countRef}>000</span><i>&middot;100</i>
      </div>

      <div className="lr__corner">est. 2008 &middot; mumbai &middot; bharat</div>
    </div>
  )
}

export default LogoReveal
