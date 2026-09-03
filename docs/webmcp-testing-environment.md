# WebMCP testing environment

Use Node 22+, npm, the repository's pinned TypeScript/Vitest versions, Chromium with WebMCP enabled, and a separate adapter Worker target. Copy environment values without committing secrets:

```text
AGENTBRIDGE_ORIGIN=https://<isolated-storefront>
E2E_BASE_URL=https://<isolated-adapter>
E2E_EMAIL=<dedicated-test-user>
E2E_PASSWORD=<dedicated-test-password>
OPENAI_API_KEY=<optional-evaluation-key>
LLM_EVAL_MODEL=gpt-4.1-mini
LLM_EVAL_TRIALS=3
```

The production Neon database must not be used for state-mutating E2E work. Seed a disposable database and dedicated user, deploy an adapter pointed only at that environment, and clean its cart after each test. Run `npm test`, `npm run test:webmcp`, `npm run eval:webmcp`, and the storefront's `npm run test:e2e`.
