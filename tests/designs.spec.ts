import { expect, test } from '@playwright/test';

import { designs, latestDesign } from './fixtures';

const LINKEDIN = 'https://linkedin.com/in/tayles';
const GITHUB = 'https://github.com/tayles';

test('there is at least one design', () => {
  expect(designs.length).toBeGreaterThan(0);
});

for (const design of designs) {
  test.describe(`${design.name} (${design.slug})`, () => {
    test('shows the name and both links', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto(`/designs/${design.slug}`);

      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveCount(1);
      await expect(heading).toHaveText(/tayles/i);

      await expect(page.locator(`a[href="${LINKEDIN}"]`)).toHaveCount(1);
      await expect(page.locator(`a[href="${GITHUB}"]`)).toHaveCount(1);

      // GitHub always comes first.
      const order = await page
        .locator(
          `[data-design-root] a[href="${GITHUB}"], ` +
            `[data-design-root] a[href="${LINKEDIN}"]`,
        )
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
      expect(order).toEqual([GITHUB, LINKEDIN]);

      // Both links must be reachable without a mouse.
      for (const href of [LINKEDIN, GITHUB]) {
        const link = page.locator(`[data-design-root] a[href="${href}"]`);
        await expect(link).toBeVisible();
        await link.focus();
        await expect(link).toBeFocused();
      }

      expect(errors).toEqual([]);
    });

    test('renders inside the design root and keeps the chrome on top', async ({
      page,
    }) => {
      await page.goto(`/designs/${design.slug}`);

      await expect(page.locator('[data-design-root]')).toHaveAttribute(
        'data-design',
        design.slug,
      );
      await expect(page.locator('[data-design-chrome]')).toBeVisible();
    });

    test('does not paint the document body itself', async ({ page }) => {
      // Designs must scope their styles to their own root so the nav chrome,
      // the gallery and the 404 page keep their own look.
      await page.goto(`/designs/${design.slug}`);
      const bodyFont = await page.evaluate(
        () => getComputedStyle(document.body).fontFamily,
      );
      expect(bodyFont).not.toContain('Press Start');
    });

    test('has no horizontal overflow at any width', async ({ page }) => {
      // Small phone, tablet, and a wide desktop.
      const widths = [
        { width: 320, height: 700 },
        { width: 768, height: 1024 },
        { width: 2560, height: 1440 },
      ];

      for (const viewport of widths) {
        await page.setViewportSize(viewport);
        await page.goto(`/designs/${design.slug}`);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(
          overflow,
          `overflows at ${viewport.width}px`,
        ).toBeLessThanOrEqual(1);
      }
    });
  });
}

test('the homepage is the newest design', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-design-root]')).toHaveAttribute(
    'data-design',
    latestDesign.slug,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://tayles.co.uk/designs/${latestDesign.slug}`,
  );
});

test('every design has a committed screenshot', () => {
  const missing = designs
    .filter((design) => !design.hasScreenshot)
    .map((design) => design.slug);
  expect(
    missing,
    `Run \`bun run screenshots\` for: ${missing.join(', ')}`,
  ).toEqual([]);
});
