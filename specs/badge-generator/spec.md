# Badge Generator Spec

## Purpose

The badge generator produces printable Future Frontend conference badges from CSV attendee data.

## Badge Format

- Badges are circular coaster-style badges with a 100 mm diameter.
- Each badge has one top hole near 12 o'clock for a standard lanyard.
- Final hole placement is controlled by the printer, so app artwork must keep the top lanyard area clear.
- Required badge content must stay at least 8 mm away from the coaster edge.
- The top lanyard area is additional no-content space beyond the edge safe margin.

## Badge Roles

- `speaker`: black background, white text.
- `organizer`: grey background, high-contrast text.
- `attendee`: white background, black text.

The role variants share the same content layout so generated print sheets stay predictable.

## Badge Content

Each badge contains:

- the Future Frontend 2026 logo,
- attendee name,
- optional attendee company.

Name is the primary readable element. Company is hidden when missing rather than leaving an empty line.

## CSV Input

The first supported CSV contract is:

```csv
name,company,type
Ada Lovelace,Analytical Engines,speaker
Grace Hopper,,
Linus Torvalds,Linux Foundation,attendee
```

Fields:

- `name`: required.
- `company`: optional.
- `type`: optional, defaults to `attendee`.

Supported badge types are `attendee`, `speaker`, and `organizer`.

The parser must:

- trim whitespace,
- preserve non-ASCII names,
- handle quoted commas and escaped quotes,
- skip blank rows,
- report missing names with row numbers,
- report unknown badge types with row numbers,
- report missing required columns.

## Print Output

- Output targets A4 browser print/PDF.
- The application provides separate print views for speakers, organizers, and attendees.
- Print guides for trim, safe area, and hole placement may be visible in preview and configurable for print.
- Until printer-specific imposition details are known, any A4 layout is acceptable if it is easy to print and preserves physical badge dimensions.

