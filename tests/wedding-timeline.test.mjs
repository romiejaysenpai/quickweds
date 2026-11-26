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

function loadSmartCalendar() {
  const smartCalendarModule = { exports: {} };
  const smartCalendarCode = ts.transpileModule(
    fs.readFileSync('src/components/wedding/SmartCalendar.tsx', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }
  ).outputText;
  const mocks = {
    'react/jsx-runtime': { jsx: () => null, jsxs: () => null },
    react: { useState: () => [false, () => {}], useRef: () => ({ current: null }), useEffect: () => {} },
    'framer-motion': { motion: { button: 'button', div: 'div' } },
    'lucide-react': { Calendar: () => null, ChevronDown: () => null },
  };
  vm.runInNewContext(smartCalendarCode, {
    module: smartCalendarModule,
    exports: smartCalendarModule.exports,
    Date,
    require: (name) => mocks[name] || {},
  });
  return smartCalendarModule.exports;
}

test('SmartCalendar parses valid wedding date/time and rejects invalid calendar dates', () => {
  const { parseWeddingStartDateTime, formatLocalCalendarDateTime } = loadSmartCalendar();
  const parsed = parseWeddingStartDateTime('2027-06-15', '2:30 PM');
  assert.ok(parsed instanceof Date);
  assert.equal(formatLocalCalendarDateTime(parsed), '20270615T143000');
  assert.equal(parseWeddingStartDateTime('2027-02-31', '2:30 PM'), null);
  assert.equal(parseWeddingStartDateTime('', '2:30 PM'), null);
  const fallbackTime = parseWeddingStartDateTime('2027-06-15', '25:99');
  assert.ok(fallbackTime instanceof Date);
  assert.equal(formatLocalCalendarDateTime(fallbackTime), '20270615T100000');
});

test('SmartCalendar builds RFC 5545 compliant ICS and Google/Apple/Outlook links without UTC shift', () => {
  const { escapeIcsText, buildSmartCalendarLinks } = loadSmartCalendar();
  assert.equal(escapeIcsText('Garden Hall, 123 Main St; Suite 2\nFloor 3'), 'Garden Hall\\, 123 Main St\\; Suite 2\\nFloor 3');

  const links = buildSmartCalendarLinks(
    {
      bride_name: 'Elena',
      groom_name: 'Marco',
      wedding_date: '2027-06-15',
      wedding_time: '2:30 PM',
      venue_name: 'Villa Sol',
      venue_address: '123 Ocean Ave, Suite 4; Big Sur, CA',
    },
    new Date('2026-11-15T00:00:00.000Z')
  );
  assert.ok(links);
  assert.ok(links.google.includes('dates=20270615T143000/20270615T203000'));
  assert.ok(!links.google.includes('20270615T143000Z'));
  assert.ok(links.outlook.startsWith('https://outlook.live.com/calendar/0/deeplink/compose'));
  assert.ok(links.outlook.includes('startdt=2027-06-15T14%3A30%3A00'));
  assert.ok(links.outlook.includes('enddt=2027-06-15T20%3A30%3A00'));

  assert.ok(links.apple.startsWith('data:text/calendar;charset=utf-8,'));
  const ics = decodeURIComponent(links.apple.slice('data:text/calendar;charset=utf-8,'.length));
  assert.ok(ics.includes('\r\n'));
  assert.ok(ics.includes('UID:elena-marco-20270615T143000@quickweds.site\r\n'));
  assert.ok(ics.includes('DTSTAMP:20261115T000000Z\r\n'));
  assert.ok(ics.includes('DTSTART:20270615T143000\r\n'));
  assert.ok(ics.includes('DTEND:20270615T203000\r\n'));
  assert.ok(ics.includes('LOCATION:123 Ocean Ave\\, Suite 4\\; Big Sur\\, CA\r\n'));
});
