# ADR 0001: PDF Engine For First Slice

## Status

Accepted for spike, not final for production.

## Decision

Use `pdf.js` in the renderer for first-page display and `pypdf` in the Python sidecar for initial native text geometry extraction.

## Rationale

Both are redistributable and allow a fast testable vertical slice without requiring native binaries in the first commit.

## Consequences

This does not yet satisfy the long-term same-engine fidelity requirement. A follow-up spike must validate PDFium or another permissively licensed engine for both rendering and geometry extraction before production claims.
