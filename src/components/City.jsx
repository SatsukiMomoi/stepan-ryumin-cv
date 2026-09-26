import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { STATION_GAP } from '../store'

/*
  Город по районам вдоль линии:
  жилой (малоэтажные дома с крышами) → деловой центр (башни, полосы офисных окон, телебашня)
  → мост через реку → неоновый квартал (вывески, LED-экраны) → залив с колесом обозрения.
*/

export const X_MIN = -140
export const X_MAX = STATION_GAP * 6 + 180
export const RIVER = [398, 447]
export const HORIZON = new THREE.Color('#1c1830')
export const SKY_TOP = new THREE.Color('#04060d')
const GROUND = -8

export function rng(seed) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}
const inRiver = (x, pad = 0) => x > RIVER[0] - pad && x < RIVER[1] + pad
function district(x) {
  if (inRiver(x)) return 'river'
  if (x < 110) return 'res'
  if (x < RIVER[0]) return 'down'
  if (x < 650) return 'neon'
  return 'bay'
}

// Общие GLSL-хелперы: шум и перевод в линейное пространство
export const GLSL_COMMON = `
float h1(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h1(i),h1(i+vec2(1,0)),u.x), mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
vec3 toLinear(vec3 c){ return pow(max(c, 0.0), vec3(2.2)); }
vec3 toGamma(vec3 c){ return pow(max(c, 0.0), vec3(1.0/2.2)); }
`

