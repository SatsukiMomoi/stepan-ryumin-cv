import { memo, useEffect, useRef, useState } from 'react'
import { store, tintAt, nearStation } from '../store'

function useViewport() {
  const [vp, setVp] = useState({ w: innerWidth, h: innerHeight })
  useEffect(() => {
    let t
    const on = () => { clearTimeout(t); t = setTimeout(() => setVp({ w: innerWidth, h: innerHeight }), 80) }
    addEventListener('resize', on)
    return () => removeEventListener('resize', on)
  }, [])
  return vp
}

function layout(w, h) {
  const mobile = w < 700
  return {
    mobile,
    top: h * (mobile ? 0.15 : 0.17),
    bottom: h * (mobile ? 0.82 : 0.83),
    r: mobile ? 22 : 28,
    wins: mobile ? [[w * 0.04, w * 0.96]] : [[w * 0.025, w * 0.6], [w * 0.64, w * 0.975]],
    railY: h * (mobile ? 0.125 : 0.13),
    strapCount: mobile ? 4 : 9,
    strapLen: h * (mobile ? 0.06 : 0.075),
  }
}

function paths(w, h) {
  const L = layout(w, h)
  const { top, bottom, r, wins } = L
  const rr = (x1, x2, pad = 0) => {
    const a = x1 - pad, b = x2 + pad, t = top - pad, bo = bottom + pad, R = r + pad
    return `M${a + R} ${t} H${b - R} Q${b} ${t} ${b} ${t + R} V${bo - R} Q${b} ${bo} ${b - R} ${bo} H${a + R} Q${a} ${bo} ${a} ${bo - R} V${t + R} Q${a} ${t} ${a + R} ${t} Z`
  }
  return { L, rr, frame: `M0 0 H${w} V${h} H0 Z ${wins.map(([a, b]) => rr(a, b)).join(' ')}` }
}

