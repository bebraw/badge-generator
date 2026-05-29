# ADR-027: Build a Browser Module for the Badge Generator

## Status

Implemented

## Context

The badge generator needs browser-side behavior for CSV file import, local preview state, role filtering, and print preparation. Project architecture disallows inline browser scripts in Worker-rendered HTML, and the repo does not currently include a browser application bundler.

## Decision

Add a small build step that transpiles a typed TypeScript browser entrypoint into `.generated/badge-app.js` with the existing TypeScript dependency.

The Worker serves the generated module as `/badge-app.js`. HTML views reference it as an external module script.

## Consequences

- Client behavior remains typed and testable without adding a new dependency.
- `.generated` remains the only generated write target.
- The Worker keeps serving server-rendered HTML while the browser module owns local CSV import and print-state behavior.
- Future richer client work may justify a dedicated bundler, but this project does not need one yet.

