import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

const FEATURED_IDS = ['tata', 'seclore', 'icici', 'sgl', 'semac', 'odyssey']

export function Showcase({ onOpen }) {
  const root = useRef(null)
  const [active, setActive] = useState(0)
  const featured = FEATURED_IDS.map((id) => projects.find((p) => p.id === id)).filter(Boolean)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const n = featured.length
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: `+=${reduce ? 0 : n * 75}%`,
        pin: !reduce,
        scrub: reduce ? false : 0.4,
        onUpdate: (self) => {
          const i = Math.min(n - 1, Math.floor(self.progress * n))
          setActive(i)
        },
      })
      return () => st.kill()
    }, root)
    return () => ctx.revert()
  }, [featured.length])

  const cur = featured[active] || featured[0]

  return (
    <section id="showcase" className="showcase" ref={root}>
      <div className="showcase__sticky">
        <div className="showcase__stage">
          {featured.map((p, i) => (
            <div key={p.id} className={`showcase__img ${i === active ? 'is-active' : ''}`} style={{ backgroundImage: `url(${p.cover})` }} />
          ))}
          <div className="showcase__veil" />
        </div>

        <div className="showcase__ui wrap">
          <div className="showcase__top">
            <span className="eyebrow">selected works</span>
            <span className="showcase__count">{String(active + 1).padStart(2, '0')} <i>/ {String(featured.length).padStart(2, '0')}</i></span>
          </div>

          <div className="showcase__main" onClick={() => onOpen?.(cur)} data-cursor="view">
            <div className="showcase__sector">{cur.sector}</div>
            <h2 key={cur.id} className="showcase__name">{cur.name}</h2>
            <div className="showcase__meta">
              {cur.location && <span>{cur.location}</span>}
              {cur.area && <span>{cur.area}</span>}
              {cur.rating && <span className="showcase__badge">{cur.rating}</span>}
            </div>
          </div>

          <div className="showcase__dots">
            {featured.map((p, i) => (
              <span key={p.id} className={i === active ? 'is-on' : ''} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
