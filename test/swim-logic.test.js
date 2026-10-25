const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDate, cleanHeader, parseCSV, summarizeSessions, mergeSessions } = require('../swim-logic.js');

test('cleans Notion CSV headers including BOM, whitespace, underscores and en dashes', () => {
  assert.equal(cleanHeader('\uFEFF Distance__ (m) '), 'distance (m)');
  assert.equal(cleanHeader('RPE (1–10)'), 'rpe (1-10)');
});

test('parses completed swims and S&C while excluding planned and missed sessions', () => {
  const csv = 'Date,Distance (m),Duration (min),Session type,Status,Session,RPE (1–10),Session load (AU),Intensity,Stroke / Focus,Session ID\n' +
    '2026-10-20,2400,60,Swim - pool,Completed,AM swim,6,360,Aerobic,Freestyle,A1\n' +
    '2026-10-21,1800,60,Swim - pool,Planned,Planned swim,5,300,Aerobic,Freestyle,A2\n' +
    '2026-10-22,,45,Gym - strength,Completed,S&C session,5,225,Technical / mixed,Mixed,G1\n' +
    '2026-10-23,0,60,Swim - pool,Missed,Missed swim,,, ,A3\n' +
    '2026-10-24,1500,45,Swim - open water,Completed,Open water,7,315,Endurance,Mixed,A4\n';
  const result = parseCSV(csv);
  assert.equal(result.length, 3);
  assert.equal(result[0].distance, 2400);
  assert.equal(result[0].rpe, 6);
  assert.equal(result[1].type, 'Gym - strength');
  assert.equal(result[1].distance, 0);
  assert.equal(result[1].duration, 45);
  assert.equal(result[1].load, 225);
  assert.equal(result[2].type, 'Swim - open water');
});

test('parses quoted CSV cells with commas, escaped quotes and embedded line breaks', () => {
  const csv = 'Date,Session type,Status,Session,Session ID\n' +
    '2026-10-20,Swim - pool,Completed,"Morning, \'fast\' swim",A1\n' +
    '2026-10-21,Gym - strength,Completed,"A ""quoted"" title",A2\n' +
    '2026-10-22,Swim - pool,Completed,"Line one\nLine two",A3\n';
  const result = parseCSV(csv);
  assert.equal(result.length, 3);
  assert.equal(result[0].title, "Morning, 'fast' swim");
  assert.equal(result[1].title, 'A "quoted" title');
  assert.equal(result[2].title, 'Line one\nLine two');
});

test('accepts supported date formats including Notion export date strings', () => {
  assert.equal(parseDate('2026-10-25').getDate(), 25);
  assert.equal(parseDate('25/10/2026').getMonth(), 9);
  assert.equal(parseDate('October 25, 2026 6:30 PM (GMT+1) → 8:00 PM').getDate(), 25);
  assert.equal(parseDate('not-a-date'), null);
});

test('throws a useful error when required CSV columns are missing', () => {
  assert.throws(() => parseCSV('Name,Notes\nSession A,hello'), /Could not find a Date column/);
});

test('summarizes completed sessions in a date window and supports S&C filtering', () => {
  const sessions = [
    { date: '2026-10-20', distance: 2000, title: 'A', type: 'Swim - pool', rpe: 5, duration: 60, load: 300 },
    { date: '2026-10-22', distance: 3000, title: 'B', type: 'Swim - pool', rpe: 7, duration: 90, load: 630 },
    { date: '2026-10-25', distance: 0, title: 'Gym', type: 'Gym - strength', rpe: 5, duration: 45, load: 225 },
    { date: '2026-10-19', distance: 4000, title: 'Outside', type: 'Swim - pool' }
  ];
  const summary = summarizeSessions(sessions, new Date(2026, 9, 20), new Date(2026, 9, 25));
  assert.equal(summary.total, 5000);
  assert.equal(summary.count, 2);
  assert.equal(summary.average, 2500);
  assert.equal(summary.meanRpe, 5.666666666666667);
  assert.equal(summary.durationTotal, 195);
  const sc = summarizeSessions(sessions, new Date(2026, 9, 20), new Date(2026, 9, 25), 'sc');
  assert.equal(sc.sessions.length, 1);
  assert.equal(sc.sessions[0].title, 'Gym');
});

test('returns a zero summary for an empty week', () => {
  const summary = summarizeSessions([], new Date(2026, 9, 20), new Date(2026, 9, 26));
  assert.equal(summary.total, 0);
  assert.equal(summary.count, 0);
  assert.equal(summary.sessions.length, 0);
  assert.equal(summary.meanRpe, null);
});

test('merges by session ID and otherwise deduplicates by date, title, type and distance', () => {
  const existing = [{ id: 'one', date: '2026-10-20', title: 'Old title', distance: 2000, type: 'Swim - pool' }, { id: '', date: '2026-10-21', title: 'Evening', distance: 1800, type: 'Swim - pool' }];
  const incoming = [{ id: 'one', date: '2026-10-20', title: 'Updated title', distance: 2200, type: 'Swim - pool' }, { id: '', date: '2026-10-21', title: 'Evening', distance: 1800, type: 'Swim - pool' }, { id: 'three', date: '2026-10-22', title: 'New', distance: 0, type: 'Gym - strength' }];
  const result = mergeSessions(existing, incoming);
  assert.equal(result.length, 3);
  assert.equal(result.find(s => s.id === 'one').title, 'Updated title');
  assert.deepEqual(result.map(s => s.date), ['2026-10-20', '2026-10-21', '2026-10-22']);
});
