import { expect, test, type Page } from '@playwright/test';

const screenshots = {
  ready: 'test-results/qa/earthquake-ready.png',
  strong: 'test-results/qa/earthquake-strong.png',
  mobile: 'test-results/qa/earthquake-mobile.png',
};

async function canvasFrame(page: Page) {
  return page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
}

test('all landmarks and the full earthquake gameplay loop work', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const stage = page.getByTestId('simulation-stage');
  const strength = page.getByRole('meter', { name: 'Earthquake strength' });

  await expect(stage).toHaveAttribute('data-landmark', 'eiffel');
  await expect(stage).toHaveAttribute('data-status', 'ready');
  await expect(page.getByText('Ready to shake')).toBeVisible();
  await page.screenshot({ path: screenshots.ready, fullPage: true });

  for (const [label, id] of [
    ['Tower of Pisa', 'pisa'],
    ['Empire State', 'empire'],
    ['Twin Towers', 'twin-towers'],
    ['Eiffel Tower', 'eiffel'],
  ] as const) {
    await page.getByRole('button', { name: label }).click();
    await expect(stage).toHaveAttribute('data-landmark', id);
    await expect(stage).toHaveAttribute('data-status', 'ready');
  }

  await page.getByRole('button', { name: 'Smaller' }).click();
  await expect(strength).toHaveAttribute('aria-valuenow', '1');
  await expect(page.getByRole('button', { name: 'Smaller' })).toBeDisabled();

  for (let index = 0; index < 4; index += 1) await page.getByRole('button', { name: 'Bigger' }).click();
  await expect(strength).toHaveAttribute('aria-valuenow', '5');
  await expect(page.getByRole('button', { name: 'Bigger' })).toBeDisabled();

  const before = await canvasFrame(page);
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(stage).toHaveAttribute('data-status', 'running');
  await expect(stage).toHaveAttribute('data-evacuation-active', 'true');
  await expect(page.getByText('Earthquake alarm')).toBeVisible();
  await page.waitForTimeout(2600);
  await expect.poll(async () => Number(await stage.getAttribute('data-broken-constraints'))).toBeGreaterThan(0);
  expect(await canvasFrame(page)).not.toBe(before);
  await page.screenshot({ path: screenshots.strong, fullPage: true });

  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(stage).toHaveAttribute('data-status', 'finished');
  const frozen = await canvasFrame(page);
  await page.waitForTimeout(350);
  expect(await canvasFrame(page)).toBe(frozen);

  const priorRun = Number(await stage.getAttribute('data-run'));
  const priorScene = Number(await stage.getAttribute('data-scene-version'));
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(stage).toHaveAttribute('data-status', 'running');
  await expect.poll(async () => Number(await stage.getAttribute('data-run'))).toBe(priorRun + 1);
  await expect.poll(async () => Number(await stage.getAttribute('data-scene-version'))).toBe(priorScene + 1);
});

test('the complete game stays usable on a phone-size screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.getByRole('navigation', { name: 'Landmark choices' })).toBeVisible();
  for (const name of ['Start', 'Finish', 'Smaller', 'Bigger']) {
    await expect(page.getByRole('button', { name })).toBeVisible();
  }
  await expect(page.getByRole('meter', { name: 'Earthquake strength' })).toBeVisible();
  await expect(page.getByTestId('simulation-stage')).toHaveCSS('min-height', '420px');
  await page.screenshot({ path: screenshots.mobile, fullPage: true });
});
