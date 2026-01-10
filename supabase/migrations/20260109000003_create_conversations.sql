-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    subject text NOT NULL,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed')),
    tags text[] DEFAULT '{}',
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- Add comments
COMMENT ON TABLE public.conversations IS 'Support conversations belonging to customers';
COMMENT ON COLUMN public.conversations.status IS 'Conversation status: open, pending, or closed';
COMMENT ON COLUMN public.conversations.tags IS 'Array of tags for filtering and organization';
