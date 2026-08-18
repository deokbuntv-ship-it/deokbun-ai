// Share-token validation + bounded DTO parsing (Commercial UX V4 §18/§24/§27). The token shape guard is
// the open-redirect defense for the post-login continuation; the DTO parser is the last line keeping
// non-user-facing fields out of the recipient view.
import { isValidShareToken, parseSharedReportDTO } from '@/features/chat/report/shareToken';

const HEX48 = 'a'.repeat(48);

describe('isValidShareToken', () => {
  it('accepts exactly 48 lowercase hex chars', () => {
    expect(isValidShareToken(HEX48)).toBe(true);
    expect(isValidShareToken('0123456789abcdef0123456789abcdef0123456789abcdef')).toBe(true);
  });
  it('rejects wrong length, uppercase, non-hex, and non-strings', () => {
    expect(isValidShareToken('a'.repeat(47))).toBe(false);
    expect(isValidShareToken('a'.repeat(49))).toBe(false);
    expect(isValidShareToken('A'.repeat(48))).toBe(false); // uppercase
    expect(isValidShareToken('g'.repeat(48))).toBe(false); // non-hex
    expect(isValidShareToken('../etc/passwd')).toBe(false);
    expect(isValidShareToken('')).toBe(false);
    expect(isValidShareToken(null)).toBe(false);
    expect(isValidShareToken(undefined)).toBe(false);
    expect(isValidShareToken(123)).toBe(false);
  });
});

describe('parseSharedReportDTO', () => {
  it('parses a valid bounded DTO and coerces string arrays', () => {
    const dto = parseSharedReportDTO({
      title: '공유 보고서',
      generatedAt: '2026-08-18T00:00:00.000Z',
      summary: '요약',
      keyFindings: ['a', '  b  ', 1, null, ''],
      cautions: ['조심'],
      coveredTopics: [],
      // extra/forbidden fields must be ignored, never surfaced:
      ownerUserId: 'u1',
      conversationId: 'c1',
    });
    expect(dto).toEqual({
      title: '공유 보고서',
      generatedAt: '2026-08-18T00:00:00.000Z',
      summary: '요약',
      keyFindings: ['a', 'b'],
      cautions: ['조심'],
      coveredTopics: [],
    });
    // Defensive: the parsed object carries no owner/conversation fields.
    expect(Object.keys(dto ?? {})).toEqual(['title', 'generatedAt', 'summary', 'keyFindings', 'cautions', 'coveredTopics']);
  });

  it('returns null for a null/absent/non-object response (revoked/expired/not found)', () => {
    expect(parseSharedReportDTO(null)).toBeNull();
    expect(parseSharedReportDTO(undefined)).toBeNull();
    expect(parseSharedReportDTO('nope')).toBeNull();
  });

  it('falls back to a default title and null date when missing', () => {
    const dto = parseSharedReportDTO({ summary: 's' });
    expect(dto?.title).toBe('상담 보고서');
    expect(dto?.generatedAt).toBeNull();
    expect(dto?.keyFindings).toEqual([]);
  });
});
