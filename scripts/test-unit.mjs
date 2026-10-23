import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
// Database security tests must execute rather than silently skip in a normal run.
const databaseModule =
  process.env.PGLITE_MODULE ||
  pathToFileURL(require.resolve("@electric-sql/pglite")).href;
const files = readdirSync("tests")
  .filter((name) => name.endsWith(".test.mjs"))
  .map((name) => `tests/${name}`);
const result = spawnSync(process.execPath, ["--test", ...files], {
  stdio: "inherit",
  env: { ...process.env, PGLITE_MODULE: databaseModule },
});
process.exit(result.status ?? 1);
