# Roadmap

## Milestone 1: Application Shell

Status: first vertical slice scaffold complete; not production complete.

Completed in the initial scaffold:

- Monorepo structure.
- Electron main/preload/renderer packages.
- Python sidecar boundary.
- Initial documentation and ADRs.
- Secure renderer defaults: `contextIsolation: true`, `nodeIntegration: false`, strict preload API.
- PDF open/read flow.
- Native extraction request flow.
- Project save/reopen flow using versioned JSON.
- Unsigned Windows directory package at `installers/dev/win-unpacked`.
- PyInstaller extraction sidecar packaged at `resources/sidecar/extraction-service.exe`.

Remaining:

- Clean-machine package smoke test.
- Production code-signing certificate and CI secret handling.

## Milestone 2: PDF Viewer And Geometry Foundation

Status: started as a technical spike; fidelity not yet accepted.

Completed:

- `pdf.js` viewer.
- Word overlay rendering from normalized geometry.
- Generated-PDF sidecar extraction test.

Risks:

- `pdf.js` rendering and `pypdf` extraction are not a fully verified same-engine geometry path.
- Rust geometry crate builds and passes tests with Rust 1.97.0.
- Overlay alignment has not yet been verified with golden image comparisons, rotations, crop boxes, or high-DPI screenshots.

## Milestone 3+

Blocked until the geometry-overlay and packaged-sidecar spikes are verified.

## Latest Validation Evidence

- See `docs/status/risk-burndown.md` for the commit-by-commit roadblock trail.
- `npm test`: passed.
- `npm run build`: passed.
- `npm run package:dir`: passed, unsigned directory package.
- `npm audit --audit-level=moderate`: passed with 0 vulnerabilities.
- `python -m pytest services/extraction/tests`: passed.
- `python -m ruff check services/extraction/src services/extraction/tests`: passed.
- `python -m mypy services/extraction/src`: passed.
- `.venv` sidecar isolation through `uv`: passed.
- PyInstaller sidecar `health.check` smoke test: passed.
- Electron directory package includes compiled sidecar resource: passed.
- Playwright vertical-slice workflow: passed.
- Playwright golden overlay screenshot comparison: passed.
- Packaged app smoke test with development Python removed from `PATH`: passed.
- Sidecar process recovery test: passed.
- Privacy-safe main-process structured logging: implemented.
- NSIS installer generation and placeholder icon: implemented.
- Unsigned installer artifact: `installers/dev/PDF Intelligence Setup 0.1.0.exe`.
- `npm run verify:package`: passed against the rebuilt installer, unpacked app executable, and bundled sidecar health check.
- `cargo fmt --check`: passed.
- `cargo test`: passed.
- `cargo clippy --all-targets -- -D warnings`: passed.
