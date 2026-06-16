import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { edge } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

export function Edge() {
  const root = useRef(null)
  const stageRefs = useRef([])
  const lineRef = useRef(null)
  const counterRef = useRef(null)
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const mobile = window.matchMedia('(max-width: 820px)').matches
      const n = edge.length
      const stages = stageRefs.current.filter(Boolean)

      // ---- MOBILE / REDUCED: clean stacked, every chapter fully visible, no pin ----
      if (reduce || mobile) {
        // clearProps must run on its own — in a combined set() GSAP applies
        // clearProps last and would wipe the opacity/autoAlpha we just set.
        gsap.set(stages, { clearProps: 'all' })
        gsap.set(stages, { opacity: 1, autoAlpha: 1 })
        if (lineRef.current) gsap.set(lineRef.current, { scaleY: 1 })
        setActive(n - 1)
        if (counterRef.current) counterRef.current.textContent = String(n).padStart(2, '0')
        return
      }

      // ---- DESKTOP: pinned split-stage, masked chapter cross-fade ----
      // each chapter occupies the stage; we reveal it with a clip wipe + lift,
      // and let the previous recede. Only the active one is interactive.
      stages.forEach((el, i) => {
        gsap.set(el, {
          autoAlpha: i === 0 ? 1 : 0,
          yPercent: i === 0 ? 0 : 6,
          clipPath: i === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
        })
      })
      if (lineRef.current) gsap.set(lineRef.current, { scaleY: 0 })

      let current = 0
      const show = (i) => {
        if (i === current) return
        const incoming = stages[i]
        const dir = i > current ? 1 : -1
        // OVERLAP-PROOF. The chapters are absolutely stacked, so any chapter
        // left mid-fade shows through. Under a fast scrub, step 2->3->4 each
        // started a 0.55s/0.65s tween on a DIFFERENT element; overwrite only
        // clears tweens on the same target, so two or three chapters stayed
        // partially visible and overlapped (the reported bug).
        //
        // Kill EVERY chapter's tweens and instantly hide all but the incoming,
        // then wipe in only the incoming. Never more than one chapter on screen.
        stages.forEach((el) => {
          if (!el) return
          gsap.killTweensOf(el)
          if (el !== incoming) {
            gsap.set(el, {
              autoAlpha: 0,
              yPercent: 6,
              clipPath: 'inset(0% 0% 100% 0%)',
              willChange: 'auto',
            })
          }
        })
        gsap.set(incoming, { willChange: 'transform, opacity, clip-path' })
        // wipe in the new chapter
        gsap.fromTo(
          incoming,
          {
            autoAlpha: 0,
            yPercent: 6 * dir,
            clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
          },
          {
            autoAlpha: 1,
            yPercent: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.6,
            ease: 'power3.out',
            overwrite: true,
            onComplete: () => gsap.set(incoming, { willChange: 'auto' }),
          }
        )
        current = i
      }

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: () => `+=${n * 62}%`,
        pin: '.edge__sticky',
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress
          // map progress -> step index with a small dwell at the ends
          const i = Math.min(n - 1, Math.max(0, Math.floor(p * n - 1e-6)))
          if (lineRef.current) {
            gsap.set(lineRef.current, { scaleY: gsap.utils.clamp(0, 1, (i + 0.5) / n) })
          }
          if (counterRef.current) {
            counterRef.current.textContent = String(i + 1).padStart(2, '0')
          }
          if (i !== current) {
            show(i)
            setActive(i)
          }
        },
      })

      return () => st.kill()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="edge" className="edge" ref={root}>
      <div className="edge__sticky grain">
        <div className="edge__bg" aria-hidden>edge</div>

        <div className="edge__inner wrap">
          {/* ---- left column: the operating index ---- */}
          <aside className="edge__aside">
            <span className="eyebrow">the mdw edge</span>
            <p className="edge__lede">
              one platform — site-search to facility lifecycle. a single line
              of accountability across every decision.
            </p>

            <nav className="edge__index" aria-label="the mdw edge — six stages">
              <span className="edge__rail" aria-hidden>
                <span className="edge__rail-fill" ref={lineRef} />
              </span>
              <ol>
                {edge.map((s, i) => (
                  <li
                    key={s.step}
                    className={
                      i === active ? 'is-active' : i < active ? 'is-done' : ''
                    }
                  >
                    <em>{String(i + 1).padStart(2, '0')}</em>
                    <span>{s.step}</span>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* ---- right column: the chapter stage ---- */}
          <div className="edge__stage">
            <span className="edge__counter" aria-hidden>
              <b ref={counterRef}>01</b>
              <i>/ {String(edge.length).padStart(2, '0')}</i>
            </span>

            <div className="edge__chapters">
              {edge.map((s, i) => (
                <article
                  key={s.step}
                  ref={(el) => (stageRefs.current[i] = el)}
                  className="edge__chapter"
                  aria-hidden={i !== active}
                >
                  <span className="edge__chapter-tag">{s.tag}</span>
                  <h3 className="edge__chapter-name">{s.step}</h3>
                  <p className="edge__chapter-desc">{s.desc}</p>
                  <ul className="edge__spec">
                    {s.details.map((d, di) => (
                      <li key={d}>
                        <em>{String(di + 1).padStart(2, '0')}</em>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
