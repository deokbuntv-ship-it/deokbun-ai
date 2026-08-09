import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import {
  AdminDetailSection,
  AdminPageHeader,
  AdminStateView,
  adminUsersService,
  type AdminSubjectSummary,
  type AdminUserDetail,
} from '@/features/admin';

type DetailStatus = 'loading' | 'ready' | 'error' | 'notfound';

function formatDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '–';
}

const CALENDAR_LABEL: Record<'solar' | 'lunar', string> = {
  solar: '양력',
  lunar: '음력',
};

const ACCURACY_LABEL: Record<'exact' | 'approximate' | 'unknown', string> = {
  exact: '정확',
  approximate: '대략',
  unknown: '모름',
};

function calendarText(subject: AdminSubjectSummary): string {
  if (subject.calendarType === null) {
    return '–';
  }
  const base = CALENDAR_LABEL[subject.calendarType];
  if (subject.calendarType === 'lunar' && subject.lunarMonthType !== null) {
    return `${base} · ${subject.lunarMonthType === 'leap' ? '윤달' : '평달'}`;
  }
  return base;
}

// Read-only subject card (curated fields only — never a raw birth_info dump).
function SubjectCard({ subject }: { subject: AdminSubjectSummary }) {
  const nameLine = `${subject.displayName ?? '(이름 없음)'}${subject.isSelf ? ' (본인)' : ''}`;
  return (
    <Card>
      <Stack gap="xs">
        <Text variant="bodyLarge">{nameLine}</Text>
        {subject.relationship ? (
          <Text variant="bodySmall" colorToken="textSecondary">
            {subject.relationship}
          </Text>
        ) : null}
        <Text variant="bodySmall" colorToken="textSecondary">
          {`입력 생년월일 ${subject.birthDate} · ${calendarText(subject)}`}
        </Text>
        <Text variant="bodySmall" colorToken="textSecondary">
          {`출생시간 ${subject.birthTimeAccuracy ? ACCURACY_LABEL[subject.birthTimeAccuracy] : '–'} · 출생지 ${subject.birthPlace ?? '–'}`}
        </Text>
      </Stack>
    </Card>
  );
}

export default function AdminUserDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const userId = typeof params.userId === 'string' ? params.userId : undefined;

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [status, setStatus] = useState<DetailStatus>('loading');
  const loadTokenRef = useRef(0);

  const load = useCallback(() => {
    if (userId === undefined) {
      setStatus('notfound');
      return;
    }
    const token = loadTokenRef.current + 1;
    loadTokenRef.current = token;
    setStatus('loading');

    adminUsersService
      .getUser(userId)
      .then((result) => {
        if (token !== loadTokenRef.current) {
          return;
        }
        if (result === null) {
          setStatus('notfound');
          return;
        }
        setDetail(result);
        setStatus('ready');
      })
      .catch(() => {
        if (token !== loadTokenRef.current) {
          return;
        }
        setStatus('error');
      });
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Stack gap="xl">
      <Stack direction="row" gap="sm" align="center">
        <Button
          label="← 목록"
          variant="secondary"
          onPress={() => router.push('/admin/users')}
        />
      </Stack>

      {status === 'loading' ? (
        <AdminStateView state="loading" />
      ) : status === 'notfound' ? (
        <AdminStateView state="empty" message="사용자를 찾을 수 없습니다." />
      ) : status === 'error' || detail === null ? (
        <AdminStateView
          state="error"
          message="사용자 정보를 불러오지 못했습니다."
          onRetry={load}
        />
      ) : (
        <>
          <AdminPageHeader
            title={detail.displayName ?? '(이름 없음)'}
            subtitle="사용자 상세 (읽기 전용)"
          />
          <AdminDetailSection
            title="프로필"
            rows={[
              { label: '사용자 ID', value: detail.userId },
              { label: '이메일', value: detail.email ?? '–' },
              { label: '표시 이름', value: detail.displayName ?? '–' },
              { label: '가입일', value: formatDate(detail.createdAt) },
              { label: '최근 로그인', value: formatDate(detail.lastSignInAt) },
              { label: '상담 수', value: String(detail.conversationCount) },
              { label: '대상 수', value: String(detail.subjects.length) },
            ]}
          />
          <Stack gap="sm">
            <Text variant="headingMedium">상담 대상 (읽기 전용)</Text>
            {detail.subjects.length === 0 ? (
              <AdminStateView state="empty" message="저장된 대상이 없습니다." />
            ) : (
              detail.subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}
