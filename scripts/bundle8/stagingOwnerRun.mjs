// PART 5-4 — 오너 명식 세 질문을 **staging 실제 흐름**으로 (Edge chat · 인증 · 과금 · 기록 전부 지나감).
//
// Edge 는 대화에 적은 명식이 아니라 **계정의 본인 명식**(consultation_subjects.is_self)을 쓴다. 그래서 골든 계정
// (REG4-SUBJ-01~12)이 아닌 **스모크 계정 REG4-SMOKE-00** 의 본인 명식을 잠시 오너 명식으로 바꾸고, 끝나면 되돌린다.
// 원본은 output/bundle8/staging-smoke-subject-backup.json 에 두고, 되돌린 뒤 같은지 대조한다.
//
// 사용:  node scripts/bundle8/stagingOwnerRun.mjs inspect
//        node scripts/bundle8/stagingOwnerRun.mjs prepare
//        node scripts/bundle8/stagingOwnerRun.mjs ask --label=on --qs=1,2,3
//        node scripts/bundle8/stagingOwnerRun.mjs restore
// 비밀값은 하네스가 메모리에서만 읽는다 — 여기서 출력하지 않는다.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const RT = 'C:/Development/DeokbunAI-blind84-final/.runtime/';
const { rest, REF } = await import(pathToFileURL(RT + 'lib.mjs').href);
const { callChat, createConversation, creds, spendable, latestSession } = await import(pathToFileURL(RT + 'reg4_exec.mjs').href);
if (REF !== 'aephpsiurgkvqcswyeie') { console.error(`FATAL: not staging (${REF})`); process.exit(1); }

const ACCOUNT = 'REG4-SMOKE-00';
const acct = creds[ACCOUNT];
const BACKUP = 'output/bundle8/staging-smoke-subject-backup.json';
const OWNER_BIRTH = {
  displayName: '오너 명식 점검', gender: 'male', calendarType: 'solar', lunarMonthType: null,
  birthYear: '1991', birthMonth: '7', birthDay: '15', birthTimeAccuracy: 'exact',
  birthHour: '0', birthMinute: '45', approximateTimePeriod: null, birthPlace: '서울',
};
const QUESTIONS = { 1: '이번 달 일 운이 어떤가요?', 2: '요즘 사람 관계가 힘든데 어떨까요?', 3: '올해 어떻게 흘러갈까요?' };
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split('=')[1];
const phase = process.argv[2];

async function selfSubject() {
  const r = await rest(`/rest/v1/consultation_subjects?select=id,display_name,birth_info,is_self&user_id=eq.${acct.user_id}&is_self=eq.true`);
  if (!r.ok || !Array.isArray(r.json) || r.json.length !== 1) throw new Error(`self subject lookup ${r.status}`);
  return r.json[0];
}

if (phase === 'inspect') {
  const s = await selfSubject();
  console.log(JSON.stringify({ account: ACCOUNT, subjectId: s.id, sameAsCredSubject: s.id === acct.subject_row_id, displayName: s.display_name, birth: s.birth_info, spendable: await spendable(acct.user_id) }, null, 1));
} else if (phase === 'prepare') {
  const s = await selfSubject();
  if (fs.existsSync(BACKUP)) throw new Error('backup already exists — restore first');
  fs.writeFileSync(BACKUP, JSON.stringify({ at: new Date().toISOString(), account: ACCOUNT, subject: s }, null, 1));
  const r = await rest(`/rest/v1/consultation_subjects?id=eq.${s.id}`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' },
    body: { display_name: OWNER_BIRTH.displayName, birth_info: OWNER_BIRTH },
  });
  console.log('prepare', r.status, JSON.stringify(r.json?.[0]?.birth_info));
  const have = await spendable(acct.user_id);
  if (have < 30) {
    const g = await rest('/rest/v1/rpc/grant_duk', { method: 'POST', body: {
      p_user_id: acct.user_id, p_amount: 30 - have, p_bucket: 'REWARD', p_reason: 'ADMIN_ADJUSTMENT', p_purchase_id: `BUNDLE8-OWNER-RUN-${Date.now()}`,
    } });
    console.log(`duk ${have} → +${30 - have} (grant ${g.status})`);
  } else console.log(`duk ${have} (충분)`);
} else if (phase === 'ask') {
  const label = arg('label', 'on');
  const qs = arg('qs', '1,2,3').split(',').map(Number);
  const out = [];
  for (const q of qs) {
    const requestId = crypto.randomUUID();
    const conversationId = await createConversation(ACCOUNT, { display_name: OWNER_BIRTH.displayName, birth_info: OWNER_BIRTH });
    const before = await spendable(acct.user_id);
    const t0 = Date.now();
    const r = await callChat({ regId: ACCOUNT, question: QUESTIONS[q], requestId, conversationId });
    const wallMs = Date.now() - t0;
    const after = await spendable(acct.user_id);
    const session = await latestSession(acct.user_id).catch(() => null);
    // 기록 줄 — 요청 번호로 찾는다(짧게 기다렸다가).
    let usage = null;
    for (let i = 0; i < 10 && !usage; i += 1) {
      const u = await rest(`/rest/v1/ai_usage_logs?select=status,error_code,latency_ms,input_tokens,output_tokens,reasoning_tokens,reasoning_effort,gate_firings,created_at&request_id=eq.${requestId}`);
      usage = u.json?.[0] ?? null;
      if (!usage) await new Promise((res) => setTimeout(res, 1000));
    }
    const sr = r.json?.structuredResult ?? null;
    const row = {
      label, q, question: QUESTIONS[q], requestId, http: r.status, wallMs, dukBefore: before, dukAfter: after,
      sessionPrice: session?.price_duk ?? null, error: r.json?.error ?? null,
      shortAnswer: sr?.shortAnswer ?? null, coreSummary: sr?.coreSummary ?? null, textHead: (r.json?.text ?? '').slice(0, 80),
      usage,
    };
    out.push(row);
    const s = usage?.gate_firings?.shortAnswer;
    console.log(`\n══ [${label}] Q${q} ${QUESTIONS[q]} · http ${r.status} · ${(wallMs / 1000).toFixed(1)}초 (서버 ${usage?.latency_ms ?? '-'}ms) · 덕 ${before}→${after}`);
    console.log(`  기록: ${JSON.stringify(s ?? null)} · 토큰 in ${usage?.input_tokens} / out ${usage?.output_tokens} (추론 ${usage?.reasoning_tokens})`);
    console.log(`  짧은 답(${row.shortAnswer?.length ?? 0}자): ${row.shortAnswer}`);
  }
  fs.writeFileSync(`output/bundle8/staging-owner-${label}.json`, JSON.stringify(out, null, 1));
} else if (phase === 'restore') {
  const b = JSON.parse(fs.readFileSync(BACKUP, 'utf8'));
  const r = await rest(`/rest/v1/consultation_subjects?id=eq.${b.subject.id}`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' },
    body: { display_name: b.subject.display_name, birth_info: b.subject.birth_info },
  });
  const now = await selfSubject();
  const same = JSON.stringify({ d: now.display_name, b: now.birth_info }) === JSON.stringify({ d: b.subject.display_name, b: b.subject.birth_info });
  console.log('restore', r.status, same ? '✅ 원본과 같음' : '❌ 원본과 다름');
  if (same) fs.renameSync(BACKUP, BACKUP.replace('.json', `.restored-${Date.now()}.json`));
} else {
  console.error('phase: inspect | prepare | ask | restore');
  process.exit(1);
}
