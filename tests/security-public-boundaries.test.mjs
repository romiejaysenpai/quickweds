import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function loadModule(file, mocks = {}) {
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(compiled, {
    module: loadedModule, exports: loadedModule.exports, console, process, URL, Response,
    require(name) {
      if (name in mocks) return mocks[name];
      if (name === 'server-only') return {};
      if (name.startsWith('@/')) return loadModule(`src/${name.slice(2)}.ts`, mocks);
      return require(name);
    },
  }, { filename: file });
  return loadedModule.exports;
}
const next = { NextResponse: { json: (data, options) => Response.json(data, options) } };
const rateLimit = {
  createRateLimitMiddleware: () => ({ check: async () => ({ limited: false, headers: {} }) }),
  getClientIP: () => '127.0.0.1', sanitizeInput: (s) => s, sanitizeWeddingId: (s) => s,
};

function weddingDb(row) {
  const queries = [];
  return {
    queries,
    from(table) {
      const filters = [];
      queries.push({ table, filters });
      const query = {
        select() { return query; },
        eq(key, value) { filters.push([key, value]); return query; },
        is(key, value) { filters.push([key, value]); return query; },
        async maybeSingle() {
          return { data: row && filters.every(([key, value]) => row[key] === value) ? row : null, error: null };
        },
      };
      return query;
    },
  };
}

test('A06 deleted wedding cannot resolve by ID or slug with a projection omitting deleted_at', async () => {
  const { resolvePublicWeddingByIdentifier } = loadModule('src/lib/public-wedding-lookup.ts');
  for (const identifier of ['abcd1234', 'synthetic-couple']) {
    const db = weddingDb({ id: 'abcd1234', public_slug: 'synthetic-couple', deleted_at: '2026-01-01' });
    const result = await resolvePublicWeddingByIdentifier(db, identifier, 'id');
    assert.equal(result.wedding, null);
    assert.ok(db.queries.length > 0);
    assert.ok(db.queries.every(q => q.filters.some(([key, value]) => key === 'deleted_at' && value === null)));
  }
  const db = weddingDb({ id: 'abcd1234', deleted_at: null, planner_only: false });
  const active = await resolvePublicWeddingByIdentifier(db, 'abcd1234', 'id');
  assert.ok(active.wedding);
});

test('A06 active-state check runs before a stale Next cache can return wedding data', async () => {
  let cachedReads = 0;
  const { getCachedPublicWedding } = loadModule('src/lib/public-wedding.ts', {
    '@/lib/public-wedding-lookup': { resolvePublicWeddingByIdentifier: async () => ({ wedding: null, error: null }) },
    '@/lib/supabase-admin': { getSupabaseAdminClient: () => ({}) },
    '@/lib/redis': {},
    'next/cache': { unstable_cache: () => async () => { cachedReads++; return { id: 'deleted' }; } },
  });
  assert.equal(await getCachedPublicWedding('synthetic-deleted'), null);
  assert.equal(cachedReads, 0);
});

test('A06 guest-book GET and POST reject deleted or missing weddings before accessing entries', async () => {
  const db = weddingDb(null);
  const { GET, POST } = loadModule('src/app/api/public/guest-book/route.ts', {
    'next/server': next,
    '@/lib/rate-limit': rateLimit,
    '@/lib/supabase-admin': { getSupabaseAdminClient: () => db },
  });
  assert.equal((await GET({ nextUrl: new URL('https://example.test/?weddingId=synthetic'), headers: new Headers() })).status, 404);
  assert.equal((await POST({ json: async () => ({ weddingId: 'synthetic', guestName: 'Test', message: 'Test' }) })).status, 404);
  assert.ok(db.queries.every(q => q.table === 'weddings'));
});

test('A05 proposal GET and POST serialize only recipient-specific fields', async () => {
  const invitation = {
    id: 'private-id', email: 'recipient@example.test', wedding_id: 'private-wedding', member_key: 'recipient',
    name: 'Recipient', role: 'Partner', status: 'accepted',
    response_details: { attireSize: 'M', unrelatedPrivateField: 'DO_NOT_EXPOSE' },
    weddings: { bride_name: 'A', groom_name: 'B', wedding_party: [
      { memberKey: 'other', name: 'Recipient', email: 'other@example.test', proposalHeroImage: 'OTHER_PRIVATE_IMAGE' },
      { memberKey: 'recipient', name: 'Recipient', email: 'recipient@example.test', proposalHeroImage: 'RECIPIENT_IMAGE', requestPhoneNumber: false },
    ], unrelatedPrivateField: 'DO_NOT_EXPOSE' },
  };
  const db = { from() { const query = {
    select: () => query, update: () => query, eq: () => query, is: () => query,
    maybeSingle: async () => ({ data: invitation, error: null }),
  }; return query; } };
  const { GET, POST } = loadModule('src/app/api/entourage/invitations/respond/route.ts', {
    'next/server': next,
    '@/lib/rate-limit': rateLimit,
    '@/lib/supabase-admin': { getSupabaseAdminClient: () => db },
  });
  const token = 'synthetic-token-with-enough-length';
  for (const response of [await GET({ url: `https://example.test/?token=${token}` }), await POST({ json: async () => ({ token, response: 'accepted' }) })]) {
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const payload = await response.json();
    assert.equal(payload.invitation.name, 'Recipient');
    assert.equal(payload.invitation.proposalHeroImage, 'RECIPIENT_IMAGE');
    assert.equal(payload.invitation.requestPhoneNumber, false);
    assert.equal(payload.invitation.response_details.attireSize, 'M');
    const serialized = JSON.stringify(payload);
    for (const secret of ['DO_NOT_EXPOSE', 'OTHER_PRIVATE_IMAGE', 'other@example.test', 'recipient@example.test', 'wedding_party', 'member_key', 'private-id']) assert.ok(!serialized.includes(secret), secret);
  }
});

