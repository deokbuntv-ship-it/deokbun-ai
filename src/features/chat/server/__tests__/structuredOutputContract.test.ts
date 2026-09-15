// OpenAI Structured Outputs schema (consultation) + the split structural diagnostics. Verifies the exact
// request `text.format` contract and that every structural failure class is named precisely (§7/§8).
import { CONSULTATION_JSON_SCHEMA, consultationResponseFormat } from '@/features/chat/server';
import { GROUNDING_UNAVAILABLE } from '@/features/chat/prompts/grounding';
import {
  classifyConsultationOutput,
  firstStructuredRejectionReason,
} from '@/features/chat/prompts/structuredConsultation';

const G = GROUNDING_UNAVAILABLE;
const PARSER_FIELDS = ['coreSummary', 'disposition', 'coreInterpretation', 'strengths', 'cautions', 'domainInterpretation', 'futureFlow', 'followUps'];

describe('consultationResponseFormat — exact Responses API text.format contract', () => {
  it('is a strict json_schema with additionalProperties:false and every field required', () => {
    const f = consultationResponseFormat();
    expect(f.type).toBe('json_schema');
    expect(f.name).toBe('deokbun_consultation');
    expect(f.strict).toBe(true);
    expect(f.schema.additionalProperties).toBe(false);
    // strict mode: every property must be listed in `required`
    expect([...f.schema.required].sort()).toEqual([...PARSER_FIELDS].sort());
    expect(Object.keys(f.schema.properties).sort()).toEqual([...PARSER_FIELDS].sort());
  });
  it('schema shape matches the parser: optionals nullable, arrays typed, nested {title,body} strict', () => {
    const p = CONSULTATION_JSON_SCHEMA.properties;
    expect(p.coreSummary).toEqual({ type: 'string' });
    expect(p.disposition).toEqual({ type: ['string', 'null'] });
    expect(p.futureFlow).toEqual({ type: ['string', 'null'] });
    expect(p.strengths).toEqual({ type: 'array', items: { type: 'string' } });
    expect(p.domainInterpretation.items.additionalProperties).toBe(false);
    expect([...p.domainInterpretation.items.required].sort()).toEqual(['body', 'title']);
  });
});

describe('split structural diagnostics (§7) + never raw JSON', () => {
  const rich = {
    coreSummary: '차분하지만 추진력을 갖춘 흐름입니다.',
    coreInterpretation: '일간을 중심으로 보면 차분함과 추진력이 균형을 이루는 구조이며, 월지의 기운이 이를 뒷받침하는 안정적인 흐름입니다.',
    strengths: ['끈기 있게 목표를 향해 꾸준히 쌓아 올리는 지속력', '상황의 균형을 읽고 침착하게 판단하는 넓은 시야'],
    cautions: ['조급하게 서두르면 오히려 흐름이 흐트러질 수 있습니다'],
    domainInterpretation: [{ title: '일·직업', body: '안정적인 기반 위에서 점진적으로 성장하는 방식이 잘 맞습니다.' }],
    futureFlow: '',
    followUps: ['어떤 분야가 잘 맞을까요?'],
  };
  const full = JSON.stringify(rich);

  it('TRUNCATED (no closing brace) → JSON_TRUNCATED, and the raw JSON is never shown', () => {
    const truncated = full.slice(0, Math.floor(full.length * 0.6)); // cut mid-JSON
    expect(firstStructuredRejectionReason(truncated, G)).toBe('JSON_TRUNCATED');
    expect(classifyConsultationOutput(truncated, G).kind).toBe('SEMANTIC_REJECTED'); // safe message, not raw
  });
  it('malformed (balanced braces but invalid syntax) → JSON_PARSE_FAILED', () => {
    const bad = '{ "coreSummary": "차분", "coreInterpretation": "일간을 보면 균형" "strengths": ["x"] }'; // missing comma
    expect(firstStructuredRejectionReason(bad, G)).toBe('JSON_PARSE_FAILED');
  });
  it('required field missing (no coreInterpretation) → REQUIRED_FIELD_MISSING', () => {
    const missing = JSON.stringify({ coreSummary: '차분한 흐름입니다.', strengths: ['x'] });
    expect(firstStructuredRejectionReason(missing, G)).toBe('REQUIRED_FIELD_MISSING');
  });
  it('valid JSON but too shallow for a card → SUBSTANCE_GATE_FAILED (readable prose, not raw JSON)', () => {
    const shallow = JSON.stringify({ coreSummary: '차분한 흐름', coreInterpretation: '차분합니다.' });
    expect(firstStructuredRejectionReason(shallow, G)).toBe('SUBSTANCE_GATE_FAILED');
    const o = classifyConsultationOutput(shallow, G);
    expect(o.kind).toBe('STRUCTURAL_FALLBACK');
    if (o.kind === 'STRUCTURAL_FALLBACK') expect(o.text).not.toMatch(/"coreInterpretation"\s*:/);
  });
  it('extra properties do not break parsing (schema also forbids them at generation) → ACCEPTED', () => {
    const withExtra = JSON.stringify({ ...rich, madeUpField: '무시됨', score: 88 });
    expect(classifyConsultationOutput(withExtra, G).kind).toBe('ACCEPTED');
  });
  it('a fully valid rich payload → ACCEPTED (reason NONE)', () => {
    expect(classifyConsultationOutput(full, G).kind).toBe('ACCEPTED');
    expect(firstStructuredRejectionReason(full, G)).toBe('NONE');
  });
});
