import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const bar = useRef(null)
  useEffect(() => {
    let ticking = false
    const set = () => {
      ticking = false
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const p = max > 0 ? Math.min(1, (window.scrollY || h.scrollTop) / max) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(set) }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    set()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="progress-bar" ref={bar} aria-hidden />
}
