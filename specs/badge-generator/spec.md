# Badge Generator Spec

## Purpose

The badge generator produces printable Future Frontend conference badges from CSV attendee data.

## Badge Format

- Badges are circular coaster-style badges with a 100 mm diameter.
- Each badge has one top hole near 12 o'clock for a standard lanyard.
- Final hole placement is controlled by the printer, so app artwork must keep the top lanyard area clear.
- Required badge content must stay at least 5 mm away from the coaster edge.
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

The logo sits near the top with about 15 mm between the coaster top edge and the logo. Name is the primary readable element. Company is hidden when missing rather than leaving an empty line. The badge role is not printed on the badge because the role is communicated through the badge color.

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

The importer also supports field mapping for wider event exports. By default it recognizes these aliases:

- `name`: `name`, `full name`, `ticket full name`.
- `company`: `company`, `company name`, `ticket company name`.

Users can override the selected name and company columns after loading a CSV. The browser importer uses one fixed badge type for the current import, selected from the supported badge types, instead of pulling roles from CSV columns. This avoids treating ticketing product names as badge roles.

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
- Printed badges must request exact print color adjustment so role backgrounds match the on-screen preview when the browser allows background graphics.
- Printed badges must include a visible circular card outline so the printer can see the badge boundary in generated PDFs, including white attendee badges.
- Print guides for trim, safe area, and hole placement may be visible in preview and configurable for print.
- Until printer-specific imposition details are known, any A4 layout is acceptable if it is easy to print and preserves physical badge dimensions.
