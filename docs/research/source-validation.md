# Source Validation

Access date: 2026-07-15.

## pypdf Text Extraction Documentation

- Location: https://pypdf.readthedocs.io/en/latest/user/extract-text.html
- Engineering claim supported: `visitor_text` receives text fragments, current transformation matrix, text matrix, font dictionary, and font size. The text argument may represent a fragment longer than a word.
- Relevant API or schema concept: `visitor_text(text, user_matrix, tm_matrix, font_dictionary, font_size)`.
- Licensing or redistribution implication: Documentation only; no bundled runtime artifact change.
- Uncertainty or limitation: Current project uses `pypdf==5.7.0`; the public documentation currently describes a newer pypdf release. Wave 0 diagnostics therefore record the runtime engine version with every artifact.

## Mozilla PDF.js Examples

- Location: https://mozilla.github.io/pdf.js/examples/
- Engineering claim supported: `PDFPageProxy.getViewport({ scale })` produces a viewport used for page rendering. The viewport accounts for scale and transforms PDF bottom-left coordinates into canvas top-left coordinates.
- Relevant API or schema concept: `page.getViewport({ scale })`, `page.render({ canvasContext, viewport })`.
- Licensing or redistribution implication: The project already depends on `pdfjs-dist`; no new redistribution decision in Wave 0.
- Uncertainty or limitation: Wave 0 has not yet proven that every overlay conversion uses the exact pdf.js viewport transform matrix.

## Mozilla PDF.js API Draft

- Location: https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html
- Engineering claim supported: `getDocument` is the main API entry for loading a PDF document.
- Relevant API or schema concept: `pdfjsLib.getDocument`.
- Licensing or redistribution implication: No new dependency introduced.
- Uncertainty or limitation: Draft API documentation can move; architectural decisions should verify against the installed `pdfjs-dist` package before contract changes.
