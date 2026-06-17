import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { nav as navItems, brand } from '../data/site'
import { MagneticButton } from './MagneticButton'

export function Nav() {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    gsap.fromTo(ref.current, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, delay: 3.4, ease: 'expo.out' })
  }, [])

  // lock page scroll while the mobile sheet is open; close on resize past breakpoint or Esc
  useEffect(() => {
    const l = window.__lenis
    if (open) l?.stop()
    else l?.start()
    document.documentElement.classList.toggle('menu-open', open)
    const onResize = () => { if (window.innerWidth > 820) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('keydown', onKey) }
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    const el = document.getElementById(id)
    // run after the sheet starts closing so lenis is started again before scrollTo
    requestAnimationFrame(() => {
      if (el && window.__lenis) window.__lenis.scrollTo(el, { offset: -20, duration: 1.4 })
      else el?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  return (
    <>
      <nav className={`nav ${open ? 'is-open' : ''}`} ref={ref}>
        <a className="nav__brand" href="#top" onClick={go('top')} data-cursor="top">
          <BrandMark />
          <span>
            {brand.name}
            <small>design workshop</small>
          </span>
        </a>
        <div className="nav__links">
          {navItems.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={go(n.id)}>{n.label}</a>
          ))}
          <MagneticButton as="a" href="#contact" onClick={go('contact')} className="nav__cta" strength={0.3}>
            start a project
          </MagneticButton>
        </div>
        <button
          className="nav__burger"
          aria-label={open ? 'close menu' : 'open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`navsheet ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="navsheet__inner">
          {navItems.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={go(n.id)}>{n.label}</a>
          ))}
          <a className="navsheet__cta" href="#contact" onClick={go('contact')}>start a project →</a>
        </div>
      </div>
    </>
  )
}

export function BrandMark({ size = 30 }) {
  return <img src="/assets/logo-mark.png" width={size} height={size} alt="madane" className="brandmark" draggable="false" />
}
