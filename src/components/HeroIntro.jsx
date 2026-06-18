import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import '../styles/intro.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * HeroIntro — cinematic "viewfinder acquire → converge → ink-bleed → brush-drawn"
 * title sequence for Madane Design Workshop. Ported from the Claude Design
 * prototype (HeroIntro.dc.html) into a real React/GSAP component.
 *
 * Arc:
 *  1. ACQUIRE   — fullscreen crosshair + rule-of-thirds grid + corner frame draw on.
 *  2. COUNTER   — monospace 000→100 at the crosshair centre.
 *  3. CONVERGE  — the viewfinder focuses down onto the mark.
 *  4. INK-BLEED — the white disc resolves out of turbulence (feTurbulence/displace/blur).
 *  5. DRAW M    — the central brush mark paints itself in along a stroke path (canvas).
 *  6. WORDMARK  — "madane / design workshop" is painted on, line by line (canvas).
 *  7. TAGLINE   — "Think to Innovate" rises, hairline divider grows, tracked sub.
 *  8. HANDOFF   — overlay fades, Lenis resumes, ScrollTrigger refreshes, hero enters.
 *
 * Plays AT MOST ONCE per page load. Reduced-motion settles straight to the
 * resolved state with no turbulence/counter, then hands off.
 */

let hasPlayed = false

const PALETTE = { bg: '#050505', ink: '#f4f1ea' }

