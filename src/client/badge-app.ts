type BadgeType = "attendee" | "speaker" | "organizer";

interface BadgePerson {
  readonly name: string;
  readonly company?: string;
  readonly type: BadgeType;
}

interface CsvIssue {
  readonly row: number;
  readonly message: string;
}

interface CsvRecord {
  readonly row: number;
  readonly cells: string[];
}

interface CsvImportMapping {
  readonly nameColumnIndex?: number;
  readonly companyColumnIndex?: number;
  readonly fixedType?: BadgeType;
}

const badgeTypes: readonly BadgeType[] = ["attendee", "speaker", "organizer"];
const roleLabels: Record<BadgeType, string> = {
  speaker: "Speaker",
  organizer: "Organizer",
  attendee: "Attendee",
};
const previewPeople: Record<BadgeType, BadgePerson> = {
  speaker: { name: "Ada Lovelace", company: "Analytical Engines", type: "speaker" },
  organizer: { name: "Grace Hopper", type: "organizer" },
  attendee: { name: "Linus Torvalds", company: "Linux Foundation", type: "attendee" },
};

let people: BadgePerson[] = [];
let previewRole: BadgeType = "speaker";

const csvInput = requiredElement<HTMLTextAreaElement>("csv-input");
const fileInput = requiredElement<HTMLInputElement>("csv-file");
const loadButton = requiredElement<HTMLButtonElement>("load-csv");
const statusElement = requiredElement<HTMLElement>("csv-status");
const nameColumnSelect = requiredElement<HTMLSelectElement>("name-column");
const companyColumnSelect = requiredElement<HTMLSelectElement>("company-column");
const importTypeSelect = requiredElement<HTMLSelectElement>("import-type");
const previewElement = requiredElement<HTMLElement>("badge-preview");
const peopleListElement = requiredElement<HTMLElement>("people-list");
const roleCountsElement = requiredElement<HTMLElement>("role-counts");
const printRoot = requiredElement<HTMLElement>("print-root");

loadButton.addEventListener("click", () => {
  loadCsv(csvInput.value, readImportMapping());
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];

  if (!file) {
    return;
  }

  void file.text().then((text) => {
    csvInput.value = text;
    renderCsvMappingControls(text);
    statusElement.textContent = "CSV loaded. Review field mapping and import role, then update badges.";
  });
});

csvInput.addEventListener("input", () => {
  renderCsvMappingControls(csvInput.value);
});

