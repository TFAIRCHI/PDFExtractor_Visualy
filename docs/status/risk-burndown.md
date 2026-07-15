# Risk Burndown

## Resolved In Repository

- Rust toolchain missing: resolved by installing rustup, pinning `stable`, adding `Cargo.lock`, and passing `cargo fmt`, `cargo test`, and `cargo clippy`.
  Commit: `490cc6f`
- Python dependency leakage into Anaconda/global environment: resolved with project-local `.venv`, `uv`, and `services/extraction/uv.lock`.
  Commit: `787f3b8`
- Packaged sidecar dependency on installed Python: resolved with PyInstaller sidecar executable packaged into Electron resources.
  Commit: `a1ef895`
- Electron vertical-slice E2E gap: resolved with Playwright Electron workflow covering PDF load, extraction, overlay selection, and project save.
  Commit: `aa59dd2`
- Golden overlay regression gap: resolved with a Windows Playwright screenshot baseline for the rendered page plus word overlays.
  Commit: `e089b3c`
- Packaged-app sidecar smoke gap: resolved with a packaged executable test that filters Python/Anaconda paths from `PATH`.
  Commit: `9314e11`
- Sidecar recovery gap: resolved with a Vitest integration test that kills and restarts the sidecar.
  Commit: `35ac6ff`
- Privacy-safe operational logging gap: resolved with structured main-process logging that redacts likely document text/content fields.
  Commit: `9637530`
- Windows installer gap: resolved with unsigned NSIS installer generation and a placeholder Windows icon.
  Commit: `cba8e4e`
- Package artifact verification gap: resolved with `npm run verify:package`, which checks the unsigned installer, unpacked app executable, bundled sidecar executable, and packaged sidecar health RPC.
  Commit: current update

## Still Not Production-Cleared

- Production code signing: requires a real code-signing certificate and secure CI secret handling.
- Clean-machine verification: current package smoke removes development Python from `PATH`, but a separate clean Windows VM has not been provisioned in this workspace.
- Same-engine geometry acceptance: the first slice still uses `pdf.js` rendering with Python-side native extraction. Golden overlay tests guard the current behavior, but production acceptance still requires the planned PDFium/same-engine spike and license bundle review.
