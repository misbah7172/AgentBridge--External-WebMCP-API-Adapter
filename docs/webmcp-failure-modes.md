# WebMCP failure modes

| Failure | Detection and response | Test coverage |
| --- | --- | --- |
| Wrong tool | Clear capability names; state-aware cart registration | LLM selection dataset |
| Invalid arguments | Runtime validation returns `VALIDATION_ERROR`, non-retryable | Unit and bridge-runtime tests |
| Authentication | Origin 401 maps to `AUTH_REQUIRED` | Deterministic API executor behavior |
| Missing resource/state conflict | Origin error payload is preserved with status-derived retryability | Service/API tests required per origin route |
| Temporary API failure | Network failure returns `API_UNAVAILABLE`, retryable | Bridge contract |
| Malformed API payload | `MALFORMED_RESPONSE`, retryable | Bridge contract |
| Mid-chain failure | Caller must stop on `success: false`; checkout is unavailable | Failure-recovery dataset |

The bridge never treats a failed API response as success and never continues a checkout flow.
