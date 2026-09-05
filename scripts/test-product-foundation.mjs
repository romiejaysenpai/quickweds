import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";
async function source(path) {
  const js = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
  );
}
const { eventInstant, isRsvpClosed } = await source("src/lib/event-time.ts");
assert.equal(
  eventInstant("2026-09-06", "15:00", "Asia/Tokyo").toISOString(),
  "2026-09-06T06:00:00.000Z",
);
assert.equal(
  eventInstant("2026-07-01", "15:00", "America/New_York").toISOString(),
  "2026-07-01T19:00:00.000Z",
);
assert.equal(
  isRsvpClosed("2026-09-06", "Asia/Tokyo", new Date("2026-09-06T14:59:00Z")),
  false,
);
assert.equal(
  isRsvpClosed("2026-09-06", "Asia/Tokyo", new Date("2026-09-06T15:00:00Z")),
  true,
);
assert.throws(() => eventInstant("2026-03-08", "02:30", "America/New_York"));
const { vendorBalance, expenseSummary } = await source(
  "src/lib/expense-summary.ts",
);
assert.deepEqual(
  vendorBalance({ id: "a", amount: 1000, payment_status: "pending" }),
  { paid: null, balance: null },
);
assert.deepEqual(vendorBalance({ id: "a", amount: 1000, paid_amount: 250 }), {
  paid: 250,
  balance: 750,
});
assert.equal(
  expenseSummary(
    [{ planner_vendor_id: "a", estimated_cost: 1000 }],
    [{ id: "a", amount: 1000, payment_status: "paid" }],
  ).planned,
  1000,
);
const db = new PGlite();
await db.exec(`
create role anon;create role authenticated;create role service_role;
create schema auth;create table auth.users(id uuid primary key);
create table public.weddings(id text primary key,user_id uuid,is_published boolean,deleted_at timestamptz,rsvp_deadline date,wedding_date date);
create table public.rsvps(id uuid primary key default gen_random_uuid(),wedding_id text references public.weddings(id),guest_name text,guest_email text,attendance text,rsvp_status text,num_guests integer,plus_one_allowed boolean,plus_one_name text,plus_one_rsvp_status text,seat_lookup_token text unique,guest_code text,meal_preference text,dietary_details text,message text,plus_one_names text,children_count integer,household_name text,household_members jsonb,event_responses jsonb,table_assignment text);
create table public.planner_vendors(id uuid primary key,wedding_id text,name text,amount numeric,payment_status text);
create table public.planner_budgets(id uuid primary key);
create table public.seating_tables(id uuid primary key,wedding_id text,table_name text,table_shape text,capacity integer,updated_at timestamptz default now());
create table public.seating_assignments(id uuid primary key default gen_random_uuid(),wedding_id text,table_id uuid,rsvp_id uuid unique,guest_name text,guest_email text,seat_number integer);
`);
await db.exec(
  fs.readFileSync(
    "supabase/migrations/20260905162952_product_intelligence_foundation.sql",
    "utf8",
  ),
);
const user = "00000000-0000-4000-8000-000000000001",
  guest = "00000000-0000-4000-8000-000000000002",
  second = "00000000-0000-4000-8000-000000000003",
  table = "00000000-0000-4000-8000-000000000004",
  vendor = "00000000-0000-4000-8000-000000000005";
await db.query("insert into auth.users values ($1)", [user]);
await db.query(
  "insert into weddings(id,user_id,is_published,rsvp_deadline) values ('w',$1,true,'2099-01-01')",
  [user],
);
await db.query(
  "insert into rsvps(id,wedding_id,guest_name,num_guests,seat_lookup_token,invited_party_size) values ($1,'w','Same Name',2,'private-token',2),($2,'w','Same Name',1,'other-token',1)",
  [guest, second],
);
const response = {
  attendance: "Yes",
  rsvp_status: "confirmed",
  num_guests: 2,
  guest_email: "guest@example.com",
  household_members: ["Partner"],
  attendees: [
    { name: "Same Name", kind: "adult", meal: "Vegetarian", dietary: "" },
    { name: "Partner", kind: "adult", meal: "Vegan", dietary: "Nuts" },
  ],
  event_responses: [],
};
await db.query("select qw_respond_to_invitation('w','private-token',$1)", [
  JSON.stringify(response),
]);
assert.equal(
  (await db.query("select count(*)::int as n from rsvps")).rows[0].n,
  2,
);
assert.equal(
  (
    await db.query(
      "select jsonb_array_length(attendees)::int as n from rsvps where id=$1",
      [guest],
    )
  ).rows[0].n,
  2,
);
assert.equal(
  (await db.query("select response_version from rsvps where id=$1", [guest]))
    .rows[0].response_version,
  1,
);
await assert.rejects(
  db.query("select qw_respond_to_invitation('w','private-token',$1)", [
    JSON.stringify({ ...response, num_guests: 3 }),
  ]),
);
assert.equal(
  (await db.query("select num_guests from rsvps where id=$1", [guest])).rows[0]
    .num_guests,
  2,
);
await assert.rejects(
  db.query("select qw_respond_to_invitation('other','private-token',$1)", [
    JSON.stringify(response),
  ]),
);
await db.query(
  "insert into seating_tables(id,wedding_id,table_name,capacity) values ($1,'w','Table 1',2)",
  [table],
);
await db.query("select qw_assign_seat('w',$1,$2)", [guest, table]);
await assert.rejects(
  db.query("select qw_assign_seat('w',$1,$2)", [second, table]),
);
await db.query(
  "select qw_update_seating_table('w',$1,'Family table','round',3)",
  [table],
);
assert.equal(
  (await db.query("select table_assignment from rsvps where id=$1", [guest]))
    .rows[0].table_assignment,
  "Family table",
);
await db.query("select qw_assign_seat('w',$1,null)", [guest]);
assert.equal(
  (await db.query("select count(*)::int as n from seating_assignments")).rows[0]
    .n,
  0,
);
await db.query("select qw_delete_seating_table('w',$1)", [table]);
await db.query(
  "insert into planner_vendors values ($1,'w','Caterer',1000,'unpaid',null)",
  [vendor],
);
const payment = "00000000-0000-4000-8000-000000000006";
for (let i = 0; i < 2; i++)
  await db.query("select qw_record_payment('w',$1,250,'Deposit',$2,$3)", [
    vendor,
    user,
    payment,
  ]);
assert.equal(
  Number(
    (
      await db.query("select paid_amount from planner_vendors where id=$1", [
        vendor,
      ])
    ).rows[0].paid_amount,
  ),
  250,
);
await db.query(
  "insert into wedding_deliveries(wedding_id,recipient,kind,dedupe_key,payload,due_at) values ('w','a@example.com','rsvp','test','{}',now())",
);
assert.equal(
  (await db.query("select * from qw_claim_deliveries(25)")).rows.length,
  1,
);
assert.equal(
  (await db.query("select * from qw_claim_deliveries(25)")).rows.length,
  0,
);
await db.exec("set role anon");
await assert.rejects(db.query("select * from wedding_operations"));
await assert.rejects(
  db.query("select qw_assign_seat('w',$1,$2)", [guest, table]),
);
await db.exec("reset role");
await db.close();
console.log(
  "PASS: event time, factual balances, isolated migration, invitation identity/allowance, atomic seating capacity, payment idempotency, queue claiming, and private grants.",
);
