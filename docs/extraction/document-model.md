# Document Intelligence Model

Initial schema version: `0.1.0`.

Core objects:

- `DocumentModel`: source document metadata and pages.
- `PageModel`: dimensions, rotation, render metadata, and extracted words.
- `WordObject`: stable id, page index, text, source bbox, normalized bbox, confidence, source method, and provenance.

The model intentionally stores both source-space and normalized geometry. Display coordinates are derived in the renderer from the current PDF viewport.
