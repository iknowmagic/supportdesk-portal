-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

## Time Rounding Principle

**All timestamps are rounded to the nearest 5-minute interval** for consistency across the system.
- Rationale: Cleaner UI, simpler scheduling math, consistent data
- Implementation: `supabase/functions/_shared/timeUtils.ts` provides `roundToNearest5Minutes()`
- Applied by: All Edge Functions that create/update tasks (task, create-task, auto-scheduler)
- Example: `13:34:17.082` → `13:35:00.000`, `13:58:00` → `14:00:00` (handles hour rollovers)

## Schema Evolution Note
The `task_dependencies` table has been removed (2025-12-12) in favor of the ordered `dependency_stacks` and `dependency_stack_items` structure. All dependency reads/writes now flow through stacks; no direct edge table remains.

## Tables

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  color text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
-- Note: category names are not unique; users may create duplicate names with different colors if they want.

CREATE TABLE public.default_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  work_hours_start time without time zone NOT NULL DEFAULT '08:00:00'::time without time zone,
  work_hours_end time without time zone NOT NULL DEFAULT '20:00:00'::time without time zone,
  event_color text NOT NULL DEFAULT 'rgb(96, 165, 250)'::text,
  auto_schedule boolean NOT NULL DEFAULT true,
  duration integer NOT NULL DEFAULT 60,
  priority text NOT NULL DEFAULT 'normal'::text CHECK (priority = ANY (ARRAY['asap'::text, 'high'::text, 'normal'::text, 'low'::text])),
  splittable_enabled boolean NOT NULL DEFAULT true,
  min_splittable_duration integer NOT NULL DEFAULT 30,
  max_splittable_duration integer NOT NULL DEFAULT 60,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  working_day_monday boolean NOT NULL DEFAULT true,
  working_day_tuesday boolean NOT NULL DEFAULT true,
  working_day_wednesday boolean NOT NULL DEFAULT true,
  working_day_thursday boolean NOT NULL DEFAULT true,
  working_day_friday boolean NOT NULL DEFAULT true,
  working_day_saturday boolean NOT NULL DEFAULT false,
  working_day_sunday boolean NOT NULL DEFAULT false,
  scheduling_lookahead_weeks integer NOT NULL DEFAULT 4 CHECK (scheduling_lookahead_weeks >= 1 AND scheduling_lookahead_weeks <= 8),
  max_segment_gap_days integer NOT NULL DEFAULT 3 CHECK (max_segment_gap_days >= 1 AND max_segment_gap_days <= 7),
  time_zone text NOT NULL DEFAULT 'America/Los_Angeles'::text,
  buffer_before integer NOT NULL DEFAULT 15,
  buffer_after integer NOT NULL DEFAULT 15,
  buffers_enabled boolean NOT NULL DEFAULT true,
  CONSTRAINT default_values_pkey PRIMARY KEY (id)
);

CREATE TABLE public.dependency_stacks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  # DB Structure

  This starter ships without a database schema. Add a new section here if you introduce migrations or a data model so contributors know which tables and relations exist.
**Note:** This function is obsolete and contains references to dropped columns. Do not use.
The current Edge function at `/functions/v1/create-task` provides the same functionality with proper buffer handling via `event_buffers` table.

<details>
<summary>Legacy implementation (for reference only)</summary>

