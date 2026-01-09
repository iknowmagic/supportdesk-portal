import { gql } from 'graphql-request';
import { createGraphqlClient } from '../graphqlClient';
import { supabase } from '../supabase';
import { noctare } from '../devLogger';

const UPDATE_EVENT_PROGRESS = gql`
  mutation UpdateEventProgress($id: uuid!, $completedDuration: Int!) {
    update_events(where: { id: { _eq: $id } }, _set: { completed_duration: $completedDuration }) {
      returning {
        id
        completed_duration
        completed_at
      }
    }
  }
`;

type UpdateEventProgressResponse = {
  update_events: {
    returning: Array<{
      id: string;
      completed_duration: number | null;
      completed_at: string | null;
    }>;
  };
};

export interface EventProgressUpdate {
  id: string;
  completedDuration: number;
  completedAt: string | null;
}

async function updateEventProgressRest(id: string, completedDuration: number): Promise<EventProgressUpdate> {
  // Use a more explicit approach to handle Supabase's complex union types
  const response = await supabase
    .from('events')
    .update({ completed_duration: completedDuration })
    .eq('id', id)
    .select('id, completed_duration, completed_at')
    .single();

  // Verify we have success response
  if (response.error) {
    throw new Error(response.error.message ?? 'Failed to update progress via REST');
  }

  if (!response.data) {
    throw new Error('No data returned from update operation');
  }

  // Use type assertion to bypass complex union type
  const result = response.data as unknown as { id: string; completed_duration: number | null; completed_at: string | null };

  return {
    id: result.id,
    completedDuration: result.completed_duration ?? 0,
    completedAt: result.completed_at,
  };
}

export async function updateEventProgress(id: string, completedDuration: number): Promise<EventProgressUpdate> {
  try {
    const client = await createGraphqlClient();
    const result = await client.request<UpdateEventProgressResponse>(UPDATE_EVENT_PROGRESS, { id, completedDuration });

    const returning = result.update_events.returning[0];
    if (!returning) {
      throw new Error('No event returned from GraphQL update');
    }

    return {
      id: returning.id,
      completedDuration: returning.completed_duration ?? 0,
      completedAt: returning.completed_at,
    };
  } catch (error) {
    noctare.error('GraphQL update failed, falling back to REST', {
      details: error,
    });
    return updateEventProgressRest(id, completedDuration);
  }
}
