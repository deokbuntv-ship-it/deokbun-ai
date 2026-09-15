import fs from 'node:fs';
import path from 'node:path';

import {
  INQUIRY_CATEGORIES,
  INQUIRY_CATEGORY_LABEL,
  INQUIRY_STATUS_LABEL,
  MESSAGE_MAX,
  RESPONSE_TIME_NOTICE,
  isPlausibleEmail,
  submitOutcomeMessage,
  validateInquiry,
} from '../supportContract';

const REPO = path.resolve(__dirname, '../../../..');
const MIGRATION = fs.readFileSync(path.join(REPO, 'supabase/migrations/20260905000000_support_inquiries.sql'), 'utf8');
const DUPE = fs.readFileSync(path.join(REPO, 'supabase/migrations/20260905000200_famous_duplicate_guard.sql'), 'utf8');
const SCREEN = fs.readFileSync(path.join(REPO, 'src/app/support.tsx'), 'utf8');
const ADMIN = fs.readFileSync(path.join(REPO, 'src/app/admin/support/index.tsx'), 'utf8');
const MY = fs.readFileSync(path.join(REPO, 'src/app/(tabs)/my.tsx'), 'utf8');
const SIDEBAR = fs.readFileSync(path.join(REPO, 'src/features/admin/components/AdminSidebar.tsx'), 'utf8');
const PROVIDER = fs.readFileSync(path.join(REPO, 'src/features/fortune/email/emailProvider.ts'), 'utf8');
const WARNING = fs.readFileSync(path.join(REPO, 'src/features/famous/components/FamousDuplicateWarning.tsx'), 'utf8');
const EDITOR = fs.readFileSync(path.join(REPO, 'src/features/famous/components/FamousEditor.tsx'), 'utf8');

const draft = (over: Partial<Parameters<typeof validateInquiry>[0]> = {}) => ({
  category: 'other' as const,
  message: '덕이 이상하게 차감돼요',
  contactEmail: '',
  ...over,
});

