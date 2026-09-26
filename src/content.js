// Весь текст сайта. RU / EN.
export const contacts = {
  email: 'sr89031921416@gmail.com',
  telegram: 'https://t.me/apetilt',
  telegramHandle: '@apetilt',
  github: 'https://github.com/SatsukiMomoi',
  githubHandle: 'SatsukiMomoi',
}

export const content = {
  ru: {
    nav: { contact: 'Связаться', chapters: ['Начало', 'Профиль', 'Опыт', 'Проекты', 'Стек', 'Учёба', 'Связь'] },
    loader: 'Загрузка',
    hero: {
      first: 'Степан',
      last: 'Рюмин',
      role: ['AI-интегратор и Python-разработчик', 'Telegram-боты, Mini Apps, LLM-сервисы'],
      lead: 'Собираю AI-продукты целиком: от архитектуры до продакшена.',
      scroll: 'Листайте, чтобы поехать',
      seal: '履歴書',
      sealNote: 'рирэкисё — «резюме» по-японски',
    },
    profile: {
      title: 'Профиль',
      statement:
        'Из задачи быстро получается рабочий сервис: бот, Mini App или API с подключённой LLM. Полтора года в платёжном процессинге научили сначала понять, зачем бизнесу инструмент, и только потом его строить.',
      strengthsTitle: 'Сильные стороны',
      strengths: [
        { t: 'Полный цикл в одиночку', d: 'Требования, архитектура, бэкенд, фронтенд, деплой и поддержка без посредников между мной и пользователями.' },
        { t: 'LLM изнутри', d: 'RAG с векторным поиском и оценкой retrieval, managed и self-hosted инференс, промпты до стабильного результата.' },
        { t: 'Понимание бизнеса', d: 'Платёжные флоу, инциденты у PSP, метрики из операционных баз. Инструменты, которыми пользуются каждый день.' },
        { t: 'Слово и сюжет', d: 'Сценарии вирусных роликов, античная филология, четыре языка. Умею объяснить продукт так, чтобы его захотели.' },
      ],
    },
    experience: {
      title: 'Опыт',
      jobs: [
        {
          company: 'Мармеладыч',
          about: 'Бренд сладостей, выросший на вирусном контенте',
          role: 'Сценарист',
          period: 'С сентября 2026 — сейчас',
          points: [
            'Писал сценарии коротких роликов для соцсетей бренда: абсурдный юмор, быстрый монтаж, аудитория 9–14 лет.',
            'Работал в формате, который превратил контент в главный канал продаж компании.',
          ],
          facts: [
            { v: '8+ млн', l: 'подписчиков в соцсетях бренда' },
            { v: '1+ млрд ₽', l: 'выручка компании в 2025 году' },
            { v: '2+ млн', l: 'наборов сладостей продано за 2025 год' },
          ],
          source: 'Данные компании: Forbes, 2025–2026',
        },
        {
          company: 'Paycrown',
          about: 'Платёжный процессинг и партнёрская инфраструктура, iGaming',
          role: 'Интегратор AI-сервисов, автоматизация внутренних процессов',
          period: 'Осень 2024 — май 2026',
          points: [
            'Развернул LLM-ассистента поверх базы знаний компании: чанкинг, эмбеддинги, векторный поиск, оценка retrieval на реальных вопросах сотрудников.',
            'Расследовал инциденты платёжных интеграций до root cause: сырые HTTP-запросы, вебхуки PSP, коды ошибок, переписка с вендором.',
            'Собрал событийную систему алертов с приоритизацией: команда реагирует, а не мьютит.',
            'Построил лёгкий BI-слой на SQL и pandas прямо из операционной CRM, без отдельного BI-инструмента.',
            'Перевёл размытые критерии качества поддержки в проверяемые правила для автоматического QA.',
          ],
        }
      ],
    },
    projects: {
      title: 'Проекты',
      hint: 'Свои продукты и заказы, которые работают в проде',
      items: [
        { name: 'Sizzhka', kind: 'Ресейл-канал и Mini App', d: 'Каталог Telegram-канала на ~24 тыс. подписчиков с AI-примеркой одежды. Парсер Telethon, фид автозагрузки на Авито, эксперимент с self-hosted CatVTON на RunPod.', stack: ['aiogram', 'FastAPI', 'FASHN', 'Cloudflare R2', 'Railway'], pattern: 'asanoha' },
        { name: 'OV.PRJCT', kind: 'Каталог-бот и Mini App', d: 'Каталог винтажного ресейла для канала на ~9 тыс. подписчиков: автопарсинг постов каждый час, фильтры по категориям, сортировка по цене.', stack: ['Telethon', 'FastAPI', 'React', 'Railway'], pattern: 'kikko' },
        { name: 'Тренировочка', kind: 'AI фитнес-дневник', d: 'Mini App с AI-тренером. Перенёс с Timeweb на Railway, подключил Neon, переделал интерфейс из «калькулятора» в дневник премиум-уровня.', stack: ['aiogram 3', 'FastAPI', 'React/Vite', 'Neon'], pattern: 'ichimatsu' },
        { name: 'Фото-бот', kind: 'Заказ: автоматизация каталога', d: 'Пакетная обработка фото товаров через Gemini по сценарию для каждой категории и автогенерация текста поста. Остаётся вписать размер и цену.', stack: ['Gemini Batch', 'aiogram', 'Railway'], pattern: 'yagasuri' },
        { name: 'Конспект', kind: 'Лекция в конспект', d: 'Полуторачасовая аудиозапись лекции превращается в структурированный конспект: транскрипция Whisper, затем суммаризация Claude.', stack: ['Python', 'Whisper v3', 'Anthropic API'], pattern: 'shippo' },
        { name: 'Восхождение', kind: 'Кинематографичный сайт', d: 'Путешествие камеры в стиле укиё-э: долина, кедровый лес, облака, вершина. Процедурный синтоистский храм собран в Blender скриптами на Python.', stack: ['Three.js', 'GSAP', 'Blender bpy', 'Replicate'], pattern: 'seigaiha' },
      ],
    },
    skills: {
      title: 'Стек',
      groups: [
        { g: 'Python', i: 'asyncio, aiogram 3, FastAPI и Pydantic, парсеры, REST, полный цикл Mini App с фронтендом на React/Vite' },
        { g: 'AI и LLM', i: 'Anthropic API, Replicate, RunPod Serverless, RAG, эмбеддинги, eval retrieval, prompt engineering, виртуальная примерка (FASHN, CatVTON)' },
        { g: 'Интеграции', i: 'REST, JSON, вебхуки, колбэки платёжных провайдеров, событийные триггеры, Telegram Bot API' },
        { g: 'Инфраструктура', i: 'Railway, Cloudflare R2, Neon, Git. Переносил боевые сервисы между провайдерами без даунтайма' },
        { g: 'Данные', i: 'PostgreSQL, SQL с window-функциями, pandas, метрики из операционных баз' },
        { g: 'Платежи', i: 'Флоу в iGaming, жизненный цикл транзакции, PSP API, диагностика интеграций' },
        { g: 'Инструменты', i: 'n8n, Zapier, Jira, Google Workspace, AI-ассистенты в ежедневном инженерном цикле' },
      ],
    },
    education: {
      title: 'Учёба и языки',
      schools: [
        { n: 'НИУ ВШЭ', d: 'Бакалавриат, античная филология', p: 'С 2024, учусь' },
        { n: 'ISI Language School, Осака', d: 'Японский язык, год жизни в Японии', p: '2022 — 2024' },
      ],
      langs: [
        { native: 'Русский', l: 'родной' },
        { native: 'English', l: 'C1, IELTS 7.0' },
        { native: '日本語', l: 'JLPT N4' },
        { native: 'Latina · Ἑλληνική', l: 'чтение и перевод' },
      ],
    },
    contact: {
      title: 'Связь',
      lead: 'Есть задача, которую пора автоматизировать? Напишите.',
      remote: 'Работаю удалённо, московское время',
      now: 'Сейчас в Москве',
      copy: 'Скопировать почту',
      copied: 'Почта скопирована',
    },
  },

  en: {
    nav: { contact: 'Contact', chapters: ['Start', 'Profile', 'Experience', 'Projects', 'Stack', 'Education', 'Contact'] },
    loader: 'Loading',
    hero: {
      first: 'Stepan',
      last: 'Ryumin',
      role: ['AI integrator and Python developer', 'Telegram bots, Mini Apps, LLM services'],
      lead: 'I build AI products end to end: from architecture to production.',
      scroll: 'Scroll to depart',
      seal: '履歴書',
      sealNote: 'rirekisho — Japanese for “résumé”',
    },
    profile: {
      title: 'Profile',
      statement:
        'A task turns into a working service fast: a bot, a Mini App or an API with an LLM inside. A year and a half in payment processing taught me to understand why the business needs a tool before I build it.',
      strengthsTitle: 'Strengths',
      strengths: [
        { t: 'Full cycle, solo', d: 'Requirements, architecture, backend, frontend, deploy and support, with no middlemen between me and the users.' },
        { t: 'LLMs from the inside', d: 'RAG with vector search and retrieval evals, managed and self-hosted inference, prompts tuned until the output is stable.' },
        { t: 'Business sense', d: 'Payment flows, PSP incidents, metrics straight from operational databases. Tools people use every day.' },
        { t: 'Words and story', d: 'Scripts for viral videos, classical philology, four languages. I can explain a product so people want it.' },
      ],
    },
    experience: {
      title: 'Experience',
      jobs: [
        {
          company: 'Marmeladych',
          about: 'A candy brand that grew on viral content',
          role: 'Scriptwriter',
          period: 'September 2026 — present',
          points: [
            'Wrote scripts for the brand’s short-form videos: absurd humour, fast editing, an audience aged 9–14.',
            'Worked in the format that made content the company’s main sales channel.',
          ],
          facts: [
            { v: '8M+', l: 'followers across the brand’s social media' },
            { v: '₽1B+', l: 'company revenue in 2025' },
            { v: '2M+', l: 'candy sets sold in 2025' },
          ],
          source: 'Company figures: Forbes Russia, 2025–2026',
        },
        {
          company: 'Paycrown',
          about: 'Payment processing and affiliate infrastructure, iGaming',
          role: 'AI integration and internal process automation',
          period: 'Autumn 2024 — May 2026',
          points: [
            'Shipped an LLM assistant over the company knowledge base: chunking, embeddings, vector search, retrieval evals on real staff questions.',
            'Traced payment integration incidents to the root cause: raw HTTP, PSP webhooks, error codes, vendor escalation.',
            'Built an event-driven alerting system with prioritisation, so the team acts instead of muting.',
            'Built a lightweight BI layer with SQL and pandas straight from the operational CRM.',
            'Turned vague support-quality criteria into testable rules for automated QA.',
          ],
        }
      ],
    },
    projects: {
      title: 'Projects',
      hint: 'My own products and client work, running in production',
      items: [
        { name: 'Sizzhka', kind: 'Resale channel and Mini App', d: 'Catalog for a ~24k-subscriber Telegram channel with AI virtual try-on. Telethon parser, Avito autoload feed, self-hosted CatVTON experiment on RunPod.', stack: ['aiogram', 'FastAPI', 'FASHN', 'Cloudflare R2', 'Railway'], pattern: 'asanoha' },
        { name: 'OV.PRJCT', kind: 'Catalog bot and Mini App', d: 'Vintage resale catalog for a ~9k-subscriber channel: hourly post parsing, category filters, price sorting.', stack: ['Telethon', 'FastAPI', 'React', 'Railway'], pattern: 'kikko' },
        { name: 'Trenirovochka', kind: 'AI fitness journal', d: 'Mini App with an AI coach. Moved from Timeweb to Railway, added Neon, redesigned it from a “calculator” into a premium journal.', stack: ['aiogram 3', 'FastAPI', 'React/Vite', 'Neon'], pattern: 'ichimatsu' },
        { name: 'Photo bot', kind: 'Client: catalog automation', d: 'Batch product-photo processing with Gemini, a script per category, plus auto-written post captions. Only size and price are left to fill in.', stack: ['Gemini Batch', 'aiogram', 'Railway'], pattern: 'yagasuri' },
        { name: 'Konspekt', kind: 'Lecture to notes', d: 'A 90-minute lecture recording becomes structured notes: Whisper transcription, then Claude summarisation.', stack: ['Python', 'Whisper v3', 'Anthropic API'], pattern: 'shippo' },
        { name: 'Voskhozhdenie', kind: 'Cinematic website', d: 'An ukiyo-e camera journey: valley, cedar forest, clouds, summit. A procedural Shinto shrine generated in Blender with Python scripts.', stack: ['Three.js', 'GSAP', 'Blender bpy', 'Replicate'], pattern: 'seigaiha' },
      ],
    },
    skills: {
      title: 'Stack',
      groups: [
        { g: 'Python', i: 'asyncio, aiogram 3, FastAPI and Pydantic, scrapers, REST, full Mini App cycle with a React/Vite frontend' },
        { g: 'AI and LLM', i: 'Anthropic API, Replicate, RunPod Serverless, RAG, embeddings, retrieval evals, prompt engineering, virtual try-on (FASHN, CatVTON)' },
        { g: 'Integrations', i: 'REST, JSON, webhooks, payment provider callbacks, event triggers, Telegram Bot API' },
        { g: 'Infrastructure', i: 'Railway, Cloudflare R2, Neon, Git. Migrated live services between providers with zero downtime' },
        { g: 'Data', i: 'PostgreSQL, SQL with window functions, pandas, metrics from operational databases' },
        { g: 'Payments', i: 'iGaming flows, transaction lifecycle, PSP APIs, integration diagnostics' },
        { g: 'Tools', i: 'n8n, Zapier, Jira, Google Workspace, AI assistants across the daily engineering loop' },
      ],
    },
    education: {
      title: 'Education and languages',
      schools: [
        { n: 'HSE University, Moscow', d: 'BA in Classical Philology', p: 'Since 2024, ongoing' },
        { n: 'ISI Language School, Osaka', d: 'Japanese language, living in Japan', p: '2022 — 2024' },
      ],
      langs: [
        { native: 'Русский', l: 'native' },
        { native: 'English', l: 'C1, IELTS 7.0' },
        { native: '日本語', l: 'JLPT N4' },
        { native: 'Latina · Ἑλληνική', l: 'reading and translation' },
      ],
    },
    contact: {
      title: 'Contact',
      lead: 'Got a process that’s overdue for automation? Write to me.',
      remote: 'Remote, Moscow time',
      now: 'Now in Moscow',
      copy: 'Copy email',
      copied: 'Email copied',
    },
  },
}


