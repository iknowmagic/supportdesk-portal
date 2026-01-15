import { useCallback, useState } from 'react';
import { setDemoAutoLoginEnabled } from '@/lib/authStorage';
import { supabase } from '@/lib/supabase';
import { noctare } from '@/lib/noctare';
import { toast } from 'sonner';

export function useSupabaseLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) {
        setDemoAutoLoginEnabled(false);
        toast.success('Logged out successfully');
        return true;
      }

      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        const status = typeof error === 'object' && error && 'status' in error ? Number(error.status) : undefined;
        const message = error instanceof Error ? error.message : String(error);

        if (status === 403 || /invalid jwt|no session|not authenticated/i.test(message)) {
          setDemoAutoLoginEnabled(false);
          toast.success('Logged out successfully');
          return true;
        }

        throw error;
      }

      setDemoAutoLoginEnabled(false);
      toast.success('Logged out successfully');
      return true;
    } catch (error) {
      noctare.log('Logout error:', error);
      toast.error('Failed to log out', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
      return false;
    } finally {
      // Always reset the loading state regardless of success or failure
      setIsLoggingOut(false);
    }
  }, []);

  return { logout, isLoggingOut };
}
