import fs from 'node:fs';
import path from 'node:path';

import {
  TRACKING_QUERY_PARAM,
  TRACKING_UTM_PARAM,
  UTM_PRESETS,
  buildTrackingUrl,
  buildUtmTrackingUrl,
  parseTrackingCodeFromQuery,
  trackingCodeSource,
} from '../trackingUrl';

const CODE = 'ad_7jk29qab';
const CODE_B = 'ad_2mnpq34r';
const ORIGIN = 'https://www.deokbunai.com';

const REPO = path.resolve(__dirname, '../../../..');
const BRIDGE = fs.readFileSync(path.join(REPO, 'src/features/ads/acquisition/AcquisitionBridge.tsx'), 'utf8');
const CARD = fs.readFileSync(path.join(REPO, 'src/features/ads/components/TrackingUrlCard.tsx'), 'utf8');
const AASA = path.join(REPO, 'public/.well-known/apple-app-site-association');
const ASSETLINKS = path.join(REPO, 'public/.well-known/assetlinks.json');

// ── B1 parser ───────────────────────────────────────────────────────────────────────────────
describe('tracking code parsing — ?ad= then utm_content', () => {
  it('reads ?ad= alone (unchanged behaviour)', () => {
    expect(parseTrackingCodeFromQuery(`?${TRACKING_QUERY_PARAM}=${CODE}`)).toBe(CODE);
    expect(parseTrackingCodeFromQuery(`${TRACKING_QUERY_PARAM}=${CODE}`)).toBe(CODE);
  });

  it('reads utm_content alone', () => {
    expect(parseTrackingCodeFromQuery(`?${TRACKING_UTM_PARAM}=${CODE}`)).toBe(CODE);
  });

  it('reads utm_content out of a realistic Google Ads landing URL', () => {
    const q = `?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale&utm_term=%EC%82%AC%EC%A3%BC&${TRACKING_UTM_PARAM}=${CODE}&gclid=Cj0KCQ`;
    expect(parseTrackingCodeFromQuery(q)).toBe(CODE);
  });

  it('prefers ?ad= when BOTH are present', () => {
    expect(parseTrackingCodeFromQuery(`?${TRACKING_QUERY_PARAM}=${CODE}&${TRACKING_UTM_PARAM}=${CODE_B}`)).toBe(CODE);
    expect(parseTrackingCodeFromQuery(`?${TRACKING_UTM_PARAM}=${CODE_B}&${TRACKING_QUERY_PARAM}=${CODE}`)).toBe(CODE);
  });

  // The whole false-positive defence: utm_content is free text marketers use for creative
  // names, so anything that is not an ad_ code must be ignored, not guessed at.
  it('ignores a utm_content that is not an internal code', () => {
    for (const v of ['banner_a', 'v3_blue', '12345', 'ad_', 'ad_TOOLONGCODE', 'ad_short', 'ad_0illegal']) {
      expect(parseTrackingCodeFromQuery(`?${TRACKING_UTM_PARAM}=${v}`)).toBeNull();
    }
  });

  it('does not fall through to utm_content when ?ad= is present but invalid', () => {
    // An explicit-but-broken ?ad= is an operator error worth surfacing as "no code", not
    // something to paper over with a different parameter.
    expect(parseTrackingCodeFromQuery(`?${TRACKING_QUERY_PARAM}=nope&${TRACKING_UTM_PARAM}=${CODE}`)).toBeNull();
  });

  it('returns null for organic / empty / malformed input', () => {
    for (const v of ['', '?', null, undefined, '?foo=bar', '?utm_source=google']) {
      expect(parseTrackingCodeFromQuery(v as string)).toBeNull();
    }
    expect(parseTrackingCodeFromQuery(`?${TRACKING_UTM_PARAM}=%E0%A4%A`)).toBeNull(); // bad percent-encoding
  });

  it('does not match a parameter whose name merely ends with the key', () => {
    expect(parseTrackingCodeFromQuery(`?bad=${CODE}`)).toBeNull();
    expect(parseTrackingCodeFromQuery(`?xutm_content=${CODE}`)).toBeNull();
  });
});

