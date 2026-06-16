import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

/**
 * Cinematic intro: count 0→100 while the brand mark draws in, then the
 * curtain panels split and lift to reveal the hero. anime.js handles the
 * Sanskrit motto stroke; GSAP runs the master timeline.
 */
export function Preloader({ onComplete }) {
  const root = useRef(null)
  const countRef = useRef(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const counter = { v: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        setDone(true)
        onComplete?.()
      },
    })

    if (reduce) {
      gsap.set(root.current, { display: 'none' })
      onComplete?.()
      return
    }

    document.documentElement.classList.add('is-loading')

    tl.to(counter, {
      v: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
      },
    })
      .from('.pre__word span', { yPercent: 120, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out' }, 0.3)
      .from('.pre__motto', { opacity: 0, letterSpacing: '0.6em', duration: 1.2, ease: 'expo.out' }, 0.55)
      .to('.pre__row', { yPercent: -120, opacity: 0, duration: 0.7, ease: 'power3.in', stagger: 0.05 }, '+=0.3')
      .to('.pre__panel', {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 1.0,
        ease: 'expo.inOut',
        stagger: 0.07,
      }, '-=0.2')
      .add(() => document.documentElement.classList.remove('is-loading'), '-=0.4')

    return () => tl.kill()
  }, [onComplete])

  if (done) return null

  return (
    <div className="pre" ref={root} aria-hidden>
      <div className="pre__panels">
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="pre__panel" key={i} />
        ))}
      </div>
      <div className="pre__content">
        <div className="pre__row pre__word">
          <span>think</span> <span>to</span> <span>innovate</span>
        </div>
        <div className="pre__row pre__motto">architecture · interiors · turnkey</div>
      </div>
      <div className="pre__count pre__row">
        <span ref={countRef}>000</span>
        <i>/ 100</i>
      </div>
    </div>
  )
}
