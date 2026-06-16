import { useRef } from 'react'
import { gsap } from 'gsap'

/**
 * Magnetic, springy CTA button · pointer attracts the label.
 * Uses GSAP quickTo for 60fps interactive easing.
 */
export function MagneticButton({ children, className = '', strength = 0.4, as: Tag = 'button', ...rest }) {
  const wrap = useRef(null)
  const label = useRef(null)

  const onMove = (e) => {
    const el = wrap.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) * strength
    const y = (e.clientY - (r.top + r.height / 2)) * strength
    gsap.to(el, { x, y, duration: 0.5, ease: 'power3.out' })
    gsap.to(label.current, { x: x * 0.35, y: y * 0.35, duration: 0.5, ease: 'power3.out' })
  }
  const onLeave = () => {
    gsap.to(wrap.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
    gsap.to(label.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
  }

  return (
    <Tag ref={wrap} className={`magnetic ${className}`} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>
      <span ref={label} className="magnetic__label">{children}</span>
    </Tag>
  )
}
