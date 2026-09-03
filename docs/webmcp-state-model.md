# WebMCP state model

| State | Exposed behavior | Safe result |
| --- | --- | --- |
| Anonymous | Public catalog tools; authenticated tool calls remain registered where safe | `AUTH_REQUIRED` with `retryable: false` |
| Authenticated, empty cart | `get_cart`, `add_to_cart` | Mutation creates a cart item and enables cart-management tools for this page |
| Authenticated, populated cart | `update_cart`, `remove_from_cart`, `apply_coupon` additionally registered | Origin validates item, stock, and coupon state |
| Cart becomes empty | Existing browser registrations cannot be unregistered by the currently available imperative API | Origin returns structured state/not-found errors; page reload restores minimal exposure |
| Order history | Read/cancel tools | Origin enforces order ownership and cancellability |
| Checkout | Not exposed | Real-order checkout requires a dedicated sandbox before it can be safely evaluated |

Tool registration is not authorization. Every call validates schema, session, resource ownership, and business state again at the origin.
