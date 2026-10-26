import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(code, { module: loadedModule, exports: loadedModule.exports });
  return loadedModule.exports;
}
const selection = load('src/lib/builder-design-selection.ts');
const { REFERENCE_INVITATIONS } = load('src/lib/reference-invitations.ts');
const plain = value => JSON.parse(JSON.stringify(value));

test('all reference selections preserve explicitly customized design and wedding content', () => {
  const previous = {
    template: 'classic', templateStyle: 'classic_v3', motifColor: '#123456', fontStyle: 'Modern', sectionTitleFontStyle: 'romantic-script',
    designCustomization: selection.PRESERVED_DESIGN,
    brideName: 'Amelia', groomName: 'Mateo', story: 'Our story', galleryLayout: 'masonry',
    backgroundStyle: 'cream', cardStyle: 'arch', sectionTitleColorStyle: 'sunset',
    logoInitials: 'AM', logoColor: '#abcdef', weddingParty: [{ name: 'Family', role: 'Sponsor' }],
    dressCodeNotes: 'Garden attire', isThankYouMode: true, showPhotosInThankYouMode: false,
  };
  for (const reference of REFERENCE_INVITATIONS) {
    const next = selection.selectBuilderReference(previous, reference);
    assert.equal(next.template, reference.templateId);
    assert.equal(next.templateStyle, reference.id);
    for (const key of Object.keys(previous).filter(key => !['template', 'templateStyle'].includes(key))) {
      assert.deepEqual(plain(next[key]), plain(previous[key]), `${reference.id}: ${key}`);
    }
  }
});

test('untouched design settings adopt reference defaults while individual overrides survive', () => {
  const previous = { motifColor: '#C08081', fontStyle: 'Elegant', sectionTitleFontStyle: 'default', designCustomization: selection.UNCUSTOMIZED_DESIGN };
  for (const reference of REFERENCE_INVITATIONS) {
    const next = selection.selectBuilderReference(previous, reference);
    assert.equal(next.motifColor, reference.accent);
    assert.equal(next.fontStyle, reference.fontStyle || previous.fontStyle);
    const customized = selection.selectBuilderReference({ ...next, motifColor: '#000000', designCustomization: { ...selection.UNCUSTOMIZED_DESIGN, motifColor: true } }, reference);
    assert.equal(customized.motifColor, '#000000');
  }
});

test('legacy drafts and saved weddings conservatively retain existing custom values', () => {
  const previous = { motifColor: '#C08081', fontStyle: 'Elegant', sectionTitleFontStyle: 'default' };
  const next = selection.selectBuilderReference(previous, REFERENCE_INVITATIONS[30]);
  assert.equal(next.motifColor, previous.motifColor);
  assert.equal(next.fontStyle, previous.fontStyle);
  assert.deepEqual(plain(selection.readBuilderDesignCustomization(undefined)), plain(selection.PRESERVED_DESIGN));
});

test('preview and save agree on thank-you photo and guestbook visibility and recap style', () => {
  assert.deepEqual(plain(selection.getBuilderRecapSettings({ showPhotosInThankYouMode: false, showGuestbookInThankYouMode: false, photoRecapStyle: 'grid' })), {
    show_photos_in_thank_you_mode: false, show_guestbook_in_thank_you_mode: false, photo_recap_style: 'grid',
  });
  assert.deepEqual(plain(selection.getBuilderRecapSettings({})), {
    show_photos_in_thank_you_mode: true, show_guestbook_in_thank_you_mode: true, photo_recap_style: 'polaroid',
  });
  for (const file of ['src/components/BuilderForm.tsx', 'src/components/LivePreview.tsx']) {
    assert.match(fs.readFileSync(file, 'utf8'), /\.\.\.getBuilderRecapSettings\(formData\)/, file);
  }
});

test('all saved builder content/style fields are present in the live preview contract', () => {
  const findObject = (file, predicate) => {
    const tree = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let result;
    const walk = node => { if (predicate(node)) result = node.initializer; ts.forEachChild(node, walk); };
    walk(tree);
    assert.ok(result && ts.isObjectLiteralExpression(result), file);
    return result;
  };
  const save = findObject('src/components/BuilderForm.tsx', node => ts.isVariableDeclaration(node) && node.name.getText() === 'payload');
  const preview = findObject('src/components/LivePreview.tsx', node => ts.isPropertyAssignment(node) && node.name.getText() === 'wedding');
  const keys = object => object.properties.filter(ts.isPropertyAssignment).map(property => property.name.getText());
  const previewKeys = new Set(keys(preview));
  for (const key of keys(save)) assert.ok(previewKeys.has(key), `Saved ${key} is absent from preview`);
});
