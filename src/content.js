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
    nav: { contact: 'Связаться', chapters: ['Начало', 'Профиль', 'Опыт', 'Кейсы', 'AI и стек', 'Учёба', 'Связь'] },
    loader: 'Загрузка',
    hero: {
      first: 'Степан',
      last: 'Рюмин',
      role: ['AI-интегратор и Python-разработчик', 'RAG, LLM-сервисы, автоматизация процессов'],
      lead: 'Разработка внутренних сервисов на Python и интеграция LLM в рабочие процессы.',
      scroll: 'Прокрутите вниз',
      seal: '履歴書',
      sealNote: 'рирэкисё — «резюме» по-японски',
    },
    profile: {
      title: 'Профиль',
      statement:
        '2024–2026: Paycrown, платёжный процессинг. Внутренние сервисы: LLM-ассистент по базе знаний, система алертов, аналитика из CRM, разбор инцидентов в платёжных интеграциях. Сервисы использовались командой в ежедневной работе.',
      strengthsTitle: 'Компетенции',
      strengths: [
        { t: 'LLM и RAG', d: 'Чанкинг, эмбеддинги, векторный поиск. Оценка retrieval на вопросах пользователей, настройка промптов.' },
        { t: 'Полный цикл разработки', d: 'Сбор требований, проектирование, разработка, деплой и поддержка сервисов.' },
        { t: 'Диагностика инцидентов', d: 'Анализ HTTP-запросов, ответов и вебхуков платёжных провайдеров, поиск причины сбоя.' },
        { t: 'Предметная область', d: 'Платёжные флоу в iGaming, метрики операционных баз, процессы поддержки.' },
      ],
    },
    experience: {
      title: 'Опыт',
      jobs: [
        {
          company: 'Paycrown',
          about: 'Платёжный процессинг и партнёрская инфраструктура, iGaming',
          role: 'Интегратор AI-сервисов, автоматизация внутренних процессов',
          period: 'Осень 2024 — май 2026',
          points: [
            'Разработка и поддержка внутренних Python-сервисов: требования, проектирование, деплой.',
            'LLM-ассистент по базе знаний компании (RAG): архитектура, оценка качества, внедрение.',
            'Разбор инцидентов, система алертов, дашборды, правила QA для поддержки.',
          ],
          more: 'Подробнее: раздел «Кейсы»',
        },
        {
          company: 'Мармеладыч',
          about: 'Бренд мармелада и сладостей',
          role: 'Сценарист',
          period: 'С сентября 2026 — сейчас',
          points: [
            'Сценарии коротких роликов для соцсетей бренда. Целевая аудитория: 9–14 лет.',
          ],
          facts: [
            { v: '8+ млн', l: 'подписчиков в соцсетях бренда' },
            { v: '1+ млрд ₽', l: 'выручка компании в 2025 году' },
            { v: '2+ млн', l: 'наборов сладостей продано за 2025 год' },
          ],
          source: 'Данные компании: Forbes, 2025–2026',
        },
      ],
    },
    projects: {
      title: 'Кейсы Paycrown',
      hint: 'Задача, решение, результат',
      items: [
        { name: 'LLM-ассистент', kind: 'RAG по базе знаний', d: 'Ассистент для ответов на вопросы сотрудников по базе знаний компании. Чанкинг, эмбеддинги, векторный поиск.', r: 'Оценка retrieval на вопросах сотрудников, настройка промптов.', stack: ['Anthropic API', 'Эмбеддинги', 'Векторный поиск', 'Eval retrieval'], pattern: 'asanoha' },
        { name: 'Инциденты платежей', kind: 'Интеграции с PSP', d: 'Разбор сбоев в платёжных интеграциях: HTTP-запросы и ответы, логи и вебхуки провайдеров, сравнение параметров, коды ошибок.', r: 'Коммуникация с вендором до устранения причины.', stack: ['HTTP', 'Вебхуки', 'PSP API', 'Логи'], pattern: 'kikko' },
        { name: 'Система алертов', kind: 'Событийные уведомления', d: 'Триггеры на отклонения метрик, алерты с контекстом и примерами, доставка в рабочие каналы.', r: 'Приоритизация алертов по важности.', stack: ['Python', 'SQL', 'Триггеры', 'Вебхуки'], pattern: 'yagasuri' },
        { name: 'BI без BI', kind: 'Аналитика из CRM', d: 'Дашборды и выгрузки из операционной базы CRM: JOIN, агрегации, оконные функции, pandas.', r: 'Отчётность без отдельного BI-инструмента.', stack: ['PostgreSQL', 'Window-функции', 'pandas'], pattern: 'ichimatsu' },
        { name: 'QA поддержки', kind: 'Контроль качества диалогов', d: 'Формализация критериев качества диалогов поддержки в проверяемые правила.', r: 'Правила применяются для автоматической проверки выборки диалогов.', stack: ['Правила оценки', 'Выборка', 'Python'], pattern: 'shippo' },
        { name: 'Внутренние сервисы', kind: 'Полный цикл', d: 'Сбор требований, проектирование, асинхронный бэкенд, деплой и поддержка.', r: 'Сервисы использовались командой в ежедневной работе.', stack: ['Python', 'asyncio', 'FastAPI', 'REST'], pattern: 'seigaiha' },
      ],
    },
    skills: {
      title: 'AI и стек',
      aiTitle: 'AI',
      engTitle: 'Инженерия',
      ai: [
        { g: 'RAG', i: 'Чанкинг, эмбеддинги, векторный поиск, оценка качества retrieval' },
        { g: 'LLM API', i: 'Anthropic API, prompt engineering' },
        { g: 'Инференс', i: 'Replicate, RunPod Serverless' },
        { g: 'AI в разработке', i: 'Claude как основной инструмент разработки' },
      ],
      groups: [
        { g: 'Python', i: 'asyncio, FastAPI, Pydantic, aiogram 3, парсеры, OpenAPI' },
        { g: 'Интеграции', i: 'REST, JSON, вебхуки, колбэки платёжных провайдеров, событийные триггеры, Telegram Bot API' },
        { g: 'Данные', i: 'PostgreSQL, SQL (JOIN, агрегации, оконные функции), pandas' },
        { g: 'Платежи', i: 'Флоу в iGaming, жизненный цикл транзакции, PSP API, диагностика интеграционных инцидентов' },
        { g: 'Инфраструктура', i: 'Railway, Cloudflare R2, Neon, Git. Миграция сервисов между провайдерами без простоя' },
        { g: 'Инструменты', i: 'n8n, Zapier, Jira, Google Workspace' },
      ],
    },
    education: {
      title: 'Учёба и языки',
      schools: [
        { n: 'НИУ ВШЭ', d: 'Бакалавриат, античная филология', p: 'С 2024, учусь' },
        { n: 'ISI Language School, Осака', d: 'Японский язык', p: '2022 — 2024' },
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
      lead: 'Почта, Telegram, GitHub.',
      remote: 'Удалённо, UTC+3',
      now: 'Сейчас в Москве',
      copy: 'Скопировать почту',
      copied: 'Почта скопирована',
    },
  },

  en: {
    nav: { contact: 'Contact', chapters: ['Start', 'Profile', 'Experience', 'Cases', 'AI & stack', 'Education', 'Contact'] },
    loader: 'Loading',
    hero: {
      first: 'Stepan',
      last: 'Ryumin',
      role: ['AI integrator and Python developer', 'RAG, LLM services, process automation'],
      lead: 'Internal Python services and LLM integration into business workflows.',
      scroll: 'Scroll down',
      seal: '履歴書',
      sealNote: 'rirekisho — Japanese for “résumé”',
    },
    profile: {
      title: 'Profile',
      statement:
        '2024–2026: Paycrown, payment processing. Internal services: an LLM assistant over the knowledge base, alerting, CRM analytics, payment integration incident analysis. The services were used by the team daily.',
      strengthsTitle: 'Competencies',
      strengths: [
        { t: 'LLMs and RAG', d: 'Chunking, embeddings, vector search. Retrieval evaluation on user questions, prompt tuning.' },
        { t: 'Full development cycle', d: 'Requirements, design, development, deployment and support.' },
        { t: 'Incident analysis', d: 'HTTP requests, responses and payment provider webhooks; identifying the cause of failures.' },
        { t: 'Domain knowledge', d: 'iGaming payment flows, operational database metrics, support processes.' },
      ],
    },
    experience: {
      title: 'Experience',
      jobs: [
        {
          company: 'Paycrown',
          about: 'Payment processing and affiliate infrastructure, iGaming',
          role: 'AI integration and internal process automation',
          period: 'Autumn 2024 — May 2026',
          points: [
            'Development and support of internal Python services: requirements, design, deployment.',
            'LLM assistant over the company knowledge base (RAG): architecture, evaluation, rollout.',
            'Incident analysis, alerting, dashboards, QA rules for support.',
          ],
          more: 'Details: see Cases',
        },
        {
          company: 'Marmeladych',
          about: 'Gummy and confectionery brand',
          role: 'Scriptwriter',
          period: 'September 2026 — present',
          points: [
            'Scripts for the brand’s short-form social media videos. Target audience: ages 9–14.',
          ],
          facts: [
            { v: '8M+', l: 'followers across the brand’s social media' },
            { v: '₽1B+', l: 'company revenue in 2025' },
            { v: '2M+', l: 'candy sets sold in 2025' },
          ],
          source: 'Company figures: Forbes Russia, 2025–2026',
        },
      ],
    },
    projects: {
      title: 'Paycrown cases',
      hint: 'Task, solution, result',
      items: [
        { name: 'LLM assistant', kind: 'RAG over the knowledge base', d: 'Assistant answering staff questions from the company knowledge base. Chunking, embeddings, vector search.', r: 'Retrieval evaluation on staff questions, prompt tuning.', stack: ['Anthropic API', 'Embeddings', 'Vector search', 'Retrieval evals'], pattern: 'asanoha' },
        { name: 'Payment incidents', kind: 'PSP integrations', d: 'Analysis of payment integration failures: HTTP requests and responses, provider logs and webhooks, parameter comparison, error codes.', r: 'Vendor communication until the cause was resolved.', stack: ['HTTP', 'Webhooks', 'PSP APIs', 'Logs'], pattern: 'kikko' },
        { name: 'Alerting system', kind: 'Event-driven notifications', d: 'Triggers on metric deviations, alerts with context and examples, delivery to team channels.', r: 'Alerts prioritised by severity.', stack: ['Python', 'SQL', 'Triggers', 'Webhooks'], pattern: 'yagasuri' },
        { name: 'BI without BI', kind: 'Analytics from the CRM', d: 'Dashboards and exports from the operational CRM database: joins, aggregations, window functions, pandas.', r: 'Reporting without a separate BI tool.', stack: ['PostgreSQL', 'Window functions', 'pandas'], pattern: 'ichimatsu' },
        { name: 'Support QA', kind: 'Conversation quality control', d: 'Support conversation quality criteria formalised into testable rules.', r: 'Rules applied to automated checks of conversation samples.', stack: ['Scoring rules', 'Sampling', 'Python'], pattern: 'shippo' },
        { name: 'Internal services', kind: 'Full cycle', d: 'Requirements, design, async backend, deployment and support.', r: 'Services used by the team daily.', stack: ['Python', 'asyncio', 'FastAPI', 'REST'], pattern: 'seigaiha' },
      ],
    },
    skills: {
      title: 'AI & stack',
      aiTitle: 'AI',
      engTitle: 'Engineering',
      ai: [
        { g: 'RAG', i: 'Chunking, embeddings, vector search, retrieval evaluation' },
        { g: 'LLM APIs', i: 'Anthropic API, prompt engineering' },
        { g: 'Inference', i: 'Replicate, RunPod Serverless' },
        { g: 'AI in engineering', i: 'Claude as the primary development tool' },
      ],
      groups: [
        { g: 'Python', i: 'asyncio, FastAPI, Pydantic, aiogram 3, scrapers, OpenAPI' },
        { g: 'Integrations', i: 'REST, JSON, webhooks, payment provider callbacks, event triggers, Telegram Bot API' },
        { g: 'Data', i: 'PostgreSQL, SQL (joins, aggregations, window functions), pandas' },
        { g: 'Payments', i: 'iGaming flows, transaction lifecycle, PSP APIs, integration incident diagnostics' },
        { g: 'Infrastructure', i: 'Railway, Cloudflare R2, Neon, Git. Zero-downtime service migration between providers' },
        { g: 'Tools', i: 'n8n, Zapier, Jira, Google Workspace' },
      ],
    },
    education: {
      title: 'Education and languages',
      schools: [
        { n: 'HSE University, Moscow', d: 'BA in Classical Philology', p: 'Since 2024, ongoing' },
        { n: 'ISI Language School, Osaka', d: 'Japanese language', p: '2022 — 2024' },
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
      lead: 'Email, Telegram, GitHub.',
      remote: 'Remote, UTC+3',
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
  { n: 4, kanji: '事例', kana: 'じれい', romaji: 'Jirei', ru: 'Кейсы', en: 'Cases' },
  { n: 5, kanji: '技術', kana: 'ぎじゅつ', romaji: 'Gijutsu', ru: 'AI и стек', en: 'AI & stack' },
  { n: 6, kanji: '学歴', kana: 'がくれき', romaji: 'Gakureki', ru: 'Учёба', en: 'Education' },
  { n: 7, kanji: '連絡', kana: 'れんらく', romaji: 'Renraku', ru: 'Связь', en: 'Contact' },
]

export const lcd = {
  ru: { next: 'Следующая', now: 'Станция', terminal: 'Конечная', line: 'Линия Рюмин', local: 'Все остановки' },
  en: { next: 'Next', now: 'Now at', terminal: 'Terminal', line: 'Ryumin Line', local: 'Local' },
}
