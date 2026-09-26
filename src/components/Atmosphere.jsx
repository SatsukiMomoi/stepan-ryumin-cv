import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Effect, EffectAttribute } from 'postprocessing'
import { store, STATION_GAP, rainAt, tintAt, TINT_GLSL } from '../store'
import { GLSL_COMMON, X_MIN, X_MAX, rng } from './City'

const GROUND = -8
export const weather = { uRain: { value: 0 }, uTime: { value: 0 } }
const TRACK2_Z = -10 // соседний путь за платформами

/* ───────────── Мокрое стекло ─────────────
   Один проход: боке-размытие города (фокус на стекле), размытие в движении по глубине,
   капли-линзы с перевёрнутым отражением, стекающие дорожки, горизонтальные струи на ходу,
   запотевание и отражение ламп салона. */
const GLASS_FRAG = /* glsl */ `
uniform float uRain, uBlur, uMotion, uPhaseV, uPhaseH, uSpeed, uDir, uTime;

float h21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }

// неподвижные капли: появляются и высыхают
vec3 beads(vec2 p, float scale, float density){
  vec2 g = p * scale;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = h21(id);
  if (h > density) return vec3(0.0);
  vec2 c = (vec2(h21(id + 3.1), h21(id + 7.7)) - 0.5) * 0.5;
  float life = fract(uTime * 0.035 + h * 13.0);
  float r = mix(0.1, 0.3, h21(id + 11.3)) * smoothstep(0.0, 0.06, life) * smoothstep(1.0, 0.8, life);
  if (r < 0.01) return vec3(0.0);
  vec2 d = f - c;
  float m = smoothstep(r, r * 0.6, length(d));
  return vec3(d / max(r, 1e-3) * m, m);
}

// стекающая капля со шлейфом мелких бусин; ячейка вытянута по направлению движения
vec3 slide(vec2 q, float scale, float phase, float density, inout float wipe){
  const float ASP = 3.0;
  vec2 g = vec2(q.x * scale, q.y * scale / ASP);
  vec2 id = floor(g);
  vec2 f = fract(g);
  float h = h21(id + 0.5);
  if (h > density) return vec3(0.0);
  float y = 1.0 - fract(phase * (0.22 + 0.3 * h21(id + 5.3)) + h * 4.0);
  float x = 0.3 + 0.4 * h21(id + 1.7) + sin(f.y * 9.0 + h * 6.28) * 0.035;
  vec2 d = vec2(f.x - x, (f.y - y) * ASP);
  float r = 0.15;
  float m = smoothstep(r, r * 0.55, length(d * vec2(1.0, 0.8)));
  vec2 n = d / r * m;
  if (f.y > y) {
    float ty = (f.y - y) * ASP;
    float seg = ty * 3.2;
    vec2 td = vec2(f.x - x, (fract(seg) - 0.5) / 3.2);
    float tr = 0.055 * (1.0 - smoothstep(0.0, 2.6, ty)) * step(0.45, h21(id + floor(seg)));
    float tm = tr > 0.002 ? smoothstep(tr, tr * 0.45, length(td)) : 0.0;
    n += td / max(tr, 1e-3) * tm;
    m = max(m, tm);
    wipe = max(wipe, smoothstep(0.13, 0.05, abs(f.x - x)) * (1.0 - smoothstep(0.0, 3.0, ty)));
  }
  return vec3(n, m);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor){
  float dist = max(-getViewZ(depth), 1.0);
  float motion = min(uMotion / dist, 0.03);
  if (uRain < 0.005 && uBlur < 0.0003 && motion < 0.0004) { outputColor = inputColor; return; }

  // ── капли ──
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec3 drops = vec3(0.0);
  float wipe = 0.0;
  if (uRain > 0.005) {
    float wv = 1.0 - smoothstep(0.08, 0.55, uSpeed);
    float wh = smoothstep(0.05, 0.45, uSpeed);
    if (wv > 0.01) drops += slide(p, 9.0, uPhaseV, uRain * 0.6, wipe) * wv;
    if (wh > 0.01) {
      vec2 u = -normalize(vec2(-uDir, -0.22));
      vec2 side = vec2(u.y, -u.x);
      vec3 s = slide(vec2(dot(p, side), dot(p, u)), 13.0, uPhaseH, uRain * 0.75, wipe);
      drops += vec3(s.x * side + s.y * u, s.z) * wh;
    }
    float keep = 1.0 - wipe;
    drops += beads(p, 20.0, uRain * 0.3) * keep;
    drops += beads(p + 7.3, 42.0, uRain * 0.32) * keep;
  }
  float M = clamp(drops.z, 0.0, 1.0);
  vec2 N = drops.xy;

  // ── боке + смаз по глубине ──
  vec3 bg = inputColor.rgb;
  vec2 rad = vec2(uBlur / aspect + motion, uBlur);
  if (rad.x > 0.0004 || rad.y > 0.0004) {
    vec3 acc = vec3(0.0); float ws = 0.0;
    float jit = h21(uv * resolution + fract(uTime) * 17.0) * 6.2832;
    for (int i = 0; i < TAPS; i++) {
      float fi = float(i) + 0.5;
      float a = fi * 2.39996 + jit;
      float rr = sqrt(fi / float(TAPS));
      vec3 c = texture2D(inputBuffer, uv + vec2(cos(a), sin(a)) * rr * rad).rgb;
      float w = 1.0 + dot(c, vec3(0.3, 0.59, 0.11)) * 4.0;
      acc += c * w; ws += w;
    }
    bg = acc / ws;
  }

  // ── линза капли: резкая перевёрнутая картинка ──
  vec3 col = bg;
  if (M > 0.001) {
    vec2 duv = uv - N * vec2(1.0 / aspect, 1.0) * 0.032;
    vec3 dc = vec3(0.0);
    for (int j = 0; j < 4; j++) {
      float t = float(j) / 3.0 - 0.5;
      dc += texture2D(inputBuffer, duv + vec2(t * motion * 0.6, 0.0)).rgb;
    }
    dc = mix(dc * 0.25, bg, 0.35) * 1.12;
    vec2 nn = N / max(M, 1e-3);
    float spec = smoothstep(0.5, 0.0, length(nn - vec2(-0.35, 0.5)));
    float rim = M * (1.0 - M) * 4.0;
    dc = dc * (1.0 - rim * 0.22) + vec3(0.9, 0.95, 1.0) * spec * M * 0.3;
    col = mix(bg, dc, M);
  }

  // ── запотевание и отражение ламп салона в стекле ──
  float lum = dot(col, vec3(0.3, 0.59, 0.11));
  col += vec3(0.008, 0.009, 0.012) * uRain * (1.0 - M);
  float ly = uv.y - 0.795;
  float lamp = exp(-ly * ly * 7000.0) * 0.035 + exp(-ly * ly * 300.0) * 0.009;
  col += vec3(1.0, 0.97, 0.9) * lamp * (1.0 - smoothstep(0.0, 0.3, lum));
  outputColor = vec4(col, inputColor.a);
}
`

