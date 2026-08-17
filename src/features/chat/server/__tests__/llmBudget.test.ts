// Per-path OpenAI output-token budgets (chat max_output_tokens fix) + proof the raise does not weaken the
// fail-closed / structured-validation safety. Budget resolution is pure; the fail-closed checks reuse the
// real orchestrator with only the LLM call mocked.
import { createHash } from 'crypto';

import {
  buildServerConsultation,
  DEFAULT_CONSULTATION_MAX_OUTPUT_TOKENS,
  DEFAULT_SUMMARY_MAX_OUTPUT_TOKENS,
  HARD_MAX_OUTPUT_TOKENS,
  MIN_MAX_OUTPUT_TOKENS,
  openAiFailureCode,
  resolveLlmBudgets,
} from '@/features/chat/server';
import type { ServerConsultationDeps } from '@/features/chat/server';
import type { BirthInfoDraft } from '@/features/consultation';
import type { DigestProvider } from '@/features/interpretation';
import { clearQimenCache } from '@/features/qimen';
import { clearZiweiCache } from '@/features/ziwei';

describe('resolveLlmBudgets — consultation raised, summary bounded, never unbounded', () => {
  it('defaults: consultation is well above the previous 800; summary stays small (< consultation)', () => {
    const b = resolveLlmBudgets({});
    expect(b.consultation).toBe(DEFAULT_CONSULTATION_MAX_OUTPUT_TOKENS);
    expect(b.consultation).toBeGreaterThan(800); // the value that produced status=incomplete in production
    expect(b.consultation).toBeGreaterThanOrEqual(2500);
    expect(b.summary).toBe(DEFAULT_SUMMARY_MAX_OUTPUT_TOKENS);
    expect(b.summary).toBeLessThanOrEqual(1200);
    expect(b.summary).toBeLessThan(b.consultation);
  });
  it('env overrides are honored (within bounds)', () => {
    expect(resolveLlmBudgets({ consultation: '3000', summary: '1100' })).toEqual({ consultation: 3000, summary: 1100 });
  });
  it('never unbounded: clamps above HARD_MAX and below MIN', () => {
    expect(resolveLlmBudgets({ consultation: '999999' }).consultation).toBe(HARD_MAX_OUTPUT_TOKENS);
    expect(resolveLlmBudgets({ consultation: '5' }).consultation).toBe(MIN_MAX_OUTPUT_TOKENS);
  });
  it('invalid / empty / non-positive env → safe defaults', () => {
    expect(resolveLlmBudgets({ consultation: 'abc', summary: '' })).toEqual({
      consultation: DEFAULT_CONSULTATION_MAX_OUTPUT_TOKENS,
      summary: DEFAULT_SUMMARY_MAX_OUTPUT_TOKENS,
    });
    expect(resolveLlmBudgets({ consultation: '-100', summary: '0' })).toEqual({
      consultation: DEFAULT_CONSULTATION_MAX_OUTPUT_TOKENS,
      summary: DEFAULT_SUMMARY_MAX_OUTPUT_TOKENS,
    });
  });
});

describe('safety preserved: incomplete still fails closed; completed still succeeds', () => {
  const digestProvider: DigestProvider = {
    async sha256Utf8(s: string) { return createHash('sha256').update(s, 'utf8').digest('hex'); },
  };
  const NOW = Math.floor(Date.UTC(2024, 0, 15, 1, 0, 0) / 1000);
  const birth: BirthInfoDraft = {
    displayName: '테스트', gender: 'male', calendarType: 'solar', lunarMonthType: null,
    birthYear: '1990', birthMonth: '8', birthDay: '15', birthTimeAccuracy: 'exact', birthHour: '14',
    birthMinute: '0', approximateTimePeriod: null, birthPlace: '서울',
  };
  const GOOD = JSON.stringify({
    coreSummary: '차분한 흐름입니다.',
    coreInterpretation:
      '사주로 보면 일간을 중심으로 차분함과 추진력이 균형을 이루는 구조이며 월지의 기운과 십신 배치가 이를 뒷받침합니다. ' +
      '꾸준히 쌓아 올리면 좋고 서두르면 흐름이 흐트러지기 쉬우니 속도를 조절하는 편이 좋습니다.',
    strengths: ['끈기'], followUps: ['어떤 방식이 맞을까요?'],
  });
  const deps = (llmReturn: string): ServerConsultationDeps => ({
    digestProvider, nowEpochSeconds: NOW, async callLLM() { return llmReturn; },
  });
  beforeEach(() => { clearZiweiCache(); clearQimenCache(); });

  it('classifier: incomplete(max_output_tokens) with no text is a FAILURE, not OK', () => {
    expect(openAiFailureCode({ ok: true, statusCode: 200, text: '', incompleteReason: 'max_output_tokens' })).toBe(
      'OPENAI_INCOMPLETE_max_output_tokens',
    );
  });

  it('incomplete → empty output → LLM_FAILED; no raw/partial text leaks in the result', async () => {
    const r = await buildServerConsultation({ birthInput: birth, question: '제 성격은?' }, deps('')); // '' = incomplete/no visible text
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('LLM_FAILED');
    expect(r).not.toHaveProperty('text'); // failure result carries no text
    expect(r).not.toHaveProperty('structuredResult');
  });

  it('completed → a full structured answer is accepted (raise does not change validation)', async () => {
    const r = await buildServerConsultation({ birthInput: birth, question: '제 타고난 성격은?' }, deps(GOOD));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.groundingMeta.grounded).toBe(true);
  });
});
