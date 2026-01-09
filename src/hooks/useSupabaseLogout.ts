import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { noctare } from '@/lib/noctare';
import { toast } from 'sonner';

export function useSupabaseLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      toast.success('Logged out successfully');
    } catch (error) {
      noctare.log('Logout error:', error);
      toast.error('Failed to log out', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      // Always reset the loading state regardless of success or failure
      setIsLoggingOut(false);
    }
  }, []);

  return { logout, isLoggingOut };
}
