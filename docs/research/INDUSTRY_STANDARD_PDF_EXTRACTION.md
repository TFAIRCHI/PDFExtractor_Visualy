# Industry Standard PDF Extraction Notes

Wave 0 status: source collection started, not complete.

The current application does not yet satisfy the extraction model described in the master prompt. The project currently renders with `pdf.js` and extracts semantic word boxes with `pypdf` text fragments plus estimated character widths. That is sufficient for a scaffold, but not enough for professional geometry-accurate extraction.

Initial evidence-backed principles:

- Treat native text fragments as source evidence, not semantic words.
- Preserve raw fragments, matrices, page boxes, rotation, and engine version before grouping.
- Maintain a clear distinction between source geometry, visual geometry, interaction geometry, and layout geometry.
- Use the same transform contract for rendering, overlays, hit testing, and diagnostics.
- Keep OCR as a separate evidence source; do not silently replace native evidence.

Further research is still required before Wave 1 contract changes, especially for PDFium text APIs, PDF page boxes and rotation handling, and public document-intelligence response schemas.
