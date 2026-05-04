-- ============================================================
-- HMC — Storage bucket for weekly check-up photos
-- Generated: 2026-05-03
-- NOTE: weekly_reviews.photo_urls column already exists (0006)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('weekly-review-photos', 'weekly-review-photos', true)
on conflict do nothing;

create policy "weekly_review_photos_select" on storage.objects
  for select using (
    bucket_id = 'weekly-review-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "weekly_review_photos_insert" on storage.objects
  for insert with check (
    bucket_id = 'weekly-review-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "weekly_review_photos_delete" on storage.objects
  for delete using (
    bucket_id = 'weekly-review-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
