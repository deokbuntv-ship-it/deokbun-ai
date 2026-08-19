import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Switch, TextInput, View } from 'react-native';

import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { AdminPageHeader, AdminSelect, AdminStateView } from '@/features/admin';
import { adminMono, adminTheme } from '@/features/admin/adminTheme';
import {
  POPULAR_QUESTION_CATEGORIES,
  POPULAR_QUESTION_CATEGORY_LABEL,
  computeConversionRates,
  formatRate,
  popularQuestionService,
  type AdminPopularQuestion,
  type PopularQuestionCategory,
  type PopularQuestionCounts,
} from '@/features/popular-questions';

// ADMIN 지금 많이 물어보는 질문 — the operational surface for the Home conversion list. List every question
// (active + inactive), edit / create / activate-deactivate / REORDER (up-down, not drag-drop), and read the
// server-aggregated conversion funnel per question. display_order is authoritative (NO auto-ranking). Metrics
// come from the admin-only aggregate RPC; the client only computes the ratios (zero-denominator → "—"). There
// is no hard delete — deactivate preserves analytics history.
type ScreenStatus = 'loading' | 'ready' | 'error';
const KEY_RE = /^[a-z0-9_]{1,64}$/;
const ANALYTICS_KEY_LABEL = 'analytics key';

const WINDOW_OPTIONS: { value: string; label: string }[] = [
  { value: '30', label: '최근 30일' },
  { value: 'all', label: '전체 기간' },
];
const CATEGORY_OPTIONS = POPULAR_QUESTION_CATEGORIES.map((c) => ({
  value: c,
  label: POPULAR_QUESTION_CATEGORY_LABEL[c],
}));
const EMPTY_COUNTS = (key: string): PopularQuestionCounts => ({
  analyticsKey: key,
  impressions: 0,
  clicks: 0,
  starts: 0,
  successes: 0,
});

type FormState = {
  questionText: string;
  analyticsKey: string;
  category: PopularQuestionCategory;
  displayOrder: string;
  isActive: boolean;
};
const NEW_FORM: FormState = {
  questionText: '',
  analyticsKey: '',
  category: 'GENERAL',
  displayOrder: '100',
  isActive: true,
};

