import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
function load(file,mocks={}) {
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const loadedModule={exports:{}};vm.runInNewContext(code,{module:loadedModule,exports:loadedModule.exports,console,process,URL,Buffer,fetch:mocks.fetch,require:name=>name in mocks?mocks[name]:require(name)});return loadedModule.exports;
}
test('A08 unpaid commitments reduce remaining budget and paying does not increase cost',()=>{
 const {calculatePlannerBudget}=load('src/lib/planner-budget.ts');
 const pending=calculatePlannerBudget([], [{amount:50000,payment_status:'not paid'}],[]);
 assert.equal(pending.committed,50000);assert.equal(pending.paid,0);assert.equal(pending.outstanding,50000);
 const paid=calculatePlannerBudget([], [{amount:50000,payment_status:'paid'}],[]);
 assert.equal(paid.committed,50000);assert.equal(paid.paid,50000);assert.equal(paid.outstanding,0);
 assert.equal(calculatePlannerBudget([], [{amount:100,payment_status:'paid'}],[{estimated_cost:100,planner_vendor_id:'linked'},{estimated_cost:25}]).committed,125);
});
test('A12 declined named companion consumes no extra seat and nonattendees consume zero',()=>{
 const {guestPartySize,isGuestAttending}=load('src/lib/guest-counts.ts');
 assert.equal(guestPartySize({num_guests:1,plus_one_allowed:true,plus_one_name:'Companion',plus_one_rsvp_status:'declined'}),1);
 assert.equal(guestPartySize({num_guests:1,plus_one_allowed:true,plus_one_name:'Companion',plus_one_rsvp_status:'confirmed'}),2);
 assert.equal(guestPartySize({attendance:'No',num_guests:3}),0);assert.equal(guestPartySize(null),0);
 assert.equal(isGuestAttending({attendance:'No',rsvp_status:'confirmed'}),false);
});
test('A13/A14 calendar event uses stable remote identity after successful insert but failed local persistence',async()=>{
 const requests=[]; const {upsertGoogleCalendarEvent}=load('src/lib/google-calendar.ts',{'@/lib/site-url':{},fetch:async(url,opts)=>{requests.push({url,...opts});return requests.length===1?Response.json({},{status:409}):Response.json({id:'stable'});}});
 await upsertGoogleCalendarEvent('synthetic-token','primary',{id:'synthetic-event',title:'Ceremony',starts_at:'2027-01-01T12:00:00Z'});
 const first=JSON.parse(requests[0].body);assert.match(first.id,/^[0-9a-f]{64}$/);assert.equal(requests[1].method,'PUT');assert.ok(requests[1].url.endsWith('/'+first.id));
});
test('A18/A21 database enforces all-or-nothing idempotent checklist and atomic seating mirror', {skip:!process.env.PGLITE_MODULE},async()=>{
 const {PGlite}=await import(process.env.PGLITE_MODULE);const db=new PGlite();
 try {
 await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
 CREATE TABLE weddings(id text PRIMARY KEY,user_id uuid,bride_name text,groom_name text,deleted_at timestamptz,is_published boolean DEFAULT false);
 CREATE TABLE planner_tasks(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text REFERENCES weddings(id),title text,status text,category text,due_date timestamptz);
 CREATE TABLE rsvps(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,guest_name text,table_assignment text,attendance text,rsvp_status text,num_guests integer,plus_one_allowed boolean,plus_one_name text,plus_one_rsvp_status text);
 CREATE TABLE seating_tables(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,table_name text,capacity integer);
 CREATE TABLE seating_assignments(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,table_id uuid REFERENCES seating_tables(id) ON DELETE CASCADE,rsvp_id uuid REFERENCES rsvps(id) ON DELETE SET NULL UNIQUE,seat_number integer);
 INSERT INTO weddings(id)VALUES('wedding1'),('wedding2');
 GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;`);
 await db.exec(fs.readFileSync('supabase/migrations/20261022053614_planner_atomic_operations.sql','utf8'));
 const rows=[{title:'Book venue',template_key:'venue',section:'Plan'},{title:'Invite guests',template_key:'guests',section:'Plan'}];
 await db.exec('SET ROLE service_role');
 await assert.rejects(db.query('SELECT * FROM quickweds_seed_checklist($1,$2,1)',['wedding1',JSON.stringify(rows)]));
 assert.equal((await db.query('SELECT count(*)::int n FROM planner_tasks')).rows[0].n,0);
 assert.equal((await db.query('SELECT * FROM quickweds_seed_checklist($1,$2,25)',['wedding1',JSON.stringify(rows)])).rows.length,2);
 assert.equal((await db.query('SELECT * FROM quickweds_seed_checklist($1,$2,25)',['wedding1',JSON.stringify(rows)])).rows.length,0);
 await db.exec('RESET ROLE');
 const table=(await db.query("INSERT INTO seating_tables(wedding_id,table_name,capacity)VALUES('wedding1','Garden',2)RETURNING id")).rows[0].id;
 const guest=(await db.query("INSERT INTO rsvps(wedding_id,guest_name,attendance,num_guests)VALUES('wedding1','Family','Yes',2)RETURNING id")).rows[0].id;
 await db.query('INSERT INTO seating_assignments(wedding_id,table_id,rsvp_id)VALUES($1,$2,$3)',['wedding1',table,guest]);
 assert.equal((await db.query('SELECT table_assignment FROM rsvps WHERE id=$1',[guest])).rows[0].table_assignment,'Garden');
 await assert.rejects(db.query('UPDATE seating_tables SET capacity=1 WHERE id=$1',[table]));
 await db.query("UPDATE seating_tables SET table_name='Rose' WHERE id=$1",[table]);assert.equal((await db.query('SELECT table_assignment FROM rsvps WHERE id=$1',[guest])).rows[0].table_assignment,'Rose');
 const other=(await db.query("INSERT INTO rsvps(wedding_id,attendance,num_guests)VALUES('wedding1','Yes',1)RETURNING id")).rows[0].id;
 await assert.rejects(db.query('INSERT INTO seating_assignments(wedding_id,table_id,rsvp_id)VALUES($1,$2,$3)',['wedding1',table,other]));
 await db.query('UPDATE seating_assignments SET seat_number=0 WHERE rsvp_id=$1',[guest]);assert.equal((await db.query('SELECT seat_number FROM seating_assignments WHERE rsvp_id=$1',[guest])).rows[0].seat_number,1);
 await db.query('UPDATE rsvps SET num_guests=3 WHERE id=$1',[guest]);assert.equal((await db.query('SELECT count(*)::int n FROM seating_assignments WHERE rsvp_id=$1',[guest])).rows[0].n,0);assert.equal((await db.query('SELECT table_assignment FROM rsvps WHERE id=$1',[guest])).rows[0].table_assignment,null);
 await db.query('UPDATE rsvps SET num_guests=2 WHERE id=$1',[guest]);await db.query('INSERT INTO seating_assignments(wedding_id,table_id,rsvp_id)VALUES($1,$2,$3)',['wedding1',table,guest]);
 await db.query('DELETE FROM seating_tables WHERE id=$1',[table]);assert.equal((await db.query('SELECT table_assignment FROM rsvps WHERE id=$1',[guest])).rows[0].table_assignment,null);
 await db.exec('SET ROLE authenticated');await assert.rejects(db.query('SELECT * FROM quickweds_seed_checklist($1,$2,25)',['wedding1',JSON.stringify(rows)]));
 } finally {await db.close();}
});

test('installment overpayments cannot hide another supplier balance',()=>{
 const {calculateInstallmentPaid}=load('src/lib/planner-budget.ts');
 assert.equal(calculateInstallmentPaid([],[{id:'a',amount:10},{id:'b',amount:90}],[{planner_vendor_id:'a',amount:100,paid_at:'2026-01-01'}]),10);
 assert.equal(calculateInstallmentPaid([],[{id:'a',amount:10,payment_status:'paid'}],[{planner_vendor_id:'a',amount:100,paid_at:'2026-01-01'}]),0);
 assert.equal(calculateInstallmentPaid([],[],[{planner_vendor_id:'deleted',amount:100,paid_at:'2026-01-01'}]),0);
});
test('UUID planner wedding IDs resolve as IDs and malformed identifiers remain rejected',()=>{
 const {isWeddingIdLike}=load('src/lib/wedding-slugs.ts');
 assert.equal(isWeddingIdLike('d1390c44-2c7b-41ad-9c57-138114391fa0'),true);
 assert.equal(isWeddingIdLike('legacy123'),true);
 assert.equal(isWeddingIdLike('a-published-slug'),false);
 const {isWeddingPhotoPath}=load('src/lib/photo-path.ts');
 assert.equal(isWeddingPhotoPath('guest-uploads/wedding1/photo.jpg','wedding1'),true);
 for(const path of ['guest-uploads/wedding2/photo.jpg','guest-uploads/wedding1/../photo.jpg','guest-uploads/wedding1/%2e%2e/photo.jpg'])assert.equal(isWeddingPhotoPath(path,'wedding1'),false);
});
