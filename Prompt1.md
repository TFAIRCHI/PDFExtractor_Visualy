# Codex Master Build Prompt: Intelligent PDF Extraction Desktop Software

## Role and Operating Instructions

Act as a principal software architect, senior Rust engineer, senior Python machine-learning engineer, senior Electron/TypeScript engineer, UX engineer, QA architect, security engineer, and Windows release engineer.

Design and construct a production-oriented Windows desktop application for intelligent PDF extraction. The final product must be installable and executable as a Windows `.exe`.

The software should provide capabilities broadly comparable to professional document extraction and report-mining products such as Altair Monarch, while being independently designed. Do not copy proprietary Altair code, branding, workflows, interfaces, documentation, or protected implementation details.

Do not stop after creating architecture documents or placeholder code. Build a functional application through incremental, tested vertical slices.

Follow an AI-assisted development lifecycle divided into:

1. Inception
2. Construction
3. Deployment and Maintenance

At the end of every major phase:

* Run all relevant tests.
* Report completed work.
* Report failed tests and unresolved risks.
* Update architectural decision records.
* Update the implementation roadmap.
* Do not silently skip incomplete requirements.
* Do not mark placeholder implementations as complete.

Use reasonable default assumptions when information is missing. Record each assumption in `docs/assumptions.md` rather than blocking development unnecessarily.

---

# 1. Product Vision

Build a robust, offline-first desktop application that allows a user to:

1. Open one or more PDFs.
2. View each PDF with accurate rendering.
3. Automatically detect text, tables, fields, images, regions, headers, footers, and repeating document structures.
4. Visually inspect extracted information directly over the rendered PDF.
5. Correct extraction results interactively.
6. create reusable extraction models or templates from those corrections.
7. Extract structured information from similar documents.
8. Validate extracted records.
9. Export results to CSV, XLSX, JSON, XML, Parquet, or a local database.
10. Save and reopen the entire extraction project.

The product must make complicated extraction tasks approachable for nontechnical users.

The interface should continuously guide the user toward the most logical next action without forcing the user to understand the underlying extraction algorithms.

The application should not behave like a collection of disconnected engineering utilities. It should behave like one integrated document intelligence product.

---

# 2. Primary Product Principles

## 2.1 Geometric Fidelity

The extraction geometry must accurately correspond to the visual rendering of the PDF.

When a user highlights an extracted word, line, field, cell, table, image, or region, the overlay must align with the exact visual location of that object in the PDF reader.

Do not calculate visual placement from reconstructed text alone.

Geometry must originate from the PDF coordinate system and must preserve:

* Media box
* Crop box
* Page rotation
* Character positions
* Glyph positions
* Baselines
* Font size
* Font family when available
* Font weight when available
* Text color
* Vector lines
* Rectangles
* Curves
* Image bounds
* Z-order
* Transformation matrices
* Clipping regions
* Page dimensions
* Rendering scale
* Zoom transforms
* Device-pixel ratio

Use the same underlying PDF engine, or precisely compatible coordinate transforms, for both page rendering and geometric object extraction.

Prefer PDFium or another permissively licensed production-ready engine. Verify licensing before finalizing the dependency.

Maintain both:

* Original PDF coordinates
* Canonical normalized page coordinates
* Screen/display coordinates

Every extracted object must retain enough information to trace it back to its exact source position.

A representative geometry object should include fields similar to:

```text
page_index
object_id
object_type
source_bbox
source_polygon
normalized_bbox
baseline
rotation
z_order
font_metadata
render_transform_id
confidence
source_method
provenance
parent_object_id
```

Use affine transformation utilities rather than scattered coordinate calculations throughout the codebase.

---

## 2.2 Deeply Intelligent Extraction

The extraction layer is the primary differentiator of this application.

It must combine:

* Native PDF object extraction
* OCR
* Geometric reasoning
* Spatial graphs
* Statistical scoring
* Layout analysis
* Table-structure reconstruction
* Semantic classification
* Repetition analysis
* Document-family detection
* Confidence scoring
* User corrections
* Reusable extraction patterns

Do not build the extraction engine as a large collection of document-specific `if/else` statements.

Conditionals are acceptable for validation, security, error handling, and clearly defined state transitions. However, extraction intelligence should primarily use:

* Scored candidate selection
* Confidence-weighted ensembles
* Strategy registries
* Declarative policies
* Configuration-driven thresholds
* Feature vectors
* Spatial clustering
* Graph algorithms
* Constraint solving
* Dynamic programming
* Probabilistic inference
* Machine-learning models
* Polymorphic extraction strategies
* Reusable region and pattern definitions