export default function AdminPopularQuestionsScreen() {
  const [status, setStatus] = useState<ScreenStatus>('loading');
  const [rows, setRows] = useState<AdminPopularQuestion[]>([]);
  const [counts, setCounts] = useState<Record<string, PopularQuestionCounts>>({});
  const [windowDays, setWindowDays] = useState<number | null>(30);
  // editing: null = closed, 'new' = create form, otherwise the id being edited.
  const [editing, setEditing] = useState<'new' | string | null>(null);
  const [form, setForm] = useState<FormState>(NEW_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [list, metrics] = await Promise.all([
        popularQuestionService.listAll(),
        popularQuestionService.loadMetrics(windowDays),
      ]);
      const map: Record<string, PopularQuestionCounts> = {};
      metrics.forEach((m) => {
        map[m.analyticsKey] = m;
      });
      setRows(list);
      setCounts(map);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [windowDays]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setForm({ ...NEW_FORM, displayOrder: String((rows[rows.length - 1]?.displayOrder ?? 0) + 10) });
    setFormError(null);
    setEditing('new');
  };
  const openEdit = (q: AdminPopularQuestion) => {
    setForm({
      questionText: q.questionText,
      analyticsKey: q.analyticsKey,
      category: q.category,
      displayOrder: String(q.displayOrder),
      isActive: q.isActive,
    });
    setFormError(null);
    setEditing(q.id);
  };
  const closeForm = () => {
    setEditing(null);
    setFormError(null);
  };

  const save = async () => {
    setFormError(null);
    const questionText = form.questionText.trim();
    if (questionText.length === 0) {
      setFormError('질문 문구를 입력해 주세요.');
      return;
    }
    const displayOrder = Number.parseInt(form.displayOrder, 10);
    if (!Number.isFinite(displayOrder)) {
      setFormError('노출 순서를 숫자로 입력해 주세요.');
      return;
    }
    setSaving(true);
    let ok = false;
    if (editing === 'new') {
      const key = form.analyticsKey.trim();
      if (!KEY_RE.test(key)) {
        setSaving(false);
        setFormError(`${ANALYTICS_KEY_LABEL}는 소문자·숫자·밑줄(_)만, 1–64자로 입력해 주세요.`);
        return;
      }
      if (rows.some((r) => r.analyticsKey === key)) {
        setSaving(false);
        setFormError('이미 사용 중인 analytics key입니다.');
        return;
      }
      const created = await popularQuestionService.create({
        questionText,
        analyticsKey: key,
        category: form.category,
        displayOrder,
        isActive: form.isActive,
      });
      ok = created !== null;
    } else if (editing) {
      // analytics key is intentionally immutable (preserves the metrics series).
      const updated = await popularQuestionService.update(editing, {
        questionText,
        category: form.category,
        displayOrder,
        isActive: form.isActive,
      });
      ok = updated !== null;
    }
    setSaving(false);
    if (!ok) {
      setFormError('저장하지 못했어요. 권한 또는 연결을 확인해 주세요.');
      return;
    }
    closeForm();
    await load();
  };

  const toggleActive = async (q: AdminPopularQuestion) => {
    setBusyId(q.id);
    await popularQuestionService.setActive(q.id, !q.isActive);
    setBusyId(null);
    await load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    setBusyId(rows[index].id);
    await popularQuestionService.swapDisplayOrder(rows[index], rows[target]);
    setBusyId(null);
    await load();
  };

  return (
    <Stack gap="xl">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <AdminPageHeader
          title="지금 많이 물어보는 질문"
          subtitle="홈 상담 전환용 질문을 직접 관리합니다. 노출 순서는 여기서 정한 순서 그대로 반영됩니다 (자동 랭킹 없음)."
        />
        <View style={{ paddingTop: 4 }}>
          <ActionLink label="+ 새 질문" tone="primary" onPress={openNew} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <AdminSelect
          label="전환 지표 기간"
          options={WINDOW_OPTIONS}
          value={windowDays === null ? 'all' : '30'}
          onChange={(v) => setWindowDays(v === 'all' ? null : 30)}
        />
        <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, paddingBottom: 8 }}>
          CTR=클릭/노출 · 시작률=시작/클릭 · 성공률=성공/시작 · 전환율=성공/노출 · 분모 0 → “—”
        </Text>
      </View>

      {editing !== null ? (
        <QuestionForm
          mode={editing === 'new' ? 'new' : 'edit'}
          form={form}
          setForm={setForm}
          error={formError}
          saving={saving}
          onSave={save}
          onCancel={closeForm}
        />
      ) : null}

      {status !== 'ready' ? (
        <AdminStateView state={status === 'loading' ? 'loading' : 'error'} onRetry={load} />
      ) : rows.length === 0 ? (
        <View style={{ padding: 32, alignItems: 'center', gap: 12 }}>
          <Text variant="bodyMedium" style={{ color: adminTheme.inkVariant }}>
            등록된 질문이 없습니다. (마이그레이션 적용 전이라면 홈은 기본 질문 세트를 사용합니다.)
          </Text>
          <ActionLink label="+ 새 질문" tone="primary" onPress={openNew} />
        </View>
      ) : (
        <View style={{ borderWidth: 1, borderColor: adminTheme.border, borderRadius: 10, overflow: 'hidden' }}>
          <HeaderRow />
          {rows.map((q, i) => (
            <QuestionRow
              key={q.id}
              q={q}
              index={i}
              total={rows.length}
              counts={counts[q.analyticsKey] ?? EMPTY_COUNTS(q.analyticsKey)}
              busy={busyId === q.id}
              onUp={() => move(i, -1)}
              onDown={() => move(i, 1)}
              onEdit={() => openEdit(q)}
              onToggle={() => toggleActive(q)}
            />
          ))}
        </View>
      )}
    </Stack>
  );
}