export default function HeroIntro({ onComplete, speed = 1 }) {
  const stageRef = useRef(null)
  const [done, setDone] = useState(hasPlayed)

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (hasPlayed) { setDone(true); onComplete?.(); return }
    hasPlayed = true

    document.documentElement.classList.add('is-loading')
    window.__lenis?.stop()

    const st = {} // mutable scratch (canvas scales, path points)
    const root = stageRef.current
    const q = (sel) => (root ? root.querySelector(sel) : null)
    const qa = (sel) => (root ? Array.from(root.querySelectorAll(sel)) : [])

    // ── canvas / path helpers (502×590 user space) ──────────────────────────
    const buildPathPoints = () => {
      const path = q('.mdn-paint-path')
      if (!path) { st.pathPts = []; st.pathLen = 0; return }
      const len = path.getTotalLength()
      const step = 1.5
      const pts = []
      for (let l = 0; l <= len; l += step) { const p = path.getPointAtLength(l); pts.push({ x: p.x, y: p.y, l }) }
      const end = path.getPointAtLength(len); pts.push({ x: end.x, y: end.y, l: len })
      st.pathPts = pts; st.pathLen = len
    }

    const setupCanvas = () => {
      const cv = q('.mdn-mark-canvas')
      if (!cv) return
      const r = cv.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.max(2, Math.round(r.width * dpr))
      cv.height = Math.max(2, Math.round(r.height * dpr))
      st.canvasSc = cv.width / 502
      const wc = q('.mdn-word-canvas')
      if (wc) { const wr = wc.getBoundingClientRect(); wc.width = Math.max(2, Math.round(wr.width * dpr)); wc.height = Math.max(2, Math.round(wr.height * dpr)); st.wordSc = wc.width / 502 }
    }

    const tipAt = (L) => {
      const pts = st.pathPts || []
      if (!pts.length) return { x: 0, y: 0 }
      L = Math.max(0, Math.min(L, st.pathLen))
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].l >= L) { const a = pts[i - 1], b = pts[i]; const t = (L - a.l) / Math.max(0.001, b.l - a.l); return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t } }
      }
      return pts[pts.length - 1]
    }

    const drawMark = (L) => {
      const cv = q('.mdn-mark-canvas')
      if (!cv || !st.markImage) return
      const ctx = cv.getContext('2d')
      const sc = st.canvasSc || cv.width / 502
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, cv.width, cv.height)
      if (L >= st.pathLen) { ctx.drawImage(st.markImage, 0, 0, cv.width, cv.height); return }
      if (L <= 0) return
      ctx.setTransform(sc, 0, 0, sc, 0, 0)
      ctx.beginPath()
      const pts = st.pathPts
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) { if (pts[i].l > L) break; ctx.lineTo(pts[i].x, pts[i].y) }
      const tip = tipAt(L); ctx.lineTo(tip.x, tip.y)
      ctx.lineWidth = 82; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = '#fff'
      ctx.stroke()
      ctx.globalCompositeOperation = 'source-in'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(st.markImage, 0, 0, cv.width, cv.height)
      ctx.globalCompositeOperation = 'source-over'
    }

    const drawWord = (prog) => {
      const cv = q('.mdn-word-canvas')
      if (!cv || !st.wordImage) return
      const ctx = cv.getContext('2d')
      const sc = st.wordSc || cv.width / 502
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, cv.width, cv.height)
      if (prog >= 1) { ctx.drawImage(st.wordImage, 0, 0, cv.width, cv.height); return }
      if (prog <= 0) return
      const x0 = 104, x1 = 424
      const clamp = (v) => Math.max(0, Math.min(1, v))
      const p1 = clamp(prog / 0.6)            // line 1: "madane"
      const p2 = clamp((prog - 0.42) / 0.58)  // line 2: "design workshop"
      ctx.setTransform(sc, 0, 0, sc, 0, 0)
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#fff'
      if (p1 > 0) { ctx.beginPath(); ctx.moveTo(x0, 498); ctx.lineTo(x0 + (x1 - x0) * p1, 498); ctx.lineWidth = 56; ctx.stroke() }
      if (p2 > 0) { ctx.beginPath(); ctx.moveTo(x0, 546); ctx.lineTo(x0 + (x1 - x0) * p2, 546); ctx.lineWidth = 30; ctx.stroke() }
      ctx.globalCompositeOperation = 'source-in'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(st.wordImage, 0, 0, cv.width, cv.height)
      ctx.globalCompositeOperation = 'source-over'
    }

    // ── filters (heavy — only on while painting) ────────────────────────────
    const enableFilter = () => {
      const l = q('.mdn-logo'); if (l) l.style.filter = 'url(#mdn-ink)'
      const m = q('.mdn-mark-wrap'); if (m) m.style.filter = 'url(#mdn-brush)'
      const w = q('.mdn-word-wrap'); if (w) w.style.filter = 'url(#mdn-brush2)'
    }
    const tearDownFilter = () => {
      const l = q('.mdn-logo'); if (l) { l.style.filter = 'none'; l.style.willChange = 'auto' }
      const m = q('.mdn-mark-wrap'); if (m) { m.style.filter = 'none'; m.style.willChange = 'auto' }
      const w = q('.mdn-word-wrap'); if (w) { w.style.filter = 'none'; w.style.willChange = 'auto' }
    }

    let breath = null
    const startBreathing = () => {
      const wrap = q('.mdn-logo-wrap')
      if (!wrap) return
      if (breath) breath.kill()
      breath = gsap.to(wrap, { scale: 1.006, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    }

    // ── handoff: fade overlay → resume scroll → reveal site ─────────────────
    let handedOff = false
    const handoff = () => {
      if (handedOff) return
      handedOff = true
      tearDownFilter()
      const stage = root
      gsap.delayedCall(reduce ? 0.25 : 1.2, () => {
        gsap.to(stage, {
          opacity: 0, duration: reduce ? 0.4 : 0.8, ease: 'power2.inOut',
          onStart: () => onComplete?.(),
          onComplete: () => {
            if (breath) breath.kill()
            document.documentElement.classList.remove('is-loading')
            window.__lenis?.start()
            ScrollTrigger.refresh()
            setDone(true)
          },
        })
      })
    }

    let tl = null
    const play = () => {
      const g = gsap
      if (!root) return
      if (tl) tl.kill()
      if (breath) breath.kill()

      const counter = q('.mdn-counter')
      const wrap = q('.mdn-logo-wrap')
      const disp = q('#mdn-disp')
      const blur = q('#mdn-blur')
      const glow = q('.mdn-glow')
      const datum = q('.mdn-datum')
      const vdatum = q('.mdn-vdatum')
      const cornersWrap = q('.mdn-corners')
      const corners = qa('.mdn-cnr')
      const gridLines = qa('.mdn-gl')
      const gv = qa('.mdn-gv')
      const gh = qa('.mdn-gh')
      const cue = q('.mdn-cue')
      const brushDisp = q('#mdn-brush-disp')
      const brush2Disp = q('#mdn-brush2-disp')

      buildPathPoints()
      setupCanvas()
      const pathLen = st.pathLen

      // reset
      g.set(wrap, { opacity: 0, scale: 1 })
      g.set(cue, { opacity: 0, y: 8 })
      if (glow) g.set(glow, { opacity: 0, scale: 0.6 })
      if (brushDisp) g.set(brushDisp, { attr: { scale: 18 } })
      if (brush2Disp) g.set(brush2Disp, { attr: { scale: 12 } })
      drawMark(0)
      drawWord(0)

      // viewfinder geometry
      const fullW = Math.max(window.innerWidth, document.documentElement.clientWidth || 0)
      const fullH = Math.max(window.innerHeight, document.documentElement.clientHeight || 0)
      const openW = fullW - 48, openH = fullH - 48
      const wrapRect = wrap ? wrap.getBoundingClientRect() : { top: fullH * 0.2, height: fullH * 0.6, width: fullW * 0.3 }
      const Wc = Math.min(fullW - 40, wrapRect.width + 96)   // converged frame hugs the lockup
      const Hc = Math.min(fullH - 40, wrapRect.height + 72)

      if (datum) g.set(datum, { scaleX: 0, opacity: 0.5 })
      if (vdatum) g.set(vdatum, { scaleY: 0, opacity: 0.4 })
      if (gv.length) g.set(gv, { scaleY: 0, opacity: 1 })
      if (gh.length) g.set(gh, { scaleX: 0, opacity: 1 })
      if (cornersWrap) g.set(cornersWrap, { width: openW, height: openH, opacity: 0 })
      if (corners.length) g.set(corners, { width: 60, height: 60 })

      // ── reduced motion: settle straight to focus ──
      if (reduce) {
        if (counter) counter.style.display = 'none'
        tearDownFilter()
        drawMark(st.pathLen + 1)
        drawWord(1.01)
        if (vdatum) g.set(vdatum, { scaleY: 0, opacity: 0 })
        if (datum) g.set(datum, { opacity: 0 })
        if (gridLines.length) g.set(gridLines, { opacity: 0 })
        if (cornersWrap) g.set(cornersWrap, { opacity: 0 })
        const t = g.timeline({ onComplete: handoff })
        t.fromTo(wrap, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' }, 0)
        if (glow) t.to(glow, { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' }, 0)
        t.to(cue, { opacity: 0.6, y: 0, duration: 0.6 }, 0.7)
        tl = t
        return
      }

      // ── full cinematic timeline ──
      enableFilter()
      if (counter) { counter.style.display = ''; counter.style.opacity = '1'; counter.textContent = '000' }
      if (disp) g.set(disp, { attr: { scale: 64 } })
      if (blur) g.set(blur, { attr: { stdDeviation: 7 } })
      if (wrap) wrap.style.willChange = 'transform, opacity'

      const ctr = { v: 0 }
      const t = g.timeline({ onComplete: handoff })

      // 1. ACQUIRE
      if (datum) t.fromTo(datum, { scaleX: 0 }, { scaleX: 1, duration: 0.95, ease: 'power3.inOut' }, 0.1)
      if (vdatum) t.fromTo(vdatum, { scaleY: 0 }, { scaleY: 1, duration: 0.95, ease: 'power3.inOut' }, 0.1)
      if (gv.length) t.to(gv, { scaleY: 1, duration: 0.8, ease: 'power2.out', stagger: 0.05 }, 0.2)
      if (gh.length) t.to(gh, { scaleX: 1, duration: 0.8, ease: 'power2.out', stagger: 0.05 }, 0.2)
      if (cornersWrap) t.to(cornersWrap, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.15)

      // 2. counter
      if (counter) {
        t.to(ctr, { v: 100, duration: 1.3, ease: 'power1.inOut', onUpdate: () => { counter.textContent = String(Math.round(ctr.v)).padStart(3, '0') } }, 0.2)
        t.to(counter, { opacity: 0, y: -6, duration: 0.4, ease: 'power2.out' }, 1.55)
      }

      // 3. CONVERGE
      const CV = 1.6
      if (gridLines.length) t.to(gridLines, { opacity: 0, duration: 0.55, ease: 'power2.in' }, CV)
      if (vdatum) t.to(vdatum, { scaleY: 0, opacity: 0, duration: 0.75, ease: 'power3.inOut' }, CV)
      if (datum) t.to(datum, { opacity: 0, duration: 0.6, ease: 'power2.in' }, CV)
      if (cornersWrap) t.to(cornersWrap, { width: Wc, height: Hc, duration: 0.95, ease: 'power3.inOut' }, CV)
      if (corners.length) t.to(corners, { width: 22, height: 22, duration: 0.95, ease: 'power3.inOut' }, CV)

      const RS = 2.15

      // 4. ink-bleed disc reveal
      if (disp) t.to(disp, { attr: { scale: 0 }, duration: 1.5, ease: 'power3.out' }, RS)
      if (blur) t.to(blur, { attr: { stdDeviation: 0 }, duration: 1.4, ease: 'power3.out' }, RS)
      t.fromTo(wrap, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out' }, RS)

      // 5. ink glow
      if (glow) t.fromTo(glow, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.3, ease: 'power2.out' }, RS + 0.05)

      // 6. the mark draws itself
      const MS = RS + 0.85
      const PAINT = 1.55
      if (brushDisp) t.to(brushDisp, { attr: { scale: 0 }, duration: 1.5, ease: 'power2.out' }, MS)
      if (pathLen) {
        const prog = { p: 0 }
        t.to(prog, { p: 1, duration: PAINT, ease: 'power1.inOut', onUpdate: () => drawMark(pathLen * prog.p) }, MS)
        t.call(() => drawMark(st.pathLen + 1), null, MS + PAINT)
      }

      // 7. wordmark painted on, line by line
      const WS = MS + PAINT + 0.1
      const WORD = 1.25
      if (brush2Disp) t.to(brush2Disp, { attr: { scale: 0 }, duration: WORD, ease: 'power2.out' }, WS)
      {
        const wp = { p: 0 }
        t.to(wp, { p: 1, duration: WORD, ease: 'power1.inOut', onUpdate: () => drawWord(wp.p) }, WS)
        t.call(() => drawWord(1.01), null, WS + WORD)
      }

      // 8. the viewfinder frame dissolves, leaving the clean lockup
      if (cornersWrap) t.to(cornersWrap, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, WS + WORD - 0.1)

      // 9. scroll cue
      t.to(cue, { opacity: 0.6, y: 0, duration: 0.8, ease: 'power2.out' }, WS + WORD + 0.35)

      t.timeScale(speed)
      tl = t
    }

    // preload the layer bitmaps for canvas compositing, then play
    st.markImage = new Image()
    const markLoaded = new Promise((res) => { st.markImage.onload = res; st.markImage.onerror = res })
    st.markImage.src = '/assets/intro-mark.png'
    st.wordImage = new Image()
    const wordLoaded = new Promise((res) => { st.wordImage.onload = res; st.wordImage.onerror = res })
    st.wordImage.src = '/assets/intro-word.png'

    let cancelled = false
    Promise.all([markLoaded, wordLoaded]).then(() => { if (!cancelled) play() })

    // expose skip handler for the button
    root.__skip = () => { if (tl) tl.progress(1); else handoff() }

    return () => {
      cancelled = true
      if (tl) tl.kill()
      if (breath) breath.kill()
      document.documentElement.classList.remove('is-loading')
    }
  }, [onComplete, speed])

  if (done) return null

  return (
    <div
      className="mdn-intro"
      ref={stageRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: PALETTE.bg, fontFamily: "'Space Grotesk', system-ui, sans-serif", color: PALETTE.ink, overflow: 'hidden' }}
      aria-label="Madane Design Workshop intro"
    >
      {/* filters */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="mdn-ink" x="-60%" y="-60%" width="220%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.013 0.015" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap id="mdn-disp" in="SourceGraphic" in2="noise" scale="78" xChannelSelector="R" yChannelSelector="G" result="disp" />
            <feGaussianBlur id="mdn-blur" in="disp" stdDeviation="9" />
          </filter>
          <filter id="mdn-brush" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.045" numOctaves="2" seed="4" result="bn" />
            <feDisplacementMap id="mdn-brush-disp" in="SourceGraphic" in2="bn" scale="18" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="mdn-brush2" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.06" numOctaves="2" seed="11" result="bn2" />
            <feDisplacementMap id="mdn-brush2-disp" in="SourceGraphic" in2="bn2" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* centered logo lockup */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'min(356px, 56vh)', maxWidth: '80vw' }}>
          <div className="mdn-glow" style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%,-50%)', width: '84%', height: '60%', borderRadius: '50%', opacity: 0, background: 'radial-gradient(circle at 50% 50%, rgba(255,250,238,0.55) 0%, rgba(244,241,234,0.18) 34%, rgba(244,241,234,0.04) 58%, transparent 72%)', filter: 'blur(8px)', pointerEvents: 'none' }} />

          <div className="mdn-logo-wrap" role="img" aria-label="Madane Design Workshop" style={{ position: 'relative', width: '100%', opacity: 0 }}>
            <img className="mdn-logo" src="/assets/intro-disc.png" draggable="false" alt="" style={{ display: 'block', width: '100%', height: 'auto', filter: 'url(#mdn-ink)', userSelect: 'none' }} />
            <div className="mdn-mark-wrap" style={{ position: 'absolute', inset: 0, filter: 'url(#mdn-brush)' }}>
              <canvas className="mdn-mark-canvas" style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>
            <svg className="mdn-geo" viewBox="0 0 502 590" width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
              <path className="mdn-paint-path" d="M246,190 C231,224 214,276 207,324 C202,354 216,376 240,372 C265,368 272,338 261,310 C251,282 266,238 285,214 C294,196 285,170 301,152 C314,136 327,130 338,142 C347,152 345,182 344,214 C342,288 338,334 329,376" fill="none" />
            </svg>
            <div className="mdn-word-wrap" style={{ position: 'absolute', inset: 0, filter: 'url(#mdn-brush2)' }}>
              <canvas className="mdn-word-canvas" style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* viewfinder */}
      <div className="mdn-grid" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <div className="mdn-gl mdn-gv" style={{ position: 'absolute', top: 0, bottom: 0, left: '33.333%', width: 1, background: 'rgba(244,241,234,0.07)', transform: 'scaleY(0)', transformOrigin: '50% 50%' }} />
        <div className="mdn-gl mdn-gv" style={{ position: 'absolute', top: 0, bottom: 0, left: '66.666%', width: 1, background: 'rgba(244,241,234,0.07)', transform: 'scaleY(0)', transformOrigin: '50% 50%' }} />
        <div className="mdn-gl mdn-gh" style={{ position: 'absolute', left: 0, right: 0, top: '33.333%', height: 1, background: 'rgba(244,241,234,0.07)', transform: 'scaleX(0)', transformOrigin: '50% 50%' }} />
        <div className="mdn-gl mdn-gh" style={{ position: 'absolute', left: 0, right: 0, top: '66.666%', height: 1, background: 'rgba(244,241,234,0.07)', transform: 'scaleX(0)', transformOrigin: '50% 50%' }} />
      </div>
      <div className="mdn-vdatum" style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, transform: 'translateX(-50%) scaleY(0)', transformOrigin: '50% 50%', background: PALETTE.ink, opacity: 0.4, zIndex: 1 }} />
      <div className="mdn-datum" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, transform: 'scaleX(0)', transformOrigin: '50% 50%', background: PALETTE.ink, opacity: 0.5, zIndex: 1 }} />
      <div className="mdn-corners" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 0, height: 0, zIndex: 6, pointerEvents: 'none', opacity: 0 }}>
        <span className="mdn-cnr" style={{ position: 'absolute', top: 0, left: 0, width: 60, height: 60, borderTop: '1px solid rgba(244,241,234,0.28)', borderLeft: '1px solid rgba(244,241,234,0.28)' }} />
        <span className="mdn-cnr" style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderTop: '1px solid rgba(244,241,234,0.28)', borderRight: '1px solid rgba(244,241,234,0.28)' }} />
        <span className="mdn-cnr" style={{ position: 'absolute', bottom: 0, left: 0, width: 60, height: 60, borderBottom: '1px solid rgba(244,241,234,0.28)', borderLeft: '1px solid rgba(244,241,234,0.28)' }} />
        <span className="mdn-cnr" style={{ position: 'absolute', bottom: 0, right: 0, width: 60, height: 60, borderBottom: '1px solid rgba(244,241,234,0.28)', borderRight: '1px solid rgba(244,241,234,0.28)' }} />
      </div>

      {/* counter */}
      <div className="mdn-counter" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, calc(-50% - 26px))', zIndex: 6, fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: '0.34em', color: 'rgba(244,241,234,0.82)', paddingLeft: '0.34em' }}>000</div>

      {/* scroll cue */}
      <div className="mdn-cue" style={{ position: 'absolute', left: '50%', bottom: 22, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: 0, zIndex: 4 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(244,241,234,0.5)' }}>Scroll</div>
        <div style={{ position: 'relative', width: 1, height: 38, overflow: 'hidden', background: 'rgba(244,241,234,0.12)' }}>
          <div className="mdn-drop" style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 14, background: 'rgba(244,241,234,0.7)' }} />
        </div>
      </div>

      {/* skip */}
      <button
        className="mdn-skip"
        onClick={() => stageRef.current?.__skip?.()}
        style={{ position: 'absolute', top: 24, right: 26, appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(244,241,234,0.45)', padding: '8px 10px', zIndex: 7 }}
      >Skip</button>

      {/* vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 46%, transparent 42%, rgba(0,0,0,0.5) 100%)' }} />

      {/* film grain */}
      <svg className="mdn-grain" style={{ position: 'fixed', top: '-50%', left: '-50%', width: '200%', height: '200%', pointerEvents: 'none', opacity: 0.04, mixBlendMode: 'overlay' }} aria-hidden="true">
        <filter id="mdn-grainf"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#mdn-grainf)" />
      </svg>
    </div>
  )
}
