const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDate, cleanHeader, parseCSV, summarizeSessions, mergeSessions } = require('../swim-logic.js');

test('cleans Notion CSV headers including BOM, whitespace and underscores', () => {
  assert.equal(cleanHeader('\uFEFF Distance__ (m) '), 'distance (m)');
});

test('parses completed pool swims and filters other session types and statuses', () => {
  const csv = 'Date,Distance (m),Session type,Status,Session,Session ID\n' +
    '2026-10-20,2400,Swim - pool,Completed,AM swim,A1\n' +
    '2026-10-21,1800,Swim - pool,Planned,Planned swim,A2\n' +
    '2026-10-22,5000,Gym,Completed,Gym session,G1\n' +
    '2026-10-23,0,Swim - pool,Completed,Zero distance,A3\n' +
    'not-a-date,1500,Swim - pool,Completed,Invalid date,A4\n';
  const result = parseCSV(csv);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { date: '2026-10-20', distance: 2400, title: 'AM swim', id: 'A1', type: 'Swim - pool', status: 'Completed' });
});

test('parses quoted CSV cells with commas, escaped quotes and embedded line breaks', () => {
  const csv = 'Date,Distance (m),Session type,Status,Session,Session ID\n' +
    '2026-10-20,2400,Swim - pool,Completed,"Morning, \'fast\' swim",A1\n' +
    '2026-10-21,1800,Swim - pool,Completed,"A ""quoted"" title",A2\n' +
    '2026-10-22,1200,Swim - pool,Completed,"Line one\nLine two",A3\n';
  const result = parseCSV(csv);
  assert.equal(result.length, 3);
  assert.equal(result[0].title, "Morning, 'fast' swim");
  assert.equal(result[1].title, 'A "quoted" title');
  assert.equal(result[2].title, 'Line one\nLine two');
});

test('accepts supported date formats and rejects invalid dates', () => {
  assert.equal(parseDate('2026-10-25').getDate(), 25);
  assert.equal(parseDate('25/10/2026').getMonth(), 9);
  assert.equal(parseDate('not-a-date'), null);
});

test('throws a useful error when required CSV columns are missing', () => {
  assert.throws(() => parseCSV('Title,Status\nSwim,Completed'), /Could not find Date and Distance/);
});

test('summarizes only sessions inside the selected date window', () => {
  const sessions = [
    { date: '2026-10-20', distance: 2000, title: 'A' },
    { date: '2026-10-22', distance: 3000, title: 'B' },
    { date: '2026-10-25', distance: 1500, title: 'C' },
    { date: '2026-10-19', distance: 4000, title: 'Outside' }
  ];
  const summary = summarizeSessions(sessions, new Date(2026, 9, 20), new Date(2026, 9, 25));
  assert.equal(summary.total, 6500);
  assert.equal(summary.count, 3);
  assert.equal(summary.average, 6500 / 3);
  assert.deepEqual(summary.sessions.map(s => s.title), ['A', 'B', 'C']);
});

test('returns a zero summary for an empty week', () => {
  const summary = summarizeSessions([], new Date(2026, 9, 20), new Date(2026, 9, 26));
  assert.deepEqual(summary, { sessions: [], total: 0, count: 0, average: 0 });
});

test('merges by session ID and otherwise deduplicates by date, title and distance', () => {
  const existing = [
    { id: 'one', date: '2026-10-20', title: 'Old title', distance: 2000 },
    { id: '', date: '2026-10-21', title: 'Evening', distance: 1800 }
  ];
  const incoming = [
    { id: 'one', date: '2026-10-20', title: 'Updated title', distance: 2200 },
    { id: '', date: '2026-10-21', title: 'Evening', distance: 1800 },
    { id: 'three', date: '2026-10-22', title: 'New', distance: 2500 }
  ];
  const result = mergeSessions(existing, incoming);
  assert.equal(result.length, 3);
  assert.equal(result.find(s => s.id === 'one').title, 'Updated title');
  assert.deepEqual(result.map(s => s.date), ['2026-10-20', '2026-10-21', '2026-10-22']);
});
