import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data } = await supabase.from('weddings').select('id, user_id').limit(1).single();
    if (data) {
        console.log("Wedding ID found:", data.id);
        
        const payload = {
            weddingId: data.id,
            guestName: "Direct API Tester",
            guestEmail: "test@example.com",
            attendance: "Yes",
            numGuests: 1,
            message: "Testing API direct call",
            plusOneNames: "Jane Tester",
            childrenCount: 0
        };

        const response = await fetch("http://localhost:3000/api/rsvp-notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        console.log("Status:", response.status);
        console.log("Result:", await response.text());
    } else {
        console.log("No wedding records found");
    }
}
run();
