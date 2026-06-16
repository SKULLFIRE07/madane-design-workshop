import { useState, useRef, useLayoutEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/site'
import { SplitReveal } from '../components/Reveal'

gsap.registerPlugin(Flip, ScrollTrigger)

export function Works({ onOpen }) {
  const grid = useRef(null)
  const flipState = useRef(null)
  const [filter, setFilter] = useState('all')

  const filters = useMemo(() => {
    const map = { all: 'all' }
    projects.forEach((p) => (map[p.sector] = p.sector))
    return Object.keys(map)
  }, [])

  const apply = (f) => {
    if (f === filter) return
    flipState.current = Flip.getState('.work', { props: 'opacity' })
    setFilter(f)
  }

  // run Flip after filter state applied
  useLayoutEffect(() => {
    if (!flipState.current) return
    Flip.from(flipState.current, {
      duration: 0.75,
      ease: 'power3.inOut',
      scale: true,
      absolute: true,
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.4 }),
    })
    flipState.current = null
  }, [filter])

  // initial scroll reveal
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return
      gsap.utils.toArray('.work').forEach((el) => {
        gsap.fromTo(
          el.querySelector('.work__media'),
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
        )
      })
    }, grid)
    return () => ctx.revert()
  }, [])

  return (
    <section id="works" className="works section">
      <div className="wrap">
        <header className="works__head">
          <div>
            <span className="eyebrow">selected works</span>
            <SplitReveal as="h2" className="works__title" type="words" stagger={0.05}>
              the proof<br />is built.
            </SplitReveal>
          </div>
          <div className="works__filters">
            {filters.map((f) => (
              <button key={f} className={f === filter ? 'is-on' : ''} onClick={() => apply(f)}>{f}</button>
            ))}
          </div>
        </header>

        <div className="works__grid" ref={grid}>
          {projects.map((p, i) => {
            const show = filter === 'all' || p.sector === filter
            return (
              <article
                key={p.id}
                className={`work ${show ? '' : 'is-hidden'} ${i % 5 === 0 ? 'is-wide' : ''}`}
                onClick={() => onOpen(p)}
                data-cursor="view"
                style={{ '--tone': p.tone }}
              >
                <div className="work__media">
                  <div className="work__img" style={{ backgroundImage: `url(${p.cover})` }} />
                  <div className="work__shade" />
                </div>
                <div className="work__meta">
                  <h3>{p.name}</h3>
                  <div className="work__sub">
                    <span>{p.sector}</span>
                    {p.area && <span>{p.area}</span>}
                    {p.rating && <span className="work__badge">{p.rating}</span>}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