class GlassEffect extends Effect {
  constructor(lite) {
    super('Glass', GLASS_FRAG, {
      attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
      defines: new Map([['TAPS', lite ? '9' : '18']]),
      uniforms: new Map(['uRain', 'uBlur', 'uMotion', 'uPhaseV', 'uPhaseH', 'uSpeed', 'uTime'].map((k) => [k, new THREE.Uniform(0)]).concat([['uDir', new THREE.Uniform(1)]])),
    })
  }
}

export function Glass({ lite }) {
  const effect = useMemo(() => new GlassEffect(lite), [lite])
  const s = useRef({ rain: rainAt(0), blur: 0, motion: 0, speed: 0, pv: 0, ph: 0, dir: 1 })
  if (typeof location !== 'undefined' && location.search.includes('debug')) window.__glass = { S: s.current, u: effect.uniforms }
  useFrame((_, dt) => {
    const u = effect.uniforms
    const S = s.current
    const { x, v } = store.train
    const speedN = Math.min(Math.abs(v) / 40, 1)
    S.speed += (speedN - S.speed) * Math.min(1, dt * 3)
    S.rain += (rainAt(x) - S.rain) * Math.min(1, dt * 0.7)
    // фокус «наезжает» на город при остановке и уходит на стекло при разгоне
    const blurTarget = S.rain * (0.0022 + 0.0105 * S.speed) + S.speed * 0.0016
    S.blur += (blurTarget - S.blur) * Math.min(1, dt * 2.2)
    S.motion += (Math.abs(v) * 0.0055 - S.motion) * Math.min(1, dt * 7)
    S.pv += dt * (1 - 0.7 * S.speed)
    S.ph += dt * (0.6 + 3.2 * S.speed)
    if (Math.abs(v) > 3) S.dir = Math.sign(v)
    u.get('uRain').value = store.reduced ? S.rain * 0.6 : S.rain
    u.get('uBlur').value = S.blur
    u.get('uMotion').value = S.motion
    u.get('uSpeed').value = S.speed
    u.get('uPhaseV').value = S.pv
    u.get('uPhaseH').value = S.ph
    u.get('uDir').value = S.dir
    u.get('uTime').value += dt
    weather.uRain.value = S.rain
    weather.uTime.value += dt
  })
  return <primitive object={effect} dispose={null} />
}

