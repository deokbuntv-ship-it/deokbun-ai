-- =============================================================================
-- DeokbunAI — Storage bucket for generated/attached media (IMAGE_STANDARD)
-- =============================================================================
-- PROPOSAL ONLY. Apply in the Supabase SQL Editor. Idempotent / re-runnable.
--
-- Creates a PUBLIC-read 'content-media' bucket so published hero images are served
-- directly. Writes are admin-only (defense-in-depth; the media-generate Edge
-- Function uses the service_role key which bypasses RLS). No secrets here.
--
-- Required before AI image generation persists results. Manual image attach does
-- not require this bucket (it stores an external URL only).
-- =============================================================================

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

drop policy if exists "content-media public read" on storage.objects;
create policy "content-media public read" on storage.objects
  for select using (bucket_id = 'content-media');

-- =============================================================================
-- After applying: deploy the media-generate Edge Function, then generate an image
-- from /admin/content/[id]. The image is uploaded here and referenced by
-- content_assets.storage_path + external_url (public CDN URL).
-- =============================================================================
