import { useState, useEffect, useRef, useLayoutEffect, lazy, Suspense } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MagneticButton } from '../components/MagneticButton'
import { SafeBoundary } from '../components/ErrorBoundary'
import { useCapable } from '../hooks/useCapable'
import { montage } from '../data/site'

const ThreeField = lazy(() => import('../components/ThreeField').then((m) => ({ default: m.ThreeField })))

gsap.registerPlugin(ScrollTrigger)

export function Hero({ started = false }) {
  const [idx, setIdx] = useState(0)
  const root = useRef(null)
  const headline = useRef(null)
  const capable = useCapable()
  const paused = useRef(false) // 3D pauses when hero scrolls out of view

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % montage.length), 7200)
    return () => clearInterval(t)
  }, [])

  // pause the WebGL layer whenever the hero leaves the viewport
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { paused.current = !e.isIntersecting }, { threshold: 0.01 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // entrance runs when the intro hands off (started === true)
  useLayoutEffect(() => {
    if (!started) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 })
      tl.from('.hero__eyebrow', { y: 30, opacity: 0, duration: 1, ease: 'expo.out' })
        .from('.hero__line .ln', { yPercent: 120, opacity: 0, stagger: 0.09, duration: 1.15, ease: 'expo.out' }, '-=0.7')
        .from('.hero__rally', { opacity: 0, letterSpacing: '0.8em', duration: 1.3, ease: 'expo.out' }, '-=0.8')
        .from('.hero__sub, .hero__cta, .hero__cue', { y: 26, opacity: 0, stagger: 0.12, duration: 1, ease: 'expo.out' }, '-=0.9')
        .from('.hero__strap', { opacity: 0, duration: 1 }, '-=1')
    }, root)
    return () => ctx.revert()
  }, [started])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // parallax on scroll
      if (!reduce) {
        gsap.to('.hero__content', {
          yPercent: -18,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to('.hero__montage', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      }
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="top" className="hero grain" ref={root}>
      <div className="hero__aurora" aria-hidden />
      {capable && (
        <SafeBoundary>
          <Suspense fallback={null}>
            <ThreeField pausedRef={paused} />
          </Suspense>
        </SafeBoundary>
      )}

      <div className="hero__montage" aria-hidden>
        {montage.map((src, i) => (
          <div key={src} className={`hero__frame ${i === idx ? 'is-active' : ''}`} style={{ backgroundImage: `url(${src})` }} />
        ))}
        <div className="hero__veil" />
      </div>

      {/* faint logo watermark in the lower empty space, behind the content */}
      <div className="hero__watermark" aria-hidden />

      <div className="hero__strap" aria-hidden>
        architecture &nbsp;|&nbsp; interiors &nbsp;|&nbsp; turnkey
      </div>

      <div className="hero__content wrap">
        <span className="hero__eyebrow eyebrow">commercial interiors · est. 2008</span>

        <h1 className="hero__headline" ref={headline}>
          <span className="hero__line"><span className="ln">we design</span></span>
          <span className="hero__line"><span className="ln">&amp; build</span> <span className="ln hero__bharat" lang="hi">भारत</span></span>
        </h1>

        <div className="hero__rally">think to innovate</div>

        <p className="hero__sub">
          architecture · interiors · turnkey.
          <span>200+ workplaces · 2 million sq.ft · since 2008.</span>
        </p>

        <div className="hero__cta btn-row">
          <MagneticButton as="a" href="#works" onClick={(e) => { e.preventDefault(); window.__lenis?.scrollTo('#works', { duration: 1.5 }) }} data-cursor="explore">
            view selected works
          </MagneticButton>
          <a className="hero__ghost" href="#manifesto" onClick={(e) => { e.preventDefault(); window.__lenis?.scrollTo('#manifesto', { duration: 1.4 }) }} data-cursor="read">
            our manifesto →
          </a>
        </div>
      </div>

      <div className="hero__cue" aria-hidden>
        <i />
        scroll
      </div>
    </section>
  )
}
