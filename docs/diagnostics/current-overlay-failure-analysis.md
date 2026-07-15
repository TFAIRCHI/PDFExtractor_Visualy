# Current Overlay Failure Analysis

Wave 0 diagnostic fixture: `test-data/regressions/current-overlay-failure/synthetic-run-geometry.pdf`.

Generated artifacts:

- `artifacts/diagnostics/current-page-extraction.json`
- `artifacts/diagnostics/current-transform-trace.json`
- `artifacts/diagnostics/current-overlay-screenshot.png`

## Evidence

The current semantic extraction path does not use native word or glyph geometry. It receives `pypdf` text fragments, strips each fragment, splits it with Python `str.split()`, and estimates each word rectangle.

For the synthetic fixture, the raw run containing `Alpha  Beta\n` becomes two semantic words:

- `Alpha`: `sourceBBox.x=40.0`, `sourceBBox.y=48.0`, `width=30.0`, `height=12.0`.
- `Beta`: `sourceBBox.x=76.0`, `sourceBBox.y=48.0`, `width=24.0`, `height=12.0`.

The gap and width are not measured from rendered glyphs. They are calculated from `font_size * 0.5`. That can under-cover or over-cover visible text depending on the font, glyphs, kerning, text matrix, and page transform.

The same diagnostic artifact shows empty raw text runs emitted by `pypdf`; the current semantic extractor skips them before word creation. This means the current minimal fixture does not reproduce a user-visible whitespace semantic word, but it proves that raw empty fragments exist and were previously unobservable.

## Likely Failure Modes Confirmed

- Text fragments are treated as the starting point for semantic words.
- Semantic word boxes are estimated, not native visible glyph bounds.
- Raw source evidence is discarded in normal extraction.
- The renderer and extractor use different PDF engines.
- Overlay rectangles are axis-aligned HTML elements, not source quads.
- The coordinate space is implicit in `BBox`.

## Not Yet Proven

- Actual versus loose native glyph geometry. `pypdf` does not expose a reliable actual-glyph quad in the current integration.
- Generated-character identity. Wave 0 diagnostics can identify empty or whitespace-only fragments, but not PDFium-style generated characters.
- CropBox, rotation, high-DPI, browser zoom, and non-default user-unit behavior.
- Whether the supplied screenshot PDF exists in the workspace. No source screenshot fixture was found during this pass. The captured screenshot artifact is from the existing vertical-slice fixture, not the original reported failure PDF.

## Baseline Metrics

Synthetic fixture count:

- Raw text runs: recorded in `current-page-extraction.json`.
- Semantic words: 4.
- Whitespace-only semantic words: 0.
- Word geometry method: estimated axis-aligned boxes.
- Actual glyph geometry coverage: unavailable.
- Current overlay screenshot: captured from the existing Playwright vertical-slice fixture.

These are observability metrics, not accuracy claims.
