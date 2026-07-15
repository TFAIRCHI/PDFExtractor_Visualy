# Extraction Pipeline

Current implemented stages:

1. Document inspection: file metadata and page count.
2. Native text extraction: word grouping with approximate geometry from PDF text callbacks.
3. Confidence/provenance: each word receives source method and confidence metadata.

Planned stages:

- Same-engine rendering and geometry extraction.
- OCR provider interface.
- Native/OCR reconciliation.
- Spatial graph construction.
- Reading order inference.
- Table candidate scoring and reconstruction.
- Field extraction, validation, templates, and export.
