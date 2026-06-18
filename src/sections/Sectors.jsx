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
const pad2 = (n) => String(n).padStart(2, '0')

export function Sectors() {
  const root = useRef(null)
  const imgRefs = useRef([])
  const bigRefs = useRef([])
  // scroll-driven index (auto-advance) vs hover-driven override
  const [scrollIdx, setScrollIdx] = useState(0)
  const [hoverIdx, setHoverIdx] = useState(null)
  const prevActive = useRef(0)
  const mounted = useRef(false)

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

      // desktop: pin the stage and scrub the active sector 01 -> 12
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: `+=${N * 64}%`,
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

  // CINEMATIC SWAP: the huge Fraunces sector name masked-swaps; photo blooms.
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 859px)').matches

    // ---- preview photos: crossfade + parallax settle ----
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
        gsap.fromTo(el, { scale: 1.08 }, { scale: 1, duration: 1.6, ease: 'power2.out', overwrite: 'auto' })
      }
    })

    // ---- big kinetic sector name: mask-wipe the outgoing, slide-in the active ----
    if (mobile) {
      prevActive.current = active
      mounted.current = true
      return
    }
    // first render: place the active name statically, no slide
    if (!mounted.current) {
      bigRefs.current.forEach((el, i) => {
        if (!el) return
        gsap.set(el, { yPercent: i === active ? 0 : 112, opacity: i === active ? 1 : 0 })
      })
      prevActive.current = active
      mounted.current = true
      return
    }
    // OVERLAP-PROOF SWAP. A vertical wipe (slide outgoing up through centre
    // while sliding incoming up from below) breaks under fast scrubbing: a name
    // that only just began entering becomes the "outgoing" and then sweeps the
    // FULL band height back through the centre, crossing every other in-flight
    // name. Multiple names pile up at the centre baseline (the reported bug).
    //
    // Fix: there is only ever ONE visible name. On every change we kill all
    // name tweens and INSTANTLY park every non-active name (opacity 0, below the
    // band), then slide + fade in only the active one. Nothing can overlap at
    // any scroll speed because nothing else is on screen to overlap with.
    const dir = active >= prevActive.current ? 1 : -1
    bigRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.killTweensOf(el)
      if (i !== active) gsap.set(el, { yPercent: 112, opacity: 0 })
    })
    const activeEl = bigRefs.current[active]
    if (activeEl) {
      if (reduce) {
        gsap.set(activeEl, { yPercent: 0, opacity: 1 })
      } else {
        gsap.fromTo(
          activeEl,
          { yPercent: 64 * dir, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power4.out', overwrite: true },
        )
      }
    }
    prevActive.current = active
  }, [active])

  return (
    <section id="sectors" className="sx" ref={root}>
      <div className="sx__sticky">
        {/* full-bleed cinematic preview lives behind the composition */}
        <div className="sx__stage" aria-hidden>
          {SECTORS.map((s, i) => (
            <div
              key={s.name}
              ref={(el) => (imgRefs.current[i] = el)}
              className={`sx__pimg ${active === i ? 'is-on' : ''}`}
              style={{ backgroundImage: `url(${s.img})`, opacity: i === 0 ? 1 : 0 }}
            />
          ))}
          <div className="sx__veil" />
          <div className="sx__grain" />
        </div>

        <div className="sx__inner wrap">
          {/* TOP: eyebrow + the "one standard" through-line, slate-style */}
          <header className="sx__head">
            <span className="eyebrow">where we work</span>
            <span className="sx__through">
              <span className="sx__through-line" />
              <span className="sx__through-txt">one&nbsp;standard</span>
            </span>
          </header>

          {/* CENTRE: the huge kinetic sector name + a giant ghost count */}
          <div className="sx__feature">
            <span className="sx__count" aria-hidden>{pad2(N)}</span>
            <div className="sx__namestage" aria-hidden>
              {SECTORS.map((s, i) => (
                <h2
                  key={s.name}
                  ref={(el) => (bigRefs.current[i] = el)}
                  className={`sx__big ${active === i ? 'is-on' : ''}`}
                  style={i === 0 ? undefined : { opacity: 0 }}
                >
                  {s.name}
                </h2>
              ))}
            </div>
            <span className="sx__slate" aria-hidden>
              <span className="sx__slate-i">{pad2(active + 1)}</span>
              <span className="sx__slate-sep">/</span>
              <span className="sx__slate-n">{pad2(N)}</span>
            </span>
          </div>

          {/* BOTTOM: the recessed mono ledger — navigational spine */}
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
                  <span className="sx__idx">{pad2(i + 1)}</span>
                  <span className="sx__name">{s.name}</span>
                  <span className="sx__tick" aria-hidden />
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
        </div>

        {/* thin scrub progress rail along the stage foot */}
        <div className="sx__progress" aria-hidden>
          <span style={{ transform: `scaleX(${(active + 1) / N})` }} />
        </div>
      </div>
    </section>
  )
}
