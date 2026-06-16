import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import SplitType from 'split-type'

// Plays AT MOST ONCE per page load. Any remount completes instantly.
let hasPlayed = false

/**
 * <LogoReveal /> — cinematic, monochrome, logo-led title sequence.
 *
 * The madane brush mark is the hero of the moment. No loading numbers.
 * Master timeline duration drives completion (~4.4s). A single ultra-thin
 * hairline bar is the only progress hint — zero digits anywhere.
 *
 * Beats:
 *  0. Black. Faint blueprint grid + concentric rings drift in, masked.
 *  1. IGNITION — a 1px scan-line ignites from centre and sweeps full-width,
 *     "printing" the mark as it passes (the line is the clock for arrival).
 *  2. ASSEMBLY — the real mark arrives as two split halves snapping together,
 *     scaling down from large, with a hard ink-stamp shutter punch.
 *  3. WORDMARK — "madane" resolves letter-by-letter from a mask (kinetic
 *     serif), then the disciplines line masks up beneath it.
 *  4. HOLD — a confident beat. Everything settles, dead still.
 *  5. FINALE — the mark scales up / engulfs, the hairline completes, and the
 *     whole black overlay curtain-wipes upward, revealing the page +
 *     onComplete().
 *
 * prefers-reduced-motion: instant complete, no motion. onComplete ALWAYS fires.
 */
