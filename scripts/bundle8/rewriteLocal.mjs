// PART 5-1 사전 점검 — 오너 명식 세 질문의 짧은 답을 **실제 모델로** 다듬어 본다 (로컬 · 긴 답 호출은 가짜).
// Edge 와 같은 설정: 모델 라우팅 · 추론 low · 재작성 전용 JSON 스키마 · 출력 상한은 상담 프로필 값.
// 긴 답 호출은 가짜 응답으로 넘긴다 — 근거 판단이 선 답에서 긴 답의 모델 문장은 화면에 가지 않으므로 짧은 답과 무관하다.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const b = await import(pathToFileURL(resolve('supabase/functions/chat/_server/serverBundle.mjs')).href);
const API_KEY = (() => {
  for (const line of readFileSync(resolve('.env.qa.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.*)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error('OPENAI_API_KEY 없음');
})();
const route = b.resolveModelRoute(b.consultationWorkload('solo'), {});
const digestProvider = { async sha256Utf8(s) { return createHash('sha256').update(s, 'utf8').digest('hex'); } };
const NOW = Math.floor(Date.UTC(2026, 8, 18, 1, 0, 0) / 1000);
const OWNER = { displayName: '오너', gender: 'male', calendarType: 'solar', lunarMonthType: null, birthYear: '1991', birthMonth: '7', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '0', birthMinute: '45', approximateTimePeriod: null, birthPlace: '서울' };
const QUESTIONS = (process.env.QS ?? '이번 달 일 운이 어떤가요?|요즘 사람 관계가 힘든데 어떨까요?|올해 어떻게 흘러갈까요?').split('|');
const DUMMY = JSON.stringify({ coreSummary: '자리 표시용입니다.', coreInterpretation: '통과용 문장입니다. 내용은 없습니다.', strengths: ['자리 표시용'], followUps: ['자리 표시용 질문인가요?'] });

let calls = 0;
const out = [];
for (const q of QUESTIONS) {
  const profile = b.resolveConsultationProfile(b.classifyQuestionComplexity(q), {});
  const log = [];
  const t0 = Date.now();
  const r = await b.buildServerConsultation({ birthInput: OWNER, question: q }, {
    digestProvider, nowEpochSeconds: NOW,
    async callLLM() { return DUMMY; },
    async rewriteLLM(messages) {
      calls += 1;
      const s = Date.now();
      const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: route.modelId, input: messages, max_output_tokens: profile.maxOutputTokens,
          reasoning: { effort: 'low' }, text: { format: b.rewriteResponseFormat() },
        }),
      });
      const p = await res.json();
      const text = b.extractResponsesText(p) ?? '';
      log.push({ ms: Date.now() - s, status: p.status, usage: p.usage, input: JSON.parse(messages.at(-1).content).sentences, output: text, hints: messages.filter((m) => m.role === 'system').length > 1 ? messages[1].content : null });
      return b.openAiFailureCode({ ok: res.ok, statusCode: res.status, text, usage: p.usage ?? {}, responseStatus: p.status ?? null, incompleteReason: p.incomplete_details?.reason ?? null }) === 'OK' ? text : '';
    },
  });
  const short = r.structuredResult?.shortAnswer ?? null;
  out.push({ question: q, totalMs: Date.now() - t0, maxOutputTokens: profile.maxOutputTokens, diagnostics: r.diagnostics?.shortAnswer, shortAnswer: short, chars: short?.length, check: short ? b.checkAnswerForReport?.(short) ?? null : null, calls: log });
  console.log(`\n══ ${q}\n  결과 ${JSON.stringify(r.diagnostics?.shortAnswer)}\n  ${short}`);
  for (const c of log) console.log(`  · 호출 ${(c.ms / 1000).toFixed(1)}초 · 출력 ${c.usage?.output_tokens} (추론 ${c.usage?.output_tokens_details?.reasoning_tokens}) · ${c.status}`);
}
writeFileSync(resolve(process.env.OUT ?? 'output/bundle8/owner-local-rewrite.json'), JSON.stringify({ model: route.modelId, calls, out }, null, 2), 'utf8');
console.log(`\nLLM 호출 ${calls}회`);
