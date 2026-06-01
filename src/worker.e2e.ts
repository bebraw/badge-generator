import { expect, test } from "@playwright/test";

test("renders the worker home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Future Frontend Badge Generator" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Badge artwork" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print speakers" })).toBeVisible();
  await expect(page.locator("#badge-preview").getByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
  await expect(page.locator("#people-list").getByText("Import CSV rows to generate badges.")).toBeVisible();
  await expect(page.locator("#role-counts dd")).toHaveText(["0", "0", "0", "0", "0"]);
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
  const styles = await response.text();
  expect(styles).toContain("--color-paper");
  expect(styles).toContain("background:var(--badge-bg)");
  expect(styles).toContain(".badge{width:100mm;height:100mm;");
  expect(styles).toContain("border-radius:0");
  expect(styles).toContain("body.print-speaker .print-sheet.print-speaker{background:#050505}");
  expect(styles).toContain("body.print-organizer .print-sheet.print-organizer{background:#d8d6cf}");
  expect(styles).toContain(".badge--speaker{color:#fff;background:#050505}");
  expect(styles).toContain(".badge--organizer{color:#101010;background:#d8d6cf}");
  expect(styles).toContain("print-color-adjust:exact");
  expect(styles).not.toContain("outline:.25mm solid #000c");
});

test("imports CSV rows in the browser", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("CSV contents").fill("name,company,type\nEdsger Dijkstra,Technische Universiteit Eindhoven,speaker");
  await page.getByLabel("Import role").selectOption({ label: "All speakers" });
  await page.getByRole("button", { name: "Update badges" }).click();

  await expect(page.getByText("1 badge ready.")).toBeVisible();
  await expect(page.locator("#people-list").getByText("Edsger Dijkstra")).toBeVisible();
  await expect(page.locator("#badge-preview").getByText("Technische Universiteit Eindhoven")).toBeVisible();
});

test("imports ticketing exports with mapped columns and a fixed role", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("CSV contents")
    .fill("Number,Ticket,Ticket Full Name,Ticket Company Name\n1,Team Pass,Example Person,Example Events");

  await expect(page.getByLabel("Import role").locator("option")).toHaveText([
    "All regular attendees",
    "All design day attendees",
    "All development day attendees",
    "All speakers",
    "All organizers",
  ]);
  await page.getByLabel("Import role").selectOption({ label: "All organizers" });
  await page.getByRole("button", { name: "Update badges" }).click();

  await expect(page.getByText("1 badge ready.")).toBeVisible();
  await expect(page.locator("#people-list").getByText("Example Person")).toBeVisible();
  await expect(page.locator("#people-list").getByText("Example Events")).toBeVisible();
  await expect(page.locator("#people-list").getByText("Organizer")).toBeVisible();
});

test("adds blank badges for the selected role", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Role", { exact: true }).selectOption({ label: "Speaker" });
  await page.getByLabel("Amount").fill("3");
  await page.getByRole("button", { name: "Add blank badges" }).click();

  await expect(page.getByText("3 blank speaker badges added.")).toBeVisible();
  await expect(page.locator("#role-counts dd")).toHaveText(["0", "0", "0", "3", "0"]);
  await expect(page.locator("#people-list").getByText("Blank badge")).toHaveCount(3);
  await expect(page.locator("#badge-preview").getByRole("heading")).toHaveCount(0);
  await expect(page.locator("#badge-preview .badge--speaker")).toBeVisible();
});

test("imports separate attendee day-pass CSVs with visible pass labels", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("CSV contents").fill("name,company\nSofia Saarinen,Studio Example");
  await page.getByLabel("Import role").selectOption({ label: "All design day attendees" });
  await page.getByRole("button", { name: "Update badges" }).click();

  await expect(page.getByText("1 badge ready.")).toBeVisible();
  await expect(page.locator("#people-list").getByText("Sofia Saarinen")).toBeVisible();
  await expect(page.locator("#people-list").getByText("Design Day")).toBeVisible();
  await expect(page.locator("#badge-preview .badge--design")).toBeVisible();
  await expect(page.locator("#badge-preview").getByText("Design Day")).toBeVisible();
});
