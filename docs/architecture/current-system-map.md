# Current System Map

## Runtime Inventory

- Desktop shell: Electron `43.1.1`.
- Renderer: React `19.1.0`, TypeScript `5.8.3`, Vite `7.3.6`.
- PDF rendering: `pdfjs-dist` `5.3.93`.
- Extraction sidecar: Python `>=3.11`, `pypdf==5.7.0`, Pydantic `2.11.7`.
- Rust: workspace crate `crates/geometry`, currently not on the extraction path.
- Test frameworks: Vitest, Playwright, pytest, ruff, mypy, cargo test/clippy.
- Packaging: Electron Builder `26.15.3`, PyInstaller `6.17.0`, unsigned NSIS installer.
- Persistence: JSON `.pdfiproj` files through Electron main process.

## Current Boundaries

1. Renderer asks the preload bridge to open and read a PDF.
2. Electron main owns file dialogs, file reads, project save/reopen, and sidecar lifecycle.
3. Renderer renders the first page with `pdf.js`.
4. Renderer requests native extraction through typed preload API.
5. Electron main sends line-delimited JSON-RPC to the Python sidecar over stdio.
6. Python sidecar uses `pypdf` `visitor_text` callbacks to collect text fragments.
7. Python converts fragments to semantic words by splitting cleaned text on whitespace.
8. Python estimates word boxes from `tm[4]`, `tm[5]`, font size, and `font_size * 0.5` character width.
9. Python normalizes boxes to page width and height.
10. Renderer multiplies normalized boxes by the `pdf.js` viewport width and height and displays HTML button rectangles.

## Current Overlay Classes

- `word-box`: user-visible semantic word overlay, produced by `apps/desktop/renderer/src/main.tsx`.
- `word-box selected`: selected semantic word overlay, same geometry with selected styling.

No character, generated-space, line, field, table, OCR, or transform-diagnostic overlays exist yet.

## Contract Gaps

- `BBox` does not name a coordinate space.
- `sourceBBox` and `normalizedBBox` are axis-aligned rectangles only.
- No quads, polygons, page box identifiers, user-unit metadata, or transform version cross the boundary.
- No immutable source-character model exists.
- Confidence is a single scalar.
- Rust geometry is not integrated into Python or TypeScript contracts.
