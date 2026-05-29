import { describe, expect, it } from "vitest";
import { exampleRoutes } from "../app-routes";
import { renderHomePage } from "./home";

describe("renderHomePage", () => {
  it("renders the badge generator workspace and asset wiring", () => {
    const html = renderHomePage(exampleRoutes);

    expect(html).toContain("Future Frontend Badge Generator");
    expect(html).toContain("100 mm");
    expect(html).toContain("5 mm");
    expect(html).toContain("A4");
    expect(html).toContain("Print speakers");
    expect(html).toContain("name,company,type");
    expect(html).toContain("Badge generator workspace");
    expect(html).toContain("JSON health endpoint for tooling and smoke tests");
    expect(html).toContain('rel="stylesheet" href="/styles.css"');
    expect(html).toContain('type="module" src="/badge-app.js"');
    expect(html).not.toContain("Stryker was here!");
  });
});
