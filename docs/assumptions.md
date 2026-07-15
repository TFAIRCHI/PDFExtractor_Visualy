# Assumptions

- Initial development can use a JSON project file before SQLite migrations are implemented.
- The first native-text spike may use `pypdf` for extraction while the PDF engine ADR is validated.
- Rust is required for the production geometry layer, but the current machine does not have `rustc` or `cargo` installed.
- The first Windows package can be an unsigned development directory build.
- OCR, table extraction, and template learning remain blocked behind the page-rendering and geometry-overlay exit gates.
- Until a project-local virtual environment or `uv` is added, Python dependency installation may affect the active system or Anaconda environment.
- The development package may launch on this workstation, but extraction in packaged form still depends on an installed Python runtime and installed sidecar dependencies.
