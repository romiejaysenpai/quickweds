#!/usr/bin/env node

/**
 * QuickWeds 1000-Concurrent-User Stress Test
 *
 * Simulates realistic wedding-day traffic patterns with 4-stage ramp-up:
 *   Stage 1:   50 users  (warmup / smoke)
 *   Stage 2:  200 users  (moderate load)
 *   Stage 3:  500 users  (heavy load)
 *   Stage 4: 1000 users  (peak / stress)
 *
 * Usage:
 *   npm run test:stress:1000
 *   STRESS_WEDDING_ID=amanda-and-sayato-3a6409 npm run test:stress:1000
 *   BASE_URL=https://quickweds.site npm run test:stress:1000
 */

const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const weddingId = process.env.STRESS_WEDDING_ID || 'amanda-and-sayato-3a6409';
const requestTimeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || 15_000);

// ── Endpoints ────────────────────────────────────────────────────────

const ENDPOINTS = {
  // Public pages (weight = relative frequency within a stage)
  pages: [
    { name: 'home',      path: '/',       weight: 4, type: 'page' },
    { name: 'login',     path: '/login',  weight: 2, type: 'page' },
    { name: 'signup',    path: '/signup', weight: 2, type: 'page' },
    { name: 'templates', path: '/templates', weight: 2, type: 'page' },
    { name: 'suppliers', path: '/suppliers', weight: 1, type: 'page' },
  ],

  // Public wedding page + API
  wedding: [
    { name: 'wedding-page',     path: `/w/${weddingId}`,                    weight: 5, type: 'page' },
    { name: 'wedding-api',      path: `/api/public/weddings/${weddingId}`,  weight: 3, type: 'api-read' },
  ],

  // Static assets
  assets: [
    { name: 'manifest',  path: '/manifest.webmanifest', weight: 1, type: 'asset' },
    { name: 'favicon',   path: '/icons/favicon-32.png', weight: 1, type: 'asset' },
  ],

  // API reads
  apiReads: [
    { name: 'guest-book-read',  path: `/api/public/guest-book?weddingId=${weddingId}`, weight: 2, type: 'api-read' },
    { name: 'photos-read',      path: `/api/public/photos/${weddingId}`,               weight: 2, type: 'api-read' },
  ],
};

// ── Ramp-up stages ──────────────────────────────────────────────────

const stages = [
  {
    name: 'warmup',
    concurrency: 50,
    durationMs: 15_000,
    endpoints: [...ENDPOINTS.pages, ...ENDPOINTS.wedding, ...ENDPOINTS.assets],
    budgets: { maxP95Ms: 2000, maxErrorRate: 0.02, minRps: 20 },
  },
  {
    name: 'moderate',
    concurrency: 200,
    durationMs: 20_000,
    endpoints: [...ENDPOINTS.pages, ...ENDPOINTS.wedding, ...ENDPOINTS.apiReads, ...ENDPOINTS.assets],
    budgets: { maxP95Ms: 3000, maxErrorRate: 0.03, minRps: 50 },
  },
  {
    name: 'heavy',
    concurrency: 500,
    durationMs: 25_000,
    endpoints: [...ENDPOINTS.pages, ...ENDPOINTS.wedding, ...ENDPOINTS.apiReads],
    budgets: { maxP95Ms: 5000, maxErrorRate: 0.05, minRps: 80 },
  },
  {
    name: 'peak-1000',
    concurrency: 1000,
    durationMs: 30_000,
    endpoints: [...ENDPOINTS.pages, ...ENDPOINTS.wedding, ...ENDPOINTS.apiReads, ...ENDPOINTS.assets],
    budgets: { maxP95Ms: 8000, maxErrorRate: 0.10, minRps: 60 },
  },
];

// ── Helpers ──────────────────────────────────────────────────────────

function percentile(values, pct) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((pct / 100) * sorted.length) - 1);
  return sorted[idx];
}

