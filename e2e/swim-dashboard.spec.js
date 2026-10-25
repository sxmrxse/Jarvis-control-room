const { test, expect } = require('@playwright/test');
function dateOffset(days) { const d = new Date(); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function representativeCSV() { return [
  'Session,Date,Session type,Status,Distance (m),Duration (min),RPE (1–10),Session load (AU),Intensity,Stroke / Focus,Session ID',
  `AM aerobic,${dateOffset(-1)},Swim - pool,Completed,2500,60,6,360,Aerobic,Freestyle,e2e-swim-1`,
  `PM pace,${dateOffset(0)},Swim - pool,Completed,3000,75,7,525,Race pace,Freestyle,e2e-swim-2`,
  `Strength,${dateOffset(0)},Gym - strength,Completed,,45,5,225,Technical / mixed,Mixed,e2e-gym-1`,
  `Planned swim,${dateOffset(0)},Swim - pool,Planned,1500,60,5,300,Aerobic,Freestyle,e2e-planned-1`,
  `Open water,${dateOffset(0)},Swim - open water,Completed,1800,45,8,360,Endurance,Mixed,e2e-ow-1`
].join('\n'); }
test('imports swim and S&C data and renders RPE, type, load and swim-volume visuals', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Performance overview' })).toBeVisible();
  await expect(page.locator('#count')).toHaveText('0');
  const csv = representativeCSV();
  await page.locator('#csv-file').setInputFiles({ name: 'representative-training.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.locator('#total')).toContainText('5,500');
  await expect(page.locator('#count')).toHaveText('2');
  await expect(page.locator('#avg-rpe')).toContainText('6.5');
  await expect(page.locator('#sc-count')).toHaveText('1');
  await expect(page.locator('#sc-list')).toContainText('Strength');
  await expect(page.locator('#type-chart rect')).toHaveCount(3);
  await expect(page.locator('#rpe-chart rect')).toHaveCount(4);
  await expect(page.locator('#swim-chart rect')).toHaveCount(2);
  await expect(page.locator('#data-status')).toContainText('4 SESSIONS SAVED');
  await page.locator('#filter').selectOption('sc');
  await expect(page.locator('#type-chart rect')).toHaveCount(1);
  await page.locator('#filter').selectOption('all');
  await page.locator('#csv-file').setInputFiles({ name: 'representative-training.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.locator('#sc-count')).toHaveText('1');
  await expect(page.locator('#count')).toHaveText('2');
  await page.reload();
  await expect(page.locator('#sc-count')).toHaveText('1');
  await expect(page.locator('#total')).toContainText('5,500');
});
test('shows a useful message when required CSV columns are invalid', async ({ page }) => {
  await page.goto('/');
  await page.locator('#csv-file').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from('Name,Notes\nSession A,hello') });
  await expect(page.locator('#toast')).toContainText('Could not find a Date column');
  await expect(page.locator('#count')).toHaveText('0');
});
