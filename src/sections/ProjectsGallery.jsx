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

      // Geometry cache so the per-frame loop does ZERO layout reads (no
      // getBoundingClientRect on scrub — that forced 8 reflows per frame).
      // Cards scale about their centre + only lift vertically, so a card's
      // x-centre is invariant under its own transform: we cache each card's
      // screen centre at trackX=0 and add the live (reflow-free) track x.
      let vpCenter = 0
      let half = 1
      const baseCenter = new Array(cards.length).fill(0)
      const recache = () => {
        const vpRect = viewport.current.getBoundingClientRect()
        vpCenter = vpRect.left + vpRect.width / 2
        half = vpRect.width * 0.5 || 1
        const trackX = parseFloat(gsap.getProperty(track.current, 'x')) || 0
        for (let i = 0; i < cards.length; i++) {
          const r = cards[i].getBoundingClientRect()
          baseCenter[i] = r.left + r.width / 2 - trackX
        }
      }

      // Imperative active index (avoids re-render churn on every frame).
      let curActive = -1
      // rAF throttle guard for the measure pass.
      let queued = false

      const measure = () => {
        queued = false
        // read the track's transform from GSAP's cache — no layout reflow
        const trackX = parseFloat(gsap.getProperty(track.current, 'x')) || 0

        let best = 0
        let bestDist = Infinity

        for (let i = 0; i < cards.length; i++) {
          const c = baseCenter[i] + trackX
          const dist = Math.abs(c - vpCenter)

          // 0 at dead-centre → 1 one viewport-half away.
          const t = Math.min(dist / half, 1)
          const eased = t * t // ease-in falloff — centre dominates

          // Centre ZOOMS to a big hero scale (~1.45) as it arrives dead-centre
          // (right over the project name) — neighbours shrink hard (~0.55),
          // lift and recede. Only transform + opacity (composited, cheap).
          setters[i].scale(1.45 - eased * 0.9)
          setters[i].y(eased * 74)
          setters[i].opacity(1 - eased * 0.6)

          if (dist < bestDist) {
            bestDist = dist
            best = i
          }
        }

        // Only promote a card to ACTIVE (colour + name) once it has actually
        // arrived over the centre/text — not at the midpoint between two cards.
        // Until the nearest card is inside the centre band, keep the previous
        // active so the highlight never jumps ahead of the image.
        const CENTER_BAND = half * 0.34
        if (best !== curActive && (bestDist < CENTER_BAND || curActive === -1)) {
          curActive = best
          for (let i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('is-active', i === best)
            // greyscale snaps on the transition (centre = colour, rest = mono)
            // instead of animating filter every scrub frame.
            setters[i].gray(i === best ? 0 : 1)
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
            recache()
            measure()
          },
        },
      })

      // Prime the geometry cache + initial depth field.
      recache()
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

      {/* shared hero caption — names the CENTRED project, opens it.
          NAME leads (big, clickable), address/meta sits beneath. */}
      <div className="pg__caption" ref={captionRef}>
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
        <div className="pg__caption-meta">
          <span className="pg__caption-idx">{pad(active + 1)}</span>
          <span className="pg__caption-sep" aria-hidden="true">—</span>
          <span className="pg__caption-loc">{activeProject?.location}</span>
        </div>
      </div>
    </section>
  )
}
