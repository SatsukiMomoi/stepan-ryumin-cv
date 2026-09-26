import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import TrainWorld from './components/TrainWorld'
import Interior from './components/Interior'
import Cursor from './components/Cursor'
import Wagara from './components/Wagara'
import { content, contacts, stations, lcd } from './content'
import { store, stationX, STATION_GAP } from './store'

gsap.registerPlugin(ScrollTrigger)
// для отладки: ?debug открывает доступ к состоянию поезда
if (typeof location !== 'undefined' && location.search.includes("debug")) { window.__train = store.train; window.__store = store }
const LAST = stations.length - 1

function Chars({ text, className = '' }) {
  // по словам, чтобы длинные заголовки переносились
  return (
    <span className={`split ${className}`} aria-label={text}>
      {text.split(' ').map((w, wi, arr) => (
        <span className="word" key={wi} aria-hidden="true">
          {[...w].map((c, i) => <span className="ch-wrap" key={i}><span className="ch">{c}</span></span>)}
          {wi < arr.length - 1 && ' '}
        </span>
      ))}
    </span>
  )
}

function Words({ text }) {
  return (
    <p className="statement" aria-label={text}>
      {text.split(' ').map((w, i) => <span className="w" key={i} aria-hidden="true">{w} </span>)}
    </p>
  )
}

// Шапка раздела в виде мини-таблички станции
function StationHead({ i, title }) {
  const s = stations[i]
  return (
    <header className="st-head">
      <div className="st-badge" aria-hidden="true">
        <span className="st-num"><b>RS</b>{String(s.n).padStart(2, '0')}</span>
        <span className="st-kanji">{s.kanji}</span>
        <span className="st-romaji">{s.romaji}</span>
      </div>
      <h2 className="st-title"><Chars text={title} /></h2>
    </header>
  )
}

function MoscowClock({ label }) {
  const [t, setT] = useState('')
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()))
    f(); const id = setInterval(f, 1000)
    return () => clearInterval(id)
  }, [])
  return <p className="clock">{label} <time>{t}</time></p>
}

function Loader({ onDone, label }) {
  const root = useRef()
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const n = { v: 0 }
      const num = root.current.querySelector('.loader-num')
      const d = store.reduced ? 0.3 : 1.5
      gsap.timeline({ onComplete: onDone })
        .to(n, { v: 100, duration: d, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(n.v)).padStart(3, '0') } })
        .to('.loader-line', { scaleX: 1, duration: d, ease: 'power2.inOut' }, 0)
        .to('.loader-kana', { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out' }, 0.2)
        .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '+=0.15')
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <div className="loader" ref={root} role="status" aria-label={label}>
      <div className="loader-board">
        <p className="loader-row" aria-hidden="true">
          <span className="loader-type">各停</span>
          {'リュミン線'.split('').map((k, i) => <span className="loader-kana" key={i}>{k}</span>)}
        </p>
        <span className="loader-line" />
        <p className="loader-sub">Ryumin Line · 出発 Shuppatsu</p>
      </div>
      <span className="loader-num">000</span>
    </div>
  )
}

