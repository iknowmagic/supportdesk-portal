-- Create attachments table
CREATE TABLE IF NOT EXISTS public.attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    file_path text NOT NULL,
    file_name text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON public.attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_customer_id ON public.attachments(customer_id);

-- Add comments
COMMENT ON TABLE public.attachments IS 'Attachment metadata for message files (actual files stored in Supabase Storage)';
COMMENT ON COLUMN public.attachments.customer_id IS 'Denormalized customer_id for simpler RLS policies';
COMMENT ON COLUMN public.attachments.file_path IS 'Path in Supabase Storage bucket';
