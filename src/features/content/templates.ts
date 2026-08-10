import type { ContentTemplateMeta } from './types';

// Client-facing template catalog. Labels/descriptions only — the prompt bodies
// live server-side (supabase/functions/content-generate/templates.ts). Each `id`
// MUST match a server template id exactly; an unknown id is rejected by the edge.
export const CONTENT_TEMPLATES: ContentTemplateMeta[] = [
  {
    id: 'general_v1',
    label: '일반 콘텐츠',
    description: '주제 기반 일반 콘텐츠 초안',
  },
  {
    id: 'famous_v1',
    label: '유명인 콘텐츠',
    description: '인물 소개/해설 콘텐츠 (공개 사실 위주)',
  },
  {
    id: 'saju_explainer_v1',
    label: '명리(사주) 설명',
    description: '사주 개념/원리 설명 (개인 사주 계산 없음)',
  },
  {
    id: 'ziwei_explainer_v1',
    label: '자미두수 설명',
    description: '자미두수 개념 설명 (명반 계산 없음)',
  },
  {
    id: 'qimen_explainer_v1',
    label: '기문둔갑 설명',
    description: '기문둔갑 개념 설명 (국 계산 없음)',
  },
  {
    id: 'luck_v1',
    label: '운세/해설',
    description: '일반 운세/해설 콘텐츠 (개인 운세 단정 없음)',
  },
];
