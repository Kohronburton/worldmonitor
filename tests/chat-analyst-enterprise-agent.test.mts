import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAnalystSystemPrompt } from '../server/worldmonitor/intelligence/v1/chat-analyst-prompt.ts';

test('Enterprise Agent prompt contract is present without widening permissions', () => {
  const prompt = buildAnalystSystemPrompt({
    timestamp: 'Thu, 24 Sep 2026 12:00:00 GMT',
    worldBrief: 'Material geopolitical development.',
    riskScores: '',
    marketImplications: 'Signals: energy risk elevated.',
    forecasts: '',
    marketData: 'AAPL $250.00 (+1.50%)',
    macroSignals: '',
    predictionMarkets: '',
    countryBrief: '',
    liveHeadlines: '',
    relevantArticles: '',
    energyExposure: '',
    coalSpotPrice: '',
    gasSpotTtf: '',
    activeSources: ['Brief', 'Signals', 'Markets'],
    degraded: false,
  }, 'all');

  assert.match(prompt, /\[ENTERPRISE AGENT MODE\]/);
  assert.match(prompt, /MISSION \/ ASSESSMENT \/ IMPACT \/ ACTION \/ WATCH/);
  assert.match(prompt, /Separate OBSERVED \/ INFERENCE \/ UNKNOWN/);
  assert.match(prompt, /keep ACTION items advisory unless a separate dashboard-control action is explicitly emitted and permitted by the client/);
});
