import { expect, test } from '@playwright/test';

import {
  designs,
  firstDesign as first,
  latestDesign as last,
  neighboursOf,
  secondDesign as second,
  waitForChrome,
} from './fixtures';

test('the previous and next buttons wrap around the whole set', async ({
  page,
}) => {
  await page.goto(`/designs/${first.slug}`);

  // Forwards from the first.
  await page.getByRole('link', { name: 'Next design' }).click();
  await expect(page).toHaveURL(
    `/designs/${neighboursOf(first.slug).next.slug}`,
  );

  // Backwards past the start wraps to the last.
  await page.goto(`/designs/${first.slug}`);
  await page.getByRole('link', { name: 'Previous design' }).click();
  await expect(page).toHaveURL(`/designs/${last.slug}`);

  // Forwards past the end wraps to the first.
  await page.goto(`/designs/${last.slug}`);
  await page.getByRole('link', { name: 'Next design' }).click();
  await expect(page).toHaveURL(`/designs/${first.slug}`);
});

test('the arrow keys cycle designs', async ({ page }) => {
  await page.goto(`/designs/${first.slug}`);
  await waitForChrome(page);

  await page.locator('body').press('ArrowRight');
  await expect(page).toHaveURL(`/designs/${second.slug}`);

  // The next page hydrates from scratch — wait again before the return trip.
  await waitForChrome(page);
  await page.locator('body').press('ArrowLeft');
  await expect(page).toHaveURL(`/designs/${first.slug}`);
});

test('the command palette jumps straight to a named design', async ({
  page,
}) => {
  await page.goto(`/designs/${first.slug}`);

  await page.getByRole('button', { name: 'Choose a design' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByPlaceholder('Jump to a design').fill(last.name);
  await page.getByRole('option', { name: last.name }).click();

  await expect(page).toHaveURL(`/designs/${last.slug}`);
});

test.describe('opening the command palette', () => {
  const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';

  for (const shortcut of [`${modifier}+k`, '`']) {
    test(`with ${shortcut}`, async ({ page }) => {
      await page.goto(`/designs/${first.slug}`);
      await waitForChrome(page);

      await page.locator('body').press(shortcut);
      await expect(page.getByRole('dialog')).toBeVisible();

      // The same shortcut closes it again.
      await page.locator('body').press(shortcut);
      await expect(page.getByRole('dialog')).toBeHidden();
    });
  }

  test('shows a screenshot beside every design', async ({ page }) => {
    await page.goto(`/designs/${first.slug}`);
    await page.getByRole('button', { name: 'Choose a design' }).click();

    const options = page.getByRole('option');
    await expect(options).toHaveCount(designs.length);

    // Newest first, matching the gallery.
    await expect(options.first()).toContainText(last.name);

    for (const design of designs) {
      const option = page.getByRole('option', { name: design.name });
      await expect(option.locator('img')).toHaveCount(1);
    }
  });

  test('escape closes it and leaves the page where it was', async ({
    page,
  }) => {
    await page.goto(`/designs/${first.slug}`);
    await waitForChrome(page);

    await page.locator('body').press('`');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page).toHaveURL(`/designs/${first.slug}`);
  });
});

test('the chrome names the current design and its position', async ({
  page,
}) => {
  await page.goto(`/designs/${last.slug}`);
  const trigger = page.getByRole('button', { name: 'Choose a design' });
  await expect(trigger).toContainText(last.name);
  await expect(trigger).toContainText(`${designs.length}/${designs.length}`);
});

test('the chrome becomes fully visible on hover', async ({ page }) => {
  await page.goto(`/designs/${first.slug}`);
  const chrome = page.locator('[data-design-chrome]');

  await expect(chrome).toHaveCSS('opacity', '0.3');
  await chrome.hover();
  await expect(chrome).toHaveCSS('opacity', '1');
});

test('a design that captures the arrow keys keeps them while focused', async ({
  page,
}) => {
  const game = designs.find((design) => design.slug === 'pixel-quest');
  test.skip(!game, 'no key-capturing design present');

  await page.goto('/designs/pixel-quest');
  await waitForChrome(page);
  const canvas = page.locator('[data-captures-keys]');
  await canvas.focus();
  await page.keyboard.press('ArrowRight');

  await expect(page).toHaveURL('/designs/pixel-quest');
});
