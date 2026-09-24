import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildEnterpriseReportHtml,
  buildWatchlistBriefQuery,
  buildWhatChangedQuery,
  createMissionTitle,
  normalizeResearchMission,
  upsertResearchMission,
} from '../src/services/enterprise-research-desk.ts';

test('enterprise research desk normalizes and upserts mission snapshots', () => {
  const mission = normalizeResearchMission({
    id: 'mission-1',
    title: 'Hormuz risk',
    createdAt: '2026-09-24T12:00:00.000Z',
    updatedAt: '2026-09-24T12:10:00.000Z',
    domainFocus: 'geo',
    enterpriseAgent: true,
    history: [
      { role: 'user', content: 'Assess Hormuz risk' },
      { role: 'assistant', content: 'Assessment' },
    ],
    evidenceSources: ['Brief', 'Markets', 'Brief'],
    watchlist: ['XOM', 'CVX', 'XOM'],
  });

  assert.ok(mission);
  assert.deepEqual(mission?.evidenceSources, ['Brief', 'Markets']);
  assert.deepEqual(mission?.watchlist, ['XOM', 'CVX']);
  assert.equal(upsertResearchMission([], mission!)[0]?.id, 'mission-1');
});

test('watchlist and what-changed prompts preserve evidence boundaries', () => {
  const watch = buildWatchlistBriefQuery(['AAPL', 'NVDA', 'AAPL']);
  assert.match(watch, /AAPL, NVDA/);
  assert.match(watch, /Do not invent company fundamentals or exposures/);

  const changed = buildWhatChangedQuery('Previous assessment');
  assert.match(changed, /PREVIOUS BRIEF BASELINE/);
  assert.match(changed, /OBSERVED \/ INFERENCE \/ UNKNOWN/);
});

test('enterprise report escapes transcript content and includes scope metadata', () => {
  const html = buildEnterpriseReportHtml({
    title: 'Enterprise <Report>',
    exportedAt: '2026-09-24T12:00:00.000Z',
    domainFocus: 'market',
    watchlist: ['AAPL'],
    evidenceSources: ['Markets'],
    history: [
      { role: 'user', content: '<script>alert(1)</script>' },
      { role: 'assistant', content: 'Assessment & watch' },
    ],
  });

  assert.match(html, /WorldMonitor Enterprise/);
  assert.match(html, /AAPL/);
  assert.match(html, /Markets/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.equal(createMissionTitle([{ role: 'user', content: '  Long   mission title  ' }]), 'Long mission title');
});