function HeaderRow() {
  const cell = (label: string, flex: number, align: 'left' | 'right' | 'center' = 'left') => (
    <Text
      variant="bodySmall"
      style={{ flex, textAlign: align, color: adminTheme.inkMuted, fontWeight: '700' }}
    >
      {label}
    </Text>
  );
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: adminTheme.tableHeaderBg,
      }}
    >
      {cell('순서', 0.7, 'center')}
      {cell('질문', 3)}
      {cell('상태', 0.8, 'center')}
      {cell('노출', 0.7, 'right')}
      {cell('CTR', 0.7, 'right')}
      {cell('시작률', 0.7, 'right')}
      {cell('성공률', 0.7, 'right')}
      {cell('전환율', 0.7, 'right')}
      {cell('', 0.7, 'center')}
    </View>
  );
}

function QuestionRow({
  q,
  index,
  total,
  counts,
  busy,
  onUp,
  onDown,
  onEdit,
  onToggle,
}: {
  q: AdminPopularQuestion;
  index: number;
  total: number;
  counts: PopularQuestionCounts;
  busy: boolean;
  onUp: () => void;
  onDown: () => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const rates = computeConversionRates(counts);
  const stat = (value: string, flex: number) => (
    <Text variant="bodySmall" style={{ flex, textAlign: 'right', color: adminTheme.ink, fontFamily: adminMono }}>
      {value}
    </Text>
  );
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: adminTheme.border,
        opacity: busy ? 0.5 : 1,
      }}
    >
      {/* order + reorder */}
      <View style={{ flex: 0.7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <IconBtn label="▲" disabled={index === 0 || busy} onPress={onUp} />
        <IconBtn label="▼" disabled={index === total - 1 || busy} onPress={onDown} />
      </View>
      {/* question + category */}
      <View style={{ flex: 3, gap: 3 }}>
        <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
          {q.questionText}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Text variant="bodySmall" style={{ color: adminTheme.teal, fontWeight: '600' }}>
            {POPULAR_QUESTION_CATEGORY_LABEL[q.category]}
          </Text>
          <Text variant="bodySmall" style={{ color: adminTheme.inkMuted, fontFamily: adminMono }}>
            {q.analyticsKey}
          </Text>
        </View>
      </View>
      {/* active toggle */}
      <View style={{ flex: 0.8, alignItems: 'center', gap: 4 }}>
        <Badge label={q.isActive ? '노출중' : '비노출'} tone={q.isActive ? 'success' : 'neutral'} />
        <Switch value={q.isActive} onValueChange={onToggle} disabled={busy} />
      </View>
      {/* metrics */}
      {stat(String(counts.impressions), 0.7)}
      {stat(formatRate(rates.ctr), 0.7)}
      {stat(formatRate(rates.startRate), 0.7)}
      {stat(formatRate(rates.successRate), 0.7)}
      {stat(formatRate(rates.endToEnd), 0.7)}
      {/* edit */}
      <View style={{ flex: 0.7, alignItems: 'center' }}>
        <ActionLink label="편집" tone="secondary" onPress={onEdit} />
      </View>
    </View>
  );
}

