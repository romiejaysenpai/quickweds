import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function load(file) {
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(compiled, {
    module: loadedModule,
    exports: loadedModule.exports,
    require: (name) => load("src/lib/" + name.replace("./", "") + ".ts"),
  });
  return loadedModule.exports;
}
test("catering excludes declines and unresolved event responses, and CSV neutralizes formulas", () => {
  const { summarizeCatering, csvCell } = load("src/lib/planner-progress.ts");
  const guests = [
    {
      id: "a",
      guest_name: "Family",
      attendance: "Yes",
      num_guests: 3,
      children_count: 1,
      event_responses: [{ eventId: "dinner", attendance: "Yes" }],
    },
    {
      id: "b",
      attendance: "Yes",
      num_guests: 2,
      event_responses: [{ eventId: "dinner", attendance: "Maybe" }],
    },
    {
      id: "c",
      attendance: "No",
      num_guests: 4,
      event_responses: [{ eventId: "dinner", attendance: "No" }],
    },
  ];
  const report = summarizeCatering(guests, "dinner");
  assert.equal(report.people, 3);
  assert.equal(report.children, 1);
  assert.equal(report.parties, 1);
  assert.equal(report.unresolved, 1);
  assert.equal(summarizeCatering(guests).people, 5);
  assert.equal(summarizeCatering([...guests, {id:"pending",rsvp_status:"pending"}], "dinner").unresolved, 2);
  assert.equal(csvCell('=HYPERLINK("bad")'), '"\'=HYPERLINK(""bad"")"');
  assert.equal(csvCell("Alice, Bob"), '"Alice, Bob"');
});
test(
  "planner progress prevents cross-wedding links, caps installments, logs changes privately",
  { skip: !process.env.PGLITE_MODULE },
  async () => {
    const { PGlite } = await import(process.env.PGLITE_MODULE);
    const db = new PGlite();
    try {
      await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;CREATE SCHEMA quickweds_private;CREATE SCHEMA auth;CREATE FUNCTION auth.uid()RETURNS uuid LANGUAGE sql AS $$SELECT NULL::uuid$$;
 CREATE TABLE weddings(id text PRIMARY KEY,deleted_at timestamptz);INSERT INTO weddings VALUES('one',null),('two',null);
 CREATE TABLE rsvps(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text);
 CREATE TABLE planner_budgets(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,actual_cost numeric,estimated_cost numeric);
 CREATE TABLE planner_vendors(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),wedding_id text,amount numeric);
 CREATE TABLE planner_tasks(id uuid PRIMARY KEY,wedding_id text);CREATE TABLE planner_events(id uuid PRIMARY KEY,wedding_id text);CREATE TABLE seating_assignments(id uuid PRIMARY KEY,wedding_id text);CREATE TABLE wedding_collaborators(id uuid PRIMARY KEY,wedding_id text);
 GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;GRANT USAGE ON SCHEMA quickweds_private TO service_role;`);
      await db.exec(
        fs.readFileSync(
          "supabase/migrations/20261022060015_planner_progress_and_activity.sql",
          "utf8",
        ),
      );
      const vendor = (
        await db.query(
          "INSERT INTO planner_vendors(wedding_id,amount)VALUES('one',100)RETURNING id",
        )
      ).rows[0].id;
      const guest = (
        await db.query("INSERT INTO rsvps(wedding_id)VALUES('two')RETURNING id")
      ).rows[0].id;
      await db.exec("SET ROLE service_role");
      await assert.rejects(
        db.query(
          "INSERT INTO planner_payment_milestones(wedding_id,planner_vendor_id,title,amount,due_date)VALUES('two',$1,'Deposit',20,'2027-01-01')",
          [vendor],
        ),
      );
      const milestone = (
        await db.query(
          "INSERT INTO planner_payment_milestones(wedding_id,planner_vendor_id,title,amount,due_date)VALUES('one',$1,'Deposit',20,'2027-01-01')RETURNING id",
          [vendor],
        )
      ).rows[0].id;
      await assert.rejects(
        db.query(
          "INSERT INTO planner_payment_milestones(wedding_id,planner_vendor_id,title,amount,due_date)VALUES('one',$1,'Balance',81,'2027-01-01')",
          [vendor],
        ),
      );
      await db.query(
        "UPDATE planner_payment_milestones SET paid_at=now() WHERE id=$1",
        [milestone],
      );
      await assert.rejects(db.query('UPDATE planner_vendors SET amount=10 WHERE id=$1',[vendor]));
      await assert.rejects(
        db.query(
          "INSERT INTO planner_gifts(wedding_id,rsvp_id,from_name,description)VALUES('one',$1,'Guest','Gift')",
          [guest],
        ),
      );
      await db.query(
        "INSERT INTO planner_gifts(wedding_id,from_name,description)VALUES('one','Anonymous','Gift')",
      );
      const events = (
        await db.query("SELECT entity_type,action FROM planner_activity")
      ).rows;
      assert.equal(events.length, 4);
      assert.equal(
        events.filter(
          (event) => event.entity_type === "planner_payment_milestones",
        ).length,
        2,
      );
      await assert.rejects(db.query("DELETE FROM planner_activity"));
      await db.exec("RESET ROLE;SET ROLE authenticated");
      await assert.rejects(db.query("SELECT * FROM planner_gifts"));
      await assert.rejects(db.query("SELECT * FROM planner_activity"));
    } finally {
      await db.close();
    }
  },
);
