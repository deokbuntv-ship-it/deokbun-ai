// 골든 미니팩 — **로컬 결정론 실행** (LLM 0콜). staging 배포가 권한에서 막혀 공식 실행을 못 할 때의 대체 측정.
//
// 왜 성립하나: 근거 판단이 선 답(미니팩 delivered 25건 전부)의 긴 답은 `groundedFallbackResult()` 로 조립되고
// 모델 출력과 무관하다(buildServerConsultation.ts — acceptedResult). 채점기는 그 긴 답(frozen derive)과
// decisionMeta 만 읽는다. 그래서 같은 질문·같은 명식·**같은 접수 시각**이면 staging 실행과 점수가 같아야 한다.
// 이것을 먼저 **검증**한다: 되돌림용 HEAD 번들 + 지난 공식 실행의 시각 → 지난 공식 점수와 같은가.
//
// 사용: node localGolden.mjs --bundle=<serverBundle.mjs> --label=<라벨> --instants=<공식 실행 라벨|now>
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split('=').slice(1).join('=');
const BUNDLE = arg('bundle', 'C:/Development/DeokbunAI-app/supabase/functions/chat/_server/serverBundle.mjs');
const LABEL = arg('label', 'local');
const INSTANTS = arg('instants', 'now');
const D = 'C:/Development/DeokbunAI-blind84-final/';
const R = D + '.runtime/';

const b = await import(pathToFileURL(BUNDLE).href);
const { SUBJECTS, toBirthInfo } = await import(pathToFileURL(R + 'roster.mjs').href);
const manifest = JSON.parse(fs.readFileSync(R + 'minipack.json', 'utf8'));
const WANT = [...manifest.delivered, ...manifest.refusal];
const cases = Object.fromEntries(fs.readFileSync(D + 'blind84.jsonl', 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)).map((c) => [c.case_id, c]));
const assign = Object.fromEntries(fs.readFileSync(D + 'blind84_assignment.jsonl', 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)).map((a) => [a.case_id, a.subject_id]));
const subj = Object.fromEntries(SUBJECTS.map((s) => [s.subject_id, s]));
const official = INSTANTS === 'now' ? null
  : Object.fromEntries(fs.readFileSync(`${D}minipack_run_${INSTANTS}.jsonl`, 'utf8').trim().split('\n').map((l) => JSON.parse(l)).map((r) => [r.case_id, r]));
const NOW = Math.floor(Date.now() / 1000);

const digestProvider = { async sha256Utf8(s) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const DUMMY = JSON.stringify({ coreSummary: '자리 표시용입니다.', coreInterpretation: '통과용 문장입니다. 내용은 없습니다.', strengths: ['자리 표시용'], followUps: ['자리 표시용 질문인가요?'] });
const modelId = b.resolveModelRoute(b.consultationWorkload('solo'), {}).modelId;

const raw = [];
for (const id of WANT) {
  const c = cases[id];
  const s = subj[assign[id]];
  const at = official ? Math.floor(Date.parse(official[id].started_at) / 1000) : NOW;
  const stop = b.evaluateConsultationSafetyStop(c.question, at);
  const r = stop ?? await b.buildServerConsultation(
    { birthInput: toBirthInfo(s), subjectLabel: s.display_name, question: c.question },
    { digestProvider, nowEpochSeconds: at, async callLLM() { return DUMMY; }, modelId },
  );
  const success = r.ok && typeof r.text === 'string' && r.text.trim().length > 0;
  raw.push({
    case_id: id, domain: c.domain, subject_id: `REG4-${assign[id]}`, cloned_from: assign[id], question: c.question,
    started_at: new Date(at * 1000).toISOString(),
    consultation_result: success ? 'SUCCESS' : 'FAILED', error_code: success ? null : r.reason,
    session_turns: success ? 1 : 0, text: r.ok ? r.text : null, structuredResult: r.ok ? r.structuredResult ?? null : null,
    groundingMeta: r.ok ? r.groundingMeta : null,
  });
}

fs.writeFileSync(R + `minipack_derive_in_${LABEL}.jsonl`, raw.map((r) => JSON.stringify({ case_id: r.case_id, text: r.text ?? '', structuredResult: r.structuredResult ?? undefined })).join('\n') + '\n');
execFileSync(process.execPath, [R + 'reg4_derive.cjs', R + `minipack_derive_in_${LABEL}.jsonl`, R + `minipack_derive_out_${LABEL}.jsonl`], { stdio: 'inherit' });
const derived = Object.fromEntries(fs.readFileSync(R + `minipack_derive_out_${LABEL}.jsonl`, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)).map((d) => [d.case_id, d]));

fs.writeFileSync(`${D}minipack_run_${LABEL}.jsonl`, raw.map((r) => {
  const d = derived[r.case_id] ?? {};
  const dv = r.structuredResult?.decisionMeta?.divinationVerdict ?? null;
  return JSON.stringify({
    case_id: r.case_id, domain: r.domain, subject_id: r.subject_id, cloned_from: r.cloned_from, question: r.question,
    started_at: r.started_at, consultation_result: r.consultation_result, error_code: r.error_code,
    session_turns: r.session_turns,
    routing_observed: {
      resolved_topic_domain: r.structuredResult?.decisionMeta?.domain ?? null, resolved_asked_axis: dv?.questionDomain ?? null,
      question_intent: dv?.questionIntent ?? null, asks_timing: dv?.asksTiming ?? null, verdict_direction: dv?.direction ?? null,
    },
    structured_consultation_response: { text: r.text, structuredResult: r.structuredResult, groundingMeta: r.groundingMeta },
    USER_VISIBLE_ANSWER: { sections: d.user_visible_answer?.sections ?? [], text: d.user_visible_text ?? r.text ?? '', verified_evidence: d.verified_evidence ?? [] },
    AUTHORITATIVE_REFERENCE: {
      lines: d.authoritative_reference ?? [], material_contributors: d.material_contributors ?? [],
      not_covered_systems: d.not_covered_systems ?? [], cross_judge_summary: d.cross_judge_summary ?? null,
      note: 'INTERNAL REFERENCE ONLY — never counted as user-visible product quality.',
    },
    local_deterministic: { bundle: BUNDLE, instants: INSTANTS, llmCalls: 0 },
  });
}).join('\n') + '\n');
console.log(`local run written: ${D}minipack_run_${LABEL}.jsonl (${raw.length} cases, LLM 0)`);
