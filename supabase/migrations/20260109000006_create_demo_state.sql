-- Create demo_state table for tracking demo resets
CREATE TABLE IF NOT EXISTS public.demo_state (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    last_reset_at timestamptz NOT NULL DEFAULT now(),
    next_reset_at timestamptz NOT NULL DEFAULT (date_trunc('hour', now()) + interval '1 hour')
);

-- Insert initial row
INSERT INTO public.demo_state (id, last_reset_at, next_reset_at)
VALUES (
    gen_random_uuid(),
    now(),
    date_trunc('hour', now()) + interval '1 hour'
)
ON CONFLICT DO NOTHING;

-- Add comment
COMMENT ON TABLE public.demo_state IS 'Tracks demo data reset timestamps for countdown and cooldown logic';
