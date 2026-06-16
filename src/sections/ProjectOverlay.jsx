import { useEffect, useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { brand, projects } from '../data/site'

export function ProjectOverlay({ project, onClose, onNavigate }) {
  const root = useRef(null)
  const scroller = useRef(null)

  const idx = project ? projects.findIndex((p) => p.id === project.id) : -1
  const next = idx >= 0 ? projects[(idx + 1) % projects.length] : null
  const prev = idx >= 0 ? projects[(idx - 1 + projects.length) % projects.length] : null

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && next) onNavigate?.(next)
      if (e.key === 'ArrowLeft' && prev) onNavigate?.(prev)
    }
    if (project) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, onClose, onNavigate, next, prev])

  useLayoutEffect(() => {
    if (!project) return
    if (scroller.current) scroller.current.scrollTop = 0
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.fromTo('.po', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' })
        .fromTo('.po__cover', { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.05, ease: 'expo.out' }, '-=0.1')
        .from('.po__title .ln', { yPercent: 120, opacity: 0, stagger: 0.06, duration: 0.9, ease: 'expo.out' }, '-=0.6')
        .from('.po__meta > *', { y: 20, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'expo.out' }, '-=0.5')
        .from('.po__shot', { y: 60, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'expo.out' }, '-=0.3')
    }, root)
    return () => ctx.revert()
  }, [project])

  // parallax inside overlay
  useEffect(() => {
    const el = scroller.current
    if (!project || !el) return
    let raf
    const tick = () => {
      const shots = el.querySelectorAll('.po__shot .po__shotimg')
      const vh = el.clientHeight
      shots.forEach((img) => {
        const r = img.getBoundingClientRect()
        const p = (r.top + r.height / 2 - vh / 2) / vh
        img.style.transform = `translateY(${p * -26}px) scale(1.08)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [project])

  if (!project) return null
  const p = project
  const meta = [
    ['client', p.client],
    ['location', p.location],
    p.area && ['scope', p.area],
    p.rating && ['note', p.rating],
    p.year && ['detail', p.year],
  ].filter(Boolean)

  return (
    <div className="po" ref={root} role="dialog" aria-modal="true" aria-label={`${p.name} case study`}>
      <button className="po__close" onClick={onClose} data-cursor="close" aria-label="Close">
        <span /><span />
      </button>
      <div className="po__scroll" ref={scroller} data-lenis-prevent>
        <header className="po__hero">
          <div className="po__cover" style={{ backgroundImage: `url(${p.cover})` }} />
          <div className="po__heroinfo wrap">
            <span className="eyebrow">{p.sector}</span>
            <h2 className="po__title"><span className="ln">{p.name}</span></h2>
            <div className="po__meta">
              {meta.map(([k, v]) => (
                <div key={k} className="po__metaitem"><em>{k}</em><span>{v}</span></div>
              ))}
            </div>
          </div>
        </header>

        <div className="po__gallery wrap">
          {p.slides.map((src, i) => (
            <figure className={`po__shot ${i % 3 === 0 ? 'is-tall' : ''}`} key={src}>
              <div className="po__shotimg" style={{ backgroundImage: `url(${src})` }} />
            </figure>
          ))}
        </div>

        <nav className="po__nav wrap">
          {prev && (
            <button className="po__navbtn po__navprev" onClick={() => onNavigate?.(prev)} data-cursor="prev">
              <em>← previous</em>
              <strong>{prev.name}</strong>
            </button>
          )}
          {next && (
            <button className="po__navbtn po__navnext" onClick={() => onNavigate?.(next)} data-cursor="next">
              <em>next →</em>
              <strong>{next.name}</strong>
            </button>
          )}
        </nav>

        <footer className="po__foot wrap">
          <p>think to innovate</p>
          <button onClick={onClose} className="po__back">← back to all works</button>
          <span>{brand.website}</span>
        </footer>
      </div>
    </div>
  )
}
