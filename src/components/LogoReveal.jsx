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
 *  1. SLAM — the authentic /assets/logo-white.png brush mark stamps straight
 *     in (scale punch + rotation kick + back-overshoot) as two shockwave rings
 *     burst out from the impact. No clean vector mark — the real brush only.
 *  2. WORDMARK — "madane" resolves letter-by-letter from a mask (kinetic
 *     serif), then the disciplines line masks up beneath it.
 *  3. HOLD — a confident beat. Everything settles, dead still.
 *  4. FINALE — the mark scales up / engulfs, the hairline completes, and the
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
        .set('.lr__mark', { opacity: 1 })
        .set('.lr__brush', { opacity: 1, '--paint': '0deg' })
        .set('.lr__word', { opacity: 1 })
        .set(chars, { yPercent: 115, rotate: 4 })
        .set('.lr__wordsub', { yPercent: 80, opacity: 0 })
        .set('.lr__tag-i', { yPercent: 120 })
        .set('.lr__bar-fill', { scaleX: 0, transformOrigin: 'left center' })
        .set('.lr__corner', { opacity: 0, y: 8 })

      // The hairline progress bar tracks the whole timeline (no digits).
      tl.to('.lr__bar-fill', { scaleX: 1, duration: 3.6, ease: 'none' }, 0)

      // --- 0 · BLUEPRINT ATMOSPHERE drifts in ----------------------------
      tl.to('.lr__bg', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
        .to('.lr__ring', {
          scale: 1, opacity: 1, duration: 1.6, ease: 'power3.out', stagger: 0.12,
        }, 0.1)
        .to('.lr__corner', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.25)

      // --- 1 · PAINT THE BRUSH MARK --------------------------------------
      // a conic mask sweeps clockwise from 12 o'clock, revealing the REAL
      // hand-painted brush mark as if a brush draws the circle around it
      // (the 'm', knocked out of the disc, emerges with it).
      tl.to('.lr__brush', {
          '--paint': '360deg', duration: 1.5, ease: 'power2.inOut',
        }, 0.5)

      // --- 2 · WORDMARK 'madane' resolves, then 'design workshop' --------
      tl.to(chars, {
          yPercent: 0, rotate: 0,
          duration: 1.0, ease: 'power4.out',
          stagger: { each: 0.045, from: 'start' },
        }, 1.55)
        .to('.lr__wordsub', { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 2.05)
        .to('.lr__tag-i', { yPercent: 0, duration: 0.95, ease: 'power4.out' }, 2.3)

      // --- 3 · HOLD — a confident, dead-still beat ------------------------
      tl.to({}, { duration: 0.4 }, 3.25)

      // --- 4 · FINALE — engulf, then curtain-wipe up to hero -------------
      tl.to('.lr__ring', {
          scale: 1.35, opacity: 0, duration: 0.9, ease: 'power2.in', stagger: 0.05,
        }, 3.6)
        .to('.lr__bg', { opacity: 0, duration: 0.7, ease: 'power2.in' }, 3.6)
        .to('.lr__mark', {
          scale: isMobile ? 1.12 : 1.06, y: -18, duration: 0.7, ease: 'power2.inOut',
        }, 3.62)
        .to('.lr__mark, .lr__wordmark, .lr__tag', { opacity: 0, duration: 0.5, ease: 'power2.in' }, '<0.18')
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
          {/* the REAL brush mark, revealed by a conic mask that paints it on */}
          <img className="lr__brush" src="/assets/logo-mark.png" alt="" draggable="false" />
        </div>

        <div className="lr__wordmark">
          <div className="lr__word" ref={wordRef}>madane</div>
          <div className="lr__wordsub">design workshop</div>
        </div>

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
