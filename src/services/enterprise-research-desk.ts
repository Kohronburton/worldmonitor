export interface ResearchDeskMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ResearchMission {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  domainFocus: string;
  enterpriseAgent: boolean;
  history: ResearchDeskMessage[];
  evidenceSources: string[];
  watchlist: string[];
}

export const ENTERPRISE_MISSIONS_STORAGE_KEY = 'wm-enterprise-research-missions-v1';
export const ENTERPRISE_LAST_BRIEF_STORAGE_KEY = 'wm-enterprise-last-brief-v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function normalizeText(value: unknown, max = 8000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function normalizeStringList(value: unknown, maxItems = 50): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    const clean = normalizeText(item, 120);
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
    if (out.length >= maxItems) break;
  }
  return out;
}

function normalizeHistory(value: unknown): ResearchDeskMessage[] {
  if (!Array.isArray(value)) return [];
  const out: ResearchDeskMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const role = (item as { role?: unknown }).role;
    const content = normalizeText((item as { content?: unknown }).content);
    if ((role !== 'user' && role !== 'assistant') || !content) continue;
    out.push({ role, content });
    if (out.length >= 20) break;
  }
  return out;
}

export function normalizeResearchMission(value: unknown): ResearchMission | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Partial<ResearchMission>;
  const id = normalizeText(raw.id, 80);
  const title = normalizeText(raw.title, 120);
  if (!id || !title) return null;
  const createdAt = normalizeText(raw.createdAt, 40) || new Date(0).toISOString();
  const updatedAt = normalizeText(raw.updatedAt, 40) || createdAt;
  return {
    id,
    title,
    createdAt,
    updatedAt,
    domainFocus: normalizeText(raw.domainFocus, 40) || 'all',
    enterpriseAgent: raw.enterpriseAgent === true,
    history: normalizeHistory(raw.history),
    evidenceSources: normalizeStringList(raw.evidenceSources, 30),
    watchlist: normalizeStringList(raw.watchlist, 50),
  };
}

export function loadResearchMissions(storage: Pick<Storage, 'getItem'> = localStorage): ResearchMission[] {
  try {
    const parsed = safeParse<unknown>(storage.getItem(ENTERPRISE_MISSIONS_STORAGE_KEY));
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeResearchMission).filter((m): m is ResearchMission => m !== null);
  } catch {
    return [];
  }
}

export function saveResearchMissions(
  missions: ResearchMission[],
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  const normalized = missions
    .map(normalizeResearchMission)
    .filter((m): m is ResearchMission => m !== null)
    .slice(0, 50);
  storage.setItem(ENTERPRISE_MISSIONS_STORAGE_KEY, JSON.stringify(normalized));
}

export function upsertResearchMission(
  missions: ResearchMission[],
  mission: ResearchMission,
): ResearchMission[] {
  const normalized = normalizeResearchMission(mission);
  if (!normalized) return missions.slice();
  const next = missions.filter((m) => m.id !== normalized.id);
  next.unshift(normalized);
  return next.slice(0, 50);
}

export function createMissionTitle(history: ResearchDeskMessage[]): string {
  const firstUser = history.find((m) => m.role === 'user')?.content ?? '';
  const compact = firstUser.replace(/\s+/g, ' ').trim();
  if (compact) return compact.slice(0, 72);
  return `Mission ${new Date().toLocaleString()}`;
}

export function buildWhatChangedQuery(lastBrief: string): string {
  const baseline = normalizeText(lastBrief, 1800);
  if (!baseline) {
    return 'What materially changed in the current intelligence picture, what is noise, and what deserves attention now?';
  }
  return [
    'Compare the current live intelligence picture with this previous briefing baseline.',
    'Identify only material changes, reversals, escalations, de-escalations, and newly relevant market transmission.',
    'Separate OBSERVED / INFERENCE / UNKNOWN and tell me what deserves attention now.',
    '',
    'PREVIOUS BRIEF BASELINE:',
    baseline,
  ].join('\n');
}

