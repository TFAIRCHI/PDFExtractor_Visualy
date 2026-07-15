# Windows Packaging

The initial development package uses `electron-builder` directory output.

Current output:

- `installers/dev/win-unpacked/PDF Intelligence.exe`
- Unsigned.
- PyInstaller-built sidecar copied to `resources/sidecar/extraction-service.exe`.
- Packaged sidecar no longer depends on a separately installed Python interpreter.

Production packaging requires:

- Compiled Rust extensions.
- Installer technology selection.
- Code-signing configuration.
- Upgrade and rollback strategy.
- Clean-machine installation test.

The current package is not production-ready and is unsigned.
