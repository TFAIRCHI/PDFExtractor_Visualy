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

- Electron integration smoke test.
- Sidecar process recovery test.
- Production logging.
- Installer, signing, icon, and executable metadata.
- Clean-machine package smoke test.

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
- `cargo fmt --check`: passed.
- `cargo test`: passed.
- `cargo clippy --all-targets -- -D warnings`: passed.