Avoid hardcoded logic such as:

```text
if vendor_name == "Vendor A"
if text starts at x coordinate 143
if page contains an exact customer-specific sentence
```

Instead, represent document characteristics through reusable features and learned or configurable patterns.

---

## 2.3 Human-in-the-Loop Intelligence

The system must treat user corrections as valuable signals.

When a user:

* Moves a field boundary
* Adds or removes a column
* Merges or splits cells
* Corrects reading order
* Changes a field type
* Identifies a header
* Marks a repeating section
* Labels a record boundary
* Corrects OCR text

the application should be able to convert those corrections into reusable project-level knowledge.

Support two kinds of reusable intelligence:

### Deterministic project templates

Templates store geometric relationships, anchors, relative offsets, expected field types, repeating groups, and validation expectations.

### Learned document-family profiles

Profiles use aggregated features to recognize similar page layouts and choose suitable extraction strategies.

Never upload a user’s document or corrections to an external service without explicit permission.

---

## 2.4 Self-Directed UX

Design the interface so that users naturally understand what to do next.

At every major workflow state, show:

* What the application has completed
* What requires attention
* What the recommended next action is
* Why that action is recommended
* The confidence of the extraction
* How to correct a problem
* What will happen after the action

Avoid dead-end screens.

Avoid requiring users to navigate through technical configuration panels before they can extract data.

Use progressive disclosure: show simple actions first and advanced controls only when needed.

---

# 3. Required Technology Stack

## Desktop application

Use:

* Electron
* TypeScript
* React or another well-supported TypeScript UI framework
* A secure Electron preload layer
* Strict separation between the renderer and operating-system APIs

Electron security requirements:

* `contextIsolation: true`
* `nodeIntegration: false`
* A strict Content Security Policy
* No unrestricted IPC
* Typed IPC contracts
* Validation of every renderer-to-main-process request
* No remote code execution mechanisms
* No loading arbitrary remote content

## Python intelligence layer

Use Python for:

* OCR orchestration
* Layout intelligence
* Machine-learning inference
* Semantic field classification
* Table candidate scoring
* Document-family classification
* User-correction learning
* Export orchestration
* Benchmarking and evaluation
* High-level extraction pipeline coordination

Use modern packaging and dependency management, preferably `uv` or an equivalently reproducible tool.

Use:

* Strict type hints
* `mypy`
* `ruff`
* `pytest`
* Pydantic models or equivalent typed schemas
* Structured logging
* Explicit error types

## Rust performance layer

Use Rust for performance-sensitive and memory-sensitive operations such as:

* PDF object traversal
* Character and glyph geometry extraction
* Vector-path extraction
* Page rasterization coordination
* Spatial indexing
* Bounding-box operations
* Polygon operations
* Coordinate transformations
* Connected-component analysis
* Line and rectangle detection
* Image preprocessing hot paths
* Large-page iteration
* Fast layout graph construction
* Memory-safe processing of untrusted documents

Expose Rust functionality to Python through PyO3 and Maturin unless a better measured architecture is demonstrated.

Do not duplicate the full Rust API separately for Electron unless a benchmark proves that direct access is necessary.

## Interprocess communication

Electron should launch the packaged Python extraction service as a local sidecar process.

Prefer one of these communication mechanisms:

1. Typed JSON-RPC over standard input/output
2. Windows named pipes
3. A local authenticated socket only when the first two are unsuitable

Do not expose an unauthenticated local HTTP service.

All communication contracts must be versioned and stored in a shared contracts package.

Support:

* Request IDs
* Cancellation
* Progress events
* Timeouts
* Structured errors
* Service health checks
* Graceful shutdown
* Process recovery

---

# 4. Recommended Repository Structure

Create a monorepo similar to:

```text
pdf-intelligence/
├── apps/
│   └── desktop/
│       ├── electron/
│       ├── renderer/
│       ├── preload/
│       └── tests/
├── services/
│   └── extraction/
│       ├── src/
│       │   ├── pipeline/
│       │   ├── native_pdf/
│       │   ├── ocr/
│       │   ├── layout/
│       │   ├── tables/
│       │   ├── fields/
│       │   ├── document_family/
│       │   ├── confidence/
│       │   ├── corrections/
│       │   ├── validation/
│       │   ├── exports/
│       │   └── rpc/
│       └── tests/
├── crates/
│   ├── pdf_core/
│   ├── geometry/
│   ├── spatial_graph/
│   └── image_processing/
├── packages/
│   ├── contracts/
│   ├── project-schema/
│   ├── ui-components/
│   └── validation-rules/
├── models/
│   ├── manifests/
│   └── local/
├── test-data/
│   ├── synthetic/
│   ├── native-pdf/
│   ├── scanned-pdf/
│   ├── hybrid-pdf/
│   ├── malformed/
│   └── golden-results/
├── benchmarks/
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── extraction/
│   ├── security/
│   ├── ux/
│   └── release/
├── installers/
├── scripts/
└── README.md
```

