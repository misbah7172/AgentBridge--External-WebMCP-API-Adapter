# WebMCP audit

## Classification

**B — partially correct WebMCP implementation.** The Worker injects an imperative `document.modelContext.registerTool` bridge into proxied HTML. It is browser-native WebMCP, not a remote MCP server. The original bridge duplicated the TypeScript registry, lacked runtime validation/retryability, and exposed real-order checkout. The v2 bridge removes checkout, validates inputs, normalizes failures, and conditionally registers populated-cart tools.

## Architecture and execution

The Cloudflare Worker proxies the Next.js storefront. For HTML only, `HTMLRewriter` adds the bridge asset. A browser agent discovers tools from `document.modelContext`; bridge executors call same-origin `/api/*` using browser cookies; Next.js routes call Prisma services; Prisma uses Neon PostgreSQL.

## Inventory and state

The 17 canonical tools are catalog search/details/filter/sort/recommendations/shipping; cart read/add/update/remove/coupon; wishlist read/add/remove; and order history/details/cancel. Public tools register for every visitor. Authenticated tools register only after `/api/auth/session` confirms a user. `update_cart`, `remove_from_cart`, and `apply_coupon` register only after a populated authenticated cart is detected. Checkout is intentionally absent.

## Changes deliberately avoided

No storefront API, database schema, authentication protocol, payment behavior, or catalog data was replaced. The adapter has no arbitrary HTTP capability and does not expose cookies or credentials.
