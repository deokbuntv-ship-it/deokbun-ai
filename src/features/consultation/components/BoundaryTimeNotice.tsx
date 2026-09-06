// 절기 경계일 안내 — the ONE copy + surface for "this birth date needs an exact time".
//
// Rendered in three places from this single definition: the two registration forms (with the
// [시각 입력하기] / [이대로 저장] choice) and the 홈/오늘/월별 surfaces (with a link to fix the profile).
// The judgment itself lives in `birthBoundaryGate.ts`; this file only presents it.
//
// It is a WARNING, never a block: the save button stays enabled and no existing account is cut off.
import { Stack } from '@/components/Stack';
import { Button } from '@/components/Button';
import { EngineNotice } from '@/components/EngineNotice';
// The copy lives beside the judgment (a .ts module) so the plain-Node suite can assert the approved
// wording without rendering. Since 2026-09-06 there IS a render harness on top of that: whether the
// approved wording actually reaches the screen is locked by `__tests__/BoundaryTimeNotice.render.test.tsx`
// (see `docs/RENDER_HARNESS.md`). The two are different questions and both are checked.
import {
  BOUNDARY_NOTICE_BODY_FORM,
  BOUNDARY_NOTICE_BODY_FORM_COMPATIBILITY,
  BOUNDARY_NOTICE_BODY_SURFACE,
  BOUNDARY_NOTICE_TITLE,
  BOUNDARY_NOTICE_TITLE_COMPATIBILITY,
  boundaryNoticeCompatibilityBody,
} from '@/features/consultation/birthBoundaryGate';

type BoundaryTimeNoticeProps = {
  /**
   * 'form' offers the enter-time / save-anyway choice; 'surface' offers the edit link;
   * 'compatibility' is the BLOCKING variant — 궁합 cannot run at all on an ambiguous birth (2026-09-06).
   */
  context: 'form' | 'surface' | 'compatibility';
  /** form — switch the time selector to 정확히 알고 있음. compatibility — go fix that person's birth info. */
  onEnterTime?: () => void;
  /** form — proceed with the save exactly as the primary button would. */
  onSaveAnyway?: () => void;
  /** surface — navigate to the birth-info edit screen. */
  onEditBirthInfo?: () => void;
  /** surface — the notice is dismissible where it is a banner rather than the whole state. */
  onDismiss?: () => void;
  /** form — the person being registered is a 궁합 상대, so the consequence differs from 본인. */
  forCompatibilityTarget?: boolean;
  /** compatibility — whose time is missing. The reader can only fix it if they know who. */
  names?: readonly string[];
};

function bodyFor(context: BoundaryTimeNoticeProps['context'], props: BoundaryTimeNoticeProps): string {
  if (context === 'compatibility') return boundaryNoticeCompatibilityBody(props.names ?? []);
  if (context === 'form') {
    return props.forCompatibilityTarget ? BOUNDARY_NOTICE_BODY_FORM_COMPATIBILITY : BOUNDARY_NOTICE_BODY_FORM;
  }
  return BOUNDARY_NOTICE_BODY_SURFACE;
}

export function BoundaryTimeNotice(props: BoundaryTimeNoticeProps) {
  const { context, onEnterTime, onSaveAnyway, onEditBirthInfo, onDismiss } = props;
  if (context === 'compatibility') {
    // ONE action on purpose. The 상대 list is already on screen, so "다른 분과 보기" would be a button that
    // does what tapping the list does — and in a 궁합 context ("좋아하는 사람") it reads as a nudge to give up
    // on this person. The way forward is the birth time; the way sideways is already there.
    return (
      <Stack gap="sm">
        <EngineNotice title={BOUNDARY_NOTICE_TITLE_COMPATIBILITY} message={bodyFor(context, props)} />
        {onEnterTime ? (
          <Button label="태어난 시각 입력하기" variant="secondary" onPress={onEnterTime} />
        ) : null}
      </Stack>
    );
  }
  return (
    <Stack gap="sm">
      <EngineNotice title={BOUNDARY_NOTICE_TITLE} message={bodyFor(context, props)} />
      {context === 'form' ? (
        <Stack direction="row" gap="sm">
          {onEnterTime ? (
            <Button label="시각 입력하기" variant="secondary" style={{ flex: 1 }} onPress={onEnterTime} />
          ) : null}
          {onSaveAnyway ? (
            <Button label="이대로 저장" variant="tertiary" style={{ flex: 1 }} onPress={onSaveAnyway} />
          ) : null}
        </Stack>
      ) : (
        <Stack direction="row" gap="sm">
          {onEditBirthInfo ? (
            <Button label="출생정보 수정" variant="secondary" style={{ flex: 1 }} onPress={onEditBirthInfo} />
          ) : null}
          {onDismiss ? (
            <Button label="나중에" variant="tertiary" style={{ flex: 1 }} onPress={onDismiss} />
          ) : null}
        </Stack>
      )}
    </Stack>
  );
}
