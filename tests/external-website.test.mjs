import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
function load(file, mocks = {}) {
 const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
 const m = { exports: {} };
 vm.runInNewContext(code, { exports: m.exports, module: m, URL, Response, console, process, require: name => name in mocks ? mocks[name] : name === 'server-only' ? {} : name.startsWith('@/') ? load(`src/${name.slice(2)}.ts`, mocks) : require(name) });
 return m.exports;
}
const next = { NextResponse: { json: (data, options) => Response.json(data, options) } };
const settings = { weddingId: 'wedding1', brideName: 'Alexandra', groomName: 'Christopher', externalWebsiteUrl: 'https://ourwedding.example.test', weddingDate: '2027-12-18', weddingTime: '', rsvpDeadline: '2027-11-18', venueName: '', motifColor: '#A35165', rsvpPageEnabled: true };
function dbFor(row, error = null) {
 const queries = [];
 return { queries, from() {
  const filters = []; queries.push(filters);
  const q = { select: () => q, eq: (key, value) => { filters.push([key,value]); return q; }, is: (key,value) => { filters.push([key,value]); return q; }, maybeSingle: async () => ({ data: !error && filters.every(([key,value]) => row && (row[key] ?? null) === value) ? row : null, error }) };
  return q;
 } };
}
test('connection validation rejects unsafe links, impossible dates and missing publication prerequisites', () => {
 const { externalWebsiteConnectionSchema: schema } = load('src/lib/external-website.ts');
 assert.equal(schema.safeParse(settings).success, true);
 assert.equal(schema.safeParse({ ...settings, heroImage: 'https://cdn.example.test/couple.jpg' }).success, true);
 assert.equal(schema.safeParse({ ...settings, heroImage: '' }).success, true);
 for (const patch of [{ externalWebsiteUrl: 'javascript:alert(1)' }, { externalWebsiteUrl: 'https://user:secret@example.test' }, { externalWebsiteUrl: 'https://exam\nple.test' }, { externalWebsiteUrl: '' }, { heroImage: 'javascript:alert(1)' }, { heroImage: 'http://insecure.example.test/a.jpg' }, { weddingDate: '2027-02-30' }, { rsvpDeadline: '2028-01-01' }]) assert.equal(schema.safeParse({ ...settings, ...patch }).success, false);
 assert.equal(schema.safeParse({ ...settings, rsvpPageEnabled: false, externalWebsiteUrl: '', weddingDate: '', rsvpDeadline: '' }).success, true);
});
test('standalone RSVP requires publication, preserves ordinary websites and fails closed', async () => {
 const { resolveRsvpWeddingById } = load('src/lib/rsvp-wedding.ts');
 for (const [row, allowed] of [
  [{ id:'wedding1', planner_only:false, deleted_at:null }, true],
  [{ id:'wedding1', planner_only:true, rsvp_page_enabled:false, deleted_at:null }, false],
  [{ id:'wedding1', planner_only:true, rsvp_page_enabled:true, deleted_at:null }, true],
  [{ id:'wedding1', planner_only:true, rsvp_page_enabled:true, deleted_at:'2026-01-01' }, false],
 ]) {
  const db = dbFor(row);
  const result = await resolveRsvpWeddingById(db, 'wedding1', 'id');
  assert.equal(Boolean(result.wedding), allowed);
  if (row.planner_only) assert.ok(db.queries.some(filters => filters.some(([k,v]) => k === 'rsvp_page_enabled' && v === true)));
 }
 for (const error of [{ code:'42703', message:'column weddings.rsvp_page_enabled does not exist' },{ code:'42501', message:'permission denied' },{ code:'PGRST204', message:'schema cache error' }]) assert.equal((await resolveRsvpWeddingById(dbFor(null,error), 'wedding1')).wedding, null);
});
test('public page response strips unexpected private fields and uses no-store', async () => {
 const row = { id:'wedding1', bride_name:'Alexandra', groom_name:'Christopher', user_id:'owner', couple_email:'private@example.test', total_budget:999, planner_calendar_token:'secret' };
 const page = load('src/app/api/public/rsvp/page/route.ts', {
  'next/server':next, '@/lib/supabase-admin': { getSupabaseAdminClient: () => ({}) },
  '@/lib/rate-limit': { createRateLimitMiddleware: () => ({ check: async () => ({ limited:false }) }), getClientIP: () => 'synthetic' },
  '@/lib/rsvp-wedding': { ...load('src/lib/rsvp-wedding.ts'), getRsvpPageWedding: async () => ({ wedding:row, error:null }) },
 });
 const response = await page.GET({ nextUrl:new URL('https://example.test/api/public/rsvp/page?weddingId=wedding1') });
 assert.equal(response.status,200); assert.match(response.headers.get('cache-control'),/no-store/);
 assert.match(response.headers.get('x-robots-tag'),/noindex/);
 const result = await response.json();
 assert.equal(result.wedding.id,'wedding1');
 for (const key of ['user_id','couple_email','total_budget','planner_calendar_token']) assert.equal(key in result.wedding,false);
});
test('connection changes allow only owner/partner/admin and never convert an ordinary site', async () => {
 for (const [role, plannerOnly] of [['owner',true],['partner',true],['admin',true],['coordinator',true],[null,true],['owner',false]]) {
  let writes=0;
  const api = load('src/app/api/planner/connection/route.ts', {
   'next/server':next, '@/lib/api-rate-limit': { getAuthenticatedRequest: async () => ({ user:{id:'owner'} }) },
   '@/lib/wedding-access': { getWeddingAccess: async () => ({ wedding:{id:'wedding1',planner_only:plannerOnly}, role }) },
   '@/lib/supabase-admin': { getSupabaseAdminClient: () => ({from() { const q={update(values) { writes++; assert.equal(values.planner_only,undefined); return q; },eq:()=>q,is:()=>q,select:()=>q,single:async()=>({data:{id:'wedding1',...settings},error:null})}; return q; }}) },
  });
  const result=await api.PATCH({ json:async()=>settings });
  const allowed = ['owner','partner','admin'].includes(role);
  assert.equal(result.status,allowed ? plannerOnly ? 200 : 409 : 403);
  assert.equal(writes,allowed && plannerOnly ? 1 : 0);
 }
});
test('QR summary retains private workspace gates and guest links never target a disabled workspace', async () => {
 const {getWeddingGuestUrl}=load('src/lib/guest-links.ts');
 for (const enabled of [false,true]) {
  const row={id:'wedding1',user_id:'owner',planner_only:true,rsvp_page_enabled:enabled,external_website_url:'https://example.test'};
  const api=load('src/app/api/wedding-day/settings/route.ts', {
   'next/server':next, '@/lib/api-auth':{getRequestUser:async()=>({user:{id:'owner'}})},
   '@/lib/rate-limit':{sanitizeWeddingId:value=>value},
   '@/lib/supabase-admin':{getSupabaseAdminClient:()=>({})},
   '@/lib/wedding-access':{getWeddingAccess:async(_db,_user,_id,options)=>({canManage:true,wedding:Object.fromEntries(options.select.split(',').map(k=>k.trim()).filter(k=>k in row).map(k=>[k,row[k]]))})},
  });
  const response=await api.GET({nextUrl:new URL('https://example.test/api/wedding-day/settings?weddingId=wedding1&summaryOnly=1')});
  assert.equal(response.status,200);
  const {wedding}=await response.json();
  assert.equal(wedding.planner_only,true); assert.equal(wedding.rsvp_page_enabled,enabled);
  assert.equal(wedding.external_website_url,'https://example.test');
  assert.equal(getWeddingGuestUrl('https://quickweds.example/',wedding),enabled?'https://quickweds.example/rsvp/wedding1':null);
 }
 assert.equal(getWeddingGuestUrl('https://quickweds.example',{id:'wedding1',planner_only:false}), 'https://quickweds.example/w/wedding1');
});
for (const order of ['new-first','progress-first']) test(`private workspace migration preserves rows and publication guards (${order})`, { skip:!process.env.PGLITE_MODULE }, async () => {
 const {PGlite}=await import(process.env.PGLITE_MODULE);
 const db=new PGlite();
 try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE SCHEMA auth; CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid'; GRANT USAGE ON SCHEMA auth TO service_role,authenticated;
   CREATE TABLE weddings(id text PRIMARY KEY,user_id uuid,bride_name text,groom_name text,deleted_at timestamptz, wedding_date text,rsvp_deadline text,is_published boolean DEFAULT false);
   CREATE TABLE planner_tasks(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,title text,status text,category text);
   CREATE TABLE planner_budgets(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,estimated_cost numeric);
   CREATE TABLE planner_vendors(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,amount numeric);
   CREATE TABLE rsvps(id uuid PRIMARY KEY,wedding_id text);
   CREATE TABLE planner_events(id uuid PRIMARY KEY,wedding_id text);
   CREATE TABLE seating_assignments(id uuid PRIMARY KEY,wedding_id text);
   CREATE TABLE wedding_collaborators(id uuid PRIMARY KEY,wedding_id text);
   INSERT INTO weddings VALUES('existing','00000000-0000-0000-0000-000000000001','A','B',NULL,NULL,NULL,false);
   INSERT INTO planner_tasks(wedding_id,title,category)VALUES('existing','Keep me','General');
   GRANT USAGE ON SCHEMA public TO service_role,authenticated;
   GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
   GRANT SELECT,INSERT,UPDATE ON weddings TO authenticated;`);
  const migration=fs.readFileSync('supabase/migrations/20261126172118_external_website_rsvp.sql','utf8');
  const progress=fs.readFileSync('supabase/migrations/20261022060015_planner_progress_and_activity.sql', 'utf8');
  if(order==='progress-first') {
   // The historical progress migration follows an earlier private-schema migration.
   await db.exec('CREATE SCHEMA quickweds_private');
   await db.exec(progress);
  }
  await db.exec(migration); await db.exec(migration);
  // A future migration push can run the older pending progress version safely.
  await db.exec(progress);
  assert.equal((await db.query('SELECT title FROM planner_tasks')).rows[0].title,'Keep me');
  await db.exec('SET ROLE service_role');
  const args="'00000000-0000-0000-0000-000000000001','11111111-1111-4111-8111-111111111111','Alexandra','Christopher',3";
  await db.query(`SELECT quickweds_create_planning_workspace(${args})`);
  await db.query(`SELECT quickweds_create_planning_workspace(${args})`);
  assert.equal((await db.query("SELECT count(*) FROM weddings WHERE planner_only")).rows[0].count,1);
  const checklist=JSON.stringify([{title:'Book venue',section:'Venue',template_key:'venue',due_date:'2027-10-01'}]);
  assert.equal((await db.query('SELECT * FROM quickweds_seed_checklist($1,$2::jsonb,25)',['existing',checklist])).rows.length,1);
  assert.equal((await db.query('SELECT * FROM quickweds_seed_checklist($1,$2::jsonb,25)',['existing',checklist])).rows.length,0);
  await db.exec("UPDATE weddings SET external_website_url='https://example.test',wedding_date='2027-12-18',rsvp_deadline='2027-11-18',rsvp_page_enabled=true WHERE planner_only");
  await db.exec('RESET ROLE; SET ROLE authenticated');
  await assert.rejects(db.exec('UPDATE weddings SET rsvp_page_enabled=false WHERE planner_only'),/connection settings/);
  await assert.rejects(db.exec('UPDATE weddings SET planner_only=false WHERE planner_only'),/Complete the external/);
  await assert.rejects(db.exec("INSERT INTO weddings(id,user_id,rsvp_page_enabled)VALUES('forged','00000000-0000-0000-0000-000000000001',true)"),/connection settings/);
  await assert.rejects(db.query(`SELECT quickweds_create_planning_workspace(${args})`),/permission denied/);
  await db.exec("UPDATE weddings SET bride_name='Updated' WHERE id='existing'");
 } finally { await db.close(); }
});
