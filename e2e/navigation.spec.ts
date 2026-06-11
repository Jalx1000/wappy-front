import { test, expect } from "@playwright/test";

const modules: { path: string; heading: string; label: string }[] = [
  { path: "/app",                  heading: "Hola, María",          label: "Dashboard" },
  { path: "/app/analytics/social", heading: "Social Analytics",     label: "Social Analytics" },
  { path: "/app/analytics/ads",    heading: "Paid Media / Ads",     label: "Paid Media" },
  { path: "/app/analytics/web",    heading: "Web · GA4",            label: "Web GA4" },
  { path: "/app/approvals",        heading: "Aprobaciones",         label: "Approvals" },
  { path: "/app/calendar",         heading: "Calendario",           label: "Calendar" },
  { path: "/app/inbox",            heading: "Bandeja Social",       label: "Inbox" },
  { path: "/app/campaigns",        heading: "Campañas",             label: "Campaigns" },
  { path: "/app/influencers",      heading: "Influencers",          label: "Influencers" },
  { path: "/app/requests",         heading: "Solicitudes",          label: "Requests" },
  { path: "/app/insights",         heading: "Insights AI · Think Tank", label: "Insights AI" },
];

test.describe("Module navigation", () => {
  for (const mod of modules) {
    test(`loads ${mod.label}`, async ({ page }) => {
      await page.goto(mod.path);
      await expect(page).toHaveURL(mod.path);
      await expect(page.getByRole("heading", { name: mod.heading, exact: false }).first()).toBeVisible({
        timeout: 10_000,
      });
    });
  }

  test("sidebar link navigates to Aprobaciones", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("link", { name: "Aprobaciones" }).click();
    await expect(page).toHaveURL("/app/approvals");
    await expect(page.getByRole("heading", { name: "Aprobaciones" })).toBeVisible();
  });

  test("sidebar link navigates to Bandeja Social", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("link", { name: "Bandeja Social" }).click();
    await expect(page).toHaveURL("/app/inbox");
    await expect(page.getByRole("heading", { name: "Bandeja Social" })).toBeVisible();
  });

  test("Cmd+B toggles sidebar collapsed state", async ({ page }) => {
    await page.goto("/app");
    const sidebar = page.locator("nav").first();
    const widthBefore = (await sidebar.boundingBox())?.width ?? 0;

    await page.keyboard.press("Meta+b");

    await expect(async () => {
      const widthAfter = (await sidebar.boundingBox())?.width ?? 0;
      expect(widthAfter).not.toBe(widthBefore);
    }).toPass({ timeout: 3_000 });
  });
});
