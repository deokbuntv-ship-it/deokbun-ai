// DeokbunAI — Content generation templates (server-side ONLY, Deno runtime).
//
// Prompt bodies live here and NEVER in the client. The client sends a
// `templateId` + `variables`; this module maps them to a system/user prompt.
//
// HARD RULE (mirrors CONTENT directive §7): the model MUST NOT compute or invent
// myeongri calculations (사주팔자, 오행 분포, 대운, 절기, 자미두수/기문둔갑 수치,
// 길흉 판정 등). Those come only from the canonical ENGINE via `engineContext`.
// When no engineContext is supplied, templates produce explanatory / general
// content only — they never fabricate a specific person's fortune as fact.
//
// Each template carries an explicit `promptVersion` so generated content_versions
// rows are reproducible/attributable. Bump the version string when a prompt body
// changes.

export type TemplateVariables = {
  topic?: string;
  audience?: string;
  tone?: string;
  keyPoints?: string;
  subjectName?: string;
  subjectContext?: string;
  channel?: string;
  // Canonical ENGINE facts, when available. NEVER computed here. Null = none.
  engineContext?: string | null;
};

export type ContentTemplate = {
  id: string;
  promptVersion: string;
  build: (vars: TemplateVariables) => { system: string; user: string };
};

const JSON_INSTRUCTION = `반드시 아래 형식의 JSON 객체 "하나만" 출력하세요. 코드블록/설명/추가 텍스트를 붙이지 마세요.
{
  "title": "글 제목",
  "summary": "2~3문장 요약",
  "body": "본문 (마크다운 허용)",
  "tags": ["태그1", "태그2", "태그3"]
}`;

// Shared guardrail injected into every template's system prompt.
const NO_CALC_RULE = `당신은 사주/명리/자미두수/기문둔갑의 구체적 계산 결과(사주팔자, 오행 분포, 대운, 절기, 길흉 수치 등)를 스스로 계산하거나 지어내면 안 됩니다.
- 계산된 사실이 필요하면, 제공된 "확정 계산 결과"(engineContext)에 있는 값만 사용하세요.
- engineContext가 없으면 개념/방법/일반적 안내만 작성하고, 특정 개인의 운세 수치를 사실처럼 단정하지 마세요.
- 확인되지 않은 정보를 사실처럼 쓰지 말고, 불확실하면 일반론으로 서술하세요.`;

function engineBlock(vars: TemplateVariables): string {
  const ctx = vars.engineContext?.trim();
  return ctx && ctx.length > 0
    ? `\n\n[확정 계산 결과 — 이 값만 사실로 사용]\n${ctx}`
    : `\n\n[확정 계산 결과 없음 — 구체적 계산값을 지어내지 말고 개념/일반 안내로 작성]`;
}

function channelHint(vars: TemplateVariables): string {
  switch (vars.channel) {
    case 'naver_blog':
      return '네이버 블로그 독자에게 맞는 친근하고 정보성 있는 글 형식으로 작성하세요.';
    case 'instagram':
      return '인스타그램 캡션에 맞게 간결하고 흡입력 있게, 핵심 위주로 작성하세요.';
    case 'youtube':
      return '유튜브 영상 설명/대본 초안에 맞게 도입-전개-마무리 구조로 작성하세요.';
    case 'video':
      return '짧은 영상 스크립트에 맞게 장면 흐름이 보이도록 작성하세요.';
    default:
      return '웹 콘텐츠에 맞는 읽기 쉬운 구조로 작성하세요.';
  }
}

function common(vars: TemplateVariables): string {
  const parts = [
    vars.audience ? `대상 독자: ${vars.audience}` : '',
    vars.tone ? `톤/문체: ${vars.tone}` : '',
    vars.keyPoints ? `반드시 포함할 핵심: ${vars.keyPoints}` : '',
    channelHint(vars),
  ].filter((p) => p.length > 0);
  return parts.join('\n');
}