/* Табло в вагоне: следующая станция + схема линии (это и есть навигация) */
function LCD({ lang, goTo, onLang, t }) {
  const [state, setState] = useState({ cur: 0, moving: false, next: 1 })
  const [flip, setFlip] = useState(false)
  const bar = useRef()
  useEffect(() => {
    const tick = () => {
      const { x, v } = store.train
      const moving = Math.abs(v) > 2
      const cur = Math.max(0, Math.min(LAST, Math.round(x / STATION_GAP)))
      const next = Math.max(0, Math.min(LAST, v >= 0 ? Math.ceil(x / STATION_GAP - 0.02) : Math.floor(x / STATION_GAP + 0.02)))
      setState((s) => (s.cur === cur && s.moving === moving && s.next === next ? s : { cur, moving, next }))
      if (bar.current) bar.current.style.transform = `translate3d(${(x / stationX(LAST)) * (bar.current.parentElement.offsetWidth - 14)}px,0,0)`
    }
    store.loops.add(tick)
    const id = setInterval(() => setFlip((f) => !f), 3200)
    return () => { store.loops.delete(tick); clearInterval(id) }
  }, [])
  const L = lcd[lang]
  const st = stations[state.moving ? state.next : state.cur]
  const label = state.moving ? L.next : (state.cur === LAST ? L.terminal : L.now)
  return (
    <header className="lcd-wrap">
      <button className="mono magnetic" type="button" onClick={() => goTo(0)} aria-label="Top"><span>S</span><span>R</span></button>
      <nav className="lcd" aria-label={L.line}>
        <div className="lcd-now">
          <span className="lcd-label">{flip ? (state.moving ? '次は' : 'ただいま') : label}</span>
          <span className="lcd-name" key={st.kanji + flip}>{flip ? st.kanji : st[lang]}</span>
        </div>
        <ol className="lcd-map">
          <span className="lcd-track" />
          <span className="lcd-train" ref={bar} />
          {stations.map((s, i) => (
            <li key={s.n}>
              <button type="button" className={i === state.cur && !state.moving ? 'on' : ''} onClick={() => goTo(i)} aria-label={s[lang]}>
                <i />
                <span>{s[lang]}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="lcd-side">
        <div className="lang" role="group" aria-label="Language">
          {['ru', 'en'].map((l) => (
            <button key={l} type="button" className={l === lang ? 'on' : ''} aria-pressed={l === lang} onClick={() => onLang(l)}>{l.toUpperCase()}</button>
          ))}
        </div>
        <button className="nav-cta magnetic" type="button" onClick={() => goTo(LAST)}>{t.nav.contact}</button>
      </div>
    </header>
  )
}

function Content({ t, lang, ready }) {
  const root = useRef()
  const [copied, setCopied] = useState(false)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.st-head').forEach((head) => {
        gsap.from(head.querySelectorAll('.ch'), {
          yPercent: 110, rotate: 5, stagger: 0.025, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: head, start: 'top 82%' },
        })
      })
      gsap.fromTo('.statement .w', { opacity: 0.14 }, {
        opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: '.statement', start: 'top 80%', end: 'bottom 50%', scrub: true },
      })
      gsap.utils.toArray('.rule').forEach((el) => {
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 60%', scrub: true } })
      })
      // рекламные таблички проектов покачиваются, как накадзури в вагоне
      gsap.utils.toArray('.card').forEach((c, i) => {
        gsap.fromTo(c, { rotate: i % 2 ? 2.5 : -2.5 }, { rotate: 0, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 55%', scrub: 1 } })
      })
    }, root)
    ScrollTrigger.refresh()
    document.dispatchEvent(new Event('layout'))
    return () => ctx.revert()
  }, [lang])

  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      gsap.timeline()
        .from('.hero-name .ch', { yPercent: 115, duration: 1.4, stagger: 0.045, ease: 'expo.out' })
        .from('.hero-meta > *', { opacity: 0, y: 16, stagger: 0.08, duration: 0.9, ease: 'power3.out' }, 0.5)
        .from('.seal', { scale: 1.6, opacity: 0, rotate: -12, duration: 0.5, ease: 'back.out(2)' }, 1)
    }, root)
    return () => ctx.revert()
  }, [ready])

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(contacts.email); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* нет доступа к буферу */ }
  }
  const Travel = ({ i }) => <div className="travel" data-travel={i} aria-hidden="true" />

  return (
    <main ref={root}>
      <section className="hero" data-station="0" id="st-0">
        <div className="hero-inner">
          <h1 className="hero-name">
            <Chars text={t.hero.first} className="line" />
            <Chars text={t.hero.last} className="line indent" />
          </h1>
          <div className="hero-meta">
            <p className="hero-lead">{t.hero.lead}</p>
            <p className="hero-role">{t.hero.role[0]}<br />{t.hero.role[1]}</p>
            <p className="hero-scroll"><span className="scroll-line" />{t.hero.scroll}</p>
          </div>
        </div>
        <div className="seal" title={t.hero.sealNote} data-cursor={t.hero.sealNote}>
          {[...t.hero.seal].map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </section>
      <Travel i={0} />

      <section className="st" data-station="1" id="st-1">
        <div className="panel">
          <StationHead i={1} title={t.profile.title} />
          <Words text={t.profile.statement} />
          <h3 className="sub">{t.profile.strengthsTitle}</h3>
          <div className="strengths">
            {t.profile.strengths.map((s) => (
              <article className="strength" key={s.t}><span className="rule" /><h4>{s.t}</h4><p>{s.d}</p></article>
            ))}
          </div>
        </div>
      </section>
      <Travel i={1} />

      <section className="st" data-station="2" id="st-2">
        <div className="panel">
          <StationHead i={2} title={t.experience.title} />
          {t.experience.jobs.map((j) => (
            <article className="job" key={j.company}>
              <span className="rule" />
              <div className="job-top">
                <h3 className="job-company">{j.company}</h3>
                {j.period && <p className="job-period">{j.period}</p>}
              </div>
              <p className="job-role">{j.role}</p>
              <p className="job-about">{j.about}</p>
              <ul className="job-points">{j.points.map((p) => <li key={p}>{p}</li>)}</ul>
              {j.facts && (
                <>
                  <dl className="facts">
                    {j.facts.map((f) => <div className="fact" key={f.l}><dt>{f.v}</dt><dd>{f.l}</dd></div>)}
                  </dl>
                  <p className="source">{j.source}</p>
                </>
              )}
            </article>
          ))}
        </div>
      </section>
      <Travel i={2} />

      <section className="st" data-station="3" id="st-3">
        <div className="panel panel-wide">
          <StationHead i={3} title={t.projects.title} />
          <p className="panel-hint">{t.projects.hint}</p>
          <div className="cards">
            {t.projects.items.map((p, i) => (
              <article className="card" key={p.name} data-cursor={p.kind}>
                <span className="card-hanger" aria-hidden="true" />
                <div className="card-cover"><Wagara type={p.pattern} uid={i} /><span className="card-pattern-name">{p.pattern}</span></div>
                <div className="card-body">
                  <p className="card-kind">{p.kind}</p>
                  <h3 className="card-name">{p.name}</h3>
                  <p className="card-d">{p.d}</p>
                  <ul className="card-stack">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Travel i={3} />

      <section className="st" data-station="4" id="st-4">
        <div className="panel">
          <StationHead i={4} title={t.skills.title} />
          <dl className="skill-list">
            {t.skills.groups.map((g) => <div className="skill-row" key={g.g}><dt>{g.g}</dt><dd>{g.i}</dd></div>)}
          </dl>
        </div>
      </section>
      <Travel i={4} />

      <section className="st" data-station="5" id="st-5">
        <div className="panel">
          <StationHead i={5} title={t.education.title} />
          <div className="schools">
            {t.education.schools.map((s) => (
              <div className="school" key={s.n}><span className="rule" /><h3>{s.n}</h3><p>{s.d}</p><p className="muted">{s.p}</p></div>
            ))}
          </div>
          <ul className="langs">
            {t.education.langs.map((l) => <li key={l.native}><span className="lang-native">{l.native}</span><span className="lang-level">{l.l}</span></li>)}
          </ul>
        </div>
      </section>
      <Travel i={5} />

      <section className="st st-last" data-station="6" id="st-6">
        <div className="panel">
          <StationHead i={6} title={t.contact.title} />
          <p className="contact-lead">{t.contact.lead}</p>
          <a className="contact-mail" href={`mailto:${contacts.email}`} data-cursor="mail">{contacts.email}</a>
          <div className="contact-links">
            <a className="pill magnetic" href={contacts.telegram} target="_blank" rel="noreferrer">Telegram {contacts.telegramHandle}</a>
            <a className="pill magnetic" href={contacts.github} target="_blank" rel="noreferrer">GitHub {contacts.githubHandle}</a>
            <button className="pill magnetic" type="button" onClick={copyEmail}>{copied ? t.contact.copied : t.contact.copy}</button>
          </div>
          <footer className="foot">
            <p>{t.contact.remote}</p>
            <MoscowClock label={t.contact.now} />
            <p>© 2026 {t.hero.first} {t.hero.last}</p>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  const [lang, setLang] = useState(() => ((navigator.language || 'ru').startsWith('ru') ? 'ru' : 'en'))
  const [ready, setReady] = useState(false)
  const [fontsReady, setFontsReady] = useState(0)
  const doors = useRef()
  const lenisRef = useRef()
  const t = content[lang]

  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(1))
    Promise.all([
      document.fonts?.load('700 100px "Zen Kaku Gothic New"', '経歴出発'),
      document.fonts?.load('600 40px "Manrope"', 'Keireki'),
    ]).then(() => setFontsReady(2)).catch(() => {})
  }, [])

  // Скролл → цель поезда → пружинная «физика» (ускорение, торможение)
  useEffect(() => {
    let markers = []
    const measure = () => {
      markers = [...document.querySelectorAll('[data-station], [data-travel]')].map((el) => {
        const r = el.getBoundingClientRect()
        return { st: el.dataset.station, tr: el.dataset.travel, top: r.top + scrollY, h: r.height }
      })
    }
    measure()
    addEventListener('resize', measure)
    document.addEventListener('layout', measure)
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)

    let lenis
    if (!store.reduced) {
      lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.85, touchMultiplier: 1.4 })
      lenisRef.current = lenis
      lenis.on('scroll', (e) => { store.velocity = e.velocity || 0; ScrollTrigger.update() })
      lenis.stop()
    }
    const ease = (x) => x * x * x * (x * (x * 6 - 15) + 10)
    let last = performance.now()
    const tick = (time) => {
      lenis?.raf(time * 1000)
      const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05); last = now
      const c = scrollY + innerHeight * 0.5
      let target = 0
      for (const m of markers) {
        if (c < m.top) break
        if (m.st !== undefined) target = stationX(+m.st)
        else {
          const i = +m.tr
          const p = Math.min(1, Math.max(0, (c - m.top) / m.h))
          target = stationX(i) + (stationX(i + 1) - stationX(i)) * ease(p)
        }
      }
      const tr = store.train
      tr.target = target
      if (store.freeze) { /* отладка: положение задано извне */ }
      else if (store.reduced) { tr.x = target; tr.v = 0; tr.a = 0 }
      else {
        // критически демпфированная пружина в подшагах: плавно при любом FPS
        const k = 4.5, damp = 2 * Math.sqrt(k), steps = 4, h = dt / steps
        let accSum = 0
        for (let s = 0; s < steps; s++) {
          const acc = Math.max(-70, Math.min(70, k * (target - tr.x) - damp * tr.v))
          tr.v += acc * h; tr.x += tr.v * h; accSum += acc
        }
        const accAvg = accSum / steps
        tr.a += (Math.max(-40, Math.min(40, accAvg)) - tr.a) * Math.min(1, dt * 6)
      }
      store.loops.forEach((fn) => fn(dt, now))
      store.render?.()
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); ro.disconnect(); removeEventListener('resize', measure); document.removeEventListener('layout', measure) }
  }, [])

  useEffect(() => { if (ready) lenisRef.current?.start() }, [ready])

  useEffect(() => {
    const onMove = (e) => { store.mouse.x = e.clientX / innerWidth; store.mouse.y = e.clientY / innerHeight }
    addEventListener('pointermove', onMove, { passive: true })
    return () => removeEventListener('pointermove', onMove)
  }, [])
  useEffect(() => { document.documentElement.lang = lang }, [lang])

  // Смена языка: двери вагона закрываются и открываются
  const switchLang = (next) => {
    if (next === lang) return
    const panels = doors.current.children
    const q = store.reduced ? 0.01 : 1
    gsap.timeline()
      .set(doors.current, { visibility: 'visible' })
      .fromTo(panels[0], { xPercent: -100 }, { xPercent: 0, duration: 0.5 * q, ease: 'power3.in' })
      .fromTo(panels[1], { xPercent: 100 }, { xPercent: 0, duration: 0.5 * q, ease: 'power3.in' }, '<')
      .add(() => setLang(next))
      .to(panels[0], { xPercent: -100, duration: 0.6 * q, ease: 'power3.out', delay: 0.2 * q })
      .to(panels[1], { xPercent: 100, duration: 0.6 * q, ease: 'power3.out' }, '<')
      .set(doors.current, { visibility: 'hidden' })
  }

  const goTo = (i) => {
    const el = document.getElementById(`st-${i}`)
    const y = i === 0 ? 0 : el.getBoundingClientRect().top + scrollY - innerHeight * 0.3
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 2.2, easing: (x) => 1 - Math.pow(1 - x, 3) })
    else scrollTo(0, y)
  }

  return (
    <>
      <TrainWorld stations={stations} fontsReady={fontsReady} />
      <Interior />
      {!ready && <Loader label={t.loader} onDone={() => setReady(true)} />}
      <Cursor />
      <LCD lang={lang} t={t} goTo={goTo} onLang={switchLang} />
      <div className="doors" ref={doors} aria-hidden="true"><span><i /></span><span><i /></span></div>
      <Content t={t} lang={lang} ready={ready} />
    </>
  )
}
