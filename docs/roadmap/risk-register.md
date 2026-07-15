# Risk Register

| Risk | Evidence | Impact | Next Action |
| --- | --- | --- | --- |
| Estimated semantic word geometry | `_runs_to_words` uses `font_size * 0.5` and text length | Highlights can under-cover or over-cover visible words | Replace with source-character evidence and measured visual geometry |
| Split rendering/extraction engines | `pdf.js` renders, `pypdf` extracts | Page boxes, rotation, and transforms can diverge | Define typed transform contract and evaluate same-engine options |
| Implicit coordinate spaces | `BBox` has no coordinate-space field | Boundary consumers can misuse source, normalized, and display geometry | Add versioned geometry schemas in Wave 1 |
| Raw evidence loss | Normal extraction returns only derived words | Failures cannot be audited after extraction | Preserve immutable source evidence in Wave 2 |
| No generated-character signal | Current `pypdf` integration cannot classify generated chars | Generated spaces may be indistinguishable from literal text evidence | Evaluate PDFium/PyMuPDF capabilities before source-character contract |
| Original failure PDF unavailable | No supplied screenshot fixture found in workspace | Cannot prove the exact observed failure yet | Ask user for the original PDF/screenshot fixture or continue with synthetic regressions |
| Clean-machine package test absent | Existing package smoke only filters Python from PATH | Installer confidence is limited | Run on a clean Windows VM before production release |
