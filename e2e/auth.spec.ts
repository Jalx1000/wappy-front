import { test, expect } from "@playwright/test";

// Run without stored auth state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login flow", () => {
  test("redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL("/login");
  });

  test("renders login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Continuar con Google/ })).toBeVisible();
  });

  test("shows client-side validation errors on empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "no-es-email");
    await page.fill("#password", "x");
    await page.click('button[type="submit"]');

    await expect(page.getByText("Ingresa un correo válido")).toBeVisible();
    await expect(page.getByText("Mínimo 4 caracteres")).toBeVisible();
  });

  test("logs in with valid credentials and lands on /app", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "test@foboagency.bo");
    await page.fill("#password", "demo1234");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/app", { timeout: 15_000 });
  });

  test("forgot password flow shows sent screen", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "¿Olvidaste tu contraseña?" }).click();

    await expect(page.getByText("Recupera tu acceso")).toBeVisible();

    await page.fill('[id="forgot-email"]', "test@foboagency.bo");
    await page.getByRole("button", { name: "Enviar enlace" }).click();

    await expect(page.getByText("Revisa tu correo")).toBeVisible();
    await expect(page.getByText("test@foboagency.bo")).toBeVisible();
  });
});
