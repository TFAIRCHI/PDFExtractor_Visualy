# Windows Packaging

The initial development package uses `electron-builder` directory output.

Current output:

- `installers/dev/win-unpacked/PDF Intelligence.exe`
- Unsigned NSIS installer: `installers/dev/PDF Intelligence Setup 0.1.0.exe`
- Unsigned.
- PyInstaller-built sidecar copied to `resources/sidecar/extraction-service.exe`.
- Packaged sidecar no longer depends on a separately installed Python interpreter.
- Packaged smoke test launches the built app with development Python removed from `PATH`.
- Placeholder Windows icon is stored at `apps/desktop/assets/icon.ico`.

Production packaging requires:

- Compiled Rust extensions.
- Installer technology selection.
- Code-signing configuration.
- Upgrade and rollback strategy.
- Clean-machine installation test.

The current package is not production-ready and is unsigned. Production signing requires a Windows code-signing certificate and secure CI secret handling.
