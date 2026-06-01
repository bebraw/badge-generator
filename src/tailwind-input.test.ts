import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("badge print styles", () => {
  it("prints one physical-size badge per 100 mm square page", () => {
    const css = readFileSync("src/tailwind-input.css", "utf8");
    const printCss = css.slice(css.indexOf("@media print"));

    expect(css).toContain("size: 100mm 100mm;");
    expect(printCss).toContain("width: 100mm;");
    expect(printCss).toContain("height: 100mm;");
    expect(printCss).toContain("padding: 0;");
    expect(printCss).toContain("border-radius: 0;");
    expect(printCss).not.toContain("padding: 0.4mm;");
    expect(printCss).not.toContain("width: calc(100mm - 0.8mm);");
    expect(printCss).not.toContain("height: calc(100mm - 0.8mm);");
    expect(css).not.toContain("size: A4;");
    expect(css).not.toContain("width: 210mm;");
    expect(css).not.toContain("height: 297mm;");
  });

  it("opts printed badges into exact color rendering", () => {
    const css = readFileSync("src/tailwind-input.css", "utf8");

    expect(css).toContain("print-color-adjust: exact;");
    expect(css).toContain("-webkit-print-color-adjust: exact;");
  });

  it("sets explicit solid print backgrounds for every role", () => {
    const css = readFileSync("src/tailwind-input.css", "utf8");
    const printCss = css.slice(css.indexOf("@media print"));

    expect(printCss).toContain("body.print-speaker .print-sheet.print-speaker");
    expect(printCss).toContain(".badge--speaker");
    expect(printCss).toContain("background: #050505;");
    expect(printCss).toContain("body.print-organizer .print-sheet.print-organizer");
    expect(printCss).toContain(".badge--organizer");
    expect(printCss).toContain("background: #d8d6cf;");
    expect(printCss).toContain("body.print-attendee .print-sheet.print-attendee,");
    expect(printCss).toContain(".badge--attendee,");
    expect(printCss).toContain("background: #ffffff;");
  });

  it("does not draw print-only card boundary lines", () => {
    const css = readFileSync("src/tailwind-input.css", "utf8");
    const printCss = css.slice(css.indexOf("@media print"));

    expect(printCss).not.toContain("outline:");
    expect(printCss).not.toContain("outline-offset:");
  });
});
