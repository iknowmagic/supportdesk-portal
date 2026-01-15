import { buildSeedData, DEMO_EMAIL } from './seed-data.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

/**
 * Wipes all demo data from the database
 */
export async function wipeDatabase(supabaseClient: SupabaseClient) {
  // Delete in correct order to respect foreign keys
  await supabaseClient.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseClient.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseClient.from('actors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseClient.from('demo_profile').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

/**
 * Populates the database with seed data
 */
export async function populateDatabase(
  supabaseClient: SupabaseClient,
  {
    demoUserId,
    demoEmail = DEMO_EMAIL,
  }: {
    demoUserId: string;
    demoEmail?: string;
  }
) {
  if (!demoUserId) {
    throw new Error('Demo user id is required to seed the database.');
  }

  const seed = buildSeedData({ demoUserId, demoEmail, now: new Date() });

  const { error: profileError } = await supabaseClient.from('demo_profile').insert(seed.demoProfiles);
  if (profileError) throw profileError;

  const { error: actorError } = await supabaseClient.from('actors').insert(seed.actors);
  if (actorError) throw actorError;

  const { error: ticketError } = await supabaseClient.from('tickets').insert(seed.tickets);
  if (ticketError) throw ticketError;

  const { error: commentError } = await supabaseClient.from('comments').insert(seed.comments);
  if (commentError) throw commentError;
}
