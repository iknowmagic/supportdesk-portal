# Skills Notes

## UI hydration policy
- After any successful mutation that changes user-visible data, invalidate/refetch the relevant TanStack Query caches so the UI reflects the new state (ex: demo reset, ticket creation, comment posting, status/assignee updates).
- Prefer shared query keys and broad invalidation (ex: `['tickets']`, `['actors']`) when multiple screens depend on the same data.