/* ───────────── Небо: засветка, облака, подсвеченные городом, луна ───────────── */
export function Sky() {
  const ref = useRef()
  const mat = useMemo(() => new THREE.ShaderMaterial({
    depthWrite: false, fog: false,
    uniforms: { uTop: { value: SKY_TOP }, uHor: { value: HORIZON }, uTime: { value: 0 }, uOff: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `
      uniform vec3 uTop, uHor; uniform float uTime, uOff; varying vec2 vUv;
      ${GLSL_COMMON}
      void main(){
        vec3 top = toGamma(uTop), hor = toGamma(uHor);
        float y = vUv.y;
        vec3 col = mix(hor*1.35 + vec3(0.08,0.04,0.01), top, smoothstep(0.05, 0.7, y));
        // облака: снизу подсвечены тёплым светом города
        vec2 cp = vec2(vUv.x*7.0 + uOff + uTime*0.004, y*3.2);
        float n = fbm(cp) * 0.75 + fbm(cp*2.3 + 4.0) * 0.25;
        float cloud = smoothstep(0.5, 0.78, n) * smoothstep(0.02, 0.25, y) * (1.0 - smoothstep(0.55, 0.9, y));
        vec3 cloudCol = mix(vec3(0.33,0.2,0.2), vec3(0.12,0.12,0.2), smoothstep(0.1, 0.6, y));
        col = mix(col, cloudCol, cloud*0.7);
        // луна
        vec2 m = vUv - vec2(0.72, 0.8); m.x *= 5.4;
        float d = length(m);
        float moon = smoothstep(0.03, 0.024, d);
        col = mix(col, vec3(1.25,1.18,1.0), moon * (1.0 - cloud*0.7));
        col += vec3(0.55,0.5,0.45) * exp(-d*14.0) * 0.22;
        // звёзды в разрывах облаков
        vec2 g = floor(vUv*vec2(1100.,200.));
        col += step(0.9988, h1(g)) * 0.4 * smoothstep(0.45, 0.9, y) * (1.0-cloud);
        gl_FragColor = vec4(toLinear(col), 1.);
      }`,
  }), [])
  useFrame(({ camera }, dt) => {
    ref.current.position.x = camera.position.x
    mat.uniforms.uTime.value += dt
    mat.uniforms.uOff.value = camera.position.x * 0.004
  })
  return (
    <mesh ref={ref} position={[0, 45, -180]} material={mat} renderOrder={-1}>
      <planeGeometry args={[1500, 280]} />
    </mesh>
  )
}

/* ───────────── Генерация города ───────────── */
// style: 0 сетка окон, 1 офисные полосы, 2 квартиры с балконами, 3 частный дом
function generate(lite) {
  const r = rng(11)
  const R = (a, b) => a + r() * (b - a)
  const buildings = [], houses = [], tanks = [], antennas = [], signs = [], screens = [], shops = []
  const layers = [
    { z: [-14.5, -19], d: [3, 6], key: 0 },
    { z: [-38, -62], d: [6, 12], key: 1 },
    { z: [-88, -140], d: [8, 18], key: 2 },
  ]
  layers.forEach((L) => {
    if (lite && L.key === 2) return
    let x = X_MIN
    while (x < X_MAX) {
      const dist = district(x)
      if (dist === 'river' && L.key < 2) { x += 4; continue }
      // коридор обзора на телебашню
      if (L.key === 1 && x > 238 && x < 278) { x += 4; continue }
      let w, hgt, style, gap = R(0.6, 3)
      if (L.key === 0) {
        if (dist === 'res') {
          const house = r() < 0.75
          w = house ? R(5, 8) : R(6, 10); hgt = house ? R(4, 7) : R(6, 11); style = house ? 3 : 2
        } else if (dist === 'down') { w = R(5, 10); hgt = R(5, 11); style = r() < 0.5 ? 0 : 2 }
        else if (dist === 'neon') { w = R(3, 6.5); hgt = R(5, 11); style = r() < 0.7 ? 0 : 2; gap = R(0.2, 1) }
        else { w = R(9, 16); hgt = R(3, 7); style = 0 }
      } else if (L.key === 1) {
        if (dist === 'res') { w = R(7, 12); hgt = R(6, 16); style = 2 }
        else if (dist === 'down') { w = R(7, 14); hgt = R(12, 38); style = r() < 0.65 ? 1 : 0 }
        else if (dist === 'neon') { w = R(6, 11); hgt = R(8, 22); style = r() < 0.5 ? 0 : 2 }
        else if (dist === 'bay') { w = R(10, 18); hgt = R(6, 18); style = r() < 0.5 ? 0 : 1 }
        else { w = R(8, 14); hgt = R(10, 30); style = 1 }
      } else {
        // окно в застройке под телебашню
        if (x > 236 && x < 280) { x += 4; continue }
        w = R(8, 20); hgt = R(18, 72) * (dist === 'res' ? 0.65 : 1); style = r() < 0.55 ? 1 : 0
      }
      const d = R(L.d[0], L.d[1])
      const z = R(L.z[0], L.z[1])
      const seed = r()
      const b = { x: x + w / 2, y: GROUND + hgt / 2, z, w, h: hgt, d, seed, style, layer: L.key, dist }
      buildings.push(b)
      const roofY = GROUND + hgt
      if (style === 3) houses.push({ x: b.x, y: roofY, z, w: w * 1.06, d: d * 1.12, h: R(1.2, 2.2) })
      // ступенчатые башни
      if (hgt > 22 && r() < 0.7) {
        const w2 = w * R(0.55, 0.8), d2 = d * R(0.6, 0.85), h2 = hgt * R(0.12, 0.3)
        buildings.push({ x: b.x + R(-0.1, 0.1) * w, y: roofY + h2 / 2, z, w: w2, h: h2, d: d2, seed, style, layer: L.key, dist })
        if (r() < 0.5) antennas.push({ x: b.x, y: roofY + h2, z, h: R(3, 8) })
      } else if (hgt > 30 && r() < 0.6) antennas.push({ x: b.x + R(-0.3, 0.3) * w, y: roofY, z, h: R(3, 7) })
      // баки на крышах
      if (style !== 3 && L.key < 2 && hgt < 30 && r() < 0.4) tanks.push({ x: b.x + R(-0.3, 0.3) * w, y: roofY, z: z + R(-0.2, 0.2) * d, s: R(0.6, 1.1) })
      // вывески
      const signP = { neon: 1, down: 0.35, res: 0.15, bay: 0.15 }[dist] ?? 0
      if (L.key === 0 && style !== 3 && r() < signP && hgt > 6) signs.push({ b, vertical: r() < 0.72, k: Math.floor(r() * 1000) })
      if (L.key === 0 && dist === 'neon' && hgt > 8) signs.push({ b, vertical: false, k: Math.floor(r() * 1000) })
      // витрины первого этажа
      if (L.key === 0 && style !== 3 && (dist === 'neon' || dist === 'down' || (dist === 'res' && r() < 0.3))) shops.push({ x: b.x, z: z + d / 2 + 0.05, w: w * 0.9, warm: r() < 0.7 })
      if (L.key === 1 && dist === 'neon' && r() < 0.75) signs.push({ b, vertical: r() < 0.4, k: Math.floor(r() * 1000) })
      // LED-экраны на фасадах
      if (L.key === 1 && (dist === 'neon' || dist === 'down') && hgt > 14 && r() < (dist === 'neon' ? 0.45 : 0.18)) {
        const sw = Math.min(w * 0.8, R(5, 8)), sh = sw * R(0.5, 0.65)
        screens.push({ x: b.x, y: GROUND + hgt * R(0.55, 0.8), z: z + d / 2 + 0.2, w: sw, h: sh, seed: r() })
      }
      x += w + gap
    }
  })
  return { buildings, houses, tanks, antennas, signs, screens, shops }
}

/* ───────────── Фасады: четыре типа окон, сглаженные, без ряби вдали ───────────── */
function facadeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uFog: { value: HORIZON }, uTime: { value: 0 } },
    vertexShader: `
      attribute float aSeed;
      varying vec3 vW; varying vec3 vN; varying float vSeed; varying vec3 vLocal; varying vec3 vSize;
      void main(){
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vW = wp.xyz; vSeed = aSeed; vLocal = position;
        vSize = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      uniform vec3 uFog; uniform float uTime;
      varying vec3 vW; varying vec3 vN; varying float vSeed; varying vec3 vLocal; varying vec3 vSize;
      ${GLSL_COMMON}
      float band(float f, float a, float b, float fw){ return smoothstep(a-fw, a+fw, f) * (1.0 - smoothstep(b-fw, b+fw, f)); }
      void main(){
        float style = floor(vSeed + 0.001);
        float seed = fract(vSeed);
        // базовый цвет фасада: бетон / стекло / штукатурка
        vec3 concrete = vec3(0.075,0.078,0.1), glass = vec3(0.045,0.065,0.11), plaster = vec3(0.1,0.088,0.092);
        vec3 base = style > 2.5 ? plaster : (style > 0.5 && style < 1.5 ? glass : concrete);
        base *= 0.8 + 0.4*seed;
        base += vec3(0.025,0.02,0.035) * smoothstep(-8., 30., vW.y);
        // подсветка снизу от улицы
        base += vec3(0.09,0.05,0.02) * (1.0 - smoothstep(-8.0, -3.0, vW.y));
        bool roof = vN.y > 0.5;
        bool front = abs(vN.z) > 0.5;
        // освещение граней: фасад, торец и крыша различаются по тону — объём
        base *= roof ? 0.7 : (front ? 1.0 : 0.72);
        vec3 col = base;
        float distC = distance(cameraPosition, vW);
        if (!roof) {
          // расстояние до вертикальных рёбер в метрах → светлая кромка
          float halfW = (front ? vSize.x : vSize.z) * 0.5;
          float edgeD = halfW - abs(front ? vLocal.x * vSize.x : vLocal.z * vSize.z);
          float px = distC * 0.0011;
          float edge = 1.0 - smoothstep(0.0, max(0.12, px * 1.5), edgeD);
          col += vec3(0.06,0.06,0.09) * edge;
          // межэтажные плиты у бетонных зданий
          float topD = (0.5 - vLocal.y) * vSize.y;
          if (style < 0.5 || style > 1.5) {
            float slab = 1.0 - smoothstep(0.0, max(0.06, px), abs(fract(vW.y / 3.2) - 0.02) * 3.2);
            col += vec3(0.025,0.025,0.03) * slab * (1.0 - smoothstep(20.0, 70.0, distC));
          }
          // парапет по верху
          col += vec3(0.05,0.05,0.07) * (1.0 - smoothstep(0.0, max(0.25, px*1.5), topD));
          // корона: подсветка верхушки высоток
          float tall = step(26.0, vSize.y) * step(0.45, fract(seed * 5.3));
          float crown = band(topD, 0.35, 1.25, px) * tall;
          vec3 crownC = fract(seed * 11.7) < 0.5 ? vec3(0.8,0.92,1.0) : (fract(seed * 3.9) < 0.5 ? vec3(1.0,0.75,0.45) : vec3(1.0,0.5,0.75));
          col += crownC * crown * 1.3;
          float u = front ? vW.x : vW.z;
          // окна не заходят на рёбра и корону
          float inner = smoothstep(0.35, 0.9, edgeD) * smoothstep(0.9, 1.6, topD);
          vec2 cellSize = style < 0.5 ? vec2(1.4,1.9) : (style < 1.5 ? vec2(1.7,1.35) : (style < 2.5 ? vec2(2.3,1.7) : vec2(2.6,1.9)));
          vec2 cell = vec2(u, vW.y) / cellSize;
          vec2 id = floor(cell); vec2 f = fract(cell);
          // размер ячейки в пикселях считаем по расстоянию: стабильно, без ряби
          vec2 fw = vec2(distC * 0.0011) / cellSize * 1.3;
          float far = smoothstep(0.14, 0.38, max(fw.x, fw.y));
          float density = style > 2.5 ? 0.45 : 0.12 + 0.42*fract(seed*7.13);
          vec3 warm = vec3(1.0,0.72,0.42), cool = vec3(0.75,0.88,1.0), office = vec3(0.86,0.97,0.95);
          float win, lit; vec3 wc;
          if (style < 0.5) {
            win = band(f.x, 0.26, 0.74, fw.x) * band(f.y, 0.3, 0.74, fw.y);
            lit = step(1.0 - density, h1(id + seed*31.7));
            float k = h1(id + 3.3 + seed);
            wc = k < 0.55 ? warm : (k < 0.85 ? cool : office);
          } else if (style < 1.5) {
            // сплошные ленты этажей с импостами
            win = band(f.y, 0.22, 0.8, fw.y) * (1.0 - 0.85*band(f.x, 0.0, 0.07, fw.x));
            lit = step(1.0 - density - 0.15, h1(vec2(floor(cell.x/4.0), id.y) + seed*9.1));
            wc = mix(office, cool, h1(vec2(id.y, seed)));
          } else if (style < 2.5) {
            // квартиры: окна + перила балконов
            win = band(f.x, 0.12, 0.55, fw.x) * band(f.y, 0.34, 0.82, fw.y);
            lit = step(0.58 + density*0.2, h1(id + seed*17.3));
            wc = h1(id + 7.7) < 0.8 ? warm : cool;
            col += band(f.y, 0.1, 0.16, fw.y) * vec3(0.05,0.05,0.06) * (1.0 - far);
          } else {
            // частный дом: тёплые окна, седзи
            win = band(f.x, 0.34, 0.66, fw.x) * band(f.y, 0.34, 0.7, fw.y);
            lit = step(0.52, h1(id + seed*5.1));
            wc = vec3(1.0,0.78,0.5);
          }
          lit *= step(GROUND_Y + 0.8, vW.y);
          float flick = 0.9 + 0.1*sin(uTime*0.6 + h1(id)*60.0);
          vec3 lightC = wc * (0.32 + 0.9*pow(h1(id+9.1), 3.0)) * flick;
          float blind = step(0.82, h1(id+5.7)) * step(f.y, 0.52);
          vec3 nearC = win * lit * lightC * (1.0 - blind*0.7) + win * (1.0 - lit) * vec3(0.025,0.03,0.045);
          vec3 avg = wc * density * (style > 0.5 && style < 1.5 ? 0.45 : 0.3);
          col += mix(nearC, avg, far) * (front ? 1.0 : 0.55) * inner;
          // стеклянные башни: вертикальный отблеск неба
          if (style > 0.5 && style < 1.5) col += vec3(0.02,0.03,0.06) * smoothstep(0.0, 1.0, fract(u*0.05 + seed)) * 0.5;
        }
        float d = -vW.z;
        col = mix(col, toGamma(uFog), smoothstep(14.0, 160.0, d) * 0.78);
        gl_FragColor = vec4(toLinear(col), 1.0);
      }`.replace('GROUND_Y', GROUND.toFixed(1)),
  })
}

