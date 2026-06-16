import { useRef, useState, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { SplitReveal } from '../components/Reveal'

const hero = (n) => `/assets/hero/p-${String(n).padStart(2, '0')}.jpg`

const SECTORS = [
  { name: 'banking & finance', img: hero(17) },
  { name: 'insurance', img: hero(32) },
  { name: 'wealth management', img: hero(26) },
  { name: 'IT & ITes', img: hero(38) },
  { name: 'corporate offices', img: hero(47) },
  { name: 'coworking', img: hero(67) },
  { name: 'industrial & logistics', img: hero(59) },
  { name: 'media & broadcast', img: hero(44) },
  { name: 'laboratories', img: hero(70) },
  { name: 'textiles & apparel', img: hero(73) },
  { name: 'quick-commerce', img: hero(56) },
  { name: 'consultancy & MEP', img: hero(77) },
]

export function Sectors() {
  const [active, setActive] = useState(0)
  const imgRefs = useRef([])
  const itemRefs = useRef([])
  const listRef = useRef(null)
  const previewRef = useRef(null)
  const yTo = useRef(null)

  useLayoutEffect(() => {
    if (previewRef.current) yTo.current = gsap.quickTo(previewRef.current, 'y', { duration: 0.7, ease: 'expo.out' })
  }, [])

  // the preview glides DOWN to sit beside the active sector as you move down the list
  const follow = (i) => {
    setActive(i)
    const item = itemRefs.current[i]
    const list = listRef.current
    const preview = previewRef.current
    if (!item || !list || !preview || !yTo.current) return
    const max = Math.max(0, list.offsetHeight - preview.offsetHeight)
    const target = gsap.utils.clamp(0, max, item.offsetTop - preview.offsetHeight / 2 + item.offsetHeight / 2)
    yTo.current(target)
  }

  const onMove = (e) => {
    const el = imgRefs.current[active]
    if (!el) return
    const r = el.parentElement.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height
    gsap.to(el, { x: dx * 16, y: dy * 16, duration: 0.6, ease: 'power3' })
  }

  return (
    <section id="sectors" className="sectors section" onMouseMove={onMove}>
      <div className="wrap">
        <header className="sectors__head">
          <span className="eyebrow">where we work</span>
          <SplitReveal as="h2" className="sectors__title" type="words" stagger={0.06}>
            twelve sectors.<br />one standard.
          </SplitReveal>
        </header>

        <div className="sectors__body">
          <ul className="sectors__list" ref={listRef}>
            {SECTORS.map((s, i) => (
              <li
                key={s.name}
                ref={(el) => (itemRefs.current[i] = el)}
                className={`sectors__item ${active === i ? 'is-hot' : ''}`}
                onMouseEnter={() => follow(i)}
                data-cursor=""
              >
                <span className="sectors__idx">{String(i + 1).padStart(2, '0')}</span>
                <span className="sectors__name">{s.name}</span>
                <span className="sectors__arrow">↗</span>
              </li>
            ))}
          </ul>

          <div className="sectors__previewcol">
            <div className="sectors__preview" ref={previewRef} aria-hidden>
              {SECTORS.map((s, i) => (
                <div
                  key={s.name}
                  ref={(el) => (imgRefs.current[i] = el)}
                  className="sectors__pimg"
                  style={{ backgroundImage: `url(${s.img})`, opacity: active === i ? 1 : 0 }}
                />
              ))}
              <div className="sectors__plabel">{SECTORS[active].name}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
