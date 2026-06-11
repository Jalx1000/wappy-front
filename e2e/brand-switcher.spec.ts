import { test, expect } from "@playwright/test";

test.describe("Brand switcher", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app");
  });

  test("shows active brand name in topbar", async ({ page }) => {
    // Default brand is Toyosa Motors (first in list)
    await expect(page.getByText("Toyosa Motors").first()).toBeVisible();
  });

  test("opens dropdown with all brands on click", async ({ page }) => {
    // Click the switcher button (contains the brand name + chevron)
    await page.getByText("Toyosa Motors").first().click();

    await expect(page.getByText("La Casa del Camba")).toBeVisible();
    await expect(page.getByText("Banco Ganadero")).toBeVisible();
    await expect(page.getByText("Hipermaxi")).toBeVisible();
  });

  test("switches active brand and closes dropdown", async ({ page }) => {
    await page.getByText("Toyosa Motors").first().click();

    await page.getByRole("button", { name: /Banco Ganadero/ }).click();

    // Dropdown closes
    await expect(page.getByText("La Casa del Camba")).not.toBeVisible();

    // New brand shown in topbar
    await expect(page.getByText("Banco Ganadero").first()).toBeVisible();
  });

  test("closes dropdown when clicking outside", async ({ page }) => {
    await page.getByText("Toyosa Motors").first().click();
    await expect(page.getByText("Banco Ganadero")).toBeVisible();

    // Click somewhere outside the dropdown
    await page.locator("main").click({ force: true });

    await expect(page.getByText("Banco Ganadero")).not.toBeVisible();
  });

  test("brand switch persists after navigation", async ({ page }) => {
    await page.getByText("Toyosa Motors").first().click();
    await page.getByRole("button", { name: /Hipermaxi/ }).click();

    await page.goto("/app/approvals");

    await expect(page.getByText("Hipermaxi").first()).toBeVisible();
  });
});
