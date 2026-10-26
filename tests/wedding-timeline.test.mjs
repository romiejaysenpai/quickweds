import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const loadedModule = { exports: {} };
const code = ts.transpileModule(fs.readFileSync('src/lib/wedding-timeline.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(code, { module: loadedModule, exports: loadedModule.exports });
const { timelineIconKind } = loadedModule.exports;

test('custom schedules use icons matching familiar event labels regardless of position', () => {
  for (const [label, expected] of [['Dinner reception', 'meal'], ['First dance', 'music'], ['Wedding portraits', 'photo'], ['Ceremony', 'ceremony'], ['Cocktails and welcome drinks', 'drinks'], ['Cake cutting', 'celebration'], ['Cena', 'meal'], ['Банкет', 'meal'], ['Фотосессия', 'photo']]) {
    for (const position of [0, 2, 5]) assert.equal(timelineIconKind(label, position), expected);
  }
});
test('free-form event names retain a stable decorative fallback', () => {
  assert.equal(timelineIconKind('A special surprise', 0), 'ceremony');
  assert.equal(timelineIconKind('A special surprise', 6), 'ceremony');
  assert.equal(timelineIconKind('', -1), 'celebration');
});
