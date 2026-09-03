# WebMCP browser validation evidence

## Recorded observation

On 2026-09-01, Chrome's WebMCP inspection surface discovered the Worker-injected bridge on the `workers.dev` adapter origin and exposed 18 original tools. Manual execution of `search_products`, `get_cart`, cart add, and cart removal returned structured origin API responses; browser cart UI changed after mutations. The custom `misba.ninja` route did not inject the bridge at that time, while the `workers.dev` origin did.

## V2 deployment evidence

The following Chrome DevTools Network captures were collected on 2026-09-03 from `https://agentbridge--external-webmcp-api-adapter.mmisba221373.workers.dev/`:

| Evidence | Observed result |
| --- | --- |
| [Worker HTML response](evidence/worker-html-response.png) | `GET /` returned `200 OK` with HTML from the Worker origin. |
| [Bridge asset response](evidence/bridge-v2-asset-response.png) | `GET /__agentbridge-webmcp/bridge-v2.js` returned `304 Not Modified`, `Content-Type: text/javascript`, proving the deployed page requests the hardened bridge asset. |
| [Anonymous cart response](evidence/unauthenticated-cart-response.png) | `GET /api/cart` returned `401 Unauthorized` with `Content-Type: application/json`, confirming the origin authentication boundary remains enforced. |

This validates Worker injection, static bridge delivery, and unauthenticated API protection. It does not by itself prove Inspector discovery, all 17 schemas, or authenticated state transitions. Capture those separately with a disposable account before claiming complete browser coverage. Do not claim a custom-domain pass until its injected script is visible in page source.
