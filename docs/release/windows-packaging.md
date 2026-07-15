# Windows Packaging

The initial development package uses `electron-builder` directory output.

Current output:

- `installers/dev/win-unpacked/PDF Intelligence.exe`
- Unsigned.
- Python sidecar source copied into packaged resources.
- No embedded Python runtime yet.

Production packaging requires:

- Embedded Python sidecar.
- Compiled Rust extensions.
- Installer technology selection.
- Code-signing configuration.
- Upgrade and rollback strategy.
- Clean-machine installation test.

The current package is not production-ready and is unsigned.
