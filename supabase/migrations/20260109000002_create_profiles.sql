-- Create profiles table (one row per authenticated user)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('admin', 'customer')),
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT customer_role_requires_customer_id CHECK (
        (role = 'customer' AND customer_id IS NOT NULL) OR
        (role = 'admin')
    )
);

-- Add comments
COMMENT ON TABLE public.profiles IS 'User profiles with role and customer association';
COMMENT ON COLUMN public.profiles.role IS 'User role: admin or customer';
COMMENT ON COLUMN public.profiles.customer_id IS 'Foreign key to customers table, required for customer role, null for admin';
