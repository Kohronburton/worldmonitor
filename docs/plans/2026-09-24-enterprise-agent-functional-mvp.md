# WorldMonitor Enterprise — Functional MVP Plan

Branch: `feat/enterprise-agent-mvp`

## Objective

Ship an Enterprise pilot that is useful immediately using capabilities already present in WorldMonitor, while clearly separating live functionality from follow-on Enterprise infrastructure.

The first usable Enterprise version should give an operator one place to:
- ask an AI intelligence agent for decision-grade analysis;
- connect geopolitical events to markets, equities, energy, and macro risk;
- request mission briefs and "what changed" summaries;
- control supported dashboard surfaces through the existing agent bus;
- use existing forecasts, market context, news, risk scores, energy data, embeds, exports, and API/MCP capabilities;
- operate without waiting for SAML/SCIM, SIEM connectors, cargo inference, or a full air-gapped packaging program.

## Enterprise capability status

### Live now / reusable in the MVP
- Paid analyst chat and streaming responses
- Agent-bus dashboard control with operator-controlled enable/pause
- Market and equity context
- Geopolitical risk context
- AI market implications
- Forecasts and scenario simulation backend
- Company intelligence through MCP/API surfaces
- Energy and commodity context
- Satellite imagery search, including Sentinel-1 GRD SAR and Sentinel-2 L2A
- Satellite/TLE tracking
- Sanctions services
- CSV, JSON, and PDF export
- Paid embeds
- Browser fullscreen/TV panel rotation
- REST API, MCP, and agent skills
- Enterprise entitlement with unlimited daily API/MCP/dashboard-AI allowances

### Partial
- White-label: embed and branding foundations exist, but not a complete customer-brand control plane
- TV: browser TV mode exists; dedicated Android TV lifecycle is not complete
- On-prem: Docker/self-host foundations exist; deployment packaging and support hardening still need work
- Sanctions + AIS: both domains exist, but a dedicated correlation/risk engine is not yet a first-class workflow

### Build after MVP
- Organization/workspace model
- Enterprise RBAC
- SAML/OIDC SSO
- SCIM
- immutable audit log
- IP allowlists and service-account policies
- dedicated Snowflake/Splunk/Sentinel/Jira/Teams connector framework
- satellite change detection
- sanctions × AIS correlation engine
- cargo inference
- branded report templates and customer-domain white-label controls
- validated restricted-network / air-gap operating profile
- dedicated Android TV app

## Functional MVP

### 1. Enterprise Intelligence Agent

Reuse the existing `/api/chat-analyst` streaming stack instead of introducing a second AI backend.

Add an operator-selectable **Enterprise agent** mode to the existing Research Desk. When enabled, every request is marked as an Enterprise mission request. The system prompt then changes response behavior to:

- lead with the decision or material change;
- separate OBSERVED / INFERENCE / UNKNOWN;
- use a decision-oriented MISSION / ASSESSMENT / IMPACT / ACTION / WATCH structure where appropriate;
- trace geopolitical events into policy/supply/liquidity effects and then into commodities, rates, FX, sectors, and equities;
- avoid invented company fundamentals, exposures, valuations, targets, or unsupported operational claims;
- call out missing coverage explicitly;
- keep actions advisory unless the operator separately enables the existing dashboard-control switch.

This produces a usable Enterprise copilot immediately without widening backend permissions.

### 2. Enterprise mission shortcuts

Provide quick tasks for:
- Mission Brief
- Geo → Market Impact
- Equity / Company Research
- Energy / Supply Risk
- Scenario / Forecast
- Risk Radar

Shortcuts must stay inside the evidence actually supplied to the analyst context.

### 3. Operator safety model

Enterprise Agent mode and dashboard control remain separate controls.

- **Enterprise agent** changes analysis style and mission framing.
- **Control dashboard** is the existing explicit action permission.
- Dashboard control can still be paused independently.
- No Enterprise-mode prompt should silently enable actions.

### 4. Current data path

The Enterprise Agent MVP should use the current analyst context:
- relevant matched articles
- world brief
- country instability/risk scores
- market implications
- forecasts
- stock/commodity market data
- macro signals
- prediction markets
- country brief
- live headlines
- energy exposure
- gas storage / electricity / SPR / refinery / oil-gas flow data when relevant

The MVP does **not** pretend the chat context includes every Enterprise backend. Sanctions, imagery, deep company intelligence, and other specialized services remain accessible through their existing panels/API/MCP paths until explicitly joined into the chat context.

## Near-term Enterprise build sequence

### Phase A — usable now
1. Enterprise Agent mode in Research Desk
2. Mission shortcuts
3. enterprise-specific system-prompt contract
4. regression test for Enterprise prompt behavior
5. this capability/status plan in repo

### Phase B — Research Desk
1. saved mission/research threads
2. country/ticker/sector/commodity watchlists
3. source-linked evidence drawer
4. one-click "what changed since last brief"
5. branded PDF intelligence report
6. scheduled morning/evening mission briefs

### Phase C — organizational controls
1. organization/workspace entity
2. users and teams
3. RBAC
4. SSO
5. SCIM
6. audit log
7. service accounts / display tokens

### Phase D — differentiated intelligence
1. satellite change detection
2. sanctions × AIS correlation
3. cargo inference
4. customer data connector framework
5. private agents with tool allowlists and approval rules

### Phase E — deployment
1. dedicated tenant deployment
2. hardened Docker/on-prem bundle
3. local-model option
4. telemetry-disable profile
5. mirrored/offline feeds
6. restricted-network validation
7. true air-gap operating package

## Definition of done for this branch

The branch is a successful Enterprise pilot when:
- the existing Research Desk exposes a visible Enterprise Agent toggle;
- the toggle persists locally;
- Enterprise mode marks outbound analyst requests without changing the visible user message;
- the server prompt defines Enterprise mission behavior and evidence boundaries;
- dashboard control remains a distinct, explicit permission;
- the existing non-Enterprise Research Desk flow continues to work;
- a test asserts that the Enterprise system prompt contract is present.

## Explicit non-goals for this branch

Do not claim these are complete merely because the marketing page mentions them:
- SAML/SCIM
- full Enterprise RBAC
- Snowflake/Splunk/Sentinel/Jira/Teams connectors
- dedicated Android TV app
- true air-gap certification
- automated satellite change detection
- cargo inference
- automatic sanctions/AIS correlation

Those are separate production workstreams and should be tracked as such.
