import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { growth } from '../data/site'
import { Counter } from '../components/Counter'
import { SplitReveal } from '../components/Reveal'

gsap.registerPlugin(ScrollTrigger)

// ── chart geometry (viewBox 0..100 × 0..62, wide editorial aspect) ───────
// A clean line/area chart: one drawn line per metric, a sparse value grid
// with a real left scale, a strong baseline, tiny node dots and ONE big
// end-value callout. No bars, no boxed tags — confident negative space.
const VW = 100
const VH = 62
const PADX = 4           // x inset for the first/last node centre
const PADT = 9           // headroom above the tallest value
const PADB = 9           // baseline inset (axis sits here)
const BASE = VH - PADB   // y of the baseline
const n = growth.length

const xPct = (i) => PADX + (i / (n - 1)) * (VW - PADX * 2)
const yPct = (v, max) => PADT + (1 - v / max) * (BASE - PADT)
// left → percentage for HTML-overlaid labels (matches the svg x scale)
const xLeft = (i) => (xPct(i) / VW) * 100
const yTop = (v, max) => (yPct(v, max) / VH) * 100

// Catmull-Rom → cubic Bézier: one smooth curve that passes THROUGH every node
// (so the dots stay dead on the line) instead of jagged straight segments.
// Returns just the C-command segments; callers prefix their own M/L start.
function smoothCurve(pts) {
  if (pts.length < 2) return ''
  const f = 1 / 6 // control-point reach — keeps the curve tight to the data
  const seg = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) * f
    const c1y = p1.y + (p2.y - p0.y) * f
    const c2x = p2.x - (p3.x - p1.x) * f
    const c2y = p2.y - (p3.y - p1.y) * f
    seg.push(`C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`)
  }
  return seg.join(' ')
}