function Buildings({ list }) {
  const mat = useMemo(facadeMaterial, [])
  const ref = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const seeds = new Float32Array(list.length)
    list.forEach((b, i) => {
      m.makeScale(b.w, b.h, b.d).setPosition(b.x, b.y, b.z)
      ref.current.setMatrixAt(i, m)
      seeds[i] = b.style + b.seed * 0.998
    })
    ref.current.geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    ref.current.instanceMatrix.needsUpdate = true
  }, [list])
  useFrame((_, dt) => { mat.uniforms.uTime.value += dt })
  return (
    <instancedMesh ref={ref} args={[null, mat, list.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}

/* ───────────── Крыши домов (двускатные) ───────────── */
function prismGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.5, 0); shape.lineTo(0.5, 0); shape.lineTo(0, 1); shape.lineTo(-0.5, 0)
  const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false })
  g.translate(0, 0, -0.5)
  g.rotateY(Math.PI / 2)
  return g
}

function Instanced({ items, geometry, color, place }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3()
    items.forEach((it, i) => { place(it, p, s); m.compose(p, q, s); ref.current.setMatrixAt(i, m) })
    ref.current.instanceMatrix.needsUpdate = true
  }, [items, place])
  if (!items.length) return null
  return (
    <instancedMesh ref={ref} args={[geometry, null, items.length]} frustumCulled={false}>
      <meshBasicMaterial color={color} />
    </instancedMesh>
  )
}

