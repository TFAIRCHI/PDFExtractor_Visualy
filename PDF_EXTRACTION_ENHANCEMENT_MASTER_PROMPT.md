# MASTER CODEX PROMPT
# Evolve the Existing PDF Extraction Desktop Application into a Geometry-Accurate, Intelligent, User-Directed Extraction System

## How to use this prompt

Run Codex from the root of the existing repository and provide this entire prompt.

This is an enhancement program for an existing application. Do not create a disconnected replacement repository unless the current architecture is demonstrably unsalvageable and that conclusion is supported by evidence, benchmarks, and an approved architecture decision record.

The intended technology stack remains:

- Electron desktop application
- TypeScript user interface and application contracts
- Python intelligence and orchestration layer
- Rust performance and native PDF geometry layer
- Windows `.exe` packaging
- Offline-first local processing

---

# 1. Mission

Act as a coordinated team of principal software engineers, PDF standards specialists, machine-learning engineers, UX engineers, QA engineers, security engineers, and independent reviewers.

Inspect, diagnose, redesign, implement, test, document, and incrementally improve the existing PDF extraction application.

The current system is not reliable enough for professional use. The supplied failure evidence shows extraction overlays that:

- cover only part of a visible word,
- include multiple visible words inside one box,
- cover whitespace that is not a word,
- create narrow boxes for spaces or generated characters,
- overlap neighboring words,
- use inconsistent width and height,
- mix character-, word-, span-, and line-level geometry,
- do not always correspond to what the user visually sees,
- and may be transformed differently from the PDF page rendered in the viewer.

Treat this as a fundamental source-geometry, reconstruction, coordinate-contract, and user-trust problem. Do not treat it as a cosmetic overlay problem.

The final objective is a professional document-intelligence system in which:

1. Native PDF geometry is captured accurately.
2. Rendering and extraction share a trustworthy coordinate contract.
3. Characters, words, lines, regions, fields, cells, and tables are explicitly distinct objects.
4. Words and structures are reconstructed from spatial evidence rather than assumed from PDF text runs.
5. OCR is used only where necessary and never silently overwrites better native evidence.
6. Every result has source provenance and decomposed confidence.
7. Users can directly correct errors.
8. Corrections can become reusable, reversible extraction knowledge.
9. The product guides users toward the next meaningful action.
10. Known document families can eventually be processed automatically while exceptions are routed for review.
11. All improvements are measured, regression-tested, auditable, and reversible.

The north-star outcome is not the largest number of highlighted boxes. It is a system in which users trust every highlighted object and can understand, correct, reuse, and verify the extraction.

---

# 2. Mandatory research context

Before changing production code, read and incorporate the repository research documents if they are present:

```text
docs/research/INDUSTRY_STANDARD_PDF_EXTRACTION.md
docs/roadmap/USER_CENTERED_EXTRACTION_EVOLUTION_MODEL.md
docs/research/source-validation.md
```

If these documents are not already in the repository, create them from the research inputs supplied with this task.

Validate important architectural decisions against primary or official public sources, including the applicable public documentation for:

- ISO 32000 and the PDF graphics/text model,
- the selected native PDF engine,
- PDFium public text and rendering APIs if PDFium is used,
- Adobe PDF Extract public schemas and page geometry concepts,
- Altair Monarch public template, verification, and extraction workflow documentation,
- Microsoft Azure AI Document Intelligence response geometry and hierarchy,
- Google Document AI response geometry and hierarchy,
- Amazon Textract block relationships and geometry,
- Docling or comparable open document-layout architectures,
- Table Transformer and PubTables-1M research where applicable,
- OCR engine licensing and redistribution requirements,
- Electron security guidance,
- PyO3 and Maturin guidance if Rust is exposed to Python.

Do not claim knowledge of proprietary Altair Monarch, Adobe, Microsoft, Google, or AWS implementation internals. Public behavior and public schemas may inform requirements. Proprietary code, designs, and undocumented internals must not be copied.

Create or update:

```text
docs/research/source-validation.md
```

For every material source, record:

- source title,
- official location or citation,
- date accessed,
- engineering claim supported,
- relevant API or schema concept,
- licensing or redistribution implication,
- uncertainty or limitation.

---

# 3. Core diagnosis to verify

The screenshot is evidence of several likely failure modes, but no hypothesis may be treated as fact until instrumented.

Investigate and prove or disprove all of the following:

## 3.1 PDF abstraction errors

- A PDF text-show operation, text object, span, or library run may be treated as a semantic word.
- Generated spaces or generated newlines may be treated as visible tokens.
- Character advance or loose typographic boxes may be displayed as visible glyph geometry.
- Characters with missing Unicode mappings may cause text and geometry arrays to become misaligned.
- A final character may be lost through an off-by-one error.
- Whitespace-only objects may be included in word geometry.
- Text from multiple columns may be merged because ordering is based only on `y` then `x`.

## 3.2 Coordinate errors

- The renderer and extractor may use different PDF engines.
- The renderer may use CropBox while the extractor uses MediaBox.
- Rotation may be applied in both extraction and display or omitted in one layer.
- Bottom-left PDF coordinates may be converted incorrectly to top-left display coordinates.
- CSS page dimensions may differ from canvas backing-store dimensions.
- Device-pixel ratio may be applied inconsistently.
- Browser zoom, viewer zoom, pan, or scroll offsets may be applied twice or not at all.
- Coordinates may be rounded too early.
- Axis-aligned rectangles may be used for rotated or skewed text.
- Page user units may be ignored.
- Raster dimensions may be treated as PDF dimensions.

## 3.3 Object-model errors

- Character, token, word, line, block, field, cell, and table geometry may not be separately typed.
- Raw extraction evidence may be overwritten during grouping.
- A single `bbox` may be used for source geometry, visible geometry, and hit testing.
- Confidence may be one opaque number instead of separate geometry, text, grouping, structure, and semantic confidence.
- Source provenance may be lost across Rust, Python, IPC, storage, and TypeScript.

## 3.4 UX errors

