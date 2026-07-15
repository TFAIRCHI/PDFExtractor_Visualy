# Process Boundaries

- Renderer has `nodeIntegration: false` and `contextIsolation: true`.
- Renderer calls only functions exposed by `contextBridge`.
- Main process validates all renderer-originating file paths and requests.
- Python sidecar uses line-delimited JSON-RPC on stdio.
- No unauthenticated local HTTP service is exposed.
- Future PDF parsing isolation should split native PDF traversal into a restricted worker process.