describe('trackingCodeSource — which param the cleanup must remove', () => {
  it('names the parameter that supplied the code', () => {
    expect(trackingCodeSource(`?${TRACKING_QUERY_PARAM}=${CODE}`)).toBe('ad');
    expect(trackingCodeSource(`?utm_source=meta&${TRACKING_UTM_PARAM}=${CODE}`)).toBe('utm_content');
    expect(trackingCodeSource(`?${TRACKING_QUERY_PARAM}=${CODE}&${TRACKING_UTM_PARAM}=${CODE_B}`)).toBe('ad');
  });

  it('names nothing when no valid code is present', () => {
    expect(trackingCodeSource('?utm_content=banner_a')).toBeNull();
    expect(trackingCodeSource('')).toBeNull();
  });
});

// ── B1 URL builder ──────────────────────────────────────────────────────────────────────────
describe('buildUtmTrackingUrl', () => {
  it('puts the code in utm_content and nowhere else', () => {
    const url = buildUtmTrackingUrl(CODE, ORIGIN, { source: 'google', medium: 'cpc' });
    expect(url).toBe(`${ORIGIN}/?utm_source=google&utm_medium=cpc&utm_content=${CODE}`);
    // Round-trip: the URL we hand the operator must parse back to the same code.
    expect(parseTrackingCodeFromQuery(new URL(url as string).search)).toBe(CODE);
  });

  it('omits utm_campaign — a campaign name is the operator’s copy, not ours to invent', () => {
    const url = buildUtmTrackingUrl(CODE, ORIGIN, { source: 'meta', medium: 'paid_social' });
    expect(url).not.toContain('utm_campaign');
  });

  it('fails closed exactly like buildTrackingUrl (no fake domain, no invalid code)', () => {
    expect(buildUtmTrackingUrl(CODE, 'http://localhost:8081', { source: 'g', medium: 'c' })).toBeNull();
    expect(buildUtmTrackingUrl(CODE, null, { source: 'g', medium: 'c' })).toBeNull();
    expect(buildUtmTrackingUrl('nope', ORIGIN, { source: 'g', medium: 'c' })).toBeNull();
  });

  it('every preset round-trips', () => {
    expect(UTM_PRESETS.length).toBeGreaterThan(0);
    for (const p of UTM_PRESETS) {
      const url = buildUtmTrackingUrl(CODE, ORIGIN, { source: p.source, medium: p.medium });
      expect(parseTrackingCodeFromQuery(new URL(url as string).search)).toBe(CODE);
    }
  });

  it('leaves the direct ?ad= builder untouched', () => {
    expect(buildTrackingUrl(CODE, ORIGIN)).toBe(`${ORIGIN}/?ad=${CODE}`);
  });
});

