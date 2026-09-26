# Степан Рюмин — сайт-резюме

Vite + React + react-three-fiber + GSAP ScrollTrigger + Lenis.

```bash
npm i
npm run dev          # локально
npm run build        # прод-сборка в dist/ (для Vercel)
npm run build:single # один index.html
```

Концепт: ночная электричка по Осаке. Скролл двигает поезд, разделы резюме — станции линии «Рюмин».

Тексты RU/EN и станции: `src/content.js`. 3D-город и станции: `src/components/TrainWorld.jsx`. Салон вагона и петли: `src/components/Interior.jsx`. Логика поезда (скролл → пружина): `src/App.jsx`. Обложки проектов: `src/components/Wagara.jsx`. Мокрое стекло, дождь, дымка, встречный поезд: `src/components/Atmosphere.jsx`. Погода и цвет районов по маршруту: `src/store.js`.

Деплой: Railway (сервис из этого репозитория, Railpack собирает Vite и раздаёт `dist`). Каждый пуш в `main` — новый деплой.

Отладка: `?debug` в адресе открывает `window.__store` и `window.__train`.
