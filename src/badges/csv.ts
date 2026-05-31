import { type BadgePerson, type CsvImportMapping, type CsvIssue, type CsvParseResult, isBadgeType } from "./model";

interface CsvRecord {
  readonly row: number;
  readonly cells: string[];
}

type CsvColumn = "name" | "company" | "type";

const requiredColumns = ["name"] as const;
const supportedColumns = new Set<CsvColumn>(["name", "company", "type"]);
const defaultColumnAliases: Record<CsvColumn, readonly string[]> = {
  name: ["name", "full name", "ticket full name"],
  company: ["company", "company name", "ticket company name"],
  type: ["type", "role"],
};

export function parseBadgeCsv(csv: string, mapping: CsvImportMapping = {}): CsvParseResult {
  const records = parseCsvRecords(csv);
  const issues: CsvIssue[] = [];
  const header = records[0];

  if (!header) {
    return { people: [], issues: [{ row: 1, message: "CSV is empty." }] };
  }

  const columnIndexes = mapColumns(header.cells, mapping, issues);

  for (const column of requiredColumns) {
    if (columnIndexes[column] === undefined) {
      issues.push({ row: header.row, message: `Missing required "${column}" column.` });
    }
  }

  if (columnIndexes.name === undefined) {
    return { people: [], issues };
  }

  const people = records.slice(1).flatMap((record) => parsePersonRecord(record, columnIndexes, mapping, issues));

  return { people, issues };
}

function parsePersonRecord(
  record: CsvRecord,
  columns: Partial<Record<CsvColumn, number>>,
  mapping: CsvImportMapping,
  issues: CsvIssue[],
): BadgePerson[] {
  if (record.cells.every((cell) => cell.trim() === "")) {
    return [];
  }

  const name = readCell(record, columns.name).trim();
  const company = readCell(record, columns.company).trim();
  const rawType = mapping.fixedType ?? readCell(record, columns.type).trim().toLowerCase();
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

function mapColumns(headerCells: string[], mapping: CsvImportMapping, issues: CsvIssue[]): Partial<Record<CsvColumn, number>> {
  const indexes: Partial<Record<CsvColumn, number>> = {};
  const columns = headerCells.map(normalizeColumnName);
  const requestedColumns: Partial<Record<CsvColumn, string | undefined>> = {
    name: mapping.nameColumn,
    company: mapping.companyColumn,
    type: mapping.typeColumn,
  };

  for (const column of supportedColumns) {
    const requestedColumn = requestedColumns[column];

    if (requestedColumn !== undefined) {
      const requestedIndex = findColumnIndex(columns, requestedColumn);

      if (requestedIndex === undefined) {
        issues.push({ row: 1, message: `Mapped "${column}" column "${requestedColumn}" was not found.` });
      } else {
        indexes[column] = requestedIndex;
      }

      continue;
    }

    const aliasIndex = findAliasIndex(columns, defaultColumnAliases[column]);

    if (aliasIndex !== undefined) {
      indexes[column] = aliasIndex;
    }
  }

  const supportedIndexes = new Set(Object.values(indexes));
  const unsupportedColumns = columns.filter(
    (column, index) => column !== "" && !supportedColumns.has(column as CsvColumn) && !supportedIndexes.has(index),
  );

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

function findAliasIndex(columns: string[], aliases: readonly string[]): number | undefined {
  return aliases.map((alias) => columns.indexOf(alias)).find((index) => index !== -1);
}

function findColumnIndex(columns: string[], column: string): number | undefined {
  const index = columns.indexOf(normalizeColumnName(column));

  return index === -1 ? undefined : index;
}

function normalizeColumnName(column: string): string {
  return column.trim().toLowerCase();
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