export function buildWatchlistBriefQuery(symbols: string[]): string {
  const clean = normalizeStringList(symbols, 50);
  if (clean.length === 0) {
    return 'Give me an enterprise market brief focused on the highest-signal equities and sectors in the current WorldMonitor market context.';
  }
  return [
    `Give me an enterprise watchlist brief for: ${clean.join(', ')}.`,
    'For each name with available evidence, summarize catalyst, geopolitical or macro transmission, current signal, risk, and what to watch.',
    'Do not invent company fundamentals or exposures that are not in context.',
  ].join(' ');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[ch] ?? ch);
}

export function buildEnterpriseReportHtml(input: {
  title: string;
  exportedAt: string;
  domainFocus: string;
  watchlist: string[];
  evidenceSources: string[];
  history: ResearchDeskMessage[];
}): string {
  const title = escapeHtml(normalizeText(input.title, 120) || 'WorldMonitor Enterprise Intelligence Report');
  const watchlist = normalizeStringList(input.watchlist, 50);
  const evidence = normalizeStringList(input.evidenceSources, 30);
  const history = normalizeHistory(input.history);
  const sections = history.map((msg) => {
    const heading = msg.role === 'user' ? 'Operator Request' : 'Analyst Assessment';
    return `<section><h2>${heading}</h2><pre>${escapeHtml(msg.content)}</pre></section>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
body{font-family:Inter,Arial,sans-serif;background:#0b0d10;color:#e7ebef;margin:0;padding:40px;line-height:1.55}
main{max-width:980px;margin:0 auto}
header{border-bottom:1px solid #2b3138;padding-bottom:18px;margin-bottom:26px}
.kicker{font:700 12px/1.2 ui-monospace,monospace;letter-spacing:.14em;color:#55d98a;text-transform:uppercase}
h1{font-size:30px;margin:8px 0}
.meta{color:#9aa6b2;font-size:13px}
.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0 26px}
.card{border:1px solid #2b3138;border-radius:10px;padding:12px;background:#12161b}
.card strong{display:block;color:#55d98a;margin-bottom:4px}
section{margin:28px 0}
h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#55d98a}
pre{white-space:pre-wrap;word-break:break-word;font:14px/1.6 Inter,Arial,sans-serif;background:#12161b;border:1px solid #2b3138;border-radius:10px;padding:16px}
footer{border-top:1px solid #2b3138;margin-top:36px;padding-top:14px;color:#74808b;font-size:12px}
@media print{body{background:#fff;color:#111;padding:18px}.card,pre{background:#fff;border-color:#bbb}.kicker,h2,.card strong{color:#0b6b3a}}
</style>
</head>
<body><main>
<header><div class="kicker">WorldMonitor Enterprise</div><h1>${title}</h1><div class="meta">Generated ${escapeHtml(input.exportedAt)} · Domain: ${escapeHtml(input.domainFocus)}</div></header>
<div class="cards">
<div class="card"><strong>Watchlist</strong>${escapeHtml(watchlist.join(', ') || 'No custom tickers')}</div>
<div class="card"><strong>Evidence surfaces</strong>${escapeHtml(evidence.join(', ') || 'No evidence metadata captured')}</div>
</div>
${sections || '<section><h2>Assessment</h2><pre>No analyst transcript available.</pre></section>'}
<footer>WorldMonitor Enterprise Intelligence Desk · Decision support only · Verify time-sensitive or high-impact conclusions against primary sources.</footer>
</main></body></html>`;
}

export function loadLastEnterpriseBrief(storage: Pick<Storage, 'getItem'> = localStorage): string {
  try { return normalizeText(storage.getItem(ENTERPRISE_LAST_BRIEF_STORAGE_KEY), 8000); } catch { return ''; }
}

export function saveLastEnterpriseBrief(
  brief: string,
  storage: Pick<Storage, 'setItem'> = localStorage,
): void {
  storage.setItem(ENTERPRISE_LAST_BRIEF_STORAGE_KEY, normalizeText(brief, 8000));
}
