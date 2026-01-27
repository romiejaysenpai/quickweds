const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Check if already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'call2proposal-generator' // Based on lib/firebase-admin.ts
    });
}

const db = admin.firestore();
const APP_COLLECTIONS = {
    WEDDINGS: 'weddings',
    RSVPS: 'rsvps',
    USERS: 'users'
};

const SEED_TEMPLATES = [
    {
        id: 'tmpl-classic',
        is_template: true,
        bride_name: 'Sarah',
        groom_name: 'John',
        wedding_date: '2025-12-14',
        wedding_time: '14:00',
        venue_name: 'The Grand Ballroom',
        venue_address: '123 Elegance Ave, Paris',
        motif_color: '#D16C78',
        font_style: 'Elegant',
        template: 'classic',
        hero_image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        user_id: 'system'
    },
    {
        id: 'tmpl-minimal',
        is_template: true,
        bride_name: 'Emma',
        groom_name: 'Liam',
        wedding_date: '2025-11-20',
        wedding_time: '16:00',
        venue_name: 'Modern Art Gallery',
        venue_address: '456 Minimalist Rd, New York',
        motif_color: '#3A2A2D',
        font_style: 'Modern',
        template: 'minimal',
        hero_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        user_id: 'system'
    },
    {
        id: 'tmpl-boho',
        is_template: true,
        bride_name: 'Mia',
        groom_name: 'Noah',
        wedding_date: '2026-05-15',
        wedding_time: '15:30',
        venue_name: 'Whispering Woods',
        venue_address: '789 Nature Ln, Oregon',
        motif_color: '#7A5A61',
        font_style: 'Romantic',
        template: 'boho',
        hero_image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80',
        created_at: new Date().toISOString(),
        user_id: 'system'
    }
];

async function seed() {
    console.log('Starting seed...');
    const batch = db.batch();
    SEED_TEMPLATES.forEach(tmpl => {
        const ref = db.collection(APP_COLLECTIONS.WEDDINGS).doc(tmpl.id);
        batch.set(ref, tmpl);
    });
    await batch.commit();
    console.log('Seed complete!');
}

seed().catch(console.error);
