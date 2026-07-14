// Seeds a ready-to-use patient and nurse account (idempotent — re-running
// deletes and recreates them). Uses the Supabase Admin API so GoTrue hashes the
// password and confirms the email; the `handle_new_user` trigger then creates
// the profile + role-specific rows from user_metadata, which we enrich below.
//
//   Run:  node --env-file=.env scripts/seed-accounts.mjs
//   (or)  npm run seed
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = 'Vitala123!';

const accounts = [
  {
    email: 'patient@vitala.app',
    password: PASSWORD,
    role: 'patient',
    full_name: 'Sara Patient',
    phone: '+15145550101',
    medical: {
      gender: 'female',
      blood_type: 'O+',
      date_of_birth: '1994-05-12',
      allergies: ['Penicillin'],
      chronic_illnesses: ['Asthma'],
    },
  },
  {
    email: 'nurse@vitala.app',
    password: PASSWORD,
    role: 'nurse',
    full_name: 'Nadia Nurse',
    phone: '+15145550102',
    nurse: {
      license_number: 'RN-1029384',
      specializations: ['general-care', 'wound-care'],
      experience_years: 6,
      verification_status: 'approved',
      rating: 4.8,
      total_reviews: 24,
    },
  },
];

async function findByEmail(email) {
  const target = email.toLowerCase();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
}

for (const acc of accounts) {
  const existing = await findByEmail(acc.email);
  if (existing) {
    // Cascade removes the profile and all dependent rows.
    await admin.auth.admin.deleteUser(existing.id);
    console.log(`· removed existing ${acc.email}`);
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: acc.email,
    password: acc.password,
    email_confirm: true,
    user_metadata: { role: acc.role, full_name: acc.full_name, phone: acc.phone },
  });
  if (error) throw error;
  const id = data.user.id;

  if (acc.role === 'patient') {
    const { error: mErr } = await admin
      .from('medical_profiles')
      .upsert({ profile_id: id, ...acc.medical }, { onConflict: 'profile_id' });
    if (mErr) throw mErr;
  } else if (acc.role === 'nurse') {
    const { error: pErr } = await admin
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', id);
    if (pErr) throw pErr;

    const { error: nErr } = await admin
      .from('nurse_profiles')
      .upsert({ profile_id: id, ...acc.nurse }, { onConflict: 'profile_id' });
    if (nErr) throw nErr;

    // A simple Mon–Fri 09:00–17:00 weekly availability so the nurse is bookable.
    const slots = [1, 2, 3, 4, 5].map((weekday) => ({
      nurse_id: id,
      weekday,
      start_time: '09:00',
      end_time: '17:00',
    }));
    const { error: aErr } = await admin.from('nurse_availability').insert(slots);
    if (aErr) throw aErr;
  }

  console.log(`✓ ${acc.role.padEnd(7)} ${acc.email}  (${id})`);
}

console.log(`\nDone. Password for both: ${PASSWORD}`);
