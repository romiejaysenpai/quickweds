// Run with PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node --test tests/security-database.test.mjs
// PGlite is an optional external test runtime; no application dependency required.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const owner = '00000000-0000-0000-0000-000000000001';
const invitee = '00000000-0000-0000-0000-000000000002';
const outsider = '00000000-0000-0000-0000-000000000003';

test('A01/A03/A04 direct database authorization and moderation', { skip: !process.env.PGLITE_MODULE }, async () => {
  const { PGlite } = await import(process.env.PGLITE_MODULE);
  const db = new PGlite();
  try {
    await db.exec(await fs.readFile('tests/fixtures/audit-security-schema.sql', 'utf8'));
    async function as(role, id, email, sql) {
      await db.exec(`RESET ROLE; SET ROLE ${role};`);
      await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.email',$2,false)", [id || '', email || '']);
      return db.query(sql);
    }
    // Reproduce the audited self-grant before applying the patch.
    await as('authenticated', outsider, 'outsider@example.test', "INSERT INTO wedding_collaborators(wedding_id,email,status) VALUES('wedding-owner','outsider@example.test','accepted')");
    await db.exec('RESET ROLE; DELETE FROM wedding_collaborators;');
    await db.exec(await fs.readFile('supabase/migrations/20261021162258_audit_access_and_moderation_guards.sql', 'utf8'));
    await assert.rejects(as('authenticated', outsider, 'outsider@example.test', "INSERT INTO wedding_collaborators(wedding_id,email,status) VALUES('wedding-owner','outsider@example.test','accepted')"));
    await assert.rejects(as('authenticated', outsider, 'outsider@example.test', `INSERT INTO wedding_collaborators(wedding_id,email,invited_by_user_id) VALUES('wedding-owner','outsider@example.test','${outsider}')`));
    await as('authenticated', owner, 'owner@example.test', `INSERT INTO wedding_collaborators(wedding_id,email,invited_by_user_id) VALUES('wedding-owner','invitee@example.test','${owner}')`);
    assert.equal((await as('authenticated', outsider, 'outsider@example.test', 'SELECT * FROM wedding_collaborators')).rows.length, 0);
    assert.equal((await as('authenticated', outsider, 'outsider@example.test', "UPDATE wedding_collaborators SET status='accepted' RETURNING id")).rows.length, 0);
    await assert.rejects(as('authenticated', invitee, 'invitee@example.test', "UPDATE wedding_collaborators SET role='coordinator'"));
    await assert.rejects(as('authenticated', invitee, 'invitee@example.test', "UPDATE wedding_collaborators SET wedding_id='wedding-deleted'"));
    await assert.rejects(as('authenticated', invitee, 'invitee@example.test', `UPDATE wedding_collaborators SET invited_by_user_id='${outsider}'`));
    assert.equal((await as('authenticated', invitee, 'invitee@example.test', "UPDATE wedding_collaborators SET status='accepted' RETURNING status")).rows[0].status, 'accepted');
    assert.equal((await as('authenticated', invitee, 'invitee@example.test', 'DELETE FROM wedding_collaborators RETURNING id')).rows.length, 0);
    assert.equal((await as('authenticated', owner, 'owner@example.test', 'DELETE FROM wedding_collaborators RETURNING id')).rows.length, 1);
    await assert.rejects(as('authenticated', owner, 'owner@example.test', `INSERT INTO wedding_collaborators(wedding_id,email,invited_by_user_id) VALUES('wedding-deleted','invitee@example.test','${owner}')`));
    // A SECURITY DEFINER caller must not turn authenticated into service_role.
    await db.exec("RESET ROLE; CREATE FUNCTION public.test_definer_helper() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT public.is_service_role_caller() $$; GRANT EXECUTE ON FUNCTION public.test_definer_helper() TO authenticated;");
    assert.equal((await as('authenticated', owner, 'owner@example.test', 'SELECT test_definer_helper() trusted')).rows[0].trusted, false);
    assert.equal((await as('service_role', '', '', 'SELECT is_service_role_caller() trusted')).rows[0].trusted, true);
    await assert.rejects(as('authenticated', owner, 'owner@example.test', `INSERT INTO supplier_profiles(owner_user_id,status) VALUES('${owner}','approved')`));
    await as('authenticated', owner, 'owner@example.test', `INSERT INTO supplier_profiles(owner_user_id,business_name) VALUES('${owner}','Synthetic supplier')`);
    await as('authenticated', owner, 'owner@example.test', "UPDATE supplier_profiles SET business_name='Updated supplier',status='pending_review'");
    await assert.rejects(as('authenticated', owner, 'owner@example.test', 'UPDATE supplier_profiles SET is_featured=true'));
    await assert.rejects(as('authenticated', owner, 'owner@example.test', 'UPDATE supplier_profiles SET display_order=1'));
    await assert.rejects(as('authenticated', owner, 'owner@example.test', "UPDATE supplier_profiles SET status='approved'"));
    await as('service_role', '', '', "UPDATE supplier_profiles SET status='approved',is_featured=true,display_order=10");
    await as('authenticated', owner, 'owner@example.test', "UPDATE supplier_profiles SET business_name='Edited approved supplier'");
    await as('anon', '', '', `INSERT INTO app_reviews(user_id,wedding_id,quote,status,verified_couple,is_featured) VALUES('${owner}','wedding-owner','Synthetic review','approved',true,true)`);
    const anonReview = (await as('service_role', '', '', 'SELECT * FROM app_reviews')).rows[0];
    assert.equal(anonReview.user_id, null);
    assert.equal(anonReview.wedding_id, null);
    assert.equal(anonReview.status, 'pending');
    assert.equal(anonReview.verified_couple, false);
    assert.equal(anonReview.is_featured, false);
    await as('authenticated', owner, 'owner@example.test', `INSERT INTO app_reviews(user_id,quote) VALUES('${outsider}','Owner review')`);
    const own = (await as('authenticated', owner, 'owner@example.test', 'SELECT * FROM app_reviews')).rows;
    assert.equal(own.length, 1);
    assert.equal(own[0].user_id, owner);
    await assert.rejects(as('authenticated', owner, 'owner@example.test', "UPDATE app_reviews SET status='approved'"));
    await assert.rejects(as('authenticated', owner, 'owner@example.test', 'UPDATE app_reviews SET verified_couple=true'));
    await assert.rejects(as('authenticated', owner, 'owner@example.test', "UPDATE app_reviews SET wedding_id='wedding-owner'"));
    await as('service_role', '', '', `UPDATE app_reviews SET status='approved',is_featured=true,verified_couple=true WHERE user_id='${owner}'`);
    const edited = (await as('authenticated', owner, 'owner@example.test', "UPDATE app_reviews SET quote='Updated owner review' RETURNING *")).rows[0];
    assert.equal(edited.status, 'pending');
    assert.equal(edited.is_featured, false);
    assert.equal(edited.verified_couple, true);
  } finally { await db.close(); }
});
