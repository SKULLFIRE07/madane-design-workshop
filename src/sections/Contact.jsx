import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Velocity from 'velocity-animate'
import { contact, brand } from '../data/site'
import { MagneticButton } from '../components/MagneticButton'
import { BrandMark } from '../components/Nav'
import { SplitReveal } from '../components/Reveal'

gsap.registerPlugin(ScrollTrigger)

export function Contact() {
  const root = useRef(null)
  const closing = useRef(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const submit = (e) => {
    e.preventDefault()
    const body = `Name: ${form.name}%0D%0AEmail: ${form.email}%0D%0A%0D%0A${form.message}`
    window.location.href = `mailto:${contact.email}?subject=Project enquiry · Madane Design Workshop&body=${body}`
  }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      gsap.from('.contact__line', { y: 26, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.contact__details', start: 'top 85%', once: true } })

      ScrollTrigger.create({
        trigger: closing.current,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          const lines = closing.current.querySelectorAll('.cl-line')
          gsap.fromTo(lines, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: 'power3.out' })
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const lines = [['think', 'to'], ['innovate']]

  return (
    <footer id="contact" className="contact section grain" ref={root}>
      <div className="wrap">
        <div className="contact__top">
          <div className="contact__intro">
            <span className="eyebrow">let’s begin</span>
            <SplitReveal as="h2" className="contact__big" type="words" stagger={0.05}>
              let’s build<br />something unimagined.
            </SplitReveal>
            <p className="contact__say">{contact.line}</p>

            <form className="contact__form" onSubmit={submit}>
              <div className="field">
                <input id="cf-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder=" " />
                <label htmlFor="cf-name">your name</label>
              </div>
              <div className="field">
                <input id="cf-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder=" " />
                <label htmlFor="cf-email">email</label>
              </div>
              <div className="field">
                <textarea id="cf-msg" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder=" " />
                <label htmlFor="cf-msg">about your project</label>
              </div>
              <MagneticButton as="button" type="submit" className="contact__cta" data-cursor="send" strength={0.3}>
                send enquiry →
              </MagneticButton>
            </form>
          </div>

          <div className="contact__details">
            <div className="contact__badge"><BrandMark size={64} /></div>
            <div className="contact__line contact__primary">
              <a href={`mailto:${contact.email}`} data-cursor="email">{contact.email}</a>
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} data-cursor="call">{contact.phone}</a>
            </div>
            <div className="contact__line contact__addr">
              <em>studio</em>
              <span>{contact.address}</span>
              <span className="contact__cities">{contact.cities}</span>
            </div>
            <div className="contact__line contact__links">
              <a href="https://www.madane.in" target="_blank" rel="noreferrer" data-cursor="visit">{contact.website}</a>
              <span>{contact.social}</span>
            </div>
          </div>
        </div>

        <div className="contact__closing" ref={closing} aria-label={brand.rally}>
          {lines.map((words, li) => (
            <span className="cl-line" key={li}>
              {words.map((w, wi) => (
                <span className="cl-word" key={wi}>
                  {w.split('').map((c, ci) => (
                    <span key={ci} className="cl" aria-hidden>{c}</span>
                  ))}
                </span>
              ))}
            </span>
          ))}
        </div>

        <div className="contact__copyline">
          <span>© {brand.founded}-2025 {brand.full}</span>
          <span>we design &amp; build bharat</span>
          <span>designed to think · built to innovate</span>
        </div>
      </div>
    </footer>
  )
}
