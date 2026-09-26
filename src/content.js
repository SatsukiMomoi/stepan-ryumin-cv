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
      lead: 'Встраиваю LLM в рабочие процессы компании: от архитектуры до продакшена.',
      scroll: 'Листайте, чтобы поехать',
      seal: '履歴書',
      sealNote: 'рирэкисё — «резюме» по-японски',
    },
    profile: {
      title: 'Профиль',
      statement:
        'Полтора года закрывал внутренние задачи платёжного процессинга Paycrown: LLM-ассистент по базе знаний, алерты, аналитика, разбор инцидентов. Мои инструменты работали в ежедневных процессах команды, а не лежали на полке.',
      strengthsTitle: 'Сильные стороны',
      strengths: [
        { t: 'LLM изнутри', d: 'RAG с чанкингом, эмбеддингами и векторным поиском, оценка retrieval на реальных вопросах, промпты до стабильных ответов.' },
        { t: 'Полный цикл в одиночку', d: 'Собираю требования у команды, проектирую, пишу, деплою и поддерживаю. Без менеджера между мной и пользователями.' },
        { t: 'Докапываюсь до причины', d: 'Разбираю инциденты на уровне сырых HTTP-запросов и вебхуков. Ищу root cause, а не лечу симптом.' },
        { t: 'Понимание бизнеса', d: 'Платёжные флоу, метрики из операционных баз, поддержка. Сначала понимаю, зачем инструмент, потом строю.' },
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
            'Единолично вёл внутренние Python-сервисы полным циклом: требования, проектирование, разработка, деплой, поддержка.',
            'Развернул LLM-ассистента по базе знаний компании и довёл его до стабильных ответов на реальных вопросах сотрудников.',
            'Закрывал задачи на стыке процессинга, поддержки и аналитики: инциденты, алерты, дашборды, контроль качества.',
          ],
          more: 'Подробно по каждой задаче: следующая станция',
        },
        {
          company: 'Мармеладыч',
          about: 'Бренд сладостей, выросший на вирусном контенте',
          role: 'Сценарист',
          period: 'С сентября 2026 — сейчас',
          points: [
            'Пишу сценарии коротких роликов для соцсетей бренда: абсурдный юмор, быстрый монтаж, аудитория 9–14 лет.',
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
      hint: 'Что было нужно команде, что я сделал и как это работало',
      items: [
        { name: 'LLM-ассистент', kind: 'RAG по базе знаний', d: 'Ассистент поверх базы знаний компании, который отвечает на вопросы сотрудников. Спроектировал стратегию чанкинга, эмбеддинги и векторный поиск.', r: 'Качество retrieval проверял на реальных вопросах сотрудников и доводил промпты, пока ответы не стали стабильными.', stack: ['Anthropic API', 'Эмбеддинги', 'Векторный поиск', 'Eval retrieval'], pattern: 'asanoha' },
        { name: 'Инциденты платежей', kind: 'Интеграции с PSP', d: 'Разбирал сбои в платёжных интеграциях на уровне сырых HTTP-запросов и ответов: логи и вебхуки провайдеров, diff параметров, коды ошибок.', r: 'Вёл переписку с вендором до полного устранения. Искал причину, а не закрывал симптом.', stack: ['HTTP', 'Вебхуки', 'PSP API', 'Логи'], pattern: 'kikko' },
        { name: 'Система алертов', kind: 'Событийные уведомления', d: 'Триггеры на отклонения метрик, алерты с контекстом и примерами кейсов, доставка в рабочие каналы.', r: 'Приоритизация сделала так, что команда реагирует на алерты, а не мьютит их.', stack: ['Python', 'SQL', 'Триггеры', 'Вебхуки'], pattern: 'yagasuri' },
        { name: 'BI без BI', kind: 'Аналитика из CRM', d: 'Дашборды и выгрузки напрямую из операционной базы CRM: JOIN, агрегации, аналитические функции, pandas.', r: 'Получился лёгкий BI-слой без отдельного BI-инструмента.', stack: ['PostgreSQL', 'Window-функции', 'pandas'], pattern: 'ichimatsu' },
        { name: 'QA поддержки', kind: 'Контроль качества диалогов', d: 'Критерии качества диалогов поддержки были размытыми. Перевёл их в формальные проверяемые правила.', r: 'Правила подошли для автоматизированного QA-контроля выборки диалогов.', stack: ['Правила оценки', 'Выборка', 'Python'], pattern: 'shippo' },
        { name: 'Внутренние сервисы', kind: 'Полный цикл', d: 'Сам собирал требования у команды, проектировал, писал асинхронный бэкенд, деплоил и поддерживал сервисы.', r: 'Инструменты использовались в ежедневной работе команды.', stack: ['Python', 'asyncio', 'FastAPI', 'REST'], pattern: 'seigaiha' },
      ],
    },
    skills: {
      title: 'AI и стек',
      aiTitle: 'AI',
      engTitle: 'Инженерия',
      ai: [
        { g: 'RAG', i: 'Чанкинг, эмбеддинги, векторный поиск, оценка качества retrieval на реальных вопросах пользователей' },
        { g: 'LLM в продукте', i: 'Anthropic API, prompt engineering, итеративная доводка промптов до стабильных ответов' },
        { g: 'Инференс', i: 'Replicate, RunPod Serverless: managed-инференс и сравнение с self-hosted вариантами' },
        { g: 'Компьютерное зрение', i: 'Виртуальная примерка одежды: FASHN, CatVTON' },
        { g: 'AI в разработке', i: 'AI-инструменты в ежедневном инженерном цикле: от прототипа до продакшена' },
      ],
      groups: [
        { g: 'Python', i: 'asyncio, FastAPI и Pydantic, aiogram 3, парсеры, REST-сервисы с автодокументацией OpenAPI' },
        { g: 'Интеграции', i: 'REST, JSON, вебхуки, колбэки платёжных провайдеров, событийные триггеры, Telegram Bot API' },
        { g: 'Данные', i: 'PostgreSQL, SQL с JOIN, агрегациями и window-функциями, pandas, метрики из операционных баз' },
        { g: 'Платежи', i: 'Флоу в iGaming, жизненный цикл транзакции, PSP API, диагностика интеграционных инцидентов' },
        { g: 'Инфраструктура', i: 'Railway, Cloudflare R2, Neon, Git. Переносил боевые сервисы между провайдерами без даунтайма' },
        { g: 'Инструменты', i: 'n8n, Zapier, Jira, Google Workspace' },
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
      lead: 'Есть процесс, который пора отдать LLM? Напишите.',
      remote: 'Работаю удалённо, московское время',
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
      lead: 'I bring LLMs into a company’s daily workflows, from architecture to production.',
      scroll: 'Scroll to depart',
      seal: '履歴書',
      sealNote: 'rirekisho — Japanese for “résumé”',
    },
    profile: {
      title: 'Profile',
      statement:
        'For a year and a half I solved internal problems at Paycrown, a payment processor: an LLM assistant over the knowledge base, alerting, analytics, incident investigations. My tools ran in the team’s daily work instead of sitting on a shelf.',
      strengthsTitle: 'Strengths',
      strengths: [
        { t: 'LLMs from the inside', d: 'RAG with chunking, embeddings and vector search, retrieval evals on real questions, prompts tuned until answers are stable.' },
        { t: 'Full cycle, solo', d: 'I gather requirements from the team, design, build, deploy and support. No manager between me and the users.' },
        { t: 'Root cause, not symptoms', d: 'I investigate incidents down to raw HTTP requests and webhooks, and fix the cause instead of the symptom.' },
        { t: 'Business sense', d: 'Payment flows, metrics from operational databases, support. I understand why a tool is needed before I build it.' },
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
            'Owned internal Python services end to end: requirements, design, development, deployment, support.',
            'Shipped an LLM assistant over the company knowledge base and tuned it to stable answers on real staff questions.',
            'Worked where processing, support and analytics meet: incidents, alerts, dashboards, quality control.',
          ],
          more: 'Each project in detail: next station',
        },
        {
          company: 'Marmeladych',
          about: 'A candy brand that grew on viral content',
          role: 'Scriptwriter',
          period: 'September 2026 — present',
          points: [
            'I write scripts for the brand’s short-form videos: absurd humour, fast editing, an audience aged 9–14.',
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
      hint: 'What the team needed, what I built and how it worked',
      items: [
        { name: 'LLM assistant', kind: 'RAG over the knowledge base', d: 'An assistant over the company knowledge base that answers staff questions. I designed the chunking strategy, embeddings and vector search.', r: 'I evaluated retrieval on real staff questions and tuned prompts until the answers were stable.', stack: ['Anthropic API', 'Embeddings', 'Vector search', 'Retrieval evals'], pattern: 'asanoha' },
        { name: 'Payment incidents', kind: 'PSP integrations', d: 'I investigated payment integration failures at the level of raw HTTP requests and responses: provider logs and webhooks, parameter diffs, error codes.', r: 'I worked with the vendor until the issue was fully fixed, going after the cause rather than the symptom.', stack: ['HTTP', 'Webhooks', 'PSP APIs', 'Logs'], pattern: 'kikko' },
        { name: 'Alerting system', kind: 'Event-driven notifications', d: 'Triggers on metric deviations, alerts with context and example cases, delivered to working channels.', r: 'Prioritisation meant the team acted on alerts instead of muting them.', stack: ['Python', 'SQL', 'Triggers', 'Webhooks'], pattern: 'yagasuri' },
        { name: 'BI without BI', kind: 'Analytics from the CRM', d: 'Dashboards and exports straight from the operational CRM database: joins, aggregations, analytic functions, pandas.', r: 'The result was a lightweight BI layer with no separate BI tool.', stack: ['PostgreSQL', 'Window functions', 'pandas'], pattern: 'ichimatsu' },
        { name: 'Support QA', kind: 'Conversation quality control', d: 'Quality criteria for support conversations were vague. I turned them into formal, testable rules.', r: 'The rules made automated QA of conversation samples possible.', stack: ['Scoring rules', 'Sampling', 'Python'], pattern: 'shippo' },
        { name: 'Internal services', kind: 'Full cycle', d: 'I gathered requirements from the team myself, designed, wrote the async backend, deployed and supported the services.', r: 'The tools were used in the team’s daily work.', stack: ['Python', 'asyncio', 'FastAPI', 'REST'], pattern: 'seigaiha' },
      ],
    },
    skills: {
      title: 'AI & stack',
      aiTitle: 'AI',
      engTitle: 'Engineering',
      ai: [
        { g: 'RAG', i: 'Chunking, embeddings, vector search, retrieval quality evals on real user questions' },
        { g: 'LLMs in product', i: 'Anthropic API, prompt engineering, iterating prompts until answers are stable' },
        { g: 'Inference', i: 'Replicate, RunPod Serverless: managed inference compared with self-hosted options' },
        { g: 'Computer vision', i: 'Virtual try-on: FASHN, CatVTON' },
        { g: 'AI in engineering', i: 'AI tools across the daily engineering loop, from prototype to production' },
      ],
      groups: [
        { g: 'Python', i: 'asyncio, FastAPI and Pydantic, aiogram 3, scrapers, REST services with OpenAPI docs' },
        { g: 'Integrations', i: 'REST, JSON, webhooks, payment provider callbacks, event triggers, Telegram Bot API' },
        { g: 'Data', i: 'PostgreSQL, SQL with joins, aggregations and window functions, pandas, metrics from operational databases' },
        { g: 'Payments', i: 'iGaming flows, transaction lifecycle, PSP APIs, integration incident diagnostics' },
        { g: 'Infrastructure', i: 'Railway, Cloudflare R2, Neon, Git. Migrated live services between providers with zero downtime' },
        { g: 'Tools', i: 'n8n, Zapier, Jira, Google Workspace' },
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
      lead: 'Got a process that’s ready to hand over to an LLM? Write to me.',
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
  { n: 4, kanji: '事例', kana: 'じれい', romaji: 'Jirei', ru: 'Кейсы', en: 'Cases' },
  { n: 5, kanji: '技術', kana: 'ぎじゅつ', romaji: 'Gijutsu', ru: 'AI и стек', en: 'AI & stack' },
  { n: 6, kanji: '学歴', kana: 'がくれき', romaji: 'Gakureki', ru: 'Учёба', en: 'Education' },
  { n: 7, kanji: '連絡', kana: 'れんらく', romaji: 'Renraku', ru: 'Связь', en: 'Contact' },
]

export const lcd = {
  ru: { next: 'Следующая', now: 'Станция', terminal: 'Конечная', line: 'Линия Рюмин', local: 'Все остановки' },
  en: { next: 'Next', now: 'Now at', terminal: 'Terminal', line: 'Ryumin Line', local: 'Local' },
}