- The user may see debug-level character geometry by default.
- The system may expose every uncertain object without prioritization.
- The user may be unable to merge, split, snap, reorder, or reject results.
- Corrections may not persist or teach the system.
- The workflow may not provide a clear recommended next action.
- The system may imply certainty despite unresolved extraction ambiguity.

Create evidence before implementing broad redesigns.

---

# 4. Non-negotiable engineering laws

These laws apply across Rust, Python, TypeScript, persistence, IPC, and tests.

## 4.1 Coordinate spaces are explicit types

No unqualified `x`, `y`, `width`, `height`, `bbox`, `quad`, or `polygon` may cross an architectural boundary.

Use named coordinate spaces such as:

```text
PdfUserSpace
NormalizedPageSpace
RenderedPixelSpace
CanvasBackingSpace
CssPageSpace
ViewportSpace
ScreenSpace
```

Every geometry payload must identify its coordinate space, page, rotation state, page box, user-unit interpretation, and schema version.

## 4.2 Quads or polygons are canonical

A four-point quadrilateral or polygon is the canonical representation for text and rotated regions.

Axis-aligned rectangles are derived conveniences only.

Do not discard orientation by converting all source geometry to rectangles too early.

## 4.3 Separate geometry by purpose

Maintain distinct fields for:

```text
source_geometry
```

The exact native or OCR geometry supplied by the source engine.

```text
visual_geometry
```

The tight geometry representing visible characters or the union of visible source characters.

```text
interaction_geometry
```

A slightly expanded region used only for hover, click, selection, handles, and accessibility targets.

```text
layout_geometry
```

A region used for structure analysis, such as a row, column, block, or cell.

Never display interaction geometry as though it were precise source geometry.

## 4.4 Raw evidence is immutable

Native PDF source objects and OCR source objects must remain immutable after extraction.

Grouping, reconciliation, correction, semantic classification, and table reconstruction create derived objects. They do not overwrite source evidence.

## 4.5 Object type is explicit

At minimum, maintain distinct types for:

```text
SourceCharacter
OCRSymbol
Word
Line
Block
LayoutRegion
Field
Table
TableRow
TableColumn
TableCell
```

A line rectangle may never be labeled or displayed as a word rectangle.

## 4.6 Whitespace is not a semantic word

Generated spaces, newlines, zero-width characters, and whitespace-only objects may be retained for diagnostics and layout evidence.

They must not appear as ordinary user-visible words or fields.

## 4.7 One transform service

Rendering, overlays, hit testing, selection, correction handles, export provenance, and screenshot diagnostics must use the same versioned transform service.

Duplicated coordinate formulas are prohibited.

## 4.8 Confidence is decomposed

Track separate confidence dimensions where applicable:

```text
geometry_confidence
unicode_confidence
native_source_confidence
ocr_confidence
grouping_confidence
line_confidence
reading_order_confidence
layout_confidence
table_detection_confidence
table_structure_confidence
semantic_confidence
validation_confidence
source_agreement_confidence
overall_confidence
```

Overall confidence must be derived and explainable.

## 4.9 Every result is traceable

Every exported value must be traceable to:

- source document,
- page,
- source characters or OCR symbols,
- source geometry,
- extraction version,
- model or configuration version,
- corrections applied,
- validation result.

## 4.10 Corrections are declarative, reversible, and auditable

Do not save arbitrary scripts as corrections.

Use versioned correction commands and constraints such as:

- merge objects,
- split object at source boundary,
- ignore source object,
- select alternate source,
- reorder objects,
- assign field type,
- define anchor,
- define relative region,
- define table boundary,
- define row or column separator,
- define repeating section.

All correction actions must support undo, redo, replay, audit history, and compatibility checks.

## 4.11 Extraction intelligence is not a long conditional chain

Do not solve document variation through customer-specific coordinates or vendor-specific `if/else` logic.

Use:

- strategy registries,
- feature extraction,
- scored candidates,
- spatial graphs,
- configuration-driven weights,
- declarative policies,
- clustering,
- constraint optimization,
- model inference,
- confidence thresholds,
- anchor relationships,
- document-family similarity,
- typed state machines.

Conditionals remain appropriate for validation, security, typed state transitions, and explicit error handling. They are not the primary document-intelligence mechanism.

## 4.12 Offline-first and privacy-preserving

No document content may leave the machine unless the user explicitly configures and invokes a cloud provider.

No extracted document text may be written to ordinary logs by default.

## 4.13 No milestone passes on screenshots alone

Every milestone requires:

- automated tests,
- measurable metrics,
- representative fixtures,
- independent review,
- documented limitations.

---

# 5. Team topology

Use Codex agent delegation, subagents, worktrees, branches, or parallel execution where available.

If true parallel agents are unavailable, execute the roles sequentially while maintaining distinct role reports and formal handoff reviews.

Create:

```text
docs/agent-reports/
```

Each agent must record:

- repository areas inspected,
- assumptions,
- findings,
- decisions,
- files changed,
- tests added,
- tests run,
- metrics,
- unresolved risks,
- requested cross-team changes.

No agent may silently change a shared contract.

Shared contract changes require:

1. an architecture decision record,
2. compatibility impact,
3. migration plan,
4. orchestrator approval,
5. independent reviewer approval.

## Agent 1 — Program Orchestrator and Principal Architect

Responsibilities:

- inventory the current repository and architecture,
- coordinate agents and dependencies,
- maintain the execution plan,
- define architectural boundaries,
- maintain the risk register,
- approve shared contracts,
- prevent premature feature expansion,
- integrate reviewed work,
- enforce milestone gates,
- maintain the product evolution roadmap.

Required outputs:

```text
docs/architecture/current-system-map.md
docs/architecture/target-extraction-architecture.md
docs/architecture/data-flow.md
docs/architecture/process-boundaries.md
docs/roadmap/execution-plan.md
docs/roadmap/user-evolution-model.md
docs/roadmap/risk-register.md
docs/adr/
```

## Agent 2 — PDF Standards and Geometry Researcher

Responsibilities:

- validate the PDF graphics/text model used by the system,
- document MediaBox, CropBox, rotation, user units, current transformation matrices, text matrices, glyph geometry, character geometry, and device transforms,
- determine whether rendering and extraction use the same engine,
- define the canonical geometry contract,
- define tight, loose, ink, visual, interaction, and layout geometry,
- create transformation test vectors,
- review every geometry-related change.

