export const badgeTypes = ["attendee", "speaker", "organizer"] as const;

export type BadgeType = (typeof badgeTypes)[number];

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

export function isBadgeType(value: string): value is BadgeType {
  return badgeTypes.includes(value as BadgeType);
}
