-- ============================================================
-- HMC — Weekly review photo storage bucket
-- Created: 2026-05-03
--
-- Adds a Supabase Storage bucket for weekly check-up photos.
-- weekly_reviews.photo_urls (text[] column) already exists
-- from migration 0006.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('weekly-review-photos', 'weekly-review-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "weekly_review_photos_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'weekly-review-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "weekly_review_photos_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'weekly-review-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "weekly_review_photos_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'weekly-review-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "weekly_review_photos_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'weekly-review-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