const TEMPLATES: Record<string, ContentTemplate> = {
  // 1) 일반 콘텐츠 --------------------------------------------------------------
  general_v1: {
    id: 'general_v1',
    promptVersion: 'general_v1',
    build: (vars) => ({
      system: `당신은 덕분AI의 콘텐츠 에디터입니다. 정확하고 신뢰감 있는 한국어 콘텐츠를 작성합니다.\n${NO_CALC_RULE}\n\n${JSON_INSTRUCTION}`,
      user: `다음 주제로 콘텐츠 초안을 작성하세요.\n주제: ${vars.topic ?? '(주제 미지정)'}\n${common(vars)}`,
    }),
  },

  // 2) 유명인 콘텐츠 -----------------------------------------------------------
  famous_v1: {
    id: 'famous_v1',
    promptVersion: 'famous_v1',
    build: (vars) => ({
      system: `당신은 덕분AI의 인물 콘텐츠 에디터입니다. 공개된 사실 위주로 신뢰감 있게 작성하고, 사생활 침해나 근거 없는 추측은 피합니다.\n${NO_CALC_RULE}\n\n${JSON_INSTRUCTION}`,
      user: `다음 인물에 대한 콘텐츠 초안을 작성하세요.\n인물: ${vars.subjectName ?? '(인물 미지정)'}\n배경/참고: ${vars.subjectContext ?? '(제공된 배경 없음)'}\n주제 방향: ${vars.topic ?? '(자유)'}\n${common(vars)}${engineBlock(vars)}`,
    }),
  },

  // 3) 명리(사주) 설명 콘텐츠 --------------------------------------------------
  saju_explainer_v1: {
    id: 'saju_explainer_v1',
    promptVersion: 'saju_explainer_v1',
    build: (vars) => ({
      system: `당신은 명리(사주) 개념을 쉽게 설명하는 덕분AI 에디터입니다. 개념과 원리를 정확히 설명하되, 특정인의 사주를 임의로 계산하지 않습니다.\n${NO_CALC_RULE}\n\n${JSON_INSTRUCTION}`,
      user: `다음 명리 주제를 일반 독자가 이해하기 쉽게 설명하는 콘텐츠를 작성하세요.\n주제: ${vars.topic ?? '(주제 미지정)'}\n${common(vars)}${engineBlock(vars)}`,
    }),
  },

  // 4) 자미두수 설명 콘텐츠 ----------------------------------------------------
  ziwei_explainer_v1: {
    id: 'ziwei_explainer_v1',
    promptVersion: 'ziwei_explainer_v1',
    build: (vars) => ({
      system: `당신은 자미두수 개념을 쉽게 설명하는 덕분AI 에디터입니다. 개념/별자리/궁의 의미를 정확히 설명하되, 특정인의 명반을 임의로 계산하지 않습니다.\n${NO_CALC_RULE}\n\n${JSON_INSTRUCTION}`,
      user: `다음 자미두수 주제를 일반 독자가 이해하기 쉽게 설명하는 콘텐츠를 작성하세요.\n주제: ${vars.topic ?? '(주제 미지정)'}\n${common(vars)}${engineBlock(vars)}`,
    }),
  },

  // 5) 기문둔갑 설명 콘텐츠 ----------------------------------------------------
  qimen_explainer_v1: {
    id: 'qimen_explainer_v1',
    promptVersion: 'qimen_explainer_v1',
    build: (vars) => ({
      system: `당신은 기문둔갑 개념을 쉽게 설명하는 덕분AI 에디터입니다. 개념/구성/활용을 정확히 설명하되, 특정 국(局)을 임의로 계산하지 않습니다.\n${NO_CALC_RULE}\n\n${JSON_INSTRUCTION}`,
      user: `다음 기문둔갑 주제를 일반 독자가 이해하기 쉽게 설명하는 콘텐츠를 작성하세요.\n주제: ${vars.topic ?? '(주제 미지정)'}\n${common(vars)}${engineBlock(vars)}`,
    }),
  },

  // 6) 운세/해설 콘텐츠 --------------------------------------------------------
  luck_v1: {
    id: 'luck_v1',
    promptVersion: 'luck_v1',
    build: (vars) => ({
      system: `당신은 덕분AI의 운세/해설 콘텐츠 에디터입니다. 일반적인 조언과 해설 위주로 작성하고, 확정되지 않은 개인 운세를 단정하지 않습니다.\n${NO_CALC_RULE}\n\n${JSON_INSTRUCTION}`,
      user: `다음 주제로 운세/해설 콘텐츠 초안을 작성하세요.\n주제: ${vars.topic ?? '(주제 미지정)'}\n${common(vars)}${engineBlock(vars)}`,
    }),
  },
};

export function getTemplate(id: string): ContentTemplate | null {
  return Object.prototype.hasOwnProperty.call(TEMPLATES, id)
    ? TEMPLATES[id]
    : null;
}
