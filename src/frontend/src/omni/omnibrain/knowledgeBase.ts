// Local static OMNIBRAIN knowledge base for app help

export interface KnowledgeEntry {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'private-mode',
    title: 'Private Mode',
    keywords: ['private', 'mode', 'blur', 'privacy', 'hide', 'screen', 'sensitive'],
    answer: 'Private Mode blurs sensitive content on your screen. Toggle it using the eye icon in the top navigation. When enabled, timeline details and activity names are hidden. Your data remains local and is never shared.',
  },
  {
    id: 'export-data',
    title: 'Export Data',
    keywords: ['export', 'download', 'save', 'backup', 'data', 'json', 'csv'],
    answer: 'You can export all your OMNITRACE data from Settings → Privacy & Control. Choose JSON format for complete data backup or CSV for spreadsheet analysis. All exports are generated locally in your browser.',
  },
  {
    id: 'wipe-data',
    title: 'Wipe Data',
    keywords: ['wipe', 'delete', 'clear', 'remove', 'reset', 'erase', 'data'],
    answer: 'To completely wipe your data, go to Settings → Privacy & Control and use the "Wipe All Data" button. This permanently deletes all recorded events, sessions, and settings from your device. This action cannot be undone.',
  },
  {
    id: 'context-memory',
    title: 'Context Memory',
    keywords: ['context', 'memory', 'scope', 'today', 'week', 'all time', 'time range'],
    answer: 'Context Memory controls the time range OMNIBRAIN uses to answer questions. Choose "Today" for current day insights, "Week" for 7-day trends, or "All time" for complete history. Change it using the Context button in OMNIBRAIN.',
  },
  {
    id: 'intelligence-modes',
    title: 'Intelligence Modes',
    keywords: ['intelligence', 'mode', 'explain', 'analyze', 'coach', 'silent', 'style'],
    answer: 'Intelligence Modes change how OMNIBRAIN presents answers. "Explain" gives clear summaries, "Analyze" provides detailed data breakdowns, "Coach" offers supportive guidance, and "Silent" gives minimal one-line responses. The underlying facts remain the same.',
  },
  {
    id: 'smart-merging',
    title: 'Smart Merging',
    keywords: ['smart', 'merge', 'merging', 'segments', 'combine', 'timeline'],
    answer: 'Smart Merging automatically combines related activity segments on your timeline for cleaner visualization. It adapts to your Cognitive Mode: Focus mode aggressively merges distractions, Flow mode de-emphasizes micro-interruptions, Recovery mode emphasizes rest gaps, and Analysis mode shows raw unmerged segments.',
  },
  {
    id: 'cognitive-mode',
    title: 'Cognitive Mode',
    keywords: ['cognitive', 'mode', 'focus', 'flow', 'recovery', 'analysis'],
    answer: 'Cognitive Mode adjusts how OMNITRACE interprets your activity. Focus mode optimizes for deep work tracking, Flow mode balances productivity and breaks, Recovery mode emphasizes rest patterns, and Analysis mode provides raw unfiltered data. Switch modes using the pill selector in the top navigation.',
  },
  {
    id: 'focus-score',
    title: 'Focus Score',
    keywords: ['focus', 'score', 'ring', 'rating', 'performance'],
    answer: 'Focus Score (0-100) measures your concentration quality based on session duration, distraction frequency, rest gaps, and app switching. States: Deep Focus (80+), Flow (60-79), Unstable (40-59), Distracted (<40). The colored ring in the header shows your current score.',
  },
  {
    id: 'manual-events',
    title: 'Manual Events',
    keywords: ['manual', 'event', 'add', 'create', 'log', 'record'],
    answer: 'You can manually log events that OMNITRACE didn\'t capture automatically. Use the "+" button on the Timeline screen to add events with custom title, category, time, duration, and notes. Useful for offline activities or retrospective logging.',
  },
  {
    id: 'how-it-works',
    title: 'How OMNITRACE Works',
    keywords: ['how', 'works', 'track', 'tracking', 'record', 'capture', 'detect'],
    answer: 'OMNITRACE runs entirely offline in your browser. It tracks your activity using idle detection, session boundaries, and manual logging. All data is stored locally on your device using IndexedDB. No data is sent to any server. The app uses deterministic algorithms to derive insights from your recorded events.',
  },
  {
    id: 'offline',
    title: 'Offline Operation',
    keywords: ['offline', 'internet', 'connection', 'local', 'network'],
    answer: 'OMNITRACE works completely offline. All tracking, analysis, and OMNIBRAIN answers are generated locally in your browser. No internet connection is required after the initial load. Your data never leaves your device.',
  },
  {
    id: 'no-external-ai',
    title: 'No External AI Integration',
    keywords: ['api key', 'api-key', 'apikey', 'openai', 'chatgpt', 'gpt', 'anthropic', 'claude', 'llm', 'ai key', 'external ai', 'chatbot', 'integration', 'connect'],
    answer: 'OMNIBRAIN does not support external AI services or API keys. It runs fully offline using only your local OMNITRACE data and a static knowledge base. No OpenAI, Anthropic, or other third-party AI API keys are needed or accepted. All responses are generated deterministically from your recorded activity data without any network calls.',
  },
];
