# WebMCP evaluation

Deterministic checks cover the canonical registry, schemas, validation, dynamic cart exposure, structured output, and safe checkout omission. `evals/` contains generic direct, argument, chain, negative, and recovery cases. `npm run eval:webmcp` performs three trials per case by default when an OpenAI-compatible Responses API key is configured and writes `eval-results/`.

Metrics are tool-selection accuracy, argument accuracy, chain success, wrong-tool rate, wrong-argument rate, and mean model latency. No metric is reported until the runner completes with a configured provider. Browser E2E measures actual bridge execution followed by visible storefront state; it requires an isolated deployment and test credentials.

No browser-vs-WebMCP baseline is reported: equivalent, measured browser-only journeys have not been run.
