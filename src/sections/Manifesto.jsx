import { useLayoutEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { manifesto, brand } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

export function Manifesto() {
  const root = useRef(null)

  // tokenize, flagging the "THINK TO INNOVATE" refrain
  const tokens = useMemo(() => {
    const words = manifesto.split(/\s+/)
    return words.map((w, i) => {
      const prev2 = `${words[i - 2] || ''} ${words[i - 1] || ''} ${w}`.toUpperCase()
      const next = `${w} ${words[i + 1] || ''} ${words[i + 2] || ''}`.toUpperCase()
      const isRefrain =
        /THINK\s+TO\s+INNOVATE/.test(next) ||
        (/THINK\s+TO\s+INNOVATE/.test(prev2) && /^(TO|INNOVATE)/.test(w.toUpperCase())) ||
        (w.toUpperCase().startsWith('INNOVATE') && (words[i - 1] || '').toUpperCase() === 'TO')
      return { w, isRefrain }
    })
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const words = gsap.utils.toArray('.mf__w')
      if (reduce) {
        gsap.set(words, { opacity: 1 })
        return
      }
      gsap.set(words, { opacity: 0.14 })
      gsap.to(words, {
        opacity: 1,
        stagger: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 0.6,
        },
      })
      // refrain words: quiet emphasis to full white (no glow), Fraunces italic via CSS
      gsap.utils.toArray('.mf__w.is-refrain').forEach((el) => {
        gsap.fromTo(
          el,
          { color: 'rgba(255,255,255,0.55)' },
          { color: '#ffffff', ease: 'none', scrollTrigger: { trigger: el, start: 'top 72%', end: 'top 42%', scrub: true } }
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="manifesto" className="mf" ref={root}>
      <div className="mf__inner wrap">
        <span className="eyebrow mf__eyebrow">the manifesto</span>
        <p className="mf__copy">
          {tokens.map((t, i) => (
            <span key={i} className={`mf__w ${t.isRefrain ? 'is-refrain' : ''}`}>
              {t.w}{' '}
            </span>
          ))}
        </p>
        <div className="mf__sign">
          <span>{brand.full.toLowerCase()}</span>
          <span className="mf__motto">giving the world things they haven’t imagined before</span>
        </div>
      </div>
    </section>
  )
}
