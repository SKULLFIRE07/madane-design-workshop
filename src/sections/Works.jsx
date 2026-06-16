import { useState, useRef, useLayoutEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/site'
import { SplitReveal } from '../components/Reveal'

gsap.registerPlugin(Flip, ScrollTrigger)

/* Title-case a raw sector token ("IT / software" -> "IT / Software") */
const labelFor = (s) =>
  s
    .split(' ')
    .map((w) =>
      w === w.toUpperCase() && w.length > 1
        ? w // keep acronyms (NBFC, IGBC, IT)
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(' ')

/**
 * <Works> · the filterable "Selected Works" grid of every project.
 * Even editorial grid (3 / 2 / 1), consistent gaps, equal 4:5 tiles.
 * Hairline tab-row sector filter (GSAP Flip, fade not scale-pop).
 * Each tile reveals via clip-path inset(100% 0 0 0) -> inset(0).
 */
export function Works({ onOpen }) {
  const root = useRef(null)
  const grid = useRef(null)
  const flipState = useRef(null)
  const [filter, setFilter] = useState('all')

  // ordered, de-duped sector list -> [{ id, label }]
  const filters = useMemo(() => {
    const seen = new Set()
    const out = [{ id: 'all', label: 'All Work' }]
    projects.forEach((p) => {
      if (!seen.has(p.sector)) {
        seen.add(p.sector)
        out.push({ id: p.sector, label: labelFor(p.sector) })
      }
    })
    return out
  }, [])

  const visible = useMemo(
    () => projects.filter((p) => filter === 'all' || p.sector === filter),
    [filter]
  )

  const apply = (f) => {
    if (f === filter) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setFilter(f)
      return
    }
    // capture current layout for a smooth Flip refilter (fade in/out, no scale-pop)
    flipState.current = Flip.getState('.work', { props: 'opacity' })
    setFilter(f)
  }

  // Flip the grid after the filtered set is committed
  useLayoutEffect(() => {
    if (!flipState.current) return
    const ctx = gsap.context(() => {
      Flip.from(flipState.current, {
        duration: 0.6,
        ease: 'power2.inOut',
        absolute: true,
        stagger: 0.025,
        // re-arrangement is positional only; new/leaving tiles cross-fade
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { opacity: 0 },
            { opacity: 1, duration: 0.45, ease: 'power2.out' }
          ),
        onLeave: (els) =>
          gsap.to(els, { opacity: 0, duration: 0.3, ease: 'power2.in' }),
      })
    }, grid)
    flipState.current = null
    return () => ctx.revert()
  }, [filter])

  // one-shot scroll reveal: each tile's image wipes up via clip-path
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const medias = gsap.utils.toArray('.work__media')
      if (reduce) {
        gsap.set(medias, { clipPath: 'inset(0% 0% 0% 0%)' })
        return
      }
      ScrollTrigger.batch(medias, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 0.9,
              ease: 'expo.out',
              stagger: 0.06,
              overwrite: true,
            }
          ),
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="works" className="works section" ref={root}>
      <div className="wrap">
        <header className="works__head">
          <div className="works__intro">
            <span className="eyebrow">Selected Works</span>
            <SplitReveal as="h2" className="works__title" type="words" stagger={0.05}>
              The proof is built.
            </SplitReveal>
          </div>

          <div className="works__filters" role="tablist" aria-label="Filter works by sector">
            {filters.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={f.id === filter}
                className={f.id === filter ? 'is-on' : ''}
                onClick={() => apply(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        <div className="works__grid" ref={grid}>
          {visible.map((p) => (
            <article
              key={p.id}
              className="work"
              data-flip-id={p.id}
              onClick={() => onOpen(p)}
              data-cursor="View"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpen(p)
                }
              }}
            >
              <div className="work__media">
                <div
                  className="work__img"
                  style={{ backgroundImage: `url(${p.cover})` }}
                  role="img"
                  aria-label={p.name}
                />
                <figcaption className="work__caption">
                  <span className="work__capname">{p.name}</span>
                  <span className="work__caploc">{p.location}</span>
                </figcaption>
              </div>

              <div className="work__meta">
                <h3>{p.name}</h3>
                <div className="work__sub">
                  <span>{labelFor(p.sector)}</span>
                  {p.area && <span>{p.area}</span>}
                  {p.rating && <span className="work__badge">{p.rating}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
