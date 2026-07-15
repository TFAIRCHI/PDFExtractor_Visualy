# PDF Intelligence

Offline-first Windows desktop software for PDF extraction, review, correction, and export.

Current state: first vertical-slice scaffold. It includes an Electron/React shell, a typed preload bridge, a Python JSON-RPC extraction sidecar, shared TypeScript contracts, project save/reopen, and initial boundary tests.

## Development

Prerequisites currently used by the scaffold:

- Node.js 24+
- Python 3.11+
- Rust toolchain is planned but not present in this workspace environment.

Install JavaScript dependencies:

```powershell
npm install
```

Install Python sidecar in editable mode:

```powershell
python -m pip install -e services/extraction[dev]
```

Run checks:

```powershell
npm test
python -m pytest services/extraction/tests
```

Run the desktop app:

```powershell
npm run dev
```

Build a Windows development package:

```powershell
npm run package:dir
```

## First Vertical Slice

The current target workflow is:

1. Launch the Electron app.
2. Open a native-text PDF.
3. View the first page.
4. Run extraction through the Python sidecar.
5. Display word bounding boxes over the rendered page.
6. Select a word and inspect text, geometry, source, and confidence.
7. Save a project JSON file.
8. Reopen the saved project.

See [docs/roadmap.md](docs/roadmap.md) for current status and risks.