```sql
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_duration integer := coalesce(p_duration_minutes, 60);
  v_start timestamptz := to_timestamp(round(extract(epoch from v_now) / 300) * 300);
  v_end timestamptz := v_start + make_interval(mins => v_duration);
  v_buffer_before integer;
  v_buffer_after integer;
  v_min_split integer;
  v_max_split integer;
  v_event public.events;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Prefer user preset marked as default; fallback to 15/15
  select bp.buffer_before, bp.buffer_after
    into v_buffer_before, v_buffer_after
  from public.user_buffer_presets bp
  where bp.user_id = v_user_id and bp.is_default = true
  order by bp.updated_at desc
  limit 1;
  v_buffer_before := coalesce(v_buffer_before, 15);
  v_buffer_after := coalesce(v_buffer_after, 15);

  -- Pull splittable defaults from user_preferences (or fallback)
  select min_splittable_duration, max_splittable_duration
    into v_min_split, v_max_split
  from public.user_preferences
  where user_id = v_user_id
  limit 1;
  v_min_split := coalesce(v_min_split, 30);
  v_max_split := coalesce(v_max_split, 60);

  insert into public.events (
    user_id,
    title,
    start,
    "end",
    duration,
    auto_schedule,
    priority,
    buffer_before,
    buffer_after,
    buffer_mode,
    buffers_enabled,
    is_splittable,   -- legacy flag; splitting inferred from min/max
    min_duration,
    max_duration,
    start_task,
    category_id,
    recurrence_mode,
    recurrence_daily_pattern,
    recurrence_week_interval,
    recurrence_week_days,
    recurrence_month_interval,
    recurrence_month_day
  )
  values (
    v_user_id,
    coalesce(nullif(p_title, ''), 'Untitled task'),
    v_start,
    v_end,
    v_duration,
    true,
    'normal',
    v_buffer_before,
    v_buffer_after,
    'simple',
    true,
    true,
    v_min_split,
    v_max_split,
    v_start,
    p_category_id,
    'none',
    null,
    1,
    null,
    1,
    null
  )
  returning * into v_event;

  -- Seed event_buffers for simple mode
  insert into public.event_buffers (event_id, segment_le_minutes, buffer_before, buffer_after)
  values (v_event.id, null, v_buffer_before, v_buffer_after);

  return v_event;
end;
```

</details>

### create_category (RETIRED - Use POST /functions/v1/category)

**Note:** This function exposed direct table access. All user-scoped tables now have `DEFAULT auth.uid()` on the `user_id` column. Client MUST NOT send `user_id` - database auto-populates from JWT context. RLS policies enforce `auth.uid() = user_id`. No custom DB functions or triggers are used.