// Статичный салон: перерисовывается только при ресайзе
const Frame = memo(function Frame({ w, h }) {
  const { L, rr, frame } = paths(w, h)
  const { top, bottom, wins, railY } = L
  const seatY = bottom + h * 0.035
  const blindH = h * (L.mobile ? 0.03 : 0.04)
  const rackTop = top - h * 0.034, rackBot = top - h * 0.012
  const pillar = L.mobile ? null : (wins[0][1] + wins[1][0]) / 2
  // места на диване: ложбинки между сиденьями
  const dimples = []
  const seatW = L.mobile ? w / 4.2 : w / 7.6
  for (let x = seatW * 0.5; x < w; x += seatW) if (!pillar || Math.abs(x - pillar) > 50) dimples.push(x)
  const brackets = []
  const nb = L.mobile ? 3 : 7
  for (let i = 0; i <= nb; i++) brackets.push((w / nb) * i)
  const cove = railY - h * 0.028
  return (
    <svg className="interior" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1eee6" />
          <stop offset="0.12" stopColor="#e2ded3" />
          <stop offset="0.45" stopColor="#cfcbc0" />
          <stop offset="0.8" stopColor="#b3afa5" />
          <stop offset="1" stopColor="#8f8b82" />
        </linearGradient>
        <linearGradient id="ceil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfaf6" />
          <stop offset="0.7" stopColor="#e9e6de" />
          <stop offset="1" stopColor="#d3cfc5" />
        </linearGradient>
        <linearGradient id="sideL" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sideR" x1="1" x2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lamp" cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor="#fff8e8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff8e8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="steelV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#dfe3e6" />
          <stop offset="0.55" stopColor="#9aa0a5" />
          <stop offset="0.8" stopColor="#c8cdd1" />
          <stop offset="1" stopColor="#6d7378" />
        </linearGradient>
        <linearGradient id="steelH" x1="0" x2="1">
          <stop offset="0" stopColor="#6b7176" />
          <stop offset="0.25" stopColor="#c9ced2" />
          <stop offset="0.42" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#a4aaaf" />
          <stop offset="1" stopColor="#5d6368" />
        </linearGradient>
        <linearGradient id="alu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef0f0" />
          <stop offset="0.5" stopColor="#b9bdbf" />
          <stop offset="1" stopColor="#8a8f92" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.09" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.58" stopColor="#fff" stopOpacity="0.035" />
          <stop offset="0.66" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="glassTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe6ff" stopOpacity="0.16" />
          <stop offset="0.06" stopColor="#dfe6ff" stopOpacity="0.02" />
          <stop offset="0.9" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="blind" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfc6b0" />
          <stop offset="1" stopColor="#e8e0cb" />
        </linearGradient>
        <pattern id="pleat" width="10" height="6" patternUnits="userSpaceOnUse">
          <rect width="10" height="6" fill="url(#blind)" />
          <rect y="4.6" width="10" height="1.4" fill="#000" opacity="0.09" />
          <rect y="0" width="10" height="0.8" fill="#fff" opacity="0.35" />
        </pattern>
        <linearGradient id="blindShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <filter id="inner" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="soft" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id="shadow" x="-10%" y="-50%" width="120%" height="300%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        {/* обивка: синий жаккард с ромбами и приоритетные места — бордо */}
        <pattern id="moquette" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#1e2c5e" />
          <path d="M7 1.5 L12.5 7 L7 12.5 L1.5 7 Z" fill="#26377200" stroke="#2f4485" strokeWidth="1.2" />
          <circle cx="7" cy="7" r="1.3" fill="#c9a25a" opacity="0.55" />
          <circle cx="0" cy="0" r="0.9" fill="#3b5296" /><circle cx="14" cy="0" r="0.9" fill="#3b5296" />
          <circle cx="0" cy="14" r="0.9" fill="#3b5296" /><circle cx="14" cy="14" r="0.9" fill="#3b5296" />
        </pattern>
        <pattern id="moqPri" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#5a2334" />
          <path d="M7 1.5 L12.5 7 L7 12.5 L1.5 7 Z" fill="none" stroke="#72304a" strokeWidth="1.2" />
          <circle cx="7" cy="7" r="1.3" fill="#e2b866" opacity="0.6" />
        </pattern>
        <linearGradient id="seatShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.06" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="roll" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="dimple" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0.38" />
          <stop offset="0.56" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <filter id="grainF" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.08 0" />
        </filter>
        <mask id="panelMask"><path d={frame} fill="#fff" fillRule="evenodd" /></mask>
        <linearGradient id="sill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfaf7" />
          <stop offset="0.35" stopColor="#d9d6ce" />
          <stop offset="1" stopColor="#a19d94" />
        </linearGradient>
        <clipPath id="winClip"><path d={wins.map(([a, b]) => rr(a, b)).join(' ')} /></clipPath>
      </defs>

      {/* стекло: блики, отражение ламп, тень от рамы */}
      <g clipPath="url(#winClip)">
        {wins.map(([a, b], i) => (
          <g key={i}>
            <rect x={a} y={top} width={b - a} height={bottom - top} fill="url(#glassTop)" />
            <rect x={a} y={top} width={b - a} height={bottom - top} fill="url(#glass)" />
            <rect x={a + 30} y={top + blindH + 22} width={b - a - 60} height="3" rx="1.5" fill="#fff" opacity="0.07" filter="url(#soft)" />
            {/* рулонная шторка, чуть опущена */}
            <rect x={a} y={top + blindH} width={b - a} height="26" fill="url(#blindShadow)" />
            <rect x={a} y={top - 2} width={b - a} height={blindH + 2} fill="url(#pleat)" />
            <rect x={a} y={top + blindH - 1} width={b - a} height="7" fill="url(#alu)" />
            <rect x={a} y={top + blindH + 5} width={b - a} height="1" fill="#000" opacity="0.35" />
            {[0.3, 0.7].map((f) => (
              <rect key={f} x={a + (b - a) * f - 14} y={top + blindH + 4} width="28" height="7" rx="3.5" fill="#8a8f92" />
            ))}
          </g>
        ))}
        <path d={frame} fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="26" filter="url(#inner)" />
      </g>

      {/* панели салона */}
      <path d={frame} fill="url(#panel)" fillRule="evenodd" />
      {/* потолок с карнизом подсветки */}
      <rect x="0" y="0" width={w} height={cove} fill="url(#ceil)" />
      <rect x="0" y={cove} width={w} height="10" fill="#000" opacity="0.1" filter="url(#soft)" />
      <rect x="0" y={cove - 1} width={w} height="2" fill="#fff" opacity="0.9" />
      <rect x="0" y="0" width={w} height={top * 1.1} fill="url(#lamp)" />
      <rect x="0" y="0" width={w * 0.05} height={h} fill="url(#sideL)" />
      <rect x={w * 0.95} y="0" width={w * 0.05} height={h} fill="url(#sideR)" />
      {/* фактура пластика */}
      <rect x="0" y="0" width={w} height={h} filter="url(#grainF)" mask="url(#panelMask)" />

      {/* багажная полка: кронштейны, прутья, передняя труба */}
      <g>
        <rect x="0" y={rackBot + 4} width={w} height="8" fill="#000" opacity="0.18" filter="url(#shadow)" />
        <rect x="0" y={rackTop} width={w} height="3" fill="#8f9498" />
        {Array.from({ length: Math.ceil(w / 16) }, (_, i) => (
          <rect key={i} x={i * 16} y={rackTop + 2} width="2" height={rackBot - rackTop - 2} fill="#8f9498" opacity="0.4" />
        ))}
        {brackets.map((x, i) => (
          <path key={i} d={`M${x - 3} ${rackTop - 6} L${x + 3} ${rackTop - 6} L${x + 3} ${rackBot} L${x - 3} ${rackBot} Z`} fill="url(#steelH)" />
        ))}
        <rect x="0" y={rackBot - 3} width={w} height="6" rx="3" fill="url(#steelV)" />
      </g>

      {/* рама окна: алюминиевый обод + резиновый уплотнитель */}
      {wins.map(([a, b], i) => (
        <g key={i}>
          <path d={rr(a, b, 10)} fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="6" filter="url(#soft)" transform="translate(0 3)" />
          <path d={rr(a, b, 9)} fill="none" stroke="url(#alu)" strokeWidth="10" />
          <path d={rr(a, b, 13.5)} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" />
          <path d={rr(a, b, 3.5)} fill="none" stroke="#1f2226" strokeWidth="6" />
          <path d={rr(a, b, 6.5)} fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1" />
        </g>
      ))}
      {/* подоконник-полка и цветная полоса линии */}
      {wins.map(([a, b], i) => (
        <g key={`s${i}`}>
          <rect x={a - 14} y={bottom + 16} width={b - a + 28} height="12" rx="3" fill="#000" opacity="0.22" filter="url(#soft)" />
          <rect x={a - 14} y={bottom + 12} width={b - a + 28} height="12" rx="4" fill="url(#sill)" />
        </g>
      ))}
      <rect x="0" y={seatY - h * 0.016} width={w} height="3" fill="#b8322a" />
      <rect x="0" y={seatY - h * 0.016 + 3} width={w} height="1" fill="#fff" opacity="0.4" />

      {/* потолочный светильник-рассеиватель */}
      <rect x={w * 0.06} y="0" width={w * 0.88} height={Math.max(8, h * 0.011)} rx="4" fill="#fffef7" />
      <rect x={w * 0.06} y={Math.max(8, h * 0.011)} width={w * 0.88} height="6" fill="#fff4d6" opacity="0.5" filter="url(#soft)" />
      {/* поручень для петель на кронштейнах */}
      {brackets.slice(1, -1).map((x, i) => (
        <rect key={i} x={x - 2.5} y={cove} width="5" height={railY - cove} fill="url(#steelH)" />
      ))}
      <rect x="0" y={railY + 6} width={w} height="4" fill="#000" opacity="0.15" filter="url(#soft)" />
      <rect x="0" y={railY - 4} width={w} height="8" rx="4" fill="url(#steelV)" />

      {/* спинка дивана: обивка, валик, ложбинки мест */}
      <rect x="0" y={seatY} width={w} height={h} fill="url(#moquette)" />
      {!L.mobile && <rect x={wins[1][0] - 6} y={seatY} width={w} height={h} fill="url(#moqPri)" />}
      {L.mobile && <rect x={w * 0.72} y={seatY} width={w} height={h} fill="url(#moqPri)" />}
      {dimples.map((x, i) => (
        <rect key={i} x={x - 14} y={seatY + 10} width="28" height={h - seatY} fill="url(#dimple)" />
      ))}
      <rect x="0" y={seatY} width={w} height={h} fill="url(#seatShade)" />
      <rect x="0" y={seatY - 5} width={w} height="16" rx="8" fill="url(#roll)" />
      <rect x="0" y={seatY - 6} width={w} height="1.5" fill="#000" opacity="0.4" />

      {/* простенок: стойка-поручень и перегородка у дивана */}
      {pillar && (
        <g>
          <rect x={pillar - 30} y={seatY - 34} width="60" height={h} rx="14" fill="url(#steelH)" />
          <rect x={pillar - 26} y={seatY - 30} width="52" height={h} rx="11" fill="#000" opacity="0.08" />
          <rect x={pillar - 14} y={seatY - 50} width="36" height={h} fill="#000" opacity="0.22" filter="url(#shadow)" />
          <rect x={pillar - 7} y={railY - 4} width="14" height={h} rx="7" fill="url(#steelH)" />
          <rect x={pillar - 11} y={railY - 6} width="22" height="12" rx="3" fill="url(#steelV)" />
          <rect x={pillar - 10} y={bottom - 40} width="20" height="10" rx="3" fill="url(#steelV)" opacity="0.9" />
        </g>
      )}
      {!L.mobile && (
        <g transform={`translate(${wins[1][0] + 34} ${top + blindH + 40})`}>
          <circle r="13" fill="#fff" opacity="0.85" />
          <circle r="11" fill="#b8322a" />
          <text y="4" textAnchor="middle" fontSize="11" fill="#fff" fontFamily="Zen Kaku Gothic New, sans-serif">優</text>
        </g>
      )}
    </svg>
  )
})

