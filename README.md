# AgentBridge WebMCP Adapter

## 1. Project Overview

An external [Cloudflare Worker](worker/index.ts) injects browser-native WebMCP tools into the AgentBridge storefront without changing its Next.js source. The Worker receives browser traffic, proxies it to the configured origin, and adds the browser bridge only to HTML responses.

## 2. Problem Statement

Agents need stable semantic capabilities, not fragile click paths, while the origin must retain its existing authorization and commerce controls.

## 3. Solution / Approach

The Worker injects the constrained [runtime bridge](public/__agentbridge-webmcp/bridge-v2.js), which calls the origin's existing same-origin APIs using the browser's authenticated session.

## 4. What is WebMCP?

WebMCP lets a website expose tools to a browser-resident AI agent through `document.modelContext`.

## 5. Why WebMCP?

Structured tools reduce ambiguous UI navigation and make errors, IDs, and state transitions explicit.

## 6. System Architecture

```text
┌──────────────┐    HTTPS     ┌──────────────────────────────┐
│ User / Agent │ ───────────► │ Cloudflare Worker            │
│ in Chromium  │              │ worker/index.ts              │
└──────┬───────┘              │ • proxies to origin          │
       │                      │ • injects bridge-v2.js       │
       │ WebMCP tools         └──────────────┬───────────────┘
       ▼                                     │ proxied HTTPS
┌──────────────┐                             ▼
│ document.    │                  ┌──────────────────────────┐
│ modelContext │◄─ bridge-v2.js ─►│ AgentBridge Next.js app  │
└──────┬───────┘                  │ /api → services → Prisma │
       │ tool call                 │ → Neon PostgreSQL        │
       └──────────────────────────►└──────────────────────────┘
```

Connection details are defined in [wrangler.toml](wrangler.toml): `AGENTBRIDGE_ORIGIN` is the storefront target, [`worker/index.ts`](worker/index.ts) injects the bridge asset, and [`bridge-v2.js`](public/__agentbridge-webmcp/bridge-v2.js) registers tools with the browser. See the fuller [architecture document](docs/webmcp-architecture.md).

## 7. Agent ↔ Browser ↔ WebMCP Flow

1. The browser opens the Worker URL or a Cloudflare route mapped to that Worker.
2. The Worker fetches the configured origin and injects `/__agentbridge-webmcp/bridge-v2.js` into HTML.
3. The bridge calls `document.modelContext.registerTool` for permitted capabilities.
4. The agent discovers a schema, invokes a tool with JSON arguments, and the bridge calls `/api/*` on the Worker origin.
5. The Worker proxies the API request to the storefront; the storefront still performs authentication, validation, stock, ownership, and business-rule checks.
6. The structured API result returns through the bridge to the agent; a state change is then visible in the website UI.