Do not allow the project to become one large Electron application or one large Python service.

---

# 5. Canonical Document Data Model

Create a canonical intermediate representation called the Document Intelligence Model.

It should represent:

```text
Document
  Pages
    Render metadata
    Native objects
      Characters
      Words
      Lines
      Text blocks
      Vector paths
      Images
      Annotations
    OCR objects
    Layout regions
    Tables
      Rows
      Columns
      Cells
    Key-value fields
    Repeating sections
    Headers
    Footers
    Page numbers
    Confidence results
    Validation findings
    User corrections
```

Each object must support:

* Stable identifier
* Parent-child relationships
* Page association
* Bounding box
* Polygon where needed
* Reading-order index
* Source method
* Confidence
* Provenance
* Modification history
* User-confirmed status

Store project data in a versioned project format.

Use SQLite for durable project metadata and structured state. Use files or object storage within the project folder for page images, cached artifacts, and large intermediate data.

Implement project-schema migrations from the beginning.

---

# 6. Extraction Pipeline

Construct the extraction pipeline as independent, composable stages.

## Stage 1: Document inspection

Determine:

* Whether the PDF is encrypted
* Whether it is malformed
* Whether it contains native text
* Whether pages are scanned images
* Whether it is hybrid
* Page count
* Page sizes
* Rotation
* Embedded fonts
* Image density
* Vector-object density
* Text density
* Likely language
* Repeated page layouts
* Resource requirements
* Whether OCR is necessary

Produce a document inspection report before full extraction.

## Stage 2: Native PDF extraction

Extract native PDF content at the most granular practical level.

Capture:

* Character text
* Unicode values
* Character bounding boxes
* Word grouping
* Line grouping
* Baselines
* Font metadata
* Draw order
* Vector lines
* Filled shapes
* Images
* Clipping boundaries
* Transform matrices

Do not flatten the PDF into plain text before spatial analysis.

## Stage 3: Page rendering

Render each page through the selected PDF engine.

Support:

* Thumbnail rendering
* Viewport rendering
* High-resolution extraction rendering
* Multiple zoom levels
* Lazy rendering
* Page-cache eviction
* Cancellation
* Progress reporting

The user interface must remain responsive while large documents are processed.

## Stage 4: OCR

Use OCR only where needed.

Support:

* Fully scanned pages
* Hybrid pages
* Image-only regions embedded inside native PDFs
* Rotated text
* Skewed scans
* Low-resolution scans
* Multi-column documents

Create a pluggable OCR provider interface.

Begin with an offline OCR engine whose license allows redistribution. Verify licensing and Windows distribution requirements.

OCR preprocessing should support:

* Deskewing
* Rotation detection
* Contrast normalization
* Noise reduction
* Adaptive thresholding
* Region-level OCR
* Resolution adjustment

Never replace higher-confidence native text with lower-confidence OCR without recording the reconciliation decision.

## Stage 5: Content reconciliation

Merge native and OCR content through confidence-weighted reconciliation.

For every candidate object, consider:

* Geometric overlap
* Text similarity
* Source reliability
* Font consistency
* Reading order
* OCR confidence
* Native extraction quality
* Character completeness

Retain provenance for every final value.

## Stage 6: Layout segmentation

Detect regions such as:

* Titles
* Paragraphs
* Lists
* Tables
* Forms
* Key-value regions
* Headers
* Footers
* Page numbers
* Images
* Captions
* Sidebars
* Repeating record blocks

Use a pluggable layout-model interface.

Models should be deployable locally, preferably through ONNX Runtime or another portable inference runtime.

Verify all model licenses and redistribution terms.

## Stage 7: Spatial graph creation

Represent the page as a graph.

Possible nodes:

* Characters
* Words
* Lines
* Text blocks
* Vector segments
* Images
* Candidate regions

Possible edges:

* Horizontal proximity
* Vertical proximity
* Alignment
* Containment
* Overlap
* Baseline similarity
* Font similarity
* Reading-order likelihood
* Repetition similarity
* Row membership
* Column membership
* Label-value likelihood

