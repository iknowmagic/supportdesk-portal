-- Create attachments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES FOR ATTACHMENTS BUCKET
-- ============================================================================

-- Customer users can upload to their own customer folder
CREATE POLICY "attachments_customer_upload_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] IN (
        SELECT customer_id::text
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'customer'
    )
);

-- Customer users can read from their own customer folder
CREATE POLICY "attachments_customer_read_own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] IN (
        SELECT customer_id::text
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'customer'
    )
);

-- Customer users can delete from their own customer folder
CREATE POLICY "attachments_customer_delete_own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'attachments' AND
    (storage.foldername(name))[1] IN (
        SELECT customer_id::text
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'customer'
    )
);

-- Admin users can upload to any folder
CREATE POLICY "attachments_admin_upload_all"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'attachments' AND
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admin users can read from any folder
CREATE POLICY "attachments_admin_read_all"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'attachments' AND
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admin users can delete from any folder
CREATE POLICY "attachments_admin_delete_all"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'attachments' AND
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
