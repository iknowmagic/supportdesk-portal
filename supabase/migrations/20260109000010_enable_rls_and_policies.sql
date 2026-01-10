-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_state ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CUSTOMERS POLICIES
-- ============================================================================

-- Customer users can read only their own customer row
CREATE POLICY "customers_customer_read_own"
ON public.customers
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT customer_id
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'customer'
    )
);

-- Admin users can read all customers
CREATE POLICY "customers_admin_read_all"
ON public.customers
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admin users can insert/update/delete customers
CREATE POLICY "customers_admin_write_all"
ON public.customers
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "profiles_read_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admin users can read all profiles (if needed by UI)
CREATE POLICY "profiles_admin_read_all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================

-- Customer users can read conversations for their customer
CREATE POLICY "conversations_customer_read_own"
ON public.conversations
FOR SELECT
TO authenticated
USING (
    customer_id IN (
        SELECT customer_id
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'customer'
    )
);

-- Customer users can create conversations for their customer
CREATE POLICY "conversations_customer_insert_own"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
    customer_id IN (
        SELECT customer_id
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'customer'
    )
);

-- Customer users can update their own conversations (for tags/status if needed)
CREATE POLICY "conversations_customer_update_own"
ON public.conversations
FOR UPDATE
TO authenticated
USING (
    customer_id IN (
        SELECT customer_id
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'customer'
    )
);

-- Admin users can read all conversations
CREATE POLICY "conversations_admin_read_all"
ON public.conversations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admin users can update all conversations
CREATE POLICY "conversations_admin_update_all"
ON public.conversations
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admin users can insert conversations for any customer
CREATE POLICY "conversations_admin_insert_all"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Customer users can read messages in conversations belonging to their customer
CREATE POLICY "messages_customer_read_own"
ON public.messages
FOR SELECT
TO authenticated
USING (
    conversation_id IN (
        SELECT id
        FROM public.conversations
        WHERE customer_id IN (
            SELECT customer_id
            FROM public.profiles
            WHERE id = auth.uid() AND role = 'customer'
        )
    )
);

-- Customer users can insert messages in conversations belonging to their customer
CREATE POLICY "messages_customer_insert_own"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
    conversation_id IN (
        SELECT id
        FROM public.conversations
        WHERE customer_id IN (
            SELECT customer_id
            FROM public.profiles
            WHERE id = auth.uid() AND role = 'customer'
        )
    )
);

-- Admin users can read all messages
CREATE POLICY "messages_admin_read_all"
ON public.messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admin users can insert messages in any conversation
CREATE POLICY "messages_admin_insert_all"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- ATTACHMENTS POLICIES
-- ============================================================================

-- Customer users can read attachments for their customer
CREATE POLICY "attachments_customer_read_own"
ON public.attachments
FOR SELECT
TO authenticated
USING (
    customer_id IN (
        SELECT customer_id
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'customer'
    )
);

-- Customer users can insert attachments for their customer
CREATE POLICY "attachments_customer_insert_own"
ON public.attachments
FOR INSERT
TO authenticated
WITH CHECK (
    customer_id IN (
        SELECT customer_id
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'customer'
    )
);

-- Customer users can delete their own attachments
CREATE POLICY "attachments_customer_delete_own"
ON public.attachments
FOR DELETE
TO authenticated
USING (
    customer_id IN (
        SELECT customer_id
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'customer'
    )
);

-- Admin users can read all attachments
CREATE POLICY "attachments_admin_read_all"
ON public.attachments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admin users can insert/delete all attachments
CREATE POLICY "attachments_admin_write_all"
ON public.attachments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ============================================================================
-- DEMO_STATE POLICIES
-- ============================================================================

-- Everyone can read demo_state (for countdown display)
CREATE POLICY "demo_state_read_all"
ON public.demo_state
FOR SELECT
TO authenticated
USING (true);

-- Only service role can write (updated by Edge Functions)
-- Note: authenticated users cannot update demo_state directly
