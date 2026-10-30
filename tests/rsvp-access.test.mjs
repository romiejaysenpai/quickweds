import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const testProcess = { env: { RSVP_ACCESS_SECRET: 'synthetic-rsvp-test-secret', NEXT_PUBLIC_APP_URL: 'https://example.test' } };
function load(file, mocks = {}) {
 const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
 const loadedModule = { exports: {} };
 vm.runInNewContext(source, { module: loadedModule, exports: loadedModule.exports, Buffer, console, process: testProcess, URL, URLSearchParams, Response, require(name) { if (name in mocks) return mocks[name]; if (name === 'server-only') return {}; if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`, mocks); return require(name); } }, { filename: file });
 return loadedModule.exports;
}
const access = load('src/lib/rsvp-access.ts');
const next = { NextResponse: { json: (data, opts) => Response.json(data, opts) } };
const rate = { createRateLimitMiddleware: () => ({ check: async () => ({ limited: false, headers: {} }) }), getClientIP: () => 'synthetic-ip', sanitizeWeddingId: s => s, sanitizeInput: s => s, sanitizeEmail: s => s };
function database(wedding, guest, conflict = false) {
 const writes = [];
 return { writes, from(table) { let mode = 'read'; let payload; const filters = []; const q = { select: () => q, eq(k,v) { filters.push([k,v]); return q; }, is(k,v) { filters.push([k,v]); return q; }, ilike: () => q, or: () => q, limit: () => q,
 update(v) { mode = 'update'; payload = v; return q; }, insert(v) { mode = 'insert'; payload = v; return q; },
 maybeSingle: async () => { if(mode==='update'){ writes.push({table,mode,payload,filters});return {data:conflict && filters.some(([key,value])=>({...guest,wedding_id:wedding.id,guest_email:'owner-corrected@example.test',guest_name:'Owner corrected',invited_guest_count:1,seat_lookup_token:'rotated-private-token'})[key]!==value)?null:{id:guest?.id},error:null};}return {data:table==='weddings'?wedding:guest,error:null}; },
 single: async () => { writes.push({ table, mode, payload, filters }); return { data: { id: guest?.id || 'new-guest' }, error: null }; },
 then(resolve) { return Promise.resolve({ data: guest ? [guest] : [], error: null }).then(resolve); } }; return q; } };
}
const wedding = { id: 'wedding1', rsvp_events: [{ id: 'ceremony' }], rsvp_allow_plus_ones: true, rsvp_allow_children: true };
const guest = { id: 'guest1', guest_name: 'Synthetic Guest', guest_email: 'guest@example.test', num_guests: 3, invited_guest_count: 3, plus_one_allowed: true, attendance: 'Pending', manual_entry: true, seat_lookup_token: 'private-seat-token' };
const base = { weddingId: wedding.id, rsvpId: guest.id, guestName: guest.guest_name, guestEmail: guest.guest_email, attendance: 'Yes', numGuests: 1 };
function route(db, overrides = {}) { return load('src/app/api/public/rsvp/route.ts', { 'next/server': next, '@/lib/rate-limit': rate, '@/lib/supabase-admin': { getSupabaseAdminClient: () => db }, '@/lib/rsvp-access': access, '@/lib/dashboard-counters': { invalidateDashboardCounters: async () => {} }, '@/lib/seat-finder': { makeSeatLookupToken: () => 'synthetic-seat', makeGuestCode: () => 'SYNTHETIC' }, '@/lib/rsvp-notifications': { sendRsvpNotifications: async () => ({ success: true }) }, ...overrides }); }
const request = body => ({ json: async () => body });
const token = () => access.createRsvpAccessToken(wedding.id, guest.id, guest.guest_email);

test('A02 capability binds purpose, wedding, invitation, email and expiry; rejects tampering and bounded malformed values', () => {
 const now = 1700000000000; const t = access.createRsvpAccessToken('wedding1','guest1','Guest@example.test',now);
 assert.equal(access.verifyRsvpAccessToken(t,'wedding1','guest1','guest@example.test',now), true);
 for (const args of [['other','guest1','guest@example.test'], ['wedding1','other','guest@example.test'], ['wedding1','guest1','other@example.test']]) assert.equal(access.verifyRsvpAccessToken(t,...args,now),false);
 assert.equal(access.verifyRsvpAccessToken(t,'wedding1','guest1','guest@example.test',now+1800000),false);
 for (const invalid of [t+'x', 'x'.repeat(3000), '.', t.replace(/.$/, c=>c==='a'?'b':'a')]) assert.equal(access.verifyRsvpAccessToken(invalid,'wedding1','guest1','guest@example.test',now),false);
 const url = new URL(access.getRsvpManageUrl('wedding1','guest1',t)); assert.equal(url.search,''); assert.ok(url.hash.includes('token='));
});
test('A02 bare ID, name, pending/manual and guessed email cannot authorize writes', async () => {
 for (const patch of [{}, {rsvpId: undefined}, {guestEmail: 'attacker@example.test'}, {accessToken: 'wrong'}]) {
  const db=database(wedding,guest); const res=await route(db).POST(request({...base,...patch})); assert.equal(res.status,403); assert.equal(db.writes.length,0);
 }
});
test('A02 verified edit keeps stored identity/email and never mutates other party rows', async () => {
 const db=database(wedding,guest); let notified;
 const res=await route(db, {'@/lib/rsvp-notifications': { sendRsvpNotifications: async (_,input) => {notified=input; return {success:true};} }}).POST(request({...base,accessToken:token(),guestName:'Attacker name',guestEmail:'attacker@example.test',numGuests:2,householdMembers:['Another Invitation']}));
 assert.equal(res.status,200); assert.equal(db.writes.length,1); assert.ok(!('guest_email' in db.writes[0].payload)); assert.ok(!('guest_name' in db.writes[0].payload)); assert.ok(db.writes[0].filters.some(([k,v])=>k==='guest_email'&&v===guest.guest_email)); assert.ok(db.writes[0].filters.some(([k,v])=>k==='invited_guest_count'&&v===3)); assert.equal(notified.guestEmail,guest.guest_email); assert.ok(!('invited_guest_count' in db.writes[0].payload)); assert.ok(!('plus_one_allowed' in db.writes[0].payload));
});
test('A16 stored invitation/wedding restrictions, unknown/duplicate events and top-level Maybe reject before writing', async () => {
 for (const [w,g,patch] of [[wedding,guest,{numGuests:4}], [wedding,{...guest,plus_one_allowed:false},{numGuests:2}], [{...wedding,rsvp_allow_plus_ones:false},guest,{numGuests:2}], [{...wedding,rsvp_allow_children:false},guest,{childrenCount:1}], [wedding,guest,{attendance:'Maybe'}], [wedding,guest,{eventResponses:[{eventId:'unknown',attendance:'Yes'}]}], [wedding,guest,{eventResponses:[{eventId:'ceremony',attendance:'Yes'},{eventId:'ceremony',attendance:'No'}]}]]) {
  const db=database(w,g); const res=await route(db).POST(request({...base,accessToken:token(),...patch})); assert.equal(res.status,400); assert.equal(db.writes.length,0);
 }
});
test('A16 decline clears stale fields and forces all configured events to No, preserving cap/allowance', async () => {
 const db=database(wedding,guest); const res=await route(db).POST(request({...base,accessToken:token(),attendance:'No',numGuests:0,childrenCount:3,plusOneNames:'Stale',mealPreference:'Vegan',songRequest:'Stale',eventResponses:[{eventId:'ceremony',attendance:'Yes'}]}));
 assert.equal(res.status,200); const p=db.writes[0].payload; assert.equal(p.num_guests,0); assert.equal(p.children_count,0); assert.equal(p.plus_one_names,null); assert.equal(p.meal_preference,null); assert.equal(p.song_request,null); assert.equal(p.event_responses[0].attendance,'No'); assert.ok(!('invited_guest_count' in p)); assert.ok(!('plus_one_allowed' in p));
});
test('A02 access request always returns generic 202 and sends only to stored email; verify requires capability', async () => {
 for (const g of [guest,null,{...guest,guest_email:null}]) {
  const sent=[]; const db=database(wedding,g); const { POST }=load('src/app/api/public/rsvp/access/route.ts', {'next/server':next,'@/lib/rate-limit':rate,'@/lib/supabase-admin':{getSupabaseAdminClient:()=>db},'@/lib/rsvp-access':access,'@/lib/email':{sendEmail:async input=>{sent.push(input);return {success:true};}}});
  const res=await POST(request({...base,guestEmail:'attacker@example.test'})); assert.equal(res.status,202); assert.equal(sent.length,g?.guest_email?1:0); if(sent.length) assert.equal(sent[0].to,guest.guest_email);
  assert.equal((await POST(request({...base,action:'verify',token:'bad'}))).status,403);
  const verified=await POST(request({...base,action:'verify',token:token()})); assert.equal(verified.status,g?.guest_email?200:403); assert.equal(verified.headers.get('cache-control'),'no-store');
 }
});
test('A02 guest search serializes only discovery fields, never emails, attendance or seat capability', async () => {
 const db=database(wedding,{...guest,household_name:'Synthetic Household'}); const { GET }=load('src/app/api/public/rsvp/search/route.ts',{'next/server':next,'@/lib/rate-limit':rate,'@/lib/supabase-admin':{getSupabaseAdminClient:()=>db}});
 const res=await GET({url:'https://example.test/?weddingId=wedding1&q=Syn'}); const payload=await res.json(); assert.deepEqual(Object.keys(payload.guests[0]).sort(),['guestName','householdName','id','verificationAvailable']); assert.ok(!JSON.stringify(payload).includes('private-seat-token')); assert.ok(!JSON.stringify(payload).includes(guest.guest_email));
});
test('A16 new open registration returns a scoped edit capability; restricted single guest Yes succeeds', async () => {
 const db=database({...wedding,rsvp_allow_plus_ones:false},null); const res=await route(db).POST(request({...base,rsvpId:undefined,numGuests:1})); assert.equal(res.status,200); const data=await res.json(); assert.equal(access.verifyRsvpAccessToken(data.accessToken,wedding.id,data.rsvpId,guest.guest_email),true); assert.equal(db.writes[0].payload.num_guests,1);
});
test('A02 no-email new RSVP gets a private receipt capability; lookup cannot mint one for an existing no-email guest', async () => {
 const db=database(wedding,null); const res=await route(db).POST(request({...base,rsvpId:undefined,guestEmail:''})); assert.equal(res.status,200); const data=await res.json(); assert.equal(access.verifyRsvpAccessToken(data.accessToken,wedding.id,data.rsvpId,''),true);
 const noEmail={...guest,id:data.rsvpId,guest_email:null};
 const existing=database(wedding,noEmail); const edit=await route(existing).POST(request({...base,rsvpId:data.rsvpId,guestEmail:'attacker@example.test',accessToken:data.accessToken})); assert.equal(edit.status,200); assert.ok(!('guest_email' in existing.writes[0].payload)); assert.ok(existing.writes[0].filters.some(([key,value])=>key==='guest_email'&&value===null));
 const unverified=database(wedding,noEmail); assert.equal((await route(unverified).POST(request({...base,rsvpId:data.rsvpId}))).status,403); assert.equal(unverified.writes.length,0);
});
test('A16 invitation capacity migration backfills, preserves on decline, and initializes owner/import inserts', {skip:!process.env.PGLITE_MODULE}, async () => {
 const {PGlite}=await import(process.env.PGLITE_MODULE); const db=new PGlite();
 try {
 await db.exec('CREATE TABLE rsvps(id text PRIMARY KEY,num_guests integer,plus_one_allowed boolean); INSERT INTO rsvps VALUES(\'family\',5,true),(\'single\',0,false),(\'pair\',0,true);');
 await db.exec(fs.readFileSync('supabase/migrations/20261021163210_rsvp_invitation_capacity.sql','utf8'));
 assert.deepEqual((await db.query('SELECT invited_guest_count FROM rsvps ORDER BY id')).rows.map(r=>r.invited_guest_count),[5,2,1]);
 await db.exec("UPDATE rsvps SET num_guests=0 WHERE id='family'; INSERT INTO rsvps(id,num_guests,plus_one_allowed) VALUES('imported',4,true);");
 assert.equal((await db.query("SELECT invited_guest_count FROM rsvps WHERE id='family'")).rows[0].invited_guest_count,5);
 assert.equal((await db.query("SELECT invited_guest_count FROM rsvps WHERE id='imported'")).rows[0].invited_guest_count,4);
 await assert.rejects(db.exec("UPDATE rsvps SET invited_guest_count=51 WHERE id='family'"));
 } finally {await db.close();}
});


test('stale verified invitation update rejects concurrent organizer changes without sending private links',async()=>{
 const db=database(wedding,guest,true);let sent=0;
 const res=await route(db,{'@/lib/rsvp-notifications':{sendRsvpNotifications:async()=>{sent++;}}}).POST(request({...base,accessToken:token()}));
 assert.equal(res.status,409);assert.equal(sent,0);assert.equal((await res.json()).code,'invitation_changed');
 assert.ok(db.writes[0].filters.some(([key,value])=>key==='guest_email'&&value===guest.guest_email));
 assert.ok(db.writes[0].filters.some(([key,value])=>key==='plus_one_allowed'&&value===true));
 assert.ok(!('guest_email' in db.writes[0].payload));
});
test('attending children cannot exceed party size',async()=>{const db=database(wedding,guest);const res=await route(db).POST(request({...base,accessToken:token(),numGuests:1,childrenCount:2}));assert.equal(res.status,400);assert.equal(db.writes.length,0);});
test('RSVP submission and search succeed on legacy schema missing planner_only column', async () => {
 const legacyWedding = { id: 'legacy-wedding', bride_name: 'Jane', groom_name: 'John', rsvp_events: [], rsvp_allow_plus_ones: true };
 const writes = [];
 const db = {
  writes,
  from(table) {
   let mode = 'read';
   let payload;
   const filters = [];
   const q = {
    select: () => q, eq(k, v) { filters.push([k, v]); return q; }, is(k, v) { filters.push([k, v]); return q; },
    ilike: () => q, or(v) { filters.push(['or', v]); return q; }, limit: () => q,
    update(v) { mode = 'update'; payload = v; return q; },
    insert(v) { mode = 'insert'; payload = v; return q; },
    maybeSingle: async () => {
     if (table === 'weddings') {
      if (filters.some(([k]) => k === 'planner_only')) {
       return { data: null, error: { code: '42703', message: 'column weddings.planner_only does not exist' } };
      }
      return { data: legacyWedding, error: null };
     }
     return { data: null, error: null };
    },
    single: async () => {
     writes.push({ table, mode, payload, filters });
     return { data: { id: 'registered-guest' }, error: null };
    },
    then(resolve) {
     const isSearch = filters.length > 0 && filters.some(([k]) => k === 'or');
     return Promise.resolve({ data: isSearch ? [{ id: 'guest-1', guest_name: 'Carlo Cervantes', guest_email: 'carlo@example.test' }] : [], error: null }).then(resolve);
    },
   };
   return q;
  },
 };
 const rsvpRes = await route(db).POST(request({ weddingId: 'legacy-wedding', guestName: 'Carlo Cervantes', attendance: 'Yes', numGuests: 1 }));
 assert.equal(rsvpRes.status, 200);
 assert.equal(writes.length, 1);
 assert.equal(writes[0].payload.guest_name, 'Carlo Cervantes');
 assert.equal(writes[0].payload.invited_guest_count, 1);

 const { GET } = load('src/app/api/public/rsvp/search/route.ts', {
  'next/server': next, '@/lib/rate-limit': rate,
  '@/lib/supabase-admin': { getSupabaseAdminClient: () => db },
  '@/lib/public-wedding-lookup': load('src/lib/public-wedding-lookup.ts'),
 });
 const searchRes = await GET({ url: 'https://example.test/?weddingId=legacy-wedding&q=Carlo%20Cervantes' });
 assert.equal(searchRes.status, 200);
 const searchData = await searchRes.json();
 assert.equal(searchData.guests.length, 1);
 assert.equal(searchData.guests[0].guestName, 'Carlo Cervantes');
});
test('RSVP submission strips absent optional columns on older rsvps table schema and completes insert', async () => {
 const writes = [];
 let attempt = 0;
 const db = {
  writes,
  from(table) {
   let mode = 'read';
   let payload;
   const filters = [];
   const q = {
    select: () => q, eq(k, v) { filters.push([k, v]); return q; }, is(k, v) { filters.push([k, v]); return q; },
    ilike: () => q, or: () => q, limit: () => q,
    insert(v) { mode = 'insert'; payload = v; return q; },
    maybeSingle: async () => ({ data: table === 'weddings' ? wedding : null, error: null }),
    single: async () => {
     attempt++;
     if (attempt === 1 && payload.invited_guest_count !== undefined) {
      return { data: null, error: { message: 'column "invited_guest_count" of relation "rsvps" does not exist' } };
     }
     if (attempt === 2 && payload.seat_lookup_token !== undefined) {
      return { data: null, error: { message: 'column "seat_lookup_token" of relation "rsvps" does not exist' } };
     }
     writes.push({ table, mode, payload, filters });
     return { data: { id: 'recovered-guest' }, error: null };
    },
    then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
   };
   return q;
  },
 };
 const res = await route(db).POST(request({ weddingId: wedding.id, guestName: 'Resilient Guest', attendance: 'Yes', numGuests: 1 }));
 assert.equal(res.status, 200);
 assert.equal(writes.length, 1);
 assert.ok(!('invited_guest_count' in writes[0].payload));
 assert.ok(!('seat_lookup_token' in writes[0].payload));
 assert.equal(writes[0].payload.guest_name, 'Resilient Guest');
});
