import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadSlugs() {
  const code = ts.transpileModule(fs.readFileSync('src/lib/wedding-slugs.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, Math, Set, Array, String });
  return mod.exports;
}

// Mirrors the DB constraint weddings_public_slug_format.
const DB_SLUG = /^[a-z0-9][a-z0-9-]{2,79}$/;
const isDbValid = (slug) => DB_SLUG.test(slug) && !slug.includes('--');

const slugs = loadSlugs();

test('detects the production duplicate public slug error', () => {
  const error = {
    code: '23505',
    message: 'duplicate key value violates unique constraint "weddings_public_slug_unique_idx"',
    details: 'Key (public_slug)=(maria-and-juan) already exists.',
  };
  assert.equal(slugs.isPublicSlugConflictError(error), true);
  // Must not be mistaken for a missing-column error (which would silently drop the slug).
  assert.equal(slugs.isMissingPublicSlugColumnError(error), false);
  assert.equal(slugs.isPublicSlugConflictError({ code: '23505', message: 'duplicate key value violates unique constraint "rsvps_pkey"' }), false);
  assert.equal(slugs.isPublicSlugConflictError(null), false);
});

test('slug candidates always satisfy the database format, even for very long names', () => {
  const longBase = slugs.createWeddingSlugBase('Maria Cristina Dela Cruz Santos Villanueva', 'Juan Miguel Fernando Bautista Reyes Gonzales');
  const candidates = slugs.buildWeddingSlugCandidates(longBase, 'a1b2c3d4');
  assert.ok(candidates.length >= 9);
  for (const candidate of candidates) assert.ok(isDbValid(candidate), `invalid slug: ${candidate}`);
  assert.equal(new Set(candidates).size, candidates.length);
  assert.ok(candidates.at(-1).endsWith('-a1b2c3d4'));
});

test('short or reserved names fall back to a valid base', () => {
  for (const candidate of slugs.buildWeddingSlugCandidates(slugs.createWeddingSlugBase('Al', ''), 'abcd1234')) {
    assert.ok(isDbValid(candidate), `invalid slug: ${candidate}`);
  }
  for (const candidate of slugs.buildWeddingSlugCandidates('admin', 'abcd1234')) {
    assert.ok(isDbValid(candidate), `invalid slug: ${candidate}`);
  }
});

test('collision-safe slugs are valid and differ between retries', () => {
  const base = slugs.createWeddingSlugBase('Cess', 'Mark');
  const generated = new Set();
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const slug = slugs.createCollisionSafeWeddingSlug(base, 'a1b2c3d4', attempt);
    assert.ok(isDbValid(slug), `invalid slug: ${slug}`);
    assert.ok(slug.startsWith('cess-and-mark-a1b2c3d4-'));
    assert.notEqual(slug, base);
    generated.add(slug);
  }
  assert.ok(generated.size > 15);
  assert.ok(isDbValid(slugs.createCollisionSafeWeddingSlug('x'.repeat(80), 'a1b2c3d4', 3)));
});

test('builder never checks slug availability with the RLS-scoped browser client', () => {
  const source = fs.readFileSync('src/components/BuilderForm.tsx', 'utf8');
  assert.equal(/\.eq\('public_slug'/.test(source), false, 'client-side public_slug lookups cannot see other couples\' weddings');
  assert.ok(source.includes('/api/weddings/slug-availability'));
  assert.ok(source.includes('isPublicSlugConflictError(error)'), 'upsert loop must recover from slug conflicts');
});

