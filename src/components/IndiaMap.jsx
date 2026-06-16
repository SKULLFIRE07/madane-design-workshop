import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { INDIA_PATH, INDIA_TRANSFORM } from './indiaPath'

gsap.registerPlugin(ScrollTrigger)

// crisp vector India in 1024×1024 space; viewBox windowed to India's bbox
const VB = { x: 24, y: 36, w: 632, h: 952 }
const HQ = { x: 142, y: 622 }
const CITIES = [
  { n: 'mumbai', x: 142, y: 622, hq: true },
  { n: 'pune', x: 168, y: 638 },
  { n: 'delhi', x: 227, y: 324, big: true },
  { n: 'jaipur', x: 200, y: 376 },
  { n: 'chandigarh', x: 219, y: 262 },
  { n: 'ahmedabad', x: 138, y: 497, big: true },
  { n: 'surat', x: 148, y: 552 },
  { n: 'indore', x: 201, y: 506 },
  { n: 'nagpur', x: 264, y: 555 },
  { n: 'lucknow', x: 300, y: 378 },
  { n: 'varanasi', x: 339, y: 426, big: true },
  { n: 'kolkata', x: 444, y: 511, big: true },
  { n: 'bhubaneswar', x: 394, y: 581 },
  { n: 'hyderabad', x: 252, y: 671, big: true },
  { n: 'bengaluru', x: 235, y: 805, big: true },
  { n: 'chennai', x: 287, y: 800, big: true },
  { n: 'kochi', x: 209, y: 895 },
  { n: 'guwahati', x: 505, y: 400, big: true },
]
const ARC_TARGETS = ['delhi', 'kolkata', 'bengaluru', 'hyderabad', 'chennai', 'guwahati', 'ahmedabad', 'varanasi', 'jaipur']

const arcs = ARC_TARGETS.map((name) => {
  const c = CITIES.find((x) => x.n === name)
  const mx = (HQ.x + c.x) / 2 + (c.y - HQ.y) * 0.1
  const my = (HQ.y + c.y) / 2 - Math.abs(HQ.x - c.x) * 0.32 - 50
  const ang = (Math.atan2(c.y - my, c.x - mx) * 180) / Math.PI
  return { name, c, d: `M ${HQ.x} ${HQ.y} Q ${mx} ${my} ${c.x} ${c.y}`, ang }
})

const px = (x) => `${((x - VB.x) / VB.w) * 100}%`
const py = (y) => `${((y - VB.y) / VB.h) * 100}%`

export function IndiaMap() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      el.classList.add('is-lit')
      gsap.set('.im-arc', { strokeDasharray: 1, strokeDashoffset: 1 })
      gsap.set('.im-head', { opacity: 0, scale: 0 })
      gsap.set('.im-pin', { opacity: 0, scale: 0 })

      if (reduce) {
        gsap.set('.im-arc', { strokeDashoffset: 0 })
        gsap.set('.im-head, .im-pin', { opacity: 1, scale: 1 })
        return
      }
      gsap.to('.im-pin', { opacity: 1, scale: 1, ease: 'back.out(2)', duration: 0.5, stagger: 0.03, scrollTrigger: { trigger: el, start: 'top 82%', once: true } })

      // arrows travel out to the cities as you scroll the section
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 50%', scrub: 0.7 } })
      arcs.forEach((a, i) => {
        tl.to(`.im-arc[data-i="${i}"]`, { strokeDashoffset: 0, ease: 'none', duration: 1 }, i * 0.55)
          .to(`.im-head[data-i="${i}"]`, { opacity: 1, scale: 1, ease: 'back.out(2)', duration: 0.35 }, i * 0.55 + 0.8)
      })
      gsap.to('.im-pulse', { scale: 4, opacity: 0, ease: 'sine.out', duration: 2.4, repeat: -1, stagger: 0.2, scrollTrigger: { trigger: el, start: 'top 82%' } })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div className="indiamap" ref={ref}>
      <div className="indiamap__glow" aria-hidden />
      <svg className="indiamap__svg" viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} aria-hidden>
        <defs>
          <linearGradient id="im-land" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#f4f4f4" />
            <stop offset="55%" stopColor="#c8c8c8" />
            <stop offset="100%" stopColor="#6e6e6e" />
          </linearGradient>
        </defs>
        <g transform={INDIA_TRANSFORM}>
          <path className="im-land" d={INDIA_PATH} fill="url(#im-land)" />
        </g>
        {arcs.map((a, i) => (
          <path key={a.name} className="im-arc" data-i={i} d={a.d} pathLength="1" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        ))}
        {arcs.map((a, i) => (
          <g key={`h${a.name}`} className="im-head" data-i={i} transform={`translate(${a.c.x} ${a.c.y}) rotate(${a.ang})`} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <path d="M0 0 L-19 -11 L-19 11 Z" fill="#fff" />
          </g>
        ))}
        {CITIES.map((c) => (
          <g key={c.n} className="im-pin" transform={`translate(${c.x} ${c.y})`} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            {c.hq && <circle className="im-pulse" r="10" fill="none" stroke="#fff" strokeWidth="2.5" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />}
            <circle r={c.hq ? 9 : c.big ? 6 : 4} fill={c.hq ? '#000' : '#111'} stroke="#fff" strokeWidth={c.hq ? 3 : 2} />
            {c.hq && <circle r="3" fill="#fff" />}
          </g>
        ))}
      </svg>
      <div className="indiamap__labels">
        {CITIES.filter((c) => c.hq || c.big).map((c) => (
          <span key={c.n} className={`im-label ${c.hq ? 'is-hq' : ''}`} style={{ left: px(c.x), top: py(c.y) }}>
            {c.hq ? 'mumbai · hq' : c.n}
          </span>
        ))}
      </div>
    </div>
  )
}
