import { useRef, useLayoutEffect, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

/**
 * ProjectsGallery — pinned horizontal "zoom-then-slide" works showcase.
 *
 * Mechanic (desktop): the track is pinned and scrubbed horizontally. On every
 * scroll update we measure each card's distance to the viewport CENTRE and
 * derive scale / lift / opacity / greyscale from it. The centre card ZOOMS up
 * to a large hero scale in full colour; neighbours sit smaller, lifted and
 * desaturated for depth. So the eye reads it as: zoom in → slide → zoom the
 * next → one after another.
 *
 * Only transform / opacity / filter are animated (perf is sacred). Depth params
 * are pushed through gsap.quickTo() for buttery interpolation, and the heavy
 * measure loop is throttled to one pass per rAF.
 *
 * Mobile (<861px): no pin / no horizontal — a clean vertical stack of
 * full-bleed plates that fade-up, meta beneath each, tap to open.
 *
 * Reduced motion: snaps to a calm final state (centre-ish hero, no scrub).
 */
export default function ProjectsGallery({ onOpen }) {
  const root = useRef(null)
  const viewport = useRef(null)
  const track = useRef(null)
  const cardsRef = useRef([])
  const counterRef = useRef(null)
  const captionRef = useRef(null)

  const [active, setActive] = useState(0)

  const items = useMemo(() => projects.slice(0, 8), [])
  const total = items.length
  const pad = (n) => String(n).padStart(2, '0')

  cardsRef.current = []
  const setCard = (el) => {
    if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el)
  }

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = window.matchMedia('(min-width: 861px)').matches

    const ctx = gsap.context(() => {
      const cards = cardsRef.current
      if (!cards.length) return

      // ---------- MOBILE: vertical full-bleed plates, fade-up ----------
      if (!desktop) {
        if (reduce) {
          gsap.set(cards, { opacity: 1, y: 0 })
          return
        }
        cards.forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 56 },
            {
              opacity: 1,
              y: 0,
              duration: 1.05,
              ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }
          )
        })
        return
      }

      // ---------- DESKTOP: pinned horizontal zoom-then-slide ----------

      // Per-card buttery setters. We animate scale / y / opacity together and
      // drive greyscale through a CSS custom property (--g) so the browser
      // compositor handles the filter cheaply and consistently.
      const setters = cards.map((el) => ({
        scale: gsap.quickTo(el, 'scale', { duration: 0.5, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' }),
        opacity: gsap.quickTo(el, 'opacity', { duration: 0.5, ease: 'power2.out' }),
        gray: gsap.quickTo(el, '--g', { duration: 0.5, ease: 'power2.out' }),
      }))

      gsap.set(cards, { transformOrigin: 'center center', '--g': 1 })

      // Travel distance: full track width minus one viewport.
      const getDistance = () => {
        const trackW = track.current.scrollWidth
        const vpW = viewport.current.clientWidth
        return Math.max(trackW - vpW, 1)
      }

      // Imperative active index (avoids re-render churn on every frame).
      let curActive = -1
      // rAF throttle guard for the measure pass.
      let queued = false

      const measure = () => {
        queued = false
        const vpRect = viewport.current.getBoundingClientRect()
        const vpCenter = vpRect.left + vpRect.width / 2
        const half = vpRect.width * 0.5

        let best = 0
        let bestDist = Infinity

        for (let i = 0; i < cards.length; i++) {
          const r = cards[i].getBoundingClientRect()
          const c = r.left + r.width / 2
          const dist = Math.abs(c - vpCenter)

          // 0 at dead-centre → 1 one viewport-half away.
          const t = Math.min(dist / half, 1)
          const eased = t * t // ease-in falloff — centre dominates

          // Centre = big hero (1.0 ≈ chosen card width hits hero size via CSS),
          // neighbours shrink, lift and recede. Greyscale 0 (colour) → 1 (mono).
          setters[i].scale(1 - eased * 0.42)
          setters[i].y(eased * 64)
          setters[i].opacity(1 - eased * 0.55)
          setters[i].gray(eased)

          if (dist < bestDist) {
            bestDist = dist
            best = i
          }
        }

        if (best !== curActive) {
          curActive = best
          for (let i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('is-active', i === best)
          }
          setActive(best)
          if (counterRef.current) counterRef.current.textContent = pad(best + 1)
          // Re-key the hero caption with a quick mask-up beat.
          if (captionRef.current && !reduce) {
            gsap.fromTo(
              captionRef.current,
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', overwrite: true }
            )
          }
        }
      }

      // Throttle: at most one measure per animation frame.
      const update = () => {
        if (queued) return
        queued = true
        requestAnimationFrame(measure)
      }

      const tween = gsap.to(track.current, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          // generous travel so each card gets a real "dwell" at centre.
          end: () => '+=' + getDistance() * 1.25,
          pin: true,
          scrub: reduce ? true : 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: update,
          onRefresh: () => {
            queued = false
            measure()
          },
        },
      })

      // Prime the initial depth field.
      measure()

      return () => {
        tween.scrollTrigger && tween.scrollTrigger.kill()
        tween.kill()
      }
    }, root)

    return () => ctx.revert()
  }, [items])

  const activeProject = items[active] || items[0]

  return (
    <section id="projects" className="pg" ref={root} aria-label="Selected projects">
      <header className="pg__head">
        <span className="pg__eyebrow">Selected Works</span>
        <span className="pg__count" aria-live="polite">
          <span ref={counterRef} className="pg__count-cur">{pad(1)}</span>
          <span className="pg__count-sep">/</span>
          <span className="pg__count-tot">{pad(total)}</span>
        </span>
      </header>

      <div className="pg__viewport" ref={viewport}>
        <div className="pg__track" ref={track}>
          {items.map((p, i) => (
            <article
              key={p.id}
              ref={setCard}
              className="pg__card"
              data-cursor="view"
              role="button"
              tabIndex={0}
              aria-label={`Open project ${p.name}`}
              onClick={() => onOpen && onOpen(p)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpen && onOpen(p)
                }
              }}
            >
              <span className="pg__card-idx">{pad(i + 1)}</span>
              <div className="pg__media">
                <img src={p.cover} alt={p.name} loading="lazy" draggable="false" />
                <span className="pg__media-veil" aria-hidden="true" />
              </div>
              {/* mobile-only inline meta (desktop uses the shared hero caption) */}
              <div className="pg__card-meta">
                <h3 className="pg__card-name">{p.name}</h3>
                <p className="pg__card-sub">
                  <span>{p.location}</span>
                  <span className="pg__dot" aria-hidden="true">·</span>
                  <span>{p.sector}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* shared hero caption — names the CENTRED project, opens it */}
      <div className="pg__caption" ref={captionRef}>
        <div className="pg__caption-meta">
          <span className="pg__caption-idx">{pad(active + 1)}</span>
          <span className="pg__caption-sep" aria-hidden="true">—</span>
          <span className="pg__caption-loc">{activeProject?.location}</span>
        </div>
        <button
          type="button"
          className="pg__caption-btn"
          onClick={() => activeProject && onOpen && onOpen(activeProject)}
          data-cursor="view"
          aria-label={`Open project ${activeProject?.name}`}
        >
          <span className="pg__caption-name">{activeProject?.name}</span>
          <span className="pg__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M5 12h13M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </span>
        </button>
      </div>
    </section>
  )
}
