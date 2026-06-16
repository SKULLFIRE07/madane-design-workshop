import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

const HEADLINE = [
  'an',
  'architecture,',
  'interiors',
  '&',
  'turnkey',
  'studio',
  'since',
  '2008.',
]

const cover =
  (projects.find((p) => p.id === 'sgl') ||
    projects.find((p) => p.id === 'semac') ||
    projects[0]).cover

export function PhilosophyReveal() {
  const root = useRef(null)
  const imgRef = useRef(null)
  const textRef = useRef(null)
  const wordsRef = useRef([])
  wordsRef.current = []

  const addWord = (el) => {
    if (el && !wordsRef.current.includes(el)) wordsRef.current.push(el)
  }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const mobile = window.matchMedia('(max-width: 860px)').matches

      // Mobile or reduced motion: simple fade-up, no pin.
      if (reduce || mobile) {
        if (reduce) {
          gsap.set(wordsRef.current, { yPercent: 0, opacity: 1 })
          return
        }
        gsap.from(wordsRef.current, {
          yPercent: 110,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: { trigger: textRef.current, start: 'top 80%' },
        })
        gsap.from(imgRef.current, {
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: imgRef.current, start: 'top 85%' },
        })
        return
      }

      // Desktop: pinned, scrubbed counter-motion.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      })

      // Image: parallax drift right -> left, slight scale settle.
      tl.fromTo(
        imgRef.current,
        { xPercent: 8, scale: 1.08 },
        { xPercent: -8, scale: 1, ease: 'none' },
        0
      )

      // Text block: gentle counter-move to the right.
      tl.fromTo(
        textRef.current,
        { xPercent: 0 },
        { xPercent: 4, ease: 'none' },
        0
      )

      // Headline words reveal — translateY only inside an overflow mask (no clip overlap glitch)
      tl.fromTo(
        wordsRef.current,
        { yPercent: 105 },
        { yPercent: 0, ease: 'power3.out', stagger: 0.08, duration: 0.6 },
        0
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="pr" ref={root} aria-label="studio philosophy">
      <div className="pr__sticky">
        <div className="pr__grid">
          <div className="pr__media">
            <div
              className="pr__img"
              ref={imgRef}
              style={{ backgroundImage: `url(${cover})` }}
              role="img"
              aria-label="madane studio work"
            />
            <span className="pr__imgline" aria-hidden="true" />
          </div>

          <div className="pr__text" ref={textRef}>
            <span className="pr__eyebrow">philosophy / 01</span>

            <h2 className="pr__headline">
              {HEADLINE.map((w, i) => (
                <span className="pr__wmask" key={i}>
                  <span className="pr__word" ref={addWord}>
                    {w}
                  </span>
                </span>
              ))}
            </h2>

            <p className="pr__body">
              madane designs and builds high-performance, sustainable
              commercial workplaces across bharat. one studio, end to end,
              from the first line to the final handover. we work to give the
              world things they have not yet imagined.
            </p>

            <a className="pr__more" href="#studio" data-cursor="view">
              <span className="pr__more-label">read the studio</span>
              <span className="pr__more-rule" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PhilosophyReveal
