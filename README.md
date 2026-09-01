# AgentBridge WebMCP Adapter

This is a website-specific external compatibility layer for AgentBridge. It manually exposes approved WebMCP tools for the known AgentBridge REST API without modifying the original storefront source.

## Boundaries

- The adapter is fixed to `https://shop.example.com`.
- It has no arbitrary HTTP tool and does not inspect or generate tools dynamically.
- Authenticated calls use the existing browser session with `credentials: include`; cookies, tokens, and passwords never enter tool responses or logs.
- Checkout returns a confirmation requirement until explicitly invoked with `confirmed: true`.

## Architecture

AI agent → Browser WebMCP → injected bridge → fixed AgentBridge tool registry → constrained API executor → AgentBridge REST API.

The Cloudflare Worker proxies AgentBridge HTML and injects the bridge only into that traffic. The development inspector is at `__agentbridge-webmcp/inspector`.

## Commands

Run `npm install`, `npm run build`, and `npm test`. Deploy with Wrangler only after configuring a real AgentBridge origin and the bridge-asset build step.
