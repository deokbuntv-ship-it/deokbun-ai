# DeokbunAI V1 — Policy Matrix & Code↔Policy Mapping (Sprint J7)

Classification: **IMPLEMENTED_UI** (surface exists in-app) · **DRAFT_CONTENT** (present but marked 검토 중 초안) · **LEGAL_REVIEW_REQUIRED** (needs lawyer sign-off before paid launch). No wording here is legal-final.

## §7.6 Policy surfaces
| Surface | Route | Classification |
|---|---|---|
| 서비스 이용약관 | `/terms-of-service` | IMPLEMENTED_UI · DRAFT_CONTENT · LEGAL_REVIEW_REQUIRED (now includes a paid/session clause) |
| 개인정보 처리방침 | `/privacy-policy` | IMPLEMENTED_UI · DRAFT_CONTENT · LEGAL_REVIEW_REQUIRED (now names Supabase + OpenAI processors) |
| AI 생성 콘텐츠 안내 | `/ai-notice` | IMPLEMENTED_UI (factual notice) |
| 덕 유료 이용 정책 | `/duk-policy` (NEW) | IMPLEMENTED_UI · DRAFT_CONTENT · LEGAL_REVIEW_REQUIRED |
| 환불·청약철회 정책 | `/refund-policy` (NEW) | IMPLEMENTED_UI · DRAFT_CONTENT · LEGAL_REVIEW_REQUIRED (finalize with 05B store) |
| 미성년자 이용 및 결제 안내 | `/minor-policy` (NEW) | IMPLEMENTED_UI · DRAFT_CONTENT · LEGAL_REVIEW_REQUIRED |
| 구독/PLUS 정책 | — | DEFERRED (PLUS foundation-only, not user-facing) |
| 마케팅 수신 동의 | onboarding + MY 알림 설정 | IMPLEMENTED (capture); reflected in privacy/terms drafts |

All six routes are reachable from MY and validated by `deepLinkRoutes.test.ts` + `release-preflight`.

## §7.7 Code ↔ Policy mapping (behavior → source → value → policy)
| Behavior | Source | Value | Policy surface |
|---|---|---|---|
| Welcome grant | `20260838…welcome_duk_runtime.sql`; `economy_policy.welcome_reward` | 10 (once, on consent) | 덕 정책 |
| Candle reward + cooldown | `20260832…:119-160`; policy `:15-16` | +1 / 24h | 덕 정책 |
| General / Compat / Premium cost | `economy_policy :18-20`; `pricing.ts` | 5 / 12 / 50 | 덕 정책 |
| Session turn limit / TTL | `economy_policy :21-22`; `20260833…` | 5 turns / 24h | 이용약관 §5 + 덕 정책 |
| Spend priority | `spend_duk` `20260831…:126-144` | PLUS→REWARD→PAID | 덕 정책 |
| First-turn commit charge | `complete_consultation_with_billing` `20260833…` | once/session | 환불 정책 |
| Refund/revocation → debt | `record_revocation` `20260834…:107-137` | REVERSAL + duk_debt | 환불 정책 |
| Future PAID → DEBT_OFFSET | `record_verified_purchase` `20260834…:90-101`; fix `20260843…` | offset new PAID vs debt | 환불 정책 |
| REWARD/PLUS debt-exemption | structural (debt read only in IAP) | free grants never blocked | 덕 정책 |
| Duk expiry | `grant_duk` (expires_at always null) | none currently | 덕 정책 §5 |
| AI disclosure | `aiDisclosure.ts`; on chat/compat/today/monthly/report | `ai-disclosure@2026-08-1` | AI 안내 |
| Analytics allowlist (no PII) | `productEvents.ts`; `20260830…` | categorical only | 개인정보 §analytics |
| Push consent ≠ OS permission | `20260823…:6,10-27` | service on / marketing off | 개인정보 + 마케팅 |
| Marketing consent | `profiles.marketing_opt_in`; mirror `20260840…` | opt-in, never pre-checked | 마케팅 동의 |

## Contradictions flagged (owner decisions)
1. **HIGH — Birthday reward configured but NOT granted.** `economy_policy.birthday_reward = 5` + `BIRTHDAY` is a valid ledger reason + `birthday_duk_granted` analytics event exist, but no code path grants birthday Duk (`run_birthday_notifications` only creates a notification). The `/duk-policy` DRAFT therefore states birthday reward is "정책상 정의되어 있으나 현재 지급 비활성화" (honest). **Owner decides:** wire a birthday `grant_duk` (an economy behavior change — deliberately NOT done autonomously) OR remove the config. Not wired in J7 (out of release-hardening scope + touches the economy).
2. **MEDIUM — Duk expiry.** Internal spec hypothesizes expiry windows; code sets `expires_at = null` everywhere (nothing expires). The DRAFT states "현재 유효기간 없음". Do not publish an expiry clause until code enforces it.
3. **RESOLVED — Privacy processors.** Privacy §3 now names Supabase + OpenAI as processors (was generic).
4. **RESOLVED — Terms paid clause.** Terms §5 now covers 덕/세션 (was absent), pointing to the Duk/refund policies.

## §7.8 Minor / age safety
- **Present:** a required "만 14세 이상" self-attestation checkbox at onboarding (bundled into terms acceptance), and the new `/minor-policy` DRAFT surface.
- **MISSING (LEGAL_REVIEW_REQUIRED before paid launch):** a real age gate (birthdate-based), guardian consent for IAP, minor-refund handling. Birth data is collected but used ONLY for saju/ziwei computation — there is no `currentYear − birthYear` age check anywhere. Purchase is inactive (05B deferred), so this is not yet load-bearing but must be resolved before enabling payments.
