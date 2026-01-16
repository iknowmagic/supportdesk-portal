import type { Session } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { redirectIfAuthenticated, requireAuth } from '../authGuard';

describe('authGuard', () => {
  it('redirects to login when session is missing', () => {
    expect(() =>
      requireAuth({
        context: {
          auth: {
            session: null,
            loading: false,
          },
        },
      })
    ).toThrow();
  });

  it('allows access when session is present', () => {
    const session = {} as Session;

    expect(() =>
      requireAuth({
        context: {
          auth: {
            session,
            loading: false,
          },
        },
      })
    ).not.toThrow();
  });

  it('redirects when session is expired', () => {
    const session = { expires_at: 1 } as Session;

    expect(() =>
      requireAuth({
        context: {
          auth: {
            session,
            loading: false,
          },
        },
      })
    ).toThrow();
  });

  it('redirects to home when session exists for guest routes', () => {
    const session = {} as Session;

    expect(() =>
      redirectIfAuthenticated({
        context: {
          auth: {
            session,
            loading: false,
          },
        },
      })
    ).toThrow();
  });

  it('allows guest routes when session is missing', () => {
    expect(() =>
      redirectIfAuthenticated({
        context: {
          auth: {
            session: null,
            loading: false,
          },
        },
      })
    ).not.toThrow();
  });
});
