import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(code, {
    module: loadedModule,
    exports: loadedModule.exports,
    console,
    process,
    URL,
    Buffer,
    Uint32Array,
    Uint8Array,
    setInterval,
    clearInterval,
    fetch: mocks.fetch,
    require: (name) => (name in mocks ? mocks[name] : require(name)),
  });
  return loadedModule.exports;
}

test('toSafeHttpUrl blocks javascript/data/vbscript URLs and allows http/https', () => {
  const { toSafeHttpUrl } = load('src/lib/url-safety.ts');
  assert.equal(toSafeHttpUrl('javascript:alert(1)'), null);
  assert.equal(toSafeHttpUrl('  JAVASCRIPT:alert(1)  '), null);
  assert.equal(toSafeHttpUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(toSafeHttpUrl('vbscript:msgbox(1)'), null);
  assert.equal(toSafeHttpUrl('not a url'), null);
  assert.equal(toSafeHttpUrl(''), null);
  assert.equal(toSafeHttpUrl('https://maps.google.com/?q=Manila'), 'https://maps.google.com/?q=Manila');
  assert.equal(toSafeHttpUrl('http://example.com/album'), 'http://example.com/album');
});

test('domainSchema accepts valid hyphenated and digit subdomains and rejects invalid domains', () => {
  const { domainSchema } = load('src/lib/validations.ts', {
    '@/lib/currency': { SUPPORTED_CURRENCY_CODES: ['USD', 'PHP'] },
  });
  assert.equal(domainSchema.safeParse({ domain: 'www.anna-ben.com' }).success, true);
  assert.equal(domainSchema.safeParse({ domain: '2026.my-wedding.site' }).success, true);
  assert.equal(domainSchema.safeParse({ domain: 'x.co' }).success, true);
  assert.equal(domainSchema.safeParse({ domain: '-bad.com' }).success, false);
  assert.equal(domainSchema.safeParse({ domain: 'javascript:alert(1)' }).success, false);
});

test('getClientIP prefers trusted proxy headers over spoofed leftmost XFF and raises SEAT_CHECKIN limit', () => {
  const { getClientIP, RATE_LIMITS } = load('src/lib/rate-limiter.ts');
  const req1 = new Request('https://quickweds.site/api/seating/check-in', {
    headers: {
      'x-forwarded-for': '1.2.3.4, 198.51.100.25',
      'x-vercel-forwarded-for': '203.0.113.9',
    },
  });
  assert.equal(getClientIP(req1), '203.0.113.9');

  const req2 = new Request('https://quickweds.site/api/seating/check-in', {
    headers: {
      'x-forwarded-for': '1.2.3.4, 198.51.100.25',
    },
  });
  assert.equal(getClientIP(req2), '198.51.100.25');

  assert.ok(RATE_LIMITS.SEAT_CHECKIN.maxRequests >= 500);
  assert.ok(RATE_LIMITS.SEAT_LOOKUP.maxRequests >= 300);
});

test('app-review-auth fails closed without APP_REVIEW_SECRET and verifies valid signatures when configured', () => {
  const prev = process.env.APP_REVIEW_SECRET;
  try {
    delete process.env.APP_REVIEW_SECRET;
    const mod = load('src/lib/app-review-auth.ts', {
      '@/lib/site-url': { getPublicAppUrl: () => 'https://www.quickweds.site' },
      '@/lib/email': { sendEmail: async () => ({ success: true }) },
      '@/lib/admin': { getAdminEmails: () => ['admin@example.com'] },
      '@/lib/email-templates': { getAdminReviewNotificationHtml: () => ({ subject: 'x', html: '<p>x</p>' }) },
    });
    assert.throws(() => mod.signReviewAction('rev-1', 'approve', String(Date.now() + 60000)));
    assert.equal(mod.verifyReviewAction('rev-1', 'approve', String(Date.now() + 60000), 'a'.repeat(64)), false);

    process.env.APP_REVIEW_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef';
    const expires = String(Date.now() + 60000);
    const sig = mod.signReviewAction('rev-1', 'approve', expires);
    assert.equal(mod.verifyReviewAction('rev-1', 'approve', expires, sig), true);
    assert.equal(mod.verifyReviewAction('rev-1', 'reject', expires, sig), false);
  } finally {
    if (prev === undefined) delete process.env.APP_REVIEW_SECRET;
    else process.env.APP_REVIEW_SECRET = prev;
  }
});

test('google-calendar enforces CSRF nonce cookie, fails closed without secret, and round-trips AES-256-GCM tokens', () => {
  const prevState = process.env.GOOGLE_OAUTH_STATE_SECRET;
  const prevNextAuth = process.env.NEXTAUTH_SECRET;
  try {
    delete process.env.GOOGLE_OAUTH_STATE_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    const mod = load('src/lib/google-calendar.ts', {
      '@/lib/site-url': { getPublicAppUrl: () => 'https://www.quickweds.site' },
    });
    assert.throws(() => mod.createGoogleCalendarState({ weddingId: 'wed12345', userId: 'u1', nonce: 'n1' }));

    process.env.GOOGLE_OAUTH_STATE_SECRET = 'super-strong-google-oauth-state-secret-key';
    const nonce = mod.generateGoogleOAuthNonce();
    const state = mod.createGoogleCalendarState({ weddingId: 'wed12345', userId: 'u1', nonce });
    assert.equal(mod.verifyGoogleCalendarState(state, nonce).weddingId, 'wed12345');
    assert.throws(() => mod.verifyGoogleCalendarState(state, 'wrong-nonce'));
    assert.throws(() => mod.verifyGoogleCalendarState(state, null));
    assert.throws(() => mod.verifyGoogleCalendarState(`${state.split('.')[0]}.short`, nonce));

    const encrypted = mod.encryptGoogleToken('ya29.secret-refresh-token');
    assert.ok(encrypted.startsWith('enc:v1:'));
    assert.notEqual(encrypted, 'ya29.secret-refresh-token');
    assert.equal(mod.decryptGoogleToken(encrypted), 'ya29.secret-refresh-token');
    assert.equal(mod.decryptGoogleToken('legacy-plaintext-token'), 'legacy-plaintext-token');
  } finally {
    if (prevState === undefined) delete process.env.GOOGLE_OAUTH_STATE_SECRET;
    else process.env.GOOGLE_OAUTH_STATE_SECRET = prevState;
    if (prevNextAuth === undefined) delete process.env.NEXTAUTH_SECRET;
    else process.env.NEXTAUTH_SECRET = prevNextAuth;
  }
});

test('email-templates fixes modern-minimal header contrast, applies safeFont, and avoids double-escaped CTA URLs', () => {
  const thankYouMock = {
    getDefaultCoupleSignature: (b, g) => `${b} & ${g}`,
    getThankYouTemplate: (id) => ({
      id: id || 'modern-minimal',
      eyebrow: 'With Gratitude',
      supportsPhoto: false,
    }),
    normalizeThankYouPhotoUrl: () => '',
    normalizeThankYouStyle: () => ({
      accentColor: '#2F3A45',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }),
  };
  const { getThankYouNoteHtml, getCollaboratorInviteHtml } = load('src/lib/email-templates.ts', {
    '@/lib/thank-you-email': thankYouMock,
    './thank-you-email': thankYouMock,
  });

  const thankYouHtml = getThankYouNoteHtml({
    recipientName: 'Alex',
    brideName: 'Mia',
    groomName: 'Leo',
    templateId: 'modern-minimal',
    message: 'Thank you for coming!',
  });
  assert.ok(thankYouHtml.includes("font-family:'Cormorant Garamond', Georgia, serif"));
  assert.ok(thankYouHtml.includes('background-color:#FFFFFF;color:#2D2A2E;'));
  assert.ok(!thankYouHtml.includes('background-color:#FFFFFF;color:#ffffff'));

  const collabHtml = getCollaboratorInviteHtml({
    inviteeEmail: 'partner@example.com',
    role: 'partner',
    brideName: 'Mia',
    groomName: 'Leo',
    dashboardUrl: 'https://www.quickweds.site/dashboard?a=1&b=2',
  });
  assert.ok(collabHtml.includes('https://www.quickweds.site/dashboard?a=1&amp;b=2'));
  assert.ok(!collabHtml.includes('&amp;amp;'));
});

test('audit hardening SQL migration applies cleanly and protects ownership, soft-delete, and custom domain RPC', { skip: !process.env.PGLITE_MODULE }, async () => {
  const { PGlite } = await import(process.env.PGLITE_MODULE);
  const db = new PGlite();
  try {
    await db.exec(fs.readFileSync('tests/fixtures/audit-security-schema.sql', 'utf8'));
    await db.exec(fs.readFileSync('supabase/migrations/20261021162258_audit_access_and_moderation_guards.sql', 'utf8'));
    await db.exec(`
      ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS custom_domain text;
      ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS planner_only boolean DEFAULT false;
      ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
      ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';
      ALTER TABLE public.weddings ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'free';
    `);
    await db.exec(fs.readFileSync('supabase/migrations/20261125000000_audit_rls_storage_and_index_hardening.sql', 'utf8'));

    await db.exec(`
      INSERT INTO public.weddings(id, user_id, custom_domain, planner_only)
      VALUES
        ('wed-active', '00000000-0000-4000-8000-000000000001', 'annaandben.com', false),
        ('wed-deleted', '00000000-0000-4000-8000-000000000001', 'deleted.com', false);
      UPDATE public.weddings SET deleted_at = now() WHERE id = 'wed-deleted';
    `);

    const activeDomain = await db.query(`SELECT id FROM public.quickweds_lookup_custom_domain('ANNAANDBEN.COM')`);
    assert.deepEqual(activeDomain.rows, [{ id: 'wed-active' }]);

    const deletedDomain = await db.query(`SELECT id FROM public.quickweds_lookup_custom_domain('deleted.com')`);
    assert.deepEqual(deletedDomain.rows, []);

    // Verify non-service role cannot transfer ownership or resurrect a soft-deleted wedding
    await db.exec(`SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', false);`);
    await assert.rejects(
      () => db.exec(`UPDATE public.weddings SET user_id = '00000000-0000-4000-8000-000000000002' WHERE id = 'wed-active'`),
      /ownership/i
    );
    await assert.rejects(
      () => db.exec(`UPDATE public.weddings SET deleted_at = NULL WHERE id = 'wed-deleted'`),
      /restored/i
    );
  } finally {
    await db.close();
  }
});
