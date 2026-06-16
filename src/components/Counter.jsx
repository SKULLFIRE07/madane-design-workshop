import { useRef, useState, useLayoutEffect } from 'react'
import { useSpring, animated, config } from '@react-spring/web'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Number that springs from 0 → value when scrolled into view.
 * Powered by @react-spring/web; triggered by GSAP ScrollTrigger.
 */
export function Counter({ value, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null)
  const [active, setActive] = useState(false)

  const { n } = useSpring({
    n: active ? value : 0,
    config: { ...config.molasses, friction: 90, tension: 120 },
    delay: 80,
  })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => setActive(true),
    })
    return () => st.kill()
  }, [])

  return (
    <span ref={ref} className={className}>
      {prefix}
      <animated.span>{n.to((v) => v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ','))}</animated.span>
      {suffix}
    </span>
  )
}
