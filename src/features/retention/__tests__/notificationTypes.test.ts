// Sprint J3 §8 — normalized notification types map to stored categories + deep links, and marketing stays a
// SEPARATE, marketing-gated type.
import { NOTIFICATION_TYPES, notificationTypeSpec, type NotificationType } from '@/features/retention/notificationTypes';

describe('notification types', () => {
  it('every service type is non-marketing and gated by a service preference', () => {
    const service: NotificationType[] = ['BIRTHDAY', 'MONTHLY_FORTUNE_READY', 'LIFE_EVENT', 'TURNING_POINT', 'SYSTEM'];
    for (const t of service) {
      const spec = notificationTypeSpec(t);
      expect(spec.isMarketing).toBe(false);
      expect(spec.consent).not.toBe('marketing');
    }
  });
  it('MARKETING is the only marketing-gated type', () => {
    expect(notificationTypeSpec('MARKETING').isMarketing).toBe(true);
    expect(notificationTypeSpec('MARKETING').consent).toBe('marketing');
  });
  it('maps to valid stored categories + deep links', () => {
    expect(notificationTypeSpec('BIRTHDAY')).toMatchObject({ category: 'birthday', deepLinkTarget: 'MONTHLY' });
    expect(notificationTypeSpec('MONTHLY_FORTUNE_READY')).toMatchObject({ category: 'monthly_fortune', deepLinkTarget: 'MONTHLY' });
    expect(notificationTypeSpec('LIFE_EVENT')).toMatchObject({ category: 'important_schedule', deepLinkTarget: 'LIFE_EVENT' });
    expect(notificationTypeSpec('SYSTEM')).toMatchObject({ category: 'service_notice', deepLinkTarget: 'HOME' });
  });
  it('covers exactly the 6 declared types', () => {
    expect(Object.keys(NOTIFICATION_TYPES).sort()).toEqual(
      ['BIRTHDAY', 'LIFE_EVENT', 'MARKETING', 'MONTHLY_FORTUNE_READY', 'SYSTEM', 'TURNING_POINT'],
    );
  });
});
