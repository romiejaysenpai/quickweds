const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const weddingId = process.env.WEDDING_ID || '0cdd2b2d';
const profile = process.env.STRESS_PROFILE || 'local';
const requestTimeoutMs = Number(process.env.REQUEST_TIMEOUT_MS || 15000);

const endpointSets = {
  pages: [
    { name: 'landing', path: '/' },
    { name: 'login', path: '/login' },
    { name: 'signup', path: '/signup' },
    { name: 'builder', path: '/builder' },
    { name: 'suppliers', path: '/suppliers' },
  ],
  publicWedding: [
    { name: 'public-wedding-api', path: `/api/public/weddings/${weddingId}` },
    { name: 'public-wedding-page', path: `/w/${weddingId}` },
  ],
  mixedRead: [
    { name: 'landing', path: '/' },
    { name: 'suppliers', path: '/suppliers' },
    { name: 'public-wedding-api', path: `/api/public/weddings/${weddingId}` },
    { name: 'public-wedding-page', path: `/w/${weddingId}` },
  ],
};

const profiles = {
  local: [
    { name: 'smoke-pages', durationMs: 15000, concurrency: 5, endpoints: endpointSets.pages },
    { name: 'balanced-public-read', durationMs: 30000, concurrency: 25, endpoints: endpointSets.mixedRead },
    { name: 'spike-public-read', durationMs: 20000, concurrency: 75, endpoints: endpointSets.mixedRead },
  ],
  'production-safe': [
    { name: 'prod-smoke-pages', durationMs: 10000, concurrency: 3, endpoints: endpointSets.pages },
    { name: 'prod-balanced-public-read', durationMs: 20000, concurrency: 10, endpoints: endpointSets.mixedRead },
    { name: 'prod-controlled-spike-read', durationMs: 15000, concurrency: 30, endpoints: endpointSets.mixedRead },
  ],
};

const stages = profiles[profile] || profiles.local;

function percentile(values, target) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((target / 100) * sorted.length) - 1);
  return sorted[index];
}

function summarize(samples) {
  const durations = samples.map((sample) => sample.durationMs);
  const failures = samples.filter((sample) => !sample.ok);
  const byEndpoint = new Map();

  for (const sample of samples) {
    const current = byEndpoint.get(sample.name) || {
      requests: 0,
      failures: 0,
      cacheStatuses: {},
      statuses: {},
      durations: [],
    };
    current.requests += 1;
    current.failures += sample.ok ? 0 : 1;
    if (sample.cacheStatus) {
      current.cacheStatuses[sample.cacheStatus] = (current.cacheStatuses[sample.cacheStatus] || 0) + 1;
    }
    current.statuses[sample.status] = (current.statuses[sample.status] || 0) + 1;
    current.durations.push(sample.durationMs);
    byEndpoint.set(sample.name, current);
  }

  return {
    requests: samples.length,
    failures: failures.length,
    errorRate: samples.length ? failures.length / samples.length : 0,
    rps: samples.length ? samples.length / ((samples.at(-1).endedAt - samples[0].startedAt) / 1000) : 0,
    p50: percentile(durations, 50),
    p95: percentile(durations, 95),
    p99: percentile(durations, 99),
    max: durations.length ? Math.max(...durations) : 0,
    byEndpoint: Object.fromEntries([...byEndpoint.entries()].map(([name, data]) => [
      name,
      {
        requests: data.requests,
        failures: data.failures,
        errorRate: data.requests ? data.failures / data.requests : 0,
        statuses: data.statuses,
        cacheStatuses: data.cacheStatuses,
        p95: percentile(data.durations, 95),
        max: Math.max(...data.durations),
      },
    ])),
  };
}

async function request(endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(new URL(endpoint.path, baseUrl), {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'User-Agent': 'QuickWedsLocalStress/1.0',
      },
    });

    await response.arrayBuffer();
    const endedAt = Date.now();
    return {
      name: endpoint.name,
      cacheStatus: response.headers.get('x-quickweds-cache') || '',
      status: response.status,
      ok: response.status >= 200 && response.status < 400,
      durationMs: endedAt - startedAt,
      startedAt,
      endedAt,
    };
  } catch (error) {
    const endedAt = Date.now();
    return {
      name: endpoint.name,
      cacheStatus: '',
      status: error instanceof Error ? error.name : 'error',
      ok: false,
      durationMs: endedAt - startedAt,
      startedAt,
      endedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function runStage(stage) {
  const samples = [];
  const deadline = Date.now() + stage.durationMs;
  let nextEndpointIndex = 0;

  const worker = async () => {
    while (Date.now() < deadline) {
      const endpoint = stage.endpoints[nextEndpointIndex % stage.endpoints.length];
      nextEndpointIndex += 1;
      samples.push(await request(endpoint));
    }
  };

  await Promise.all(Array.from({ length: stage.concurrency }, worker));
  return summarize(samples);
}

console.log(JSON.stringify({
  baseUrl,
  weddingId,
  profile,
  requestTimeoutMs,
  startedAt: new Date().toISOString(),
  stages: stages.map(({ name, durationMs, concurrency, endpoints }) => ({
    name,
    durationSeconds: durationMs / 1000,
    concurrency,
    endpoints: endpoints.map((endpoint) => endpoint.path),
  })),
}, null, 2));

const results = [];
for (const stage of stages) {
  console.log(`\nRunning ${stage.name}: ${stage.concurrency} concurrent clients for ${stage.durationMs / 1000}s`);
  const beforeMemory = process.memoryUsage();
  const result = await runStage(stage);
  const afterMemory = process.memoryUsage();
  results.push({
    stage: stage.name,
    concurrency: stage.concurrency,
    durationSeconds: stage.durationMs / 1000,
    memoryDeltaMb: Math.round((afterMemory.rss - beforeMemory.rss) / 1024 / 1024),
    ...result,
  });
  console.log(JSON.stringify(results.at(-1), null, 2));
}

console.log('\nSUMMARY_JSON');
console.log(JSON.stringify({ baseUrl, weddingId, profile, results }, null, 2));
