import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * Custom trailing cursor with a lagging ring. Grows on interactive elements
 * and shows context labels (e.g. "view") on project tiles via data-cursor.
 */
export function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const xTo = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3' })
    const yTo = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3' })
    const rxTo = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3' })
    const ryTo = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3' })

    const move = (e) => {
      xTo(e.clientX); yTo(e.clientY); rxTo(e.clientX); ryTo(e.clientY)
    }
    const over = (e) => {
      const t = e.target.closest('[data-cursor]')
      if (t) {
        gsap.to(ring.current, { scale: 2.6, borderColor: 'rgba(255,255,255,0.9)', duration: 0.4 })
        if (labelRef.current) labelRef.current.textContent = t.getAttribute('data-cursor') || ''
        gsap.to(labelRef.current, { opacity: 1, scale: 1, duration: 0.3 })
      } else if (e.target.closest('a, button, [role="button"]')) {
        gsap.to(ring.current, { scale: 1.8, duration: 0.4 })
      }
    }
    const out = (e) => {
      if (e.target.closest('[data-cursor]')) {
        gsap.to(ring.current, { scale: 1, borderColor: 'rgba(255,255,255,0.4)', duration: 0.4 })
        gsap.to(labelRef.current, { opacity: 0, scale: 0.6, duration: 0.3 })
      } else if (e.target.closest('a, button, [role="button"]')) {
        gsap.to(ring.current, { scale: 1, duration: 0.4 })
      }
    }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', over)
    document.addEventListener('mouseout', out)
    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mouseout', out)
    }
  }, [])

  return (
    <div className="cursor" aria-hidden>
      <div ref={ring} className="cursor__ring">
        <span ref={labelRef} className="cursor__label" />
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  )
}
