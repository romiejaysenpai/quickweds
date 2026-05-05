import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jioouyzzitvtlpzqqbkz.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.auth.getUser("undefined");
  console.log("Error:", error?.message);
}

test();
