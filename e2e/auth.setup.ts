import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveURL("/login");

  await page.fill("#email", "test@foboagency.bo");
  await page.fill("#password", "demo1234");
  await page.click('button[type="submit"]');

  await page.waitForURL("/app", { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
