import { describe, expect, it } from "vitest";
import { parseBadgeCsv } from "./csv";

describe("parseBadgeCsv", () => {
  it("parses attendee rows and defaults missing types to attendee", () => {
    expect(
      parseBadgeCsv(`name,company,type
Ada Lovelace,Analytical Engines,speaker
Grace Hopper,,
Linus Torvalds,Linux Foundation,attendee`),
    ).toEqual({
      people: [
        { name: "Ada Lovelace", company: "Analytical Engines", type: "speaker" },
        { name: "Grace Hopper", type: "attendee" },
        { name: "Linus Torvalds", company: "Linux Foundation", type: "attendee" },
      ],
      issues: [],
    });
  });

  it("keeps quoted commas and escaped quotes in cells", () => {
    expect(parseBadgeCsv(`name,company,type\n"Virtanen, Aino","Hello ""World"" Oy",organizer`)).toEqual({
      people: [{ name: "Virtanen, Aino", company: 'Hello "World" Oy', type: "organizer" }],
      issues: [],
    });
  });

  it("reports missing names and unknown badge types by row", () => {
    expect(parseBadgeCsv(`name,company,type\n,Company,speaker\nAda Lovelace,Math,vip`)).toEqual({
      people: [],
      issues: [
        { row: 2, message: "Missing attendee name." },
        { row: 3, message: 'Unknown badge type "vip".' },
      ],
    });
  });

  it("reports missing required columns", () => {
    expect(parseBadgeCsv("company,type\nACME,attendee")).toEqual({
      people: [],
      issues: [{ row: 1, message: 'Missing required "name" column.' }],
    });
  });

  it("reports empty input", () => {
    expect(parseBadgeCsv("")).toEqual({
      people: [],
      issues: [{ row: 1, message: "CSV is empty." }],
    });
  });
});
