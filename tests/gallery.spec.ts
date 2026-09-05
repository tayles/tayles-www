import { expect, test } from '@playwright/test';

import { designs } from './fixtures';

test('the gallery lists every design, newest first', async ({ page }) => {
  await page.goto('/designs');

  const cards = page.locator('[data-design-card]');
  await expect(cards).toHaveCount(designs.length);

  const order = await cards.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-design-card')),
  );
  expect(order).toEqual(designs.map((design) => design.slug).toReversed());
});

test('every gallery card links to its design and shows its name', async ({
  page,
}) => {
  await page.goto('/designs');

  for (const design of designs) {
    const card = page.locator(`[data-design-card="${design.slug}"]`);
    await expect(card).toHaveAttribute('href', `/designs/${design.slug}`);
    await expect(card).toContainText(design.name);
  }
});

test('the 404 page offers a way back', async ({ page }) => {
  const response = await page.goto('/definitely-not-a-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'All designs' })).toBeVisible();
});
