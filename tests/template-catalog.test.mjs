import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(code, { module: loadedModule, exports: loadedModule.exports, require: name => {
    if (!(name in imports)) throw new Error(`Unexpected dependency: ${name}`);
    return imports[name];
  } });
  return loadedModule.exports;
}
const theme = load('src/lib/theme-engine.ts');
const references = load('src/lib/reference-invitations.ts');
const catalog = load('src/lib/template-catalog.ts', { './theme-engine': theme, './reference-invitations': references });

test('every catalog design is discoverable in at least one style category', () => {
  const ids = catalog.TEMPLATES.map(template => template.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.ok(['classic', 'modern', 'romantic', 'destination', 'bold'].some(filter => catalog.templateMatchesFilter(id, filter)), id);
  }
});

test('new stationery templates remain free, have preview assets and rank for relevant preferences', () => {
  for (const [id, preference] of [['love-letter', { venue: 'intimate' }], ['butter-blue', { mood: 'playful' }], ['ribbon-romance', { mood: 'soft' }]]) {
    const item = catalog.TEMPLATES.find(template => template.id === id);
    assert.equal(item.tier, 'free');
    assert.ok(catalog.FREE_TEMPLATE_IDS.includes(id));
    assert.ok(fs.existsSync(`public${item.image}`));
    assert.ok(catalog.recommendTemplateIds(preference).includes(id));
  }
});


test('all 50 references are selectable under an existing template without displacing saved styles', () => {
  assert.equal(references.REFERENCE_INVITATIONS.length, 50);
  assert.equal(new Set(references.REFERENCE_INVITATIONS.map(item => item.id)).size, 50);
  for (const reference of references.REFERENCE_INVITATIONS) {
    assert.ok(catalog.TEMPLATES.some(item => item.id === reference.templateId));
    assert.ok(catalog.getTemplateStyleVariants(reference.templateId).some(item => item.id === reference.id));
    assert.equal(catalog.isTemplateStyleAvailable(reference.templateId, reference.id), true);
    assert.ok(catalog.getTemplateStyleLabel(reference.id).includes(reference.name));
    assert.equal(catalog.getTemplateStyleVariants(reference.templateId).filter(item => !item.id.startsWith('reference-')).length, 5);
  }
  assert.equal(catalog.isTemplateStyleAvailable('minimal', 'reference-01'), false);
});

test('second collection contains all 20 source references with available artwork and editable defaults', () => {
  const additions = references.REFERENCE_INVITATIONS.filter(item => item.reference >= 31);
  assert.equal(additions.length, 20);
  assert.equal(new Set(additions.map(item => item.sourceImage)).size, 20);
  for (const item of additions) {
    assert.ok(item.sourceImage.endsWith('.jpg'));
    assert.ok(item.fontStyle);
    assert.ok(['default', 'romantic-script'].includes(item.titleFontStyle));
    if (item.artwork) assert.ok(fs.existsSync(`public${item.artwork}`), item.artwork);
  }
});
