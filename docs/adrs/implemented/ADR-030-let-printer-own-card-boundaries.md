# ADR-030: Let Printer Own Card Boundaries

## Status

Implemented

## Context

The print workflow previously drew a circular card outline in generated PDFs so the badge boundary was visible to the printing company, including on white attendee badges.

The printing company has confirmed that the app does not need to draw card boundary lines. They will handle boundary detection themselves.

## Decision

Remove print-only circular card outlines from badge PDFs.

Printed badges use solid page-sized role background fills and exact print color adjustment. The app still renders one physical-size badge on each 100 mm by 100 mm PDF page, but print CSS no longer clips the artwork to a circle or adds a sub-millimeter internal inset.

This supersedes the print-inset portion of ADR-029.

## Consequences

- Generated print PDFs no longer include artificial boundary lines that could appear in production output.
- Speaker and organizer PDFs fill the whole page with their role background instead of leaving white page corners around a circle.
- White attendee-style badges rely on the page-sized artwork contract and printer handling rather than an app-drawn edge.
- The print CSS stays focused on badge artwork, page size, spacing, and color fidelity.
