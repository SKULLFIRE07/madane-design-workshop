import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { team, orgTeam, accreditations, values, brand } from '../data/site'
import { SplitReveal, FadeUp } from '../components/Reveal'

gsap.registerPlugin(ScrollTrigger)

const slide = (n) => `/assets/slides/p-${String(n).padStart(2, '0')}.jpg`

export function Studio() {
  const root = useRef(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return
      gsap.fromTo(
        '.studio__banner-img',
        { clipPath: 'inset(0 0 0 100%)', scale: 1.2 },
        { clipPath: 'inset(0 0 0 0%)', scale: 1, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.studio__banner', start: 'top 80%', once: true } }
      )
      gsap.utils.toArray('.value').forEach((v, i) => {
        gsap.from(v, { y: 30, opacity: 0, duration: 0.7, delay: i * 0.06, ease: 'expo.out', scrollTrigger: { trigger: '.studio__values', start: 'top 85%', once: true } })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="studio" className="studio section" ref={root}>
      <div className="wrap">
        <header className="studio__head">
          <span className="eyebrow">the studio</span>
          <SplitReveal as="h2" className="studio__title" type="words" stagger={0.05}>
            our think to<br />innovate team.
          </SplitReveal>
          <p className="studio__lede">architects trained at IIT Chicago and decorated by the President of India · leading a 52-strong workshop of designers, engineers and craftspeople.</p>
        </header>

        <div className="studio__partners">
          {team.map((m, i) => (
            <FadeUp className="partner" key={m.name} delay={i * 0.08} data-cursor="">
              <span className="partner__mono">{m.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
              <h3>{m.name}</h3>
              <div className="partner__role">{m.role}</div>
              <p className="partner__cred">{m.cred}</p>
            </FadeUp>
          ))}
        </div>

        <div className="studio__values">
          {values.map((v) => (
            <div className="value" key={v.en}>
              <span className="value__en">{v.en}</span>
              <span className="value__note">{v.note}</span>
              <span className="value__dev" aria-hidden>{v.dev}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="studio__banner">
        <div className="studio__banner-img" style={{ backgroundImage: `url(${slide(83)})` }} />
        <div className="studio__bannercap">
          <span>est. {brand.founded}</span>
          <strong>the workshop</strong>
        </div>
      </div>

      <div className="wrap">
        <div className="studio__bottom">
          <div className="studio__org">
            <h4>the core team</h4>
            <ul>
              {orgTeam.map((o) => (
                <li key={o.name}><span>{o.name}</span><em>{o.role}</em></li>
              ))}
            </ul>
          </div>
          <div className="studio__accred">
            <h4>accreditations</h4>
            <div className="studio__chips">
              {accreditations.map((a) => <span key={a}>{a}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
