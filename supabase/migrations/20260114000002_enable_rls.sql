-- Enable RLS for demo tables and restrict access to authenticated users only

ALTER TABLE public.demo_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Demo profile policies
CREATE POLICY "demo_profile_select_authenticated"
ON public.demo_profile
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "demo_profile_insert_authenticated"
ON public.demo_profile
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "demo_profile_update_authenticated"
ON public.demo_profile
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "demo_profile_delete_authenticated"
ON public.demo_profile
FOR DELETE
TO authenticated
USING (true);

-- Actors policies
CREATE POLICY "actors_select_authenticated"
ON public.actors
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "actors_insert_authenticated"
ON public.actors
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "actors_update_authenticated"
ON public.actors
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "actors_delete_authenticated"
ON public.actors
FOR DELETE
TO authenticated
USING (true);

-- Tickets policies
CREATE POLICY "tickets_select_authenticated"
ON public.tickets
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "tickets_insert_authenticated"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "tickets_update_authenticated"
ON public.tickets
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "tickets_delete_authenticated"
ON public.tickets
FOR DELETE
TO authenticated
USING (true);

-- Comments policies
CREATE POLICY "comments_select_authenticated"
ON public.comments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "comments_insert_authenticated"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "comments_update_authenticated"
ON public.comments
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "comments_delete_authenticated"
ON public.comments
FOR DELETE
TO authenticated
USING (true);
