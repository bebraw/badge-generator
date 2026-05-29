# ADR-028: Cover Browser Modules with Playwright

## Status

Implemented

## Context

The badge generator adds typed browser code under `src/client/` for CSV import, preview updates, and print preparation. The existing unit coverage gate runs with Vitest in Node and does not provide a browser DOM.

Including browser-only modules in Vitest coverage makes the unit gate fail on code that is exercised more accurately by Playwright.

## Decision

Exclude `src/client/**` from Vitest coverage and Stryker mutation testing. Require browser behavior to be covered by Playwright end-to-end tests.

Shared pure domain code remains under normal Vitest coverage.

## Consequences

- Browser behavior is validated in the environment where it runs.
- The unit coverage and mutation gates remain focused on Worker, domain, and view code.
- New browser workflows need Playwright coverage instead of relying on the unit coverage threshold.
