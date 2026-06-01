# ADR-029: Use 100mm PDF Pages for Badges

## Status

Implemented

## Context

The first print workflow imposed 100 mm badges on A4 browser print pages. The printing company now requires PDF pages that are 100 mm by 100 mm with one badge per page.

When users choose a custom 100 mm square PDF page size while the app still renders an A4 print sheet, browsers scale the A4 sheet down to fit the smaller page. That preserves the page dimensions but makes the badge artwork too small.

## Decision

Set the browser print `@page` size to 100 mm by 100 mm and make each generated print sheet the same size. Each print sheet contains one 100 mm circular badge centered in the page box.

Keep separate role-specific print entry points so speakers, organizers, regular attendees, design-day attendees, and development-day attendees can still be exported as separate PDFs.

Apply a sub-millimeter internal print inset so browser PDF renderers do not clip the anti-aliased circular edge at the page crop boundary.

## Consequences

- Generated PDFs match the printer's one-badge-per-page requirement.
- Badge artwork is no longer scaled down by fitting an A4 sheet into a 100 mm page.
- The circular artwork does not sit exactly on the PDF crop boundary, avoiding slight right or bottom edge clipping in browser print previews.
- The app no longer performs A4 imposition; any later sheet imposition should be a separate explicit workflow.
