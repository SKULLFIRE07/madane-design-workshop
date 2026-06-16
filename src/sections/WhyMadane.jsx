import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { why } from '../data/site'
import { SplitReveal } from '../components/Reveal'

gsap.registerPlugin(ScrollTrigger)

export function WhyMadane() {
  const root = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return
      gsap.utils.toArray('.why__row').forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 50,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: row, start: 'top 86%', once: true },
        })
        gsap.fromTo(
          row.querySelector('.why__key'),
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 82%', once: true } }
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="why" className="why section" ref={root}>
      <div className="why__grid-bg" aria-hidden />
      <div className="wrap">
        <header className="why__head">
          <span className="eyebrow">why madane</span>
          <SplitReveal as="h2" className="why__title" type="words" stagger={0.06}>
            precision is<br />a discipline.
          </SplitReveal>
        </header>
        <div className="why__rows">
          {why.map((w) => (
            <div className="why__row" key={w.key}>
              <span className="why__key">{w.key}</span>
              <div className="why__txt">
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
