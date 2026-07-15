# Wave 0 Initial Agent Report

## Repository Areas Inspected

- Electron renderer overlay path.
- Electron main/preload IPC boundary.
- Python sidecar extraction and RPC handling.
- Shared TypeScript contracts.
- Existing architecture, QA, roadmap, and release docs.

## Assumptions

- The master prompt is the controlling enhancement direction for this pass.
- The original screenshot-producing PDF is not currently available in the workspace.
- The first implementation change should improve observability without changing visible extraction behavior.

## Findings

- Current semantic word boxes are estimated from `pypdf` text fragments.
- Raw text fragments, including empty fragments, were previously not available in artifacts.
- Renderer overlay boxes are HTML buttons using normalized rectangles.
- The system has no source-character model, no quads, and no explicit coordinate-space contract.

## Decisions

- Added a diagnostic extraction path instead of changing production overlay behavior.
- Created a synthetic regression fixture that exposes text-fragment-to-word-box behavior.
- Marked Gate 0 as not fully passed because original failure reproduction and actual glyph geometry are missing.

## Files Changed

- `services/extraction/src/extraction_service/native_pdf.py`
- `services/extraction/src/extraction_service/rpc.py`
- `services/extraction/tests/test_native_pdf.py`
- `services/extraction/tests/test_rpc.py`
- `scripts/capture-wave0-diagnostics.ps1`
- Wave 0 docs and diagnostic artifacts.

## Tests Added

- Diagnostic extraction preserves raw text runs while semantic extraction creates only non-whitespace words.
- RPC dispatch covers the new diagnostic method error path.

## Tests Run

- `.venv\Scripts\python.exe -m pytest services/extraction/tests`
- `.venv\Scripts\python.exe -m ruff check services/extraction/src services/extraction/tests`
- `.venv\Scripts\python.exe -m mypy services/extraction/src`
- `npm test`
- `npm run build`
- `npm --workspace @pdf-intelligence/desktop run test:e2e`

## Metrics

- Synthetic fixture semantic words: 4.
- Whitespace-only semantic words: 0.
- Actual glyph geometry availability: unavailable in current integration.

## Unresolved Risks

- Need original failure PDF or screenshot fixture for exact reproduction.
- Need source-character engine decision before Wave 2.
- Need a typed transform service before systematic overlay fixes.
