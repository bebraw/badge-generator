# Future Frontend Badge Generator

This repository is a web application for designing, previewing, and printing round conference badges for [Future Frontend](https://futurefrontend.com/).

The immediate target is the Future Frontend 2026 badge run: 10 cm diameter round coaster badges with one hole at the top, generated from attendee CSV data and exported through a print-ready browser PDF flow.

## Badge Brief

- Physical format: round coaster badge, 100 mm diameter.
- Hardware constraint: one top hole near 12 o'clock for a standard lanyard. Exact hole placement is left to the printer, but the artwork must keep the top area clear.
- Safe margin: keep all required content at least 5 mm away from the coaster edge. Treat the hole area as additional no-content space.
- Badge types:
  - Speaker: black badge with white text.
  - Organizer: grey badge with dark or white text depending on final contrast checks.
  - Attendee: white badge with black text.
- Required content:
  - Future Frontend conference logo from `2026-with-text.svg`.
  - Attendee name.
  - Attendee company, optional.
- Source data: CSV files containing attendee names and companies.
- Output: print-ready A4 PDFs produced from the browser print dialog or an equivalent in-app print view.
- Print grouping: generate separate print views/PDFs for speakers, organizers, and attendees.
- Typography: Finlandica. The official Finland Toolbox page says Finlandica is the Suomi Finland visual identity typeface, with Regular and Bold available, and recommends Finlandica Headline for headings and Finlandica Text for body text: <https://toolbox.finland.fi/brand-identity-and-guidelines/finlandica-font/>.

## Product Goals

The application should make badge production repeatable without turning the repo into a heavy publishing system.

1. Preview a single badge design at physical scale.
2. Switch between attendee, speaker, and organizer variants.
3. Import CSV attendee data.
4. Validate imported rows before printing.
5. Preview all generated badges.
6. Print or save separate A4 PDFs for each badge role.

## Proposed Badge Designs

The first implementation should keep the design system simple and accessible:

- Use a circular 100 mm artboard with visible trim boundary in preview mode.
- Reserve the top hole area with a no-content zone centered around 12 o'clock.
- Keep the logo, name, and company inside the 5 mm safe margin.
- Place the Future Frontend logo near the top while keeping about 15 mm between the top edge of the coaster and the logo.
- Set the attendee name as the primary typographic element, centered and large enough to read at arm's length.
- Place the company below the name in a smaller weight or size. Hide the company line completely when missing.
- Do not print the role name on the badge; the role is already clear from the badge color.
- Keep role color variants identical in layout so CSV data and print pagination stay predictable.
- Use Finlandica Headline Bold for names and role labels, and Finlandica Text Regular for company text and supporting UI.
- Use dynamic text fitting for long names and companies rather than clipping.

Initial color direction:

| Badge type | Background                  | Text  | Notes                                                               |
| ---------- | --------------------------- | ----- | ------------------------------------------------------------------- |
| Speaker    | Black                       | White | Highest contrast, strongest stage-facing variant.                   |
| Organizer  | Winter grey or neutral grey | Black | Final grey should pass WCAG contrast against the chosen text color. |
| Attendee   | White                       | Black | Clean default badge for the largest batch.                          |

## CSV Contract

The first supported CSV shape should be explicit and forgiving:

```csv
name,company,type
Ada Lovelace,Analytical Engines,speaker
Grace Hopper,,
Linus Torvalds,Linux Foundation,attendee
```

Fields:

- `name`: required.
- `company`: optional.
- `type`: optional; defaults to `attendee`. Supported values are `attendee`, `speaker`, and `organizer`.

Wider ticketing exports can be imported by mapping columns in the app. The importer recognizes `Ticket Full Name` as a default name source and `Ticket Company Name` as a default company source. For exports where ticket names are products rather than badge roles, set one fixed import role before updating badges.

The importer should report row-level errors for missing names and unknown badge types. It should trim whitespace and preserve non-ASCII names.

## Application Plan

This repo currently ships as a Cloudflare Worker application with server-rendered HTML, TypeScript, Tailwind, and local quality gates. The badge generator can build on that baseline.

1. Replace the starter page with a badge-generator workspace.
2. Add typed domain models for badge people, badge types, CSV parse results, and print layout settings.
3. Add client-side modules for CSV import, preview state, and print preparation. Keep browser code out of inline Worker HTML.
4. Add reusable view components for:
   - single badge preview,
   - role variant controls,
   - CSV import and validation summary,
   - imported attendee table,
   - print sheet preview.
5. Add print CSS with physical units:
   - A4 `@page` output,
   - 100 mm circular badge boxes,
   - optional trim and hole guides hidden or configurable for final print.
6. Add role-specific print routes or views so speaker, organizer, and attendee PDFs can be saved independently.
7. Add tests for CSV parsing, badge type defaults, validation errors, and render output.
8. Add browser tests for import, preview switching, and print view generation.

## Print Planning Notes

Known print defaults:

- Use A4 PDF output.
- Separate output by role: one speaker PDF, one organizer PDF, and one attendee PDF.
- Include a visible circular card outline in printed PDFs for the printer.
- Keep a 5 mm safe margin around the coaster edge.
- Leave final hole placement to the printer, while keeping the top lanyard area clear.

Open print details to confirm before final implementation:

- Whether the printing company prefers one badge per A4 page or multiple badges per A4 sheet.
- Required bleed, trim marks, and whether the hole guide should appear in final artwork.
- Exact standard lanyard hole diameter, if the printer wants the app to draw a guide.
- Whether the printer needs RGB PDF from browser output or CMYK-ready artwork from another export path.

Until printer-specific details are known, the safest first milestone is a browser print view with accurate 100 mm badge geometry, A4 pagination, role-specific PDFs, a 5 mm content safe margin, and optional on-screen print guides.

## Documentation

- Development setup and local CI: `docs/development.md`
- Architecture decisions: `docs/adrs/README.md`
- Feature and architecture specs: `specs/README.md`
- Agent behavior and project rules: `AGENTS.md`

## Runtime

- Run `nvm use` before `npm install` or any other development command so your shell picks up the repo-pinned Node.js version from `.nvmrc` and stays close to the expected npm baseline.
- Install dependencies with `npm install`.
- `npm install` also configures the repo-managed `pre-push` hook so `git push` runs `npm run quality:gate:fast` before code leaves your machine.
- The exact project Node.js version is pinned in `package.json` and mirrored in `.nvmrc` for `nvm` users, and CI reads the `package.json` value directly.
- npm is constrained in `package.json`; local development is expected to use `nvm use`.
- Copy `.dev.vars.example` to `.dev.vars` before running projects that need local secrets.
- Use repo-pinned CLI tools through `npx`, including `npx wrangler`.
- Start the Worker with `npm run dev`, then open `http://127.0.0.1:8787`.
- Rebuild generated CSS and browser JavaScript manually with `npm run build:assets` when needed.

## Verification

- Run the fast local gate with `npm run quality:gate:fast` during normal iteration.
- Run the baseline repo gate with `npm run quality:gate`.
- Run the containerized local workflow with `npm run ci:local`; it uses Agent CI parallelism with a local install lock and pauses failed runners for retry.
- The repo-managed `pre-push` hook runs `npm run quality:gate:fast` automatically after `npm install`.
- If local Agent CI warns about `No such remote 'origin'`, set `GITHUB_REPO=owner/repo` in `.env.agent-ci`.
- Retry a paused local CI run with `npm run ci:local:retry -- --name <runner-name>`.
- Install the pinned Playwright browser with `npm run playwright:install`.
- Run unit tests from colocated `src/**/*.test.ts` files with `npm test`.
- Run browser tests from colocated `src/**/*.e2e.ts` files with `npm run e2e`.
- Run mutation tests against runtime `src/**/*.ts` files with `npm run mutation`.

## Source Layout

- `src/worker.ts` is the Worker entry point and top-level router.
- `src/api/` holds API response modules such as the health endpoint.
- `src/badges/` holds badge domain models and CSV parsing.
- `src/client/` holds the typed browser module that is built into `.generated/badge-app.client.js`.
- `src/views/` holds HTML rendering modules.
- Tests live next to the code they exercise under `src/`.