```sql

  insert into public.categories (name, color, user_id)
  values (p_name, p_color, auth.uid())
  returning *;


create_duration_preset:

  insert into public.user_duration_presets (minutes, label, user_id)
  values (p_minutes, p_label, auth.uid())
  returning *;


ensure_default_window:

DECLARE
  defaults RECORD;
  new_window_id uuid;
BEGIN
  IF NEW.window_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT
    work_hours_start,
    work_hours_end,
    working_day_monday,
    working_day_tuesday,
    working_day_wednesday,
    working_day_thursday,
    working_day_friday,
    working_day_saturday,
    working_day_sunday
  INTO defaults
  FROM default_values
  ORDER BY created_at ASC
  LIMIT 1;

  INSERT INTO public.scheduling_windows (
    user_id,
    name,
    start_time,
    end_time,
    working_day_monday,
    working_day_tuesday,
    working_day_wednesday,
    working_day_thursday,
    working_day_friday,
    working_day_saturday,
    working_day_sunday
  )
  VALUES (
    NEW.user_id,
    'Available Hours',
    COALESCE(defaults.work_hours_start, '08:00'::time),
    COALESCE(defaults.work_hours_end, '20:00'::time),
    COALESCE(defaults.working_day_monday, true),
    COALESCE(defaults.working_day_tuesday, true),
    COALESCE(defaults.working_day_wednesday, true),
    COALESCE(defaults.working_day_thursday, true),
    COALESCE(defaults.working_day_friday, true),
    COALESCE(defaults.working_day_saturday, false),
    COALESCE(defaults.working_day_sunday, false)
  )
  ON CONFLICT (user_id, name) DO UPDATE
    SET start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        working_day_monday = EXCLUDED.working_day_monday,
        working_day_tuesday = EXCLUDED.working_day_tuesday,
        working_day_wednesday = EXCLUDED.working_day_wednesday,
        working_day_thursday = EXCLUDED.working_day_thursday,
        working_day_friday = EXCLUDED.working_day_friday,
        working_day_saturday = EXCLUDED.working_day_saturday,
        working_day_sunday = EXCLUDED.working_day_sunday
  RETURNING id INTO new_window_id;

  NEW.window_id := new_window_id;
  RETURN NEW;
END;

ensure_user_buffer_presets:

begin
  if p_user_id is null then
    return;
  end if;

  if not exists (
    select 1 from public.user_buffer_presets where user_id = p_user_id
  ) then
    insert into public.user_buffer_presets (
      user_id,
      interval_name,
      buffer_before,
      buffer_after,
      is_default
    )
    values
      (p_user_id, 'regular', 15, 15, true),
      (p_user_id, 'interval30min', 5, 5, false),
      (p_user_id, 'interval1hr', 15, 15, false),
      (p_user_id, 'interval2hr', 20, 20, false),
      (p_user_id, 'interval4hr', 45, 45, false);
  end if;
end;

fetch_bootstrap: removed; replaced by Edge /functions/v1/bootstrap for initial hydration

declare
  v_tasks jsonb;
  v_categories jsonb;
  v_prefs jsonb;
  v_durations jsonb;
begin
  select coalesce(jsonb_agg(t), '[]'::jsonb)
  into v_tasks
  from (
    select e.*,
      coalesce(
        (select jsonb_agg(eb order by eb.segment_le_minutes nulls last)
         from public.event_buffers eb
         where eb.event_id = e.id),
        '[]'::jsonb
      ) as event_buffers
    from public.events e
    where e.user_id = auth.uid()
    order by e.start nulls last
  ) t;

  select coalesce(jsonb_agg(c order by c.name), '[]'::jsonb)
  into v_categories
  from public.categories c
  where c.user_id = auth.uid();

  -- fetch_duration_presets() call replaced by GET /functions/v1/duration-presets Edge Function in bootstrap.
  -- legacy preferences RPC removed; Edge /functions/v1/user-preferences now supplies prefs
  select null::jsonb into v_prefs;

  return jsonb_build_object(
    'tasks', v_tasks,
    'categories', v_categories,
    'user_preferences', v_prefs,
    'duration_presets', v_durations
  );
end;

fetch_duration_presets:

  with defaults as (
    select gen_random_uuid() as id, null::int as minutes, 'No estimate'::text as label
    union all
    select gen_random_uuid() as id, unnest(array[30,60,120,240]) as minutes, null::text as label
  ),
  personal as (
    select id, minutes, label
    from public.user_duration_presets
    where user_id = auth.uid()
  )
  select distinct on (minutes) id, minutes, label
  from (
    select * from defaults
    union all
    select * from personal
  ) combined
  order by minutes nulls first;

fetch_stack_for_ui (RETIRED):

declare
  v_stack_id uuid;
  v_cnt integer;
begin
  select dsi.stack_id
    into v_stack_id
  from public.dependency_stack_items dsi
  where dsi.task_id = p_task_id
  limit 1;

  if v_stack_id is null then
    return;
  end if;

  select count(*) into v_cnt
  from public.dependency_stack_items dsi
  where dsi.stack_id = v_stack_id;

  if v_cnt < 2 then
    return;
  end if;

  return query
    select dsi.stack_id, dsi.task_id, dsi.stack_position, e.title
    from public.dependency_stack_items dsi
    join public.events e on e.id = dsi.task_id
    where dsi.stack_id = v_stack_id
    order by dsi.stack_position;
end;

get_dependency_stack:

declare
  s_id uuid;
begin
  select stack_id into s_id from public.dependency_stack_items where task_id = p_task_id;
  if s_id is null then
    return;
  end if;

  return query
    select dsi.stack_id, dsi.task_id, dsi.stack_position, e.title
    from public.dependency_stack_items dsi
    join public.events e on e.id = dsi.task_id
    where dsi.stack_id = s_id
    order by dsi.stack_position;
end;

### get_user_preferences (RETIRED - Use GET /functions/v1/user-preferences)

**Note:** This RPC function has been replaced. The Edge function provides cleaner JSON output and proper separation of concerns.

<details>
<summary>Legacy implementation (for reference only - contains obsolete column references)</summary>

```sql
declare
  current_user_id uuid := auth.uid();
  result_record public.user_preferences%rowtype;
  presets_json json := '[]';
