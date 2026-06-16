import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { growth } from '../data/site'
import { Counter } from '../components/Counter'
import { SplitReveal } from '../components/Reveal'

gsap.registerPlugin(ScrollTrigger)

// ── chart geometry (viewBox 0..100 × 0..100) ─────────────────
const PADX = 7          // horizontal inset for first/last column centre
const PADT = 16         // headroom above the tallest value
const PADB = 13         // baseline inset from the bottom (axis sits here)
const BASE = 100 - PADB // y of the baseline
const n = growth.length

const colW = (100 - PADX * 2) / (n - 1)          // gap between columns
const barW = Math.min(colW * 0.5, 5.4)           // bar width in viewBox units
const xPct = (i) => PADX + (i / (n - 1)) * (100 - PADX * 2)
const yPct = (v, max) => PADT + (1 - v / max) * (BASE - PADT)

function Chart({ accessor, format, max, topLabel, growthLabel, idx }) {
  const pts = growth.map((g, i) => {
    const v = accessor(g)
    return { x: xPct(i), y: yPct(v, max), v, g, i }
  })
  const line = pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  const area = `${pts[0].x.toFixed(2)},${BASE} ${line} ${pts[n - 1].x.toFixed(2)},${BASE}`

  return (
    <div className={`gchart gchart--${idx}`} data-chart={idx}>
      <div className="gchart__top">
        <span className="gchart__metric">{topLabel}</span>
        <span className="gchart__growth">
          <em>avg growth</em>
          <strong>{growthLabel}</strong>
          <em>/ year</em>
        </span>
      </div>

      <div className="gchart__plot">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="gchart__svg" aria-hidden>
          <defs>
            <linearGradient id={`gfill-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <linearGradient id={`gbar-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.30)" />
            </linearGradient>
            <linearGradient id={`gbar-covid-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(150,150,150,0.62)" />
              <stop offset="100%" stopColor="rgba(150,150,150,0.10)" />
            </linearGradient>
          </defs>

          {/* horizontal grid */}
          {[0.25, 0.5, 0.75].map((g) => {
            const y = PADT + g * (BASE - PADT)
            return <line key={g} className="gc-grid" x1={PADX} x2={100 - PADX} y1={y} y2={y} />
          })}

          {/* rising bars (covid bar in grey) */}
          {pts.map((p) => {
            const h = BASE - p.y
            return (
              <g key={`b${p.i}`} className={`gc-barwrap ${p.g.covid ? 'is-covid' : ''}`}>
                <rect
                  className="gc-bar"
                  x={(p.x - barW / 2).toFixed(2)}
                  width={barW.toFixed(2)}
                  y={p.y.toFixed(2)}
                  height={Math.max(h, 0.001).toFixed(3)}
                  fill={`url(#${p.g.covid ? `gbar-covid-${idx}` : `gbar-${idx}`})`}
                />
              </g>
            )
          })}

          {/* area + drawn trend line */}
          <polygon className="gc-area" points={area} fill={`url(#gfill-${idx})`} opacity="0" />
          <polyline
            className="gc-line"
            points={line}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* baseline axis (draws across) */}
          <line className="gc-axis" x1={PADX} x2={100 - PADX} y1={BASE} y2={BASE} />
        </svg>

        {/* node dots */}
        {pts.map((p) => (
          <span
            key={`d${p.i}`}
            className={`gc-dot ${p.g.covid ? 'is-covid' : ''} ${p.i === n - 1 ? 'is-last' : ''}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}

        {/* value tags */}
        {pts.map((p) => (
          <span
            key={`t${p.i}`}
            className={`gc-tag ${p.g.covid ? 'is-covid' : ''} ${p.i === n - 1 ? 'is-last' : ''}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {format(p.v)}
          </span>
        ))}

        {/* x-axis year labels */}
        {growth.map((g, i) => (
          <span key={`x${i}`} className={`gc-xlabel ${g.covid ? 'is-covid' : ''}`} style={{ left: `${xPct(i)}%` }}>
            {g.year}
          </span>
        ))}

        {/* covid marker */}
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

    const ctx = gsap.context(() => {
      const charts = gsap.utils.toArray('.gchart', el)

      // prime each line's dash so it can be "drawn"
      el.querySelectorAll('.gc-line').forEach((path) => {
        const len = path.getTotalLength()
        path.style.strokeDasharray = len
        path.style.strokeDashoffset = reduce ? 0 : len
      })

      // ── reduced motion · render the final drawn state instantly ──
      // NOTE: tags + x-labels are centred via GSAP xPercent/yPercent (not a
      // CSS transform) because GSAP animates y on them and would otherwise
      // clobber a CSS translate() centring offset.
      if (reduce) {
        gsap.set(el.querySelectorAll('.gc-bar'), { scaleY: 1, opacity: 1 })
        gsap.set(el.querySelectorAll('.gc-area, .gc-axis, .gc-grid'), { opacity: 1 })
        gsap.set(el.querySelectorAll('.gc-dot'), { opacity: 1, scale: 1 })
        gsap.set(el.querySelectorAll('.gc-tag'), { opacity: 1, xPercent: -50, yPercent: -165, y: 0, scale: 1 })
        gsap.set(el.querySelectorAll('.gc-xlabel'), { opacity: 1, xPercent: -50, y: 0 })
        gsap.set(el.querySelectorAll('.gc-covid'), { opacity: 1, xPercent: -50 })
        return
      }

      // initial hidden state (so nothing shows before its scroll cue)
      gsap.set(el.querySelectorAll('.gc-bar'), { scaleY: 0, transformOrigin: '50% 100%' })
      gsap.set(el.querySelectorAll('.gc-grid'), { opacity: 0 })
      gsap.set(el.querySelectorAll('.gc-axis'), { opacity: 0, scaleX: 0, transformOrigin: 'left center' })
      gsap.set(el.querySelectorAll('.gc-dot'), { opacity: 0, scale: 0 })
      gsap.set(el.querySelectorAll('.gc-tag'), { opacity: 0, xPercent: -50, yPercent: -165, y: 8, scale: 0.9 })
      gsap.set(el.querySelectorAll('.gc-xlabel'), { opacity: 0, xPercent: -50, y: 4 })
      gsap.set(el.querySelectorAll('.gc-covid'), { opacity: 0, xPercent: -50 })

      // one scrubbed timeline drives BOTH charts as you scroll through.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top 78%',
          end: 'bottom 62%',
          scrub: 0.6,
        },
      })

      charts.forEach((chart, ci) => {
        const at = ci * 0.5 // stagger the two charts down the scroll
        const bars = chart.querySelectorAll('.gc-bar')
        const grid = chart.querySelectorAll('.gc-grid')
        const axis = chart.querySelector('.gc-axis')
        const lineEl = chart.querySelector('.gc-line')
        const areaEl = chart.querySelector('.gc-area')
        const dots = chart.querySelectorAll('.gc-dot')
        const tags = chart.querySelectorAll('.gc-tag')
        const xlabels = chart.querySelectorAll('.gc-xlabel')
        const covid = chart.querySelector('.gc-covid')
        const len = lineEl.getTotalLength()

        // axis + grid establish the frame first
        tl.to(axis, { scaleX: 1, opacity: 1, duration: 0.18 }, at)
        tl.to(grid, { opacity: 1, duration: 0.22, stagger: 0.03 }, at + 0.02)

        // bars rise from the baseline, left → right
        tl.to(bars, { scaleY: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' }, at + 0.05)

        // x-axis years fade in beneath their bars
        tl.to(xlabels, { opacity: 1, y: 0, duration: 0.35, stagger: 0.045 }, at + 0.08)

        // the trend line draws on, scrubbed to scroll
        tl.fromTo(lineEl, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.85 }, at + 0.1)

        // area fills under the line as it draws
        tl.to(areaEl, { opacity: 1, duration: 0.6 }, at + 0.18)

        // dots pop on each node in sequence, then value tags rise
        tl.to(dots, { opacity: 1, scale: 1, duration: 0.32, stagger: 0.06, ease: 'back.out(2.2)' }, at + 0.22)
        tl.to(tags, { opacity: 1, y: 0, scale: 1, duration: 0.32, stagger: 0.06, ease: 'power2.out' }, at + 0.26)

        // covid marker resolves last
        tl.to(covid, { opacity: 1, duration: 0.3 }, at + 0.34)
      })
    }, ref)

    return () => ctx.revert()
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
