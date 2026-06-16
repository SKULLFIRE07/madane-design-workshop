import { useLayoutEffect, useRef } from 'react'
import anime from 'animejs'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { growth } from '../data/site'
import { Counter } from '../components/Counter'
import { SplitReveal } from '../components/Reveal'

const PADX = 6, PADT = 17, PADB = 14
const n = growth.length
const xPct = (i) => PADX + (i / (n - 1)) * (100 - PADX * 2)
const yPct = (v, max) => PADT + (1 - v / max) * (100 - PADT - PADB)

function Chart({ accessor, format, max, topLabel, growthLabel, idx }) {
  const pts = growth.map((g, i) => ({ x: xPct(i), y: yPct(accessor(g), max), g }))
  const line = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const area = `${pts[0].x},${100 - PADB} ${line} ${pts[n - 1].x},${100 - PADB}`

  return (
    <div className={`gchart gchart--${idx}`}>
      <div className="gchart__top">
        <span className="gchart__metric">{topLabel}</span>
        <span className="gchart__growth"><em>avg growth</em><strong>{growthLabel}</strong><em>/ year</em></span>
      </div>
      <div className="gchart__plot">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="gchart__svg" aria-hidden>
          <defs>
            <linearGradient id={`gfill-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          {[0.33, 0.66].map((g) => (
            <line key={g} className="gc-grid" x1={PADX} x2={100 - PADX} y1={PADT + g * (100 - PADT - PADB)} y2={PADT + g * (100 - PADT - PADB)} />
          ))}
          <polygon className="gc-area" points={area} fill={`url(#gfill-${idx})`} opacity="0" />
          <polyline className="gc-line" points={line} fill="none" stroke="#ffffff" strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>

        {pts.map((p, i) => (
          <span key={i} className={`gc-dot ${p.g.covid ? 'is-covid' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} />
        ))}
        {pts.map((p, i) => (
          <span key={`t${i}`} className={`gc-tag ${p.g.covid ? 'is-covid' : ''} ${i === n - 1 ? 'is-last' : ''}`} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            {format(accessor(p.g))}
          </span>
        ))}
        {growth.map((g, i) => (
          <span key={`x${i}`} className="gc-xlabel" style={{ left: `${xPct(i)}%` }}>{g.year}</span>
        ))}
        <span className="gc-covid" style={{ left: `${xPct(4)}%` }}>covid years</span>
      </div>
    </div>
  )
}

export function Growth() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        if (reduce) {
          el.querySelectorAll('.gc-line').forEach((l) => (l.style.strokeDashoffset = 0))
          el.querySelectorAll('.gc-area').forEach((a) => (a.style.opacity = 1))
          el.querySelectorAll('.gc-dot, .gc-tag, .gc-xlabel').forEach((nd) => (nd.style.opacity = 1))
          return
        }
        anime({ targets: el.querySelectorAll('.gc-line'), strokeDashoffset: [anime.setDashoffset, 0], easing: 'easeInOutCubic', duration: 2400, delay: anime.stagger(300) })
        anime({ targets: el.querySelectorAll('.gc-area'), opacity: [0, 1], duration: 2000, easing: 'easeOutQuad', delay: 500 })
        anime({ targets: el.querySelectorAll('.gc-dot'), scale: [0, 1], opacity: [0, 1], delay: anime.stagger(120, { start: 600 }), easing: 'easeOutBack', duration: 500 })
        anime({ targets: el.querySelectorAll('.gc-tag'), opacity: [0, 1], translateY: ['6px', '0px'], delay: anime.stagger(120, { start: 750 }), easing: 'easeOutQuad', duration: 500 })
        anime({ targets: el.querySelectorAll('.gc-xlabel'), opacity: [0, 1], delay: anime.stagger(60, { start: 400 }), duration: 500 })
      },
    })
    return () => st.kill()
  }, [])

  return (
    <section id="growth" className="growth section" ref={ref}>
      <div className="wrap">
        <header className="growth__head">
          <span className="eyebrow">the growth story</span>
          <SplitReveal as="h2" className="growth__title" type="words" stagger={0.06}>
            momentum you<br />can underwrite.
          </SplitReveal>
        </header>

        <div className="growth__big">
          <div className="growth__bigstat">
            <span className="growth__num">₹<Counter value={51.14} decimals={2} /> cr</span>
            <span className="growth__cap">gross turnover · 2024-25 <em>(from ₹1.50 cr in 2016-17)</em></span>
          </div>
          <div className="growth__bigstat">
            <span className="growth__num"><Counter value={58} /></span>
            <span className="growth__cap">clients in 2024-25 <em>· up 34× since 2016-17</em></span>
          </div>
        </div>

        <div className="growth__charts">
          <Chart idx={0} accessor={(g) => g.clients} format={(v) => v} max={64} topLabel={'number of clients / year'} growthLabel={'15%'} />
          <Chart idx={1} accessor={(g) => g.cr} format={(v) => `₹${v}`} max={56} topLabel={'gross turnover · inr cr / year'} growthLabel={'25-40%'} />
        </div>
      </div>
    </section>
  )
}