/* ───────────── Цветная дымка по районам: засветка города снизу ───────────── */
export function Haze({ lite }) {
  const layers = lite
    ? [{ z: -30, h: 10, a: 0.03 }, { z: -82, h: 30, a: 0.045 }]
    : [{ z: -30, h: 10, a: 0.025 }, { z: -82, h: 30, a: 0.035 }, { z: -168, h: 70, a: 0.028 }]
  const mats = useMemo(() => layers.map((L) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: true,
    uniforms: { uTime: { value: 0 }, uRain: { value: 0 }, uA: { value: L.a }, uH: { value: L.h } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }',
    fragmentShader: `uniform float uTime, uRain, uA, uH; varying vec3 vW;
      ${GLSL_COMMON}
      ${TINT_GLSL}
      void main(){
        float y = vW.y - (${GROUND.toFixed(1)});
        float n = fbm(vec2(vW.x * 0.016 + uTime * 0.01, y * 0.035 - uTime * 0.005));
        float a = uA * exp(-y / uH) * (0.45 + 1.1 * n) * (1.0 + uRain * 0.9);
        gl_FragColor = vec4(toLinear(tintAt(vW.x)) * a, 1.0);
      }`,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })), [lite])
  useFrame((_, dt) => {
    const r = rainAt(store.train.x)
    mats.forEach((m) => { m.uniforms.uTime.value += dt; m.uniforms.uRain.value += (r - m.uniforms.uRain.value) * Math.min(1, dt) })
  })
  const W = X_MAX - X_MIN + 500
  return layers.map((L, i) => (
    <mesh key={L.z} position={[(X_MIN + X_MAX) / 2, GROUND + 60, L.z]} material={mats[i]} frustumCulled={false} renderOrder={1}>
      <planeGeometry args={[W, 120]} />
    </mesh>
  ))
}

