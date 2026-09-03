# WebMCP architecture

```text
Agent → Chromium WebMCP → injected bridge-v2.js → same-origin Next.js API
                                                → services → Prisma → Neon
```

The Worker is a constrained HTML proxy and asset host. It does not turn the site into a traditional MCP server. The bridge is the browser-resident capability layer; every operation remains subject to the storefront's authentication and authorization checks.

The static TypeScript registry supplies contract-level tests. `bridge-v2.js` is the deployed runtime equivalent and is tested separately because Worker assets are not bundled from TypeScript.
