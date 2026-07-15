# Product Quality Loop

This file is the running execution log for the manager/worker/QA loop requested for the PDF extraction product.

## Team Structure

- Manager Agent: owns execution plan, integration, GitHub updates, and release decisions.
- PDF Fixture Worker: designs deterministic synthetic PDFs and expected assertions.
- Viewer Worker: owns word selection, pattern discovery, and overlay behavior.
- Extraction Worker: owns sidecar extraction quality and geometry regressions.
- QA Agent: tests service, renderer, E2E, and packaged `.exe` behavior before release claims.

All worker outputs must be reviewed by the Manager Agent and pass QA before being treated as accepted.

## Current Execution Loop

Date: 2026-07-15

Goal:

- Stop extensive same-line word overlay overlap.
- Allow a user to select a word and discover same-word occurrences across the extracted document.
- Add extensive synthetic check-register PDFs for repeatable testing.

Completed:

- Added same-line overlap resolution in the Python sidecar.
- Changed native extraction IPC to extract all pages instead of only page 1.
- Added renderer page navigation.
- Added same-word pattern discovery and current-page pattern highlighting.
- Added a 12-page nonstandard synthetic check-register generator.
- Added service-level check-register and overlap tests.
- Added app-level Playwright check-register quality test.
- Added packaged `.exe` Playwright check-register quality test.

QA Status:

- Passed service, renderer, Electron E2E, package artifact, packaged-app smoke, and packaged check-register quality validation for this loop.

Commands Passed:

- `.venv\Scripts\python.exe -m pytest services/extraction/tests`
- `.venv\Scripts\python.exe -m ruff check services/extraction/src services/extraction/tests`
- `.venv\Scripts\python.exe -m mypy services/extraction/src`
- `npm test`
- `npm run build`
- `npm --workspace @pdf-intelligence/desktop run test:e2e`
- `npm run package:installer`
- `npm run verify:package`
- `npm --workspace @pdf-intelligence/desktop run test:package` with 2 packaged `.exe` tests passing

Issue Encountered And Resolved:

- First installer rebuild failed because stale packaged app and sidecar processes were locking `installers/dev/win-unpacked`.
- Manager stopped only the stale `PDF Intelligence` and `extraction-service` processes under that package directory, then packaging passed.

Known Limitations:

- Current geometry still uses estimated rectangles from `pypdf` text fragments.
- This loop improves overlap behavior but does not complete the future source-character geometry contract.
- “Zero defects” is a target, not a certifiable claim from one local run.