function QuestionForm({
  mode,
  form,
  setForm,
  error,
  saving,
  onSave,
  onCancel,
}: {
  mode: 'new' | 'edit';
  form: FormState;
  setForm: (f: FormState) => void;
  error: string | null;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const input = (
    value: string,
    onChangeText: (t: string) => void,
    placeholder: string,
    opts?: { editable?: boolean; multiline?: boolean; keyboard?: 'default' | 'numeric' },
  ) => (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={adminTheme.inkMuted}
      editable={opts?.editable ?? true}
      multiline={opts?.multiline ?? false}
      keyboardType={opts?.keyboard ?? 'default'}
      autoCapitalize="none"
      style={{
        borderWidth: 1,
        borderColor: adminTheme.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: opts?.editable === false ? adminTheme.inkMuted : adminTheme.ink,
        backgroundColor: opts?.editable === false ? adminTheme.neutralBg : adminTheme.surface,
        minHeight: opts?.multiline ? 60 : undefined,
      }}
    />
  );
  return (
    <View style={{ borderWidth: 1, borderColor: adminTheme.border, borderRadius: 10, padding: 16, backgroundColor: adminTheme.surface, gap: 12 }}>
      <Text variant="bodyLarge" style={{ fontWeight: '700', color: adminTheme.ink }}>
        {mode === 'new' ? '새 질문 추가' : '질문 편집'}
      </Text>

      <Field label="질문 문구">
        {input(form.questionText, (t) => setForm({ ...form, questionText: t }), '예: 올해 재물운의 흐름은 어떻게 흐를까요?', {
          multiline: true,
        })}
      </Field>

      <Field label={`analytics key ${mode === 'edit' ? '(변경 불가 — 지표 연속성 보존)' : '(소문자·숫자·_)'}`}>
        {input(
          form.analyticsKey,
          (t) => setForm({ ...form, analyticsKey: t }),
          '예: money_flow_year',
          { editable: mode === 'new' },
        )}
      </Field>

      <Field label="분류">
        <AdminSelect
          options={CATEGORY_OPTIONS}
          value={form.category}
          onChange={(c) => setForm({ ...form, category: c })}
        />
      </Field>

      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Field label="노출 순서 (작을수록 위)" style={{ width: 180 }}>
          {input(form.displayOrder, (t) => setForm({ ...form, displayOrder: t.replace(/[^0-9]/g, '') }), '100', {
            keyboard: 'numeric',
          })}
        </Field>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 18 }}>
          <Text variant="bodyMedium" style={{ color: adminTheme.ink }}>
            홈에 노출
          </Text>
          <Switch value={form.isActive} onValueChange={(v) => setForm({ ...form, isActive: v })} />
        </View>
      </View>

      {error ? (
        <Text variant="bodySmall" style={{ color: adminTheme.danger }}>
          {error}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <ActionLink label={saving ? '저장 중…' : '저장'} tone="primary" onPress={saving ? () => {} : onSave} />
        <ActionLink label="취소" tone="secondary" onPress={onCancel} />
      </View>
    </View>
  );
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: object }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text variant="bodySmall" style={{ color: adminTheme.inkVariant, fontWeight: '600' }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function Badge({ label, tone }: { label: string; tone: 'success' | 'neutral' }) {
  const bg = tone === 'success' ? adminTheme.successBg : adminTheme.neutralBg;
  const fg = tone === 'success' ? adminTheme.success : adminTheme.inkMuted;
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text variant="bodySmall" style={{ color: fg, fontWeight: '700' }}>
        {label}
      </Text>
    </View>
  );
}

function IconBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Text
      accessibilityRole="button"
      onPress={disabled ? undefined : onPress}
      style={{
        color: disabled ? adminTheme.border : adminTheme.inkVariant,
        fontSize: 12,
        paddingHorizontal: 4,
        paddingVertical: 2,
      }}
    >
      {label}
    </Text>
  );
}

function ActionLink({ label, onPress, tone }: { label: string; onPress: () => void; tone: 'primary' | 'secondary' }) {
  return (
    <Text
      accessibilityRole="button"
      onPress={onPress}
      variant="bodySmall"
      style={{
        color: tone === 'primary' ? '#FFFFFF' : adminTheme.ink,
        backgroundColor: tone === 'primary' ? adminTheme.navy : adminTheme.surface,
        borderWidth: 1,
        borderColor: tone === 'primary' ? adminTheme.navy : adminTheme.border,
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 9,
        fontWeight: '700',
        overflow: 'hidden',
      }}
    >
      {label}
    </Text>
  );
}
