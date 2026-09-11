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
  key: 'privacy' | 'terms' | 'duk' | 'refund' | 'minor';
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
      heading: '3. AI 처리 및 처리 위탁',
      paragraphs: [
        '상담과 운세를 제공하기 위해, 이용자가 입력한 정보와 대화 맥락이 AI 처리 과정에서 사용될 수 있습니다. 서비스는 이 과정에서 필요한 최소한의 정보만을 사용하도록 설계되어 있습니다.',
        '서비스는 기능 제공을 위해 다음 처리자(수탁자)를 이용합니다. 데이터 저장·인증은 Supabase(데이터베이스/인증 인프라)를 통해, AI 해석 생성은 OpenAI(대규모 언어모델 API)를 통해 처리됩니다. 위탁 범위·항목·보유에 관한 확정 사항은 최종 법률 검토 시 명확히 안내됩니다.',
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
        // ⚠ 2026-09-10 추가 — 5·6조가 "탈퇴 시 파기" 를 이미 약속하는데 **어디서 어떻게 하는지**가
        //   없었다. 앱에는 기능이 있고 웹에는 안내 페이지가 생겼으므로 경로를 적는다.
        '회원 탈퇴는 [MY] → [계정 탈퇴]에서 직접 하실 수 있습니다. 앱이 설치돼 있지 않은 경우에는 계정 삭제 안내 페이지(https://www.deokbunai.com/account-deletion)를 참고해 주세요. 탈퇴 시 삭제되는 정보와 법령에 따라 보존될 수 있는 정보는 「서비스 이용약관」 제6조에 정리돼 있습니다.',
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
      heading: '5. 유료 이용(덕)과 상담 세션',
      paragraphs: [
        '서비스 내 일부 기능은 “덕”을 사용합니다. 덕의 적립·사용·차감 및 상담 세션의 이용 조건은 별도의 「덕 유료 이용 정책」에 따르며, 유료 이용 관련 환불·취소는 「환불·청약철회 정책」에 따릅니다.',
        '상담은 세션 단위로 제공되며, 각 상담은 최대 5회 질문·24시간 이용을 기준으로 합니다. 자세한 내용은 위 정책 문서를 참고해 주세요. (본 조항은 초안이며 최종 검토 시 확정됩니다.)',
      ],
    },
    // ⚠ 회원 탈퇴 조항 (2026-09-10 초안 추가). 앱에는 이미 탈퇴 기능이 있고
    //   (MY → 계정 탈퇴 → /account-delete → 확인 문구 입력), 개인정보 처리방침 5·6조가 탈퇴를
    //   이미 약속하고 있는데 **약관에는 조항이 없었다.** 그 공백을 메운다.
    //   ⚠ 보존 항목·기간은 [법률 검토] 다. 이 초안은 "무엇을 지우고 무엇을 남기는가" 를
    //     코드가 실제로 하는 대로만 적고, 기간은 확정하지 않는다.
    {
      heading: '6. 회원 탈퇴(계정 삭제)',
      paragraphs: [
        '이용자는 언제든지 회원 탈퇴를 할 수 있습니다. 앱에서는 [MY] → [계정 탈퇴]에서, 앱이 설치돼 있지 않은 경우에는 웹의 계정 삭제 안내 페이지(https://www.deokbunai.com/account-deletion)에서 절차를 확인할 수 있습니다.',
        '탈퇴는 되돌릴 수 없으며, 탈퇴 요청이 접수되면 계정과 그에 연결된 데이터가 삭제됩니다. 삭제되는 정보에는 계정·로그인 정보, 분석 대상자와 생년월일시 등 입력 정보, 상담·운세·리포트 기록, 알림 설정과 기기 토큰, 보유 덕과 그 사용 내역이 포함됩니다.',
        '다만 관련 법령이 보존을 요구하는 정보는 해당 기간 동안 분리 보관될 수 있습니다. 유료 이용이 있었던 경우 「전자상거래 등에서의 소비자보호에 관한 법률」에 따른 거래기록 보존 의무의 대상이 될 수 있으며, 이때 보존되는 것은 개인을 식별할 수 없는 형태의 거래 요약입니다. [법률 검토 — 보존 항목과 보존 기간은 최종 검토 시 확정합니다.]',
        '탈퇴 처리는 요청 즉시 진행되며, 정상적인 경우 즉시 완료됩니다. 처리 결과는 앱 화면에서 바로 확인할 수 있습니다.',
        '[오너 결정 · 법률 검토 필요: 유료 구매 덕의 탈퇴 시 처리]',
      ],
    },
    {
      heading: '7. 약관의 변경',
      paragraphs: [
        '서비스는 필요 시 약관을 변경할 수 있으며, 중요한 변경은 사전에 안내합니다. 구체적 절차와 효력 발생 시점은 최종본에 명시됩니다.',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// Sprint J7 §7.6 — DRAFT policy surfaces required before any paid launch. Values mirror economy_policy (staging-
// validated); a "planned/not-yet-active" item is labeled as such so the policy never states behavior the code
// does not perform. Each ships with the visible 검토 중 초안 banner (LegalDocumentView). Legal-final wording is
// an OWNER action — these are structured placeholders for legal review, NOT final terms.
// ---------------------------------------------------------------------------------------------------------------
export const DUK_USE_POLICY: LegalDocument = {
  key: 'duk',
  title: '덕(Duk) 유료 이용 정책',
  version: 'duk-policy@2026-08-draft-1',
  status: 'DRAFT',
  updatedLabel: '2026년 8월 기준 초안',
  intro: [
    '덕(Duk)은 서비스 내에서 상담·궁합 등 일부 기능을 이용하기 위한 앱 내 재화입니다. 본 문서는 덕의 적립·사용·차감 방식을 이용자가 이해할 수 있도록 설명한 초안입니다.',
  ],
  sections: [
    {
      heading: '1. 덕의 종류',
      bullets: [
        '보상 덕(REWARD): 가입 보상, 촛불 등 무료로 지급되는 덕',
        '결제 덕(PAID): 향후 구매를 통해 충전되는 덕(현재 결제 기능은 준비 중)',
        'PLUS 덕: 구독 기반 지급 덕(현재 미제공)',
      ],
    },
    {
      heading: '2. 적립',
      bullets: [
        '가입 시 10덕(1회, 약관 동의 시점에 서버에서 지급)',
        '하루 한 번 촛불 +1덕(24시간마다)',
        '생일 보상 5덕(매년 생일마다 1회, 서버에서 자동 지급)',
        '이벤트성 지급이 있을 수 있습니다.',
      ],
    },
    {
      heading: '3. 사용과 가격',
      bullets: ['일반 상담 5덕', '궁합 12덕', '프리미엄 리포트 50덕'],
      paragraphs: ['차감 순서는 PLUS → 보상 → 결제 덕 순입니다.'],
    },
    {
      heading: '4. 상담 세션',
      paragraphs: [
        '하나의 상담 세션은 최대 5회 질문, 24시간 동안 유효합니다. 세션 요금은 세션의 첫 성공 답변 시 1회 차감되며, 이후 같은 세션의 추가 질문에는 추가로 차감되지 않습니다. 세션 만료 또는 이용자의 중단으로 미사용된 부분은 환불 대상이 아닙니다(자세한 내용은 환불 정책 참고).',
      ],
    },
    {
      heading: '5. 유효기간·양도',
      paragraphs: [
        '현재 덕에는 별도의 유효기간이 설정되어 있지 않습니다. 덕은 계정에 귀속되며 타인에게 양도하거나 현금으로 환전할 수 없습니다. 유효기간 정책이 도입될 경우 사전에 안내합니다.',
      ],
    },
  ],
};

export const REFUND_POLICY: LegalDocument = {
  key: 'refund',
  title: '환불·청약철회 정책',
  version: 'refund-policy@2026-08-draft-1',
  status: 'DRAFT',
  updatedLabel: '2026년 8월 기준 초안',
  intro: [
    '본 문서는 유료 재화(덕) 및 상담 이용에 대한 환불·청약철회 기준의 초안입니다. 결제 기능은 현재 준비 중이며, 실제 결제 도입 시 관련 법령(전자상거래법 등)에 따라 최종 확정됩니다.',
  ],
  sections: [
    {
      heading: '1. 적용 범위',
      paragraphs: ['덕 충전(결제) 및 결제 덕을 사용한 상담 등에 적용됩니다. 무료로 지급된 보상 덕은 환불 대상이 아닙니다.'],
    },
    {
      heading: '2. 사용 전/후',
      bullets: [
        '미사용 결제 덕: 관련 법령이 정하는 청약철회 기간·요건에 따라 환불이 가능할 수 있습니다.',
        '이미 사용된(차감된) 덕: 상담의 첫 성공 답변 시점에 이용이 개시된 것으로 보아, 사용분에 대한 환불이 제한될 수 있습니다.',
        '세션 만료 또는 이용자의 자발적 중단으로 미사용된 세션 부분은 환불되지 않습니다.',
      ],
    },
    {
      heading: '3. 결제 취소·부분 취소로 인한 조정',
      paragraphs: [
        '스토어(App Store·Google Play)를 통한 환불이 발생하면, 해당 금액에 상응하는 덕이 차감되며, 잔액이 부족한 경우 부족분은 채무(잔여 조정 대상)로 기록되어 향후 충전 시 우선 상계될 수 있습니다. 보상 덕은 이 상계에 사용되지 않습니다.',
      ],
    },
    {
      heading: '4. 문의',
      paragraphs: ['환불 요청 및 문의 절차는 결제 기능 도입 시 앱 내에서 안내합니다.'],
    },
  ],
};

export const MINOR_USE_POLICY: LegalDocument = {
  key: 'minor',
  title: '미성년자 이용 및 결제 안내',
  version: 'minor-policy@2026-08-draft-1',
  status: 'DRAFT',
  updatedLabel: '2026년 8월 기준 초안',
  intro: [
    '본 문서는 미성년자의 서비스 이용 및 결제에 관한 기준의 초안입니다. 세부 기준은 관련 법령과 최종 법률 검토를 거쳐 확정됩니다.',
  ],
  sections: [
    {
      heading: '1. 연령 기준',
      paragraphs: [
        '현재 가입 시 “만 14세 이상”임을 확인하는 절차를 두고 있습니다. 향후 결제 도입 시에는 미성년자 보호를 위한 추가 확인 절차를 마련할 예정입니다.',
      ],
    },
    {
      heading: '2. 미성년자 결제',
      paragraphs: [
        '미성년자의 결제에는 법정대리인의 동의가 필요할 수 있으며, 관련 법령에 따라 법정대리인이 취소할 수 있습니다. 구체적 절차는 결제 기능 도입 및 법률 검토 후 확정됩니다(검토 필요 항목).',
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS = {
  privacy: PRIVACY_POLICY,
  terms: TERMS_OF_SERVICE,
  duk: DUK_USE_POLICY,
  refund: REFUND_POLICY,
  minor: MINOR_USE_POLICY,
} as const;
