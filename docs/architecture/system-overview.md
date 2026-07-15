# System Overview

The product is a monorepo with four primary boundaries:

- Electron main process: owns windows, filesystem dialogs, project IO, and sidecar lifecycle.
- Secure preload: exposes a narrow typed API to the renderer.
- React renderer: owns PDF viewing, overlays, user inspection, and workflow state.
- Python extraction sidecar: owns document inspection and high-level extraction orchestration.

Rust crates are reserved for measured hot paths and the canonical geometry implementation. The first scaffold includes a Rust crate skeleton, but it is not executable until the Rust toolchain is installed.
