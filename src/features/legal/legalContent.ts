// Versioned legal documents shown in-app (개인정보 처리방침 / 서비스 이용약관). These are DRAFT presentations
// grounded in the app's ACTUAL data behavior — they intentionally do NOT invent statutory guarantees or make
// unprovable claims (e.g. no "data never leaves Korea"). Final, lawyer-reviewed wording is an OWNER action; the
// UI shows a visible DRAFT/검토중 banner so nothing here is misrepresented as final.
//
// The inventory MUST mirror what the product actually collects (audited): social-login identifier + email when
// provided, birth date/time/gender/place, saved subjects' birth info, consultations, fortune records,
// compatibility data, reports, life events, notification prefs, push tokens, product analytics, feedback, and
// campaign attribution. Do not list data we do not collect; do not omit data we do.

export type LegalSection = { heading: string; paragraphs?: string[]; bullets?: string[] };
export type LegalDocument = {
  key: 'privacy' | 'terms';
  title: string;
  version: string; // bump when the content materially changes
  status: 'DRAFT'; // V1 ships a draft pending legal review
  updatedLabel: string; // human-readable "as of" label (not a legal effective date)
  intro: string[];
  sections: LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  key: 'privacy',
  title: '개인정보 처리방침',
  version: 'privacy@2026-08-draft-1',
  status: 'DRAFT',
  updatedLabel: '2026년 8월 기준 초안',
  intro: [
    '덕분이(이하 “서비스”)는 이용자의 개인정보를 소중히 다룹니다. 본 문서는 서비스가 실제로 수집·이용하는 정보를 이용자가 이해할 수 있도록 설명한 초안이며, 최종 법률 검토를 거쳐 확정될 예정입니다.',
  ],
  sections: [
    {
      heading: '1. 수집하는 정보',
      paragraphs: ['서비스는 상담과 운세 제공에 필요한 범위에서 다음 정보를 수집합니다.'],
      bullets: [
        '소셜 로그인 식별자 및 이메일(로그인 제공사에서 제공되는 경우)',
        '사주·명리 분석을 위한 생년월일, 태어난 시간, 성별, 태어난 지역',
        '이용자가 직접 저장한 분석 대상(가족·지인 등)의 생년 정보',
        '상담 대화 내용 및 상담 결과',
        '오늘의 운세·이번 달 운세 기록, 궁합 분석 데이터, 리포트',
        '중요한 일정(이용자가 직접 입력한 경우)',
        '알림 설정 및 기기 푸시 토큰(알림을 설정한 경우)',
        '서비스 이용 분석 이벤트(비식별 범주형 통계)와 피드백',
        '유입 경로(캠페인) 정보',
      ],
    },
    {
      heading: '2. 이용 목적',
      bullets: [
        'AI 기반 사주·명리 상담 및 운세 제공',
        '서비스 개인화와 품질 개선',
        '알림 및 리텐션 안내(설정에 따름)',
        '오·남용 방지와 서비스 보안',
        '통계 분석을 통한 서비스 개선',
      ],
    },
    {
      heading: '3. AI 처리 안내',
      paragraphs: [
        '상담과 운세를 제공하기 위해, 이용자가 입력한 정보와 대화 맥락이 AI 처리 과정에서 사용될 수 있습니다. 서비스는 이 과정에서 필요한 최소한의 정보만을 사용하도록 설계되어 있습니다.',
        '본 초안은 데이터 처리 위치에 관한 확정적 약속을 하지 않으며, 관련 세부 사항은 최종 검토 시 명확히 안내됩니다.',
      ],
    },
    {
      heading: '4. 알림·리텐션 데이터',
      paragraphs: [
        '알림 설정, 중요한 일정, 기기 푸시 토큰은 알림 제공과 서비스 운영을 위해 사용됩니다. 기기 푸시 토큰은 운영을 위한 식별자로 취급되며 별도로 노출되지 않습니다.',
      ],
    },
    {
      heading: '5. 보유 및 이용 기간',
      paragraphs: [
        '개인정보는 서비스 제공에 필요한 기간 동안 보유하며, 이용자가 삭제를 요청하거나 회원 탈퇴 시 관련 법령이 정한 예외를 제외하고 지체 없이 파기합니다. 구체적 보유 기간은 최종 검토 시 확정됩니다.',
      ],
    },
    {
      heading: '6. 이용자의 권리',
      paragraphs: [
        '이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요청하고, 동의를 철회하거나 회원 탈퇴를 할 수 있습니다. 알림 수신 여부는 [MY] → [알림 설정]에서 직접 관리할 수 있습니다.',
      ],
    },
    {
      heading: '7. 문의',
      paragraphs: [
        '개인정보 처리에 관한 문의는 서비스 내 문의 채널을 통해 접수하실 수 있습니다. 담당자 및 연락처는 최종본에 명시됩니다.',
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  key: 'terms',
  title: '서비스 이용약관',
  version: 'terms@2026-08-draft-1',
  status: 'DRAFT',
  updatedLabel: '2026년 8월 기준 초안',
  intro: [
    '본 약관은 덕분이 서비스의 이용 조건을 설명하기 위한 초안이며, 최종 법률 검토를 거쳐 확정됩니다.',
  ],
  sections: [
    {
      heading: '1. 서비스 성격',
      paragraphs: [
        '서비스는 사주·명리 등 동양 명리학에 기반한 AI 상담과 운세 콘텐츠를 제공합니다. 제공되는 내용은 참고를 위한 정보이며, 의료·법률·투자 등 전문적 판단을 대체하지 않습니다.',
      ],
    },
    {
      heading: '2. 계정과 이용',
      paragraphs: [
        '이용자는 소셜 로그인을 통해 서비스를 이용하며, 정확한 정보를 제공할 책임이 있습니다. 서비스는 원활한 운영과 오·남용 방지를 위해 이용을 제한할 수 있습니다.',
      ],
    },
    {
      heading: '3. 콘텐츠와 지적재산',
      paragraphs: [
        '서비스가 제공하는 상담·운세·리포트 등의 콘텐츠에 대한 권리는 서비스 또는 정당한 권리자에게 있으며, 이용자는 개인적 이용 범위를 벗어나 무단으로 복제·배포할 수 없습니다.',
      ],
    },
    {
      heading: '4. 책임의 한계',
      paragraphs: [
        '서비스가 제공하는 해석은 참고 정보로서, 이를 근거로 한 이용자의 결정과 그 결과에 대해 서비스는 관련 법령이 허용하는 범위에서 책임을 제한합니다.',
      ],
    },
    {
      heading: '5. 약관의 변경',
      paragraphs: [
        '서비스는 필요 시 약관을 변경할 수 있으며, 중요한 변경은 사전에 안내합니다. 구체적 절차와 효력 발생 시점은 최종본에 명시됩니다.',
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS = { privacy: PRIVACY_POLICY, terms: TERMS_OF_SERVICE } as const;
