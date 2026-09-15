# V2 research data — NOT PRODUCTION

> **Nothing in this directory is imported by the application.** It is research evidence for
> MYUNGRI_STRENGTH_V2 gate S1. No file under `app/`, `src/`, `supabase/functions/`, or the chat server
> may import from here.

| File | Contents |
|---|---|
| `sources.json` | source register, machine-readable |
| `discovery-cases.json` | the S1 discovery corpus |
| `validate-corpus.mjs` | schema + integrity validator |

Run the validator:

```bash
node data/myungri-strength-v2/validate-corpus.mjs
```

It checks: required fields · unique `CASE_ID` · resolvable `SOURCE_ID` · valid enum values · four-pillar
format against the real 10 天干 / 12 地支 · that no synthetic case is counted as real · that
`GOLD_ELIGIBLE` is not assigned to grade C/D · and that `ORIGINAL_*` and `V2_*` fields are both present
(the separation rule).

Schema documentation: [`../../docs/myungri-strength-v2/CASE_CORPUS_SCHEMA.md`](../../docs/myungri-strength-v2/CASE_CORPUS_SCHEMA.md)
