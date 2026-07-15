# ADR 0006: Project Persistence

## Status

Accepted for first slice.

## Decision

Use versioned JSON project files for the first slice, then migrate to SQLite-backed project folders before Milestone 3 exit.

## Rationale

JSON makes the save/reopen path testable immediately without hiding incomplete migration work.
