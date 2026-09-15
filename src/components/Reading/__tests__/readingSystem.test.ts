// DEOKBUNI_READING_EXPERIENCE — structural guards. Source-scan (RN components aren't node-rendered here) so a
// regression (surfaces flooding, evidence un-collapsed, today/monthly diverging from the shared reader) fails CI.
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '../../..'); // src
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

describe('Reading primitives — semantic variants map to DESIGN_FREEZE pastel tokens', () => {
  const r = read('components/Reading/Reading.tsx');
  it('positive→sage, caution→butter, insight→blush (by MEANING, not colour names)', () => {
    expect(r).toMatch(/positive:\s*\{\s*surface:\s*'surfaceSage'/);
    expect(r).toMatch(/caution:\s*\{\s*surface:\s*'surfaceButter'/);
    expect(r).toMatch(/insight:\s*\{\s*surface:\s*'surfaceBlush'/);
  });
  it('emoji landmarks are the section title cue (🌿 / 🕯️ / ✨)', () => {
    expect(r).toMatch(/🌿/);
    expect(r).toMatch(/🕯️/);
    expect(r).toMatch(/✨/);
  });
  it('evidence is collapsed under a consumer-first "왜 이렇게 보나요?" label', () => {
    expect(r).toMatch(/왜 이렇게 보나요\?/);
    expect(r).toMatch(/useState\(false\)/); // collapsed by default
  });
  it('neutral/action carry NO surface, so a reading stays a connected letter (§7/§15)', () => {
    expect(r).toMatch(/neutral:\s*\{\s*surface:\s*null/);
    expect(r).toMatch(/action:\s*\{\s*surface:\s*null/);
  });
});

describe('consultation reading binds to the shared Reading system', () => {
  const c = read('features/intelligence/components/StructuredConsultationResult.tsx');
  it('uses ReadingLead / positive / caution / evidence — not plain cards', () => {
    expect(c).toMatch(/<ReadingLead/);
    expect(c).toMatch(/<ReadingSection variant="positive"/);
    expect(c).toMatch(/<ReadingSection variant="caution"/);
    expect(c).toMatch(/<ReadingEvidence/);
  });
  it('the old "상세 해석 보기" toggle is gone (replaced by 왜 이렇게 보나요?)', () => {
    expect(c).not.toMatch(/상세 해석 보기/);
  });
});

describe('today + monthly share ONE FortuneReading, no bespoke tone hex', () => {
  it('both screens render the shared FortuneReading', () => {
    expect(read('app/today.tsx')).toMatch(/<FortuneReading/);
    expect(read('app/monthly.tsx')).toMatch(/<FortuneReading/);
  });
  it('the hardcoded tone hex maps are removed (tone comes from tokens)', () => {
    expect(read('app/today.tsx')).not.toMatch(/#1F8A54/);
    expect(read('app/monthly.tsx')).not.toMatch(/#1F8A54/);
  });
  it('FortuneReading omits empty sections (optional-section safe)', () => {
    const fr = read('components/Reading/FortuneReading.tsx');
    expect(fr).toMatch(/highlights\.length > 0/);
    expect(fr).toMatch(/cautions\.length > 0/);
    expect(fr).toMatch(/domainSignals\.length > 0/);
  });
});

describe('compatibility fallback uses the same reading system as solo chat', () => {
  it('long fallback answers route to AnswerBlock (not a bare card)', () => {
    const cc = read('app/compatibility-chat.tsx');
    expect(cc).toMatch(/isLongAnswer\(m\.text\)/);
    expect(cc).toMatch(/<AnswerBlock source=\{m\.text\}/);
  });
});