Use a spatial index such as an R-tree for efficient geometric queries.

The graph should support extracting layout patterns without depending on brittle coordinate conditions.

## Stage 8: Reading-order inference

Infer reading order using:

* Geometry
* Column detection
* Baselines
* Block containment
* Language direction
* Whitespace
* Font hierarchy
* Graph traversal
* Layout-region classification

Keep the original PDF object order as evidence, but do not assume that it is always the correct reading order.

## Stage 9: Table detection

Detect tables through an ensemble of strategies:

* Vector-line detection
* Rectangle detection
* Whitespace analysis
* Repeated text alignment
* Numeric-column consistency
* Header-pattern detection
* Layout-model output
* Spatial graph clustering
* Repeated row spacing
* Candidate region scoring

Every table candidate should receive a confidence score and an explanation of the supporting evidence.

## Stage 10: Table reconstruction

Reconstruct:

* Table boundaries
* Rows
* Columns
* Cells
* Merged cells
* Split cells
* Nested headers
* Multi-line values
* Repeating headers
* Continuation tables
* Tables spanning multiple pages
* Footnotes
* Totals and subtotals

Prefer constraint-based reconstruction over deeply nested conditions.

Represent possible row, column, and cell boundaries as candidates. Score candidate structures and choose the structure that best satisfies:

* Alignment
* Consistent spacing
* Text containment
* Vector-line evidence
* Header consistency
* Data-type consistency
* Repetition
* Minimal overlap
* Minimal orphan text

## Stage 11: Field and key-value extraction

Detect key-value relationships using:

* Horizontal proximity
* Vertical proximity
* Colon and separator patterns
* Font differences
* Alignment
* Containment
* Semantic similarity
* Layout-model results
* Repetition across documents

Support fields such as:

* Names
* Dates
* Currency
* Percentages
* Addresses
* Identifiers
* Account numbers
* Quantities
* Descriptions

Keep semantic typing separate from raw extraction.

## Stage 12: Repeating-record detection

Identify repeating records through:

* Repeated geometric structures
* Similar spatial subgraphs
* Repeated labels
* Consistent row heights
* Page-to-page layout similarity
* Anchor relationships
* Content-type patterns

Allow a user to mark one record and have the application propose other matching records.

## Stage 13: Document-family classification

Generate a layout fingerprint for each document and page.

Fingerprint features may include:

* Page dimensions
* Text-block positions
* Font distributions
* Vector-line patterns
* Header locations
* Table-region locations
* Image placement
* Spatial graph signatures

Cluster related document layouts and select the best extraction strategy or template through scored similarity rather than exact file-name or vendor checks.

## Stage 14: Confidence and explainability

Every extracted value should include:

* Overall confidence
* Geometry confidence
* Text confidence
* Structural confidence
* Semantic confidence
* Source method
* Supporting evidence
* Conflicting evidence
* Whether it was user-confirmed

The UX should be able to explain a low-confidence result in plain language.

Example:

```text
This value has low confidence because the OCR result overlaps two possible
columns and no visible vertical separator was detected.
```

---

# 7. Declarative Rules and Minimal Conditional Logic

Build a declarative extraction-policy system.

Configuration should support:

* Thresholds
* Candidate weights
* Validation rules
* Data types
* Allowed value ranges
* Required fields
* Confidence cutoffs
* Strategy priorities
* Export mappings
* Field aliases
* Anchor definitions

Store policies in versioned JSON, YAML, or typed project data.

Create a strategy registry in which extraction strategies declare:

* Supported inputs
* Required evidence
* Produced outputs
* Estimated cost
* Confidence model
* Capability tags

The pipeline coordinator should score and select strategies instead of using a long sequence of hardcoded conditions.

Use state machines for workflow transitions.

Use pattern matching and typed result objects for error handling.

Avoid Boolean flags distributed across unrelated components.

---

# 8. User Experience Requirements

## Main workspace

Create a three-part workspace:

### Left panel

* Document and page navigation
* Page thumbnails
* Document-family grouping
* Extraction-step status
* Search

### Center panel

* Accurate PDF viewer
* Zoom and pan
* Page rotation
* Extraction overlays
* Table grids
* Field boundaries
* Reading-order visualization
* Confidence visualization
* Region selection

### Right panel

* Selected-object inspector
* Extracted value
* Data type
* Confidence
* Source
* Geometry
* Validation status
* Suggested corrections
* Template settings

Allow panels to be resized and collapsed.

## Guided workflow

Use a workflow similar to:

