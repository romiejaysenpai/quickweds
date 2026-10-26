import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('builder upsert retry handles missing planner_only column and schema cache errors gracefully', () => {
  const code = ts.transpileModule(fs.readFileSync('src/components/BuilderForm.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const loadedModule = { exports: {} };
  const reactMock = {
    memo: (fn) => fn,
    useState: () => [null, () => {}],
    useEffect: () => {},
    useRef: () => ({ current: null }),
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
  };
  const mockContext = {
    module: loadedModule,
    exports: loadedModule.exports,
    require: (mod) => {
      if (mod === 'react') return reactMock;
      return {};
    },
    process: { env: {} },
    console,
  };
  vm.runInNewContext(code, mockContext);
  const { isMissingOptionalWeddingColumnError, getMissingWeddingColumnName } = loadedModule.exports;

  assert.ok(typeof isMissingOptionalWeddingColumnError === 'function', 'isMissingOptionalWeddingColumnError must be a function');
  assert.ok(typeof getMissingWeddingColumnName === 'function', 'getMissingWeddingColumnName must be a function');

  // Exact PostgREST schema cache error reported by user
  const schemaCacheError = {
    code: 'PGRST204',
    message: "Could not find the 'planner_only' column of 'weddings' in the schema cache",
    details: null,
    hint: null,
  };

  assert.equal(
    isMissingOptionalWeddingColumnError(schemaCacheError, 'planner_only'),
    true,
    'Must identify planner_only from PostgREST schema cache error'
  );

  assert.equal(
    getMissingWeddingColumnName(schemaCacheError),
    'planner_only',
    'Must extract planner_only column name from schema cache error'
  );

  // PostgreSQL 42703 error
  const postgresError = {
    code: '42703',
    message: 'column weddings.planner_only does not exist',
  };

  assert.equal(
    isMissingOptionalWeddingColumnError(postgresError, 'planner_only'),
    true,
    'Must identify planner_only from postgres 42703 error'
  );

  assert.equal(
    getMissingWeddingColumnName(postgresError),
    'planner_only',
    'Must extract column name from postgres 42703 error'
  );

  // Unrelated error should not match
  const unrelatedError = {
    code: '23505',
    message: 'duplicate key value violates unique constraint',
  };
  assert.equal(isMissingOptionalWeddingColumnError(unrelatedError, 'planner_only'), false);
  assert.equal(getMissingWeddingColumnName(unrelatedError), null);
});
