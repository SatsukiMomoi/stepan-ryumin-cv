import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { stationX } from '../store'
import { rng } from './City'
import { wetFloorMaterial } from './Atmosphere'

const LINE = '#b8322a'
const JP = '"Zen Kaku Gothic New", "Hiragino Sans", sans-serif'
const SERIF = '"Cormorant Garamond", "Shippori Mincho", serif'
const MINCHO = '"Shippori Mincho", "Zen Kaku Gothic New", serif'
const SANS = '"Manrope", sans-serif'

function canvasTex(w, h, draw, { repeat, srgb = true } = {}) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 16
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat) }
  return t
}

/* ───────────── Общие текстуры и материалы (одни на все станции) ───────────── */
let shared
function getShared() {
  if (shared) return shared
  const r = rng(77)
  // плитка платформы: 2×2 м, плиты 50 см, тёмный гранит
  const floor = canvasTex(512, 512, (g) => {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const v = 22 + r() * 7
      g.fillStyle = `rgb(${v},${v + 1},${v + 5})`
      g.fillRect(x * 128, y * 128, 128, 128)
      for (let k = 0; k < 90; k++) {
        const s = 14 + r() * 26
        g.fillStyle = `rgba(${s},${s},${s + 6},0.5)`
        g.fillRect(x * 128 + r() * 128, y * 128 + r() * 128, 2, 2)
      }
    }
    g.fillStyle = '#0a0b0e'
    for (let i = 0; i <= 4; i++) { g.fillRect(i * 128 - 2, 0, 4, 512); g.fillRect(0, i * 128 - 2, 512, 4) }
  }, { repeat: [31, 3.075] })
  // тактильная плитка: точки + продольная линия у внутреннего края
  const tactile = canvasTex(256, 128, (g) => {
    g.fillStyle = '#c9a227'; g.fillRect(0, 0, 256, 128)
    for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) {
      g.fillStyle = '#8a6c12'; g.beginPath(); g.arc(16 + x * 32 + 1.5, 16 + y * 22 + 2, 7, 0, 7); g.fill()
      g.fillStyle = '#f0cd4f'; g.beginPath(); g.arc(16 + x * 32, 16 + y * 22, 7, 0, 7); g.fill()
    }
    g.fillStyle = '#e8c23c'; g.fillRect(0, 104, 256, 10); g.fillStyle = '#8a6c12'; g.fillRect(0, 114, 256, 3)
  }, { repeat: [62 / 1.4, 1] })
  const dark = new THREE.MeshBasicMaterial({ color: '#191b22' })
  const steel = new THREE.MeshBasicMaterial({ color: '#5d626c' })
  const lamp = new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.95, 2.7), toneMapped: false })
  const umbrella = new THREE.MeshBasicMaterial({ color: '#dfe8ee', transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide })
  const person = new THREE.MeshBasicMaterial({ color: '#0b0c10' })
  // колонна: объём «запечён» в текстуру — фронт светлее, бока в тени, верх подсвечен лампами
  const pillar = canvasTex(128, 256, (g) => {
    for (let y = 0; y < 256; y++) for (let x = 0; x < 128; x++) {
      const u = x / 128, v = 1 - y / 256
      const side = 0.35 + 0.65 * Math.max(0, Math.cos(u * Math.PI * 2)) + 0.25 * Math.pow(Math.max(0, Math.cos(u * Math.PI * 2)), 18)
      const hgt = 0.7 + 0.3 * v + 0.5 * Math.pow(v, 10)
      const k = side * hgt
      g.fillStyle = `rgb(${Math.min(255, 58 * k)},${Math.min(255, 63 * k)},${Math.min(255, 74 * k)})`
      g.fillRect(x, y, 1, 1)
    }
  })
  // мягкое пятно света на мокром полу
  const pool = canvasTex(256, 256, (g) => {
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256)
  })
  // луч светильника сквозь дождь: трапеция, гаснет к полу
  const beam = canvasTex(128, 256, (g) => {
    for (let y = 0; y < 256; y++) {
      const v = y / 256, half = 18 + v * 46
      const gr = g.createLinearGradient(64 - half, 0, 64 + half, 0)
      const a = 0.9 * Math.pow(1 - v, 1.6)
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = gr; g.fillRect(64 - half, y, half * 2, 1)
    }
  })
  // ветровой экран: блики на стекле
  const glassTex = canvasTex(512, 256, (g) => {
    g.clearRect(0, 0, 512, 256)
    for (let k = 0; k < 7; k++) {
      const x = 30 + k * 72 + (k % 2) * 20
      const gr = g.createLinearGradient(x, 0, x + 60, 0)
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${0.25 + (k % 3) * 0.12})`); gr.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = gr; g.beginPath(); g.moveTo(x, 256); g.lineTo(x + 26, 256); g.lineTo(x + 86, 0); g.lineTo(x + 60, 0); g.fill()
    }
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(0.08, 'rgba(255,255,255,0)')
    g.fillStyle = gr; g.fillRect(0, 0, 512, 256)
  }, { repeat: [10, 1] })
  // ореол вокруг светящихся табличек
  const halo = canvasTex(256, 128, (g) => {
    const gr = g.createRadialGradient(128, 64, 10, 128, 64, 128)
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.setTransform(1, 0, 0, 0.5, 0, 32); g.fillStyle = gr; g.fillRect(0, 0, 256, 256)
  })
  const add = (map, color, opacity = 1) => new THREE.MeshBasicMaterial({ map, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending })
  const pillarMat = new THREE.MeshBasicMaterial({ map: pillar })
  const poolMat = add(pool, new THREE.Color(0.6, 0.52, 0.4), 0.32)
  const beamMat = add(beam, new THREE.Color(1, 0.95, 0.85), 0.07)
  beamMat.side = THREE.DoubleSide
  const glassMat = new THREE.MeshBasicMaterial({ map: glassTex, color: '#b9cde0', transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending })
  const glassTint = new THREE.MeshBasicMaterial({ color: '#0c1420', transparent: true, opacity: 0.5, depthWrite: false })
  const haloMat = add(halo, new THREE.Color(1, 0.97, 0.9), 0.35)
  shared = { floor, tactile, dark, steel, lamp, umbrella, person, pillarMat, poolMat, beamMat, glassMat, glassTint, haloMat }
  return shared
}

/* ───────────── Станционная табличка (эки-мэйхё) ───────────── */
function signTexture(st, prev, next) {
  return canvasTex(2048, 1024, (g) => {
    g.scale(2, 2)
    g.fillStyle = '#f4f3ee'; g.fillRect(0, 0, 1024, 512)
    g.fillStyle = LINE; g.fillRect(0, 372, 1024, 70)
    g.fillStyle = '#fff'; g.strokeStyle = LINE; g.lineWidth = 10
    g.beginPath(); g.roundRect(40, 40, 128, 128, 18); g.fill(); g.stroke()
    g.fillStyle = LINE; g.font = `700 42px ${SANS}`; g.textAlign = 'center'
    g.fillText('RS', 104, 98); g.font = `700 52px ${SANS}`; g.fillText(String(st.n).padStart(2, '0'), 104, 150)
    g.fillStyle = '#16181f'
    g.font = `700 150px ${JP}`; g.fillText(st.kanji, 540, 205)
    g.font = `500 44px ${JP}`; g.fillText(st.kana, 540, 272)
    g.font = `600 40px ${SANS}`; g.fillText(st.romaji, 540, 336)
    g.fillStyle = '#fff'; g.font = `600 34px ${SANS}, ${JP}`
    g.textAlign = 'left'; if (prev) g.fillText(`◀ ${prev.romaji}`, 36, 420)
    g.textAlign = 'right'; g.fillText(next ? `${next.romaji} ▶` : '終点 Terminal', 988, 420)
    g.fillStyle = '#6b6f7a'; g.textAlign = 'left'; g.font = `500 28px ${SANS}`
    g.fillText('Ryumin Line  リュミン線', 36, 490)
  })
}

/* ───────────── Табло отправления: оранжевая точечная матрица ───────────── */
function boardTexture(st, next, i) {
  return canvasTex(1024, 192, (g) => {
    g.fillStyle = '#07080a'; g.fillRect(0, 0, 1024, 192)
    const row = (y, parts) => parts.forEach(([x, txt, col, font, align = 'left']) => {
      g.font = font; g.fillStyle = col; g.textAlign = align; g.fillText(txt, x, y)
    })
    const time = `22:${String(8 + i * 6).padStart(2, '0')}`
    row(78, [
      [28, '普通', '#ff9a2e', `700 52px ${JP}`],
      [150, 'Local', '#ff9a2e', `700 34px ${SANS}`],
      [330, time, '#ffb04a', `700 56px ${SANS}`],
      [530, next ? next.kanji : '終点', '#ffb04a', `700 56px ${JP}`],
      [700, next ? next.romaji : 'Terminal', '#ff9a2e', `600 34px ${SANS}`],
      [996, '4両', '#6fd07a', `700 46px ${JP}`, 'right'],
    ])
    row(158, [
      [28, next ? '次は' : '当駅止まり', '#7cc7ff', `600 38px ${JP}`],
      [150, next ? `Next: ${next.en}` : 'This train terminates here', '#7cc7ff', `600 30px ${SANS}`],
      [996, '1番線', '#ffb04a', `700 38px ${JP}`, 'right'],
    ])
    // сетка светодиодов поверх текста
    const dot = document.createElement('canvas'); dot.width = dot.height = 4
    const dg = dot.getContext('2d'); dg.fillStyle = '#000'; dg.fillRect(0, 0, 3, 3)
    g.globalCompositeOperation = 'destination-in'
    g.fillStyle = g.createPattern(dot, 'repeat'); g.fillRect(0, 0, 1024, 192)
    g.globalCompositeOperation = 'destination-over'
    g.fillStyle = '#07080a'; g.fillRect(0, 0, 1024, 192)
  })
}

function clockTexture(i) {
  return canvasTex(256, 256, (g) => {
    g.fillStyle = '#f7f6f1'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill()
    g.strokeStyle = '#1b1d22'; g.lineWidth = 8; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.stroke()
    g.fillStyle = '#1b1d22'
    for (let k = 0; k < 12; k++) {
      g.save(); g.translate(128, 128); g.rotate((k / 12) * Math.PI * 2)
      g.fillRect(-3, -104, 6, k % 3 ? 14 : 24); g.restore()
    }
    const m = 8 + i * 6, h = 22 + m / 60
    const hand = (a, len, wd, col) => { g.save(); g.translate(128, 128); g.rotate(a); g.fillStyle = col; g.fillRect(-wd / 2, -len, wd, len + 14); g.restore() }
    hand((h / 12) * Math.PI * 2, 60, 10, '#1b1d22')
    hand((m / 60) * Math.PI * 2, 92, 7, '#1b1d22')
    hand(((m * 7) % 60 / 60) * Math.PI * 2, 98, 3, LINE)
    g.fillStyle = LINE; g.beginPath(); g.arc(128, 128, 7, 0, 7); g.fill()
  })
}

function exitTexture() {
  return canvasTex(512, 128, (g) => {
    g.fillStyle = '#16181d'; g.fillRect(0, 0, 512, 128)
    g.fillStyle = '#f2c230'; g.fillRect(0, 0, 196, 128)
    g.fillStyle = '#16181d'; g.font = `700 64px ${JP}`; g.textAlign = 'center'; g.fillText('出口', 98, 86)
    g.fillStyle = '#f2c230'; g.textAlign = 'left'; g.font = `700 46px ${SANS}`; g.fillText('Exit', 226, 82)
    g.beginPath(); g.moveTo(420, 40); g.lineTo(470, 64); g.lineTo(420, 88); g.fill()
    g.fillRect(372, 56, 52, 16)
  })
}

// разметка посадки на полу: треугольник, номер двери, «ёлочка» очереди
function markTexture(n) {
  return canvasTex(256, 256, (g) => {
    g.clearRect(0, 0, 256, 256)
    g.fillStyle = 'rgba(232,230,222,0.85)'
    g.beginPath(); g.moveTo(128, 20); g.lineTo(200, 100); g.lineTo(56, 100); g.fill()
    g.fillStyle = '#1a1c22'; g.font = `800 58px ${SANS}`; g.textAlign = 'center'; g.fillText(String(n), 128, 90)
    g.strokeStyle = 'rgba(96,170,120,0.8)'; g.lineWidth = 8
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(40, 140 + k * 36); g.lineTo(90, 170 + k * 36); g.moveTo(216, 140 + k * 36); g.lineTo(166, 170 + k * 36); g.stroke() }
  })
}

/* ───────────── Киоск: тёплая витрина, норэн, товары ───────────── */
function kioskTexture(i) {
  return canvasTex(512, 512, (g) => {
    const r = rng(300 + i)
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#fff3d6'); gr.addColorStop(1, '#e9c98f')
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512)
    for (let row = 0; row < 4; row++) {
      const y = 170 + row * 82
      g.fillStyle = '#b59a6c'; g.fillRect(0, y + 58, 512, 8)
      for (let x = 10; x < 500;) {
        const wd = 16 + r() * 26, ht = 26 + r() * 30
        g.fillStyle = ['#e8483a', '#3f7fd0', '#f2c230', '#4d9a58', '#f4efe4', '#e07bb0', '#1b1d22'][Math.floor(r() * 7)]
        g.fillRect(x, y + 58 - ht, wd, ht)
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 2, y + 60 - ht, 3, ht - 6)
        x += wd + 4
      }
    }
    // норэн с разрезами
    g.fillStyle = LINE; g.fillRect(0, 0, 512, 132)
    g.fillStyle = '#e9c98f'; for (let k = 1; k < 4; k++) g.fillRect(k * 128 - 3, 40, 6, 92)
    g.fillStyle = '#fff4ea'; g.font = `700 70px ${JP}`; g.textAlign = 'center'; g.fillText('売店', 256, 96)
    g.font = `700 22px ${SANS}`; g.fillText('K I O S K', 256, 124)
  })
}
const ACCENT = ['#c2472f', '#d4af6a', '#2f8f83', '#e0a126', '#7b5cd6', '#3f7fd0', '#c2472f']

/* ───────────── Световые постеры: у каждой секции резюме свой ───────────── */
const POSTERS = [
  (g, W, H) => { // Отправление
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d1633'); gr.addColorStop(1, '#3b1d3f')
    g.fillStyle = gr; g.fillRect(0, 0, W, H)
    g.fillStyle = '#e8483a'; g.beginPath(); g.arc(W * 0.7, H * 0.46, 170, 0, 7); g.fill()
    g.fillStyle = 'rgba(255,255,255,0.08)'; for (let k = 0; k < 8; k++) g.fillRect(0, H * 0.62 + k * 14, W, 4)
    g.fillStyle = '#f4efe4'; g.font = `700 150px ${MINCHO}`; g.textAlign = 'left'
    g.fillText('夜', 70, 210); g.fillText('行', 70, 370)
    g.font = `600 40px ${SANS}`; g.fillText('RYUMIN LINE', 260, 520)
    g.font = `500 28px ${SANS}`; g.fillStyle = '#c9c3d6'; g.fillText('Night service  ·  Osaka Loop  ·  大阪', 260, 566)
  },
  (g, W, H) => { // Профиль
    g.fillStyle = '#f1ebdf'; g.fillRect(0, 0, W, H)
    g.fillStyle = '#1b1d22'; g.font = `600 112px ${SERIF}`; g.textAlign = 'left'
    g.fillText('Stepan', 70, 220); g.fillText('Ryumin', 70, 340)
    g.fillStyle = '#6b665c'; g.font = `500 34px ${SANS}`; g.fillText('Philologist × AI engineer', 74, 420)
    g.fillStyle = LINE; g.beginPath(); g.roundRect(W - 250, 120, 170, 170, 22); g.fill()
    g.fillStyle = '#f7efe6'; g.font = `700 64px ${MINCHO}`; g.textAlign = 'center'
    g.fillText('リュ', W - 165, 196); g.fillText('ミン', W - 165, 268)
    g.fillStyle = '#1b1d22'; g.fillRect(70, 500, W - 140, 3)
    g.font = `500 26px ${SANS}`; g.textAlign = 'left'; g.fillText('Moscow  ·  Osaka  ·  2026', 74, 560)
  },
  (g, W, H) => { // Опыт
    g.fillStyle = '#121418'; g.fillRect(0, 0, W, H)
    g.fillStyle = '#d4af6a'; g.font = `700 44px ${JP}`; g.textAlign = 'left'; g.fillText('経歴', 70, 110)
    g.fillStyle = '#f2efe8'; g.font = `600 88px ${SERIF}`; g.fillText('Paycrown', 70, 250)
    g.fillStyle = '#9b958a'; g.font = `500 30px ${SANS}`; g.fillText('AI services & automation  ·  2024 — 2026', 74, 300)
    g.fillStyle = '#f2efe8'; g.font = `600 70px ${SERIF}`; g.fillText('Мармеладыч', 70, 440)
    g.fillStyle = '#9b958a'; g.font = `500 30px ${SANS}`; g.fillText('Scriptwriter  ·  since 09.2026', 74, 488)
    g.fillStyle = '#d4af6a'; g.fillRect(70, 540, W - 140, 4)
  },
  (g, W, H) => { // Кейсы
    g.fillStyle = '#0f3b4a'; g.fillRect(0, 0, W, H)
    g.fillStyle = '#ffd36b'; g.font = `800 330px ${SANS}`; g.textAlign = 'left'; g.fillText('6', 60, 350)
    g.fillStyle = '#e9f3f2'; g.font = `700 64px ${SANS}`; g.fillText('cases', 290, 200)
    g.font = `500 30px ${SANS}`; g.fillStyle = '#a9cfd0'
    ;['LLM assistant  ·  incidents', 'alerts  ·  BI without BI', 'support QA  ·  internal tools'].forEach((s, k) => g.fillText(s, 294, 270 + k * 46))
    g.fillStyle = '#ffd36b'; g.font = `700 40px ${JP}`; g.fillText('事例', 70, 560)
  },
  (g, W, H) => { // AI и стек: терминал
    g.fillStyle = '#0a0c0f'; g.fillRect(0, 0, W, H)
    g.fillStyle = '#1d222a'; g.fillRect(0, 0, W, 54)
    ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, k) => { g.fillStyle = c; g.beginPath(); g.arc(40 + k * 34, 27, 10, 0, 7); g.fill() })
    const mono = '"SFMono-Regular", Consolas, monospace'
    const lines = [['> ', 'claude --rag --tools', '#ff9a4a'], ['> ', 'python · sql · pandas', '#7cd992'], ['> ', 'prompts · evals · agents', '#7cc7ff'], ['> ', 'ship it_', '#f2efe8']]
    lines.forEach(([p, s, c], k) => { g.font = `600 44px ${mono}`; g.fillStyle = '#5a6270'; g.fillText(p, 60, 150 + k * 90); g.fillStyle = c; g.fillText(s, 110, 150 + k * 90) })
    g.fillStyle = '#ff9a4a'; g.font = `700 36px ${JP}`; g.textAlign = 'right'; g.fillText('技術', W - 50, H - 40)
  },
  (g, W, H) => { // Учёба
    g.fillStyle = '#e9e4d8'; g.fillRect(0, 0, W, H)
    g.fillStyle = '#23305c'; g.fillRect(0, 0, 26, H)
    g.fillStyle = '#23305c'; g.font = `700 50px ${JP}`; g.textAlign = 'left'; g.fillText('学歴', 80, 110)
    const rows = [['HSE Moscow', 'Classics · Latin · Ancient Greek'], ['ISI Osaka', '日本語 · JLPT N4'], ['IELTS 7.0', 'English · C1']]
    rows.forEach(([a, b], k) => {
      g.fillStyle = '#1b1d22'; g.font = `600 58px ${SERIF}`; g.fillText(a, 80, 220 + k * 130)
      g.fillStyle = '#6b665c'; g.font = `500 28px ${SANS}`; g.fillText(b, 82, 258 + k * 130)
    })
  },
  (g, W, H) => { // Связь
    g.fillStyle = LINE; g.fillRect(0, 0, W, H)
    g.fillStyle = '#fff4ea'; g.font = `700 50px ${JP}`; g.textAlign = 'left'; g.fillText('連絡', 70, 110)
    g.font = `800 104px ${SANS}`; g.fillText('@apetilt', 70, 300)
    g.font = `500 32px ${SANS}`; g.fillStyle = '#ffd9cf'; g.fillText('Telegram  ·  write any time', 74, 360)
    const r = rng(9); g.fillStyle = '#fff4ea'
    const x0 = W - 290, y0 = 380
    for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) {
      const eye = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7)
      if (eye ? !(x % 10 === 1 && y % 10 === 1) : r() > 0.5) g.fillRect(x0 + x * 20, y0 + y * 20 - 180, 18, 18)
    }
  },
]
const posterTexture = (i) => canvasTex(1024, 640, POSTERS[i % POSTERS.length])

/* ───────────── Пассажиры: тёмные силуэты, у некоторых прозрачный зонт ───────────── */
function People({ seed }) {
  const { person, umbrella } = getShared()
  const people = useMemo(() => {
    const r = rng(seed)
    const n = 2 + Math.floor(r() * 3)
    const list = []
    for (let k = 0; k < n; k++) {
      let x = -7 + r() * 13
      if (Math.abs(x - 3.4) < 1.4) x += 2.6
      list.push({ x, z: -4.2 - r() * 2.6, s: 0.92 + r() * 0.14, umb: r() > 0.45, bag: r() > 0.5, turn: r() > 0.5 })
    }
    return list
  }, [seed])
  return people.map((p, k) => (
    <group key={k} position={[p.x, 0, p.z]} scale={p.s}>
      <mesh position={[0, 1.02, 0]} material={person}><cylinderGeometry args={[0.2, 0.24, 0.9, 10]} /></mesh>
      <mesh position={[0, 0.3, 0]} material={person}><boxGeometry args={[0.3, 0.6, 0.18]} /></mesh>
      <mesh position={[0, 1.62, 0]} material={person}><sphereGeometry args={[0.12, 12, 10]} /></mesh>
      <mesh position={[0, 1.47, 0]} material={person}><cylinderGeometry args={[0.06, 0.07, 0.1, 8]} /></mesh>
      {p.bag && <mesh position={[p.turn ? 0.28 : -0.28, 0.82, 0]} material={person}><boxGeometry args={[0.1, 0.34, 0.26]} /></mesh>}
      {p.umb && (
        <group position={[p.turn ? -0.12 : 0.12, 0, 0]}>
          <mesh position={[0, 1.55, 0]} material={person}><cylinderGeometry args={[0.012, 0.012, 0.9, 5]} /></mesh>
          <mesh position={[0, 2.05, 0]} material={umbrella}><coneGeometry args={[0.55, 0.22, 16, 1, true]} /></mesh>
        </group>
      )}
    </group>
  ))
}

/* ───────────── Станция ───────────── */
export default function Station({ i, stations, fontsReady }) {
  const x = stationX(i)
  const st = stations[i]
  const S = getShared()
  const tex = useMemo(() => ({
    sign: signTexture(st, stations[i - 1], stations[i + 1]),
    board: boardTexture(st, stations[i + 1], i),
    clock: clockTexture(i),
    exit: exitTexture(),
    poster: posterTexture(i),
    marks: [markTexture(3), markTexture(4)],
    kiosk: kioskTexture(i),
  }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [st.kanji, st.romaji, fontsReady])
  useEffect(() => () => { Object.values(tex).flat().forEach((t) => t.dispose()) }, [tex])

  const signMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex.sign, color: new THREE.Color(0.92, 0.92, 0.92), toneMapped: false }), [tex])
  const beams = []; for (let b = -30; b <= 30; b += 4) beams.push(b)
  const pillars = [-20, -12, -4, 4, 12, 20, 28]
  const acc = ACCENT[i % ACCENT.length]
  // отдельные светильники вместо сплошной полосы; под каждым пятно на полу
  const lamps = useMemo(() => {
    const a = []
    for (let b = -28; b <= 28; b += 4) for (const z of [-3.3, -5.9]) a.push([b, z])
    return a
  }, [])

  return (
    <group position={[x, 0, 0]}>
      {/* платформа: гранитная плитка, край, тактильная полоса */}
      <mesh position={[0, -0.5, -5.2]} material={S.dark}><boxGeometry args={[62, 1, 6.2]} /></mesh>
      <mesh position={[0, 0.004, -5.225]} rotation-x={-Math.PI / 2}><planeGeometry args={[62, 6.15]} /><meshBasicMaterial map={S.floor} color="#d8dbe2" /></mesh>
      <mesh position={[0, 0.01, -2.18]} rotation-x={-Math.PI / 2}><planeGeometry args={[62, 0.16]} /><meshBasicMaterial color="#8d9098" /></mesh>
      <mesh position={[0, 0.012, -2.58]} rotation-x={-Math.PI / 2}><planeGeometry args={[62, 0.4]} /><meshBasicMaterial map={S.tactile} /></mesh>
      <mesh position={[0, 0.014, -2.32]} rotation-x={-Math.PI / 2}><planeGeometry args={[62, 0.06]} /><meshBasicMaterial color="#e8e6de" /></mesh>
      {[-7.5, -1.5, 4.5, 10.5].map((mx, k) => (
        <mesh key={mx} position={[mx, 0.013, -3.25]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.9, 0.9]} /><meshBasicMaterial map={tex.marks[k % 2]} transparent depthWrite={false} /></mesh>
      ))}
      <mesh position={[0, -0.5, -2.09]}><planeGeometry args={[62, 1]} /><meshBasicMaterial color="#23262d" /></mesh>

      {/* отражения ламп в лужах */}
      <mesh position={[0, 0.02, -4.8]} rotation-x={-Math.PI / 2} material={wetFloorMaterial}><planeGeometry args={[60, 4.6]} /></mesh>

      {/* навес: кровля, поперечные балки, корпуса светильников */}
      <mesh position={[0, 3.98, -4.6]}><boxGeometry args={[62, 0.14, 4.8]} /><meshBasicMaterial color="#1a1d25" /></mesh>
      {beams.map((b) => (
        <mesh key={b} position={[b, 3.8, -4.6]} material={S.dark}><boxGeometry args={[0.1, 0.28, 4.8]} /></mesh>
      ))}
      <mesh position={[0, 3.66, -2.3]} material={S.dark}><boxGeometry args={[62, 0.5, 0.1]} /></mesh>
      <mesh position={[0, 3.42, -2.25]}><boxGeometry args={[62, 0.03, 0.12]} /><meshBasicMaterial color="#565b66" /></mesh>
      {lamps.map(([lx, lz], k) => (
        <group key={k} position={[lx, 0, lz]}>
          <mesh position={[0, 3.72, 0]} material={S.steel}><boxGeometry args={[1.5, 0.1, 0.34]} /></mesh>
          <mesh position={[0, 3.665, 0]} rotation-x={Math.PI / 2} material={S.lamp}><planeGeometry args={[1.4, 0.2]} /></mesh>
          <mesh position={[0, 0.03, 0.1]} rotation-x={-Math.PI / 2} material={S.poolMat}><planeGeometry args={[3.6, 2.4]} /></mesh>
          {lz > -4 && <mesh position={[0, 1.83, 0.2]} material={S.beamMat}><planeGeometry args={[2.6, 3.66]} /></mesh>}
        </group>
      ))}
      {pillars.map((p) => (
        <group key={p} position={[p, 0, -6.6]}>
          <mesh position={[0, 1.9, 0]} material={S.pillarMat}><cylinderGeometry args={[0.17, 0.17, 3.8, 24]} /></mesh>
          <mesh position={[0, 0.06, 0]} material={S.dark}><cylinderGeometry args={[0.24, 0.26, 0.12, 24]} /></mesh>
          <mesh position={[0, 3.6, 0]} material={S.dark}><cylinderGeometry args={[0.3, 0.17, 0.25, 24]} /></mesh>
          <mesh position={[0, 1.55, 0]}><cylinderGeometry args={[0.175, 0.175, 0.3, 24]} /><meshBasicMaterial color={acc} /></mesh>
        </group>
      ))}

      {/* ветровой экран: низкая стенка, стойки, стекло с бликами */}
      <mesh position={[0, 0.3, -8.2]} material={S.dark}><boxGeometry args={[62, 0.6, 0.14]} /></mesh>
      <mesh position={[0, 0.61, -8.13]}><boxGeometry args={[62, 0.04, 0.03]} /><meshBasicMaterial color={acc} /></mesh>
      <mesh position={[0, 1.45, -8.22]} material={S.glassTint}><planeGeometry args={[62, 1.7]} /></mesh>
      <mesh position={[0, 1.45, -8.18]} material={S.glassMat}><planeGeometry args={[62, 1.7]} /></mesh>
      <mesh position={[0, 2.32, -8.2]}><boxGeometry args={[62, 0.06, 0.12]} /><meshBasicMaterial color="#7c828c" /></mesh>
      {beams.map((b) => (
        <mesh key={b} position={[b, 1.45, -8.16]}><boxGeometry args={[0.05, 1.75, 0.06]} /><meshBasicMaterial color="#565b66" /></mesh>
      ))}

      {/* киоск */}
      <group position={[14.2, 0, -7.1]}>
        <mesh position={[0, 1.2, 0]}><boxGeometry args={[2.6, 2.4, 1.3]} /><meshBasicMaterial color="#2a2d35" /></mesh>
        <mesh position={[0, 1.35, 0.66]}><planeGeometry args={[2.4, 1.7]} /><meshBasicMaterial map={tex.kiosk} color={[1.25, 1.2, 1.1]} toneMapped={false} /></mesh>
        <mesh position={[0, 0.45, 0.72]}><boxGeometry args={[2.5, 0.08, 0.3]} /><meshBasicMaterial color="#8a8f98" /></mesh>
        <mesh position={[0, 2.47, 0.1]}><boxGeometry args={[2.9, 0.12, 1.6]} /><meshBasicMaterial color={acc} /></mesh>
        <mesh position={[0, 0.03, 1.4]} rotation-x={-Math.PI / 2} material={S.poolMat}><planeGeometry args={[4, 2.4]} /></mesh>
      </group>

      {/* табло отправления, часы, указатель выхода — подвешены к навесу */}
      <group position={[-2.3, 2.66, -3.9]}>
        {[-1.3, 1.3].map((dx) => <mesh key={dx} position={[dx, 0.7, 0]} material={S.steel}><boxGeometry args={[0.04, 0.7, 0.04]} /></mesh>)}
        <mesh position={[0, 0, -0.2]} material={S.haloMat} scale={[1.6, 1.6, 1]}><planeGeometry args={[3.3, 0.9]} /></mesh>
        <mesh position={[0, 0, -0.06]} material={S.dark}><boxGeometry args={[3.3, 0.72, 0.14]} /></mesh>
        <mesh position={[0, 0, 0.04]}><planeGeometry args={[3.1, 0.58]} /><meshBasicMaterial map={tex.board} color={[1.6, 1.6, 1.6]} toneMapped={false} /></mesh>
      </group>
      <group position={[1.2, 3.12, -4.2]}>
        <mesh position={[0, 0.45, 0]} material={S.steel}><boxGeometry args={[0.03, 0.55, 0.03]} /></mesh>
        <mesh position={[0, 0, -0.03]} rotation-x={Math.PI / 2} material={S.dark}><cylinderGeometry args={[0.3, 0.3, 0.05, 32]} /></mesh>
        <mesh><circleGeometry args={[0.28, 40]} /><meshBasicMaterial map={tex.clock} color={[1.05, 1.05, 1.05]} toneMapped={false} /></mesh>
      </group>
      <group position={[7.2, 3.22, -4.3]}>
        {[-0.8, 0.8].map((dx) => <mesh key={dx} position={[dx, 0.38, 0]} material={S.steel}><boxGeometry args={[0.03, 0.5, 0.03]} /></mesh>)}
        <mesh position={[0, 0, -0.04]} material={S.dark}><boxGeometry args={[1.9, 0.5, 0.08]} /></mesh>
        <mesh><planeGeometry args={[1.8, 0.45]} /><meshBasicMaterial map={tex.exit} color={[1.3, 1.3, 1.3]} toneMapped={false} /></mesh>
      </group>

      {/* световой постер на ограждении */}
      <group position={[-4.6, 1.95, -7.95]}>
        {[-1.2, 1.2].map((dx) => <mesh key={dx} position={[dx, -1.0, 0]} material={S.steel}><boxGeometry args={[0.07, 1.0, 0.07]} /></mesh>)}
        <mesh position={[0, 0, -0.06]}><boxGeometry args={[3.0, 1.95, 0.12]} /><meshBasicMaterial color="#b9bdc4" /></mesh>
        <mesh><planeGeometry args={[2.8, 1.75]} /><meshBasicMaterial map={tex.poster} color={[1.25, 1.25, 1.25]} toneMapped={false} /></mesh>
      </group>

      {/* скамейка: ряд пластиковых сидений */}
      <group position={[0.4, 0, -7.4]}>
        <mesh position={[0, 0.22, 0]} material={S.steel}><boxGeometry args={[2.5, 0.05, 0.1]} /></mesh>
        {[-1.1, 1.1].map((dx) => <mesh key={dx} position={[dx, 0.12, 0]} material={S.steel}><boxGeometry args={[0.06, 0.24, 0.3]} /></mesh>)}
        {[-0.9, -0.3, 0.3, 0.9].map((dx) => (
          <group key={dx} position={[dx, 0, 0]}>
            <mesh position={[0, 0.44, 0.02]}><boxGeometry args={[0.5, 0.06, 0.42]} /><meshBasicMaterial color={acc} /></mesh>
            <mesh position={[0, 0.72, -0.2]} rotation-x={-0.12}><boxGeometry args={[0.5, 0.5, 0.05]} /><meshBasicMaterial color={acc} /></mesh>
          </group>
        ))}
      </group>

      {/* торговые автоматы и урны для раздельного сбора */}
      {[-11, -9.9, 20].map((p, k) => (
        <group key={p} position={[p, 0.95, -7.6]}>
          <mesh><boxGeometry args={[1, 1.9, 0.7]} /><meshBasicMaterial color={k === 2 ? LINE : '#e8e8e8'} /></mesh>
          <mesh position={[0, 0.25, 0.36]}><planeGeometry args={[0.82, 1.0]} /><meshBasicMaterial color={[1.5, 1.75, 1.9]} toneMapped={false} /></mesh>
          {[0, 1, 2].map((row) => (
            <mesh key={row} position={[0, 0.55 - row * 0.3, 0.37]}><planeGeometry args={[0.72, 0.06]} /><meshBasicMaterial color={['#ff6b5c', '#4f9dff', '#ffd36b'][row]} toneMapped={false} /></mesh>
          ))}
          <mesh position={[0, -0.62, 0.36]}><planeGeometry args={[0.7, 0.18]} /><meshBasicMaterial color="#20232a" /></mesh>
        </group>
      ))}
      {['#3f7fd0', '#e0a126', '#4d9a58'].map((c, k) => (
        <group key={c} position={[-8.7 + k * 0.5, 0, -7.7]}>
          <mesh position={[0, 0.42, 0]}><boxGeometry args={[0.44, 0.84, 0.44]} /><meshBasicMaterial color="#9ea3ab" /></mesh>
          <mesh position={[0, 0.86, 0]}><boxGeometry args={[0.46, 0.05, 0.46]} /><meshBasicMaterial color={c} /></mesh>
        </group>
      ))}

      {/* табличка с названием: основная и две на подходе */}
      {[3.4, -21, 23].map((sx) => (
        <group key={sx} position={[sx, 2.3, -5.4]}>
          <mesh position={[0, 0, -0.12]} material={S.haloMat} scale={[1.5, 1.6, 1]}><planeGeometry args={[2.3, 1.2]} /></mesh>
          <mesh position={[0, 0, -0.03]}><boxGeometry args={[2.3, 1.22, 0.05]} /><meshBasicMaterial color="#2a2d36" /></mesh>
          <mesh material={signMat}><planeGeometry args={[2.2, 1.1]} /></mesh>
          <mesh position={[-0.9, 1.05, -0.05]}><boxGeometry args={[0.05, 1.0, 0.05]} /><meshBasicMaterial color="#2a2d36" /></mesh>
          <mesh position={[0.9, 1.05, -0.05]}><boxGeometry args={[0.05, 1.0, 0.05]} /><meshBasicMaterial color="#2a2d36" /></mesh>
        </group>
      ))}

      <People seed={31 + i * 17} />
    </group>
  )
}
