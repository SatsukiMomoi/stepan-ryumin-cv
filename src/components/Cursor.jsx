import { useEffect, useRef, useState } from 'react'
import { store } from '../store'

// Курсор: точка + кольцо с инерцией, подпись из data-cursor, магнитные кнопки
export default function Cursor() {
  const dot = useRef(), ring = useRef()
  const [label, setLabel] = useState('')
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (store.touch) return
    document.documentElement.classList.add('has-cursor')
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf
    const move = (e) => { mx = e.clientX; my = e.clientY }
    const tick = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16
      dot.current.style.transform = `translate3d(${mx}px,${my}px,0)`
      ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`
      raf = requestAnimationFrame(tick)
    }
    const over = (e) => {
      const el = e.target.closest('a, button, [data-cursor]')
      setHover(!!el)
      const c = e.target.closest('[data-cursor]')
      setLabel(c && c.dataset.cursor !== 'mail' ? c.dataset.cursor : '')
    }
    // Магнит: элемент тянется к курсору
    const mag = (e) => {
      document.querySelectorAll('.magnetic').forEach((el) => {
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2
        const dx = e.clientX - cx, dy = e.clientY - cy
        const near = Math.abs(dx) < r.width / 2 + 40 && Math.abs(dy) < r.height / 2 + 40
        el.style.transform = near ? `translate(${dx * 0.18}px, ${dy * 0.25}px)` : ''
      })
    }
    addEventListener('pointermove', move)
    addEventListener('pointermove', mag)
    addEventListener('pointerover', over)
    tick()
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', move); removeEventListener('pointermove', mag); removeEventListener('pointerover', over)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  if (store.touch) return null
  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <div className={`cursor-ring ${hover ? 'is-hover' : ''} ${label ? 'has-label' : ''}`} ref={ring} aria-hidden="true">
        <span>{label}</span>
      </div>
    </>
  )
}
