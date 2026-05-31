export const badgeTypes = ["attendee", "design", "development", "speaker", "organizer"] as const;

export type BadgeType = (typeof badgeTypes)[number];

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

export interface BadgePerson {
  readonly name: string;
  readonly company?: string;
  readonly type: BadgeType;
}

export interface CsvIssue {
  readonly row: number;
  readonly message: string;
}

export interface CsvParseResult {
  readonly people: BadgePerson[];
  readonly issues: CsvIssue[];
}

export interface CsvImportMapping {
  readonly nameColumn?: string;
  readonly companyColumn?: string;
  readonly typeColumn?: string;
  readonly fixedType?: BadgeType;
}

export function isBadgeType(value: string): value is BadgeType {
  return badgeTypes.includes(value as BadgeType);
}

export function parseBadgeType(value: string): BadgeType | undefined {
  const normalizedValue = value.trim().toLowerCase();

  if (isBadgeType(normalizedValue)) {
    return normalizedValue;
  }

  return badgeTypeAliases[normalizedValue];
}