Required outputs:

```text
docs/architecture/geometry-contract.md
docs/qa/geometry-test-specification.md
packages/contracts/schemas/geometry.*
```

The geometry contract must explicitly cover:

- bottom-left versus top-left origins,
- MediaBox and CropBox offsets,
- rotations 0, 90, 180, and 270 degrees,
- non-default user units,
- text angle and skew,
- CSS page dimensions,
- canvas backing dimensions,
- device-pixel ratio,
- browser and application zoom,
- pan and scroll,
- subpixel precision,
- rounding policy,
- quads versus rectangles,
- page-by-page size variation.

## Agent 3 — Rust Native PDF and Geometry Engineer

Responsibilities:

- inspect the current native PDF engine integration,
- expose character-level source evidence,
- capture native engine flags and metadata,
- implement typed geometry primitives,
- implement affine transforms,
- implement spatial indexing,
- implement deterministic geometry features,
- create Rust unit, property, benchmark, and fuzz tests,
- optimize only measured hot paths.

Capture these fields per native character when supported:

```text
stable source ID
page index
source character index
Unicode code points
display text
text object identity
content stream or source object identity where available
actual character quad
actual character box
loose or advance quad
loose or advance box
character angle
baseline information
font name
font size
font weight
font style
fill metadata where useful
stroke metadata where useful
is whitespace
is generated
is newline
is hyphen
has Unicode mapping error
render mode where available
visibility or clipping evidence where available
source method
provenance
```

If the current engine is PDFium, investigate and correctly use the public equivalents of:

- actual character box retrieval,
- loose character box retrieval,
- generated-character detection,
- Unicode mapping error detection,
- character angle,
- font metadata,
- page rendering.

Do not assume that loose geometry is appropriate for visual highlighting.

## Agent 4 — Python Extraction Intelligence Engineer

Responsibilities:

- coordinate extraction stages,
- define canonical Pydantic or typed domain models,
- preserve raw evidence,
- build feature pipelines,
- manage strategy selection,
- orchestrate OCR,
- build confidence aggregation,
- manage document-family profiles,
- persist extraction manifests,
- expose stable RPC operations.

Use:

- strict type hints,
- typed exceptions,
- structured logging,
- `pytest`,
- property-based tests where useful,
- `mypy`,
- `ruff`,
- versioned schemas.

Avoid untyped dictionaries across architectural boundaries.

## Agent 5 — Electron and TypeScript Viewer Engineer

Responsibilities:

- trace the current viewer and overlay path,
- determine every coordinate conversion,
- implement one typed transform service,
- replace imprecise HTML rectangles with SVG or an equally precise vector layer where appropriate,
- render quads and polygons,
- separate semantic and diagnostic overlay modes,
- synchronize PDF selection with structured extraction,
- implement provenance inspection,
- maintain responsiveness,
- preserve Electron security boundaries.

Required overlay modes:

```text
semantic words
semantic lines
fields
tables and cells
layout regions
native source characters
native loose/advance boxes
OCR symbols
generated characters
vector rules
reading order
confidence warnings
transform diagnostics
```

Default user mode must show semantic words, fields, and tables—not every source character.

Electron requirements:

```text
contextIsolation: true
nodeIntegration: false
strict Content Security Policy
typed IPC
runtime IPC validation
no unrestricted filesystem access from renderer
no arbitrary remote content
```

## Agent 6 — Spatial Reconstruction Engineer

Responsibilities:

- replace text-run-as-word assumptions,
- build character adjacency candidates,
- calculate spatial and textual features,
- score join and split decisions,
- reconstruct words,
- reconstruct lines,
- identify columns and regions before final reading order,
- build a spatial graph,
- create explanations for grouping decisions,
- benchmark against labeled native PDFs.

Initial character-edge features must include:

```text
baseline similarity
projected visual gap
perpendicular overlap
character-height ratio
font-family similarity
font-size ratio
font-weight similarity
character-angle similarity
source-object continuity
source-index distance
Unicode category
script compatibility
punctuation behavior
generated-space evidence
literal-space evidence
visual-whitespace evidence
column-separator evidence
vector-separator evidence
local median character height
local median advance
neighbor consistency
region containment
reading-direction compatibility
```

Begin with a transparent, versioned, configuration-driven scoring model.

A representative edge score may conceptually use:

```text
join_score(i, j) =
    w1 * baseline_similarity
  + w2 * perpendicular_overlap
  + w3 * font_similarity
  + w4 * script_compatibility
  + w5 * source_continuity
  + w6 * neighbor_consistency
  + w7 * literal_or_generated_space_evidence
  - w8 * normalized_visual_gap
  - w9 * column_boundary_penalty
  - w10 * region_boundary_penalty
  - w11 * vector_separator_penalty
  - w12 * orientation_mismatch
```

Do not hardcode this exact formula if repository evidence supports a better one. The implementation must remain measurable, explainable, configurable, and testable.

Word visual geometry should be derived from visible source-character quads. Interaction geometry may use controlled padding but must remain separate.

## Agent 7 — OCR and Source-Arbitration Engineer

Responsibilities:

- determine when OCR is needed,
- distinguish digital, scanned, and hybrid pages,
- preserve native and OCR candidates separately,
- map OCR polygons into canonical page coordinates,
- reconcile sources using geometry, text, and quality evidence,
- expose disagreements,
- prevent lower-quality OCR from silently replacing native text,
- create OCR-specific benchmarks.

Required signals include:

```text
native text coverage
native visible-ink coverage
Unicode mapping error rate
image density
scan resolution
skew
blur
contrast
OCR confidence distribution
native/OCR text similarity
native/OCR polygon overlap
font and baseline consistency
region-level source quality
```

OCR is not a substitute for correcting native coordinate defects.

## Agent 8 — Layout and Table Intelligence Engineer

Responsibilities:

- define pluggable layout-region interfaces,
- separate table detection from structure recognition,
- combine vector-line, whitespace, alignment, repetition, semantic, and model evidence,
- reconstruct rows, columns, cells, headers, merged cells, and spanning cells,
- support borderless and ruled tables,
- support blank cells,
- support multi-page continuation,
- map source words to cells,
- retain separate cell visual and interaction geometry,
- create table correction contracts.

