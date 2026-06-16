import { useMemo } from 'react'
import { clients, recent } from '../data/site'
import { SplitReveal, FadeUp } from '../components/Reveal'

export function Clients() {
  const [rowA, rowB] = useMemo(() => {
    const mid = Math.ceil(clients.length / 2)
    return [clients.slice(0, mid), clients.slice(mid)]
  }, [])

  return (
    <section id="clients" className="clients section">
      <div className="wrap clients__head">
        <span className="eyebrow">trusted by</span>
        <SplitReveal as="h2" className="clients__title" type="words" stagger={0.05}>
          50% of our clients are<br />fortune 500. 65% come back.
        </SplitReveal>
      </div>

      <div className="clients__marquee">
        <div className="clients__row">
          <Track items={rowA} />
          <Track items={rowA} aria-hidden />
        </div>
        <div className="clients__row clients__row--rev">
          <Track items={rowB} />
          <Track items={rowB} aria-hidden />
        </div>
      </div>

      <FadeUp className="wrap clients__recent">
        <span className="clients__recenttag">recently commissioned</span>
        <ul>
          {recent.map((r) => (
            <li key={r.client}><strong>{r.client}</strong><span>{r.note}</span></li>
          ))}
        </ul>
      </FadeUp>
    </section>
  )
}

function Track({ items }) {
  return (
    <ul className="clients__track">
      {items.map((c, i) => (
        <li key={`${c}-${i}`} className="clients__logo" data-cursor=""><span>{c}</span></li>
      ))}
    </ul>
  )
}
