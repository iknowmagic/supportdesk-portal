-- InboxHQ Demo Schema
-- Single-user demo app - no RLS, no multi-tenant features
-- Following APP.md: single demo user with seeded fictional data

-- Demo user profile (single row only)
CREATE TABLE IF NOT EXISTS public.demo_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_demo_user CHECK (id = id) -- Ensures only one row via seed
);

-- Fictional actors (people shown in UI but not real users)
CREATE TABLE IF NOT EXISTS public.actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  avatar_url text,
  role text, -- e.g., "Customer", "Support Agent", "Manager"
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Support tickets
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'open', -- 'open', 'pending', 'closed'
  priority text NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  from_actor_id uuid REFERENCES public.actors(id),
  from_name text NOT NULL, -- Denormalized for simpler queries
  assigned_to_actor_id uuid REFERENCES public.actors(id),
  assigned_to_name text, -- Denormalized
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Comments/replies on tickets
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.actors(id),
  actor_name text NOT NULL, -- Denormalized
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON public.comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- Comments
COMMENT ON TABLE public.demo_profile IS 'Single demo user profile - not for multi-user';
COMMENT ON TABLE public.actors IS 'Fictional people shown in UI (not real users)';
COMMENT ON TABLE public.tickets IS 'Support tickets for the demo';
COMMENT ON TABLE public.comments IS 'Replies/comments on tickets';

-- Note: updated_at will be managed by Edge Functions, not triggers
