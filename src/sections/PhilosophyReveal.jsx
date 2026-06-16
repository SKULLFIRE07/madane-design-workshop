import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

/* Title case, descender-safe. Each token becomes its own line-mask;
   reveal is translateY 100% -> 0 ONLY (never combined with clip-path). */
const HEADLINE = [
  'An',
  'architecture,',
  'interiors',
  'and',
  'turnkey',
  'studio.',
]

const BODY =
  'Madane designs and builds high-performance, sustainable commercial workplaces across Bharat. One studio, end to end, from the first line to the final handover.'

const cover = (projects.find((p) => p.id === 'tata') || projects.find((p) => p.id === 'sgl') || projects[0]).cover

export default function PhilosophyReveal() {
  const root = useRef(null)
  const stickyRef = useRef(null)
  const mediaRef = useRef(null)
  const imgRef = useRef(null)
  const textRef = useRef(null)
  const lineRef = useRef(null)
  const bodyRef = useRef(null)
  const wordsRef = useRef([])

  wordsRef.current = []
  const addWord = (el) => {
    if (el && !wordsRef.current.includes(el)) wordsRef.current.push(el)
  }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const mobile = window.matchMedia('(max-width: 860px)').matches

      // ---- prefers-reduced-motion: snap everything to its final state ----
      if (reduce) {
        gsap.set(wordsRef.current, { yPercent: 0 })
        gsap.set([imgRef.current, textRef.current], {
          xPercent: 0,
          scale: 1,
          clearProps: 'transform',
        })
        gsap.set(lineRef.current, { scaleX: 1 })
        gsap.set(bodyRef.current, { y: 0, opacity: 1 })
        return
      }

      // ---- mobile (<860px): stacked, no pin, gentle fade-ups ----
      if (mobile) {
        gsap.from(wordsRef.current, {
          yPercent: 100,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: { trigger: textRef.current, start: 'top 82%' },
        })
        gsap.from(lineRef.current, {
          scaleX: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: textRef.current, start: 'top 82%' },
        })
        gsap.from(bodyRef.current, {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: bodyRef.current, start: 'top 88%' },
        })
        gsap.from(imgRef.current, {
          opacity: 0,
          scale: 1.08,
          duration: 1.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: mediaRef.current, start: 'top 88%' },
        })
        return
      }

      // ---- desktop: pinned + scrubbed cinematic beat ----
      // initial states (so the scrub timeline has a clean origin)
      gsap.set(wordsRef.current, { yPercent: 100 })
      gsap.set(lineRef.current, { scaleX: 0 })
      gsap.set(bodyRef.current, { yPercent: 40, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=140%',
          pin: stickyRef.current,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // Media wipes open (left -> right) as the beat enters — the "crazy" reveal.
      tl.fromTo(
        mediaRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', ease: 'power3.out', duration: 0.6 },
        0
      )

      // Image: real right -> left parallax travel + scale settle 1.12 -> 1.0.
      tl.fromTo(
        imgRef.current,
        { xPercent: 10, scale: 1.18 },
        { xPercent: -10, scale: 1, ease: 'none' },
        0
      )

      // Whole text block counter-moves slightly to the right.
      tl.fromTo(
        textRef.current,
        { xPercent: 0 },
        { xPercent: 3, ease: 'none' },
        0
      )

      // Hairline draws under the eyebrow (1px rule, left origin).
      tl.to(
        lineRef.current,
        { scaleX: 1, ease: 'power2.out', duration: 0.45 },
        0.05
      )

      // Headline words rise inside their line-masks. translateY ONLY.
      tl.to(
        wordsRef.current,
        {
          yPercent: 0,
          ease: 'power3.out',
          stagger: 0.07,
          duration: 0.55,
        },
        0.1
      )

      // Body paragraph fades up after the headline settles.
      tl.to(
        bodyRef.current,
        { yPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.5 },
        0.55
      )
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section className="pr" ref={root} aria-label="Studio philosophy">
      <div className="pr__sticky" ref={stickyRef}>
        <div className="pr__grid">
          <div className="pr__media" ref={mediaRef}>
            <div
              className="pr__img"
              ref={imgRef}
              style={{ backgroundImage: `url(${cover})` }}
              role="img"
              aria-label="Madane studio work"
            />
            <span className="pr__imgline" aria-hidden="true" />
          </div>

          <div className="pr__text" ref={textRef}>
            <span className="pr__eyebrow">Philosophy / 01</span>
            <span
              className="pr__line"
              ref={lineRef}
              aria-hidden="true"
            />

            <h2 className="pr__headline">
              {HEADLINE.map((w, i) => (
                <span className="pr__wmask" key={i}>
                  <span className="pr__word" ref={addWord}>
                    {w}
                  </span>
                </span>
              ))}
            </h2>

            <p className="pr__body" ref={bodyRef}>
              {BODY}
            </p>

            <a className="pr__more" href="#studio" data-cursor="view">
              <span className="pr__more-label">Read the studio</span>
              <span className="pr__more-rule" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export { PhilosophyReveal }
