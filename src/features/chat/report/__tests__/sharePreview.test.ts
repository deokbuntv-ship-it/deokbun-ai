import fs from 'node:fs';
import path from 'node:path';

import { lockedSummaryLine, parseSharePreview, previewHeadline } from '../sharePreview';

// 익명 미리보기 (owner decision 2026-09-06) — value first, account second.
// The disclosure boundary is enforced in the SERVER; these tests lock both halves: the shaping
// here, and the fact that the migration never sends what must not leave.
const REPO = path.resolve(__dirname, '../../../../..');
const MIG = fs.readFileSync(path.join(REPO, 'supabase/migrations/20260906000000_shared_report_preview.sql'), 'utf8');
const PREVIEW_UI = fs.readFileSync(path.join(REPO, 'src/features/chat/report/SharedReportPreview.tsx'), 'utf8');

const ok = (over = {}) => ({
  conclusion: '두 분은 전체적으로 잘 맞는 편이에요. 대화의 결이 잘 맞아요.',
  reportKind: 'compatibility',
  lockedCounts: { findings: 5, cautions: 2, topics: 3 },
  ...over,
});

describe('parseSharePreview', () => {
  it('shapes a valid row', () => {
    const r = parseSharePreview(ok());
    expect(r.status).toBe('ok');
    if (r.status === 'ok') {
      expect(r.preview.conclusion).toContain('잘 맞는 편');
      expect(r.preview.reportKind).toBe('compatibility');
      expect(r.preview.lockedCounts).toEqual({ findings: 5, cautions: 2, topics: 3 });
    }
  });

  it('is unavailable rather than half-rendered', () => {
    for (const bad of [null, undefined, {}, 'x', 42, ok({ conclusion: '' }), ok({ conclusion: '   ' })]) {
      expect(parseSharePreview(bad).status).toBe('unavailable');
    }
  });

  it('coerces junk counts to 0 instead of rendering NaN', () => {
    const r = parseSharePreview(ok({ lockedCounts: { findings: 'x', cautions: -3, topics: null } }));
    if (r.status !== 'ok') throw new Error('expected ok');
    expect(r.preview.lockedCounts).toEqual({ findings: 0, cautions: 0, topics: 0 });
  });

  it('defaults an unknown kind to consultation', () => {
    const r = parseSharePreview(ok({ reportKind: 'something-else' }));
    if (r.status !== 'ok') throw new Error('expected ok');
    expect(r.preview.reportKind).toBe('consultation');
  });
});

describe('lockedSummaryLine — counts, never content', () => {
  it('names how many, never what', () => {
    const r = parseSharePreview(ok());
    if (r.status !== 'ok') throw new Error('expected ok');
    expect(lockedSummaryLine(r.preview)).toBe('분야별 해석 5가지 · 주의할 점 2가지가 더 있어요.');
  });

  it('returns null when there is nothing more — never promise what does not exist', () => {
    const r = parseSharePreview(ok({ lockedCounts: { findings: 0, cautions: 0, topics: 0 } }));
    if (r.status !== 'ok') throw new Error('expected ok');
    expect(lockedSummaryLine(r.preview)).toBeNull();
  });

  it('omits a section that is empty', () => {
    const r = parseSharePreview(ok({ lockedCounts: { findings: 3, cautions: 0, topics: 1 } }));
    if (r.status !== 'ok') throw new Error('expected ok');
    expect(lockedSummaryLine(r.preview)).toBe('분야별 해석 3가지가 더 있어요.');
  });
});

describe('previewHeadline never names anyone', () => {
  it('is a fixed string per kind', () => {
    expect(previewHeadline('compatibility')).toBe('궁합 결과가 도착했어요');
    expect(previewHeadline('consultation')).toBe('해석 결과가 도착했어요');
  });
});

// ── the boundary itself lives in the migration ──────────────────────────────────────────────
describe('the server sends only the conclusion and counts', () => {
  it('returns the conclusion and counts — and never the content behind them', () => {
    const ret = MIG.slice(MIG.indexOf('return jsonb_build_object('));
    for (const k of ["'conclusion'", "'reportKind'", "'lockedCounts'"]) expect(ret).toContain(k);
    // The paid sections may be REFERENCED in order to count them, but their VALUES must never be
    // emitted. `jsonb_array_length(v_payload->'cautions')` is a number; `v_payload->'cautions'`
    // on its own is the product. Assert on the dangerous shape, not on mention of the key.
    for (const section of ['keyFindings', 'cautions', 'coveredTopics']) {
      const refs = [...ret.matchAll(new RegExp(`v_payload->'${section}'`, 'g'))];
      expect(refs.length).toBeGreaterThan(0);
      for (const m of refs) {
        expect(ret.slice(Math.max(0, (m.index ?? 0) - 30), m.index)).toContain('jsonb_array_length');
      }
    }
    expect(ret).not.toContain("'title'");
    expect(ret).not.toContain("'generatedAt'");
  });

  it('the title is read but never returned — it carries both names', () => {
    expect(MIG).toContain("v_title      := coalesce(nullif(v_payload->>'title', '')");
    const ret = MIG.slice(MIG.indexOf('return jsonb_build_object('));
    expect(ret).not.toContain('v_title');
  });

  it('redacts names pulled out of the title', () => {
    expect(MIG).toContain("regexp_match(v_title, '^(.+?)님과 (.+?)님의')");
    expect(MIG).toContain("replace(v_conclusion, v_names[1], '상대')");
    expect(MIG).toContain("replace(v_conclusion, v_names[2], '상대')");
  });

  it('fails closed to the server-authored first sentence when names cannot be identified', () => {
    expect(MIG).toContain("regexp_match(v_conclusion, '^[^.!?\\n]*[.!?]')");
  });

  it('keeps the same token rules as the full read', () => {
    expect(MIG).toContain("status = 'active'");
    expect(MIG).toContain('revoked_at is null');
    expect(MIG).toContain('expires_at is null or expires_at > now()');
  });

  it('does NOT bump opened_count — a crawler would inflate the funnel', () => {
    expect(MIG).not.toContain('opened_count = opened_count + 1');
  });

  it('is a SEPARATE function — the full read keeps its grant', () => {
    expect(MIG).toContain('get_shared_report_preview');
    expect(MIG).not.toMatch(/grant execute on function public\.get_shared_report\(text\) to anon/);
    expect(MIG).toContain('grant execute on function public.get_shared_report_preview(text) to anon, authenticated');
  });
});

describe('the preview UI shows no identity and offers the next step', () => {
  it('renders no name field at all', () => {
    expect(PREVIEW_UI).not.toMatch(/\b(selfLabel|targetLabel|displayName|birth)/);
  });
  it('offers 전체 보기 and says the visitor comes back', () => {
    expect(PREVIEW_UI).toContain('전체 보기');
    expect(PREVIEW_UI).toContain('보시던 결과로 바로 돌아와요');
  });
  it('carries the AI disclosure like every other consumer surface', () => {
    expect(PREVIEW_UI).toContain('AI가 생성하며 참고용');
  });
});