describe('inquiry validation', () => {
  it('accepts a normal inquiry with no contact email', () => {
    expect(validateInquiry(draft())).toEqual({ ok: true });
  });

  it('rejects an empty or whitespace-only message with a reason', () => {
    for (const m of ['', '   ', '\n']) {
      const r = validateInquiry(draft({ message: m }));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toContain('문의 내용');
    }
  });

  it('rejects past the DB limit and says how long it is', () => {
    const r = validateInquiry(draft({ message: 'a'.repeat(MESSAGE_MAX + 1) }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain(String(MESSAGE_MAX + 1));
  });

  it('accepts exactly the limit (mirrors the CHECK, off-by-one guarded)', () => {
    expect(validateInquiry(draft({ message: 'a'.repeat(MESSAGE_MAX) })).ok).toBe(true);
  });

  it('validates the contact email only when one was typed', () => {
    expect(validateInquiry(draft({ contactEmail: '' })).ok).toBe(true);
    expect(validateInquiry(draft({ contactEmail: '   ' })).ok).toBe(true);
    expect(validateInquiry(draft({ contactEmail: 'me@example.com' })).ok).toBe(true);
    expect(validateInquiry(draft({ contactEmail: 'nope' })).ok).toBe(false);
  });

  it('every category has a label and the DB CHECK lists exactly these', () => {
    for (const c of INQUIRY_CATEGORIES) expect(INQUIRY_CATEGORY_LABEL[c]).toBeTruthy();
    for (const c of INQUIRY_CATEGORIES) expect(MIGRATION).toContain(`'${c}'`);
  });

  it('every status has a label and matches the DB CHECK', () => {
    for (const s of ['RECEIVED', 'IN_PROGRESS', 'ANSWERED'] as const) {
      expect(INQUIRY_STATUS_LABEL[s]).toBeTruthy();
      expect(MIGRATION).toContain(`'${s}'`);
    }
  });
});

describe('email shape check', () => {
  it('accepts ordinary addresses', () => {
    for (const e of ['a@b.co', 'user.name+tag@sub.example.co.kr', '한글@example.com']) {
      expect(isPlausibleEmail(e)).toBe(true);
    }
  });
  it('rejects the shapes that are certainly wrong', () => {
    for (const e of ['', 'nope', '@example.com', 'a@', 'a@b', 'a b@c.com', 'a@@b.com', 'a@.com', 'a@b.']) {
      expect(isPlausibleEmail(e)).toBe(false);
    }
  });
});

describe('user-facing copy', () => {
  it('never promises a response time it cannot keep', () => {
    for (const promise of ['24시간', '48시간', '영업일', '이내에 답변', '즉시']) {
      expect(RESPONSE_TIME_NOTICE).not.toContain(promise);
    }
  });
  it('a network failure tells the user the inquiry was NOT filed', () => {
    expect(submitOutcomeMessage('NETWORK')).toContain('접수되지 않았어요');
  });
  it('success has no message — the screen shows state instead', () => {
    expect(submitOutcomeMessage('SUBMITTED')).toBeNull();
  });
});

describe('support schema contract', () => {
  it('user_id comes from the DB default, never the client', () => {
    expect(MIGRATION).toContain('user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade');
  });

  it('a user can read and insert their own row and nothing else', () => {
    expect(MIGRATION).toContain('for select using (user_id = auth.uid() or public.is_admin())');
    expect(MIGRATION).toContain('for insert with check (user_id = auth.uid())');
    // No UPDATE/DELETE policy — the record of what was asked must stay put.
    expect(MIGRATION).not.toMatch(/create policy[^;]*support_inquiries[\s\S]{0,80}for update/);
    expect(MIGRATION).not.toMatch(/create policy[^;]*support_inquiries[\s\S]{0,80}for delete/);
  });

  it('the admin write path cannot touch the user’s message', () => {
    const fn = MIGRATION.slice(MIGRATION.indexOf('function public.admin_answer_inquiry'));
    expect(fn).toContain('set answer');
    expect(fn).not.toMatch(/set[\s\S]{0,200}\bmessage\s*=/);
  });

  it('answered_at is stamped once and never moved', () => {
    expect(MIGRATION).toContain('when p_answer is not null and i.answered_at is null then now()');
  });

  it('both admin functions are is_admin()-gated', () => {
    const gates = MIGRATION.match(/if not public\.is_admin\(\) then/g) ?? [];
    expect(gates.length).toBeGreaterThanOrEqual(2);
  });

  it('seeds nothing', () => {
    expect(MIGRATION).not.toMatch(/^\s*insert\s+into/im);
  });
});

describe('support surfaces', () => {
  it('is reachable from MY and from the admin sidebar', () => {
    expect(MY).toContain("{ label: '문의하기', to: '/support' }");
    expect(SIDEBAR).toContain("{ label: '고객문의', href: '/admin/support' }");
  });

  it('the admin screen is truthful when the RPC is unavailable', () => {
    // An empty list would read as "no inquiries" — the worst possible lie for a support queue.
    expect(ADMIN).toContain("kind === 'unavailable'");
    expect(ADMIN).toContain("setStatus('error')");
  });

  it('the user screen tells them what is attached', () => {
    expect(SCREEN).toContain('앱 버전과 기기 종류가 함께 전달돼요');
  });
});

describe('email provider stays Noop in the client', () => {
  it('carries the reason a real provider must never be wired here', () => {
    expect(PROVIDER).toContain('DO NOT WIRE A REAL PROVIDER HERE');
    expect(PROVIDER).toContain('return noopEmailProvider;');
  });
  it('points at where the real adapter actually lives', () => {
    expect(PROVIDER).toContain('run-email-campaigns');
    expect(PROVIDER).toContain('retry-email-deliveries');
  });
});

describe('famous duplicate guard', () => {
  it('warns rather than blocks — no unique constraint on the name', () => {
    expect(DUPE).not.toMatch(/create\s+unique\s+index[^;]*famous_name_key/i);
    expect(DUPE).toContain('create index if not exists famous_profiles_name_key_idx');
  });

  it('normalizes only whitespace and case', () => {
    expect(DUPE).toContain("regexp_replace(lower(p_name), '\\s+', '', 'g')");
  });

  it('reports all three confidence levels', () => {
    for (const c of ['SAME_PERSON_LIKELY', 'SAME_NAME_DIFFERENT_BIRTH', 'SAME_NAME_BIRTH_UNKNOWN']) {
      expect(DUPE).toContain(c);
    }
  });

  it('excludes the row being edited from its own duplicate check', () => {
    expect(DUPE).toContain('p_exclude_id is null or f.id <> p_exclude_id');
  });

  it('survives non-numeric month/day in existing data instead of failing the save', () => {
    expect(DUPE).toContain('when invalid_text_representation then');
  });

  it('the warning UI never blocks and never throws', () => {
    expect(WARNING).toContain('if (rows.length === 0) return null;');
    expect(WARNING).toContain('advisory');
    expect(WARNING).toContain('확인 후 그대로 등록하셔도 됩니다');
  });

  it('is wired into the famous editor next to the name field', () => {
    expect(EDITOR).toContain('<FamousDuplicateWarning');
    expect(EDITOR).toContain('excludeId={initial?.id ?? null}');
  });
});
