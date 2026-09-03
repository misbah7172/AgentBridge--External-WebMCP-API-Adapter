# WebMCP browser validation evidence

## Recorded observation

On 2026-09-01, Chrome's WebMCP inspection surface discovered the Worker-injected bridge on the `workers.dev` adapter origin and exposed 18 original tools. Manual execution of `search_products`, `get_cart`, cart add, and cart removal returned structured origin API responses; browser cart UI changed after mutations. The custom `misba.ninja` route did not inject the bridge at that time, while the `workers.dev` origin did.

## Current validation requirement

The v2 bridge changes inventory to 17 tools and removes checkout. The earlier observation is therefore historical evidence, not a v2 pass. After deployment, capture Inspector discovery, schema, successful public search, anonymous `AUTH_REQUIRED`, empty-cart inventory, populated-cart inventory, and response headers on the Worker origin. Store screenshots under `docs/evidence/` and record URL, date, browser build, and result. Do not claim a custom-domain pass until its injected script is visible in page source.