document.querySelectorAll<HTMLButtonElement>("[data-preview-role]").forEach((button) => {
  button.addEventListener("click", () => {
    const role = parseBadgeType(button.dataset.previewRole ?? "");

    if (!role) {
      return;
    }

    previewRole = role;
    render();
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-print-role]").forEach((button) => {
  button.addEventListener("click", () => {
    const role = parseBadgeType(button.dataset.printRole ?? "");

    if (!role) {
      return;
    }

    document.body.classList.remove("print-speaker", "print-organizer", "print-attendee");
    document.body.classList.add(`print-${role}`);
    window.print();
  });
});

statusElement.textContent = "No CSV imported yet. Preview uses sample badges.";
renderCsvMappingControls(csvInput.value);
render();

function loadCsv(csv: string, mapping: CsvImportMapping): void {
  const result = parseBadgeCsv(csv, mapping);
  people = result.people;

  if (result.issues.length > 0) {
    statusElement.innerHTML = result.issues.map((issue) => `<p>Row ${issue.row}: ${escapeHtml(issue.message)}</p>`).join("");
  } else {
    statusElement.textContent = `${people.length} badge${people.length === 1 ? "" : "s"} ready.`;
  }

  render();
}

function renderCsvMappingControls(csv: string): void {
  const header = parseCsvRecords(csv)[0]?.cells ?? [];
  const normalizedHeader = header.map(normalizeColumnName);
  const defaultNameIndex = findColumnAliasIndex(normalizedHeader, ["name", "full name", "ticket full name"]);
  const defaultCompanyIndex = findColumnAliasIndex(normalizedHeader, ["company", "company name", "ticket company name"]);

  renderColumnSelect(nameColumnSelect, header, defaultNameIndex);
  renderColumnSelect(companyColumnSelect, header, defaultCompanyIndex, "No company column");
  renderImportTypeSelect();
}

function renderColumnSelect(select: HTMLSelectElement, header: string[], selectedIndex: number | undefined, emptyLabel?: string): void {
  const options = header
    .map((column, index) => `<option value="${index}"${index === selectedIndex ? " selected" : ""}>${escapeHtml(column)}</option>`)
    .join("");
  const emptyOption =
    emptyLabel === undefined ? "" : `<option value=""${selectedIndex === undefined ? " selected" : ""}>${escapeHtml(emptyLabel)}</option>`;

  select.innerHTML = `${emptyOption}${options}`;
}

function renderImportTypeSelect(): void {
  importTypeSelect.innerHTML = badgeTypes
    .map(
      (type) =>
        `<option value="${type}"${type === "attendee" ? " selected" : ""}>All ${escapeHtml(roleLabels[type].toLowerCase())}s</option>`,
    )
    .join("");
}

function readImportMapping(): CsvImportMapping {
  const fixedType = parseBadgeType(importTypeSelect.value);
  const nameColumnIndex = readSelectedColumnIndex(nameColumnSelect);
  const companyColumnIndex = readSelectedColumnIndex(companyColumnSelect);

  return {
    ...(nameColumnIndex === undefined ? {} : { nameColumnIndex }),
    ...(companyColumnIndex === undefined ? {} : { companyColumnIndex }),
    ...(fixedType === undefined ? {} : { fixedType }),
  };
}

function readSelectedColumnIndex(select: HTMLSelectElement): number | undefined {
  if (select.value === "") {
    return undefined;
  }

  const index = Number(select.value.replace("column:", ""));

  return Number.isInteger(index) ? index : undefined;
}

function render(): void {
  renderPreview();
  renderRoleTabs();
  renderPeopleList();
  renderRoleCounts();
  renderPrintSheets();
}

function renderPreview(): void {
  const person = people.find((candidate) => candidate.type === previewRole) ?? previewPeople[previewRole];

  previewElement.innerHTML = renderBadge(person, { guides: true });
}

function renderRoleTabs(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-preview-role]").forEach((button) => {
    const selected = button.dataset.previewRole === previewRole;
    button.setAttribute("aria-selected", String(selected));
  });
}

function renderPeopleList(): void {
  if (people.length === 0) {
    peopleListElement.innerHTML = `<p class="empty-state">Import CSV rows to generate badges.</p>`;
    return;
  }

  peopleListElement.innerHTML = people
    .map(
      (person, index) => `<button class="person-row" type="button" data-person-index="${index}">
        <span>
          <strong>${escapeHtml(person.name)}</strong>
          <small>${escapeHtml(person.company ?? "No company")}</small>
        </span>
        <em>${escapeHtml(roleLabels[person.type])}</em>
      </button>`,
    )
    .join("");

  peopleListElement.querySelectorAll<HTMLButtonElement>("[data-person-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.personIndex ?? "-1");
      const person = people[index];

      if (!person) {
        return;
      }

      previewRole = person.type;
      previewElement.innerHTML = renderBadge(person, { guides: true });
      renderRoleTabs();
    });
  });
}

function renderRoleCounts(): void {
  roleCountsElement.innerHTML = badgeTypes
    .map((type) => {
      const count = people.filter((person) => person.type === type).length;
      return `<div><dt>${escapeHtml(roleLabels[type])}</dt><dd>${count}</dd></div>`;
    })
    .join("");
}