export function LogoReveal({ onComplete }) {
  const root = useRef(null)
  const wordRef = useRef(null)
  const [done, setDone] = useState(hasPlayed)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 860px)').matches

    // Guard: replay protection + reduced motion -> instant complete.
    if (hasPlayed || reduce) {
      hasPlayed = true
      setDone(true)
      onComplete?.()
      return
    }
    hasPlayed = true

    document.documentElement.classList.add('is-loading')

    const ctx = gsap.context(() => {
      // Split the wordmark into chars, each wrapped in an overflow mask.
      let chars = []
      if (wordRef.current) {
        const split = new SplitType(wordRef.current, { types: 'chars', tagName: 'span' })
        chars = split.chars || []
        chars.forEach((c) => {
          c.style.display = 'inline-block'
          c.style.willChange = 'transform'
        })
      }

      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          document.documentElement.classList.remove('is-loading')
          setDone(true)
          onComplete?.()
        },
      })

      // --- INITIAL STATE -------------------------------------------------
      tl.set('.lr__bg', { opacity: 0 })
        .set('.lr__ring', { scale: 0.7, opacity: 0 })
        .set('.lr__mark', { scale: 1.6, opacity: 0, filter: 'blur(6px)' })
        .set('.lr__half--l', { xPercent: -22, clipPath: 'inset(0 50% 0 0)' })
        .set('.lr__half--r', { xPercent: 22, clipPath: 'inset(0 0 0 50%)' })
        .set('.lr__scan', { scaleX: 0, opacity: 0, transformOrigin: 'center center' })
        .set('.lr__shutter', { scaleX: 0, transformOrigin: 'left center' })
        .set('.lr__word', { opacity: 1 })
        .set(chars, { yPercent: 115, rotate: 4 })
        .set('.lr__tag-i', { yPercent: 120 })
        .set('.lr__bar-fill', { scaleX: 0, transformOrigin: 'left center' })
        .set('.lr__corner', { opacity: 0, y: 8 })

      // The hairline progress bar tracks the whole timeline (no digits).
      tl.to('.lr__bar-fill', { scaleX: 1, duration: 4.1, ease: 'none' }, 0)

      // --- 0 · BLUEPRINT ATMOSPHERE drifts in ----------------------------
      tl.to('.lr__bg', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
        .to('.lr__ring', {
          scale: 1, opacity: 1, duration: 1.6, ease: 'power3.out', stagger: 0.12,
        }, 0.1)
        .to('.lr__corner', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.25)

      // --- 1 · IGNITION scan-line prints the mark ------------------------
      tl.to('.lr__scan', { opacity: 1, duration: 0.12 }, 0.42)
        .to('.lr__scan', { scaleX: 1, duration: 0.5, ease: 'power3.inOut' }, 0.46)
        // the mark is revealed in the wake of the scan-line
        .to('.lr__mark', { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }, 0.6)
        .to('.lr__scan', { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0.96)

      // --- 2 · ASSEMBLY — halves snap, scale settles, ink-stamp punch ----
      tl.to('.lr__half--l', {
          xPercent: 0, clipPath: 'inset(0 0% 0 0)',
          duration: 1.35, ease: 'power4.inOut',
        }, 0.66)
        .to('.lr__half--r', {
          xPercent: 0, clipPath: 'inset(0 0 0 0%)',
          duration: 1.35, ease: 'power4.inOut',
        }, 0.66)
        .to('.lr__mark', { scale: 1, duration: 1.5, ease: 'expo.out' }, 0.66)

      // hard ink-stamp shutter punch across the mark (difference blend)
      tl.to('.lr__shutter', { scaleX: 1, duration: 0.26, ease: 'power3.in' }, 0.92)
        .set('.lr__shutter', { transformOrigin: 'right center' })
        .to('.lr__shutter', { scaleX: 0, duration: 0.34, ease: 'power3.out' }, 1.2)

      // --- 3 · WORDMARK resolves letter-by-letter, then disciplines ------
      tl.to(chars, {
          yPercent: 0, rotate: 0,
          duration: 1.0, ease: 'power4.out',
          stagger: { each: 0.045, from: 'start' },
        }, 1.5)
        .to('.lr__tag-i', { yPercent: 0, duration: 0.95, ease: 'power4.out' }, 2.0)

      // --- 4 · HOLD — a confident, dead-still beat ------------------------
      tl.to({}, { duration: 0.55 }, 2.95)

      // --- 5 · FINALE — engulf, then curtain-wipe up to hero -------------
      tl.to('.lr__ring', {
          scale: 1.35, opacity: 0, duration: 0.9, ease: 'power2.in', stagger: 0.05,
        }, 3.4)
        .to('.lr__bg', { opacity: 0, duration: 0.7, ease: 'power2.in' }, 3.4)
        .to('.lr__mark', {
          scale: isMobile ? 1.12 : 1.06, y: -18, duration: 0.7, ease: 'power2.inOut',
        }, 3.42)
        .to('.lr__mark, .lr__word, .lr__tag', { opacity: 0, duration: 0.5, ease: 'power2.in' }, '<0.18')
        .to('.lr__corner, .lr__bar', { opacity: 0, duration: 0.4 }, '<')
        .to('.lr', {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.05, ease: 'expo.inOut',
        }, '-=0.32')
    }, root)

    return () => {
      ctx.revert()
      // Safety: never leave the page scroll-locked if we unmount mid-sequence.
      document.documentElement.classList.remove('is-loading')
    }
  }, [onComplete])

  if (done) return null

  return (
    <div className="lr" ref={root} aria-hidden>
      <div className="lr__grain" />

      {/* faint, masked blueprint atmosphere */}
      <div className="lr__bg">
        <div className="lr__grid" />
        <div className="lr__rings">
          <span className="lr__ring" />
          <span className="lr__ring" />
          <span className="lr__ring" />
        </div>
      </div>

      <div className="lr__stage">
        <div className="lr__mark">
          {/* split-reveal halves of the real brush mark */}
          <div className="lr__half lr__half--l">
            <img src="/assets/logo-white.png" alt="" draggable="false" />
          </div>
          <div className="lr__half lr__half--r">
            <img src="/assets/logo-white.png" alt="" draggable="false" />
          </div>
          {/* ignition scan-line + ink-stamp shutter */}
          <div className="lr__scan" />
          <div className="lr__shutter" />
        </div>

        <div className="lr__word" ref={wordRef}>madane</div>

        <div className="lr__tag">
          <span className="lr__tag-i">architecture &middot; interiors &middot; turnkey</span>
        </div>
      </div>

      {/* the ONLY progress hint — an ultra-thin hairline, no digits */}
      <div className="lr__bar"><span className="lr__bar-fill" /></div>

      <div className="lr__corner">est. 2008 &middot; mumbai &middot; bharat</div>
    </div>
  )
}

export default LogoReveal
