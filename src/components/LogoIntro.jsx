import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

// plays at most ONCE per page load (guards against any remount replaying it)
let hasPlayed = false

/**
 * Logo-led cinematic landing. Features the REAL madane mark.
 * A scanner line sweeps the mark into view, the counter ticks 00→100,
 * then the mark settles and a black curtain wipes up to the hero.
 */
export function LogoIntro({ onComplete }) {
  const root = useRef(null)
  const countRef = useRef(null)
  const [done, setDone] = useState(hasPlayed)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (hasPlayed || reduce) {
      hasPlayed = true
      setDone(true)
      onComplete?.()
      return
    }
    hasPlayed = true
    document.documentElement.classList.add('is-loading')
    const counter = { v: 0 }

    const tl = gsap.timeline({
      defaults: { ease: 'expo.out' },
      onComplete: () => {
        document.documentElement.classList.remove('is-loading')
        setDone(true)
        onComplete?.()
      },
    })

    tl
      .set('.li__logo', { clipPath: 'inset(0 0 100% 0)', scale: 1.12, opacity: 1 })
      .to('.li__logo', { clipPath: 'inset(0 0 0% 0)', scale: 1, duration: 1.5, ease: 'power3.inOut' }, 0.25)
      .fromTo('.li__scan', { top: '0%', opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.25)
      .to('.li__scan', { top: '100%', duration: 1.5, ease: 'power3.inOut' }, 0.25)
      .to('.li__scan', { opacity: 0, duration: 0.3 }, 1.6)
      .to(counter, {
        v: 100, duration: 2.2, ease: 'power1.inOut',
        onUpdate: () => { if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0') },
      }, 0)
      .from('.li__tag', { yPercent: 120, opacity: 0, duration: 0.9 }, 1.5)
      // finale · mark settles up & out, curtain wipes to hero
      .to('.li__logo', { y: -28, scale: 1.04, duration: 0.7, ease: 'power2.in' }, '+=0.35')
      .to('.li__logo, .li__tag', { opacity: 0, duration: 0.5 }, '<')
      .to('.li__count', { opacity: 0, duration: 0.4 }, '<')
      .to('.li', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'expo.inOut' }, '-=0.35')

    return () => tl.kill()
  }, [onComplete])

  if (done) return null

  return (
    <div className="li" ref={root} aria-hidden>
      <div className="li__stage">
        <div className="li__logo">
          <img src="/assets/logo-white.png" alt="" draggable="false" />
          <div className="li__scan" />
        </div>
        <div className="li__tag">architecture · interiors · turnkey</div>
      </div>
      <div className="li__count"><span ref={countRef}>000</span><i>·100</i></div>
      <div className="li__corner">est. 2008 · mumbai · bharat</div>
    </div>
  )
}
