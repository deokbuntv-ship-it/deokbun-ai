# 덕분이 V1 — STORE / OWNER PREPARATION CHECKLIST

> **📍 문서 권위 (2026-09-04 확정)** — **오너 액션 목록의 권위는 `OWNER_TODO.md` 로 이관됐다.** 이 문서는 **스토어 제출물의 분류 기준**(AI 준비 가능 / 오너 필수 / 빌드 의존)만 소유한다.
> 전체 서열: `OWNER_TODO.md`(오너 액션) · `PROJECT_STATE.md`(운영 상태) · `FEATURE_MASTER_CHECKLIST.md`(기능 판정) · `KNOWN_RISKS.md`(위험) · `BACKLOG_V1_1.md`(V1.1) · `DATABASE_RUNBOOK.md`(DB 적용 절차).
> 충돌 시 판정 순서: **코드 → 테스트/빌드 → 라이브 스키마·배포 실측 → git 이력 → 프로덕션 E2E → 문서.**


Consumer-facing app name: **덕분이** (never 덕분AI / DeokbunAI in user-facing copy).

Legend:
- **AI CAN PREPARE** — a draft/asset can be produced in-repo without external accounts.
- **OWNER REQUIRED** — only the owner can do it (accounts, legal identity, payments, console actions).
- **DEPENDS ON BUILD** — needs the final app build / decisions not yet frozen.

_No web research was performed for this checklist; it lists generally-valid preparation categories only.
Do not treat any Apple/Google specifics here as current account facts — verify in the live consoles._

---

## Accounts & identity
| Item | Class | Note |
|---|---|---|
| Apple Developer Program enrollment | OWNER REQUIRED | Paid; legal identity + payment. |
| Google Play Developer account | OWNER REQUIRED | Paid; identity verification. |
| Company/organization legal info (name, address, business no.) | OWNER REQUIRED | Store + funding applications. |
| Developer/support contact email | OWNER REQUIRED | Public support contact. |

## Policies & disclosures
| Item | Class | Note |
|---|---|---|
| Privacy policy (public URL) | AI CAN PREPARE (draft) → OWNER REQUIRED (host + approve) | A DRAFT exists in-app; owner must finalize + host. |
| Terms of service (public URL) | AI CAN PREPARE (draft) → OWNER REQUIRED | Same. |
| Data-safety / privacy disclosure form (what data is collected, why) | AI CAN PREPARE (inventory) → OWNER REQUIRED (submit) | Birth data + auth; no third-party sale. |
| Account-deletion path disclosure | OWNER REQUIRED | Stores require a stated deletion route. |

## Store listing assets
| Item | Class | Note |
|---|---|---|
| App icon | DEPENDS ON BUILD | Final brand icon. |
| Screenshots (per device size) | DEPENDS ON BUILD | From the finished UI. |
| Listing copy (name, subtitle, description, keywords) | AI CAN PREPARE (draft) | Must pass `PRODUCT_TRUTH_GUARD.md` — no consensus/ranking/best-time claims. |
| Category / age rating questionnaire | OWNER REQUIRED | Owner answers in console. |
| Support / marketing URL | OWNER REQUIRED | Public site. |

## Build & branding consistency
| Item | Class | Note |
|---|---|---|
| iOS bundle identifier / Android package name | DEPENDS ON BUILD | Keep stable across releases (do not change for a display-name change). |
| User-facing brand = 덕분이 everywhere | AI CAN PREPARE (audit) | Verified: bundle shows 덕분이, no 덕분AI leak. |
| Store display name consistency | OWNER REQUIRED | Match the app + listing. |
| Crisis/safety resource localization (자살예방 109 등) | OWNER REQUIRED | Verify the crisis contacts in the safety router before launch. |

---

## Suggested owner order
1. Enroll both developer accounts (long lead time).
2. Finalize + host privacy policy / terms.
3. Complete data-safety disclosures.
4. Verify crisis-resource contacts (safety router).
5. Prepare listing copy against `PRODUCT_TRUTH_GUARD.md`.
6. Generate icon/screenshots from the final build.

Parallel-safe: accounts, legal info, and policy hosting can proceed now, independent of remaining
engineering work.