test('A06 deleted entourage proposal rejects reads and responses before mutation', async () => {
  let writes = 0;
  const db = { from() { const query = {
    select: () => query, eq: () => query, is: () => query,
    update: () => { writes++; return query; },
    maybeSingle: async () => ({ data: { name: 'Test', weddings: { deleted_at: '2026-01-01' } }, error: null }),
  }; return query; } };
  const { GET, POST } = loadModule('src/app/api/entourage/invitations/respond/route.ts', {
    'next/server': next, '@/lib/rate-limit': rateLimit,
    '@/lib/supabase-admin': { getSupabaseAdminClient: () => db },
  });
  const token = 'synthetic-token-with-enough-length';
  assert.equal((await GET({ url: `https://example.test/?token=${token}` })).status, 404);
  assert.equal((await POST({ json: async () => ({ token, response: 'accepted' }) })).status, 404);
  assert.equal(writes, 0);
});

test('A06 personal seat token cannot expose guest seating after wedding deletion', async () => {
  const weddingQueries = weddingDb(null);
  let assignments = 0;
  const db = { from(table) {
    if (table === 'weddings') return weddingQueries.from(table);
    if (table === 'seating_assignments') assignments++;
    const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: { id: 'guest', wedding_id: 'deleted' }, error: null }) };
    return query;
  } };
  const { GET } = loadModule('src/app/api/seating/guest-seat/route.ts', {
    'next/server': next, '@/lib/rate-limit': rateLimit,
    '@/lib/supabase-admin': { getSupabaseAdminClient: () => db },
    '@/lib/seat-finder': {},
  });
  assert.equal((await GET({ url: 'https://example.test/?token=synthetic' })).status, 404);
  assert.equal(assignments, 0);
  assert.ok(weddingQueries.queries[0].filters.some(([key, value]) => key === 'deleted_at' && value === null));
});

test('A06 owner/admin/collaborator authorization rejects a deleted wedding first', async () => {
  const db = weddingDb(null);
  const { getWeddingAccess } = loadModule('src/lib/wedding-access.ts', {
    '@/lib/admin': { isKnownAdminEmail: () => true },
  });
  const result = await getWeddingAccess(db, { id: 'owner', email: 'admin@example.test' }, 'deleted');
  assert.equal(result.canManage, false);
  assert.equal(result.wedding, null);
  assert.ok(db.queries[0].filters.some(([key, value]) => key === 'deleted_at' && value === null));
});

test('legacy wedding schema loads by ID and slug while preserving deletion and modern privacy guards', async () => {
  const {resolvePublicWeddingByIdentifier}=loadModule('src/lib/public-wedding-lookup.ts');
  function dbFor(row,error={code:'42703',message:'column weddings.planner_only does not exist'}){
    const queries=[];
    return {queries,from(){const filters=[];const entry={filters,select:''};queries.push(entry);const q={select(fields){entry.select=fields;return q;},eq(k,v){filters.push([k,v]);return q;},is(k,v){filters.push([k,v]);return q;},async maybeSingle(){if(filters.some(([k])=>k==='planner_only')&&error)return {data:null,error};return {data:filters.every(([k,v])=>row[k]===v)?row:null,error:null};}};return q;}};
  }
  for(const identifier of ['abcd1234','synthetic-couple']){
    const legacy={id:'abcd1234',public_slug:'synthetic-couple',deleted_at:null};
    const db=dbFor(legacy);const result=await resolvePublicWeddingByIdentifier(db,identifier,'id');
    assert.equal(result.error,null);assert.ok(result.wedding);assert.equal(db.queries.length,2);
    assert.ok(db.queries.every(q=>q.select==='id'&&q.filters.some(([k,v])=>k==='deleted_at'&&v===null)));
    const deleted=dbFor({...legacy,deleted_at:'2026-10-01'});
    assert.equal((await resolvePublicWeddingByIdentifier(deleted,identifier,'id')).wedding,null);
    const modern=dbFor({...legacy,planner_only:true},null);
    assert.equal((await resolvePublicWeddingByIdentifier(modern,identifier,'id')).wedding,null);
    assert.ok(modern.queries.every(q=>q.filters.some(([k,v])=>k==='planner_only'&&v===false)));
    const active=dbFor({...legacy,planner_only:false},null);assert.ok((await resolvePublicWeddingByIdentifier(active,identifier,'id')).wedding);
    for(const error of [{code:'42501',message:'column weddings.planner_only does not exist'},{code:'PGRST204',message:'column weddings.planner_only does not exist'},{code:'42703',message:'column weddings.deleted_at does not exist',hint:'weddings.planner_only'},{code:'42703',message:'column weddings.planner_only_extra does not exist'}]){
      const broken=dbFor(legacy,error);const failed=await resolvePublicWeddingByIdentifier(broken,identifier,'id');
      assert.ok(failed.error);assert.equal(broken.queries.length,1);
    }
  }
});
