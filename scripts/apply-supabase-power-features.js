/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sqlPath = path.join(process.cwd(), 'supabase-power-features.sql');
const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing SUPABASE_DB_URL or DATABASE_URL environment variable.');
  process.exit(1);
}

if (!fs.existsSync(sqlPath)) {
  console.error(`Migration file not found: ${sqlPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');

(async () => {
  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log(`Applying migration from ${sqlPath}...`);
    await client.query(sql);
    console.log('Migration applied successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
