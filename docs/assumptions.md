# Assumptions

- Initial development can use a JSON project file before SQLite migrations are implemented.
- The first native-text spike may use `pypdf` for extraction while the PDF engine ADR is validated.
- Rust 1.97.0 is installed through rustup and pinned in `rust-toolchain.toml`.
- The first Windows package can be an unsigned development directory build.
- OCR, table extraction, and template learning remain blocked behind the page-rendering and geometry-overlay exit gates.
- Python sidecar development dependencies are isolated in `.venv` through `uv`; earlier global Anaconda install conflicts should not be repeated.
- The development package may launch on this workstation, but extraction in packaged form still depends on an installed Python runtime and installed sidecar dependencies.