Do not begin production table-model integration until the geometry and word reconstruction gates pass.

## Agent 9 — Human-in-the-Loop UX Engineer

Responsibilities:

- design a self-directed extraction workflow,
- ensure one primary next action per state,
- design merge, split, snap, reorder, ignore, and source-selection actions,
- design low-confidence and validation queues,
- show plain-language explanations,
- design impact preview,
- design pattern replay,
- design whole-document verification,
- design undo and redo,
- ensure accessibility,
- ensure user corrections become reusable declarative knowledge when appropriate.

Required workflow:

```text
Import
-> Analyze
-> Review uncertain geometry
-> Confirm or correct structure
-> Create or select a reusable pattern
-> Preview affected pages
-> Apply
-> Verify the entire document
-> Resolve exceptions
-> Export validated records
```

## Agent 10 — QA, Benchmark, and Adversarial Test Engineer

Responsibilities:

- reproduce the current failure,
- build synthetic PDFs with known geometry,
- create labeled fixtures,
- create golden overlay images,
- create metrics for geometry, grouping, reading order, OCR, fields, tables, and UX correction effort,
- test rotations, crop boxes, zoom, and DPI,
- test large documents,
- fuzz untrusted PDF and geometry boundaries,
- block releases on regression.

Required metrics include:

```text
character box IoU
character centroid error
polygon corner error
horizontal overshoot
vertical overshoot
word-boundary precision
word-boundary recall
word-boundary F1
whitespace/generated-object false-positive rate
cross-column merge rate
line-grouping F1
reading-order pairwise accuracy
column-assignment accuracy
OCR character accuracy
native/OCR arbitration accuracy
table-region F1
row accuracy
column accuracy
cell-structure F1
merged-cell accuracy
multi-page continuation accuracy
field-value accuracy
false-confidence rate
corrections per page
median time to resolve one review item
time to complete a document
peak memory
time to first rendered page
```

## Agent 11 — Security, Packaging, and Release Engineer

Responsibilities:

- treat PDFs as untrusted input,
- contain parser crashes,
- validate IPC,
- preserve Electron isolation,
- inspect native dependency licenses,
- maintain offline operation,
- ensure logs are privacy-safe,
- preserve clean-machine Windows installation,
- create reproducible builds,
- verify installer and uninstaller behavior,
- protect project migrations.

## Agent 12 — Independent Adversarial Reviewer

Responsibilities:

- review milestones without implementing their main code,
- search for false confidence,
- identify hidden assumptions,
- find duplicated transforms,
- test coordinate ambiguity,
- detect benchmark leakage,
- challenge accuracy claims,
- inspect placeholders and mocks,
- attempt to break the system with difficult PDFs,
- return milestones to construction when gates are not met.

The reviewer has authority to reject a milestone.

---

# 6. Required target architecture

Do not force this architecture blindly. Compare it against the current repository and record justified deviations.

The target logical flow is:

```text
Untrusted PDF
    |
    v
Sandboxed/native PDF inspection
    |
    +--> Page rendering evidence
    |
    +--> Native source characters, images, vectors, annotations
    |
    v
Immutable source document model
    |
    +--> OCR candidates where required
    |
    v
Canonical page geometry and source arbitration
    |
    v
Spatial graph
    |
    +--> Word candidates
    +--> Line candidates
    +--> Column and region candidates
    +--> Reading-order candidates
    |
    v
Scored reconstruction and confidence
    |
    +--> Fields
    +--> Repeating records
    +--> Tables and cells
    +--> Document-family fingerprint
    |
    v
User-verifiable semantic model
    |
    +--> Corrections
    +--> Patterns
    +--> Validation
    +--> Review queues
    |
    v
Traceable structured export
```

Recommended process boundaries:

```text
Electron main process
Electron secure preload
TypeScript renderer
Local Python extraction sidecar
Rust native extension or native worker
SQLite project database
File-based cache for large artifacts
```

Preferred communication:

1. typed JSON-RPC over standard input/output,
2. Windows named pipe,
3. authenticated local socket only if justified.

IPC must support:

- contract version,
- request ID,
- progress events,
- cancellation,
- timeout,
- structured error,
- health check,
- graceful shutdown,
- crash recovery,
- capability negotiation.

Do not expose an unauthenticated local HTTP service.

---

# 7. Canonical data contracts

Create versioned schemas for at least:

```text
DocumentManifest
PageGeometry
PageRenderMetadata
RenderTransform
SourceCharacter
SourceImage
SourceVectorPath
OCRSymbol
CharacterAdjacencyCandidate
Word
Line
Block
LayoutRegion
ReadingOrderGraph
Table
TableRow
TableColumn
TableCell
Field
RepeatingRecord
ExtractionEvidence
ExtractionConfidence
ValidationFinding
CorrectionCommand
PatternDefinition
PatternApplicationPreview
DocumentFingerprint
DocumentFamilyProfile
ExtractionRunManifest
ExportProfile
```

Every applicable object must include:

- stable ID,
- schema version,
- extraction-engine version,
- page association,
- object type,
- coordinate space,
- source/provenance IDs,
- source geometry,
- visual geometry,
- interaction geometry,
- confidence components,
- user-confirmed status,
- modification history,
- creation source,
- correction references.

Use migrations from the first schema revision.

---

# 8. Extraction and reconstruction requirements

## 8.1 Document inspection

Inspect before full extraction:

- encryption,
- malformed structure,
- page count,
- page dimensions,
- page rotation,
- CropBox and MediaBox,
- user units,
- native text coverage,
- image coverage,
- vector density,
- Unicode mapping quality,
- likely scanned regions,
- likely hybrid regions,
- fonts,
- resource requirements,
- repeated page layouts,
- likely language and writing direction.

Produce a typed inspection report.

## 8.2 Native extraction

Capture at the most granular practical level:

- characters,
- code points,
- text object identity,
- actual quads,
- loose/advance quads,
- angle,
- baseline,
- font metadata,
- generated-character flags,
- Unicode errors,
- images,
- vectors,
- clipping information where practical,
- transformation evidence,
- source order.

