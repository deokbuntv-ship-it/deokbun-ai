# DeokbunAI V1 — Mobile Device QA Matrix (Sprint J7)

Executable checklist for a future **real-device** QA run (iOS + Android). Do NOT mark `DEVICE_QA_PASS` without running on physical devices — the app requires native modules (OAuth, IAP, deep links) and is not fully exercisable in Expo Go / web export. Run each row on **both** platforms; mark PASS / FAIL / N-A + note the build (dev / internal).

Legend: ☐ not run · ✅ pass · ❌ fail

| # | Flow | Steps | Expected | iOS | Android |
|---|---|---|---|---|---|
| 1 | Install & launch | fresh install, cold start | splash → onboarding gate (not a blank screen) | ☐ | ☐ |
| 2 | OAuth login | Kakao / Naver / Google | returns to app authenticated; no dead callback | ☐ | ☐ |
| 3 | Onboarding — terms | accept required terms | consent saved; proceeds to birth | ☐ | ☐ |
| 4 | Onboarding — birth input | enter birth year/month/day/time | validates; creates SELF subject | ☐ | ☐ |
| 5 | Welcome | land on Home first time | one-shot "+10덕" card shows; economy explained | ☐ | ☐ |
| 6 | Home 덕 chip | view Home | chip shows balance; tap → /wallet | ☐ | ☐ |
| 7 | Candle | /wallet → light candle | +1덕; disabled during claim; cooldown after | ☐ | ☐ |
| 8 | General consultation | ask a question | loading → answer; 5덕 charged once; AI disclosure shown | ☐ | ☐ |
| 9 | Follow-up | ask again in session | answered; remaining-turn hint updates | ☐ | ☐ |
| 10 | Session turns | reach turn limit | "질문 모두 사용" copy; no over-charge | ☐ | ☐ |
| 11 | Insufficient (general) | spend below 5덕 then ask | actionable card → /wallet, /duk-topup (not dead-end) | ☐ | ☐ |
| 12 | Compatibility price | open 궁합 | "12덕 필요" shown before start | ☐ | ☐ |
| 13 | Compatibility insufficient | start with <12덕 | actionable paywall (not generic error) | ☐ | ☐ |
| 14 | Today fortune | /today | loads; AI disclosure; retry on error | ☐ | ☐ |
| 15 | Monthly fortune | /monthly | loads; AI disclosure; retry on error | ☐ | ☐ |
| 16 | Mailbox | 운세우편함 | lists records; opens today/monthly/report; error+retry | ☐ | ☐ |
| 17 | MY | MY tab | profile/subjects, wallet, settings, terms, privacy, AI notice, logout | ☐ | ☐ |
| 18 | Notifications center | bell | unread/read/open; deep-link opens correct screen | ☐ | ☐ |
| 19 | Push permission | trigger registration (post-onboarding) | OS prompt once (not at cold start); token registered | ☐ | ☐ |
| 20 | Offline / network fail | airplane mode mid-request | recoverable error + retry; no crash, no raw error | ☐ | ☐ |
| 21 | Background / resume | background during load, resume | state preserved; unread refreshes | ☐ | ☐ |
| 22 | Logout / login | logout then re-login | devices disabled on logout; re-auth clean | ☐ | ☐ |
| 23 | Deep links | open each notification link | resolves to a real screen (auth/onboarding gate applies) | ☐ | ☐ |
| 24 | Rotation | rotate where relevant | no layout break | ☐ | ☐ |
| 25 | Keyboard | composer / birth input | keyboard avoidance; no clipping | ☐ | ☐ |
| 26 | Safe area | notch / gesture bar | no content under system UI | ☐ | ☐ |
| 27 | Font scaling | max OS font size | text wraps; no clipping | ☐ | ☐ |
| 28 | Error boundary | force a render error | friendly retry, no stack shown | ☐ | ☐ |

**Prereqs (owner):** an EAS dev / internal build (Expo Go insufficient — see eas.json), OAuth provider configs, and (for #19) `expo-notifications` + FCM/APNs. IAP purchase flows (#—) are DEFERRED (05B store).
