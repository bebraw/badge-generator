import { createHealthResponse } from "./api/health";
import { exampleRoutes } from "./app-routes";
import { renderHomePage } from "./views/home";
import { renderNotFoundPage } from "./views/not-found";
import { cssResponse, htmlResponse, javascriptResponse, svgResponse } from "./views/shared";

export default {
  async fetch(request: Request): Promise<Response> {
    return await handleRequest(request);
  },
};

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/styles.css") {
    return cssResponse(await loadStylesheet());
  }

  if (url.pathname === "/badge-app.js") {
    return javascriptResponse(await loadClientScript());
  }

  if (url.pathname === "/assets/future-frontend-2026.svg") {
    return svgResponse(await loadLogo());
  }

  if (url.pathname === "/") {
    return htmlResponse(renderHomePage(exampleRoutes));
  }

  if (url.pathname === "/api/health") {
    return createHealthResponse(exampleRoutes.map((route) => route.path));
  }

  return htmlResponse(renderNotFoundPage(url.pathname), 404);
}

async function loadStylesheet(): Promise<string> {
  // Stryker disable next-line ConditionalExpression,OptionalChaining: Environment probe selects Node fs in tests and bundled CSS in Workers.
  if (typeof process !== "undefined" && process.release?.name === "node") {
    const { readFile } = await import("node:fs/promises");
    return await readFile(new URL("../.generated/styles.css", import.meta.url), "utf8");
  }

  const styles = await import("../.generated/styles.css");
  return styles.default;
}

async function loadClientScript(): Promise<string> {
  // Stryker disable next-line ConditionalExpression,OptionalChaining: Environment probe selects Node fs in tests and bundled client code in Workers.
  if (typeof process !== "undefined" && process.release?.name === "node") {
    const { readFile } = await import("node:fs/promises");
    return await readFile(new URL("../.generated/badge-app.client.js", import.meta.url), "utf8");
  }

  const script = await import("../.generated/badge-app.client.js");
  return script.default;
}

async function loadLogo(): Promise<string> {
  // Stryker disable next-line ConditionalExpression,OptionalChaining: Environment probe selects Node fs in tests and bundled SVG in Workers.
  if (typeof process !== "undefined" && process.release?.name === "node") {
    const { readFile } = await import("node:fs/promises");
    return await readFile(new URL("./assets/future-frontend-2026.svg", import.meta.url), "utf8");
  }

  const logo = await import("./assets/future-frontend-2026.svg");
  return logo.default;
}
