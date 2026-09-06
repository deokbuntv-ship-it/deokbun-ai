-- ============================================================================
-- DeokbunAI — CONTENT MEDIA STORAGE (승격 묶음 3 / 5)
--
-- Consolidates docs/admin/IMAGE_STORAGE_SETUP.sql: the public-read `content-media` bucket
-- plus admin-only write policies on storage.objects.
--
-- Required before AI image generation can persist a result. Manual image attach does NOT need
-- it (that path stores an external URL only), which is why everything else works without this.
--
-- 3 RULES: one domain (storage) · no functions here, so no signature hazard · the ONLY insert
-- in the entire promotion carries `on conflict do nothing` and seeds a bucket row, not user
-- data.
--
-- Defense in depth: the media-generate Edge Function uses the service_role key and bypasses
-- RLS entirely, so these policies exist to stop a logged-in NON-admin from writing — not to
-- gate the server.
--
-- ⚠ Deleting a bucket is destructive, so this migration has no down path. An unused empty
-- bucket is harmless; leave it rather than dropping it.
--
-- Depends on: public.is_admin() (묶음 1 / 20260904000000).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('content-media', 'content-media', true)
on conflict (id) do nothing;

drop policy if exists "content-media admin write" on storage.objects;
create policy "content-media admin write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'content-media' and public.is_admin());

drop policy if exists "content-media admin update" on storage.objects;
create policy "content-media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'content-media' and public.is_admin());

drop policy if exists "content-media admin delete" on storage.objects;
create policy "content-media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'content-media' and public.is_admin());

-- Public read: published hero images are served straight from the CDN.
drop policy if exists "content-media public read" on storage.objects;
create policy "content-media public read" on storage.objects
  for select using (bucket_id = 'content-media');