Do not flatten to plain text before spatial analysis.

## 8.3 Rendering

Use the same PDF engine for rendering and geometry extraction where practical.

If different engines are retained, build explicit cross-engine calibration tests and document the reason.

Support:

- thumbnail rendering,
- viewport rendering,
- high-resolution rendering,
- lazy page loading,
- cache eviction,
- cancellation,
- large documents,
- page-level resource release.

## 8.4 Source classification

Classify source characters into explicit categories such as:

```text
visible_character
literal_space
generated_space
generated_newline
zero_width
combining_mark
ligature
mapping_error
hyphen
soft_hyphen
artifact
unknown
```

Classification is evidence, not deletion.

## 8.5 Word reconstruction

Do not use PDF text runs as semantic words without validation.

Create adjacency candidates and decide joins using:

- projected gap,
- baseline,
- perpendicular overlap,
- font similarity,
- script,
- punctuation,
- source continuity,
- whitespace evidence,
- column boundaries,
- region boundaries,
- local spacing statistics.

Support:

- ligatures,
- combining marks,
- punctuation,
- hyphenation,
- superscripts and subscripts,
- rotated text,
- right-to-left scripts as a designed extension,
- vertical text as a designed extension.

## 8.6 Line reconstruction

Use baseline-aware and orientation-aware grouping.

Do not group by approximate `y` alone.

## 8.7 Column and reading order

Detect columns and region boundaries before final reading order.

Represent reading order as a graph or scored ordering problem.

Track confidence and conflicting evidence.

## 8.8 OCR arbitration

Use OCR for:

- image-only pages,
- image-only regions,
- native text with severe mapping failures,
- scanned or hybrid content.

Never discard native or OCR alternatives.

Record why one source was preferred.

## 8.9 Layout and tables

Use an ensemble of:

- vector lines,
- rectangles,
- whitespace,
- repeated alignment,
- numeric patterns,
- header evidence,
- graph structure,
- layout-model evidence,
- cross-page repetition.

Separate:

1. table-region detection,
2. table-structure recognition,
3. token-to-cell assignment,
4. semantic typing,
5. validation.

Use constraint scoring rather than deeply nested conditionals.

## 8.10 Confidence and explainability

For each semantic result, provide a plain-language explanation such as:

```text
This word has low grouping confidence because the gap between two characters is larger than nearby character gaps and a possible column boundary lies between them.
```

or:

```text
This value has low source confidence because the native text and OCR text disagree.
```

---

# 9. User-centered evolution model

Implement the product in maturity levels. Do not jump to unattended automation before trust and correction foundations are stable.

## Level 0 — Observable extraction

### User promise

“I can inspect what the system saw and understand why it produced an object.”

### Capabilities

- source character overlay,
- generated-character overlay,
- actual versus loose box comparison,
- transform inspector,
- raw extraction JSON,
- source provenance,
- object-type labels,
- native versus OCR view.

### Primary action

```text
Inspect extraction evidence
```

### Gate

The screenshot failure can be reproduced and explained from source object to screen.

## Level 1 — Trustworthy visual grounding

### User promise

“When the application highlights a word, the highlight matches the visible word.”

### Capabilities

- canonical coordinate model,
- one transform service,
- quad overlays,
- generated-whitespace suppression,
- word reconstruction,
- line reconstruction,
- column-aware grouping,
- geometry and grouping confidence.

### Primary action

```text
Review uncertain words
```

### Gate

The protected native-PDF corpus meets approved geometry and word-boundary targets.

## Level 2 — Guided correction

### User promise

“When the system is wrong, I can correct it quickly without editing code or coordinates.”

### Capabilities

- merge words,
- split words at source-character boundaries,
- snap to source geometry,
- ignore object,
- choose native or OCR source,
- reorder reading order,
- resize field or region,
- undo and redo,
- save and reopen corrections,
- plain-language error explanation,
- review queue.

### Primary action

```text
Resolve the next uncertain extraction
```

### Gate

Every failure type visible in the supplied screenshot can be corrected through the interface.

## Level 3 — Reusable extraction patterns

### User promise

“After I correct one representative page, the application can propose the same structure on similar pages.”

### Capabilities

- anchors,
- anchor-relative geometry,
- repeating regions,
- table patterns,
- field types,
- applicability scoring,
- impact preview,
- reversible application,
- whole-document verification,
- structured preview,
- source lineage.

### Primary action

```text
Preview this pattern on similar pages
```

### Gate

A correction can be replayed with preview, exclusions, rollback, and verification.

## Level 4 — Document-family intelligence

### User promise

“The system recognizes layouts it has seen before and recommends the right extraction pattern.”

### Capabilities

- page fingerprints,
- document fingerprints,
- clustering,
- nearest-neighbor retrieval,
- family profiles,
- novelty detection,
- template ranking,
- evidence-backed recommendation,
- versioning.

### Primary action

```text
Use the recommended verified pattern
```

### Gate

Novel layouts are not auto-applied below a calibrated threshold.

## Level 5 — Exception-driven automation

### User promise

“Known documents process automatically, and I review only the exceptions that matter.”

### Capabilities

- calibrated confidence,
- validation policies,
- batch processing,
- checkpointing,
- drift detection,
- exception prioritization,
- approved export profiles,
- audit trails.

### Primary action

```text
Review the prioritized exceptions
```

### Gate

No unattended export occurs unless geometry, structure, validation, lineage, and document-family policies pass.

## Level 6 — Governed continuous improvement

### User promise

“The system improves over time without silently changing trusted behavior.”

### Capabilities

- correction analytics,
- benchmark comparison,
- shadow evaluation,
- model registry,
- pattern promotion,
- rollback,
- version pinning,
- team sharing,
- privacy and consent controls.

### Primary action

```text
Review and approve the proposed extraction update
```

### Gate

No model or pattern update is promoted without regression evidence and rollback support.

---

# 10. Required user experience

## 10.1 Main workspace

Use a three-panel model unless repository usability evidence supports a better design.

### Left panel

- documents,
- page thumbnails,
- document families,
- extraction status,
- review queues,
- search.