function Roofs({ houses, tanks, antennas }) {
  const prism = useMemo(prismGeometry, [])
  const cyl = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 1, 10), [])
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const sphere = useMemo(() => new THREE.SphereGeometry(0.22, 10, 8), [])
  const beacons = useRef()
  useFrame(({ clock }) => { if (beacons.current) beacons.current.visible = Math.sin(clock.elapsedTime * 2.2) > 0 })
  return (
    <>
      <Instanced items={houses} geometry={prism} color="#161a22" place={(h, p, s) => { p.set(h.x, h.y, h.z); s.set(h.w, h.h, h.d) }} />
      <Instanced items={houses} geometry={box} color="#0f1218" place={(h, p, s) => { p.set(h.x, h.y + 0.04, h.z + h.d / 2); s.set(h.w, 0.08, 0.1) }} />
      <Instanced items={tanks} geometry={cyl} color="#23262f" place={(t, p, s) => { p.set(t.x, t.y + t.s * 0.75, t.z); s.set(t.s * 1.4, t.s * 1.5, t.s * 1.4) }} />
      <Instanced items={antennas} geometry={box} color="#2a2d36" place={(a, p, s) => { p.set(a.x, a.y + a.h / 2, a.z); s.set(0.14, a.h, 0.14) }} />
      <group ref={beacons}>
        {antennas.length > 0 && (
          <instancedMesh
            args={[sphere, null, antennas.length]}
            frustumCulled={false}
            ref={(el) => {
              if (!el) return
              const m = new THREE.Matrix4()
              antennas.forEach((a, i) => { m.makeTranslation(a.x, a.y + a.h, a.z); el.setMatrixAt(i, m) })
              el.instanceMatrix.needsUpdate = true
            }}
          >
            <meshBasicMaterial color={[3, 0.25, 0.2]} toneMapped={false} />
          </instancedMesh>
        )}
      </group>
    </>
  )
}