1. Import document
2. Analyze document
3. Review detected structures
4. Select desired data
5. Confirm or correct extraction
6. Apply extraction to remaining pages or documents
7. Validate results
8. Export data

The application should display one primary recommended action for the current state.

Examples:

* “Review three low-confidence tables”
* “Confirm the detected header row”
* “Apply this extraction pattern to 42 similar pages”
* “Resolve five invalid dates”
* “Export 1,284 validated records”

## Direct manipulation

Allow users to:

* Draw extraction regions
* Move and resize boundaries
* Add or remove table columns
* Add or remove rows
* Merge and split cells
* Change reading order
* Mark headers
* Mark repeating records
* Assign data types
* Rename fields
* Ignore regions
* Correct extracted text

All editing must support undo and redo.

## Synchronization

Selecting an extracted value must highlight its PDF location.

Selecting a PDF object must highlight the corresponding extracted record.

Hovering over a table cell should highlight the source region.

## Confidence review

Create a review queue sorted by:

* Lowest confidence
* Validation failures
* Conflicting extraction sources
* Missing required fields
* Unrecognized layouts

## Accessibility

Support:

* Keyboard navigation
* Focus indicators
* Screen-reader labels
* Sufficient contrast
* Scalable text
* Non-color confidence indicators
* Logical tab order

## Onboarding

Provide a short interactive onboarding process using a bundled sample PDF.

Do not require an account for local extraction.

---

# 9. Project and Template Functionality

A saved project should contain:

* Source-document references
* Cached page information
* Extraction configuration
* Templates
* Document-family profiles
* User corrections
* Validation rules
* Export mappings
* Processing history
* Application version
* Schema version
* Model versions

Templates should support:

* Absolute geometry
* Relative geometry
* Anchor-relative geometry
* Repeating regions
* Page-range applicability
* Document-family applicability
* Expected data types
* Validation rules
* Field naming
* Confidence thresholds

Prefer anchor-relative templates because absolute coordinates often fail when layouts shift slightly.

---

# 10. Export Requirements

Support exports to:

* CSV
* XLSX
* JSON
* XML
* Parquet
* SQLite

Export features should include:

* Column naming
* Data-type conversion
* Null handling
* Date formatting
* Decimal formatting
* Row filtering
* Column ordering
* Table selection
* Multi-table export
* Validation warnings
* Export preview
* Saved export profiles

Exported values should optionally include provenance fields such as:

* Source document
* Page number
* Bounding box
* Confidence
* Extraction method
* Validation status

---

# 11. Performance and Resource Management

Design for large documents, including documents with approximately 750 pages.

Requirements:

* Do not load every rendered page into memory.
* Use lazy page processing.
* Use bounded worker pools.
* Allow extraction cancellation.
* Allow processing pause and resume.
* Persist checkpoints.
* Stream progress updates.
* Cache reusable results.
* Process pages independently when possible.
* Avoid copying large raster buffers unnecessarily.
* Use Rust for measured hot paths.
* Use batch inference when beneficial.
* Release page resources after use.

Define and document a benchmark workstation, such as:

```text
Windows 11
8 logical CPU cores or more
16 GB RAM
SSD storage
No required GPU
```

Create benchmarks for:

* Time to first rendered page
* Time to initial document inspection
* Native text extraction throughput
* OCR throughput
* Table reconstruction throughput
* Peak memory
* Project save time
* Project reopen time
* Export throughput
* UI responsiveness during extraction

Do not optimize based on assumptions alone. Profile before moving code into Rust.

---

# 12. Security and Privacy

Treat every PDF as untrusted input.

Implement:

* File-size limits
* Page-count warnings
* Processing timeouts
* Memory limits where practical
* Path validation
* Temporary-file isolation
* Secure temporary-file deletion
* Malformed-PDF handling
* Parser crash containment
* Dependency vulnerability scanning
* Fuzz testing for Rust parsers and geometry inputs
* Sanitized logs
* No document text in logs by default
* No hidden network calls
* Offline operation
* Opt-in telemetry only
* Clear privacy settings

Consider isolating PDF parsing in a separate restricted process so a malformed document cannot terminate the primary UI process.

Electron must never expose unrestricted filesystem access to the renderer.

---

# 13. Development Standards

## TypeScript

Use:

* TypeScript strict mode
* ESLint
* Prettier
* Typed IPC
* React Testing Library
* Playwright
* Runtime schema validation

## Python

Use:

* Type hints throughout
* `mypy` strict or near-strict settings
* `ruff`
* `pytest`
* Property-based testing where useful
* Typed domain exceptions
* Pydantic or dataclass domain models
* No unstructured dictionaries across architectural boundaries