### Center panel

- accurate PDF rendering,
- zoom,
- pan,
- rotation,
- semantic overlays,
- table grids,
- selected source geometry,
- reading order,
- confidence indicators.

### Right panel

- selected object type,
- extracted value,
- source,
- confidence components,
- provenance,
- geometry,
- validation status,
- proposed fix,
- pattern options.

Panels should be resizable and collapsible.

## 10.2 One primary next action

Each workflow state must display one recommended action.

Examples:

```text
Analyze document
Review 8 uncertain words
Confirm the detected header row
Apply this pattern to 42 similar pages
Run whole-document verification
Resolve 5 validation findings
Export 1,284 validated records
```

## 10.3 Explain before asking

Every review item should show:

- what appears wrong,
- why it was flagged,
- source evidence,
- proposed fix,
- effect of accepting,
- alternatives,
- details on demand.

## 10.4 Progressive disclosure

Default users see semantic words, fields, tables, validation, and the next action.

Advanced users can enable character quads, generated spaces, raw source, transforms, OCR comparison, spatial edges, and scoring features.

## 10.5 Bidirectional synchronization

Selecting structured data highlights the source.

Selecting source geometry highlights the structured object.

Hovering a cell highlights all supporting words and source characters.

## 10.6 Accessibility

Support:

- full keyboard navigation,
- visible focus,
- logical tab order,
- screen-reader labels,
- non-color confidence indicators,
- scalable text,
- accessible correction actions,
- automated and manual accessibility tests.

---

# 11. Execution waves and gates

## Wave 0 — Repository discovery, instrumentation, and reproduction

### Tasks

1. Inventory the repository.
2. Identify versions of Electron, TypeScript, Python, Rust, PDF engine, OCR engine, ML runtime, test frameworks, persistence, and packaging.
3. Map the end-to-end flow of one highlighted object:
   - PDF source,
   - native extraction,
   - Rust/Python boundary,
   - Python model,
   - serialization,
   - IPC,
   - persistence,
   - TypeScript model,
   - viewer transform,
   - overlay.
4. Locate the exact source PDF that produced the supplied screenshot if available.
5. Reproduce the failure.
6. Capture current extraction JSON.
7. Capture transform traces.
8. Label every blue rectangle by object type and producer.
9. Create a minimal synthetic reproduction.
10. Establish baseline metrics and performance.

### Required outputs

```text
docs/architecture/current-system-map.md
docs/diagnostics/current-overlay-failure-analysis.md
docs/diagnostics/end-to-end-object-trace.md
artifacts/diagnostics/current-page-extraction.json
artifacts/diagnostics/current-transform-trace.json
artifacts/diagnostics/current-overlay-screenshot.png
test-data/regressions/current-overlay-failure/
```

### Questions that must be answered

- What exact object type is each blue rectangle?
- Which function created it?
- Which coordinate space does it use?
- Is it actual or loose geometry?
- Are generated spaces included?
- Are text runs treated as words?
- Are source text and geometry arrays aligned?
- Which page box is used?
- Where is rotation applied?
- Which engine renders?
- Which engine extracts?
- Where is rounding introduced?
- Is device-pixel ratio handled?
- Is CSS scaling applied after geometry conversion?
- Are columns detected before reading order?
- Are hit boxes displayed as visual boxes?

### Gate 0

Do not begin a broad production rewrite until the failure is reproducible and the complete data path is documented.

## Wave 1 — Canonical geometry contract

### Tasks

1. Define coordinate-space types.
2. Define canonical page geometry.
3. Define source quads.
4. Define normalized geometry.
5. Define display transforms.
6. Implement shared runtime schema validation.
7. Create cross-language transformation vectors.
8. Implement identical transform tests in Rust, Python where applicable, and TypeScript.
9. remove or deprecate duplicate transform formulas.
10. Add geometry provenance to persisted objects.

### Required tests

- MediaBox equals CropBox,
- CropBox offset from MediaBox,
- rotations 0/90/180/270,
- zoom 25% through 800%,
- device-pixel ratios 1/1.25/1.5/2/3,
- multiple page dimensions,
- scrolling,
- panning,
- non-default user units where supported,
- rotated text,
- high-DPI monitors,
- browser zoom,
- page fit-to-width and fit-to-height.

### Gate 1

No systematic overlay offset is allowed.

All supported transformations must pass golden point and quad tests.

## Wave 2 — Source character correctness

### Tasks

1. Extract all source characters and metadata.
2. Identify generated spaces and newlines.
3. identify mapping errors.
4. retain actual and loose geometry separately.
5. retain quads and angles.
6. add source diagnostic overlays.
7. prevent whitespace-only and generated-only objects from becoming semantic words.
8. preserve immutable source evidence.
9. add source-object identity.
10. add character-level regression fixtures.

### Gate 2

The supplied failure regression no longer displays ordinary blue word boxes for whitespace-only or generated-only objects.

Generated objects remain available only in a distinct diagnostic mode.

## Wave 3 — Word, line, column, and reading-order reconstruction

### Tasks

1. Create adjacency candidates.
2. calculate spatial features.
3. score join and split decisions.
4. build words from visible source characters.
5. derive word visual quads.
6. create separately padded interaction geometry.
7. build orientation-aware lines.
8. detect columns and separators.
9. build reading-order graph.
10. create grouping explanations.
11. calibrate preliminary confidence.
12. build benchmark dashboards.

### Initial target gates

Targets must be validated against the corpus and may be refined through an ADR, but do not weaken them merely to pass.

For controlled native-text PDFs:

- word-boundary F1 at least 0.98,
- generated/whitespace semantic false-positive rate below 0.1%,
- cross-column word merge rate below 0.1%,
- line-grouping F1 at least 0.98,
- pairwise reading-order accuracy at least 0.98,
- no visible systematic overlay offset,
- median source-to-display centroid error within one CSS pixel at 100% zoom on the benchmark workstation.

Report difficult categories separately.

### Gate 3

Do not proceed to reusable templates or production table intelligence until geometry, word, and line gates pass.

## Wave 4 — Guided correction UX

### Tasks

