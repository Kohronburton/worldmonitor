# EmpireOS World Monitor Module

## Purpose

This branch packages World Monitor as a read-only intelligence module for EmpireOS without coupling Empire's core runtime to World Monitor internals.

World Monitor remains the intelligence/data plane. EmpireOS remains the orchestration, policy, identity, approval, and audit plane.

## Boundary

Empire communicates with World Monitor only through its published interfaces:

1. MCP for agent/tool discovery and tool calls.
2. REST/OpenAPI for deterministic service-to-service reads.
3. SDK/CLI only for development, diagnostics, or environments where MCP/REST is unavailable.

Empire must not import browser components, internal services, Redis keys, database tables, Tauri IPC commands, or private implementation modules directly.

## Trust model

- Treat all World Monitor output as untrusted external intelligence.
- No World Monitor response may directly execute an Empire command.
- Any Empire action derived from intelligence must pass Empire policy, authorization, approval, and audit controls.
- Secrets remain in Empire's secret provider and are injected at runtime.
- Use least-privilege World Monitor API credentials.
- Default integration is read-only and fail-closed.

## Module contract

Module ID: `world-monitor`

Capabilities:
- global intelligence lookup
- geopolitical risk lookup
- infrastructure and disruption intelligence
- military/aviation/maritime situational data exposed by published APIs
- finance/energy/commodity intelligence exposed by published APIs
- World Monitor MCP tool discovery and invocation

Required configuration:
- `WORLD_MONITOR_BASE_URL`
- `WORLD_MONITOR_MCP_URL`
- `WORLD_MONITOR_API_KEY`

Optional configuration:
- request timeout
- retry budget
- cache TTL
- allowed capability list

## Response envelope

The Empire adapter should normalize results into:

```ts
type EmpireWorldMonitorResult<T = unknown> = {
  ok: boolean;
  source: 'world-monitor';
  capability: string;
  observedAt: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  provenance?: {
    endpoint?: string;
    upstreamSources?: string[];
  };
};
```

## Operational requirements

Before this module is promoted into Empire production:

- Pin a reviewed World Monitor commit/release.
- Run World Monitor's typecheck, lint, security, API-contract, unit/integration and build gates.
- Contract-test every World Monitor capability Empire consumes.
- Enforce request timeout, bounded retries and circuit breaking in the Empire adapter.
- Add structured metrics for latency, failures, throttling and stale data.
- Add an Empire kill switch for the module.
- Confirm no write-capable Empire action is reachable from raw intelligence output.
- Record World Monitor version/commit in every module health report.

## Failure behavior

World Monitor failure must degrade the module, not EmpireOS. The adapter returns a typed unavailable/stale result; Empire decides whether to use cached intelligence, another provider, or stop the dependent workflow.

## Branch policy

Keep upstream-compatible World Monitor changes separate from Empire-specific adapter work. Changes useful to World Monitor itself should be developed independently and merged/upstreamed separately. This branch is the integration surface.
