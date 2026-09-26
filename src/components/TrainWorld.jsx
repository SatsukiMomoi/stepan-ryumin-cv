import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette, ToneMapping, Noise } from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'
import { store, stationX } from '../store'
import City, { Sky, X_MIN, X_MAX, HORIZON, SKY_TOP } from './City'
import { Glass, Haze, RainField, Oncoming, wetFloorMaterial } from './Atmosphere'

/* ───────────── Опоры контактной сети: главный «спидометр» ───────────── */
function Catenary() {
  const ref = useRef()
  const xs = useMemo(() => { const a = []; for (let x = X_MIN; x < X_MAX; x += 15) a.push(x); return a }, [])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    xs.forEach((x, i) => { m.makeScale(0.16, 7, 0.16).setPosition(x, 0.5, -2.3); ref.current.setMatrixAt(i * 2, m)
      m.makeScale(0.1, 0.1, 2.4).setPosition(x, 3.9, -1.3); ref.current.setMatrixAt(i * 2 + 1, m) })
    ref.current.instanceMatrix.needsUpdate = true
  }, [xs])
  return (
    <>
      <instancedMesh ref={ref} args={[null, null, xs.length * 2]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#14161d" />
      </instancedMesh>
      {[3.75, 3.5].map((y, i) => (
        <mesh key={i} position={[(X_MIN + X_MAX) / 2, y, -1.2 + i * 0.1]}>
          <boxGeometry args={[X_MAX - X_MIN, 0.015, 0.015]} />
          <meshBasicMaterial color="#2a2d36" />
        </mesh>
      ))}
      {/* парапет эстакады */}
      <mesh position={[(X_MIN + X_MAX) / 2, -1.25, -2.0]}>
        <boxGeometry args={[X_MAX - X_MIN, 1.0, 0.3]} />
        <meshBasicMaterial color="#1b1d24" />
      </mesh>
    </>
  )
}

/* ───────────── Станционная табличка (эки-мэйхё) ───────────── */
function signTexture(st, prev, next, lineColor) {
  const c = document.createElement('canvas')
  c.width = 2048; c.height = 1024
  const g = c.getContext('2d')
  g.scale(2, 2)
  g.fillStyle = '#f4f3ee'; g.fillRect(0, 0, 1024, 512)
  // линия и номер станции
  g.fillStyle = lineColor; g.fillRect(0, 372, 1024, 70)
  g.fillStyle = '#fff'; g.strokeStyle = lineColor; g.lineWidth = 10
  g.beginPath(); g.roundRect(40, 40, 128, 128, 18); g.fill(); g.stroke()
  g.fillStyle = lineColor; g.font = '700 42px "Manrope", sans-serif'; g.textAlign = 'center'
  g.fillText('RS', 104, 98); g.font = '700 52px "Manrope", sans-serif'; g.fillText(String(st.n).padStart(2, '0'), 104, 150)
  // название
  g.fillStyle = '#16181f'; g.textAlign = 'center'
  g.font = '700 150px "Zen Kaku Gothic New", "Hiragino Sans", sans-serif'
  g.fillText(st.kanji, 540, 205)
  g.font = '500 44px "Zen Kaku Gothic New", "Hiragino Sans", sans-serif'
  g.fillText(st.kana, 540, 272)
  g.font = '600 40px "Manrope", sans-serif'
  g.fillText(st.romaji, 540, 336)
  // соседние станции
  g.fillStyle = '#fff'; g.font = '600 34px "Manrope", "Zen Kaku Gothic New", sans-serif'
  g.textAlign = 'left'; if (prev) g.fillText(`◀ ${prev.romaji}`, 36, 420)
  g.textAlign = 'right'; g.fillText(next ? `${next.romaji} ▶` : '終点 Terminal', 988, 420)
  g.fillStyle = '#6b6f7a'; g.textAlign = 'left'; g.font = '500 28px "Manrope", sans-serif'
  g.fillText('Ryumin Line  リュミン線', 36, 490)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 16
  return t
}

