import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("badge print styles", () => {
  it("opts printed badges into exact color rendering", () => {
    const css = readFileSync("src/tailwind-input.css", "utf8");

    expect(css).toContain("print-color-adjust: exact;");
    expect(css).toContain("-webkit-print-color-adjust: exact;");
  });
});
