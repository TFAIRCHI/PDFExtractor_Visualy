# Data Flow

1. User selects a PDF in the renderer through the preload API.
2. Electron main validates the path and returns metadata.
3. Renderer displays the PDF through `pdf.js`.
4. Renderer requests extraction for the selected path.
5. Electron main sends JSON-RPC to the Python sidecar over stdio.
6. Sidecar returns canonical document objects with source and normalized geometry.
7. Renderer converts normalized geometry to page display coordinates for overlays.
8. Project save writes a versioned project document through the main process.
