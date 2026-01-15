/**
 * Shared seed data generator for database reset operations.
 * Used by both authenticated reset_db and cron reset_db_4214476.
 */

type ActorRole = 'Customer' | 'Support Agent' | 'Admin';

type DemoProfileSeed = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

type ActorSeed = {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string;
  role: ActorRole;
  created_at: string;
};

type TicketSeed = {
  id: string;
  subject: string;
  body: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  from_actor_id: string;
  from_name: string;
  assigned_to_actor_id: string | null;
  assigned_to_name: string | null;
  created_at: string;
  updated_at: string;
};

type CommentSeed = {
  id: string;
  ticket_id: string;
  actor_id: string;
  actor_name: string;
  body: string;
  created_at: string;
};

type SeedData = {
  demoProfiles: DemoProfileSeed[];
  actors: ActorSeed[];
  tickets: TicketSeed[];
  comments: CommentSeed[];
};

type FakeProfile = {
  id: string;
  full_name: string;
  email: string;
  avatar_seed: string;
  role: ActorRole;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export const DEMO_EMAIL = 'demo@example.com';

const FAKE_PROFILES: FakeProfile[] = [
  { id: '11111111-1111-4111-8111-111111111111', full_name: 'Ava Brooks', email: 'ava.brooks@northwind.io', avatar_seed: 'ava-brooks', role: 'Customer' },
  { id: '22222222-2222-4222-8222-222222222222', full_name: 'Miles Carter', email: 'miles.carter@northwind.io', avatar_seed: 'miles-carter', role: 'Customer' },
  { id: '33333333-3333-4333-8333-333333333333', full_name: 'Priya Nair', email: 'priya.nair@atlascloud.io', avatar_seed: 'priya-nair', role: 'Customer' },
  { id: '44444444-4444-4444-8444-444444444444', full_name: 'Ethan Wallace', email: 'ethan.wallace@atlascloud.io', avatar_seed: 'ethan-wallace', role: 'Customer' },
  { id: '55555555-5555-4555-8555-555555555555', full_name: 'Sofia Bennett', email: 'sofia.bennett@bluepine.com', avatar_seed: 'sofia-bennett', role: 'Customer' },
  { id: '66666666-6666-4666-8666-666666666666', full_name: 'Noah Kim', email: 'noah.kim@bluepine.com', avatar_seed: 'noah-kim', role: 'Customer' },
  { id: '77777777-7777-4777-8777-777777777777', full_name: 'Liam Patel', email: 'liam.patel@copperlane.co', avatar_seed: 'liam-patel', role: 'Customer' },
  { id: '88888888-8888-4888-8888-888888888888', full_name: 'Isabella Gomez', email: 'isabella.gomez@copperlane.co', avatar_seed: 'isabella-gomez', role: 'Customer' },
  { id: '99999999-9999-4999-8999-999999999999', full_name: 'Oliver Reed', email: 'oliver.reed@lumen.app', avatar_seed: 'oliver-reed', role: 'Customer' },
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', full_name: 'Maya Singh', email: 'maya.singh@lumen.app', avatar_seed: 'maya-singh', role: 'Customer' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', full_name: 'Henry Hughes', email: 'henry.hughes@loftworks.io', avatar_seed: 'henry-hughes', role: 'Customer' },
  { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', full_name: 'Chloe Foster', email: 'chloe.foster@loftworks.io', avatar_seed: 'chloe-foster', role: 'Customer' },
  { id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', full_name: 'Julian Park', email: 'julian.park@harborpay.com', avatar_seed: 'julian-park', role: 'Customer' },
  { id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', full_name: 'Alex Martinez', email: 'alex.martinez@inboxhq.com', avatar_seed: 'alex-martinez', role: 'Support Agent' },
  { id: 'ffffffff-ffff-4fff-8fff-ffffffffffff', full_name: 'Jordan Lee', email: 'jordan.lee@inboxhq.com', avatar_seed: 'jordan-lee', role: 'Support Agent' },
  { id: '12121212-1212-4121-8121-121212121212', full_name: 'Riley Chen', email: 'riley.chen@inboxhq.com', avatar_seed: 'riley-chen', role: 'Support Agent' },
  { id: '13131313-1313-4131-8131-131313131313', full_name: 'Morgan Blake', email: 'morgan.blake@inboxhq.com', avatar_seed: 'morgan-blake', role: 'Support Agent' },
  { id: '14141414-1414-4141-8141-141414141414', full_name: 'Taylor Swift', email: 'taylor.swift@inboxhq.com', avatar_seed: 'taylor-swift', role: 'Support Agent' },
  { id: '15151515-1515-4151-8151-151515151515', full_name: 'Skylar James', email: 'skylar.james@inboxhq.com', avatar_seed: 'skylar-james', role: 'Support Agent' },
  { id: '16161616-1616-4161-8161-161616161616', full_name: 'Casey Morgan', email: 'casey.morgan@inboxhq.com', avatar_seed: 'casey-morgan', role: 'Support Agent' },
];

const SUBJECTS = [
  'Unable to export data to CSV',
  'Login loop when using SSO',
  'Billing invoice missing this month',
  'Feature request: custom tags',
  'Webhook deliveries failing intermittently',
  'Need help with seat limits',
  'Notification emails not sending',
  'Question about priority rules',
  'Dark mode visual glitches',
  'API rate limits unclear',
  'Help importing historical tickets',
  'App freezes on large search',
  'How do I merge duplicate contacts?',
  'Integration with Slack not working',
  'Dashboard loading slowly',
  'Unable to update contact fields',
  'Change request: new mailbox',
  'Ticket status stuck on pending',
  'Mobile view layout issues',
  'Two-factor authentication setup',
  'Export includes deleted records',
  'Need audit trail for changes',
  'Help configuring webhooks',
  'Search results missing recent tickets',
  'Upgrade plan question',
  'Attachment uploads timing out',
  'Cannot assign agent to ticket',
  'Request for training resources',
  'Need clarification on SLA timers',
  'Billing charged twice',
  'Web app performance regression',
  'New ticket form validation error',
  'Scheduled report not delivering',
  'Account email change request',
  'Bug: emoji rendering in comments',
  'Time zone mismatch in timestamps',
  'Unable to add collaborators',
  'Need CSV field mapping',
  'Auto-responder not firing',
  'Data export formatting issue',
  'API docs out of date',
  'Support widget not loading',
  'Request: bulk status update',
  'Issue with unread badge count',
];

const BODIES = [
  'We are trying to export all ticket data but the export fails after a few seconds. Is there a known limit or timeout?',
  'SSO redirects back to login and never completes. We verified our IdP settings. Can you check logs?',
  'Our finance team did not receive the monthly invoice email. Can you resend?',
  'We would love to tag tickets by product line. Is there a way to create custom tags?',
  'Webhook calls return 502 on and off. It seems to spike during peak hours.',
  'We are close to our seat limit and need to understand upgrade options.',
  'Notification emails are not reaching our inbox. Nothing shows in spam.',
  'How do priority rules interact with SLA timers? Need clarification.',
  'Dark mode has some low-contrast text on the ticket detail view.',
  'Please clarify the API rate limits for the Professional tier.',
  'We need to import tickets from a previous system. Any recommended path?',
  'The app freezes when searching across a large dataset.',
  'Is there a way to merge duplicate contacts without losing history?',
  'Slack integration stopped posting updates. Webhook URL is unchanged.',
  'Dashboard takes 30+ seconds to load since last week.',
  'Contact fields do not save after editing. UI returns to old values.',
  'We need a new shared mailbox added to the workspace.',
  'A few tickets are stuck in pending even after agent reply.',
  'Mobile view shows overlapping cards in the inbox list.',
  'Need help setting up two-factor authentication for the demo user.',
  'Exports include deleted records; can we exclude those?',
  'We need an audit trail of ticket status changes.',
  'Can you help configure webhook retries on failure?',
  'Search results do not include tickets created in the last hour.',
  'Question about upgrading to Enterprise and feature differences.',
  'Attachment uploads are timing out for files over 10MB.',
  'Agents cannot assign tickets to themselves.',
  'Looking for onboarding or training resources for our team.',
  'SLA timers show inconsistent remaining time for some tickets.',
  'We were charged twice for this month. Please advise on refund.',
  'Performance is slower after the last release. Any known issues?',
  'New ticket form throws a validation error on submit.',
  'Scheduled report did not arrive today.',
  'We need to update the account email address on file.',
  'Emoji characters in comments render as empty squares.',
  'Timestamps appear in the wrong time zone for some agents.',
  'We cannot add collaborators to the project.',
  'CSV import fails due to field mapping errors.',
  'Auto-responder is not firing for new tickets.',
  'Exported CSV columns are in the wrong order.',
  'API docs list parameters that no longer work.',
  'Support widget fails to load on our website.',
  'Requesting a bulk status update feature for admins.',
  'Unread badge counts are off by 1 for some users.',
  'Need help consolidating multiple mailboxes into one queue.',
];

const COMMENT_BODIES = [
  'Thanks for the heads up. Can you share a screenshot?',
  'We are looking into this now and will update shortly.',
  'Can you confirm when this started happening?',
  'We just deployed a fix and are monitoring the results.',
  'Appreciate the details. I will escalate to engineering.',
  'This should be resolved now. Please test and confirm.',
  'I can reproduce this issue. Working on a fix.',
  'Is this affecting all users or just a subset?',
  'We will follow up with a status update soon.',
  'Thanks for your patience while we investigate.',
  'Can you provide the ticket ID or reference number?',
  'We found a regression and are preparing a hotfix.',
  'Please try clearing cache and retrying the action.',
  'We can schedule a quick call to walk through it.',
  'This is now in our backlog with a high priority tag.',
  'We have reset the integration and it should work now.',
  'Could you confirm your workspace ID?',
  'We will keep you posted on progress.',
  'I have shared this with the product team.',
  'Thanks! We will close this once you confirm.',
  'We are investigating the logs for additional details.',
  'A temporary workaround is to refresh the page.',
  'We appreciate the detailed steps.',
  'We have reproduced the bug internally.',
  'Thanks for confirming. We will follow up tomorrow.',
  'We can apply a temporary fix from our side.',
  'This should be resolved by end of day.',
  'Please confirm if you still see the issue.',
  'We have reopened the ticket for deeper analysis.',
  'We will notify you when the fix is live.',
  'Thanks for the quick response!',
  'We are rolling back the change now.',
  'We have updated your account settings.',
  'We just sent a test email to verify delivery.',
  'Thanks for the report. We are on it.',
  'This looks like a permissions issue. Investigating.',
  'We will update the docs accordingly.',
  'We have applied the patch and need your confirmation.',
  'We will review this with support leadership.',
  'We have scheduled a fix for the next release.',
];

const STATUS_POOL: TicketSeed['status'][] = ['open', 'pending', 'closed', 'open', 'open', 'pending', 'closed'];
const PRIORITY_POOL: TicketSeed['priority'][] = ['low', 'normal', 'high', 'normal', 'urgent', 'normal', 'high'];
const COMMENT_COUNT_PATTERN = [0, 1, 2, 3, 4, 5, 6, 3, 2, 4, 5, 7, 1, 2, 8, 9, 10, 11, 12, 4];
const CUSTOMER_TICKET_COUNTS = [28, 26, 24, 22, 15, 14, 13, 12, 11, 6, 5, 4, 3];

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

function createPrng(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createUuid(prng: () => number) {
  const bytes = Array.from({ length: 16 }, () => Math.floor(prng() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function clampToNow(date: Date, now: Date) {
  return date.getTime() > now.getTime() ? new Date(now.getTime() - MINUTE_MS) : date;
}

export function buildSeedData({
  demoUserId,
  demoEmail,
  now = new Date(),
}: {
  demoUserId: string;
  demoEmail: string;
  now?: Date;
}): SeedData {
  const demoCreatedAt = new Date(now.getTime() - 170 * DAY_MS);
  const demoProfile: DemoProfileSeed = {
    id: demoUserId,
    user_id: demoUserId,
    full_name: 'Demo User',
    email: demoEmail,
    avatar_url: avatarUrl('demo-user'),
    created_at: demoCreatedAt.toISOString(),
    updated_at: demoCreatedAt.toISOString(),
  };

  const fakeProfiles: DemoProfileSeed[] = FAKE_PROFILES.map((profile, index) => {
    const createdAt = new Date(now.getTime() - (165 - index) * DAY_MS);
    return {
      id: profile.id,
      user_id: null,
      full_name: profile.full_name,
      email: profile.email,
      avatar_url: avatarUrl(profile.avatar_seed),
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    };
  });

  const demoActor: ActorSeed = {
    id: demoUserId,
    name: 'Demo User',
    email: demoEmail,
    avatar_url: avatarUrl('demo-user'),
    role: 'Admin',
    created_at: demoCreatedAt.toISOString(),
  };

  const fakeActors: ActorSeed[] = FAKE_PROFILES.map((profile, index) => {
    const createdAt = new Date(now.getTime() - (165 - index) * DAY_MS);
    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      avatar_url: avatarUrl(profile.avatar_seed),
      role: profile.role,
      created_at: createdAt.toISOString(),
    };
  });

  const actors = [demoActor, ...fakeActors];
  const actorById = new Map(actors.map((actor) => [actor.id, actor]));
  const customers = actors.filter((actor) => actor.role === 'Customer');
  const agents = actors.filter((actor) => actor.role === 'Support Agent' || actor.role === 'Admin');

  if (customers.length !== CUSTOMER_TICKET_COUNTS.length) {
    throw new Error('Customer count mismatch for seed generation.');
  }

  const prng = createPrng(42);
  const tickets: TicketSeed[] = [];

  customers.forEach((customer, customerIndex) => {
    const ticketCount = CUSTOMER_TICKET_COUNTS[customerIndex] ?? 4;

    for (let i = 0; i < ticketCount; i += 1) {
      const ticketIndex = tickets.length;
      const subject = SUBJECTS[(ticketIndex + customerIndex) % SUBJECTS.length];
      const body = BODIES[(ticketIndex * 2 + customerIndex) % BODIES.length];
      const status = STATUS_POOL[ticketIndex % STATUS_POOL.length];
      const priority = PRIORITY_POOL[(ticketIndex + customerIndex * 2) % PRIORITY_POOL.length];
      const shouldAssign = ticketIndex % 10 < 8;
      const assignedActor = shouldAssign ? agents[(ticketIndex + customerIndex) % agents.length] : null;

      const dayOffset = (ticketIndex * 3 + customerIndex * 5) % 120;
      const hourOffset = (ticketIndex * 7 + customerIndex * 11) % 24;
      const minuteOffset = (ticketIndex * 13 + customerIndex * 3) % 60;
      const createdAt = new Date(now.getTime() - dayOffset * DAY_MS - hourOffset * HOUR_MS - minuteOffset * MINUTE_MS);

      const updatedOffsetHours = (ticketIndex * 5 + customerIndex * 2) % 72;
      let updatedAt = new Date(createdAt.getTime() + updatedOffsetHours * HOUR_MS);
      updatedAt = clampToNow(updatedAt, now);
      if (updatedAt.getTime() < createdAt.getTime()) {
        updatedAt = createdAt;
      }

      tickets.push({
        id: createUuid(prng),
        subject,
        body,
        status,
        priority,
        from_actor_id: customer.id,
        from_name: customer.name,
        assigned_to_actor_id: assignedActor?.id ?? null,
        assigned_to_name: assignedActor?.name ?? null,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
      });
    }
  });

  const comments: CommentSeed[] = [];

  tickets.forEach((ticket, ticketIndex) => {
    const commentCount = COMMENT_COUNT_PATTERN[ticketIndex % COMMENT_COUNT_PATTERN.length];
    if (commentCount === 0) return;

    const ticketCreatedAt = new Date(ticket.created_at);
    const customer = actorById.get(ticket.from_actor_id);
    const assigned = ticket.assigned_to_actor_id ? actorById.get(ticket.assigned_to_actor_id) : null;

    if (!customer) {
      return;
    }

    for (let i = 0; i < commentCount; i += 1) {
      const author = assigned && i % 2 === 1 ? assigned : customer;
      const body = COMMENT_BODIES[(ticketIndex + i) % COMMENT_BODIES.length];
      const offsetHours = (i + 1) * ((ticketIndex % 4) + 1);
      const commentDate = clampToNow(new Date(ticketCreatedAt.getTime() + offsetHours * HOUR_MS), now);
      const createdAt = commentDate.getTime() < ticketCreatedAt.getTime() ? ticketCreatedAt : commentDate;

      comments.push({
        id: createUuid(prng),
        ticket_id: ticket.id,
        actor_id: author.id,
        actor_name: author.name,
        body,
        created_at: createdAt.toISOString(),
      });
    }
  });

  return {
    demoProfiles: [demoProfile, ...fakeProfiles],
    actors,
    tickets,
    comments,
  };
}