/* ───────────── Неон ───────────── */
const NEON_WORDS = [
  ['ラーメン', '#ff5c8a'], ['居酒屋', '#ffb347'], ['カラオケ', '#5ce1ff'], ['薬', '#6dff9c'], ['ホテル', '#c38bff'],
  ['喫茶', '#ffd36b'], ['焼肉', '#ff6b5c'], ['BAR', '#5ce1ff'], ['古着', '#ff8ad8'], ['質', '#ffe45c'],
  ['寿司', '#ff7a5c'], ['書店', '#8be9ff'], ['餃子', '#ffc15c'], ['CAFE', '#ff9ad5'], ['たこ焼', '#ffb347'], ['銭湯', '#7cc4ff'],
]

function neonTexture(word, color, vertical) {
  const chars = [...word]
  const W = vertical ? 160 : 90 + chars.length * (/^[A-Z]+$/.test(word) ? 80 : 118)
  const H = vertical ? 150 * chars.length + 70 : 170
  const c = document.createElement('canvas')
  c.width = W * 2; c.height = H * 2
  const g = c.getContext('2d')
  g.scale(2, 2)
  g.fillStyle = 'rgba(10,9,16,0.94)'
  g.beginPath(); g.roundRect(10, 10, W - 20, H - 20, 10); g.fill()
  g.strokeStyle = color; g.lineWidth = 5; g.shadowColor = color; g.shadowBlur = 22
  g.beginPath(); g.roundRect(17, 17, W - 34, H - 34, 8); g.stroke()
  g.font = `700 ${vertical ? 106 : 104}px "Zen Kaku Gothic New", "Hiragino Sans", sans-serif`
  g.textAlign = 'center'; g.textBaseline = 'middle'
  const draw = () => {
    if (vertical) chars.forEach((ch, i) => g.fillText(ch, W / 2, 35 + 75 + i * 150))
    else g.fillText(word, W / 2, H / 2 + 5)
  }
  g.shadowBlur = 28; g.fillStyle = '#fff'; draw()
  g.shadowBlur = 0; g.globalAlpha = 0.85; g.fillStyle = color; draw()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return { tex: t, aspect: W / H }
}

