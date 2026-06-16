// The madane mark as strokeable vector paths (pathLength=1 → easy draw-on).
// Pure monochrome. Used by the intro (animated) and can render static too.
export function LogoMark({ className = '', stroke = '#fff', draw = false }) {
  const dash = draw ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 } : {}
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden>
      {/* hand-painted-feel ring (two arcs leave a brush gap) */}
      <path
        className="lm-ring"
        d="M60 8 a52 52 0 0 1 50.5 64.5 M108 84 a52 52 0 0 1 -96 -2 a52 52 0 0 1 30 -69"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        {...dash}
      />
      {/* the 'm' mark */}
      <path
        className="lm-m"
        d="M40 84 L40 46 Q40 38 47 43 L60 56 L73 43 Q80 38 80 46 L80 84"
        stroke={stroke}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...dash}
      />
    </svg>
  )
}
