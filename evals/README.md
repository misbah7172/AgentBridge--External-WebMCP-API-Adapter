# WebMCP evaluation datasets

The datasets use the adapter's actual tool names and generic entities. They deliberately do not encode live catalog products, identifiers, or prices. `run.mjs` requests a JSON-only plan from a configured OpenAI-compatible Responses API, compares tool names, exact supplied arguments, and ordered chains, then writes machine-readable results.

`tool-selection.json` covers direct and negative intent, `arguments.json` covers argument extraction, `chains.json` covers ordered tool chains, and `failure-recovery.json` records recovery expectations.