/* ───────────── Дождь снаружи: косые струи, светятся цветом района ───────────── */
export function RainField({ lite }) {
  const count = lite ? 700 : 2200
  const geo = useMemo(() => {
    const base = new THREE.PlaneGeometry(0.014, 0.6)
    const g = new THREE.InstancedBufferGeometry()
    g.index = base.index
    g.setAttribute('position', base.getAttribute('position'))
    g.setAttribute('uv', base.getAttribute('uv'))
    const r = rng(77)
    const off = new Float32Array(count * 3), seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      off[i * 3] = (r() - 0.5) * 60
      off[i * 3 + 1] = r() * 16
      off[i * 3 + 2] = -1.8 - Math.pow(r(), 1.5) * 34
      seed[i] = r()
    }
    g.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 3))
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1))
    g.instanceCount = count
    return g
  }, [count])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { uTime: { value: 0 }, uCamX: { value: 0 }, uRain: { value: 0 }, uShear: { value: 0 }, uFade: { value: 1 }, uTint: { value: new THREE.Color(1, 1, 1) } },
    vertexShader: `attribute vec3 aOff; attribute float aSeed;
      uniform float uTime, uCamX, uRain, uShear, uFade;
      varying vec2 vUv; varying float vA; varying float vD;
      void main(){
        vec3 o = aOff;
        o.y = mod(o.y - uTime * (13.0 + aSeed * 6.0), 16.0) - 6.5;
        o.x = uCamX + mod(o.x - uCamX + 30.0, 60.0) - 30.0;
        float len = 1.0 + aSeed * 0.8;
        vec3 pos = o + vec3(position.x + position.y * len * uShear, position.y * len, 0.0);
        vUv = uv; vD = -o.z;
        vA = step(aSeed, uRain) * (0.35 + 0.65 * aSeed) * uFade;
        gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
      }`,
    fragmentShader: `uniform vec3 uTint; varying vec2 vUv; varying float vA; varying float vD;
      void main(){
        float a = vA * smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.65, vUv.y) * (1.0 - smoothstep(8.0, 36.0, vD));
        gl_FragColor = vec4(mix(vec3(0.6, 0.66, 0.8), uTint, 0.45) * a * 0.6, 1.0);
      }`,
  }), [])
  useFrame(({ camera }, dt) => {
    const u = mat.uniforms
    u.uTime.value += dt
    u.uCamX.value = camera.position.x
    const v = store.train.v
    u.uShear.value += (-v * 0.035 - u.uShear.value) * Math.min(1, dt * 4)
    u.uFade.value = 1 - 0.55 * Math.min(Math.abs(v) / 40, 1)
    u.uRain.value += (rainAt(store.train.x) * 0.95 - 0.12 - u.uRain.value) * Math.min(1, dt)
    const t = tintAt(store.train.x)
    u.uTint.value.setRGB(t[0], t[1], t[2])
  })
  return <mesh geometry={geo} material={mat} frustumCulled={false} renderOrder={2} />
}

/* ───────────── Соседний путь и встречная электричка ───────────── */
const LEN = 120
export function Oncoming() {
  const train = useRef()
  const S = useRef({ active: false, x: 0, fired: new Set() })
  const bodyMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uLen: { value: LEN } },
    vertexShader: 'varying vec3 vL; varying vec3 vN; void main(){ vL = position; vN = normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uLen; varying vec3 vL; varying vec3 vN;
      void main(){
        float y = vL.y + 0.5;
        vec3 col = vec3(0.075, 0.08, 0.09) + vec3(0.03) * y;
        if (abs(vN.z) > 0.5) {
          float x = (vL.x + 0.5) * uLen;
          float car = fract(x / 20.0);
          float gap = step(car, 0.015) + step(0.985, car);
          float door = step(abs(fract(car * 3.0) - 0.5), 0.07);
          float win = step(0.46, y) * step(y, 0.78) * step(0.14, fract(x / 2.4)) * (1.0 - door);
          float dwin = door * step(0.34, y) * step(y, 0.78);
          // салон встречного: тёплые/холодные вагоны, тёмные силуэты пассажиров
          float cid = floor(x / 20.0);
          float hc = fract(sin(cid * 91.7) * 4375.5);
          vec3 lightC = mix(vec3(0.62, 0.66, 0.72), vec3(0.72, 0.6, 0.45), step(0.6, hc));
          float wid = floor(x / 2.4);
          float pax = step(0.55, fract(sin(wid * 12.9 + cid) * 7531.3)) * smoothstep(0.62, 0.5, y) * step(0.46, y);
          col += lightC * max(win, dwin * 0.75) * (1.0 - gap) * (1.0 - pax * 0.75) * (0.8 + 0.2 * fract(sin(wid * 3.1) * 931.7));
          col += vec3(0.4, 0.06, 0.05) * step(0.3, y) * step(y, 0.35) * (1.0 - gap);
          col *= 1.0 - gap * 0.8;
        } else if (vN.x < -0.5) {
          vec2 q = vec2(vL.z, y);
          float lights = smoothstep(0.1, 0.06, length(q - vec2(-0.3, 0.25))) + smoothstep(0.1, 0.06, length(q - vec2(0.3, 0.25)));
          col += vec3(3.0, 2.8, 2.4) * lights + vec3(0.3, 0.35, 0.45) * step(0.5, y) * step(y, 0.85);
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
  }), [])
  useFrame((_, dt) => {
    const { x, v } = store.train
    const st = S.current
    const seg = Math.floor(x / STATION_GAP)
    const frac = x / STATION_GAP - seg
    if (!st.active && v > 10 && (seg === 1 || seg === 4) && frac > 0.15 && frac < 0.55 && !st.fired.has(seg)) {
      st.active = true; st.x = x + 48; st.fired.add(seg)
    }
    for (const s of st.fired) if (x < s * STATION_GAP + 4) st.fired.delete(s)
    if (st.active) {
      st.x -= 52 * dt
      if (st.x + LEN < x - 45) st.active = false
    }
    train.current.visible = st.active
    train.current.position.x = st.x + LEN / 2
  })

  // эстакада соседнего пути: настил, опоры, оранжевые огни обслуживания
  const piers = useMemo(() => { const a = []; for (let x = X_MIN; x < X_MAX; x += 22) a.push(x); return a }, [])
  const lamps = useMemo(() => { const a = []; for (let x = X_MIN; x < X_MAX; x += 9) a.push(x); return a }, [])
  const place = (arr, fn) => (el) => {
    if (!el) return
    const m = new THREE.Matrix4()
    arr.forEach((x, i) => { fn(m, x); el.setMatrixAt(i, m) })
    el.instanceMatrix.needsUpdate = true
  }
  return (
    <>
      <mesh position={[(X_MIN + X_MAX) / 2, -0.55, TRACK2_Z]}>
        <boxGeometry args={[X_MAX - X_MIN, 0.5, 2.8]} />
        <meshBasicMaterial color="#101217" />
      </mesh>
      <mesh position={[(X_MIN + X_MAX) / 2, -0.28, TRACK2_Z + 1.42]}>
        <boxGeometry args={[X_MAX - X_MIN, 0.05, 0.04]} />
        <meshBasicMaterial color="#3a3e48" />
      </mesh>
      <instancedMesh args={[null, null, piers.length]} frustumCulled={false} ref={place(piers, (m, x) => m.makeScale(0.9, 7.4, 0.9).setPosition(x, GROUND + 3.7, TRACK2_Z))}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#0d0f13" />
      </instancedMesh>
      <instancedMesh args={[null, null, lamps.length]} frustumCulled={false} ref={place(lamps, (m, x) => m.makeScale(0.12, 0.06, 0.05).setPosition(x, -0.42, TRACK2_Z + 1.43))}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={[2.6, 1.2, 0.35]} toneMapped={false} />
      </instancedMesh>
      <mesh ref={train} position={[0, 1.3, TRACK2_Z]} scale={[LEN, 3.1, 2.3]} material={bodyMat} visible={false} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </>
  )
}