## Rust

Use:

* `rustfmt`
* `clippy`
* Explicit error types
* Safe Rust by default
* Documented and isolated `unsafe` blocks only when unavoidable
* Criterion benchmarks
* Property-based tests
* Fuzz targets for untrusted input boundaries

## General

Use:

* Conventional commits
* Architecture decision records
* Semantic versioning
* Dependency lockfiles
* Reproducible builds
* Structured logs
* Feature flags
* Versioned schemas
* Automated migrations

Pin dependencies after selecting verified stable versions.

Document every dependency that affects PDF parsing, OCR, machine learning, packaging, or redistribution licensing.

---

# 14. QA and Testing Strategy

Testing must be developed alongside the software, not postponed until the end.

## 14.1 Unit tests

Test:

* Coordinate transforms
* Bounding-box intersections
* Polygon operations
* Page rotation
* Reading-order scoring
* Row and column clustering
* Candidate scoring
* Confidence aggregation
* Validation rules
* Project migrations
* Export formatting
* RPC serialization
* Error handling

## 14.2 Geometry tests

Create synthetic PDFs with known object coordinates.

Verify:

* Extracted character positions
* Word positions
* Line positions
* Image bounds
* Vector-line bounds
* Rotated-page transforms
* Crop-box transforms
* Overlay alignment at multiple zoom levels
* High-DPI display behavior

Use golden image comparisons for PDF overlays.

Target:

* No visible systematic offset
* Source-coordinate error within an agreed tolerance
* Overlay error generally within approximately one display pixel at normal zoom for native objects

Record exact tolerances in the benchmark specification.

## 14.3 Extraction accuracy tests

Create a labeled evaluation corpus containing:

* Digital reports
* Scanned reports
* Hybrid PDFs
* Borderless tables
* Ruled tables
* Merged cells
* Multi-page tables
* Repeating headers
* Multi-column text
* Rotated pages
* Low-quality scans
* Forms
* Statements
* Invoices
* Reports with dense numeric data
* Reports with vector graphics
* PDFs with unusual fonts

Measure:

* Character accuracy
* Word accuracy
* Reading-order accuracy
* Region-detection precision and recall
* Table-detection precision and recall
* Cell-boundary F1
* Row and column reconstruction accuracy
* Field-value accuracy
* Data-type accuracy
* Multi-page table continuation accuracy

Separate native-PDF results from scanned-PDF results.

## 14.4 Table golden tests

For each test table, store expected:

* Bounding box
* Row count
* Column count
* Cell text
* Merged-cell structure
* Header hierarchy
* Page continuation
* Exported output

A change to table logic must run all table golden tests.

## 14.5 Integration tests

Test:

* Electron launching the extraction service
* Service recovery
* Document import
* Page rendering
* Extraction progress
* Cancellation
* Correction persistence
* Project save and reopen
* Template application
* Validation
* Export
* Application shutdown

## 14.6 End-to-end tests

Use Playwright for major workflows:

1. Launch the application.
2. Import a sample PDF.
3. Wait for analysis.
4. Select a detected table.
5. Correct one column.
6. Apply the pattern to other pages.
7. Review low-confidence values.
8. Export CSV.
9. Close and reopen the project.
10. Confirm that corrections and results persist.

## 14.7 Performance tests

Test:

* 1-page document
* 25-page document
* 100-page document
* 750-page document
* High-resolution scanned document
* Large table-heavy report

Fail tests when:

* Memory grows without bounds
* The UI becomes unresponsive
* Cancellation does not complete
* Resources are not released
* Processing becomes materially slower than the approved baseline without explanation

## 14.8 Reliability tests

Run:

* Repeated open-and-close cycles
* Batch document imports
* Extraction cancellation at different stages
* Service termination and restart
* Low-disk-space simulations
* Corrupted project-file tests
* Interrupted project saves
* Long-duration soak tests

## 14.9 Security tests

Test:

* Malformed PDFs
* Oversized object streams
* Invalid paths
* Path traversal attempts
* RPC payload validation
* Renderer IPC restrictions
* Unsupported file types
* Corrupted embedded images
* Extremely large page dimensions
* Dependency vulnerabilities

## 14.10 Accessibility tests

Use automated accessibility checks and manual keyboard testing.

---

# 15. Acceptance Targets

Establish a benchmark corpus before claiming production readiness.

Initial target values should include:

* Correct rendering and extraction geometry for at least 99% of native text objects in the controlled geometry corpus.
* No systematic overlay offset across rotation, crop-box, zoom, and DPI tests.
* Native text character accuracy of at least 99% on supported digital PDFs.
* Table-region detection F1 of at least 0.92 on the initial digital-PDF benchmark.
* Cell-structure F1 of at least 0.90 on the initial digital-PDF benchmark.
* OCR and scanned-table targets reported separately and never combined with native-PDF results to inflate metrics.
* Zero unhandled crashes across the approved regression corpus.
* Successful save and reopen of extraction projects without loss of corrections.
* Cancellation available for all long-running operations.
* Responsive page navigation while background extraction is active.
* No network transmission during ordinary offline extraction.
* A signed or signing-ready Windows installer.
* A clean installation on a Windows machine without a separate Python or Rust installation.

Treat these as initial engineering targets. Record benchmark evidence and adjust only through an explicit architectural decision.

---

# 16. AI-DLC Phase 1: Inception

Before major implementation, create:

```text
docs/product-requirements.md
docs/nonfunctional-requirements.md
docs/assumptions.md
docs/architecture/system-overview.md
docs/architecture/data-flow.md
docs/architecture/process-boundaries.md
docs/extraction/document-model.md
docs/extraction/pipeline.md
docs/security/threat-model.md
docs/ux/user-journeys.md
docs/qa/test-strategy.md
docs/release/windows-packaging.md
docs/roadmap.md
```

Create architecture decision records for:

* PDF engine
* OCR engine
* ML inference runtime
* Electron-to-Python IPC
* Rust-to-Python integration
* Project persistence
* Rendering cache
* Packaging method
* Installer technology
* Update strategy

Conduct technical spikes for:

1. Render a page and extract native word geometry from the same PDF.
2. Display a perfectly aligned overlay in Electron.
3. Call Rust from Python.
4. Launch the Python sidecar from Electron.
5. Package the vertical slice on Windows.
6. OCR one scanned page.
7. Detect and reconstruct one representative table.

Do not proceed to broad feature development until the geometry-overlay spike and packaged-sidecar spike work.

---

# 17. AI-DLC Phase 2: Construction Roadmap

## Milestone 1: Application shell

Build:

* Electron main process
* Secure preload bridge
* React interface
* Navigation
* Project creation
* File import
* Logging
* Error boundary
* Settings
* Extraction-service lifecycle management

Exit gate:

* The application launches.
* A PDF can be selected.
* The sidecar starts and stops reliably.
* Automated smoke tests pass.

## Milestone 2: PDF viewer and geometry foundation

Build:

* PDF rendering
* Page thumbnails
* Zoom
* Pan
* Rotation
* Coordinate transforms
* Native word extraction
* Overlay rendering
* Synchronized object selection

Exit gate:

* Geometry golden tests pass.
* Overlay alignment is demonstrated on rotated and cropped pages.

## Milestone 3: Canonical document model

Build:

* Versioned document schema
* Page objects
* Text objects
* Geometry objects
* Provenance
* Confidence objects
* SQLite persistence
* Project save and reopen

Exit gate:

* An imported document can be closed and reopened without losing extracted geometry.

## Milestone 4: Native extraction pipeline

Build:

* Character extraction
* Word grouping
* Line grouping
* Block grouping
* Reading order
* Images
* Vector lines
* Basic layout regions

Exit gate:

* Native extraction benchmark and regression suite pass.

## Milestone 5: OCR and hybrid reconciliation

Build:

* Scan detection
* Image preprocessing
* OCR provider
* OCR geometry
* Native/OCR reconciliation
* Confidence and provenance

Exit gate:

* Scanned and hybrid sample documents produce inspectable results.
* Native text is not unnecessarily replaced by OCR.

## Milestone 6: Intelligent table extraction

Build:

* Table candidate generation
* Candidate scoring
* Spatial graph
* Row and column clustering
* Cell reconstruction
* Merged cells
* Header detection
* Multi-page continuation
* Table confidence

Exit gate:

* Golden table tests meet the initial benchmark target.

## Milestone 7: Interactive correction and templates

Build:

* Region drawing
* Boundary adjustment
* Cell merge and split
* Header correction
* Field naming
* Data typing
* Undo and redo
* Anchor-relative templates
* Template application
* Document-family matching

Exit gate:

* A user can correct one table and apply the pattern to similar pages.

## Milestone 8: Validation and review

Build:

* Required-field rules
* Type validation
* Range validation
* Pattern validation
* Cross-field validation
* Low-confidence review queue
* Error navigation
* User confirmation

