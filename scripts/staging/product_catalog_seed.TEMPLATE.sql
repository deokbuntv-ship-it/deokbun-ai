-- ============================================================================
-- product_catalog SEED — TEMPLATE ONLY (Owner Activation 05A). DO NOT APPLY AS-IS.
--
-- The store_product_id values below are PLACEHOLDERS. Fill them with the REAL product ids created by the owner
-- in App Store Connect (Apple) and Google Play Console (Google) during store provisioning (05B), then review and
-- apply to STAGING only. The store product id NEVER authorizes a grant by itself — grant_amount is the SERVER
-- value; an unknown store id fails closed. No fake/production-like ids are seeded by this activation.
--
-- Internal keys + server grant amounts (locked policy — do not change here):
--   DUK_FIRST_20  = 20 Duk (lifetime once)   DUK_BASE_50 = 50 Duk    DUK_LARGE_120 = 120 Duk
-- PLUS_MONTHLY is intentionally omitted (subscription not enabled this sprint).
-- ============================================================================

-- APPLE (consumables)
insert into public.product_catalog (provider, store_product_id, internal_product_key, grant_type, grant_amount, lifetime_once, active) values
  ('APPLE',  'REPLACE_WITH_APPLE_FIRST20_PRODUCT_ID',  'DUK_FIRST_20',  'DUK', 20,  true,  true),
  ('APPLE',  'REPLACE_WITH_APPLE_BASE50_PRODUCT_ID',   'DUK_BASE_50',   'DUK', 50,  false, true),
  ('APPLE',  'REPLACE_WITH_APPLE_LARGE120_PRODUCT_ID', 'DUK_LARGE_120', 'DUK', 120, false, true)
on conflict do nothing;

-- GOOGLE (one-time products)
insert into public.product_catalog (provider, store_product_id, internal_product_key, grant_type, grant_amount, lifetime_once, active) values
  ('GOOGLE', 'REPLACE_WITH_GOOGLE_FIRST20_PRODUCT_ID',  'DUK_FIRST_20',  'DUK', 20,  true,  true),
  ('GOOGLE', 'REPLACE_WITH_GOOGLE_BASE50_PRODUCT_ID',   'DUK_BASE_50',   'DUK', 50,  false, true),
  ('GOOGLE', 'REPLACE_WITH_GOOGLE_LARGE120_PRODUCT_ID', 'DUK_LARGE_120', 'DUK', 120, false, true)
on conflict do nothing;

-- Verify after apply: every row's grant_amount matches the locked policy; no 'REPLACE_WITH_' id remains.
-- select provider, store_product_id, internal_product_key, grant_amount, lifetime_once from public.product_catalog order by provider, grant_amount;
