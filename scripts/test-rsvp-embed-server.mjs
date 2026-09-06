// Exercise the real route handlers with isolated database and email adapters.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(path, mocks = {}) {
    const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const loaded = { exports: {} };
    new Function('require', 'module', 'exports', code)(name => {
        if (name in mocks) return mocks[name];
        if (name.startsWith('@/')) throw new Error(`Unmocked application dependency: ${name}`);
        return require(name);
    }, loaded, loaded.exports);
    return loaded.exports;
}

const time = load('src/lib/event-time.ts');
const { rsvpSubmissionSchema } = load('src/lib/validations.ts');
let wedding;
let inserts;
let duplicate;
let notifications;
let updated;
const db = {
    from(table) {
        let record;
        const chain = {
            select() { return chain; }, eq() { return chain; }, is() { return chain; },
            insert(value) { record = value; inserts.push({ table, value }); return chain; },
            update(value) { updated = value; return chain; },
            maybeSingle: async () => ({ data: wedding, error: null }),
            single: async () => ({ data: table === 'rsvps' ? { ...record, id: 'response-1' } : { ...wedding, ...updated }, error: null }),
            then(resolve, reject) { return Promise.resolve({ error: duplicate && table === 'public_rsvp_submission_keys' && record ? { code: '23505' } : null }).then(resolve, reject); },
        };
        return chain;
    },
};
const { POST } = load('src/app/api/public/rsvp/route.ts', {
    '@/lib/supabase-admin': { getSupabaseAdminClient: () => db },
    '@/lib/validations': { rsvpSubmissionSchema },
    '@/lib/rate-limit': { createRateLimitMiddleware: () => ({ check: async () => ({ limited: false, headers: {} }) }), getClientIP: () => 'test', sanitizeInput: value => value.trim() },
    '@/lib/rsvp-notifications': { sendRsvpNotifications: async () => { notifications++; return { success: true }; } },
    '@/lib/dashboard-counters': { invalidateDashboardCounters: async () => {} },
    '@/lib/seat-finder': { makeGuestCode: () => 'TEST', makeSeatLookupToken: () => 'private-test-token' },
    '@/lib/event-time': time,
});
const { PATCH } = load('src/app/api/weddings/[id]/rsvp-embed/route.ts', {
    '@/lib/api-auth': { getRequestUser: async () => ({ user: { id: 'owner' } }) },
    '@/lib/supabase-admin': { getSupabaseAdminClient: () => db },
    '@/lib/wedding-access': { getWeddingAccess: async () => ({ wedding, canManage: true, role: 'owner' }) },
    '@/lib/public-wedding': { invalidateWeddingPublicCache: async () => {} },
    '@/lib/rsvp-embed': load('src/lib/rsvp-embed.ts'),
});
const request = body => new Request('https://quickweds.example/api/public/rsvp', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const payload = { weddingId: 'test-wedding', guestName: 'Test Guest', guestEmail: '', attendance: 'Yes', submissionSource: 'embed' };
function reset(overrides = {}) {
    wedding = { id: 'test-wedding', is_published: true, rsvp_embed_enabled: true, event_timezone: 'Asia/Tokyo', ...overrides };
    inserts = []; notifications = 0; duplicate = false; updated = undefined;
}
for (const [overrides, status] of [[{ is_published: false }, 404], [{ rsvp_embed_enabled: false }, 403], [{ rsvp_deadline: '2000-01-01' }, 409]]) {
    reset(overrides);
    assert.equal((await POST(request(payload))).status, status);
    assert.equal(inserts.length, 0);
    assert.equal(notifications, 0);
}
reset();
const response = await POST(request(payload));
assert.equal(response.status, 200);
assert.equal((await response.json()).guestPass, '/guest/private-test-token');
assert.equal(inserts.find(item => item.table === 'rsvps').value.wedding_id, wedding.id);
assert.equal(notifications, 1);
reset(); duplicate = true;
const conflict = await POST(request(payload));
assert.equal(conflict.status, 409);
assert.equal((await conflict.json()).code, 'duplicate_rsvp');
assert.equal(inserts.some(item => item.table === 'rsvps'), false);
assert.equal(notifications, 0);
reset({ is_published: false });
assert.equal((await PATCH(request({ external_platform: 'gohighlevel', rsvp_embed_enabled: true }), { params: Promise.resolve({ id: wedding.id }) })).status, 409);
assert.equal(updated, undefined);
reset();
assert.equal((await PATCH(request({ external_platform: 'systeme', rsvp_embed_enabled: true }), { params: Promise.resolve({ id: wedding.id }) })).status, 200);
assert.equal(updated.rsvp_embed_enabled, true);
assert.equal(time.isRsvpClosed('2026-09-07', 'Asia/Tokyo', new Date('2026-09-07T12:00:00Z')), false);
assert.equal(time.isRsvpClosed('2026-09-07', 'Asia/Tokyo', new Date('2026-09-07T15:00:00Z')), true);
console.log('PASS: embed submission, publication and pause guards, deadline timezone, duplicate protection, guest-pass response, activation prerequisite. Database and email adapters are isolated.');