function renderPrintSheets(): void {
  printRoot.innerHTML = badgeTypes
    .map((type) => {
      const rolePeople = people.filter((person) => person.type === type);
      const sheets =
        rolePeople.length === 0
          ? `<section class="print-sheet print-${type}"><p class="print-empty">No ${escapeHtml(roleLabels[type].toLowerCase())} badges.</p></section>`
          : rolePeople
              .map((person) => `<section class="print-sheet print-${type}">${renderBadge(person, { guides: false })}</section>`)
              .join("");

      return sheets;
    })
    .join("");
}

function renderBadge(person: BadgePerson, options: { readonly guides: boolean }): string {
  const company = person.company ? `<p class="badge-company">${escapeHtml(person.company)}</p>` : "";
  const nameLength = person.name.length;
  const nameSize = nameLength > 34 ? "badge-name--compact" : nameLength > 24 ? "badge-name--long" : "";
  const guideClass = options.guides ? " badge--guides" : "";

  return `<article class="badge badge--${person.type}${guideClass}" aria-label="${escapeHtml(roleLabels[person.type])} badge for ${escapeHtml(person.name)}">
    <div class="badge-hole" aria-hidden="true"></div>
    <div class="badge-safe" aria-hidden="true"></div>
    <div class="badge-content">
      <img class="badge-logo" src="/assets/future-frontend-2026.svg" alt="Future Frontend 2026">
      <div class="badge-person">
        <h3 class="badge-name ${nameSize}">${escapeHtml(person.name)}</h3>
        ${company}
      </div>
    </div>
  </article>`;
}

function parseBadgeCsv(csv: string, mapping: CsvImportMapping): { readonly people: BadgePerson[]; readonly issues: CsvIssue[] } {
  const records = parseCsvRecords(csv);
  const issues: CsvIssue[] = [];
  const header = records[0];

  if (!header) {
    return { people: [], issues: [{ row: 1, message: "CSV is empty." }] };
  }

  const columns = header.cells.map(normalizeColumnName);
  const nameIndex = mapping.nameColumnIndex ?? findColumnAliasIndex(columns, ["name", "full name", "ticket full name"]) ?? -1;
  const companyIndex =
    mapping.companyColumnIndex ?? findColumnAliasIndex(columns, ["company", "company name", "ticket company name"]) ?? -1;
  const typeIndex = findColumnAliasIndex(columns, ["type", "role"]) ?? -1;

  if (nameIndex === -1) {
    return { people: [], issues: [{ row: 1, message: 'Missing required "name" column.' }] };
  }

  const parsedPeople = records.slice(1).flatMap((record) => {
    if (record.cells.every((cell) => cell.trim() === "")) {
      return [];
    }

    const name = readCell(record, nameIndex).trim();
    const company = companyIndex === -1 ? "" : readCell(record, companyIndex).trim();
    const rawType = mapping.fixedType ?? (typeIndex === -1 ? "" : readCell(record, typeIndex).trim().toLowerCase());
    const type = rawType === "" ? "attendee" : parseBadgeType(rawType);

    if (name === "") {
      issues.push({ row: record.row, message: "Missing attendee name." });
      return [];
    }

    if (!type) {
      issues.push({ row: record.row, message: `Unknown badge type "${rawType}".` });
      return [];
    }

    return [{ name, ...(company === "" ? {} : { company }), type }];
  });

  return { people: parsedPeople, issues };
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

function findColumnAliasIndex(columns: string[], aliases: readonly string[]): number | undefined {
  return aliases.map((alias) => columns.indexOf(alias)).find((index) => index !== -1);
}

function parseBadgeType(value: string): BadgeType | undefined {
  return badgeTypes.find((type) => type === value);
}

function readCell(record: CsvRecord, index: number): string {
  return record.cells[index] ?? "";
}

function trimCarriageReturn(value: string): string {
  return value.endsWith("\r") ? value.slice(0, -1) : value;
}

function normalizeColumnName(column: string): string {
  return column.trim().toLowerCase();
}

function requiredElement<ElementType extends HTMLElement>(id: string): ElementType {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing #${id}`);
  }

  return element as ElementType;
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export {};
