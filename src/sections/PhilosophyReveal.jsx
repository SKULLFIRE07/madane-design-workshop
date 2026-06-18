import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, brand } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

/* Title case, descender-safe. Each token becomes its own line-mask;
   the entrance reveal is translateY 100% -> 0 ONLY (never combined with
   clip-path). The CSS REST state is the final visible state, so the
   column is never blank — GSAP only plays an on-enter rise. */
const HEADLINE = [
  'An',
  'architecture,',
  'interiors',
  'and',
  'turnkey',
  'studio.',
]

const LEDE = 'One studio. The whole build.'

const BODY =
  'Madane designs and builds high-performance, sustainable commercial workplaces across Bharat, end to end, from the first line to the final handover.'

/* small editorial spec line, derived from brand data (no colour, mono) */
const SPEC = [
  `est. ${brand.founded}`,
  'architecture',
  'interiors',
  'turnkey',
]

const cover = (projects.find((p) => p.id === 'tata') || projects.find((p) => p.id === 'sgl') || projects[0]).cover

export default function PhilosophyReveal() {
  const root = useRef(null)
  const stickyRef = useRef(null)
  const mediaRef = useRef(null)
  const imgRef = useRef(null)
  const textRef = useRef(null)
  const lineRef = useRef(null)
  const ledeRef = useRef(null)
  const bodyRef = useRef(null)
  const tailRef = useRef(null)
  const wordsRef = useRef([])

  wordsRef.current = []
  const addWord = (el) => {
    if (el && !wordsRef.current.includes(el)) wordsRef.current.push(el)
  }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const mobile = window.matchMedia('(max-width: 860px)').matches

      // CSS rest state already = final visible state, so reduced-motion is a no-op.
      if (reduce) return

      // ---- mobile (<860px): stacked, no pin, gentle on-enter reveals ----
      if (mobile) {
        gsap.from(wordsRef.current, {
          yPercent: 105,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: { trigger: textRef.current, start: 'top 84%' },
        })
        gsap.from(lineRef.current, {
          scaleX: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: textRef.current, start: 'top 84%' },
        })
        gsap.from([ledeRef.current, bodyRef.current, tailRef.current], {
          y: 22,
          opacity: 0,
          duration: 0.75,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: { trigger: textRef.current, start: 'top 78%' },
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

      // ---- desktop ----
      // The reveal (text + photo clip-wipe) is an on-enter timeline (NOT
      // scrubbed) so the headline and photo have real presence the instant the
      // section is in view and are never gated behind a long scrub. The pinned
      // scrub then only adds parallax/scale on the image + a tiny text drift.

      // (1) On-enter reveal — plays once when the beat reaches view. The photo
      // clip-wipe lives HERE (not on the scrub) so it opens as the section
      // enters and is fully open for the entire pin — no pop at pin start, and
      // its from-state is only written when the trigger nears, so the photo is
      // not held hidden through the whole approach.
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top 72%',
          once: true,
        },
        defaults: { ease: 'power3.out' },
      })
      intro
        .fromTo(
          mediaRef.current,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.9 },
          0
        )
        .from(lineRef.current, { scaleX: 0, duration: 0.55, ease: 'power2.out' }, 0.05)
        .from(
          wordsRef.current,
          { yPercent: 105, duration: 0.72, stagger: 0.06 },
          0.04
        )
        .from(
          ledeRef.current,
          { yPercent: 60, opacity: 0, duration: 0.6 },
          0.16
        )
        .from(
          bodyRef.current,
          { y: 18, opacity: 0, duration: 0.7, ease: 'power2.out' },
          0.34
        )
        .from(
          tailRef.current,
          { y: 16, opacity: 0, duration: 0.7, ease: 'power2.out' },
          0.46
        )

      // (2) Pinned scrub — parallax + scale settle on the image, plus a gentle
      // counter-drift of the whole text block. Photo is already fully open;
      // the scrub only MOVES, never hides. Image from-state (xPercent/scale) is
      // a benign offset under the photo's -8%/-16% bleed, so nothing is exposed.
      const scene = gsap.timeline({
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

      // Image: right -> left parallax travel + scale settle 1.18 -> 1.0.
      scene.fromTo(
        imgRef.current,
        { xPercent: 10, scale: 1.18 },
        { xPercent: -10, scale: 1, ease: 'none' },
        0
      )

      // Whole text block counter-drifts very slightly to the right.
      scene.fromTo(
        textRef.current,
        { xPercent: 0 },
        { xPercent: 2.4, ease: 'none' },
        0
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
            <div className="pr__index" aria-hidden="true">
              <span className="pr__index-num">01</span>
              <span className="pr__index-rule" />
              <span className="pr__index-total">05</span>
            </div>

            <div className="pr__col">
              <span className="pr__eyebrow">Philosophy</span>
              <span className="pr__line" ref={lineRef} aria-hidden="true" />

              <p className="pr__lede" ref={ledeRef}>
                {LEDE}
              </p>

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

              <div className="pr__tail" ref={tailRef}>
                <ul className="pr__spec" aria-label="Studio scope">
                  {SPEC.map((s, i) => (
                    <li className="pr__spec-item" key={i}>
                      {s}
                    </li>
                  ))}
                </ul>

                <a className="pr__more" href="#studio" data-cursor="view">
                  <span className="pr__more-label">Read the studio</span>
                  <span className="pr__more-rule" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { PhilosophyReveal }
