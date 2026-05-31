type BadgeType = "attendee" | "design" | "development" | "speaker" | "organizer";

interface BadgePerson {
  readonly name?: string;
  readonly company?: string;
  readonly type: BadgeType;
  readonly blank?: true;
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

const badgeTypes: readonly BadgeType[] = ["attendee", "design", "development", "speaker", "organizer"];
const printClassNames = badgeTypes.map((type) => `print-${type}`);
const badgeTypeAliases: Record<string, BadgeType> = {
  regular: "attendee",
  "regular attendee": "attendee",
  "regular attendees": "attendee",
  "full pass": "attendee",
  design: "design",
  "design day": "design",
  "design day attendee": "design",
  development: "development",
  dev: "development",
  "dev day": "development",
  "development day": "development",
  "development day attendee": "development",
};
const roleLabels: Record<BadgeType, string> = {
  speaker: "Speaker",
  organizer: "Organizer",
  attendee: "Regular",
  design: "Design Day",
  development: "Development Day",
};
const importLabels: Record<BadgeType, string> = {
  speaker: "All speakers",
  organizer: "All organizers",
  attendee: "All regular attendees",
  design: "All design day attendees",
  development: "All development day attendees",
};
const passLabels: Partial<Record<BadgeType, string>> = {
  attendee: "Full Pass",
  design: "Design Day",
  development: "Dev Day",
};
const previewPeople: Record<BadgeType, BadgePerson> = {
  speaker: { name: "Ada Lovelace", company: "Analytical Engines", type: "speaker" },
  organizer: { name: "Grace Hopper", type: "organizer" },
  attendee: { name: "Linus Torvalds", company: "Linux Foundation", type: "attendee" },
  design: { name: "Aino Designer", company: "Future Studio", type: "design" },
  development: { name: "Edsger Dijkstra", company: "Technische Universiteit Eindhoven", type: "development" },
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
const blankTypeSelect = requiredElement<HTMLSelectElement>("blank-type");
const blankCountInput = requiredElement<HTMLInputElement>("blank-count");
const addBlankBadgesButton = requiredElement<HTMLButtonElement>("add-blank-badges");
const previewElement = requiredElement<HTMLElement>("badge-preview");
const peopleListElement = requiredElement<HTMLElement>("people-list");
const roleCountsElement = requiredElement<HTMLElement>("role-counts");
const printRoot = requiredElement<HTMLElement>("print-root");

loadButton.addEventListener("click", () => {
  loadCsv(csvInput.value, readImportMapping());
});

addBlankBadgesButton.addEventListener("click", () => {
  addBlankBadges();
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

    document.body.classList.remove(...printClassNames);
    document.body.classList.add(`print-${role}`);
    window.print();
  });
});

statusElement.textContent = "No CSV imported yet. Preview uses sample badges.";
renderCsvMappingControls(csvInput.value);
renderBlankTypeSelect();
render();

function loadCsv(csv: string, mapping: CsvImportMapping): void {
  const result = parseBadgeCsv(csv, mapping);
  people = result.people;
  previewRole = people[0]?.type ?? previewRole;

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
    .map((type) => `<option value="${type}"${type === "attendee" ? " selected" : ""}>${escapeHtml(importLabels[type])}</option>`)
    .join("");
}

function renderBlankTypeSelect(): void {
  blankTypeSelect.innerHTML = badgeTypes
    .map((type) => `<option value="${type}"${type === "attendee" ? " selected" : ""}>${escapeHtml(roleLabels[type])}</option>`)
    .join("");
}

function addBlankBadges(): void {
  const type = parseBadgeType(blankTypeSelect.value);
  const count = Number(blankCountInput.value);

  if (!type || !Number.isInteger(count) || count < 1 || count > 500) {
    statusElement.textContent = "Enter a blank badge amount from 1 to 500.";
    return;
  }

  people = [...people, ...Array.from({ length: count }, () => ({ type, blank: true }) satisfies BadgePerson)];
  statusElement.textContent = `${count} blank ${roleLabels[type].toLowerCase()} badge${count === 1 ? "" : "s"} added.`;
  previewRole = type;
  render();
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
          <strong>${escapeHtml(formatPersonName(person))}</strong>
          <small>${escapeHtml(formatPersonCompany(person))}</small>
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
  const name = person.name ?? "";
  const nameLength = name.length;
  const nameSize = nameLength > 34 ? "badge-name--compact" : nameLength > 24 ? "badge-name--long" : "";
  const nameMarkup = name === "" ? "" : `<h3 class="badge-name ${nameSize}">${escapeHtml(name)}</h3>`;
  const personMarkup =
    nameMarkup === "" && company === ""
      ? ""
      : `<div class="badge-person">
        ${nameMarkup}
        ${company}
      </div>`;
  const guideClass = options.guides ? " badge--guides" : "";
  const ariaLabel = person.blank ? `Blank ${roleLabels[person.type]} badge` : `${roleLabels[person.type]} badge for ${person.name ?? ""}`;
  const passLabel = passLabels[person.type];
  const passMarkup = passLabel === undefined ? "" : `<p class="badge-pass">${escapeHtml(passLabel)}</p>`;

  return `<article class="badge badge--${person.type}${guideClass}" aria-label="${escapeHtml(ariaLabel)}">
    <div class="badge-hole" aria-hidden="true"></div>
    <div class="badge-safe" aria-hidden="true"></div>
    <div class="badge-content">
      <img class="badge-logo" src="/assets/future-frontend-2026.svg" alt="Future Frontend 2026">
      ${personMarkup}
    </div>
    ${passMarkup}
  </article>`;
}

function formatPersonName(person: BadgePerson): string {
  return person.blank ? "Blank badge" : (person.name ?? "");
}

function formatPersonCompany(person: BadgePerson): string {
  if (person.blank) {
    return "No name or company";
  }

  return person.company ?? "No company";
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
  const typeIndex = findColumnAliasIndex(columns, ["type", "role", "ticket type", "badge type"]) ?? -1;

  if (nameIndex === -1) {
    return { people: [], issues: [{ row: 1, message: 'Missing required "name" column.' }] };
  }

  const parsedPeople = records.slice(1).flatMap((record) => {
    if (record.cells.every((cell) => cell.trim() === "")) {
      return [];
    }

    const name = readCell(record, nameIndex).trim();
    const company = companyIndex === -1 ? "" : readCell(record, companyIndex).trim();
    const rawType = mapping.fixedType ?? (typeIndex === -1 ? "" : readCell(record, typeIndex).trim());
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
  const normalizedValue = value.trim().toLowerCase();
  return badgeTypes.find((type) => type === normalizedValue) ?? badgeTypeAliases[normalizedValue];
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
