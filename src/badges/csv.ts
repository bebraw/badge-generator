import { type BadgePerson, type CsvIssue, type CsvParseResult, isBadgeType } from "./model";

interface CsvRecord {
  readonly row: number;
  readonly cells: string[];
}

type CsvColumn = "name" | "company" | "type";

const requiredColumns = ["name"] as const;
const supportedColumns = new Set<CsvColumn>(["name", "company", "type"]);

export function parseBadgeCsv(csv: string): CsvParseResult {
  const records = parseCsvRecords(csv);
  const issues: CsvIssue[] = [];
  const header = records[0];

  if (!header) {
    return { people: [], issues: [{ row: 1, message: "CSV is empty." }] };
  }

  const columns = header.cells.map((cell) => cell.trim().toLowerCase());
  const columnIndexes = mapColumns(columns, issues);

  for (const column of requiredColumns) {
    if (columnIndexes[column] === undefined) {
      issues.push({ row: header.row, message: `Missing required "${column}" column.` });
    }
  }

  if (columnIndexes.name === undefined) {
    return { people: [], issues };
  }

  const people = records.slice(1).flatMap((record) => parsePersonRecord(record, columnIndexes, issues));

  return { people, issues };
}

function parsePersonRecord(record: CsvRecord, columns: Partial<Record<CsvColumn, number>>, issues: CsvIssue[]): BadgePerson[] {
  if (record.cells.every((cell) => cell.trim() === "")) {
    return [];
  }

  const name = readCell(record, columns.name).trim();
  const company = readCell(record, columns.company).trim();
  const rawType = readCell(record, columns.type).trim().toLowerCase();
  const type = rawType === "" ? "attendee" : rawType;

  if (name === "") {
    issues.push({ row: record.row, message: "Missing attendee name." });
    return [];
  }

  if (!isBadgeType(type)) {
    issues.push({ row: record.row, message: `Unknown badge type "${rawType}".` });
    return [];
  }

  return [
    {
      name,
      ...(company === "" ? {} : { company }),
      type,
    },
  ];
}

function mapColumns(columns: string[], issues: CsvIssue[]): Partial<Record<CsvColumn, number>> {
  const indexes: Partial<Record<CsvColumn, number>> = {};

  columns.forEach((column, index) => {
    if (supportedColumns.has(column as CsvColumn)) {
      indexes[column as CsvColumn] = index;
    }
  });

  const unsupportedColumns = columns.filter((column) => column !== "" && !supportedColumns.has(column as CsvColumn));

  if (unsupportedColumns.length > 0) {
    issues.push({ row: 1, message: `Ignoring unsupported columns: ${unsupportedColumns.join(", ")}.` });
  }

  return indexes;
}

function readCell(record: CsvRecord, index: number | undefined): string {
  if (index === undefined) {
    return "";
  }

  return record.cells[index] ?? "";
}

function parseCsvRecords(csv: string): CsvRecord[] {
  const records: CsvRecord[] = [];
  let row = 1;
  let cell = "";
  let cells: string[] = [];
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index] ?? "";
    const next = csv[index + 1] ?? "";

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }

      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      cells.push(cell);
      cell = "";
    } else if (char === "\n") {
      cells.push(trimCarriageReturn(cell));
      records.push({ row, cells });
      row += 1;
      cell = "";
      cells = [];
    } else {
      cell += char;
    }
  }

  if (cell !== "" || cells.length > 0) {
    cells.push(trimCarriageReturn(cell));
    records.push({ row, cells });
  }

  return records;
}

function trimCarriageReturn(value: string): string {
  return value.endsWith("\r") ? value.slice(0, -1) : value;
}

