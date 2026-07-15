# Execution Plan

## Wave 0 Goal

Make the current extraction and overlay behavior observable, reproducible, and reviewable before any broad rewrite.

## Current Evidence

- Current renderer: `pdf.js`.
- Current extractor: `pypdf`.
- Current semantic boxes: estimated rectangles from text fragments.
- Current diagnostic fixture and artifacts exist under `test-data/regressions/current-overlay-failure/` and `artifacts/diagnostics/`.

## Agents Assigned

- Program Orchestrator: repository inventory, execution plan, risk register.
- PDF Standards and Geometry Researcher: source validation and coordinate-risk notes.
- Python Extraction Engineer: diagnostic extraction RPC and artifact capture.
- TypeScript Viewer Engineer: current overlay class/object identification.
- Independent Reviewer: Wave 0 gate status.

## Planned Files

- `services/extraction/src/extraction_service/native_pdf.py`
- `services/extraction/src/extraction_service/rpc.py`
- `scripts/capture-wave0-diagnostics.ps1`
- `docs/diagnostics/*`
- `docs/architecture/current-system-map.md`
- `docs/roadmap/risk-register.md`

## Contracts Affected

No production contract change. A diagnostic JSON-RPC method was added for observability.

## Risks

- Diagnostic output is intentionally not a stable public schema.
- `pypdf` does not expose actual glyph quads in the current integration.
- The supplied screenshot source PDF has not been identified.

## Test Plan

- Python unit tests for diagnostic extraction.
- Existing JavaScript unit tests.
- `npm run verify:package` after packaging-affecting work.

## Metrics

Initial metrics are observability counts: raw runs, semantic words, whitespace-only raw runs, whitespace-only semantic words, and geometry method.

## Acceptance Gate

Gate 0 is not fully passed. The current system is documented and instrumented, and an overlay screenshot artifact has been captured from the existing vertical-slice fixture. The supplied screenshot failure has not been reproduced from its original PDF, and actual-versus-loose geometry is unavailable with the current engine.

## Reviewed Remediation Plan For Waves 1-3

Wave 1 should define a versioned geometry contract before changing overlays. Wave 2 should introduce immutable source-character evidence with actual and loose geometry from an engine that supports it. Wave 3 should reconstruct words and lines from source-character features rather than text fragments.
