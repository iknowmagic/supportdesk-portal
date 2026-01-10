-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_role text NOT NULL CHECK (author_role IN ('admin', 'customer')),
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

-- Add comments
COMMENT ON TABLE public.messages IS 'Messages within support conversations';
COMMENT ON COLUMN public.messages.author_role IS 'Role of the message author: admin or customer';