function buildWeightedPool(endpoints) {
  return endpoints.flatMap((ep) => Array.from({ length: ep.weight }, () => ep));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatMs(ms) {
  return `${Math.round(ms)}ms`;
}

function formatRate(rate) {
  return `${(rate * 100).toFixed(2)}%`;
}

// ── Request runner ───────────────────────────────────────────────────

async function makeRequest(endpoint) {
  const url = `${baseUrl}${endpoint.path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  const start = performance.now();

  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'QuickWeds-StressTest/1000',
        'Accept': 'text/html,application/json',
      },
    });

    // Consume body to release connection
    await res.arrayBuffer().catch(() => null);
    const duration = performance.now() - start;

    return {
      name: endpoint.name,
      type: endpoint.type,
      status: res.status,
      ok: res.status < 400,
      rateLimited: res.status === 429,
      cacheStatus: res.headers.get('x-quickweds-cache') || res.headers.get('x-cache') || '',
      cacheControl: res.headers.get('cache-control') || '',
      durationMs: duration,
    };
  } catch (err) {
    return {
      name: endpoint.name,
      type: endpoint.type,
      status: 0,
      ok: false,
      rateLimited: false,
      cacheStatus: '',
      cacheControl: '',
      durationMs: performance.now() - start,
      error: err instanceof Error ? err.name : String(err),
    };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Stage runner ─────────────────────────────────────────────────────

async function runStage(stage) {
  const pool = buildWeightedPool(stage.endpoints);
  const results = [];
  const deadline = Date.now() + stage.durationMs;

  const worker = async () => {
    while (Date.now() < deadline) {
      const ep = pickRandom(pool);
      results.push(await makeRequest(ep));
    }
  };

  const stageStart = Date.now();
  await Promise.all(Array.from({ length: stage.concurrency }, () => worker()));
  const elapsed = (Date.now() - stageStart) / 1000;

  return summarize(results, elapsed, stage);
}

function summarize(results, elapsedSec, stage) {
  const durations = results.map((r) => r.durationMs);
  const failures = results.filter((r) => !r.ok);
  const rateLimited = results.filter((r) => r.rateLimited);
  const timeouts = results.filter((r) => r.error === 'AbortError');
  const connectionErrors = results.filter((r) => r.error && r.error !== 'AbortError');

  const totalRequests = results.length;
  const errorRate = totalRequests === 0 ? 1 : failures.length / totalRequests;
  const rps = totalRequests / Math.max(0.001, elapsedSec);

  // Per-endpoint breakdown
  const byEndpoint = {};
  for (const r of results) {
    if (!byEndpoint[r.name]) {
      byEndpoint[r.name] = { requests: 0, failures: 0, rateLimited: 0, durations: [], cacheHits: 0 };
    }
    const entry = byEndpoint[r.name];
    entry.requests += 1;
    if (!r.ok) entry.failures += 1;
    if (r.rateLimited) entry.rateLimited += 1;
    if (r.cacheStatus.toUpperCase().includes('HIT')) entry.cacheHits += 1;
    entry.durations.push(r.durationMs);
  }

  const endpointTable = Object.entries(byEndpoint).map(([name, data]) => ({
    endpoint: name,
    requests: data.requests,
    failures: data.failures,
    '429s': data.rateLimited,
    cacheHits: data.cacheHits,
    p50: formatMs(percentile(data.durations, 50)),
    p95: formatMs(percentile(data.durations, 95)),
    max: formatMs(Math.max(0, ...data.durations)),
  }));

  return {
    stage: stage.name,
    concurrency: stage.concurrency,
    durationSec: Math.round(elapsedSec),
    totalRequests,
    rps: Number(rps.toFixed(1)),
    failures: failures.length,
    errorRate: Number(errorRate.toFixed(4)),
    rateLimited: rateLimited.length,
    timeouts: timeouts.length,
    connectionErrors: connectionErrors.length,
    p50Ms: Math.round(percentile(durations, 50)),
    p95Ms: Math.round(percentile(durations, 95)),
    p99Ms: Math.round(percentile(durations, 99)),
    maxMs: Math.round(Math.max(0, ...durations)),
    endpointTable,
    budgets: stage.budgets,
  };
}

// ── Reachability check ───────────────────────────────────────────────

async function assertReachable() {
  try {
    const res = await fetch(baseUrl, { redirect: 'manual' });
    if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(`\n❌ Cannot reach ${baseUrl}. Start the app first or set BASE_URL.\n`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

// ── Budget check ─────────────────────────────────────────────────────

function checkBudgets(result) {
  const failed = [];
  const b = result.budgets;
  if (result.errorRate > b.maxErrorRate) {
    failed.push(`error rate ${formatRate(result.errorRate)} > ${formatRate(b.maxErrorRate)}`);
  }
  if (result.p95Ms > b.maxP95Ms) {
    failed.push(`p95 ${result.p95Ms}ms > ${b.maxP95Ms}ms`);
  }
  if (result.rps < b.minRps) {
    failed.push(`rps ${result.rps} < ${b.minRps}`);
  }
  return failed;
}

// ── Main ─────────────────────────────────────────────────────────────

await assertReachable();

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║         QuickWeds 1000-User Stress Test                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`Base URL:   ${baseUrl}`);
console.log(`Wedding:    ${weddingId}`);
console.log(`Timeout:    ${requestTimeoutMs}ms`);
console.log(`Stages:     ${stages.map((s) => `${s.name}(${s.concurrency})`).join(' → ')}`);
console.log('');

const allResults = [];
let anyBudgetFailed = false;

for (const stage of stages) {
  console.log(`\n━━━ Stage: ${stage.name} | ${stage.concurrency} concurrent users | ${stage.durationMs / 1000}s ━━━`);

  const memBefore = process.memoryUsage();
  const result = await runStage(stage);
  const memAfter = process.memoryUsage();
  const memDeltaMb = Math.round((memAfter.rss - memBefore.rss) / 1024 / 1024);

  console.log(`\n  Requests:   ${result.totalRequests} (${result.rps} rps)`);
  console.log(`  Failures:   ${result.failures} (${formatRate(result.errorRate)})`);
  console.log(`  Rate-limited (429):  ${result.rateLimited}`);
  console.log(`  Timeouts:   ${result.timeouts}`);
  console.log(`  Conn errors: ${result.connectionErrors}`);
  console.log(`  Latency:    p50=${result.p50Ms}ms  p95=${result.p95Ms}ms  p99=${result.p99Ms}ms  max=${result.maxMs}ms`);
  console.log(`  Memory Δ:   ${memDeltaMb >= 0 ? '+' : ''}${memDeltaMb} MB`);

  console.log('\n  Per-endpoint breakdown:');
  console.table(result.endpointTable);

  const budgetFailures = checkBudgets(result);
  if (budgetFailures.length > 0) {
    console.log(`  ⚠️  Budget violations: ${budgetFailures.join('; ')}`);
    anyBudgetFailed = true;
  } else {
    console.log('  ✅ All budgets passed');
  }

  allResults.push({ ...result, memDeltaMb });

  // Brief cooldown between stages (let connections drain)
  if (stage !== stages.at(-1)) {
    console.log('  ⏳ Cooldown 3s...');
    await new Promise((r) => setTimeout(r, 3000));
  }
}

// ── Final summary ────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                    FINAL SUMMARY                            ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

const summaryTable = allResults.map((r) => ({
  stage: r.stage,
  concurrency: r.concurrency,
  requests: r.totalRequests,
  rps: r.rps,
  errors: `${r.failures} (${formatRate(r.errorRate)})`,
  '429s': r.rateLimited,
  p50: `${r.p50Ms}ms`,
  p95: `${r.p95Ms}ms`,
  max: `${r.maxMs}ms`,
  memΔ: `${r.memDeltaMb}MB`,
}));
console.table(summaryTable);

const totalRequests = allResults.reduce((sum, r) => sum + r.totalRequests, 0);
const totalFailures = allResults.reduce((sum, r) => sum + r.failures, 0);
const totalRateLimited = allResults.reduce((sum, r) => sum + r.rateLimited, 0);
const peakP95 = Math.max(...allResults.map((r) => r.p95Ms));
const peakRps = Math.max(...allResults.map((r) => r.rps));

console.log(`\nTotal requests:     ${totalRequests}`);
console.log(`Total failures:     ${totalFailures} (${formatRate(totalRequests ? totalFailures / totalRequests : 0)})`);
console.log(`Total rate-limited: ${totalRateLimited}`);
console.log(`Peak p95 latency:   ${peakP95}ms`);
console.log(`Peak RPS:           ${peakRps}`);

// Output machine-readable JSON
console.log('\nRESULTS_JSON');
console.log(JSON.stringify({
  baseUrl,
  weddingId,
  timestamp: new Date().toISOString(),
  totalRequests,
  totalFailures,
  totalRateLimited,
  peakP95Ms: peakP95,
  peakRps,
  stages: allResults.map(({ endpointTable, budgets, ...rest }) => rest),
}, null, 2));

if (anyBudgetFailed) {
  console.log('\n❌ Stress test completed with budget violations.');
  process.exit(1);
} else {
  console.log('\n✅ Stress test passed — all stages within budget.');
}
