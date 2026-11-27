DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

CREATE POLICY "Anyone can view reviews for active locations"
ON public.reviews
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.parking_locations AS location
    WHERE location.id = reviews.location_id
      AND location.is_active = true
  )
);

DROP POLICY IF EXISTS "Users can update own parking images" ON storage.objects;
CREATE POLICY "Users can update own parking images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'parking-images'
  AND owner_id = (SELECT auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'parking-images'
  AND owner_id = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "Authenticated users can upload parking images" ON storage.objects;
CREATE POLICY "Authenticated users can upload parking images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'parking-images'
  AND owner_id = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "Users can delete own parking images" ON storage.objects;
CREATE POLICY "Users can delete own parking images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'parking-images'
  AND owner_id = (SELECT auth.uid()::text)
);