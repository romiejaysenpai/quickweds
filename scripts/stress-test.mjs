#!/usr/bin/env node

const baseUrl = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const durationMs = Number(process.env.STRESS_DURATION_MS || 20_000);
const concurrency = Number(process.env.STRESS_CONCURRENCY || 12);
const maxP95Ms = Number(process.env.STRESS_MAX_P95_MS || 1_500);
const maxErrorRate = Number(process.env.STRESS_MAX_ERROR_RATE || 0.01);
const minRequestsPerSecond = Number(process.env.STRESS_MIN_RPS || 8);
const weddingId = process.env.STRESS_WEDDING_ID;

const targets = [
  { path: '/', weight: 3, name: 'home' },
  { path: '/login', weight: 2, name: 'login' },
  { path: '/signup', weight: 2, name: 'signup' },
  { path: '/manifest.webmanifest', weight: 1, name: 'manifest' },
  { path: '/logo.png', weight: 1, name: 'logo' },
];

if (weddingId) {
  targets.push(
    { path: `/w/${weddingId}`, weight: 4, name: 'public wedding page' },
    { path: `/api/public/weddings/${weddingId}`, weight: 2, name: 'public wedding api' },
  );
}

const warmupRequests = Number(process.env.STRESS_WARMUP_REQUESTS || targets.length * 2);
const weightedTargets = targets.flatMap((target) => Array.from({ length: target.weight }, () => target));
const startedAt = Date.now();
const deadline = startedAt + durationMs;
const results = [];

function percentile(values, percentileValue) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1);
  return sorted[index];
}

function summarizeByTarget() {
  return targets.map((target) => {
    const targetResults = results.filter((result) => result.name === target.name);
    const durations = targetResults.map((result) => result.durationMs);
    const failures = targetResults.filter((result) => !result.ok);

    return {
      name: target.name,
      path: target.path,
      requests: targetResults.length,
      failures: failures.length,
      p50Ms: Math.round(percentile(durations, 50)),
      p95Ms: Math.round(percentile(durations, 95)),
      maxMs: Math.round(Math.max(0, ...durations)),
    };
  });
}

async function requestTarget(target) {
  const url = `${baseUrl}${target.path}`;
  const start = performance.now();

  try {
    const response = await fetch(url, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'QuickWeds predeploy stress test',
      },
    });
    const duration = performance.now() - start;
    const ok = response.status < 400;

    await response.arrayBuffer().catch(() => null);

    results.push({
      name: target.name,
      path: target.path,
      status: response.status,
      durationMs: duration,
      ok,
    });
  } catch (error) {
    results.push({
      name: target.name,
      path: target.path,
      status: 0,
      durationMs: performance.now() - start,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function pickTarget() {
  return weightedTargets[Math.floor(Math.random() * weightedTargets.length)];
}

async function worker() {
  while (Date.now() < deadline) {
    await requestTarget(pickTarget());
  }
}

async function assertBaseUrlIsReachable() {
  try {
    const response = await fetch(baseUrl, { redirect: 'manual' });
    if (response.status >= 500) {
      throw new Error(`received HTTP ${response.status}`);
    }
  } catch (error) {
    console.error(`Unable to reach ${baseUrl}. Start the app first or set BASE_URL to a preview/prod URL.`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

await assertBaseUrlIsReachable();

console.log(`QuickWeds stress test`);
console.log(`Base URL: ${baseUrl}`);
console.log(`Duration: ${durationMs}ms | Concurrency: ${concurrency}`);
console.log(`Budgets: p95 < ${maxP95Ms}ms | errors <= ${(maxErrorRate * 100).toFixed(1)}% | rps >= ${minRequestsPerSecond}`);
if (!weddingId) {
  console.log('Wedding routes: skipped. Set STRESS_WEDDING_ID to include public wedding page/API load.');
}

for (const target of targets) {
  await requestTarget(target);
}

for (let index = 0; index < warmupRequests; index += 1) {
  await requestTarget(weightedTargets[index % weightedTargets.length]);
}

results.length = 0;
const runStartedAt = Date.now();
await Promise.all(Array.from({ length: concurrency }, () => worker()));
const elapsedSeconds = Math.max(0.001, (Date.now() - runStartedAt) / 1000);

const durations = results.map((result) => result.durationMs);
const failures = results.filter((result) => !result.ok);
const totalRequests = results.length;
const p50Ms = Math.round(percentile(durations, 50));
const p95Ms = Math.round(percentile(durations, 95));
const maxMs = Math.round(Math.max(0, ...durations));
const rps = totalRequests / elapsedSeconds;
const errorRate = totalRequests === 0 ? 1 : failures.length / totalRequests;

console.table(summarizeByTarget());
console.log(
  JSON.stringify(
    {
      totalRequests,
      failures: failures.length,
      errorRate: Number(errorRate.toFixed(4)),
      rps: Number(rps.toFixed(2)),
      p50Ms,
      p95Ms,
      maxMs,
    },
    null,
    2,
  ),
);

if (failures.length > 0) {
  console.log('Sample failures:');
  console.table(failures.slice(0, 10).map(({ name, path, status, error }) => ({ name, path, status, error: error || '' })));
}

const failedBudgets = [];
if (errorRate > maxErrorRate) failedBudgets.push(`error rate ${(errorRate * 100).toFixed(2)}% > ${(maxErrorRate * 100).toFixed(2)}%`);
if (p95Ms > maxP95Ms) failedBudgets.push(`p95 ${p95Ms}ms > ${maxP95Ms}ms`);
if (rps < minRequestsPerSecond) failedBudgets.push(`rps ${rps.toFixed(2)} < ${minRequestsPerSecond}`);

if (failedBudgets.length > 0) {
  console.error(`Stress test failed: ${failedBudgets.join('; ')}`);
  process.exit(1);
}

console.log('Stress test passed.');
