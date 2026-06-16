import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SECTORS = [
  { name: 'Banking & finance', img: '/assets/hero/p-17.jpg' },
  { name: 'Insurance', img: '/assets/hero/p-32.jpg' },
  { name: 'Wealth management', img: '/assets/hero/p-26.jpg' },
  { name: 'IT & ITes', img: '/assets/hero/p-38.jpg' },
  { name: 'Corporate offices', img: '/assets/hero/p-47.jpg' },
  { name: 'Coworking', img: '/assets/hero/p-67.jpg' },
  { name: 'Industrial & logistics', img: '/assets/hero/p-59.jpg' },
  { name: 'Media & broadcast', img: '/assets/hero/p-44.jpg' },
  { name: 'Laboratories', img: '/assets/hero/p-70.jpg' },
  { name: 'Textiles & apparel', img: '/assets/hero/p-73.jpg' },
  { name: 'Quick-commerce', img: '/assets/hero/p-56.jpg' },
  { name: 'Consultancy & MEP', img: '/assets/hero/p-77.jpg' },
]

const N = SECTORS.length

// small drawn arrow — monochrome, currentColor, crisp
function Arrow() {
  return (
    <svg className="sx__arrow" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden focusable="false">
      <path d="M6 16L16 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
      <path d="M7.5 6H16V14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  )
}

export function Sectors() {
  const root = useRef(null)
  const imgRefs = useRef([])
  // scroll-driven index (auto-advance) vs hover-driven override
  const [scrollIdx, setScrollIdx] = useState(0)
  const [hoverIdx, setHoverIdx] = useState(null)

  // hover wins when present, otherwise the scrubbed scroll index
  const active = hoverIdx != null ? hoverIdx : scrollIdx

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const mobile = window.matchMedia('(max-width: 859px)').matches

      // mobile + reduced-motion: no pin, simple fade-ups, list shows its own image
      if (reduce || mobile) {
        if (reduce) {
          setScrollIdx(N - 1)
          gsap.set('.sx__item, .sx__mobshot', { opacity: 1, y: 0 })
          return
        }
        // mobile: gentle fade-ups as each row enters
        gsap.utils.toArray('.sx__row').forEach((rowEl) => {
          gsap.from(rowEl, {
            opacity: 0,
            y: 28,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: rowEl, start: 'top 85%', once: true },
          })
        })
        return
      }

      // desktop: pin the section and scrub the active sector 01 -> 12
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: `+=${N * 62}%`,
        pin: '.sx__sticky',
        scrub: 0.5,
        onUpdate: (self) => {
          // bias so each band sits cleanly on its sector
          const i = gsap.utils.clamp(0, N - 1, Math.floor(self.progress * N))
          setScrollIdx((prev) => (prev === i ? prev : i))
        },
      })
      return () => st.kill()
    }, root)
    return () => ctx.revert()
  }, [])

  // premium crossfade + subtle scale settle whenever the active image changes
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    imgRefs.current.forEach((el, i) => {
      if (!el) return
      const on = i === active
      if (reduce) {
        gsap.set(el, { opacity: on ? 1 : 0, scale: 1 })
        return
      }
      gsap.to(el, {
        opacity: on ? 1 : 0,
        duration: on ? 1.05 : 0.7,
        ease: on ? 'power2.out' : 'power1.out',
        overwrite: 'auto',
      })
      if (on) {
        gsap.fromTo(el, { scale: 1.05 }, { scale: 1, duration: 1.3, ease: 'power2.out', overwrite: 'auto' })
      }
    })
  }, [active])

  return (
    <section id="sectors" className="sx" ref={root}>
      <div className="sx__sticky">
        <div className="sx__inner wrap">
          <header className="sx__head">
            <span className="eyebrow">Where we work</span>
            <h2 className="sx__title">Twelve sectors.<br />One standard.</h2>
          </header>

          <div className="sx__body">
            {/* LIST */}
            <ul className="sx__list">
              {SECTORS.map((s, i) => (
                <li
                  key={s.name}
                  className={`sx__row ${active === i ? 'is-active' : ''}`}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  data-cursor=""
                >
                  <span className="sx__item">
                    <span className="sx__idx">{String(i + 1).padStart(2, '0')}</span>
                    <span className="sx__name">{s.name}</span>
                    <Arrow />
                  </span>
                  {/* mobile-only inline image */}
                  <span
                    className="sx__mobshot"
                    style={{ backgroundImage: `url(${s.img})` }}
                    aria-hidden
                  />
                </li>
              ))}
            </ul>

            {/* STICKY PREVIEW (desktop) */}
            <div className="sx__previewcol" aria-hidden>
              <div className="sx__preview">
                <div className="sx__frame">
                  {SECTORS.map((s, i) => (
                    <div
                      key={s.name}
                      ref={(el) => (imgRefs.current[i] = el)}
                      className={`sx__pimg ${active === i ? 'is-on' : ''}`}
                      style={{ backgroundImage: `url(${s.img})`, opacity: i === 0 ? 1 : 0 }}
                    />
                  ))}
                  <div className="sx__veil" />
                </div>
                <div className="sx__caption">
                  <span className="sx__capidx">{String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
                  <span className="sx__capname">{SECTORS[active].name}</span>
                </div>
                <div className="sx__progress">
                  <span style={{ transform: `scaleX(${(active + 1) / N})` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