begin
  if current_user_id is null then
    raise exception 'auth.uid() returned null';
  end if;

  select *
    into result_record
    from public.user_preferences
    where user_id = current_user_id;

  if not found then
    select
      current_user_id as user_id,
      null::timestamptz as created_at,
      null::timestamptz as updated_at,
      dv.work_hours_start,
      dv.work_hours_end,
      dv.working_day_monday,
      dv.working_day_tuesday,
      dv.working_day_wednesday,
      dv.working_day_thursday,
      dv.working_day_friday,
      dv.working_day_saturday,
      dv.working_day_sunday,
      dv.event_color,
      dv.auto_schedule,
      dv.duration,
      dv.priority,
      dv.is_pushable, -- OBSOLETE: column dropped from default_values table
      dv.splittable_enabled,
      dv.min_splittable_duration,
      dv.max_splittable_duration,
      dv.scheduling_lookahead_weeks,
      dv.max_segment_gap_days,
      dv.time_zone,
      null::uuid as window_id,
      dv.buffers_enabled
    into result_record
    from public.default_values dv
    limit 1;
  end if;

  perform public.ensure_user_buffer_presets(current_user_id);

  select coalesce(
    json_agg(
      json_build_object(
        'id', bp.id,
        'user_id', bp.user_id,
        'interval_name', bp.interval_name,
        'buffer_before', bp.buffer_before,
        'buffer_after', bp.buffer_after,
        'is_default', bp.is_default,
        'segment_le_minutes', bp.segment_le_minutes,
        'created_at', bp.created_at,
        'updated_at', bp.updated_at
      )
      order by bp.segment_le_minutes nulls last
    ),
    '[]'
  )
  into presets_json
  from public.user_buffer_presets bp
  where bp.user_id = current_user_id;

  return json_build_object(
    'user_id', result_record.user_id,
    'created_at', result_record.created_at,
    'updated_at', result_record.updated_at,
    'work_hours_start', result_record.work_hours_start,
    'work_hours_end', result_record.work_hours_end,
    'working_day_monday', result_record.working_day_monday,
    'working_day_tuesday', result_record.working_day_tuesday,
    'working_day_wednesday', result_record.working_day_wednesday,
    'working_day_thursday', result_record.working_day_thursday,
    'working_day_friday', result_record.working_day_friday,
    'working_day_saturday', result_record.working_day_saturday,
    'working_day_sunday', result_record.working_day_sunday,
    'event_color', result_record.event_color,
    'auto_schedule', result_record.auto_schedule,
    'duration', result_record.duration,
    'priority', result_record.priority,
    'is_pushable', result_record.is_pushable, -- OBSOLETE: column dropped
    'splittable_enabled', result_record.splittable_enabled,
    'min_splittable_duration', result_record.min_splittable_duration,
    'max_splittable_duration', result_record.max_splittable_duration,
    'scheduling_lookahead_weeks', result_record.scheduling_lookahead_weeks,
    'max_segment_gap_days', result_record.max_segment_gap_days,
    'time_zone', result_record.time_zone,
    'window_id', result_record.window_id,
    'buffers_enabled', result_record.buffers_enabled, -- OBSOLETE: function retired
    'buffer_presets', presets_json
  );
end;
```

**Legacy column references in this function:**
- `is_pushable` - Column dropped from `user_preferences` and `default_values`

</details>

### remove_dependency_from_stack (RETIRED)

```sql
declare
  anchor_task_id uuid;
begin
  select task_id into anchor_task_id
  from public.dependency_stack_items
  where stack_id = p_stack_id
  order by stack_position
  limit 1;

  delete from public.dependency_stack_items where stack_id = p_stack_id and task_id = p_task_id;
  -- Note: With the new dependency_stack_items approach, removing the item from the stack
  -- effectively removes the dependency relationship without needing separate task_dependencies table

  with ordered as (
    select id, row_number() over (order by stack_position) as rn
    from public.dependency_stack_items
    where stack_id = p_stack_id
  )
  update public.dependency_stack_items dsi
  set stack_position = o.rn
  from ordered o
  where dsi.id = o.id;
end;

reorder_dependency_stack (RETIRED):

declare
  expected_count integer;
  provided_count integer;
  updated_count integer;
begin
  select count(*) into expected_count from public.dependency_stack_items where stack_id = p_stack_id;
  select coalesce(array_length(p_task_ids, 1), 0) into provided_count;
  if expected_count <> provided_count then
    raise exception 'Task list length mismatch';
  end if;

  -- Move positions out of the way while keeping them positive.
  update public.dependency_stack_items
  set stack_position = stack_position + 10000
  where stack_id = p_stack_id;

  -- Apply the new ordering 1..n.
  update public.dependency_stack_items dsi
  set stack_position = t.ord
  from unnest(p_task_ids) with ordinality as t(task_id, ord)
  where dsi.stack_id = p_stack_id and dsi.task_id = t.task_id;

  get diagnostics updated_count = row_count;
  if updated_count <> expected_count then
    raise exception 'Task list must include all tasks in the stack';
  end if;
end;

save_task:

Removed. Legacy RPC replaced by Edge task endpoint (/functions/v1/task). See 20251206123000_drop_save_task.sql for drop and the Task edge function for current logic.

set_user_buffer_presets_updated_at:

begin
  new.updated_at = now();
  return new;
end;

update_updated_at_column:

BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