// ── native deep link (source contract — no render harness exists) ───────────────────────────
describe('AcquisitionBridge native link receiver', () => {
  it('registers both cold-start and running-app handlers', () => {
    expect(BRIDGE).toContain('getInitialURL');
    expect(BRIDGE).toContain("addEventListener?.('url'");
  });

  it('loads expo-linking lazily so the web bundle and jest never pull it', () => {
    expect(BRIDGE).toContain("require('expo-linking')");
    expect(BRIDGE).not.toMatch(/^import .*expo-linking/m);
  });

  it('never runs the native path on web — no double counting', () => {
    expect(BRIDGE).toContain("if (Platform.OS === 'web') return;");
  });

  it('feeds the deep link through the SAME parser and capture path as web', () => {
    // One capture() helper used by both effects: web and native cannot drift apart.
    expect(BRIDGE).toContain('const capture = (search: string)');
    expect(BRIDGE).toContain('parseTrackingCodeFromQuery(search)');
    expect(BRIDGE).toContain('captureAcquisition(code, visitorId)');
    expect(BRIDGE).toContain('recordAdClick(code, visitorId)');
  });

  it('guards against the two handlers double-counting one launch', () => {
    expect(BRIDGE).toContain('capturedRef.current');
  });

  it('cleans up its subscription', () => {
    expect(BRIDGE).toContain('subscription?.remove()');
  });

  it('degrades silently when expo-linking is unavailable', () => {
    const nativeEffect = BRIDGE.slice(BRIDGE.indexOf("if (Platform.OS === 'web') return;"));
    expect(nativeEffect).toContain('try {');
    expect(nativeEffect).toContain('} catch {');
  });

  // WEB REGRESSION LOCK — effect (1) must keep doing exactly what it did.
  it('web path still reads window.location and strips the consumed param', () => {
    expect(BRIDGE).toContain("if (typeof window === 'undefined' || !window.location) return;");
    expect(BRIDGE).toContain('window.location.search');
    expect(BRIDGE).toContain('window.history.replaceState');
    expect(BRIDGE).toContain('url.searchParams.delete(consumed)');
  });

  it('strips ONLY the parameter that carried the code, never the other utm keys', () => {
    expect(BRIDGE).toContain('trackingCodeSource(search)');
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term']) {
      expect(BRIDGE).not.toContain(`delete('${k}')`);
    }
  });

  it('still flushes attribution on auth', () => {
    expect(BRIDGE).toContain('recordAcquisitionAttribution(userId)');
  });
});

// ── admin URL card ──────────────────────────────────────────────────────────────────────────
describe('TrackingUrlCard external-platform URLs', () => {
  it('offers a copy button per preset so nobody hand-types the code', () => {
    expect(CARD).toContain('UTM_PRESETS.map');
    expect(CARD).toContain('buildUtmTrackingUrl');
    expect(CARD).toContain('copyText(p.key, utmUrl)');
  });

  it('scopes the copied/failed note to the button that was pressed', () => {
    expect(CARD).toContain('CopyNote forKey');
    expect(CARD).toContain("copyState?.key === forKey");
  });
});

// ── association files ───────────────────────────────────────────────────────────────────────
describe('.well-known association files', () => {
  it('apple-app-site-association is valid JSON with the real bundle id', () => {
    const j = JSON.parse(fs.readFileSync(AASA, 'utf8'));
    const detail = j.applinks.details[0];
    expect(detail.appIDs[0]).toContain('com.deokbun.app');
    expect(detail.components[0]['/']).toBe('/*');
  });

  it('assetlinks.json is valid JSON with the real package name', () => {
    const j = JSON.parse(fs.readFileSync(ASSETLINKS, 'utf8'));
    expect(j[0].target.package_name).toBe('com.deokbun.app');
    expect(j[0].relation).toContain('delegate_permission/common.handle_all_urls');
  });

  // These two values cannot be known until the owner creates the Apple team / Play signing
  // key. The placeholders must stay obvious so nobody ships them by accident.
  it('keeps the owner-supplied values as loud placeholders', () => {
    expect(fs.readFileSync(AASA, 'utf8')).toContain('REPLACE_TEAM_ID');
    expect(fs.readFileSync(ASSETLINKS, 'utf8')).toContain('REPLACE_SHA256_FINGERPRINT');
  });

  it('vercel serves both as application/json (Apple rejects any other type)', () => {
    const v = JSON.parse(fs.readFileSync(path.join(REPO, 'vercel.json'), 'utf8'));
    const sources = (v.headers ?? []).map((h: { source: string }) => h.source);
    expect(sources).toContain('/.well-known/apple-app-site-association');
    expect(sources).toContain('/.well-known/assetlinks.json');
    for (const h of v.headers) {
      expect(h.headers[0]).toEqual({ key: 'Content-Type', value: 'application/json' });
    }
  });
});
