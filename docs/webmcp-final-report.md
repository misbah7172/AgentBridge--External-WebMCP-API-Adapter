# WebMCP final report

## Executive summary

AgentBridge uses an external Worker-injected imperative WebMCP bridge over the existing Next.js/Prisma storefront. This hardening pass removes unsafe real-order checkout exposure, adds structured validation/error semantics, introduces cart-aware registration, deterministic runtime tests, evaluation datasets, and reproducibility documentation.

## Measured status

Deterministic validation passed **9/9 adapter tests** on 2026-09-03; the storefront's existing service suite passed **2/2 tests**. LLM metrics are **not measured** until `OPENAI_API_KEY` is configured and `npm run eval:webmcp` completes. V2 browser evidence is **pending redeployment and Inspector capture**. No browser-only baseline was measured.

## Reliable demo flow

Open the adapter Worker origin in a WebMCP-enabled Chromium build; inspect tools; search a product; authenticate with a disposable user; add its returned ID; inspect cart; verify the cart UI. Do not demonstrate checkout.

## Known limitations

The imperative browser API does not provide a safe unregistration mechanism for an already exposed tool, so a reload restores minimal cart exposure after the cart becomes empty. The external bridge is intentionally duplicated from the TypeScript contract registry and requires contract tests to prevent drift.
