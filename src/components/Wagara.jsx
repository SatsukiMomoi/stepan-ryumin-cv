// Традиционные японские узоры (wagara) как обложки проектов. Чистый SVG.
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1 }

const defs = {
  asanoha: (id) => (
    <pattern id={id} width="40" height="69.28" patternUnits="userSpaceOnUse">
      <g {...stroke}>
        {[[20, 0], [0, 34.64], [40, 34.64], [20, 69.28]].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <g key={a} transform={`rotate(${a})`}>
                <line x1="0" y1="0" x2="0" y2="-23.09" />
                <line x1="0" y1="0" x2="-10" y2="-17.32" />
                <line x1="0" y1="0" x2="10" y2="-17.32" />
                <line x1="-10" y1="-17.32" x2="0" y2="-23.09" />
                <line x1="10" y1="-17.32" x2="0" y2="-23.09" />
              </g>
            ))}
          </g>
        ))}
      </g>
    </pattern>
  ),
  kikko: (id) => (
    <pattern id={id} width="36" height="62.35" patternUnits="userSpaceOnUse">
      <g {...stroke}>
        <path d="M9 0 L27 0 L36 15.59 L27 31.18 L9 31.18 L0 15.59 Z" />
        <path d="M13 6.9 L23 6.9 L28 15.59 L23 24.28 L13 24.28 L8 15.59 Z" />
        <path d="M-9 31.18 L9 31.18 L18 46.77 L9 62.35 L-9 62.35 L-18 46.77 Z M27 31.18 L45 31.18 L54 46.77 L45 62.35 L27 62.35 L18 46.77 Z" />
        <path d="M22 38.08 L32 38.08 L37 46.77 L32 55.46 L22 55.46 L17 46.77 Z" transform="translate(-9 0)" />
      </g>
    </pattern>
  ),
  ichimatsu: (id) => (
    <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="currentColor" opacity="0.5" />
      <rect x="16" y="16" width="16" height="16" fill="currentColor" opacity="0.5" />
      <rect width="32" height="32" {...stroke} opacity="0.4" />
    </pattern>
  ),
  yagasuri: (id) => (
    <pattern id={id} width="24" height="48" patternUnits="userSpaceOnUse">
      <g {...stroke}>
        <path d="M0 0 L12 12 L24 0 M0 12 L12 24 L24 12 M12 12 V48 M0 24 L12 36 L24 24" />
        <path d="M0 0 V48 M24 0 V48" opacity="0.5" />
      </g>
    </pattern>
  ),
  shippo: (id) => (
    <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
      <g {...stroke}>
        <circle cx="0" cy="0" r="20" /><circle cx="40" cy="0" r="20" />
        <circle cx="0" cy="40" r="20" /><circle cx="40" cy="40" r="20" />
        <circle cx="20" cy="20" r="20" />
      </g>
    </pattern>
  ),
  seigaiha: (id) => (
    <pattern id={id} width="40" height="20" patternUnits="userSpaceOnUse">
      <g {...stroke}>
        {[[20, 10], [0, 20], [40, 20], [20, 30]].map(([cx, cy], i) => (
          <g key={i}>
            <path className="fan" d={`M${cx - 20} ${cy} A20 20 0 0 1 ${cx + 20} ${cy} Z`} />
            {[15, 10, 5].map((r) => (
              <path key={r} d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} />
            ))}
          </g>
        ))}
      </g>
    </pattern>
  ),
}

export default function Wagara({ type, uid }) {
  const id = `wg-${type}-${uid}`
  return (
    <svg className="wagara" aria-hidden="true" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 300">
      <defs>{defs[type](id)}</defs>
      <rect className="wagara-fill" x="-100" y="-100" width="600" height="500" fill={`url(#${id})`} />
    </svg>
  )
}