/* ───────────── Мокрая платформа: отражения ламп навеса и автоматов ───────────── */
export const wetFloorMaterial = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  uniforms: weather,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform float uRain, uTime; varying vec2 vUv;
    ${GLSL_COMMON}
    void main(){
      float x = (vUv.x - 0.5) * 60.0;
      float puddle = smoothstep(0.35, 0.75, fbm(vec2(x * 0.35, vUv.y * 2.5)));
      float ripple = 0.85 + 0.15 * sin(vnoise(vec2(x * 3.0, vUv.y * 20.0 + uTime * 2.0)) * 6.28);
      // отражения двух ламповых линий, вытянутые к зрителю
      float l1 = exp(-pow((vUv.y - 0.174) / (vUv.y < 0.174 ? 0.09 : 0.025), 2.0));
      float l2 = exp(-pow((vUv.y - 0.739) / (vUv.y < 0.739 ? 0.16 : 0.035), 2.0));
      vec3 col = vec3(1.0, 0.95, 0.85) * (l1 * 0.16 + l2 * 0.12) * mix(0.04, 1.0, puddle) * ripple;
      // автоматы: холодные и красный
      float far = smoothstep(0.45, 1.0, vUv.y);
      col += vec3(0.6, 0.8, 1.0) * exp(-pow((x + 10.45) / 0.9, 2.0)) * far * 0.5 * puddle;
      col += vec3(1.0, 0.25, 0.2) * exp(-pow((x - 20.0) / 0.5, 2.0)) * far * 0.45 * puddle;
      col *= 0.25 + 0.75 * uRain;
      gl_FragColor = vec4(col, 1.0);
    }`,
})
