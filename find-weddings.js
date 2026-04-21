const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => {
    const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : '';
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        const { data, error } = await supabase
            .from('weddings')
            .select('id, couple_email, bride_name, groom_name')
            .limit(5);
        
        if (error) {
            console.error("Supabase Error:", error);
            return;
        }
        
        console.log("Real Weddings Found:");
        console.table(data);
    } catch (e) {
        console.error("Exec Error:", e);
    }
}
run();