The [deployment evidence](docs/webmcp-validation.md#v2-deployment-evidence) shows the Worker response, injected `bridge-v2.js` request, and protected anonymous cart request.

## 8. WebMCP Tools

17 fixed tools cover catalog, cart, wishlist, orders, recommendations, and shipping. The canonical list is in [`src/registry/toolRegistry.ts`](src/registry/toolRegistry.ts); runtime definitions are in [`bridge-v2.js`](public/__agentbridge-webmcp/bridge-v2.js). Checkout is intentionally not exposed because the origin lacks an isolated payment sandbox.

## 9. Tool Discovery

The bridge calls `document.modelContext.registerTool` only when WebMCP exists; normal visitors are unaffected. Inspect the live Worker [tool inventory endpoint](https://agentbridge--external-webmcp-api-adapter.mmisba221373.workers.dev/__agentbridge-webmcp/inspector) and follow the [browser validation guide](docs/webmcp-validation.md).

## 10. Tool Schemas & Contracts

Schemas use required IDs, bounded quantities, enums, and structured failures. See the [audited contracts](docs/webmcp-audit.md), [TypeScript contract definitions](src/tools/index.ts), and [runtime validation implementation](public/__agentbridge-webmcp/bridge-v2.js).

## 11. Agent Interaction / User Journeys

Search → details; search → add to cart → inspect cart; inspect cart → remove; and shipping estimation are supported.

## 12. State-Aware Tool Exposure

Public catalog tools register for every visitor. Account, cart, wishlist, and order tools register only after `/api/auth/session` confirms a signed-in user; cart mutation tools register only after a populated cart is detected or an add succeeds. See [state model](docs/webmcp-state-model.md).

## 13. Error Handling & Safety

Failures return `{ success: false, error: { code, message, retryable } }`; authentication, validation, and network failures are distinct.

## 14. Multi-Step Tool Execution

Tool outputs include IDs and cart state needed by the next step; callers must stop when `success` is false.

## 15. Failure & Recovery Handling

Retry temporary errors only; ask the user to log in for authentication and correct invalid IDs. See [failure modes](docs/webmcp-failure-modes.md).

## 16. Testing Strategy

Separate deterministic [contract tests](tests/tool-contracts.test.ts), [runtime bridge tests](tests/bridge-runtime.test.ts), [browser E2E](../AgentBridge--External-WebMCP-Powered-E-Commerce-Platform-API/tests/e2e/webmcp-cart.spec.ts), and [probabilistic LLM evaluation](evals/README.md).

## 17. Deterministic Tests

`npm test` and `npm run test:webmcp` test registry/schemas, invalid inputs, cart-aware registration, and structured failures. See [final validation](docs/final-validation.md) for the recorded result.

## 18. LLM / Probabilistic Evaluations

`npm run eval:webmcp` uses a configured Responses API provider and repeats generic cases. It does not invent results without a key.

## 19. Browser / E2E Evaluations

The storefront [Playwright journey](../AgentBridge--External-WebMCP-Powered-E-Commerce-Platform-API/tests/e2e/webmcp-cart.spec.ts) uses a disposable deployment and verifies tool-caused search, detail, cart add/remove, inspection, and visible UI state changes.

## 20. WebMCP Inspector Validation

Browser evidence and the remaining Inspector checklist are in [validation](docs/webmcp-validation.md), including the versioned [response screenshots](docs/evidence/).

## 21. Evaluation Metrics

Selection accuracy, argument accuracy, chain success, wrong-tool/argument rates, and latency are emitted to `eval-results/`.

## 22. Results / Benchmarks

Only generated evaluation output is a result. No LLM, v2-browser, or baseline metric is claimed before it is measured.

## 23. Demo

Follow the [demo flow](docs/webmcp-final-report.md#reliable-demo-flow): open the Worker origin, discover tools, search, sign in with a disposable user, add a returned product ID, inspect the cart, and verify the UI.

## 24. Screenshots / Demo GIF / Video

Current response captures are [Worker HTML](docs/evidence/worker-html-response.png), [bridge asset](docs/evidence/bridge-v2-asset-response.png), and [anonymous cart protection](docs/evidence/unauthenticated-cart-response.png). See the [validation checklist](docs/webmcp-validation.md) for remaining Inspector captures.

## 25. Tech Stack

Cloudflare Workers, TypeScript, WebMCP imperative API, Vitest, Playwright, Next.js, Prisma, and Neon PostgreSQL.

## 26. Project Structure

- [`worker/`](worker/) — Cloudflare proxy and HTML injection.
- [`public/`](public/) — browser bridge assets served by Worker Assets.
- [`src/`](src/) — typed tool contracts, safety rules, and executors.
- [`tests/`](tests/) — deterministic registry and runtime checks.
- [`evals/`](evals/) — generic datasets and provider runner.
- [`docs/`](docs/) — audit, validation, reports, and evidence.

## 27. Setup & Installation

Run `npm ci`, set the origin in [wrangler.toml](wrangler.toml) or Cloudflare Worker variables, then deploy with `npx wrangler deploy` or [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/). The full isolated setup is in [webmcp-testing-environment.md](docs/webmcp-testing-environment.md).

## 28. Environment Variables

`AGENTBRIDGE_ORIGIN`, `E2E_BASE_URL`, `E2E_EMAIL`, `E2E_PASSWORD`, and optional `OPENAI_API_KEY`, `LLM_EVAL_MODEL`, `LLM_EVAL_TRIALS`. Never commit secrets.

## 29. Running the Application

Configure [`wrangler.toml`](wrangler.toml) with an origin you control, run `npx wrangler dev` for local proxy testing, or deploy through Cloudflare. Map a Cloudflare Worker route to the storefront domain only after confirming the Worker origin works; then verify the injected bridge request in [DevTools](docs/webmcp-validation.md#v2-deployment-evidence).

For a seeded local demo origin, use `customer@example.com` or `admin@example.com` with `ChangeMe123!`. These are public seed credentials only; replace them for every non-demo deployment. The authoritative setup notes are in the storefront repository.

## 30. Running Tests

Run `npm test`, `npm run test:webmcp`, and from the storefront `npm run test:e2e`.

## 31. Running WebMCP Evaluations

Set a provider key and run `npm run eval:webmcp`; JSON and Markdown results appear in ignored `eval-results/`.

## 32. Reproducibility

Use the isolated environment and exact commands in [testing environment](docs/webmcp-testing-environment.md).

## 33. Security Considerations

No arbitrary HTTP capability, credentials never enter tool output, origin authorization remains authoritative, and real checkout is omitted.

## 34. Limitations

Current imperative WebMCP registration cannot safely remove a tool mid-page; reload restores empty-cart exposure.

## 35. Future Improvements

Add a payment sandbox, contract generation to eliminate bridge duplication, CI browser capture, and an equivalent browser-only baseline.

## 36. Hackathon Requirements / How the Project Addresses Them

The project supplies audited browser-native tools, state/safety documentation, deterministic tests, evaluation datasets, runner, and honest evidence boundaries.

## 37. References

[Chrome WebMCP](https://developer.chrome.com/docs/ai/webmcp) and [WebMCP evaluations](https://developer.chrome.com/docs/ai/webmcp/evals).

## 38. License

Distributed under the [MIT License](LICENSE).
