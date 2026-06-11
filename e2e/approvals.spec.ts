import { test, expect } from "@playwright/test";

test.describe("Approvals — optimistic actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/app/approvals");
    await expect(page.getByRole("heading", { name: "Aprobaciones" })).toBeVisible();
  });

  test("shows pending approvals list", async ({ page }) => {
    // 3 items are "pending" in mock data
    await expect(page.getByText("Pendiente")).toHaveCount(3, { timeout: 8_000 });
  });

  test("approve card inline — badge updates optimistically to Aprobado", async ({ page }) => {
    // First pending card: "Reel — Lanzamiento Corolla Cross Hybrid"
    const card = page.getByText("Reel — Lanzamiento Corolla Cross Hybrid").first();
    await expect(card).toBeVisible({ timeout: 8_000 });

    const cardContainer = card.locator("..").locator("..").locator("..");
    await cardContainer.getByRole("button", { name: "Aprobar" }).click();

    // Badge changes from Pendiente to Aprobado for that card
    await expect(cardContainer.getByText("Aprobado")).toBeVisible({ timeout: 5_000 });
  });

  test("opens review modal when clicking Revisar", async ({ page }) => {
    const card = page.getByText("Reel — Lanzamiento Corolla Cross Hybrid").first();
    await expect(card).toBeVisible({ timeout: 8_000 });

    const cardContainer = card.locator("..").locator("..").locator("..");
    await cardContainer.getByRole("button", { name: "Revisar" }).click();

    await expect(page.getByText("Rechazar")).toBeVisible();
    await expect(page.getByRole("button", { name: "Aprobar" }).last()).toBeVisible();
  });

  test("approve via modal — badge updates to Aprobado", async ({ page }) => {
    const card = page.getByText("Post — Feria del 0km, bono hasta 30%").first();
    await expect(card).toBeVisible({ timeout: 8_000 });

    const cardContainer = card.locator("..").locator("..").locator("..");
    await cardContainer.getByRole("button", { name: "Revisar" }).click();

    // Modal is open
    await expect(page.getByText("Rechazar")).toBeVisible();
    await page.getByRole("button", { name: "Aprobar" }).last().click();

    // Modal closes and badge updates
    await expect(page.getByText("Rechazar")).not.toBeVisible({ timeout: 3_000 });
    await expect(cardContainer.getByText("Aprobado")).toBeVisible({ timeout: 5_000 });
  });

  test("reject via modal — badge updates to Rechazado", async ({ page }) => {
    const card = page.getByText("Video — POV test drive Hilux GR").first();
    await expect(card).toBeVisible({ timeout: 8_000 });

    // Click the card itself to open modal
    await card.click();

    await expect(page.getByText("Rechazar")).toBeVisible({ timeout: 3_000 });
    await page.getByRole("button", { name: "Rechazar" }).click();

    // Modal closes and badge updates
    await expect(page.getByText("Rechazar")).not.toBeVisible({ timeout: 3_000 });
    const cardContainer = card.locator("..").locator("..").locator("..");
    await expect(cardContainer.getByText("Rechazado")).toBeVisible({ timeout: 5_000 });
  });

  test("modal closes on backdrop click", async ({ page }) => {
    await page.getByText("Reel — Lanzamiento Corolla Cross Hybrid").first().click();
    await expect(page.getByText("Rechazar")).toBeVisible();

    // Click the backdrop (fixed overlay behind the modal)
    await page.mouse.click(10, 10);

    await expect(page.getByText("Rechazar")).not.toBeVisible({ timeout: 3_000 });
  });
});
