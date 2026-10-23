import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test(
  "photo reservations enforce code and guest limits, preserve retries and deny browser RPC access",
  { skip: !process.env.PGLITE_MODULE },
  async () => {
    const { PGlite } = await import(process.env.PGLITE_MODULE);
    const db = new PGlite();
    try {
      await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 CREATE TABLE weddings(id text PRIMARY KEY,deleted_at timestamptz,planner_only boolean DEFAULT false);
 CREATE TABLE photo_sharing_codes(id uuid PRIMARY KEY,wedding_id text,is_active boolean,max_uploads integer,current_uploads integer DEFAULT 0,expires_at timestamptz);
 CREATE TABLE wedding_photos(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,uploader_name text,cloudinary_url text,cloudinary_public_id text,caption text,message text,guest_identifier text,upload_source text,status text,is_approved boolean,approved_at timestamptz,metadata jsonb);
 INSERT INTO weddings(id) VALUES('w'); INSERT INTO photo_sharing_codes(id,wedding_id,is_active,max_uploads) VALUES('00000000-0000-0000-0000-000000000001','w',true,2);
 GRANT ALL ON weddings,photo_sharing_codes,wedding_photos TO service_role;`);
      await db.exec(
        fs.readFileSync(
          "supabase/migrations/20261022055307_photo_reservations_and_private_uploads.sql",
          "utf8",
        ),
      );
      await db.exec("SET ROLE service_role");
      const claim = async (n, principal = "browser:test", hash = "hash") =>
        (
          await db.query(
            "SELECT quickweds_reserve_photo('w','00000000-0000-0000-0000-000000000001',$1,$2,$3,$4,1) job",
            [
              principal,
              `00000000-0000-0000-0000-${String(n).padStart(12, "0")}`,
              hash,
              `guest-uploads/w/${n}.jpg`,
            ],
          )
        ).rows[0].job;
      const first = await claim(1);
      assert.equal(first.state, "reserved");
      assert.equal((await claim(1)).state, "busy");
      assert.equal(
        (await claim(1, "browser:test", "changed")).state,
        "conflict",
      );
      assert.equal((await claim(2)).state, "limited");
      await db.query("SELECT quickweds_release_photo($1,$2)", [first.id,first.claim_token]);
      await db.query("SELECT quickweds_release_photo($1,$2)", [first.id,first.claim_token]);
      const retry = await claim(1);
      assert.equal(retry.state, "reserved");
      const photo = (
        await db.query("SELECT quickweds_complete_photo($1,$2,$3) id", [
          retry.id,
          JSON.stringify({
            uploader_name: "Test",
            status: "pending",
            is_approved: false,
          }),
          retry.claim_token,
        ])
      ).rows[0].id;
      assert.equal((await claim(1)).photo_id, photo);
      await assert.rejects(db.query("UPDATE wedding_photos SET cloudinary_public_id='guest-uploads/victim/stolen.jpg' WHERE id=$1",[photo]));
      await assert.rejects(db.query("UPDATE wedding_photos SET storage_bucket='quickweds' WHERE id=$1",[photo]));
      await db.query("SELECT quickweds_release_photo($1,$2)", [retry.id,retry.claim_token]);
      assert.equal((await claim(2, "browser:other")).state, "reserved");
      assert.equal((await claim(3, "browser:third")).state, "limited");
      assert.equal(
        (await db.query("SELECT current_uploads FROM photo_sharing_codes"))
          .rows[0].current_uploads,
        2,
      );
      assert.equal(
        (await db.query("SELECT storage_bucket FROM wedding_photos")).rows[0]
          .storage_bucket,
        "quickweds-guest-photos",
      );
      const pending=(await db.query("SELECT id,claim_token FROM photo_upload_reservations WHERE state='reserved' LIMIT 1")).rows[0];
      if(pending){
       assert.equal((await db.query("SELECT quickweds_claim_photo_recovery($1,'w') job",[pending.id])).rows[0].job,null);
       await db.query("UPDATE photo_upload_reservations SET lease_until=now()-interval '1 second' WHERE id=$1",[pending.id]);
       const recovered=(await db.query("SELECT quickweds_claim_photo_recovery($1,'w') job",[pending.id])).rows[0].job;
       assert.notEqual(recovered.claim_token,pending.claim_token);
       await db.query('SELECT quickweds_release_photo($1,$2)',[pending.id,pending.claim_token]);
       assert.equal((await db.query('SELECT current_uploads FROM photo_sharing_codes')).rows[0].current_uploads,2);
       await db.query('SELECT quickweds_release_photo($1,$2)',[pending.id,recovered.claim_token]);
       assert.equal((await db.query('SELECT current_uploads FROM photo_sharing_codes')).rows[0].current_uploads,1);
      }
      await db.exec("RESET ROLE;SET ROLE anon");
      await assert.rejects(db.query('SELECT * FROM wedding_photos'));
      await db.exec("RESET ROLE;SET ROLE authenticated");
      await assert.rejects(claim(4));
    } finally {
      await db.close();
    }
  },
);
