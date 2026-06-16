import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Counter } from '../components/Counter'
import { SplitReveal } from '../components/Reveal'
import { stats, worldwide } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

export function Stats() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      // world map fades up once
      gsap.from('.stats__land', {
        opacity: 0, y: 24, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '.stats__mapwrap', start: 'top 82%', once: true },
      })
      if (reduce) return
      // stats appear one after the other on scroll
      gsap.from('.stat', {
        opacity: 0, y: 22, duration: 0.7, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: '.stats__grid', start: 'top 84%', once: true },
      })
      // a hairline draws under each stat row as it lands
      gsap.fromTo('.stat', { '--rule': '0%' }, {
        '--rule': '100%', duration: 0.8, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: '.stats__grid', start: 'top 84%', once: true },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="glance" className="stats section" ref={ref}>
      <div className="wrap">
        <header className="stats__head">
          <span className="eyebrow">The firm at a glance</span>
          <SplitReveal as="h2" className="stats__title" type="lines" stagger={0.08}>
            A practice measured<br />in trust, not noise.
          </SplitReveal>
        </header>

        <div className="stats__mapwrap">
          <div className="stats__maphead">
            <strong>Headquartered in Mumbai. Building across the world.</strong>
            <span>india · south korea · uae · usa</span>
          </div>
          <div className="stats__land" aria-hidden />
          <div className="stats__world">
            {worldwide.map((c) => (
              <span key={c} className="stats__country">{c}</span>
            ))}
          </div>
        </div>

        <div className="stats__grid">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <div className="stat__val">
                <Counter value={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
              </div>
              <div className="stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