function Station({ i, stations, fontsReady }) {
  const x = stationX(i)
  const st = stations[i]
  const tex = useMemo(() => signTexture(st, stations[i - 1], stations[i + 1], '#b8322a'),
    // перерисовываем после загрузки шрифтов
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [st.kanji, st.romaji, fontsReady])
  useEffect(() => () => tex.dispose(), [tex])
  const signMat = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.8, 0.8, 0.8), toneMapped: false }), [tex])
  const pillars = [-24, -16, -8, 0, 8, 16, 24]
  return (
    <group position={[x, 0, 0]}>
      {/* платформа */}
      <mesh position={[0, -0.5, -5.2]}><boxGeometry args={[62, 1, 6.2]} /><meshBasicMaterial color="#0e1014" /></mesh>
      <mesh position={[0, 0.01, -2.55]} rotation-x={-Math.PI / 2}><planeGeometry args={[62, 0.35]} /><meshBasicMaterial color="#c9a227" /></mesh>
      <mesh position={[0, 0.012, -2.2]} rotation-x={-Math.PI / 2}><planeGeometry args={[62, 0.08]} /><meshBasicMaterial color="#e8e6de" /></mesh>
      {/* навес и лампы */}
      <mesh position={[0, 3.9, -4.6]}><boxGeometry args={[62, 0.22, 4.6]} /><meshBasicMaterial color="#1d2028" /></mesh>
      {[-3.3, -5.9].map((z) => (
        <mesh key={z} position={[0, 3.78, z]} rotation-x={Math.PI / 2}><planeGeometry args={[58, 0.12]} /><meshBasicMaterial color={[3, 2.95, 2.7]} toneMapped={false} /></mesh>
      ))}
      {/* свет на полу */}
      <mesh position={[0, 0.02, -4.8]} rotation-x={-Math.PI / 2} material={wetFloorMaterial}><planeGeometry args={[60, 4.6]} /></mesh>
      {pillars.map((p) => (
        <mesh key={p} position={[p + 4, 1.9, -6.6]}><boxGeometry args={[0.25, 3.8, 0.25]} /><meshBasicMaterial color="#2c2f38" /></mesh>
      ))}
      {/* низкое ограждение: за ним видно город */}
      <mesh position={[0, 0.55, -8.2]}><boxGeometry args={[62, 1.1, 0.12]} /><meshBasicMaterial color="#121419" /></mesh>
      <mesh position={[0, 1.12, -8.2]}><boxGeometry args={[62, 0.05, 0.16]} /><meshBasicMaterial color="#4a4e58" /></mesh>
      {/* торговые автоматы */}
      {[-11, -9.9, 20].map((p, k) => (
        <group key={p} position={[p, 0.95, -7.6]}>
          <mesh><boxGeometry args={[1, 1.9, 0.7]} /><meshBasicMaterial color={k === 2 ? '#b8322a' : '#e8e8e8'} /></mesh>
          <mesh position={[0, 0.25, 0.36]}><planeGeometry args={[0.82, 1.0]} /><meshBasicMaterial color={[1.5, 1.75, 1.9]} toneMapped={false} /></mesh>
          {[0, 1, 2].map((row) => (
            <mesh key={row} position={[0, 0.55 - row * 0.3, 0.37]}><planeGeometry args={[0.72, 0.06]} /><meshBasicMaterial color={['#ff6b5c', '#4f9dff', '#ffd36b'][row]} toneMapped={false} /></mesh>
          ))}
        </group>
      ))}
      {/* табличка с названием: основная и две на подходе */}
      {[3.4, -21, 23].map((sx) => (
        <group key={sx} position={[sx, 2.3, -5.4]}>
          <mesh position={[0, 0, -0.03]}><boxGeometry args={[2.3, 1.22, 0.05]} /><meshBasicMaterial color="#2a2d36" /></mesh>
          <mesh material={signMat}><planeGeometry args={[2.2, 1.1]} /></mesh>
          <mesh position={[-0.9, 1.05, -0.05]}><boxGeometry args={[0.05, 1.0, 0.05]} /><meshBasicMaterial color="#2a2d36" /></mesh>
          <mesh position={[0.9, 1.05, -0.05]}><boxGeometry args={[0.05, 1.0, 0.05]} /><meshBasicMaterial color="#2a2d36" /></mesh>
        </group>
      ))}
    </group>
  )
}

// Рендер вызывается из общего тикера (скролл → физика → кадр): без рассинхрона
function Driver() {
  const advance = useThree((s) => s.advance)

  useEffect(() => { store.render = () => advance(performance.now() / 1000); return () => { store.render = null } }, [advance])
  return null
}

/* ───────────── Камера: едет вместе с поездом, всё сглажено ───────────── */
function Rig() {
  const { camera, size } = useThree()
  const look = useRef({ x: 0, y: 0, bump: 0 })
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const L = look.current
    const speed = Math.min(Math.abs(store.train.v) / 40, 1)
    // стык рельсов: мягкий синусоидальный толчок вместо резкого
    const phase = (store.train.x / 18) % 1
    const pulse = Math.pow(Math.max(0, Math.sin(phase * Math.PI * 2)), 10)
    L.bump += (pulse * 0.012 * speed - L.bump) * Math.min(1, dt * 12)
    const k = Math.min(1, dt * 2.5)
    L.x += ((store.mouse.x - 0.5) - L.x) * k
    L.y += ((store.mouse.y - 0.5) - L.y) * k
    camera.position.set(
      store.train.x + L.x * 0.22,
      1.55 + Math.sin(t * 7.3) * 0.003 * speed - L.bump - L.y * 0.07,
      2.8,
    )
    camera.rotation.set(-0.02 - L.y * 0.025, -L.x * 0.05, Math.sin(t * 2.3) * 0.0015 * speed - store.train.a * 0.00025)
    const fov = size.width < 700 ? 64 : 46
    if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix() }
  })
  return null
}

export default function TrainWorld({ stations, fontsReady }) {
  const lite = store.touch
  return (
    <div className="world" aria-hidden="true">
      <Canvas
        frameloop="never"
        dpr={lite ? [1, 1.75] : [1, 2]}
        camera={{ fov: 46, near: 0.2, far: 420, position: [0, 1.55, 2.8] }}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
        onCreated={({ scene, gl }) => { gl.toneMappingExposure = 1.5; scene.fog = new THREE.Fog(HORIZON, 40, 190); scene.background = SKY_TOP }}
      >
        <Sky />
        <City lite={lite} fontsReady={fontsReady} />
        <Haze lite={lite} />
        <Oncoming />
        <Catenary />
        <RainField lite={lite} />
        {stations.map((_, i) => <Station key={i} i={i} stations={stations} fontsReady={fontsReady} />)}
        <Rig />
        <Driver />
        <EffectComposer multisampling={lite ? 2 : 4} disableNormalPass>
          <Glass lite={lite} />
          <Bloom mipmapBlur intensity={lite ? 0.75 : 0.95} luminanceThreshold={0.82} luminanceSmoothing={0.18} radius={0.72} />
          <ToneMapping mode={ToneMappingMode.AGX} />
          <Vignette offset={0.28} darkness={0.5} />
          <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.35} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
