# AgentBridge WebMCP Adapter

## 1. Project Overview

An external Cloudflare Worker injects browser-native WebMCP tools into the AgentBridge storefront without changing its Next.js source.

## 2. Problem Statement

Agents need stable semantic capabilities, not fragile click paths, while the origin must retain its existing authorization and commerce controls.

## 3. Solution / Approach

The Worker injects a constrained imperative bridge that calls existing same-origin APIs using browser sessions.

## 4. What is WebMCP?

WebMCP lets a website expose tools to a browser-resident AI agent through `document.modelContext`.

## 5. Why WebMCP?

Structured tools reduce ambiguous UI navigation and make errors, IDs, and state transitions explicit.

## 6. System Architecture

Agent → Chromium WebMCP → Worker-injected bridge → Next.js API → services → Prisma → Neon. See [architecture](docs/webmcp-architecture.md).

## 7. Agent ↔ Browser ↔ WebMCP Flow

The browser discovers registered tools, invokes one with JSON arguments, and the bridge returns the origin API's structured result.

## 8. WebMCP Tools

17 fixed tools cover catalog, cart, wishlist, orders, recommendations, and shipping. Checkout is intentionally not exposed.

## 9. Tool Discovery

The bridge calls `document.modelContext.registerTool` only when WebMCP exists; normal visitors are unaffected.

## 10. Tool Schemas & Contracts

Schemas use required IDs, bounded quantities, enums, and structured failures. See [audit](docs/webmcp-audit.md).

## 11. Agent Interaction / User Journeys

Search → details; search → add to cart → inspect cart; inspect cart → remove; and shipping estimation are supported.

## 12. State-Aware Tool Exposure

Cart mutation tools register after a populated cart is detected or an add succeeds. See [state model](docs/webmcp-state-model.md).

## 13. Error Handling & Safety

Failures return `{ success: false, error: { code, message, retryable } }`; authentication, validation, and network failures are distinct.

## 14. Multi-Step Tool Execution

Tool outputs include IDs and cart state needed by the next step; callers must stop when `success` is false.

## 15. Failure & Recovery Handling

Retry temporary errors only; ask the user to log in for authentication and correct invalid IDs. See [failure modes](docs/webmcp-failure-modes.md).

## 16. Testing Strategy

Separate deterministic contracts, runtime bridge tests, browser E2E, and probabilistic LLM evaluation.

## 17. Deterministic Tests

`npm test` and `npm run test:webmcp` test registry/schemas, invalid inputs, cart-aware registration, and structured failures.

## 18. LLM / Probabilistic Evaluations

`npm run eval:webmcp` uses a configured Responses API provider and repeats generic cases. It does not invent results without a key.

## 19. Browser / E2E Evaluations

The storefront Playwright suite is configured for a disposable deployment and verifies tool-caused UI state changes.

## 20. WebMCP Inspector Validation

Browser evidence and the remaining Inspector checklist are in [validation](docs/webmcp-validation.md).

## 21. Evaluation Metrics

Selection accuracy, argument accuracy, chain success, wrong-tool/argument rates, and latency are emitted to `eval-results/`.

## 22. Results / Benchmarks

Only generated evaluation output is a result. No LLM, v2-browser, or baseline metric is claimed before it is measured.

## 23. Demo

Discover tools, search, sign in with a disposable user, add a returned product ID, inspect cart, and verify the UI.

## 24. Screenshots / Demo GIF / Video

Capture post-deploy Inspector and header evidence under `docs/evidence/`; see the validation checklist.

## 25. Tech Stack

Cloudflare Workers, TypeScript, WebMCP imperative API, Vitest, Playwright, Next.js, Prisma, and Neon PostgreSQL.

## 26. Project Structure

`worker/` proxies and injects; `public/` contains runtime bridge assets; `src/` contains contracts; `tests/` deterministic checks; `evals/` datasets/runner; `docs/` evidence.

## 27. Setup & Installation

Run `npm ci` in this repository, configure Worker variables, then deploy with Wrangler or Workers Builds.

## 28. Environment Variables

`AGENTBRIDGE_ORIGIN`, `E2E_BASE_URL`, `E2E_EMAIL`, `E2E_PASSWORD`, and optional `OPENAI_API_KEY`, `LLM_EVAL_MODEL`, `LLM_EVAL_TRIALS`. Never commit secrets.

## 29. Running the Application

Configure `wrangler.toml` with the isolated origin, then run `npx wrangler dev` or deploy through Cloudflare.

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
