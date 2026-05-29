import { describe, expect, it } from "vitest";
import worker, { handleRequest } from "./worker";
import { ensureGeneratedClientScript, ensureGeneratedStylesheet } from "./test-support";

ensureGeneratedStylesheet();
ensureGeneratedClientScript();

describe("worker", () => {
  it("renders the badge generator home page", async () => {
    const response = await handleRequest(new Request("http://example.com/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("cache-control")).toBe("no-store");

    const body = await response.text();
    expect(body).toContain("Future Frontend Badge Generator");
    expect(body).toContain("/badge-app.js");
    expect(body).not.toContain("/api/health");
  });

  it("returns a JSON health response", async () => {
    const response = await handleRequest(new Request("http://example.com/api/health"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      name: "badge-generator-worker",
      routes: ["/", "/badge-app.js", "/assets/future-frontend-2026.svg", "/api/health"],
    });
  });

  it("returns a not found page for unknown routes", async () => {
    const response = await handleRequest(new Request("http://example.com/missing"));

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");

    const body = await response.text();
    expect(body).toContain("Not Found");
    expect(body).toContain("/missing");
  });

  it("exposes the same behavior through the worker fetch entrypoint", async () => {
    const response = await worker.fetch(new Request("http://example.com/api/health"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
  });

  it("serves generated styles", async () => {
    const response = await handleRequest(new Request("http://example.com/styles.css"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/css");
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.text()).resolves.toContain("--color-paper:#f5f2ec");
  });

  it("serves the generated browser module", async () => {
    const response = await handleRequest(new Request("http://example.com/badge-app.js"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/javascript");
    await expect(response.text()).resolves.toContain("badgeAppLoaded");
  });

  it("serves the Future Frontend logo", async () => {
    const response = await handleRequest(new Request("http://example.com/assets/future-frontend-2026.svg"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    await expect(response.text()).resolves.toContain("<svg");
  });
});
