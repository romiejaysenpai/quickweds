import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const loadedModule = { exports: {} };
  vm.runInNewContext(code, { module: loadedModule, exports: loadedModule.exports, require: name => {
    if (!(name in imports)) throw new Error(`Unexpected dependency: ${name}`);
    return imports[name];
  } });
  return loadedModule.exports;
}
const references = load('src/lib/reference-invitations.ts');
const { getBuilderTheme, getInvitationTheme, colorLuminance } = load('src/lib/invitation-theme.ts', { './reference-invitations': references, './theme-engine': load('src/lib/theme-engine.ts') });
const ratio = (a, b) => (Math.max(colorLuminance(a), colorLuminance(b)) + .05) / (Math.min(colorLuminance(a), colorLuminance(b)) + .05);

test('every reference keeps readable actions and links across pale, dark, and saturated motifs', () => {
  for (const reference of references.REFERENCE_INVITATIONS) {
    for (const motif of ['#ffffff', '#000000', '#f4e9bf', '#182d37', '#ff0000', '#00ff00', '#224466']) {
      const { vars } = getInvitationTheme({ template: reference.templateId, template_style: reference.id, motif_color: motif });
      assert.equal(vars['--invitation-action'], motif);
      assert.ok(ratio(vars['--invitation-action'], vars['--invitation-on-action']) >= 4.5, `${reference.id}: ${motif}`);
      assert.ok(ratio(vars['--invitation-link'], vars['--invitation-paper']) >= 4.5, `${reference.id} link: ${motif}`);
    }
  }
});

test('reference themes honor explicit background/card/title choices and reject malformed color overrides', () => {
  const wedding = { template: 'elopement', template_style: 'reference-06', motif_color: '#abc', background_style: 'white', card_style: 'arch_panel', section_title_font_style: 'modern-sans' };
  const { vars } = getInvitationTheme(wedding);
  assert.equal(vars['--invitation-motif'], '#aabbcc');
  assert.equal(vars['--invitation-paper'], '#ffffff');
  assert.equal(vars['--invitation-card-radius'], '40px 40px 8px 8px');
  assert.equal(vars['--invitation-title-font'], 'var(--font-montserrat)');
  assert.equal(getInvitationTheme({ ...wedding, motif_color: 'url(unsafe)' }).vars['--invitation-motif'], '#102637');
});

test('themes do not override ordinary saved styles or mismatched template/style combinations', () => {
  assert.equal(getInvitationTheme({ template: 'minimal', template_style: 'reference-06' }), undefined);
  assert.equal(getInvitationTheme({ template: 'elopement', template_style: 'elopement_v2' }), undefined);
});

test('native templates resolve explicit paper and contrast without losing dark defaults', () => {
  const original = getBuilderTheme({ template: 'midnight' });
  const edited = getBuilderTheme({ template: 'midnight', background_style: 'white', motif_color: '#ffffff', card_style: 'arch_panel' });
  assert.equal(original['--builder-paper'], '#151315');
  assert.equal(edited['--builder-paper'], '#ffffff');
  assert.ok(ratio(edited['--builder-ink'], edited['--builder-paper']) >= 7);
  assert.ok(ratio(edited['--builder-action'], edited['--builder-on-action']) >= 4.5);
  assert.equal(edited['--builder-card-radius'], '40px 40px 8px 8px');
});

test('reference aliases retain each reference palette and geometry for shared controls', () => {
  for (const reference of references.REFERENCE_INVITATIONS) {
    const wedding = { template: reference.templateId, template_style: reference.id };
    const { vars } = getInvitationTheme(wedding);
    const builder = getBuilderTheme(wedding);
    for (const token of ['paper', 'ink', 'action', 'card-radius', 'button-radius']) assert.equal(builder[`--builder-${token}`], vars[`--invitation-${token}`]);
  }
});


test('public page gradient cannot paint over an explicit builder background', () => {
  const engine = load('src/lib/theme-engine.ts');
  const presentation = load('src/lib/invitation-theme.ts', { './reference-invitations': references, './theme-engine': engine });
  const { getWeddingPageStyle } = load('src/components/templates/TemplateRenderer.tsx', {
    'next/dynamic': { default: () => null }, 'react/jsx-runtime': {},
    '@/lib/invitation-theme': presentation, './InvitationTheme.module.css': { default: {} },
    '@/lib/reference-invitations': references, '@/lib/theme-engine': engine,
    '@/components/WeddingFontProvider': { FONT_STYLE_OVERRIDES: {}, getWeddingFontStyleVariables: () => ({}) },
  });
  for (const template of ['classic', 'luxury', 'cinematic']) {
    const white = getWeddingPageStyle({ template, background_style: 'white' }, { includeGradient: true });
    assert.equal(white.backgroundColor, '#FFFFFF');
    assert.ok(!white.backgroundImage || white.backgroundImage === 'none');
  }
});
