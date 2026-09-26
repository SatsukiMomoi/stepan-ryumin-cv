// Общее состояние между скроллом, «физикой» поезда и WebGL — без ререндеров React
export const STATION_GAP = 120
export const stationX = (i) => i * STATION_GAP

export const store = {
  progress: 0,
  velocity: 0,
  mouse: { x: 0.5, y: 0.5 },
  train: { x: 0, v: 0, a: 0, target: 0 },
  loops: new Set(), // покадровые подписчики общего тикера
  render: null,     // кадр WebGL
  reduced: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  touch: typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches,
}

// Погода и свет по маршруту: общие для WebGL и салона
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

// лёгкая морось на старте → ливень в центре → проясняется к конечной
export const rainAt = (x) => (0.3 + 0.7 * sm(60, 200, x)) * (1 - 0.8 * sm(600, 715, x))

// цвет района: жилой (тёплый) → центр (холодный) → река → неон → залив
const TINT = { res: [1, 0.62, 0.35], down: [0.45, 0.62, 1], river: [0.3, 0.82, 0.9], neon: [1, 0.3, 0.68], bay: [0.72, 0.45, 1] }
export function tintAt(x) {
  let c = TINT.res
  c = mix3(c, TINT.down, sm(80, 140, x))
  c = mix3(c, TINT.river, sm(380, 420, x))
  c = mix3(c, TINT.neon, sm(440, 470, x))
  c = mix3(c, TINT.bay, sm(630, 690, x))
  return c
}
export const TINT_GLSL = `
vec3 tintAt(float x){
  vec3 c = vec3(1.0, 0.62, 0.35);
  c = mix(c, vec3(0.45, 0.62, 1.0), smoothstep(80.0, 140.0, x));
  c = mix(c, vec3(0.3, 0.82, 0.9), smoothstep(380.0, 420.0, x));
  c = mix(c, vec3(1.0, 0.3, 0.68), smoothstep(440.0, 470.0, x));
  c = mix(c, vec3(0.72, 0.45, 1.0), smoothstep(630.0, 690.0, x));
  return c;
}
`
export const nearStation = (x) => { const d = Math.abs(x - Math.round(x / STATION_GAP) * STATION_GAP); return 1 - sm(0, 45, d) }
