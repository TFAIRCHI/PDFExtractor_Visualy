import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import type { DocumentModel, ProjectModel, WordObject } from "@pdf-intelligence/contracts";
import "./styles.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

type LoadedPdf = {
  path: string;
  name: string;
  bytes: ArrayBuffer;
};

function App(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdf | null>(null);
  const [documentModel, setDocumentModel] = useState<DocumentModel | null>(null);
  const [pdfPage, setPdfPage] = useState<PDFPageProxy | null>(null);
  const [scale, setScale] = useState(1.25);
  const [status, setStatus] = useState("Open a PDF to begin.");
  const [selectedWord, setSelectedWord] = useState<WordObject | null>(null);
  const [projectPath, setProjectPath] = useState<string | null>(null);

  const viewport = useMemo(() => pdfPage?.getViewport({ scale }) ?? null, [pdfPage, scale]);
  const pageWords = documentModel?.pages[0]?.words ?? [];

  async function openPdf(): Promise<void> {
    const file = await window.pdfIntelligence.openPdf();
    if (!file) {
      return;
    }
    const bytes = await window.pdfIntelligence.readPdf(file.path);
    setLoadedPdf({ ...file, bytes });
    setDocumentModel(null);
    setSelectedWord(null);
    setProjectPath(null);
    setStatus("Rendering first page.");
    await renderFirstPage(bytes, scale);
    setStatus("PDF loaded. Run extraction to inspect word geometry.");
  }

  async function renderFirstPage(bytes: ArrayBuffer, nextScale: number): Promise<void> {
    const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) });
    const pdf: PDFDocumentProxy = await loadingTask.promise;
    const page = await pdf.getPage(1);
    setPdfPage(page);
    await renderPage(page, nextScale);
  }

  async function renderPage(page: PDFPageProxy, nextScale: number): Promise<void> {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const nextViewport = page.getViewport({ scale: nextScale });
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(nextViewport.width * outputScale);
    canvas.height = Math.floor(nextViewport.height * outputScale);
    canvas.style.width = `${nextViewport.width}px`;
    canvas.style.height = `${nextViewport.height}px`;
    context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
    await page.render({ canvasContext: context, viewport: nextViewport }).promise;
  }

  async function runExtraction(): Promise<void> {
    if (!loadedPdf) {
      return;
    }
    setStatus("Extracting native words through Python sidecar.");
    const extracted = await window.pdfIntelligence.extractNative(loadedPdf.path);
    setDocumentModel(extracted);
    setStatus(`Extraction complete. ${extracted.pages[0]?.words.length ?? 0} words detected.`);
  }

  async function changeScale(nextScale: number): Promise<void> {
    setScale(nextScale);
    if (pdfPage) {
      await renderPage(pdfPage, nextScale);
    }
  }

  async function saveProject(): Promise<void> {
    if (!loadedPdf || !documentModel) {
      return;
    }
    const project: ProjectModel = {
      schemaVersion: "0.1.0",
      sourcePath: loadedPdf.path,
      document: documentModel,
      savedAt: new Date().toISOString()
    };
    const savedPath = await window.pdfIntelligence.saveProject(projectPath, project);
    if (savedPath) {
      setProjectPath(savedPath);
      setStatus(`Project saved: ${savedPath}`);
    }
  }

  async function openProject(): Promise<void> {
    const result = await window.pdfIntelligence.openProject();
    if (!result) {
      return;
    }
    const bytes = await window.pdfIntelligence.readPdf(result.project.sourcePath);
    setLoadedPdf({
      path: result.project.sourcePath,
      name: result.project.sourcePath.split(/[\\/]/).pop() ?? "PDF",
      bytes
    });
    setDocumentModel(result.project.document);
    setProjectPath(result.path);
    setSelectedWord(null);
    await renderFirstPage(bytes, scale);
    setStatus(`Project reopened: ${result.path}`);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Workflow">
        <h1>PDF Intelligence</h1>
        <p className="status">{status}</p>
        <div className="button-stack">
          <button onClick={openPdf}>Open PDF</button>
          <button onClick={openProject}>Open Project</button>
          <button onClick={runExtraction} disabled={!loadedPdf}>
            Run Extraction
          </button>
          <button onClick={saveProject} disabled={!documentModel}>
            Save Project
          </button>
        </div>
        <label className="control">
          Zoom
          <input
            type="range"
            min="0.75"
            max="2.5"
            step="0.25"
            value={scale}
            onChange={(event) => void changeScale(Number(event.target.value))}
          />
        </label>
        <section className="inspector" aria-label="Selected word inspector">
          <h2>Selection</h2>
          {selectedWord ? (
            <dl>
              <dt>Text</dt>
              <dd>{selectedWord.text}</dd>
              <dt>Object</dt>
              <dd>{selectedWord.objectId}</dd>
              <dt>Source</dt>
              <dd>{selectedWord.sourceMethod}</dd>
              <dt>Confidence</dt>
              <dd>{Math.round(selectedWord.confidence * 100)}%</dd>
              <dt>Source bbox</dt>
              <dd>{formatBBox(selectedWord.sourceBBox)}</dd>
            </dl>
          ) : (
            <p>Select a highlighted word.</p>
          )}
        </section>
      </aside>
      <section className="document-stage" aria-label="PDF page">
        <div className="page-frame">
          <canvas ref={canvasRef} aria-label="Rendered PDF page" />
          {viewport ? (
            <div className="overlay-layer" style={{ width: viewport.width, height: viewport.height }}>
              {pageWords.map((word) => (
                <button
                  key={word.objectId}
                  className={word.objectId === selectedWord?.objectId ? "word-box selected" : "word-box"}
                  style={wordStyle(word, viewport.width, viewport.height)}
                  onClick={() => setSelectedWord(word)}
                  title={`${word.text} (${Math.round(word.confidence * 100)}%)`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function wordStyle(word: WordObject, width: number, height: number): React.CSSProperties {
  return {
    left: word.normalizedBBox.x * width,
    top: word.normalizedBBox.y * height,
    width: Math.max(word.normalizedBBox.width * width, 4),
    height: Math.max(word.normalizedBBox.height * height, 4)
  };
}

function formatBBox(box: WordObject["sourceBBox"]): string {
  return `${box.x.toFixed(1)}, ${box.y.toFixed(1)}, ${box.width.toFixed(1)}, ${box.height.toFixed(1)}`;
}

createRoot(document.getElementById("root")!).render(<App />);