function Neon({ signs, fontsReady }) {
  const data = useMemo(() => {
    const cache = new Map()
    const get = (k, vertical) => {
      const key = `${k % NEON_WORDS.length}-${vertical}`
      if (!cache.has(key)) {
        const [w, col] = NEON_WORDS[k % NEON_WORDS.length]
        const { tex, aspect } = neonTexture(w, col, vertical)
        cache.set(key, { mat: new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(1.35, 1.35, 1.35), transparent: true, toneMapped: false }), aspect })
      }
      return cache.get(key)
    }
    const r = rng(42)
    return signs.map(({ b, vertical, k }) => {
      const m = get(k, vertical)
      const hgt = vertical ? Math.min(b.h * 0.55, 2.6 + r() * 2) : 1.1 + r() * 0.5
      const wid = hgt * m.aspect
      const y = vertical ? GROUND + 2 + r() * Math.max(0.5, b.h - hgt - 3) + hgt / 2 : GROUND + 3 + r() * Math.max(0.5, b.h - 5)
      const x = vertical ? b.x + (r() < 0.5 ? -1 : 1) * (b.w / 2 - wid / 2 - 0.1) : b.x + (r() - 0.5) * Math.max(0, b.w - wid)
      return { ...m, x, y, z: b.z + b.d / 2 + 0.3, w: wid, h: hgt, flick: r() < 0.1 }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signs, fontsReady])
  const refs = useRef([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    data.forEach((s, i) => {
      if (!s.flick || !refs.current[i]) return
      refs.current[i].visible = Math.sin(t * 13 + i) > -0.85 || Math.sin(t * 1.3 + i) > 0.2
    })
  })
  return data.map((s, i) => (
    <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[s.x, s.y, s.z]} material={s.mat}>
      <planeGeometry args={[s.w, s.h]} />
    </mesh>
  ))
}

/* ───────────── LED-экраны: живая «реклама» ───────────── */
function Screens({ screens }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    toneMapped: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `attribute float aSeed; varying vec2 vUv; varying float vSeed;
      void main(){ vUv = uv; vSeed = aSeed; gl_Position = projectionMatrix*viewMatrix*modelMatrix*instanceMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime; varying vec2 vUv; varying float vSeed;
      ${GLSL_COMMON}
      void main(){
        float t = uTime*0.25 + vSeed*20.0;
        float scene = floor(t);
        float ph = fract(t);
        vec3 a = vec3(1.0,0.35,0.6), b = vec3(0.3,0.85,1.0), c = vec3(1.0,0.72,0.3);
        float pick = h1(vec2(scene, vSeed));
        vec3 c1 = pick < 0.33 ? a : (pick < 0.66 ? b : c);
        vec3 c2 = pick < 0.33 ? b : (pick < 0.66 ? c : a);
        vec3 col = mix(c1, c2, smoothstep(0.0, 1.0, vUv.x + 0.3*sin(uTime*0.8 + vUv.y*3.0)));
        // блоки «текста»
        vec2 g = floor(vUv*vec2(10.0, 5.0));
        float blocks = step(0.55, h1(g + scene)) * step(0.2, vUv.y) * step(vUv.y, 0.55);
        col = mix(col*0.35, vec3(1.0), blocks*0.8);
        // смена кадра
        col *= smoothstep(0.0, 0.08, ph) * (1.0 - smoothstep(0.92, 1.0, ph)) * 0.8 + 0.2;
        col *= 0.92 + 0.08*sin(vUv.y*260.0);
        gl_FragColor = vec4(toLinear(col) * 1.6, 1.0);
      }`,
  }), [])
  const ref = useRef()
  useLayoutEffect(() => {
    if (!screens.length) return
    const m = new THREE.Matrix4()
    const seeds = new Float32Array(screens.length)
    screens.forEach((s, i) => { m.makeScale(s.w, s.h, 1).setPosition(s.x, s.y, s.z); ref.current.setMatrixAt(i, m); seeds[i] = s.seed })
    ref.current.geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    ref.current.instanceMatrix.needsUpdate = true
  }, [screens])
  useFrame((_, dt) => { mat.uniforms.uTime.value += dt })
  if (!screens.length) return null
  return (
    <instancedMesh ref={ref} args={[null, mat, screens.length]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  )
}

