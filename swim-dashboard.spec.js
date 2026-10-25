const { test, expect } = require('@playwright/test');

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function representativeCSV() {
  return [
    'Session,Date,Session type,Status,Distance (m),Session ID',
    `AM aerobic,${dateOffset(-1)},Swim - pool,Completed,2500,e2e-swim-1`,
    `PM pace,${dateOffset(0)},Swim - pool,Completed,3000,e2e-swim-2`,
    `Strength,${dateOffset(0)},Gym,Completed,1000,e2e-gym-1`,
    `Planned swim,${dateOffset(0)},Swim - pool,Planned,1500,e2e-planned-1`,
    `Open water,${dateOffset(0)},Swim - open water,Completed,1800,e2e-open-water-1`
  ].join('\n');
}

test('imports representative CSV and displays only completed pool swims', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Swim volume' })).toBeVisible();
  await expect(page.locator('#count')).toHaveText('0');

  const csv = representativeCSV();
  await page.locator('#csv-file').setInputFiles({
    name: 'representative-swims.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv)
  });

  await expect(page.locator('#total')).toContainText('5,500');
  await expect(page.locator('#count')).toHaveText('2');
  await expect(page.locator('#average')).toContainText('2,750');
  await expect(page.locator('#mean-label')).toHaveText('Mean: 2,750 m');
  await expect(page.locator('#chart rect')).toHaveCount(3); // two bars plus the mean-label background
  await expect(page.locator('#data-status')).toContainText('2 SWIMS SAVED');

  // Re-importing the same rows should not create duplicate sessions.
  await page.locator('#csv-file').setInputFiles({
    name: 'representative-swims.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv)
  });
  await expect(page.locator('#count')).toHaveText('2');
  await expect(page.locator('#total')).toContainText('5,500');

  await page.reload();
  await expect(page.locator('#count')).toHaveText('2');
  await expect(page.locator('#total')).toContainText('5,500');
});

test('shows a useful message when CSV columns are invalid', async ({ page }) => {
  await page.goto('/');
  await page.locator('#csv-file').setInputFiles({
    name: 'invalid.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Name,Notes\nSession A,hello')
  });
  await expect(page.locator('#toast')).toContainText('Could not find Date and Distance (m) columns');
  await expect(page.locator('#count')).toHaveText('0');
});