// Станции линии: каждая — раздел резюме
export const stations = [
  { n: 1, kanji: '出発', kana: 'しゅっぱつ', romaji: 'Shuppatsu', ru: 'Отправление', en: 'Departure' },
  { n: 2, kanji: '人物', kana: 'じんぶつ', romaji: 'Jinbutsu', ru: 'Профиль', en: 'Profile' },
  { n: 3, kanji: '経歴', kana: 'けいれき', romaji: 'Keireki', ru: 'Опыт', en: 'Experience' },
  { n: 4, kanji: '作品', kana: 'さくひん', romaji: 'Sakuhin', ru: 'Проекты', en: 'Projects' },
  { n: 5, kanji: '技術', kana: 'ぎじゅつ', romaji: 'Gijutsu', ru: 'Стек', en: 'Stack' },
  { n: 6, kanji: '学歴', kana: 'がくれき', romaji: 'Gakureki', ru: 'Учёба', en: 'Education' },
  { n: 7, kanji: '連絡', kana: 'れんらく', romaji: 'Renraku', ru: 'Связь', en: 'Contact' },
]

export const lcd = {
  ru: { next: 'Следующая', now: 'Станция', terminal: 'Конечная', line: 'Линия Рюмин', local: 'Все остановки' },
  en: { next: 'Next', now: 'Now at', terminal: 'Terminal', line: 'Ryumin Line', local: 'Local' },
}