/* ───────────── Река с отражениями огней ───────────── */
function River() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uFog: { value: HORIZON } },
    vertexShader: `varying vec3 vW; void main(){ vec4 wp = modelMatrix*vec4(position,1.); vW = wp.xyz; gl_Position = projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `uniform float uTime; uniform vec3 uFog; varying vec3 vW;
      ${GLSL_COMMON}
      void main(){
        float d = -vW.z;
        vec3 col = vec3(0.02,0.03,0.055);
        // вертикальные дорожки отражений дальнего берега
        float colId = floor(vW.x / 1.6);
        float on = step(0.45, h1(vec2(colId, 3.0)));
        vec3 rc = h1(vec2(colId, 7.0)) < 0.6 ? vec3(1.0,0.7,0.4) : (h1(vec2(colId, 9.0)) < 0.5 ? vec3(0.5,0.8,1.0) : vec3(1.0,0.4,0.7));
        float ripple = vnoise(vec2(vW.x*1.4, vW.z*2.2 + uTime*0.9));
        float streak = on * smoothstep(0.35, 0.85, ripple) * smoothstep(8.0, 60.0, d) * (1.0 - smoothstep(90.0, 140.0, d));
        col += rc * streak * 0.55;
        // лунная дорожка
        col += vec3(0.7,0.7,0.8) * smoothstep(0.55, 0.9, vnoise(vec2(vW.x*0.8, vW.z*3.0 - uTime*1.2))) * 0.08;
        col = mix(col, toGamma(uFog), smoothstep(20.0, 170.0, d) * 0.75);
        gl_FragColor = vec4(toLinear(col), 1.0);
      }`,
  }), [])
  useFrame((_, dt) => { mat.uniforms.uTime.value += dt })
  const w = RIVER[1] - RIVER[0] + 8
  const posts = useMemo(() => { const a = []; for (let x = RIVER[0] - 2; x < RIVER[1] + 2; x += 7) a.push(x); return a }, [])
  return (
    <>
      <mesh position={[(RIVER[0] + RIVER[1]) / 2, GROUND + 0.05, -90]} rotation-x={-Math.PI / 2} material={mat}>
        <planeGeometry args={[w, 200]} />
      </mesh>
      {/* фонари моста */}
      {posts.map((x) => (
        <group key={x} position={[x, 0, -2.45]}>
          <mesh position={[0, 0.9, 0]}><boxGeometry args={[0.08, 2.6, 0.08]} /><meshBasicMaterial color="#1c1f26" /></mesh>
          <mesh position={[0, 2.25, 0.1]}><boxGeometry args={[0.35, 0.1, 0.18]} /><meshBasicMaterial color={[3, 2.2, 1.2]} toneMapped={false} /></mesh>
        </group>
      ))}
    </>
  )
}

/* ───────────── Проспект: машины и фонари ───────────── */
function Street({ lite }) {
  const count = lite ? 24 : 48
  const cars = useMemo(() => {
    const r = rng(3)
    return Array.from({ length: count }, (_, i) => ({ lane: i % 2, off: r() * 300, speed: 8 + r() * 7 }))
  }, [count])
  const ref = useRef()
  const m = useMemo(() => new THREE.Matrix4(), [])
  useLayoutEffect(() => {
    const col = new THREE.Color()
    cars.forEach((c, i) => ref.current.setColorAt(i, col.set(c.lane ? '#ff3b30' : '#fff1d0').multiplyScalar(2.4)))
    ref.current.instanceColor.needsUpdate = true
  }, [cars])
  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime
    cars.forEach((c, i) => {
      const dir = c.lane ? 1 : -1
      const span = 300
      const x = ((c.off + dir * t * c.speed) % span + span) % span - span / 2 + camera.position.x
      const hide = inRiver(x, 3) ? 0 : 1
      m.makeScale(1.1 * hide, 0.22 * hide, 1).setPosition(x, GROUND + 0.35, c.lane ? -25 : -27.5)
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  const lamps = useMemo(() => { const a = []; for (let x = X_MIN; x < X_MAX; x += 11) if (!inRiver(x, 4)) a.push(x); return a }, [])
  const glowTex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128
    const g = c.getContext('2d')
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grd.addColorStop(0, 'rgba(255,190,110,0.9)'); grd.addColorStop(0.4, 'rgba(255,160,80,0.25)'); grd.addColorStop(1, 'rgba(255,140,60,0)')
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128)
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  const place = (arr, fn) => (el) => {
    if (!el) return
    const mm = new THREE.Matrix4()
    arr.forEach((x, i) => { fn(mm, x); el.setMatrixAt(i, mm) })
    el.instanceMatrix.needsUpdate = true
  }
  return (
    <>
      <instancedMesh ref={ref} args={[null, null, count]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh position={[(X_MIN + X_MAX) / 2, GROUND, -40]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[X_MAX - X_MIN + 300, 90]} />
        <meshBasicMaterial color="#07080c" />
      </mesh>
      {/* фонари */}
      <instancedMesh args={[null, null, lamps.length]} frustumCulled={false} ref={place(lamps, (mm, x) => mm.makeScale(0.1, 4, 0.1).setPosition(x, GROUND + 2, -23.4))}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#15171d" />
      </instancedMesh>
      <instancedMesh args={[null, null, lamps.length]} frustumCulled={false} ref={place(lamps, (mm, x) => mm.makeScale(0.6, 0.12, 0.3).setPosition(x, GROUND + 4, -23.6))}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={[3.2, 2.1, 1.1]} toneMapped={false} />
      </instancedMesh>
      <instancedMesh args={[null, null, lamps.length]} frustumCulled={false}
        ref={place(lamps, (mm, x) => mm.compose(new THREE.Vector3(x, GROUND + 0.06, -25), new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), new THREE.Vector3(9, 7, 1)))}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </>
  )
}

/* ───────────── Ориентиры: телебашня и колесо обозрения ───────────── */
function Tower() {
  const geo = useMemo(() => {
    const cyl = new THREE.CylinderGeometry(1.2, 6, 78, 4, 8, true)
    return new THREE.EdgesGeometry(cyl)
  }, [])
  const beacon = useRef()
  useFrame(({ clock }) => { beacon.current.visible = Math.sin(clock.elapsedTime * 1.6) > 0 })
  return (
    <group position={[258, GROUND + 39, -118]}>
      <lineSegments geometry={geo}><lineBasicMaterial color={[2.2, 1.1, 0.5]} toneMapped={false} fog={false} /></lineSegments>
      {[10, 26, 44].map((y, i) => (
        <mesh key={y} position={[0, y - 39, 0]}><cylinderGeometry args={[4.6 - i * 1.1, 4.6 - i * 1.1, 1.6, 16]} /><meshBasicMaterial color={[1.6, 1.3, 1.0]} toneMapped={false} fog={false} /></mesh>
      ))}
      <mesh ref={beacon} position={[0, 40, 0]}><sphereGeometry args={[0.6, 12, 8]} /><meshBasicMaterial color={[4, 0.3, 0.2]} toneMapped={false} fog={false} /></mesh>
    </group>
  )
}

function FerrisWheel() {
  const wheel = useRef()
  const rim = useRef()
  const N = 24, R = 13
  const col = useMemo(() => new THREE.Color(), [])
  useFrame(({ clock }, dt) => {
    wheel.current.rotation.z -= dt * 0.05
    col.setHSL((clock.elapsedTime * 0.04) % 1, 0.85, 0.6).multiplyScalar(2.2)
    rim.current.color.copy(col)
  })
  return (
    <group position={[676, GROUND + 18, -70]}>
      {/* опоры */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 4.2, -8, -0.6]} rotation-z={s * 0.28}><boxGeometry args={[0.35, 17, 0.35]} /><meshBasicMaterial color="#1a1c22" /></mesh>
      ))}
      <group ref={wheel}>
        <mesh><torusGeometry args={[R, 0.14, 8, 96]} /><meshBasicMaterial ref={rim} toneMapped={false} /></mesh>
        <mesh><torusGeometry args={[R * 0.93, 0.06, 6, 96]} /><meshBasicMaterial color={[1.6, 1.6, 1.8]} toneMapped={false} /></mesh>
        <mesh><torusGeometry args={[1.2, 0.3, 8, 24]} /><meshBasicMaterial color={[2, 1.6, 1.2]} toneMapped={false} /></mesh>
        {Array.from({ length: N }, (_, i) => {
          const a = (i / N) * Math.PI * 2
          return (
            <group key={i} rotation-z={a}>
              <mesh position={[R / 2, 0, 0]}><boxGeometry args={[R, 0.05, 0.05]} /><meshBasicMaterial color="#6d6f78" /></mesh>
              <mesh position={[R + 0.6, 0, 0]}><boxGeometry args={[0.8, 0.8, 0.6]} /><meshBasicMaterial color={i % 3 === 0 ? [2.4, 1.2, 1.6] : [2, 1.7, 1.1]} toneMapped={false} /></mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

function Shops({ shops }) {
  const ref = useRef()
  useLayoutEffect(() => {
    if (!shops.length) return
    const m = new THREE.Matrix4(), c = new THREE.Color()
    shops.forEach((s, i) => {
      m.makeScale(s.w, 2.1, 1).setPosition(s.x, GROUND + 1.4, s.z)
      ref.current.setMatrixAt(i, m)
      ref.current.setColorAt(i, c.set(s.warm ? '#ffcf8a' : '#cfe8ff').multiplyScalar(1.15))
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
  }, [shops])
  if (!shops.length) return null
  return (
    <instancedMesh ref={ref} args={[null, null, shops.length]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

export default function City({ lite, fontsReady }) {
  const data = useMemo(() => generate(lite), [lite])
  return (
    <>
      <Buildings list={data.buildings} />
      <Roofs houses={data.houses} tanks={data.tanks} antennas={data.antennas} />
      <Neon signs={data.signs} fontsReady={fontsReady} />
      <Screens screens={data.screens} />
      <Shops shops={data.shops} />
      <River />
      <Street lite={lite} />
      <Tower />
      <FerrisWheel />
    </>
  )
}
