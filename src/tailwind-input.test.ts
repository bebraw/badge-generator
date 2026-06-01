import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("badge print styles", () => {
  it("prints one physical-size badge per 100 mm square page", () => {
    const css = readFileSync("src/tailwind-input.css", "utf8");

    expect(css).toContain("size: 100mm 100mm;");
    expect(css).toContain("width: 100mm;");
    expect(css).toContain("height: 100mm;");
    expect(css).toContain("padding: 0.4mm;");
    expect(css).toContain("width: calc(100mm - 0.8mm);");
    expect(css).toContain("height: calc(100mm - 0.8mm);");
    expect(css).not.toContain("size: A4;");
    expect(css).not.toContain("width: 210mm;");
    expect(css).not.toContain("height: 297mm;");
  });

  it("opts printed badges into exact color rendering", () => {
    const css = readFileSync("src/tailwind-input.css", "utf8");

    expect(css).toContain("print-color-adjust: exact;");
    expect(css).toContain("-webkit-print-color-adjust: exact;");
  });
});
