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
  return (
    <svg className="interior" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs>
        <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d3d6cf" />
          <stop offset="0.14" stopColor="#c4c8c0" />
          <stop offset="0.5" stopColor="#adb1aa" />
          <stop offset="0.85" stopColor="#979b95" />
          <stop offset="1" stopColor="#7d817c" />
        </linearGradient>
        <radialGradient id="lamp" cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
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
        <filter id="inner" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="soft" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <pattern id="moquette" width="5" height="5" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" fill="#243566" />
          <circle cx="2.5" cy="2.5" r="0.9" fill="#2d417b" />
        </pattern>
        <linearGradient id="seatShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="0.08" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <filter id="grainF" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.09 0" />
        </filter>
        <mask id="panelMask"><path d={frame} fill="#fff" fillRule="evenodd" /></mask>
        <linearGradient id="sill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="winClip"><path d={wins.map(([a, b]) => rr(a, b)).join(' ')} /></clipPath>
      </defs>

      {/* стекло: блики, отражение ламп, тень от рамы */}
      <g clipPath="url(#winClip)">
        {wins.map(([a, b], i) => (
          <g key={i}>
            <rect x={a} y={top} width={b - a} height={bottom - top} fill="url(#glassTop)" />
            <rect x={a} y={top} width={b - a} height={bottom - top} fill="url(#glass)" />
            <rect x={a + 30} y={top + 16} width={b - a - 60} height="3" rx="1.5" fill="#fff" opacity="0.07" filter="url(#soft)" />
          </g>
        ))}
        <path d={frame} fill="none" stroke="#000" strokeOpacity="0.55" strokeWidth="26" filter="url(#inner)" />
      </g>

      {/* панели салона */}
      <path d={frame} fill="url(#panel)" fillRule="evenodd" />
      <rect x="0" y="0" width={w} height={top * 0.9} fill="url(#lamp)" />
      {/* фактура пластика и швы панелей */}
      <rect x="0" y="0" width={w} height={h} filter="url(#grainF)" mask="url(#panelMask)" />
      <rect x="0" y={top - 16} width={w} height="1" fill="#000" opacity="0.12" />
      <rect x="0" y={top - 15} width={w} height="1" fill="#fff" opacity="0.35" />
      {wins.map(([a, b], i) => (
        <rect key={`s${i}`} x={a - 6} y={bottom + 8} width={b - a + 12} height="10" rx="3" fill="url(#sill)" />
      ))}
      {/* уплотнитель */}
      {wins.map(([a, b], i) => (
        <g key={i}>
          <path d={rr(a, b, 4)} fill="none" stroke="#25282d" strokeWidth="7" />
          <path d={rr(a, b, 8)} fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="1" />
        </g>
      ))}
      {/* потолочный светильник */}
      <rect x={w * 0.08} y={h * 0.003} width={w * 0.84} height={Math.max(6, h * 0.009)} rx="3" fill="#fffef7" />
      {/* поручень */}
      <rect x="0" y={railY - 3.5} width={w} height="7" rx="3.5" fill="#e4e7e8" />
      <rect x="0" y={railY - 3.5} width={w} height="2" rx="1" fill="#fff" opacity="0.8" />
      <rect x="0" y={railY + 2.5} width={w} height="1" fill="#6f7478" opacity="0.6" />
      {/* спинка сиденья */}
      <rect x="0" y={bottom + h * 0.035} width={w} height={h} fill="url(#moquette)" />
      <rect x="0" y={bottom + h * 0.035} width={w} height={h} fill="url(#seatShade)" />
      <rect x="0" y={bottom + h * 0.035 - 3} width={w} height="5" rx="2" fill="#3a4e8a" />
      {!L.mobile && (
        <g transform={`translate(${w * 0.62} ${(top + bottom) / 2})`}>
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
      {Array.from({ length: L.strapCount }, (_, i) => (
        <div key={i} className="strap" style={{ left: (w / (L.strapCount + 1)) * (i + 1), top: L.railY }}>
          <div className="strap-swing" ref={(el) => (refs.current[i] = el)}>
            <svg width="44" height={len + 44} viewBox={`-22 0 44 ${len + 44}`}>
              <defs>
                <linearGradient id={`band${i}`} x1="0" x2="1">
                  <stop offset="0" stopColor="#cfccc1" /><stop offset="0.5" stopColor="#f2f0e9" /><stop offset="1" stopColor="#c7c3b7" />
                </linearGradient>
              </defs>
              <rect x="-5" y="0" width="10" height={len} rx="3" fill={`url(#band${i})`} />
              <path d={`M-9 ${len} L9 ${len} L6 ${len + 10} L-6 ${len + 10} Z`} fill="#eeece4" />
              <ellipse cx="0" cy={len + 22} rx="14" ry="12.5" fill="none" stroke="#f6f4ee" strokeWidth="6" />
              <ellipse cx="0" cy={len + 22} rx="14" ry="12.5" fill="none" stroke="#bdb9ad" strokeWidth="1" transform="translate(0.6 1)" opacity="0.8" />
            </svg>
          </div>
        </div>
      ))}
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
