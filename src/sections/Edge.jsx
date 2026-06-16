import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { edge } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

export function Edge() {
  const root = useRef(null)
  const nodeRef = useRef(null)
  const fillRef = useRef(null)
  const wordRef = useRef(null)
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const n = edge.length
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: `+=${reduce ? 0 : n * 60}%`,
        pin: !reduce,
        scrub: reduce ? false : 0.5,
        onUpdate: (self) => {
          const p = self.progress
          const i = Math.min(n - 1, Math.floor(p * n))
          setActive(i)
          if (nodeRef.current) gsap.set(nodeRef.current, { left: `${4 + p * 92}%` })
          if (fillRef.current) gsap.set(fillRef.current, { width: `${4 + p * 92}%` })
          if (wordRef.current) gsap.set(wordRef.current, { xPercent: -p * 26 })
        },
      })
      if (reduce) setActive(n - 1)
      return () => st.kill()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="edge" className="edge" ref={root}>
      <div className="edge__sticky grain">
        <div className="edge__word" ref={wordRef} aria-hidden>EDGE</div>

        <div className="edge__inner wrap">
          <header className="edge__head">
            <span className="eyebrow">the mdw edge</span>
            <h2 className="edge__title">locate · evaluate · create · operate</h2>
            <p className="edge__lede">one platform from site-search to facility lifecycle · single point of accountability, optimised financial decisions, design excellence.</p>
          </header>

          <div className="edge__rail">
            <div className="edge__track"><div className="edge__fill" ref={fillRef} /></div>
            <div className="edge__node" ref={nodeRef}><span /></div>
            <ul className="edge__steps">
              {edge.map((s, i) => (
                <li key={s.step} className={i === active ? 'is-active' : i < active ? 'is-done' : ''}>
                  <em>{String(i + 1).padStart(2, '0')}</em>
                  <span>{s.step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="edge__panels">
            {edge.map((s, i) => (
              <div key={s.step} className={`edge__panel ${i === active ? 'is-active' : ''}`}>
                <div className="edge__paneltag">{s.tag}</div>
                <h3>{s.step}</h3>
                <p>{s.desc}</p>
                <ul>
                  {s.details.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
