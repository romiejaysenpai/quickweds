import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('A10 durable claims fence concurrent sends, freeze payload, enforce quota once and hold ambiguous expired sends', {skip:!process.env.PGLITE_MODULE},async()=>{
 const {PGlite}=await import(process.env.PGLITE_MODULE);const db=new PGlite();
 try{
 await db.exec("CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;CREATE TABLE weddings(id text PRIMARY KEY);CREATE TABLE user_notifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid());INSERT INTO weddings VALUES('w');GRANT SELECT ON weddings TO service_role;");
 await db.exec(fs.readFileSync('supabase/migrations/20261022054538_durable_email_delivery.sql','utf8'));await db.exec('SET ROLE service_role');
 const payload={to:['synthetic@example.test'],html:'frozen',subject:'Test'};
 const claim=async(key,body=payload)=>(await db.query('SELECT quickweds_claim_email($1,$2,$3,2,0) job',[key,JSON.stringify(body),'w'])).rows[0].job;
 const finish=async(job,state,token=job.claim_token)=>(await db.query('SELECT quickweds_finish_email($1,$2,$3,$4,$5) done',[job.id,token,state,state==='accepted'?'synthetic-provider-id':null,null])).rows[0].done;
 const first=await claim('initial');assert.equal(first.state,'processing');assert.equal((await claim('initial')).state,'busy');
 assert.equal(await finish(first,'accepted','00000000-0000-0000-0000-000000000000'),false);
 assert.equal(await finish(first,'accepted'),true);assert.equal(await finish(first,'accepted'),false);assert.equal((await claim('initial')).state,'accepted');
 assert.equal((await claim('initial',{...payload,to:['other@example.test']})).state,'recipient_changed');
 let second=await claim('retry');assert.equal(second.state,'processing');await finish(second,'retryable');
 assert.equal((await claim('over-quota')).state,'limited');second=await claim('retry',{...payload,html:'new template must not change retry'});assert.equal(second.payload.html,'frozen');
 await finish(second,'failed');assert.equal((await claim('retry')).state,'failed');
 const third=await claim('last-slot');assert.equal(third.state,'processing');await finish(third,'retryable');
 await db.query("UPDATE email_delivery_jobs SET first_dispatch_at=now()-interval '25 hours' WHERE id=$1",[third.id]);assert.equal((await claim('last-slot')).state,'unknown');
 const usage=(await db.query('SELECT * FROM email_delivery_usage')).rows[0];assert.equal(usage.consumed,1);assert.equal(usage.reserved,1);
 await db.exec('RESET ROLE;SET ROLE authenticated');await assert.rejects(claim('forged'));
 }finally{await db.close();}
});
