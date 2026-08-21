# ANALYTICS CONTRACT (§T)

> **Status:** CONTRACT ONLY (Sprint F). Defines the event names + properties for the Duk economy / acquisition
> funnel. Rides the **existing** `trackProductEvent` → `product_events` pipeline (migration
> `20260819000300_product_events.sql`, with a stable `analytics_key`). **No PII** in any payload. Events are
> emitted by future feature code; this sprint only fixes the schema so the funnel is measurable from day one.

## 1. Rules

- Event names are `snake_case`, stable, and versioned only by adding (never renaming) properties.
- **No PII**: no birth data, question text, answer text, email, name, device ids. Only ids that are already
  non-identifying (`analytics_key`, product/pack ids) and numeric aggregates.
- Duk amounts are integers; never attach a raw ledger row.
- Reuse existing events where they already exist (do not duplicate).

## 2. Event catalog

### 2.1 Acquisition / onboarding
| Event | Status | Key properties |
|---|---|---|
| `home_compatibility_impression` | NEW | `days_since_signup`, `duk_balance` |
| `first_action_after_onboarding` | NEW | `action` (`today`/`consultation`/`compatibility`/`browse`) |
| `onboarding_completed` | EXISTS | — |

### 2.2 Duk grants / spend
| Event | Status | Key properties |
|---|---|---|
| `welcome_duk_granted` | NEW | `amount` |
| `candle_lit` | NEW | `amount`, `day_index` (days since signup), `accelerated` (bool) |
| `birthday_duk_granted` | NEW | `amount` |
| `duk_spent` | NEW | `reason`, `amount`, `bucket_breakdown` `{plus,reward,paid}`, `session_id` |
| `duk_exhausted` | NEW | `attempted_reason`, `shortfall` |

### 2.3 Compatibility funnel
| Event | Status | Key properties |
|---|---|---|
| `compatibility_viewed` | NEW | `duk_balance` |
| `compatibility_insufficient_duk` | NEW | see §3 (the key acquisition-gap event) |
| `compatibility_started` | NEW | `session_id` |
| `compatibility_completed` | NEW | `session_id`, `turn_count` |

### 2.4 Consultation funnel
| Event | Status | Key properties |
|---|---|---|
| `consultation_started` | NEW | `session_id`, `origin` (`home`/`popular`/`direct`) |
| `consultation_completed` | NEW | `session_id`, `turn_count` |
| `popular_question_impression` / `_click` / `_consultation_start` | EXISTS | reuse |

### 2.5 Monetization
| Event | Status | Key properties |
|---|---|---|
| `paywall_viewed` | NEW | `trigger` (`insufficient_duk`/`compatibility`/`report`), `duk_balance` |
| `first_pack_purchased` | NEW | `pack_type`, `duk_granted`, `price_krw` |
| `repeat_purchase` | NEW | `pack_type`, `duk_granted`, `price_krw` |
| `plus_viewed` | NEW | `entry` |
| `plus_subscribed` | NEW | `price_krw`, `monthly_duk` |

### 2.6 Session
| Event | Status | Key properties |
|---|---|---|
| `session_turn_count` | NEW | `session_id`, `product`, `turn_count`, `outcome` (`complete`/`expired`/`abandoned`) |
| `session_expired` | NEW | `session_id`, `turns_used` |

## 3. `compatibility_insufficient_duk` (the acquisition-gap probe)

This is the highest-value event: it measures the intentional day-1 compatibility gap (§O). **Exact properties:**

```
{
  duk_balance_at_entry: number,
  duk_shortfall: number,          // price − balance (e.g. 1 on signup day)
  reward_duk_balance: number,
  paid_duk_balance: number,
  plus_duk_balance: number,
  prior_consultation_count: number,
  days_since_signup: number
}
```

No PII. This lets the owner see, e.g., "users hit compatibility with a shortfall of exactly 1 on day 0 and
convert to a pack at X%," which directly informs whether the gap should be 1, 2, or bridged by a first pack.

## 4. Implementation note

Add a `trackEconomyEvent(...)` (mirroring `trackTodayEvent` / `trackMonthlyEvent`) that calls the shared
`trackProductEvent` with these names. Keep the `analytics_key` origin stable (as popular-questions does) so the
funnel joins across events without any text matching. Not built this sprint.
