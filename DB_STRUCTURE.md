# Database Structure (Context Only)

```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.actors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  avatar_url text,
  role text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT actors_pkey PRIMARY KEY (id)
);

CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  actor_id uuid,
  actor_name text NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id),
  CONSTRAINT comments_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.actors(id)
);

CREATE TABLE public.demo_profile (
  id uuid NOT NULL DEFAULT gen_random_uuid() CHECK (id = id),
  user_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT demo_profile_pkey PRIMARY KEY (id),
  CONSTRAINT demo_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'open'::text,
  priority text NOT NULL DEFAULT 'normal'::text,
  from_actor_id uuid,
  from_name text NOT NULL,
  assigned_to_actor_id uuid,
  assigned_to_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tickets_pkey PRIMARY KEY (id),
  CONSTRAINT tickets_from_actor_id_fkey FOREIGN KEY (from_actor_id) REFERENCES public.actors(id),
  CONSTRAINT tickets_assigned_to_actor_id_fkey FOREIGN KEY (assigned_to_actor_id) REFERENCES public.actors(id)
);
```
