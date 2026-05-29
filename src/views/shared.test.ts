import { describe, expect, it } from "vitest";
import { cssResponse, escapeHtml, htmlResponse, javascriptResponse, svgResponse } from "./shared";

describe("htmlResponse", () => {
  it("returns no-store HTML responses", () => {
    const response = htmlResponse("<p>Hello</p>", 201);

    expect(response.status).toBe(201);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

describe("cssResponse", () => {
  it("returns no-store CSS responses", () => {
    const response = cssResponse(":root {}");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/css; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

describe("javascriptResponse", () => {
  it("returns no-store JavaScript responses", () => {
    const response = javascriptResponse("console.log('ok');");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/javascript; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

describe("svgResponse", () => {
  it("returns no-store SVG responses", () => {
    const response = svgResponse("<svg></svg>");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/svg+xml; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

describe("escapeHtml", () => {
  it("escapes characters that are significant in HTML", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