Exit gate:

* A user can resolve or waive all validation findings.

## Milestone 9: Export

Build all required export formats and export profiles.

Exit gate:

* Exports match approved golden results.
* Provenance export is available.

## Milestone 10: UX refinement

Build:

* Guided next-step actions
* Onboarding
* Empty states
* Progress visualization
* Confidence explanations
* Keyboard workflows
* Accessibility improvements
* Recovery messages

Exit gate:

* End-to-end usability workflow passes without developer intervention.

## Milestone 11: Performance hardening

Profile the complete application.

Move measured hot paths into Rust only where benchmarks justify the change.

Exit gate:

* Large-document benchmarks pass.
* Memory remains bounded.
* Cancellation and checkpointing work.

## Milestone 12: Windows packaging

Build:

* Embedded Python runtime or packaged Python sidecar
* Compiled Rust extensions
* Electron production bundle
* Windows installer
* Start-menu entry
* Uninstaller
* Application icon placeholders
* Version information
* Crash-safe logs
* Signing configuration
* Upgrade strategy

Exit gate:

* The application installs and runs on a clean Windows test machine with no separately installed Python, Node.js, or Rust toolchain.

---

# 18. AI-DLC Phase 3: Deployment and Maintenance

Create:

* Automated Windows CI builds
* Unit-test workflow
* Integration-test workflow
* End-to-end workflow
* Security scans
* Dependency-license checks
* Benchmark workflow
* Release-candidate workflow
* Installer artifact generation
* Versioned release notes
* Database and project-schema migration tests

Implement an update strategy that does not risk corrupting user projects.

Provide:

* Backup before migration
* Rollback behavior
* Compatibility checks
* Model-version tracking
* Extraction-engine version tracking
* Diagnostic export package
* Privacy-safe logs
* Optional crash reporting
* Optional telemetry requiring explicit consent

Create a maintenance process for:

* New PDF edge cases
* Regression corpus growth
* Model updates
* OCR updates
* Dependency updates
* Security patches
* Benchmark monitoring
* Schema migrations

Every production defect involving extraction should result in a sanitized regression fixture whenever legally and practically possible.

---

# 19. Codex Execution Behavior

While executing this project:

1. Work in small, testable increments.
2. Keep the application runnable after each milestone.
3. Prefer a working vertical slice over many unfinished subsystems.
4. Do not generate large quantities of placeholder code.
5. Do not claim that a feature is implemented when it returns mock data.
6. Run tests after meaningful changes.
7. Fix failing tests before expanding scope unless the failure is explicitly documented as blocked.
8. Record architectural changes in ADRs.
9. Keep implementation details synchronized with documentation.
10. Avoid introducing new frameworks without a documented reason.
11. Verify licenses before adding PDF, OCR, ML, or packaging dependencies.
12. Pin dependency versions and commit lockfiles.
13. Never log extracted private document contents by default.
14. Maintain a clear backlog of incomplete requirements.
15. Produce benchmark evidence rather than subjective performance claims.

At the beginning of each milestone, output:

* Goal
* Planned files
* Risks
* Test plan
* Acceptance criteria

At the end of each milestone, output:

* Files created or modified
* Functionality completed
* Commands executed
* Tests passed
* Tests failed
* Benchmark results
* Remaining risks
* Next milestone

---

# 20. Initial Commands and First Deliverable

Begin by:

1. Creating the monorepo structure.
2. Writing the Inception documentation.
3. Creating the initial ADRs.
4. Selecting and documenting the PDF rendering engine.
5. Building the geometry-overlay technical spike.
6. Building the Electron-to-Python sidecar communication spike.
7. Building the Rust-to-Python geometry call.
8. Adding tests for all three boundaries.
9. Packaging the vertical slice into a testable Windows build.

The first functional vertical slice must allow a user to:

1. Launch the Electron application.
2. Open a native-text PDF.
3. View the rendered first page.
4. Run extraction.
5. See word-level bounding boxes aligned over the PDF.
6. Click a word and inspect its text, geometry, source, and confidence.
7. Save the project.
8. Close and reopen the project.
9. Run automated geometry and end-to-end tests.
10. Produce a Windows development build.

Do not begin advanced OCR, table intelligence, or template learning until this vertical slice is stable.

After the vertical slice is complete, proceed through the remaining milestones in order unless benchmark evidence or an architectural blocker justifies changing the sequence.

The finished software must be a coherent, secure, testable, maintainable Windows PDF intelligence product—not merely a PDF viewer, OCR wrapper, table-extraction script, or collection of prototypes.
