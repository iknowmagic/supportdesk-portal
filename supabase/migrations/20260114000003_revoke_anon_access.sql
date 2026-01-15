-- Revoke direct table access from anon role; allow authenticated access only.

REVOKE ALL ON TABLE public.demo_profile FROM anon;
REVOKE ALL ON TABLE public.actors FROM anon;
REVOKE ALL ON TABLE public.tickets FROM anon;
REVOKE ALL ON TABLE public.comments FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.demo_profile TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.actors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.comments TO authenticated;
