import { useRef, useLayoutEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../data/site'

gsap.registerPlugin(ScrollTrigger)

/* Title-case a raw sector token ("IT / software" -> "IT / Software") */
const labelFor = (s) =>
  s
    .split(' ')
    .map((w) =>
      w === w.toUpperCase() && w.length > 1
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(' ')

/* one-line synthesised description from real project fields (no copy invented) */
const descFor = (p) => {
  const where = p.location ? p.location.split(',')[0].trim() : ''
  const size = p.area ? ` spanning ${p.area}` : ''
  const cert = p.rating && /platinum|gold|leed|igbc/i.test(p.rating)
    ? `, certified ${p.rating}`
    : ''
  return `A ${labelFor(p.sector).toLowerCase()} workplace for ${p.client}${size}${
    where ? `, ${where}` : ''
  }${cert}.`
}

/* meta chips (stands in for "stack") — only truthy, branding-faithful */
const chipsFor = (p) =>
  [labelFor(p.sector), p.area, p.rating, p.year].filter(Boolean)

/* deterministic seeded RNG so the scatter is identical every mount */
const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/*
 * Build an organic-but-curated scatter: items are spread evenly across each
 * row (so the section width stays occupied, no big holes) then jittered,
 * rotated and resized. The even-row base = "intentional"; the jitter = "alive".
 * Returns per-item { xPct, yPct, rot, w, ar, z, depth } in stage space.
 */
const buildLayout = (n, { rows, wMin, wMax, jitterX, jitterY, maxRot, marginX, marginY, rowStagger = 0 }) => {
  const rng = mulberry32(20240617)
  const perRow = Array.from({ length: rows }, (_, r) =>
    Math.floor(n / rows) + (r < n % rows ? 1 : 0)
  )
  const out = []
  let i = 0
  perRow.forEach((count, r) => {
    // shift whole rows left/right so columns don't line up into clean lanes
    const shift = (r % 2 ? 1 : -1) * rowStagger
    for (let j = 0; j < count; j++, i++) {
      const usableX = 100 - marginX * 2
      const usableY = 100 - marginY * 2
      // pack each row across a slightly tighter span (kills the dead centre gap)
      const span = 0.82
      const lead = (1 - span) / 2
      const baseX = marginX + (lead + ((j + 0.5) / count) * span) * usableX + shift
      const baseY = marginY + ((r + 0.5) / rows) * usableY
      const x = baseX + (rng() - 0.5) * jitterX
      const y = baseY + (rng() - 0.5) * jitterY
      const sizeTier = rng()                       // 0..1 visual hierarchy
      const w = Math.round(wMin + sizeTier * (wMax - wMin))
      const ar = [0.8, 1, 1.25][Math.floor(rng() * 3)] // w:h variety (portrait..landscape)
      const rot = (rng() * 2 - 1) * maxRot
      out.push({
        xPct: gsap.utils.clamp(marginX, 100 - marginX, x),
        yPct: gsap.utils.clamp(marginY, 100 - marginY, y),
        rot,
        w,
        ar,
        z: Math.round(10 + sizeTier * 40),          // bigger photos sit forward
        depth: 0.4 + sizeTier * 0.6,                // parallax strength
      })
    }
  })
  return out
}

/**
 * <Works> · "Selected Works" as a premium scattered-photo gallery.
 *
 * Photographs lie scattered on a desk: each lightly rotated, softly shadowed,
 * idly floating, drifting with the cursor (parallax). Hover lifts + aligns one
 * photo and magnetically nudges its neighbours; click pulls it to centre at
 * 1.4x, pushes the rest outward, and reveals the project dossier. Escape or an
 * outside click restores the scatter.
 *
 * Every animated property lives on its own nested layer so GSAP transforms
 * never collide:
 *   .sw-card  (outer)  · left/top% + centering + z-index   (position, static)
 *   .sw-par            · mouse parallax x/y                 (idle only)
 *   .sw-mag            · displacement x/y  (neighbour magnet OR focus push/centre)
 *   .sw-float          · idle float y + drift rotation      (paused on focus)
 *   .sw-inner          · base rotation + hover/focus scale + cursor-follow x/y
 */
export function Works({ onOpen }) {
  const root = useRef(null)
  const stage = useRef(null)
  const detail = useRef(null)
  const backdrop = useRef(null)
  const closeBtn = useRef(null)
  // detail dossier fields (filled imperatively → no React re-render)
  const dTitle = useRef(null)
  const dCat = useRef(null)
  const dDesc = useRef(null)
  const dChips = useRef(null)
  const dBtn = useRef(null)
  const currentRef = useRef(null) // project shown in dossier (for View Project)

  const items = useMemo(() => projects, [])

  useLayoutEffect(() => {
    let runCleanups = () => {}
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.sw-card', stage.current)
      if (!cards.length) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // per-card animation handles + live layout, rebuilt per breakpoint
      let L = []                 // layout array (stage-space)
      const par = []             // quickTo: parallax x/y on .sw-par
      const mag = []             // quickTo: displacement x/y on .sw-mag
      const inr = []             // quickTo: cursor-follow x/y on .sw-inner
      const floats = []          // idle float timelines
      let focusedIndex = -1
      let stageW = 0
      let stageH = 0

      const layerOf = (card, cls) => card.querySelector(cls)

      /* ---- place every card for the current breakpoint config ---- */
      const place = (cfg) => {
        stageW = stage.current.offsetWidth
        stageH = stage.current.offsetHeight
        L = buildLayout(cards.length, cfg)
        cards.forEach((card, i) => {
          const d = L[i]
          gsap.set(card, {
            left: `${d.xPct}%`,
            top: `${d.yPct}%`,
            xPercent: -50,
            yPercent: -50,
            zIndex: d.z,
            width: d.w,
          })
          layerOf(card, '.sw-inner').style.aspectRatio = String(d.ar)
          gsap.set(layerOf(card, '.sw-inner'), { rotation: d.rot, scale: 1, x: 0, y: 0 })
          gsap.set(layerOf(card, '.sw-par'), { x: 0, y: 0 })
          gsap.set(layerOf(card, '.sw-mag'), { x: 0, y: 0 })
          gsap.set(layerOf(card, '.sw-float'), { y: 0, rotation: 0 })
        })
      }

      /* ---- idle float + drift (paused while a card is focused) ---- */
      const buildFloats = () => {
        floats.forEach((t) => t.kill())
        floats.length = 0
        if (reduce) return
        cards.forEach((card, i) => {
          const f = layerOf(card, '.sw-float')
          const amp = 6 + (i % 5) * 1.8
          const dur = 3.2 + (i % 4) * 0.6
          const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
          tl.to(f, { y: -amp, rotation: (i % 2 ? 1 : -1) * 1.4, duration: dur }, 0)
            .to(f, { y: amp * 0.6, duration: dur }, dur)
          tl.progress((i % 10) / 10) // desync so they don't pulse in unison
          floats.push(tl)
        })
      }

      /* ---- quickTo factories (rebuilt per breakpoint) ---- */
      const buildQuick = () => {
        par.length = mag.length = inr.length = 0
        cards.forEach((card) => {
          par.push({
            x: gsap.quickTo(layerOf(card, '.sw-par'), 'x', { duration: 0.7, ease: 'power3' }),
            y: gsap.quickTo(layerOf(card, '.sw-par'), 'y', { duration: 0.7, ease: 'power3' }),
          })
          mag.push({
            x: gsap.quickTo(layerOf(card, '.sw-mag'), 'x', { duration: 0.55, ease: 'power3' }),
            y: gsap.quickTo(layerOf(card, '.sw-mag'), 'y', { duration: 0.55, ease: 'power3' }),
          })
          inr.push({
            x: gsap.quickTo(layerOf(card, '.sw-inner'), 'x', { duration: 0.5, ease: 'power3' }),
            y: gsap.quickTo(layerOf(card, '.sw-inner'), 'y', { duration: 0.5, ease: 'power3' }),
          })
        })
      }

      /* =================== PARALLAX (idle) =================== */
      let pmx = 0, pmy = 0
      const onStageMove = (e) => {
        if (focusedIndex !== -1) return
        const r = stage.current.getBoundingClientRect()
        pmx = (e.clientX - r.left) / r.width - 0.5  // -0.5..0.5
        pmy = (e.clientY - r.top) / r.height - 0.5
        cards.forEach((_, i) => {
          const strength = 26 * L[i].depth
          par[i].x(-pmx * strength)
          par[i].y(-pmy * strength)
        })
      }
      const onStageLeave = () => {
        if (focusedIndex !== -1) return
        cards.forEach((_, i) => { par[i].x(0); par[i].y(0) })
      }

      /* =================== HOVER =================== */
      const hoverIn = (i) => {
        if (focusedIndex !== -1) return
        const card = cards[i]
        gsap.set(card, { zIndex: 900 })
        card.classList.add('is-hot')
        gsap.to(layerOf(card, '.sw-inner'), {
          scale: 1.15,
          rotation: L[i].rot * 0.25, // align toward upright
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
        })
        // magnetic: neighbours drift away, scaled by proximity
        const cx = (L[i].xPct / 100) * stageW
        const cy = (L[i].yPct / 100) * stageH
        cards.forEach((other, j) => {
          if (j === i) return
          const ox = (L[j].xPct / 100) * stageW
          const oy = (L[j].yPct / 100) * stageH
          const dx = ox - cx
          const dy = oy - cy
          const dist = Math.hypot(dx, dy) || 1
          const radius = stageW * 0.22
          if (dist > radius) { mag[j].x(0); mag[j].y(0); return }
          const push = (1 - dist / radius) * 22
          mag[j].x((dx / dist) * push)
          mag[j].y((dy / dist) * push)
        })
      }
      const hoverMove = (i, e) => {
        if (focusedIndex !== -1) return
        const r = cards[i].getBoundingClientRect()
        const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
        const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
        inr[i].x(gsap.utils.clamp(-1, 1, nx) * 8) // photo follows cursor a few px
        inr[i].y(gsap.utils.clamp(-1, 1, ny) * 8)
      }
      const hoverOut = (i) => {
        if (focusedIndex !== -1) return
        const card = cards[i]
        card.classList.remove('is-hot')
        gsap.set(card, { zIndex: L[i].z })
        gsap.to(layerOf(card, '.sw-inner'), {
          scale: 1,
          rotation: L[i].rot,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto',
        })
        inr[i].x(0); inr[i].y(0)
        cards.forEach((_, j) => { if (j !== i) { mag[j].x(0); mag[j].y(0) } })
      }

      /* =================== FOCUS (click) =================== */
      const focus = (i) => {
        if (focusedIndex === i) return
        focusedIndex = i
        floats.forEach((t) => t.pause())
        const card = cards[i]
        card.classList.remove('is-hot')
        card.classList.add('is-focus')
        root.current.classList.add('is-focused')

        // zero parallax everywhere, lift focused above all
        cards.forEach((_, j) => { par[j].x(0); par[j].y(0) })
        gsap.set(card, { zIndex: 1200 })

        const cx = (L[i].xPct / 100) * stageW
        const cy = (L[i].yPct / 100) * stageH
        const detailOpen = stage.current.classList.contains('sw-stage--side')
        // target: visual centre (nudged up/left when dossier sits to the side)
        const targetX = detailOpen ? stageW * 0.34 : stageW * 0.5
        const targetY = detailOpen ? stageH * 0.42 : stageH * 0.46

        // scale to a TARGET size (not a fixed multiplier) so small + large
        // photos all open to a consistent, generous focal size
        const targetW = detailOpen
          ? Math.min(stageW * 0.39, stageH * 0.71 * L[i].ar, 598)
          : Math.min(stageW * 0.71, stageH * 0.76 * L[i].ar, 644)
        const focusScale = gsap.utils.clamp(1.4, 4, targetW / L[i].w)

        const tl = gsap.timeline({ defaults: { ease: 'elastic.out(0.7, 0.7)' } })
        // move focused photo toward centre (spring-like)
        tl.to(layerOf(card, '.sw-mag'), {
          x: targetX - cx,
          y: targetY - cy,
          duration: 1.1,
        }, 0)
        tl.to(layerOf(card, '.sw-inner'), {
          scale: focusScale,
          rotation: 0,
          x: 0,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
        }, 0)

        // push every other card outward from the centre (spring-like)
        cards.forEach((other, j) => {
          if (j === i) return
          const ox = (L[j].xPct / 100) * stageW
          const oy = (L[j].yPct / 100) * stageH
          const dx = ox - targetX
          const dy = oy - targetY
          const dist = Math.hypot(dx, dy) || 1
          const shove = gsap.utils.mapRange(0, stageW, 240, 90, dist)
          tl.to(layerOf(other, '.sw-mag'), {
            x: (dx / dist) * shove,
            y: (dy / dist) * shove,
            duration: 1.0,
            ease: 'power2.out',
          }, 0)
          tl.to(layerOf(other, '.sw-inner'), { scale: 0.92, duration: 0.6, ease: 'power2.out' }, 0)
        })

        // dim scene + reveal dossier
        gsap.to(backdrop.current, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
        gsap.set(closeBtn.current, { display: 'grid' })
        gsap.to(closeBtn.current, { autoAlpha: 1, duration: 0.4, delay: 0.2 })

        fillDetail(i)
        const d = detail.current
        gsap.set(d, { display: 'flex' })
        const bits = d.querySelectorAll('[data-stagger]')
        gsap.timeline({ delay: 0.25 })
          .fromTo(d, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
          .fromTo(bits, { y: 24, autoAlpha: 0 }, {
            y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out',
          }, 0.05)
      }

      const restore = () => {
        if (focusedIndex === -1) return
        const i = focusedIndex
        focusedIndex = -1
        cards[i].classList.remove('is-focus')
        root.current.classList.remove('is-focused')

        gsap.to(detail.current, {
          autoAlpha: 0, duration: 0.35, ease: 'power2.in',
          onComplete: () => gsap.set(detail.current, { display: 'none' }),
        })
        gsap.to(backdrop.current, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' })
        gsap.to(closeBtn.current, {
          autoAlpha: 0, duration: 0.3,
          onComplete: () => gsap.set(closeBtn.current, { display: 'none' }),
        })

        const tl = gsap.timeline({
          defaults: { ease: 'elastic.out(0.65, 0.85)', duration: 1.0 },
          onComplete: () => {
            cards.forEach((card, j) => gsap.set(card, { zIndex: L[j].z }))
            floats.forEach((t) => t.play())
          },
        })
        cards.forEach((card, j) => {
          tl.to(layerOf(card, '.sw-mag'), { x: 0, y: 0 }, 0)
          tl.to(layerOf(card, '.sw-inner'), {
            scale: 1, rotation: L[j].rot, x: 0, y: 0, ease: 'power3.out', duration: 0.8,
          }, 0)
        })
        // keep the just-closed card above during its flight home
        gsap.set(cards[i], { zIndex: 1100 })
      }

      const fillDetail = (i) => {
        const p = items[i]
        currentRef.current = p
        dTitle.current.textContent = p.name
        dCat.current.textContent = labelFor(p.sector)
        dDesc.current.textContent = descFor(p)
        dChips.current.innerHTML = ''
        chipsFor(p).forEach((c) => {
          const span = document.createElement('span')
          span.className = 'sw-detail__chip'
          span.textContent = c
          dChips.current.appendChild(span)
        })
      }

      /* =================== wire events =================== */
      const cleanups = []
      cards.forEach((card, i) => {
        const onEnter = () => hoverIn(i)
        const onMove = (e) => hoverMove(i, e)
        const onLeave = () => hoverOut(i)
        const onClick = () => (focusedIndex === i ? restore() : focus(i))
        const onKey = (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focus(i) }
        }
        card.addEventListener('mouseenter', onEnter)
        card.addEventListener('mousemove', onMove)
        card.addEventListener('mouseleave', onLeave)
        card.addEventListener('click', onClick)
        card.addEventListener('keydown', onKey)
        cleanups.push(() => {
          card.removeEventListener('mouseenter', onEnter)
          card.removeEventListener('mousemove', onMove)
          card.removeEventListener('mouseleave', onLeave)
          card.removeEventListener('click', onClick)
          card.removeEventListener('keydown', onKey)
        })
      })

      stage.current.addEventListener('mousemove', onStageMove)
      stage.current.addEventListener('mouseleave', onStageLeave)
      cleanups.push(() => {
        stage.current?.removeEventListener('mousemove', onStageMove)
        stage.current?.removeEventListener('mouseleave', onStageLeave)
      })

      const onBackdrop = () => restore()
      backdrop.current.addEventListener('click', onBackdrop)
      closeBtn.current.addEventListener('click', onBackdrop)
      cleanups.push(() => {
        backdrop.current?.removeEventListener('click', onBackdrop)
        closeBtn.current?.removeEventListener('click', onBackdrop)
      })

      const onView = (e) => { e.stopPropagation(); if (currentRef.current) onOpen(currentRef.current) }
      dBtn.current.addEventListener('click', onView)
      cleanups.push(() => dBtn.current?.removeEventListener('click', onView))

      const onEsc = (e) => { if (e.key === 'Escape') restore() }
      window.addEventListener('keydown', onEsc)
      cleanups.push(() => window.removeEventListener('keydown', onEsc))
      runCleanups = () => cleanups.forEach((fn) => fn())

      /* =================== responsive (matchMedia) =================== */
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1025px)', () => {
        stage.current.classList.add('sw-stage--side')
        place({ rows: 4, wMin: 104, wMax: 184, jitterX: 9, jitterY: 6, maxRot: 11, marginX: 7, marginY: 10, rowStagger: 9 })
        buildQuick(); buildFloats()
        return () => floats.forEach((t) => t.kill())
      })
      mm.add('(min-width: 641px) and (max-width: 1024px)', () => {
        stage.current.classList.remove('sw-stage--side')
        place({ rows: 5, wMin: 92, wMax: 148, jitterX: 7, jitterY: 5, maxRot: 9, marginX: 9, marginY: 8, rowStagger: 7 })
        buildQuick(); buildFloats()
        return () => floats.forEach((t) => t.kill())
      })
      mm.add('(max-width: 640px)', () => {
        stage.current.classList.remove('sw-stage--side')
        place({ rows: 9, wMin: 140, wMax: 200, jitterX: 5, jitterY: 4, maxRot: 6, marginX: 18, marginY: 6 })
        buildQuick(); buildFloats()
        return () => floats.forEach((t) => t.kill())
      })

      // intro: photos settle onto the desk as the section scrolls in.
      // opacity rides .sw-inner, drop rides .sw-par (parallax is 0 until the
      // mouse moves, so it won't fight) — never the float layer.
      if (!reduce) {
        gsap.set(cards.map((c) => layerOf(c, '.sw-inner')), { autoAlpha: 0 })
        ScrollTrigger.batch(cards, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) => {
            gsap.to(batch.map((c) => layerOf(c, '.sw-inner')), {
              autoAlpha: 1, duration: 0.8, ease: 'power2.out', stagger: 0.04,
            })
            gsap.fromTo(
              batch.map((c) => layerOf(c, '.sw-par')),
              { y: 64 },
              { y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.04 }
            )
          },
        })
      }

      /* ---- ornaments: arrow self-draws, notes fade in, sparks twinkle ---- */
      const hands = gsap.utils.toArray('.sw-orn__hand', root.current)
      const draws = gsap.utils.toArray('.sw-orn__draw', root.current)
      const sparks = gsap.utils.toArray('.sw-orn__spark, .sw-orn__star', root.current)
      gsap.set(hands, { autoAlpha: 0, y: 10 })
      if (!reduce) gsap.set(sparks, { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' })
      draws.forEach((path) => {
        const len = path.getTotalLength?.() || 200
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len })
      })
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          gsap.to(hands, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.25, ease: 'power2.out', delay: 0.3 })
          if (!reduce) {
            gsap.to(draws, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', delay: 0.5 })
            gsap.to(sparks, {
              autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.15, delay: 0.7,
              onComplete: () => {
                // gentle perpetual twinkle
                sparks.forEach((s, k) =>
                  gsap.to(s, {
                    autoAlpha: 0.45, scale: 0.86, duration: 1.6 + (k % 3) * 0.4,
                    repeat: -1, yoyo: true, ease: 'sine.inOut', delay: (k % 4) * 0.3,
                  })
                )
              },
            })
          } else {
            gsap.set(sparks, { autoAlpha: 1, scale: 1 })
          }
        },
      })
    }, root)

    return () => { runCleanups(); ctx.revert() }
  }, [items, onOpen])

  return (
    <section id="works" className="works section sw" ref={root}>
      <div className="wrap">
        <header className="works__head sw-head">
          <div className="works__intro">
            <span className="eyebrow">Selected Works</span>
            <h2 className="works__title">The proof is built.</h2>
          </div>
          <p className="sw-hint">Hover to lift · click a photo to open the project</p>
        </header>
      </div>

      <div className="sw-stage" ref={stage}>
        <div className="sw-backdrop" ref={backdrop} aria-hidden="true" />

        {items.map((p) => (
          <article
            key={p.id}
            className="sw-card"
            role="button"
            tabIndex={0}
            aria-label={`${p.name} — open project`}
            data-cursor="View"
            style={{ '--tone': p.tone }}
          >
            <div className="sw-par">
              <div className="sw-mag">
                <div className="sw-float">
                  <div className="sw-inner">
                    <div
                      className="sw-photo"
                      style={{ backgroundImage: `url(${p.cover})` }}
                      role="img"
                      aria-label={p.name}
                    />
                    <div className="sw-tag">
                      <span className="sw-tag__name">{p.name}</span>
                      <span className="sw-tag__loc">{labelFor(p.sector)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}

        <button className="sw-close" ref={closeBtn} aria-label="Close project" data-cursor="close">
          <span /><span />
        </button>

        <aside className="sw-detail" ref={detail} aria-live="polite">
          <span className="sw-detail__cat" data-stagger ref={dCat} />
          <h3 className="sw-detail__title" data-stagger ref={dTitle} />
          <p className="sw-detail__desc" data-stagger ref={dDesc} />
          <div className="sw-detail__chips" data-stagger ref={dChips} />
          <button className="sw-detail__btn" data-stagger ref={dBtn} data-cursor="open">
            View Project<span aria-hidden="true">→</span>
          </button>
        </aside>
      </div>

      {/* hand-drawn editorial ornaments — purely decorative, never block clicks */}
      <div className="sw-orn" aria-hidden="true">
        <div className="sw-orn__note sw-orn__note--a">
          <span className="sw-orn__hand">tap to step inside</span>
          <svg className="sw-orn__arrow" viewBox="0 0 130 86" fill="none">
            <path className="sw-orn__draw" d="M4 12 C 36 6, 84 8, 112 44 C 120 55, 122 64, 120 74" />
            <path className="sw-orn__draw" d="M104 58 L121 76 L126 52" />
          </svg>
        </div>

        <div className="sw-orn__note sw-orn__note--b">
          <span className="sw-orn__hand sw-orn__hand--sm">built, not rendered</span>
        </div>

        <svg className="sw-orn__spark sw-orn__spark--1" viewBox="0 0 44 44" fill="none">
          <path d="M22 4 L22 18" /><path d="M34 10 L26 20" /><path d="M10 10 L18 20" />
        </svg>
        <svg className="sw-orn__spark sw-orn__spark--2" viewBox="0 0 44 44" fill="none">
          <path d="M22 4 L22 18" /><path d="M34 10 L26 20" /><path d="M10 10 L18 20" />
        </svg>
      </div>
    </section>
  )
}
