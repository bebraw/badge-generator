import { expect, test } from "@playwright/test";

test("renders the worker home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Future Frontend Badge Generator" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Badge artwork" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print speakers" })).toBeVisible();
  await expect(page.locator("#badge-preview").getByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
  await expect(page.locator(".badge").first()).toBeVisible();
});

test("serves the health endpoint", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toEqual({
    ok: true,
    name: "badge-generator-worker",
    routes: ["/", "/badge-app.js", "/assets/future-frontend-2026.svg", "/api/health"],
  });
});

test("serves the generated stylesheet", async ({ request }) => {
  const response = await request.get("/styles.css");

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("text/css");
  await expect(response.text()).resolves.toContain("--color-paper");
});

test("imports CSV rows in the browser", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("CSV contents").fill("name,company,type\nEdsger Dijkstra,Technische Universiteit Eindhoven,speaker");
  await page.getByRole("button", { name: "Update badges" }).click();

  await expect(page.getByText("1 badge ready.")).toBeVisible();
  await expect(page.locator("#people-list").getByText("Edsger Dijkstra")).toBeVisible();
  await expect(page.locator("#badge-preview").getByText("Technische Universiteit Eindhoven")).toBeVisible();
});