function Chart({ accessor, format, max, gridStep, gridFmt, label, end, endUnit, growthLabel, idx }) {
  const pts = growth.map((g, i) => {
    const v = accessor(g)
    return { x: xPct(i), y: yPct(v, max), v, g, i }
  })
  // smooth curve through all nodes; share it between the stroke + the fill
  const curve = smoothCurve(pts)
  const x0 = pts[0].x.toFixed(2)
  const y0 = pts[0].y.toFixed(2)
  const xN = pts[n - 1].x.toFixed(2)
  const lineD = `M ${x0},${y0} ${curve}`
  const areaD = `M ${x0},${BASE} L ${x0},${y0} ${curve} L ${xN},${BASE} Z`

  // value gridlines: a real reference scale on the left, every gridStep
  // strictly below the chart's max (keeps the top line off the headroom).
  const grids = []
  for (let g = gridStep; g < max; g += gridStep) grids.push(g)

  const last = pts[n - 1]
  const covid = pts.find((p) => p.g.covid)

  return (
    <article className={`gchart gchart--${idx}`} data-chart={idx}>
      <header className="gchart__top">
        <span className="gchart__metric">{label}</span>
        <span className="gchart__growth">
          <em>avg / yr</em>
          <strong>{growthLabel}</strong>
        </span>
      </header>

      <div className="gchart__plot">
        {/* canvas spans only the plotting width; the svg + every overlaid
            label share THIS box's coordinate space (so dots/labels sit dead
            on the line). The big end-callout overflows right into the plot's
            padding. */}
        <div className="gchart__canvas">
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="gchart__svg" aria-hidden>
          <defs>
            <linearGradient id={`gfill-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            {/* reveal mask: GSAP grows this rect's width 0 → 100 to wipe the
                solid line + area on left-to-right. The line is NEVER dashed, so
                it always renders continuous (no break-up under the stretch). */}
            <clipPath id={`greveal-${idx}`}>
              <rect className="gc-reveal" x="0" y="0" width={VW} height={VH} />
            </clipPath>
          </defs>

          {/* sparse value grid */}
          {grids.map((g) => {
            const y = yPct(g, max)
            return <line key={g} className="gc-grid" x1={PADX} x2={VW - PADX} y1={y} y2={y} />
          })}

          {/* covid vertical marker (greyed, behind the line) */}
          {covid && (
            <line className="gc-covidline" x1={covid.x} x2={covid.x} y1={PADT - 3} y2={BASE} />
          )}

          {/* area + line revealed together by the growing clip rect */}
          <g clipPath={`url(#greveal-${idx})`}>
            {/* area fill under the line (smooth) */}
            <path className="gc-area" d={areaD} fill={`url(#gfill-${idx})`} />

            {/* THE solid trend line (smooth curve through every node) */}
            <path
              className="gc-line"
              d={lineD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.4"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>

          {/* baseline axis (draws across) */}
          <line className="gc-axis" x1={PADX} x2={VW - PADX} y1={BASE} y2={BASE} />
        </svg>

        {/* left value scale */}
        {grids.map((g) => (
          <span key={`v${g}`} className="gc-vlabel" style={{ top: `${yTop(g, max)}%` }}>
            {gridFmt(g)}
          </span>
        ))}

        {/* node dots (intermediate small, covid greyed, last is the hero) */}
        {pts.map((p) => (
          <span
            key={`d${p.i}`}
            className={`gc-dot ${p.g.covid ? 'is-covid' : ''} ${p.i === n - 1 ? 'is-last' : ''}`}
            style={{ left: `${xLeft(p.i)}%`, top: `${(p.y / VH) * 100}%` }}
          />
        ))}

        {/* covid dip label — the only intermediate annotation */}
        {covid && (
          <span className="gc-covid" style={{ left: `${xLeft(covid.i)}%`, top: `${(covid.y / VH) * 100}%` }}>
            <span className="gc-covid__yr">covid · {covid.g.year}</span>
            <span className="gc-covid__val">{format(covid.v)}</span>
          </span>
        )}

        {/* ONE big end-value callout — anchored to the canvas right edge so
            it sits cleanly in the reserved padding, vertically on the node */}
        <span className="gc-end" style={{ top: `${(last.y / VH) * 100}%` }}>
          <span className="gc-end__val">{format(last.v)}</span>
          <span className="gc-end__unit">{endUnit}</span>
        </span>

        {/* x-axis year labels */}
        {growth.map((g, i) => (
          <span key={`x${i}`} className={`gc-xlabel ${g.covid ? 'is-covid' : ''}`} style={{ left: `${xLeft(i)}%` }}>
            {g.year}
          </span>
        ))}
        </div>
      </div>
    </article>
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

      // Centring offsets for the HTML-overlaid labels are owned by GSAP
      // (xPercent/yPercent) — NOT a CSS translate() — because GSAP animates
      // y/scale on them and would otherwise clobber a CSS transform.

      // final, fully-shown state for a chart (used for reduced motion + as the
      // animation's end state). The reveal rect at full width = whole line shown.
      const showFinal = (scope) => {
        gsap.set(scope.querySelectorAll('.gc-reveal'), { attr: { width: VW } })
        gsap.set(scope.querySelectorAll('.gc-area'), { opacity: 1 })
        gsap.set(scope.querySelectorAll('.gc-axis'), { opacity: 1, scaleX: 1 })
        gsap.set(scope.querySelectorAll('.gc-grid, .gc-covidline, .gc-vlabel'), { opacity: 1 })
        gsap.set(scope.querySelectorAll('.gc-dot'), { opacity: 1, scale: 1 })
        gsap.set(scope.querySelectorAll('.gc-xlabel'), { opacity: 1, xPercent: -50, y: 0 })
        gsap.set(scope.querySelectorAll('.gc-end'), { opacity: 1, yPercent: -50, y: 0, scale: 1 })
        gsap.set(scope.querySelectorAll('.gc-covid'), { opacity: 1, xPercent: -50, yPercent: -135, y: 0 })
      }

      if (reduce) {
        showFinal(el)
        return
      }

      // initial state: frame hidden, line+area present but clipped to width 0
      gsap.set(el.querySelectorAll('.gc-reveal'), { attr: { width: 0 } })
      gsap.set(el.querySelectorAll('.gc-area'), { opacity: 1 })
      gsap.set(el.querySelectorAll('.gc-grid, .gc-covidline'), { opacity: 0 })
      gsap.set(el.querySelectorAll('.gc-axis'), { opacity: 0, scaleX: 0, transformOrigin: 'left center' })
      gsap.set(el.querySelectorAll('.gc-vlabel'), { opacity: 0 })
      gsap.set(el.querySelectorAll('.gc-dot'), { opacity: 0, scale: 0.6 })
      gsap.set(el.querySelectorAll('.gc-xlabel'), { opacity: 0, xPercent: -50, y: 5 })
      gsap.set(el.querySelectorAll('.gc-end'), { opacity: 0, yPercent: -50, y: 10, scale: 0.96 })
      gsap.set(el.querySelectorAll('.gc-covid'), { opacity: 0, xPercent: -50, yPercent: -135, y: 6 })

      // ── ONE play-once timeline (NOT scrubbed) drives BOTH charts in step ──
      // The line is solid and revealed by growing the clip rect 0 → 100, so it
      // is always continuous — never cut, never re-drawn on scroll.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el.querySelector('.growth__charts'), start: 'top 78%', once: true },
      })

      charts.forEach((chart) => {
        const reveal = chart.querySelector('.gc-reveal')
        const grid = chart.querySelectorAll('.gc-grid')
        const vlabels = chart.querySelectorAll('.gc-vlabel')
        const axis = chart.querySelector('.gc-axis')
        const covidLine = chart.querySelector('.gc-covidline')
        const dots = chart.querySelectorAll('.gc-dot')
        const xlabels = chart.querySelectorAll('.gc-xlabel')
        const end = chart.querySelector('.gc-end')
        const covid = chart.querySelector('.gc-covid')

        // 1 — frame settles in first (both charts share absolute positions)
        tl.to(axis, { scaleX: 1, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
        tl.to(grid, { opacity: 1, duration: 0.5, stagger: 0.05 }, 0.05)
        tl.to(vlabels, { opacity: 1, duration: 0.5, stagger: 0.05 }, 0.1)
        tl.to(xlabels, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' }, 0.1)

        // 2 — THE DRAW: clip rect width 0 → 100 wipes the solid line + area on
        tl.to(reveal, { attr: { width: VW }, duration: 1.5, ease: 'power2.inOut' }, 0.3)
        if (covidLine) tl.to(covidLine, { opacity: 1, duration: 0.5 }, 0.8)

        // 3 — node dots fade in left-to-right, in step with the wipe
        tl.to(dots, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.13, ease: 'power2.out' }, 0.45)

        // 4 — annotations settle last: covid dip label, then the big end value
        if (covid) tl.to(covid, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.55)
        tl.to(end, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }, 1.7)
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
          <Chart
            idx={0}
            accessor={(g) => g.clients}
            format={(v) => `${v}`}
            max={64}
            gridStep={20}
            gridFmt={(g) => `${g}`}
            label={'clients / year'}
            endUnit={'clients · 24-25'}
            growthLabel={'15%'}
          />
          <Chart
            idx={1}
            accessor={(g) => g.cr}
            format={(v) => `₹${v}`}
            max={56}
            gridStep={20}
            gridFmt={(g) => `₹${g}`}
            label={'gross turnover · inr cr / year'}
            endUnit={'cr · 24-25'}
            growthLabel={'25–40%'}
          />
        </div>
      </div>
    </section>
  )
}
