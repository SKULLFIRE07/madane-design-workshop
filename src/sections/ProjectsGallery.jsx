import { useRef, useLayoutEffect, useState, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

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
      // ---------- MOBILE / REDUCED: vertical stack, fade-up reveal ----------
      if (!desktop) {
        if (reduce) {
          gsap.set(cardsRef.current, { opacity: 1, y: 0 })
          return
        }
        cardsRef.current.forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 48 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            }
          )
        })
        return
      }

      // ---------- DESKTOP: pinned horizontal scroll ----------
      const cards = cardsRef.current
      if (!cards.length) return

      // current active index tracked imperatively to avoid re-render churn
      let curActive = -1

      // quickTo setters per card for buttery interpolation of depth params
      const setters = cards.map((el) => ({
        scale: gsap.quickTo(el, 'scale', { duration: 0.45, ease: 'power3.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' }),
        opacity: gsap.quickTo(el, 'opacity', { duration: 0.45, ease: 'power2.out' }),
      }))

      // distance over which the track travels: full track width minus one viewport
      const getDistance = () => {
        const trackW = track.current.scrollWidth
        const vpW = viewport.current.clientWidth
        return Math.max(trackW - vpW, 1)
      }

      // depth update: scale/y/opacity from each card's distance to viewport centre
      const update = () => {
        const vpRect = viewport.current.getBoundingClientRect()
        const vpCenter = vpRect.left + vpRect.width / 2
        let best = 0
        let bestDist = Infinity

        cards.forEach((el, i) => {
          const r = el.getBoundingClientRect()
          const c = r.left + r.width / 2
          const dist = Math.abs(c - vpCenter)
          // normalise distance against viewport half-width
          const t = Math.min(dist / (vpRect.width * 0.5), 1)
          const eased = t * t // ease-in falloff
          const scale = 1 - eased * 0.32
          const y = eased * 46
          const opacity = 1 - eased * 0.58
          setters[i].scale(scale)
          setters[i].y(y)
          setters[i].opacity(opacity)
          if (dist < bestDist) {
            bestDist = dist
            best = i
          }
        })

        if (best !== curActive) {
          curActive = best
          cards.forEach((el, i) => el.classList.toggle('is-active', i === best))
          setActive(best)
          if (counterRef.current) counterRef.current.textContent = pad(best + 1)
          if (captionRef.current && !reduce) {
            gsap.fromTo(
              captionRef.current,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', overwrite: true }
            )
          }
        }
      }

      // build the pinned scrub timeline
      const tween = gsap.to(track.current, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => '+=' + getDistance() * 1.15,
          pin: true,
          scrub: reduce ? true : 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: update,
          onRefresh: update,
        },
      })

      // prime initial state
      gsap.set(cards, { transformOrigin: 'center center' })
      update()

      return () => {
        tween.scrollTrigger && tween.scrollTrigger.kill()
        tween.kill()
      }
    }, root)

    return () => ctx.revert()
  }, [items])

  const activeProject = items[active] || items[0]

  return (
    <section id="projects" className="pg" ref={root} aria-label="selected projects">
      <div className="pg__grid" aria-hidden="true" />

      <header className="pg__head">
        <span className="pg__eyebrow">our projects</span>
        <span className="pg__count">
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
                <span className="pg__media-veil" />
              </div>
              {/* mobile-only inline meta (desktop uses the shared caption below) */}
              <div className="pg__card-meta">
                <h3 className="pg__card-name">{p.name}</h3>
                <p className="pg__card-sub">
                  <span>{p.location}</span>
                  <span className="pg__dot">·</span>
                  <span>{p.sector}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="pg__caption" ref={captionRef}>
        <button
          type="button"
          className="pg__caption-btn"
          onClick={() => activeProject && onOpen && onOpen(activeProject)}
          data-cursor="view"
        >
          <span className="pg__caption-text">
            <span className="pg__caption-name">{activeProject?.name}</span>
            <span className="pg__caption-sub">
              {activeProject?.location}
              <span className="pg__dot">·</span>
              {activeProject?.sector}
            </span>
          </span>
          <span className="pg__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </span>
        </button>
      </div>
    </section>
  )
}
