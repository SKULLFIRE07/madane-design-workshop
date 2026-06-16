import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { services } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

const PROCESS = [
  { i: '01', name: 'feasibility', note: 'site, brief, constraints, budget' },
  { i: '02', name: 'conceptualize', note: 'narrative, form, material logic' },
  { i: '03', name: 'execution', note: 'detailing, site, craft, control' },
  { i: '04', name: 'handover', note: 'snag, finish, the keys' },
]

export function Capabilities() {
  const root = useRef(null)
  const track = useRef(null)
  const pipe = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const mm = gsap.matchMedia()

      // -------- DESKTOP: horizontal pin + container-driven pipeline draw --------
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

        // ---- PIPELINE: drawn step-by-step, driven by horizontal position ----
        const p = pipe.current
        if (p) {
          const rail = p.querySelector('.pipe__draw')
          const nodes = gsap.utils.toArray('.pipe__node', p)
          const words = gsap.utils.toArray('.pipe__word', p)
          const idxs = gsap.utils.toArray('.pipe__i', p)
          const notes = gsap.utils.toArray('.pipe__note', p)
          const arrows = gsap.utils.toArray('.pipe__arrow', p)
          const heads = gsap.utils.toArray('.pipe__intro > *', p)

          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: p,
              containerAnimation: tween,
              start: 'left 92%',
              end: 'right 96%',
              scrub: true,
            },
          })

          // intro label/title ignite first
          tl.fromTo(heads, { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, ease: 'power2.out', stagger: 0.08, duration: 0.5 }, 0)

          // the rail draws across the whole pipeline
          if (rail) {
            const len = rail.getTotalLength ? rail.getTotalLength() : 1000
            gsap.set(rail, { strokeDasharray: len, strokeDashoffset: len })
            tl.to(rail, { strokeDashoffset: 0, ease: 'none', duration: 4 }, 0.35)
          }

          // each step choreographed in sequence along the draw
          PROCESS.forEach((_, n) => {
            const at = 0.5 + n * 0.85
            tl.fromTo(nodes[n], { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, ease: 'back.out(2.4)', duration: 0.45 }, at)
              .fromTo(idxs[n], { yPercent: 120, opacity: 0 },
                { yPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.45 }, at + 0.05)
              .fromTo(words[n], { yPercent: 118 },
                { yPercent: 0, ease: 'power3.out', duration: 0.6 }, at + 0.08)
              .fromTo(words[n], { opacity: 0.16, filter: 'blur(6px)' },
                { opacity: 1, filter: 'blur(0px)', ease: 'power2.out', duration: 0.6 }, at + 0.08)
              .fromTo(notes[n], { opacity: 0, yPercent: 60 },
                { opacity: 1, yPercent: 0, ease: 'power2.out', duration: 0.5 }, at + 0.28)
            if (arrows[n]) {
              tl.fromTo(arrows[n], { opacity: 0, x: -14 },
                { opacity: 1, x: 0, ease: 'power2.out', duration: 0.45 }, at + 0.55)
            }
          })
        }

        return () => {}
      })

      // -------- MOBILE: vertical, no pin — each step fade-ups on enter --------
      mm.add('(max-width: 859px)', () => {
        if (reduce) return
        const p = pipe.current
        if (!p) return
        const steps = p.querySelector('.pipe__steps')
        if (steps) {
          gsap.set(steps, { '--pipe-rail': 0 })
          gsap.to(steps, {
            '--pipe-rail': 1, ease: 'none',
            scrollTrigger: { trigger: steps, start: 'top 78%', end: 'bottom 75%', scrub: true },
          })
        }
        gsap.utils.toArray('.pipe__step', p).forEach((step) => {
          gsap.from(step, {
            opacity: 0, y: 40,
            duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 88%' },
          })
        })
        gsap.from(p.querySelectorAll('.pipe__intro > *'), {
          opacity: 0, y: 30, stagger: 0.08, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: p, start: 'top 85%' },
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

          <div className="cap__end pipe" ref={pipe} aria-label="our process, end to end">
            <div className="pipe__intro">
              <span className="eyebrow pipe__eyebrow">the process</span>
              <h3 className="pipe__title">feasibility, to the keys.</h3>
            </div>

            <div className="pipe__flow">
              <svg className="pipe__svg" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
                <path className="pipe__base" d="M 8 50 L 992 50" />
                <path className="pipe__draw" d="M 8 50 L 992 50" />
              </svg>

              <ol className="pipe__steps">
                {PROCESS.map((s, n) => (
                  <li className="pipe__step" key={s.i}>
                    <span className="pipe__node" aria-hidden="true" />
                    <span className="pipe__i">{s.i}</span>
                    <span className="pipe__wordmask">
                      <span className="pipe__word">{s.name}</span>
                    </span>
                    <span className="pipe__note">{s.note}</span>
                    {n < PROCESS.length - 1 && (
                      <span className="pipe__arrow" aria-hidden="true">→</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
