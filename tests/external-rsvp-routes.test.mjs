import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
// Never inherit production email credentials or load a live Supabase client.
const testProcess = { env: { RSVP_ACCESS_SECRET: 'external-rsvp-synthetic-secret', NEXT_PUBLIC_APP_URL: 'https://example.test' } };
function load(file, mocks) {
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const loadedModule = { exports: {} };
    vm.runInNewContext(source, {
        module: loadedModule, exports: loadedModule.exports, Buffer, console, process: testProcess, URL, URLSearchParams, Response,
        require(name) {
            if (name in mocks) return mocks[name];
            if (name === 'server-only') return {};
            if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`, mocks);
            return require(name);
        },
    }, { filename: file });
    return loadedModule.exports;
}

const privateWedding = {
    id: 'external-wedding', user_id: 'synthetic-owner', bride_name: 'Alexandra', groom_name: 'Christopher',
    planner_only: true, rsvp_page_enabled: true, deleted_at: null,
    external_website_url: 'https://couple.example.test/', wedding_date: '2099-12-18', rsvp_deadline: '2099-11-18',
    rsvp_events: [], rsvp_allow_plus_ones: false, rsvp_allow_children: false, rsvp_search_guest_list: true,
};
const submission = { weddingId: privateWedding.id, guestName: 'Synthetic Guest', guestEmail: 'guest@example.test', attendance: 'Yes', numGuests: 1 };
const request = body => ({ json: async () => body });

// This stub applies the resolver's actual publication/deletion filters and SELECT
// projection. RSVP writes persist between requests and enforce update predicates.
function database(overrides = {}, guests = []) {
    const state = { wedding: { ...privateWedding, ...overrides }, guests: guests.map(row => ({ ...row })), writes: [], reads: [] };
    const project = (row, columns) => !row ? null : columns === '*' ? { ...row } : Object.fromEntries(columns.split(',').map(key => key.trim()).filter(key => key in row).map(key => [key, row[key]]));
    return {
        state,
        from(table) {
            let columns = '*', mode = 'read', payload, cap = Infinity, start = 0;
            const predicates = [];
            function execute() {
                const source = table === 'weddings' ? [state.wedding] : table === 'rsvps' ? state.guests : table === 'user_app_profiles' ? [{ user_id: 'synthetic-owner', is_pro: true }] : [];
                const rows = source.filter(row => predicates.every(predicate => predicate(row))).slice(start, cap);
                if (mode === 'insert') {
                    const row = { id: `synthetic-rsvp-${state.guests.length + 1}`, ...payload };
                    if (table === 'rsvps') state.guests.push(row);
                    state.writes.push({ table, mode, payload: { ...payload } });
                    return [project(row, columns)];
                }
                if (mode === 'update') {
                    for (const row of rows) Object.assign(row, payload);
                    if (rows.length) state.writes.push({ table, mode, payload: { ...payload } });
                    return rows.map(row => project(row, columns));
                }
                state.reads.push(table);
                return rows.map(row => project(row, columns));
            }
            const q = {
                select(value = '*') { columns = value; return q; },
                eq(key, value) { predicates.push(row => row[key] === value); return q; },
                is(key, value) { predicates.push(row => (row[key] ?? null) === value); return q; },
                ilike(key, value) { predicates.push(row => String(row[key] || '').toLowerCase() === value.toLowerCase()); return q; },
                or() { predicates.push(row => String(row.guest_name || '').includes('Synthetic')); return q; },
                order() { return q; },
                range(first, last) { start = first; cap = last + 1; return q; },
                limit(value) { cap = value; return q; },
                insert(value) { mode = 'insert'; payload = value; return q; },
                update(value) { mode = 'update'; payload = value; return q; },
                maybeSingle: async () => ({ data: execute()[0] || null, error: null }),
                single: async () => ({ data: execute()[0] || null, error: null }),
                then(resolve, reject) { return Promise.resolve({ data: execute(), error: null }).then(resolve, reject); },
            };
            return q;
        },
    };
}

function routes(db) {
    const effects = { notifications: [], accessEmails: [], queuedEmails: [], deliveredEmails: [], counters: [] };
    const rate = { createRateLimitMiddleware: () => ({ check: async () => ({ limited: false, headers: {} }) }), getClientIP: () => 'synthetic-ip', sanitizeWeddingId: value => value, sanitizeInput: value => String(value || ''), sanitizeEmail: value => String(value || '').trim().toLowerCase() };
    const mocks = {
        'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
        '@/lib/supabase-admin': { getSupabaseAdminClient: () => db },
        '@/lib/rate-limit': rate,
        '@/lib/api-auth': { getRequestUser: async () => ({ user: { id: 'synthetic-owner', email: 'owner@example.test' } }) },
        '@/lib/admin': { isKnownAdminEmail: () => false },
        '@/lib/site-url': { getPublicAppUrl: () => 'https://example.test' },
        '@/lib/planner-limits': { FREE_PLAN_LIMITS: { userTriggeredEmails: 10 }, hasPlannerProAccess: () => true, logPlannerEmailEvent: async () => {} },
        '@/lib/dashboard-counters': { invalidateDashboardCounters: async id => effects.counters.push(id) },
        '@/lib/seat-finder': { makeSeatLookupToken: () => 'synthetic-seat-capability', makeGuestCode: () => 'SYNTHETIC' },
        '@/lib/rsvp-notifications': { sendRsvpNotifications: async (_, input) => { effects.notifications.push(input); return { success: true }; } },
        '@/lib/email': {
            sendEmail: async input => { effects.accessEmails.push(input); return { success: true }; },
            queueEmailBatch: async jobs => { effects.queuedEmails.push(...jobs); return jobs.map((job, index) => ({ ...job, id: `synthetic-email-${index}`, state: 'queued' })); },
            retryStoredEmail: async job => { effects.deliveredEmails.push(job); return { success: true }; },
        },
    };
    return {
        effects,
        submit: load('src/app/api/public/rsvp/route.ts', mocks).POST,
        search: load('src/app/api/public/rsvp/search/route.ts', mocks).GET,
        access: load('src/app/api/public/rsvp/access/route.ts', mocks).POST,
        page: load('src/app/api/public/rsvp/page/route.ts', mocks).GET,
        reminders: load('src/app/api/weddings/reminders/route.ts', mocks).POST,
    };
}

test('external RSVP creates a guest, verifies its receipt, and persists a scoped update through actual routes', async () => {
    const db = database();
    const api = routes(db);
    const created = await api.submit(request(submission));
    assert.equal(created.status, 200);
    const receipt = await created.json();
    assert.match(created.headers.get('cache-control'), /no-store/);
    assert.equal(db.state.guests.length, 1);
    assert.equal(db.state.guests[0].wedding_id, privateWedding.id);
    assert.equal(db.state.guests[0].guest_email, submission.guestEmail);
    const verify = await api.access(request({ action: 'verify', weddingId: privateWedding.id, rsvpId: receipt.rsvpId, token: receipt.accessToken }));
    assert.equal(verify.status, 200);
    assert.equal((await verify.json()).guest.guestName, submission.guestName);
    const edited = await api.submit(request({ ...submission, rsvpId: receipt.rsvpId, accessToken: receipt.accessToken, guestName: 'Replacement identity', guestEmail: 'different@example.test', attendance: 'No', message: 'Our plans changed' }));
    assert.equal(edited.status, 200);
    assert.equal(db.state.guests.length, 1);
    assert.equal(db.state.guests[0].attendance, 'No');
    assert.equal(db.state.guests[0].num_guests, 0);
    assert.equal(db.state.guests[0].guest_name, submission.guestName);
    assert.equal(db.state.guests[0].guest_email, submission.guestEmail);
    assert.deepEqual(db.state.writes.map(write => write.mode), ['insert', 'update']);
    assert.equal(api.effects.notifications.length, 2);
    assert.equal(api.effects.notifications[1].guestEmail, submission.guestEmail);
    assert.equal(api.effects.accessEmails.length, 0);
});

test('unpublishing an external workspace revokes page, search, submission and an already issued receipt', async () => {
    const db = database();
    const api = routes(db);
    const receipt = await (await api.submit(request(submission))).json();
    const pageRequest = { nextUrl: new URL(`https://example.test/api/public/rsvp/page?weddingId=${privateWedding.id}`) };
    const searchRequest = { url: `https://example.test/api/public/rsvp/search?weddingId=${privateWedding.id}&q=Synthetic` };
    const enabledPage = await api.page(pageRequest);
    assert.equal(enabledPage.status, 200);
    assert.equal(enabledPage.headers.get('x-robots-tag'), 'noindex, nofollow');
    const discovery = await (await api.search(searchRequest)).json();
    assert.equal(discovery.guests.length, 1);
    assert.deepEqual(Object.keys(discovery.guests[0]).sort(), ['guestName', 'householdName', 'id', 'verificationAvailable']);
    const recovery = { weddingId: privateWedding.id, rsvpId: receipt.rsvpId };
    assert.equal((await api.access(request(recovery))).status, 202);
    assert.equal(api.effects.accessEmails.length, 1);
    assert.equal(api.effects.accessEmails[0].to, submission.guestEmail);

    db.state.wedding.rsvp_page_enabled = false;
    const before = { writes: db.state.writes.length, notifications: api.effects.notifications.length, emails: api.effects.accessEmails.length };
    assert.equal((await api.page(pageRequest)).status, 404);
    assert.equal((await api.search(searchRequest)).status, 404);
    assert.equal((await api.submit(request({ ...submission, guestName: 'Another Synthetic Guest' }))).status, 404);
    assert.equal((await api.submit(request({ ...submission, rsvpId: receipt.rsvpId, accessToken: receipt.accessToken, attendance: 'No' }))).status, 404);
    assert.equal((await api.access(request({ ...recovery, action: 'verify', token: receipt.accessToken }))).status, 403);
    assert.equal((await api.access(request(recovery))).status, 202);
    assert.equal(db.state.writes.length, before.writes);
    assert.equal(api.effects.notifications.length, before.notifications);
    assert.equal(api.effects.accessEmails.length, before.emails);
    assert.equal(db.state.guests[0].attendance, 'Yes');
});

test('expired external RSVP rejects new and verified submissions without persistence or notifications', async () => {
    const db = database();
    const api = routes(db);
    const receipt = await (await api.submit(request(submission))).json();
    db.state.wedding.rsvp_deadline = '2000-01-01';
    for (const body of [{ ...submission, guestName: 'Another Synthetic Guest' }, { ...submission, rsvpId: receipt.rsvpId, accessToken: receipt.accessToken, attendance: 'No' }]) {
        const response = await api.submit(request(body));
        assert.equal(response.status, 403);
        assert.equal((await response.json()).code, 'rsvp_closed');
    }
    assert.equal(db.state.writes.length, 1);
    assert.equal(api.effects.notifications.length, 1);
    assert.equal(db.state.guests[0].attendance, 'Yes');
});

test('deleted external workspace rejects a valid guest capability and never exposes discovery', async () => {
    const db = database();
    const api = routes(db);
    const receipt = await (await api.submit(request(submission))).json();
    db.state.wedding.deleted_at = '2026-01-01';
    assert.equal((await api.access(request({ action: 'verify', weddingId: privateWedding.id, rsvpId: receipt.rsvpId, token: receipt.accessToken }))).status, 403);
    assert.equal((await api.search({ url: `https://example.test/?weddingId=${privateWedding.id}&q=Synthetic` })).status, 404);
    assert.equal((await api.submit(request(submission))).status, 404);
    assert.equal(db.state.writes.length, 1);
});

test('disabled external RSVP queues and sends no reminder; enabled reminder targets the standalone RSVP', async () => {
    const pending = { id: 'pending-invitation', wedding_id: privateWedding.id, guest_name: 'Synthetic Pending Guest', guest_email: 'pending@example.test', attendance: 'Pending', rsvp_status: 'pending' };
    const db = database({ rsvp_page_enabled: false }, [pending]);
    const api = routes(db);
    const body = { weddingId: privateWedding.id, targetStatus: 'pending', requestId: '11111111-1111-4111-8111-111111111111' };
    assert.equal((await api.reminders(request({ ...body }))).status, 409);
    assert.equal(api.effects.queuedEmails.length, 0);
    assert.equal(api.effects.deliveredEmails.length, 0);
    assert.equal(db.state.writes.length, 0);

    db.state.wedding.rsvp_page_enabled = true;
    const response = await api.reminders(request({ ...body }));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).successCount, 1);
    assert.equal(api.effects.queuedEmails.length, 1);
    assert.equal(api.effects.deliveredEmails.length, 1);
    assert.equal(api.effects.queuedEmails[0].to, pending.guest_email);
    assert.match(api.effects.queuedEmails[0].html, /href="https:\/\/example\.test\/rsvp\/external-wedding"/);
    assert.doesNotMatch(api.effects.queuedEmails[0].html, /\/wedding\//);
});

test('sendRsvpNotifications delivers couple alert, guest confirmation with external URL & manage link, and in-app alert', async () => {
    const sentEmails = [];
    const inAppInserts = [];
    const coupleProps = [];
    const guestProps = [];
    const db = {
        auth: { admin: { getUserById: async () => ({ data: { user: { email: 'couple-owner@example.test' } }, error: null }) } },
        from(table) {
            return {
                insert: async (row) => {
                    if (table === 'user_notifications') inAppInserts.push(row);
                    return { error: null };
                },
            };
        },
    };
    const { sendRsvpNotifications } = load('src/lib/rsvp-notifications.ts', {
        '@/lib/email': { sendEmail: async (payload) => { sentEmails.push(payload); return { success: true, id: `email-${sentEmails.length}` }; } },
        '@/emails/quickweds-transactional': {
            getCoupleNotificationReact: (props) => { coupleProps.push(props); return { type: 'couple', props }; },
            getGuestConfirmationReact: (props) => { guestProps.push(props); return { type: 'guest', props }; },
        },
        '@/lib/rate-limiter': { sanitizeEmail: (v) => String(v || '').trim().toLowerCase() },
    });

    const result = await sendRsvpNotifications(db, {
        weddingId: privateWedding.id,
        wedding: { ...privateWedding, couple_email: null, contact_person: null, hero_image: 'https://cdn.example.test/couple-hero.jpg' },
        guestName: 'Synthetic Guest',
        guestEmail: 'guest@example.test',
        attendance: 'Yes',
        numGuests: 2,
        guestCode: 'ABC123',
        seatLookupToken: 'seat-token-1',
        manageRsvpUrl: 'https://example.test/rsvp/manage#weddingId=external-wedding&rsvpId=r1&token=t1',
    });

    assert.equal(result.success, true);
    assert.equal(inAppInserts.length, 1);
    assert.equal(inAppInserts[0].link, `/dashboard/${privateWedding.id}?tab=guests`);
    assert.equal(sentEmails.length, 2);
    assert.equal(sentEmails[0].to, 'couple-owner@example.test');
    assert.match(coupleProps[0].dashboardUrl, /\/dashboard\/external-wedding$/);
    assert.equal(sentEmails[1].to, 'guest@example.test');
    assert.equal(guestProps[0].weddingUrl, 'https://couple.example.test/');
    assert.equal(guestProps[0].confirmationImageUrl, 'https://cdn.example.test/couple-hero.jpg');
    assert.equal(guestProps[0].manageRsvpUrl, 'https://example.test/rsvp/manage#weddingId=external-wedding&rsvpId=r1&token=t1');
    assert.match(guestProps[0].checkInUrl, /\/seat\/seat-token-1$/);
});

test('transactional RSVP emails fall back with deterministic idempotency when durable RPC is not installed; quota sends still fail closed', async () => {
    const resendCalls = [];
    class FakeResend {
        emails = {
            send: async (payload, options) => {
                resendCalls.push({ payload, options });
                return { data: { id: 'resend-ok' }, error: null };
            },
        };
    }
    const prevKey = testProcess.env.RESEND_API_KEY;
    testProcess.env.RESEND_API_KEY = 're_synthetic_test_key';
    try {
        const missingRpcDb = {
            rpc: async () => ({ data: null, error: { code: 'PGRST202', message: 'Could not find the function public.quickweds_claim_email in the schema cache' } }),
        };
        const emailModule = load('src/lib/email.ts', {
            resend: { Resend: FakeResend },
            '@react-email/render': { render: async () => '<p>Rendered</p>' },
            '@/lib/supabase-admin': { getSupabaseAdminClient: () => missingRpcDb },
            '@/lib/planner-limits': { getUserTriggeredEmailUsage: async () => 0 },
            './email-templates': {},
        });

        const txRes = await emailModule.sendEmail({
            to: 'guest@example.test',
            subject: 'RSVP Confirmation',
            html: '<p>Confirmed</p>',
            tracking: { key: 'rsvp-guest:external-wedding:abc:1' },
        });
        assert.equal(txRes.success, true);
        assert.equal(resendCalls.length, 1);
        assert.match(resendCalls[0].options.idempotencyKey, /^quickweds\/fallback\/[0-9a-f]{64}$/);

        const quotaRes = await emailModule.sendEmail({
            to: 'guest@example.test',
            subject: 'Bulk Thank You',
            html: '<p>Thanks</p>',
            tracking: { key: 'thank-you:external-wedding:guest@example.test', weddingId: 'external-wedding', quotaLimit: 10, recoverable: true },
        });
        assert.equal(quotaRes.success, false);
        assert.equal(resendCalls.length, 1);
    } finally {
        if (prevKey === undefined) delete testProcess.env.RESEND_API_KEY;
        else testProcess.env.RESEND_API_KEY = prevKey;
    }
});

test('photo upload reminder rejects planner_only external-website weddings instead of sending dead photo portal links', async () => {
    const db = database({ planner_only: true, rsvp_page_enabled: true });
    let emailCalls = 0;
    const photoReminder = load('src/app/api/wedding-day/send-photo-reminder/route.ts', {
        'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
        '@/lib/api-auth': { getRequestUser: async () => ({ user: { id: 'synthetic-owner', email: 'owner@example.test' } }) },
        '@/lib/email': { sendEmail: async () => { emailCalls++; return { success: true }; } },
        '@/lib/photo-reminder-email': { getPhotoReminderEmailHtml: () => '<p>Photo</p>' },
        '@/lib/supabase-admin': { getSupabaseAdminClient: () => db },
        '@/lib/site-url': { getPublicAppUrl: () => 'https://example.test' },
        '@/lib/rate-limit': { createRateLimitMiddleware: () => ({ check: async () => ({ limited: false, headers: {} }) }), sanitizeWeddingId: (v) => v },
        '@/lib/admin': { isKnownAdminEmail: () => false },
        '@/lib/planner-limits': { hasPlannerProAccess: () => true, FREE_PLAN_LIMITS: { userTriggeredEmails: 10 } },
    });
    const res = await photoReminder.POST(request({ weddingId: privateWedding.id }));
    assert.equal(res.status, 409);
    assert.equal(emailCalls, 0);
});
