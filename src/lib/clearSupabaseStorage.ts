/**
 * Utility to clear all Supabase localStorage keys
 *
 * Useful when:
 * - Switching between local and cloud Supabase projects
 * - Debugging auth issues
 * - Cleaning up stale tokens
 *
 * Usage:
 * - Run in browser console: `clearSupabaseStorage()`
 * - Or import and call in code during development
 */

import { noctare } from './devLogger';

export function clearSupabaseStorage() {
  const keysToRemove = Object.keys(localStorage).filter((key) => key.startsWith('sb-'));

  noctare.log('[Auth Cleanup] Removing Supabase keys', {
    details: keysToRemove.length,
  });
  keysToRemove.forEach((key) => {
    noctare.log(`[Auth Cleanup] Removing ${key}`);
    localStorage.removeItem(key);
  });

  noctare.log('[Auth Cleanup] All Supabase tokens cleared');
  return keysToRemove;
}

// Expose to window for easy access in dev tools
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).clearSupabaseStorage = clearSupabaseStorage;
}
