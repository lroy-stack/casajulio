import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nsngdkzfhmaqiwxutlzw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está definida');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email: 'demo@casajulio.es',
  password: 'CasaJulio2026!',
  email_confirm: true,
});

if (error) {
  console.error('❌ Error:', error.message);
} else {
  console.log(`✅ Usuario demo creado: ${data.user.email}`);
  console.log(`   ID: ${data.user.id}`);
  console.log(`\n   Email:    demo@casajulio.es`);
  console.log(`   Password: CasaJulio2026!`);
}
