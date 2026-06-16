import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

/**
 * <SplitReveal> · line/word/char masked reveal on scroll using SplitType + GSAP.
 * The signature "architectural" entrance: text rises from behind a mask.
 */
export function SplitReveal({
  as: Tag = 'div',
  children,
  type = 'words',
  stagger = 0.06,
  duration = 1.05,
  y = '110%',
  start = 'top 85%',
  delay = 0,
  className = '',
  ...rest
}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const split = new SplitType(el, { types: type === 'chars' ? 'words,chars' : type, tagName: 'span' })
      const targets = type === 'chars' ? split.chars : type === 'lines' ? split.lines : split.words

      // wrap each target in an overflow-hidden mask
      targets.forEach((t) => {
        t.style.display = 'inline-block'
        t.style.willChange = 'transform'
      })

      if (reduce) {
        gsap.set(targets, { opacity: 1, y: 0 })
        return
      }

      gsap.set(el, { '--mask': '0' })
      gsap.fromTo(
        targets,
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration,
          delay,
          stagger,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start, once: true },
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [type, stagger, duration, start, delay])

  return (
    <Tag ref={ref} className={`split-reveal ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

/**
 * <FadeUp> · simpler block reveal for cards, images, paragraphs.
 */
export function FadeUp({ as: Tag = 'div', children, className = '', delay = 0, y = 48, start = 'top 88%', ...rest }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, delay, ease: 'expo.out', scrollTrigger: { trigger: el, start, once: true } }
      )
    }, ref)
    return () => ctx.revert()
  }, [delay, y, start])
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}
