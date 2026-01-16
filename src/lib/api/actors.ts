import { getAccessToken } from '@/lib/api/auth';
import { supabase } from '@/lib/supabase';

export type ActorOption = {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: 'customer' | 'agent' | 'admin';
};

export type ActorsListResponse = {
  customers: ActorOption[];
  agents: ActorOption[];
};

export async function listActors(): Promise<ActorsListResponse> {
  const accessToken = await getAccessToken('You must be logged in to load actors.');

  const { data, error } = await supabase.functions.invoke<ActorsListResponse>('actors_list', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {},
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !Array.isArray(data.customers) || !Array.isArray(data.agents)) {
    throw new Error('No actors returned from server.');
  }

  return data;
}
