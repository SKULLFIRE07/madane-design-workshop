import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { services } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

export function Capabilities() {
  const root = useRef(null)
  const track = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const mm = gsap.matchMedia()
      mm.add('(min-width: 860px)', () => {
        if (reduce) return
        // recompute on refresh (Fraunces changes widths) and add a tail so 'handover' fully clears
        const getW = () => track.current.scrollWidth - window.innerWidth + window.innerWidth * 0.12
        const tween = gsap.to(track.current, {
          x: () => -getW(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${getW() + window.innerHeight * 0.6}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        // cards rise as they enter
        gsap.utils.toArray('.cap__card').forEach((c) => {
          gsap.from(c, {
            yPercent: 12,
            opacity: 0.4,
            duration: 0.6,
            scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 90%', end: 'left 55%', scrub: true },
          })
        })
        return () => {}
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="capabilities" className="cap" ref={root}>
      <div className="cap__sticky">
        <div className="cap__head wrap">
          <span className="eyebrow">capabilities</span>
          <h2 className="cap__title">a single workshop,<br />end to end.</h2>
        </div>
        <div className="cap__track" ref={track}>
          {services.map((s) => (
            <article className="cap__card" key={s.n} data-cursor="">
              <div className="cap__n">{s.n}</div>
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
              <div className="cap__line" />
            </article>
          ))}
          <div className="cap__end">
            <p>feasibility</p><span>→</span><p>conceptualize</p><span>→</span><p>execution</p><span>→</span><p>handover</p>
          </div>
        </div>
      </div>
    </section>
  )
}