// Петли: отдельные слои с GPU-трансформами, раскачиваются от ускорения поезда
function Straps({ w, h }) {
  const L = layout(w, h)
  const refs = useRef([])
  useEffect(() => {
    const st = Array.from({ length: L.strapCount }, (_, i) => ({ a: 0, v: 0, ph: i * 0.9, k: 30 + (i % 3) * 4 }))
    const loop = (dt, now) => {
      const speed = Math.min(Math.abs(store.train.v) / 40, 1)
      st.forEach((s, i) => {
        // маятник: угол в градусах, сила = инерция при разгоне/торможении + лёгкая тряска на ходу
        const force = -store.train.a * 0.9 + Math.sin(now / 1000 * 5.3 + s.ph) * 5 * speed
        const sub = 3, hstep = dt / sub
        for (let n = 0; n < sub; n++) {
          s.v += (force - s.a * s.k - s.v * 3.2) * hstep
          s.a += s.v * hstep
        }
        const el = refs.current[i]
        if (el) el.style.transform = `rotate(${Math.max(-24, Math.min(24, s.a)).toFixed(2)}deg)`
      })
    }
    store.loops.add(loop)
    return () => store.loops.delete(loop)
  }, [L.strapCount])

  const len = L.strapLen
  return (
    <div className="straps" aria-hidden="true">
      {Array.from({ length: L.strapCount }, (_, i) => {
        const x = (w / (L.strapCount + 1)) * (i + 1)
        const pri = L.mobile ? i === L.strapCount - 1 : x > L.wins[1][0]
        const tri = i % 2 === 1
        const l = len * (i % 3 === 1 ? 1.12 : 1)
        const band = pri ? ['#d9a318', '#ffd24a', '#c9920f'] : ['#cfccc1', '#f4f2eb', '#c7c3b7']
        const ring = pri ? '#ffd65c' : '#f6f4ee'
        return (
          <div key={i} className="strap" style={{ left: x, top: L.railY }}>
            <div className="strap-swing" ref={(el) => (refs.current[i] = el)}>
              <svg width="44" height={l + 46} viewBox={`-22 0 44 ${l + 46}`}>
                <defs>
                  <linearGradient id={`band${i}`} x1="0" x2="1">
                    <stop offset="0" stopColor={band[0]} /><stop offset="0.5" stopColor={band[1]} /><stop offset="1" stopColor={band[2]} />
                  </linearGradient>
                </defs>
                <rect x="-7" y="-3" width="14" height="10" rx="3" fill="#9aa0a5" />
                <rect x="-7" y="-3" width="14" height="3" rx="1.5" fill="#e9ecee" />
                <rect x="-5" y="6" width="10" height={l - 6} rx="3" fill={`url(#band${i})`} />
                <rect x="-1" y="10" width="2" height={l - 14} fill="#000" opacity="0.08" />
                <path d={`M-9 ${l} L9 ${l} L6 ${l + 10} L-6 ${l + 10} Z`} fill={pri ? '#e6b62a' : '#eeece4'} />
                {tri ? (
                  <>
                    <path d={`M0 ${l + 9} L15 ${l + 35} Q16 ${l + 38} 12 ${l + 38} L-12 ${l + 38} Q-16 ${l + 38} -15 ${l + 35} Z`} fill="none" stroke={ring} strokeWidth="6" strokeLinejoin="round" />
                    <path d={`M-12 ${l + 39.5} L12 ${l + 39.5}`} stroke="#000" strokeOpacity="0.25" strokeWidth="1" />
                  </>
                ) : (
                  <>
                    <ellipse cx="0" cy={l + 22} rx="14" ry="12.5" fill="none" stroke={ring} strokeWidth="6" />
                    <ellipse cx="0" cy={l + 22} rx="14" ry="12.5" fill="none" stroke="#000" strokeOpacity="0.22" strokeWidth="1" transform="translate(0.6 1.5)" />
                    <ellipse cx="0" cy={l + 22} rx="14" ry="12.5" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="1" transform="translate(-0.6 -1.6)" />
                  </>
                )}
              </svg>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Свет фонарей и платформ скользит по стенкам салона; цвет — от района за окном
function Sweep({ w, h }) {
  const { frame } = paths(w, h)
  const mask = `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><path fill='white' fill-rule='evenodd' d='${frame}'/></svg>`)}")`
  const root = useRef(), band = useRef()
  const period = Math.round(h * 1.1)
  useEffect(() => {
    let lastKey = ''
    const loop = () => {
      const x = store.train.x
      const off = -(((x * h * 0.028) % period) + period) % period
      band.current.style.transform = `translate3d(${off.toFixed(1)}px,0,0)`
      const t = tintAt(x), near = nearStation(x)
      const mixW = (c) => Math.round(255 * (c * (1 - near * 0.6) + near * 0.6))
      const key = `${mixW(t[0])},${mixW(t[1])},${mixW(t[2])},${(0.2 + near * 0.16).toFixed(2)}`
      if (key !== lastKey) { root.current.style.setProperty('--sw', `rgba(${key})`); lastKey = key }
    }
    store.loops.add(loop)
    return () => store.loops.delete(loop)
  }, [h, period])
  return (
    <div className="sweep" ref={root} aria-hidden="true" style={{ WebkitMaskImage: mask, maskImage: mask, '--period': `${period}px` }}>
      <div className="sweep-band" ref={band} />
    </div>
  )
}

export default function Interior() {
  const { w, h } = useViewport()
  return (
    <>
      <Frame w={w} h={h} />
      <Sweep w={w} h={h} />
      <Straps w={w} h={h} />
    </>
  )
}
