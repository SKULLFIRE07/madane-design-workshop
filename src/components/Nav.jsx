import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { nav as navItems, brand } from '../data/site'
import { MagneticButton } from './MagneticButton'

export function Nav() {
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, delay: 3.4, ease: 'expo.out' })
  }, [])

  const go = (id) => (e) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el && window.__lenis) window.__lenis.scrollTo(el, { offset: -20, duration: 1.4 })
    else el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="nav" ref={ref}>
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
    </nav>
  )
}

export function BrandMark({ size = 30 }) {
  return <img src="/assets/logo-mark.png" width={size} height={size} alt="madane" className="brandmark" draggable="false" />
}
