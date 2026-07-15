# Product Requirements

## Goal

Build an offline-first Windows desktop application for inspecting PDFs, extracting structured data, correcting extraction results, learning reusable project knowledge, and exporting validated records.

## Initial Vertical Slice

- Import one native-text PDF.
- Render page one in the desktop application.
- Run native text extraction through a Python sidecar.
- Display selectable word-level overlays aligned to the rendered page.
- Inspect selected word text, geometry, confidence, and provenance.
- Save and reopen a project containing the source PDF reference and extracted objects.

## Deferred Until Slice Is Stable

- OCR and hybrid reconciliation.
- Advanced table intelligence.
- Template learning.
- Document-family classification.
- Signed installer.

## Non-Negotiables

- PDFs are untrusted input.
- Ordinary extraction must not require network access.
- Renderer code must not receive unrestricted filesystem or process access.
- Extracted document text is not written to logs by default.
