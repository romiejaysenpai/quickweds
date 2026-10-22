import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
test(
  "delivery snapshots persist before dispatch, operation retries preserve tokens and collaboration acceptance",
  { skip: !process.env.PGLITE_MODULE },
  async () => {
    const { PGlite } = await import(process.env.PGLITE_MODULE);
    const db = new PGlite();
    try {
      await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;CREATE TABLE weddings(id text PRIMARY KEY,deleted_at timestamptz);INSERT INTO weddings VALUES('w',null);CREATE TABLE user_notifications(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
 CREATE TABLE entourage_invitations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,member_key text,name text,email text,role text,message text,template_key text,status text,token_hash text,sent_at timestamptz,responded_at timestamptz,created_by_user_id uuid,updated_at timestamptz,UNIQUE(wedding_id,member_key));
 CREATE TABLE wedding_collaborators(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,email text,role text,status text);
 GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;`);
      for (const file of [
        "20261022054538_durable_email_delivery.sql",
        "20261022071051_finish_delivery_operations.sql",
      ])
        await db.exec(fs.readFileSync("supabase/migrations/" + file, "utf8"));
      await db.exec("SET ROLE service_role");
      const person = {
        member_key: "best-friend",
        name: "Synthetic",
        email: "guest@example.test",
        role: "Friend",
        token_hash: "hash-one",
        created_by_user_id: "00000000-0000-0000-0000-000000000001",
      };
      const prepare = async (hash = "body-one", body = person) =>
        (
          await db.query(
            "SELECT quickweds_prepare_entourage('w','00000000-0000-0000-0000-000000000002',$1,$2) invite",
            [hash, JSON.stringify(body)],
          )
        ).rows[0].invite;
      const first = await prepare();
      await db.query(
        "UPDATE entourage_invitations SET status='accepted' WHERE id=$1",
        [first.id],
      );
      const retried = await prepare();
      assert.equal(retried.token_hash, "hash-one");
      assert.equal(retried.status, "accepted");
      await assert.rejects(
        prepare("changed-body", { ...person, token_hash: "other" }),
      );
      await db.query(
        "SELECT quickweds_prepare_entourage('w','00000000-0000-0000-0000-000000000003','body-two',$1)",
        [
          JSON.stringify({
            ...person,
            email: "new@example.test",
            token_hash: "hash-two",
          }),
        ],
      );
      await assert.rejects(prepare(), /superseded/);
      assert.equal(
        (
          await db.query(
            "SELECT token_hash FROM entourage_invitations WHERE id=$1",
            [first.id],
          )
        ).rows[0].token_hash,
        "hash-two",
      );
      const collaborator = async (email) =>
        (
          await db.query(
            "SELECT quickweds_prepare_collaborator('w',$1,'partner','00000000-0000-0000-0000-000000000001',1) invite",
            [email],
          )
        ).rows[0].invite;
      const invite = await collaborator("partner@example.test");
      assert.equal((await collaborator("partner@example.test")).id, invite.id);
      await assert.rejects(collaborator("other@example.test"));
      await db.query(
        "UPDATE wedding_collaborators SET status='accepted' WHERE id=$1",
        [invite.id],
      );
      assert.equal(
        (await collaborator("partner@example.test")).status,
        "accepted",
      );
      const rows = [
        {
          key: "one",
          wedding_id: "w",
          payload: {
            to: ["synthetic@example.test"],
            html: "frozen",
            subject: "Test",
          },
          guard: { table: "rsvps", id: "guest", emailField: "guest_email" },
          quota_limit: 2,
        },
      ];
      const queued = (
        await db.query("SELECT * FROM quickweds_enqueue_email_batch($1)", [
          JSON.stringify(rows),
        ])
      ).rows;
      assert.equal(queued[0].state, "queued");
      assert.equal(queued[0].attempts, 0);
      const again = (
        await db.query("SELECT * FROM quickweds_enqueue_email_batch($1)", [
          JSON.stringify([
            { ...rows[0], payload: { ...rows[0].payload, html: "changed" } },
          ]),
        ])
      ).rows;
      assert.equal(again[0].payload.html, "frozen");
      const claimed = (
        await db.query("SELECT quickweds_claim_email('one',$1,'w',2,1) job", [
          JSON.stringify(rows[0].payload),
        ])
      ).rows[0].job;
      assert.equal(claimed.state, "processing");
      await db.query(
        "SELECT quickweds_finish_email($1,$2,'retryable',null,'uncertain')",
        [claimed.id, claimed.claim_token],
      );
      await db.query(
        "UPDATE email_delivery_jobs SET first_dispatch_at=now()-interval '25 hours' WHERE id=$1",
        [claimed.id],
      );
      assert.equal(
        (
          await db.query("SELECT quickweds_claim_email('one',$1,'w',2,1) job", [
            JSON.stringify(rows[0].payload),
          ])
        ).rows[0].job.state,
        "unknown",
      );
      assert.equal(
        (
          await db.query(
            "SELECT quickweds_reconcile_email($1,'w','verified-provider') result",
            [claimed.id],
          )
        ).rows[0].result,
        true,
      );
      assert.equal(
        (await db.query("SELECT consumed FROM email_delivery_usage")).rows[0]
          .consumed,
        1,
      );
      assert.equal(
        (
          await db.query(
            "SELECT quickweds_reconcile_email($1,'w','verified-provider') result",
            [claimed.id],
          )
        ).rows[0].result,
        true,
      );
      assert.equal(
        (await db.query("SELECT consumed FROM email_delivery_usage")).rows[0]
          .consumed,
        1,
      );
      await db.exec("RESET ROLE;SET ROLE authenticated");
      await assert.rejects(
        db.query("SELECT * FROM quickweds_enqueue_email_batch($1)", [
          JSON.stringify(rows),
        ]),
      );
    } finally {
      await db.close();
    }
  },
);
function loadEmail(db, provider, finish) {
  const compiled = ts.transpileModule(
    fs.readFileSync("src/lib/email.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const loadedModule = { exports: {} };
  const mocks = {
    "@/lib/supabase-admin": { getSupabaseAdminClient: () => db },
    resend: {
      Resend: class {
        emails = provider;
      },
    },
    "@/lib/planner-limits": { getUserTriggeredEmailUsage: async () => 0 },
    "@/lib/email-delivery": { finishEmailDelivery: finish },
    "./email-templates": {},
    "@react-email/render": { render: async () => "<p>Frozen</p>" },
  };
  vm.runInNewContext(compiled, {
    module: loadedModule,
    exports: loadedModule.exports,
    process: { env: { RESEND_API_KEY: "synthetic" } },
    console: { log() {}, error() {} },
    require: (name) => (name in mocks ? mocks[name] : require(name)),
  });
  return loadedModule.exports;
}
test("stored retry rejects changed recipient before provider, verifies exact tagged provider receipt", async () => {
  const finishes = [];
  const calls = [];
  const job = {
    id: "job-one",
    state: "retryable",
    wedding_id: "w",
    semantic_key: "hash",
    recoverable: true,
    delivery_guard: { table: "rsvps", id: "guest", emailField: "guest_email" },
    payload: {
      to: ["guest@example.test"],
      subject: "Test",
      html: "<p>Frozen</p>",
    },
  };
  let email = "other@example.test";
  const query = {
    select() {
      return this;
    },
    eq() {
      return this;
    },
    async maybeSingle() {
      return { data: { guest_email: email } };
    },
  };
  const db = {
    from: () => query,
    rpc: async () => ({
      data: { ...job, state: "processing", claim_token: "claim" },
    }),
  };
  const provider = {
    send: async (payload, options) => {
      calls.push({ payload, options });
      return { data: { id: "provider" } };
    },
    get: async () => ({
      data: {
        id: "receipt",
        to: job.payload.to,
        subject: "Test",
        html: job.payload.html,
        last_event: "sent",
        tags: [{ name: "quickweds_delivery", value: job.id }],
      },
    }),
  };
  const api = loadEmail(db, provider, async (...args) => finishes.push(args));
  await assert.rejects(api.retryStoredEmail(job), /recipient changed/);
  assert.equal(calls.length, 0);
  email = "guest@example.test";
  assert.equal((await api.retryStoredEmail(job)).success, true);
  assert.equal(calls[0].options.idempotencyKey, "quickweds/job-one");
  assert.equal(finishes[0][1], "accepted");
  assert.equal(await api.verifyStoredEmailReceipt(job, "receipt"), "receipt");
  await assert.rejects(
    api.verifyStoredEmailReceipt({ ...job, id: "wrong-job" }, "receipt"),
    /does not match/,
  );
});
