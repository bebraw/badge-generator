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
- `attendee`: white background, black text, full-pass strip.
- `design`: white background, black text, design-day strip.
- `development`: white background, black text, development-day strip.

The role variants share the same content layout so generated print sheets stay predictable.

## Badge Content

Each badge contains:

- the Future Frontend 2026 logo,
- attendee name,
- optional attendee company.

The logo sits near the top with about 15 mm between the coaster top edge and the logo. Name is the primary readable element. Company is hidden when missing rather than leaving an empty line. Speaker and organizer roles are communicated through badge color. Attendee pass variants print an explicit bottom strip so regular, Design day, and Development day tickets can be checked at a glance.

Users can add a desired number of blank badges for any supported role. Blank badges keep the role color and logo but omit name and company content.

## CSV Input

The first supported CSV contract is:

```csv
name,company,type
Ada Lovelace,Analytical Engines,speaker
Grace Hopper,,
Linus Torvalds,Linux Foundation,attendee
Aino Designer,Future Studio,design
Edsger Dijkstra,Technische Universiteit Eindhoven,development
```

Fields:

- `name`: required.
- `company`: optional.
- `type`: optional, defaults to `attendee`.

Supported badge types are `attendee`, `design`, `development`, `speaker`, and `organizer`. The parser also accepts common attendee pass aliases including `regular`, `full pass`, `design day`, `dev day`, and `development day`.

The importer also supports field mapping for wider event exports. By default it recognizes these aliases:

- `name`: `name`, `full name`, `ticket full name`.
- `company`: `company`, `company name`, `ticket company name`.

Users can override the selected name and company columns after loading a CSV. The browser importer uses one fixed badge type for the current import, selected from the supported badge types, instead of pulling roles from CSV columns. This supports separate CSV files for regular attendees, design-day attendees, and development-day attendees while avoiding ticketing product names being treated as badge roles.

The parser must:

- trim whitespace,
- preserve non-ASCII names,
- handle quoted commas and escaped quotes,
- skip blank rows,
- report missing names with row numbers,
- report unknown badge types with row numbers,
- report missing required columns.

## Print Output

- Output targets browser print/PDF with 100 mm by 100 mm pages.
- Each PDF page contains one physical-size badge that fills the page box.
- Printed badges keep a sub-millimeter inset from the page edge to avoid browser PDF edge clipping.
- The application provides separate print views for speakers, organizers, regular attendees, design-day attendees, and development-day attendees.
- Printed badges must request exact print color adjustment so role backgrounds match the on-screen preview when the browser allows background graphics.
- Printed badges must include a visible circular card outline so the printer can see the badge boundary in generated PDFs, including white attendee badges.
- Print guides for trim, safe area, and hole placement may be visible in preview and configurable for print.
- The app must not impose badges onto A4 sheets because custom 100 mm PDF pages should not scale the artwork down.
