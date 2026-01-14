import { ACTORS, COMMENTS, TICKETS } from './seed-data.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = any;

/**
 * Wipes all demo data from the database
 */
export async function wipeDatabase(supabaseAdmin: SupabaseAdmin) {
  // Delete in correct order to respect foreign keys
  await supabaseAdmin.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('actors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabaseAdmin.from('demo_profile').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

/**
 * Populates the database with seed data
 */
export async function populateDatabase(supabaseAdmin: SupabaseAdmin) {
  const now = new Date();

  // Insert demo profile (if demo user exists in auth)
  const { data: demoUser } = await supabaseAdmin.auth.admin.listUsers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const demoUserRecord = demoUser?.users.find((u: any) => u.email === 'demo@example.com');

  if (demoUserRecord) {
    await supabaseAdmin.from('demo_profile').insert({
      user_id: demoUserRecord.id,
      full_name: 'Demo User',
      email: 'demo@example.com',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    });
  }

  // Insert actors
  await supabaseAdmin.from('actors').insert(ACTORS);

  // Insert tickets with calculated timestamps
  const ticketsToInsert = TICKETS.map((ticket) => {
    const hoursAgo = 'hours_ago' in ticket ? ticket.hours_ago : 0;
    const updatedHoursAgo = 'updated_hours_ago' in ticket ? ticket.updated_hours_ago : undefined;
    const updatedMinutesAgo = 'updated_minutes_ago' in ticket ? ticket.updated_minutes_ago : undefined;

    const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const updatedAt = new Date(
      now.getTime() -
        (updatedHoursAgo !== undefined
          ? updatedHoursAgo * 60 * 60 * 1000
          : updatedMinutesAgo !== undefined
            ? updatedMinutesAgo * 60 * 1000
            : hoursAgo * 60 * 60 * 1000)
    );

    return {
      id: ticket.id,
      subject: ticket.subject,
      body: ticket.body,
      status: ticket.status,
      priority: ticket.priority,
      from_actor_id: ticket.from_actor_id,
      from_name: ticket.from_name,
      assigned_to_actor_id: ticket.assigned_to_actor_id,
      assigned_to_name: ticket.assigned_to_name,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
    };
  });

  await supabaseAdmin.from('tickets').insert(ticketsToInsert);

  // Insert comments with calculated timestamps
  const commentsToInsert = COMMENTS.map((comment) => {
    const createdAt = new Date(now.getTime() - comment.hours_ago * 60 * 60 * 1000);

    return {
      ticket_id: comment.ticket_id,
      actor_id: comment.actor_id,
      actor_name: comment.actor_name,
      body: comment.body,
      created_at: createdAt.toISOString(),
    };
  });

  await supabaseAdmin.from('comments').insert(commentsToInsert);
}
