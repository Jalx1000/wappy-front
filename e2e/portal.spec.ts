import { test, expect } from "@playwright/test";

test.describe("Brand portal /p/[brandSlug]", () => {
  test("renders Toyosa Motors portal", async ({ page }) => {
    await page.goto("/p/auto");

    await expect(page.getByText("Toyosa Motors")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /Imprimir \/ PDF/ })).toBeVisible();
  });

  test("renders all three tab buttons", async ({ page }) => {
    await page.goto("/p/auto");

    await expect(page.getByRole("button", { name: "Social" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ads" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Web" })).toBeVisible();
  });

  test("Social tab loads Social Analytics section", async ({ page }) => {
    await page.goto("/p/auto");
    await page.getByRole("button", { name: "Social" }).click();

    await expect(page.getByText("Social Analytics")).toBeVisible({ timeout: 8_000 });
  });

  test("Ads tab loads Paid Media section", async ({ page }) => {
    await page.goto("/p/auto");
    await page.getByRole("button", { name: "Ads" }).click();

    await expect(page.getByText("Paid Media")).toBeVisible({ timeout: 8_000 });
  });

  test("Web tab loads Web / GA4 section", async ({ page }) => {
    await page.goto("/p/auto");
    await page.getByRole("button", { name: "Web" }).click();

    await expect(page.getByText(/Web\s*\/\s*GA4/)).toBeVisible({ timeout: 8_000 });
  });

  test("returns 404 for unknown brandSlug", async ({ page }) => {
    const response = await page.goto("/p/marcadesconocida");
    // Next.js notFound() renders a 404
    expect(response?.status()).toBe(404);
  });

  test("portal for each brand renders their name", async ({ page }) => {
    const brands = [
      { slug: "auto",   name: "Toyosa Motors" },
      { slug: "food",   name: "La Casa del Camba" },
      { slug: "bank",   name: "Banco Ganadero" },
      { slug: "retail", name: "Hipermaxi" },
    ];

    for (const { slug, name } of brands) {
      await page.goto(`/p/${slug}`);
      await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 });
    }
  });
});
