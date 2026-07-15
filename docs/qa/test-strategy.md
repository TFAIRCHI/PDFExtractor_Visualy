# Test Strategy

## Current Tests

- TypeScript contract serialization tests.
- Python JSON-RPC sidecar tests.
- Geometry normalization tests.
- Generated native-text PDF extraction test.

## Required Next Tests

- Electron main/preload IPC smoke tests.
- Playwright workflow for import, extract, select word, save, reopen.
- Golden geometry tests using synthetic PDFs.
- Windows package smoke test.

## Exit Criteria For First Slice

- JavaScript tests pass.
- Python tests pass.
- App launches in development mode.
- A native-text PDF can be rendered and extracted.
- Project save and reopen preserves extracted word geometry.

## Latest Run

- JavaScript unit tests: passed.
- Python unit tests: passed.
- Python Ruff: passed.
- Python MyPy: passed.
- Python checks run through project-local `.venv`: passed.
- Node audit: passed.
- Electron directory package: passed.
- Rust format, tests, and clippy: passed.
- Packaged PyInstaller sidecar health check: passed.
- Playwright vertical-slice workflow: passed.
- Playwright golden overlay screenshot comparison: passed.

Not yet run:

- Clean-machine package smoke test.
