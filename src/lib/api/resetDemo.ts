import { supabase } from '@/lib/supabase';

type ResetDemoResponse = {
  success: boolean;
  message?: string;
  timestamp?: string;
};

export async function resetDemoDatabase() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('You must be logged in to reset the demo data.');
  }

  const { data, error } = await supabase.functions.invoke<ResetDemoResponse>('reset_db', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.success) {
    throw new Error(data?.message ?? 'Reset failed. No response from server.');
  }

  return data;
}