1. merge semantic words,
2. split semantic words at source boundaries,
3. snap to source geometry,
4. ignore artifacts,
5. select native or OCR candidate,
6. correct reading order,
7. resize fields and regions,
8. implement undo and redo,
9. persist correction commands,
10. implement review queue,
11. show confidence explanations,
12. add keyboard workflows,
13. test save and reopen.

### Gate 4

A nontechnical user can correct every visible failure class from the supplied screenshot without editing JSON, coordinates, or code.

All corrections survive save/reopen and remain reversible.

## Wave 5 — Reusable patterns and whole-document verification

### Tasks

1. define pattern schema,
2. support anchors,
3. support anchor-relative geometry,
4. support repeating sections,
5. support field and table definitions,
6. calculate applicability,
7. preview impact,
8. allow exclusions,
9. apply as a reversible change set,
10. verify the whole report,
11. flag truncation, overlap, missing values, source disagreement, and layout outliers,
12. preview structured records and lineage.

### Gate 5

A corrected extraction can be previewed and applied to similar pages with exclusions, rollback, verification, and output comparison.

## Wave 6 — OCR, layout, and table intelligence

### Tasks

1. finalize region-level OCR policy,
2. implement native/OCR arbitration,
3. integrate pluggable layout detection,
4. implement table-region ensemble,
5. implement structure recognition,
6. assign tokens to cells,
7. support blank cells,
8. support merged and spanning cells,
9. support multi-page tables,
10. implement table correction UX,
11. create separate benchmarks for native and scanned PDFs.

### Gate 6

Report native, OCR, layout, and table metrics separately.

Do not publish a single combined accuracy number that conceals weak categories.

## Wave 7 — Document families

### Tasks

1. create page and document fingerprints,
2. implement similarity retrieval,
3. cluster related layouts,
4. create family profiles,
5. rank patterns,
6. detect novel layouts,
7. present evidence for recommendations,
8. allow family rejection and relabeling,
9. version family definitions.

### Gate 7

No family pattern is auto-applied below the calibrated threshold.

Novel layouts are routed to review.

## Wave 8 — Exception-driven automation, security, and release hardening

### Tasks

1. calibrate confidence,
2. implement validation policies,
3. process approved families automatically,
4. prioritize exceptions by risk,
5. implement checkpointing and recovery,
6. implement drift detection,
7. fuzz PDF and RPC boundaries,
8. test large documents,
9. maintain Windows packaging,
10. test installation on a clean machine,
11. test project migration and rollback,
12. produce a release comparison report.

### Gate 8

Unattended export is prohibited unless:

- geometry policy passes,
- word and structure policy passes,
- required validations pass,
- lineage is complete,
- the document family is recognized or explicitly approved,
- unresolved exceptions are handled by project policy,
- the extraction, model, pattern, and schema versions are recorded.

---

# 12. Testing corpus

Create or obtain legally redistributable fixtures for:

- digitally generated text PDFs,
- individually positioned characters,
- literal spaces,
- generated spaces,
- generated newlines,
- missing Unicode mappings,
- ligatures,
- combining marks,
- hyphenation,
- mixed font sizes,
- superscripts and subscripts,
- rotated text,
- skewed text,
- CropBox offsets,
- MediaBox differences,
- non-default page sizes,
- non-default user units where supported,
- two-column documents,
- three-column documents,
- sidebars,
- headers and footers,
- layered or duplicated text,
- invisible OCR text behind images,
- fully scanned pages,
- hybrid pages,
- ruled tables,
- borderless tables,
- merged cells,
- spanning headers,
- blank cells,
- multi-page tables,
- low-resolution scans,
- noisy scans,
- malformed PDFs,
- very large page dimensions,
- 1-page, 25-page, 100-page, and approximately 750-page documents.

Use synthetic PDFs with exact expected geometry for coordinate tests.

Protect regression fixtures from accidental deletion or silent expectation updates.

Golden changes require reviewer approval and an explanation.

---

# 13. Required QA layers

## Unit tests

- transforms,
- geometry intersections,
- polygon unions,
- quad conversion,
- rotation,
- word-edge features,
- join scoring,
- line grouping,
- reading-order scoring,
- confidence aggregation,
- validation rules,
- correction replay,
- schema migrations,
- export formatting,
- RPC serialization.

## Property-based tests

- transform inversion,
- round-trip coordinate conversion,
- geometry containment,
- stable ordering,
- correction replay invariants,
- polygon bounds,
- schema serialization.

## Golden geometry tests

- source quad,
- normalized quad,
- display quad,
- screenshot overlay,
- zoom,
- rotation,
- DPI,
- CropBox.

## Integration tests

- Electron launches Python sidecar,
- Python loads Rust extension,
- PDF imports,
- source extraction completes,
- progress streams,
- cancellation works,
- overlays appear,
- correction persists,
- project reopens,
- export preserves lineage,
- service recovers after termination.

## End-to-end tests

1. Launch application.
2. Import a representative native PDF.
3. Analyze.
4. Review uncertain words.
5. Merge or split one word.
6. Correct reading order.
7. Create a pattern.
8. Preview on similar pages.
9. Apply.
10. Verify document.
11. Resolve one validation issue.
12. Export.
13. Reopen project.
14. Confirm persistence and lineage.

## Reliability tests

- repeated open and close,
- repeated import,
- cancellation at every pipeline stage,
- process crash and restart,
- interrupted save,
- low disk space,
- corrupt project database,
- long-running soak,
- cache eviction,
- high page count.

## Security tests

- malformed PDF,
- oversized object streams,
- invalid paths,
- path traversal,
- untrusted RPC payload,
- unsupported file type,
- corrupted embedded image,
- dependency vulnerabilities,
- Electron IPC isolation,
- log privacy.

## Accessibility tests

- keyboard-only completion,
- focus order,
- screen-reader labels,
- non-color status indicators,
- zoomed text,
- accessible correction controls.

---

# 14. Performance expectations

Define and document a benchmark workstation, for example:

```text
Windows 11
8 or more logical CPU cores
16 GB RAM
SSD
No required GPU
```

Measure:

- time to first rendered page,
- time to inspection report,
- native character extraction throughput,
- word reconstruction throughput,
- OCR throughput,
- table reconstruction throughput,
- peak memory,
- page-cache size,
- project save,
- project reopen,
- export throughput,
- UI responsiveness,
- cancellation latency.

Requirements:

- do not render all pages into memory,
- use bounded worker pools,
- stream page results,
- support cancellation,
- support pause and resume where practical,
- persist checkpoints for long runs,
- release page resources,
- avoid unnecessary raster copies,
- move work into Rust only after profiling demonstrates value.

---

# 15. GitHub documentation requirements

The repository must contain production-quality documentation, not only agent notes.

Create or update:

```text
README.md
docs/research/INDUSTRY_STANDARD_PDF_EXTRACTION.md
docs/research/source-validation.md
docs/architecture/current-system-map.md
docs/architecture/target-extraction-architecture.md
docs/architecture/geometry-contract.md
docs/architecture/data-flow.md
docs/architecture/process-boundaries.md
docs/architecture/confidence-model.md
docs/architecture/correction-model.md
docs/architecture/pattern-model.md
docs/qa/test-strategy.md
docs/qa/geometry-test-specification.md
docs/qa/benchmark-corpus.md
docs/roadmap/user-evolution-model.md
docs/roadmap/execution-plan.md
docs/roadmap/risk-register.md
docs/security/threat-model.md
docs/release/windows-packaging.md
docs/adr/
```

The main README should clearly explain:

- product goal,
- current maturity level,
- architecture,
- local development,
- test commands,
- benchmark commands,
- Windows build,
- known limitations,
- roadmap,
- privacy posture,
- contribution rules,
- how extraction accuracy is measured.

Do not claim “industry-leading,” “production-ready,” or similar status without published benchmark evidence.

---

# 16. Coding and repository standards

## TypeScript

Use:

- strict mode,
- typed IPC,
- runtime contract validation,
- ESLint,
- Prettier,
- React Testing Library,
- Playwright,
- explicit coordinate-space types,
- no `any` at architectural boundaries.

## Python

Use:

- strict or near-strict type checking,
- Pydantic or typed dataclasses,
- typed exceptions,
- `pytest`,
- `mypy`,
- `ruff`,
- property-based testing where useful,
- no untyped dictionaries across boundaries.

## Rust

Use:

- safe Rust by default,
- `rustfmt`,
- `clippy`,
- explicit error types,
- isolated and documented `unsafe`,
- property tests,
- Criterion benchmarks,
- fuzz targets,
- deterministic geometry operations where possible.

## General

Use:

- conventional commits,
- semantic versioning,
- dependency lockfiles,
- reproducible builds,
- architecture decision records,
- versioned schemas,
- schema migrations,
- feature flags,
- structured privacy-safe logs,
- dependency and license inventory.

---

# 17. Prohibited shortcuts

Do not:

- draw word boxes from raw text-run rectangles,
- display loose character boxes as precise visible word bounds,
- create semantic objects for whitespace-only strings,
- merge text solely because it shares a baseline,
- sort an entire page only by `y` then `x`,
- hardcode the supplied resume’s coordinates or headings,
- add vendor-specific conditions,
- silently replace native text with OCR,
- discard raw evidence,
- use one opaque confidence number,
- use a second unverified transform in the viewer,
- round coordinates before the final display transform,
- claim success from one screenshot,
- replace failing tests by weakening expected output without review,
- integrate table AI before geometry gates pass,
- expose unrestricted Node APIs to the renderer,
- log private document text by default,
- mark mocks or placeholders as complete,
- perform a full rewrite without a measured justification.

---

# 18. Codex execution protocol

At the beginning of the program:

1. Read this prompt.
2. Read the repository research documents.
3. Inventory the repository.
4. Create the agent plan.
5. Create Wave 0 tasks.
6. Do not immediately rewrite the extraction layer.
7. Reproduce and instrument first.

At the beginning of every wave, output:

```text
Wave goal
Current evidence
Agents assigned
Planned files
Contracts affected
Risks
Test plan
Metrics
Acceptance gate
```

At the end of every wave, output:

```text
Files created or modified
Implementation completed
Commands executed
Tests passed
Tests failed
Benchmark results
Before-versus-after comparison
Known limitations
Security impact
Migration impact
Reviewer decision
Remaining risks
Recommended next wave
```

Maintain:

```text
docs/roadmap/execution-plan.md
docs/roadmap/risk-register.md
docs/agent-reports/
```

Do not silently skip incomplete work.

Do not mark a wave complete when:

- tests are failing,
- benchmark evidence is missing,
- a shared contract is undocumented,
- the reviewer rejects it,
- the UI is using mock extraction,
- the implementation is not integrated,
- the clean build does not run.

---

# 19. First required execution

Begin with Wave 0 only.

The first execution must produce:

1. Repository inventory.
2. Current-system architecture map.
3. End-to-end trace of one incorrect highlighted word.
4. End-to-end trace of one whitespace or empty highlighted box.
5. Identification of the object type behind every overlay class.
6. Coordinate transform trace.
7. Evidence showing actual versus loose geometry where available.
8. Evidence showing generated characters where available.
9. Minimal synthetic regression fixture.
10. Baseline geometry and word-boundary metrics.
11. A reviewed remediation plan for Waves 1 through 3.
12. No broad rewrite unless required to add instrumentation.

The first implementation change should be the smallest change needed to make extraction evidence observable and reproducible.

After Wave 0 is independently reviewed and accepted, proceed to Wave 1.

---

# 20. Final definition of success

This enhancement program is successful when the system has evolved from unreliable rectangles into a trustworthy extraction product where:

- visible word highlights match visible words,
- whitespace and generated characters do not appear as semantic words,
- native and OCR evidence remain traceable,
- every coordinate transformation is typed and tested,
- words and lines are reconstructed through measurable spatial evidence,
- users can correct errors quickly,
- corrections are persistent and reusable,
- patterns can be previewed and rolled back,
- document families can be recognized safely,
- only meaningful exceptions require user attention,
- every exported value can be traced to its source,
- the Windows application remains secure, offline-first, installable, and maintainable,
- and every accuracy claim is supported by a protected benchmark corpus.

Start now with Wave 0.
