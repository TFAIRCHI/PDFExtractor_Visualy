import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import type { DocumentModel, ProjectModel, WordObject } from "@pdf-intelligence/contracts";
import { findSameWordMatches } from "./patternDiscovery.js";
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
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [documentModel, setDocumentModel] = useState<DocumentModel | null>(null);
  const [pdfPage, setPdfPage] = useState<PDFPageProxy | null>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [scale, setScale] = useState(1.25);
  const [status, setStatus] = useState("Open a PDF to begin.");
  const [selectedWord, setSelectedWord] = useState<WordObject | null>(null);
  const [projectPath, setProjectPath] = useState<string | null>(null);

  const viewport = useMemo(() => pdfPage?.getViewport({ scale }) ?? null, [pdfPage, scale]);
  const pageWords = documentModel?.pages.find((page) => page.pageIndex === activePageIndex)?.words ?? [];
  const selectedPattern = useMemo(
    () => findSameWordMatches(documentModel, selectedWord),
    [documentModel, selectedWord]
  );
  const selectedPatternIds = useMemo(
    () => new Set(selectedPattern.map((word) => word.objectId)),
    [selectedPattern]
  );

  useEffect(() => {
    let cancelled = false;
    async function loadE2eFixture(): Promise<void> {
      const config = await window.pdfIntelligence.getE2eConfig();
      if (!config?.pdfPath || cancelled) {
        return;
      }
      await loadPdfFromPath(config.pdfPath, config.pdfPath.split(/[\\/]/).pop() ?? "E2E.pdf");
      if (config.projectPath && !cancelled) {
        setProjectPath(config.projectPath);
      }
    }
    void loadE2eFixture();
    return () => {
      cancelled = true;
    };
  }, []);

  async function openPdf(): Promise<void> {
    const file = await window.pdfIntelligence.openPdf();
    if (!file) {
      return;
    }
    await loadPdfFromPath(file.path, file.name);
  }

  async function loadPdfFromPath(pdfPath: string, name: string): Promise<void> {
    const bytes = await window.pdfIntelligence.readPdf(pdfPath);
    setLoadedPdf({ path: pdfPath, name, bytes });
    setPdfDocument(null);
    setDocumentModel(null);
    setSelectedWord(null);
    setActivePageIndex(0);
    setProjectPath(null);
    setStatus("Rendering first page.");
    await renderFirstPage(bytes, scale);
    setStatus("PDF loaded. Run extraction to inspect word geometry.");
  }

  async function renderFirstPage(bytes: ArrayBuffer, nextScale: number): Promise<void> {
    const loadingTask = pdfjsLib.getDocument({ data: bytes.slice(0) });
    const pdf: PDFDocumentProxy = await loadingTask.promise;
    setPdfDocument(pdf);
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
    try {
      setStatus("Extracting native words through Python sidecar.");
      const extracted = await window.pdfIntelligence.extractNative(loadedPdf.path);
      setDocumentModel(extracted);
      setSelectedWord(null);
      const wordCount = extracted.pages.reduce(
        (total: number, page: DocumentModel["pages"][number]) => total + page.words.length,
        0
      );
      setStatus(`Extraction complete. ${wordCount} words detected across ${extracted.pages.length} pages.`);
    } catch (error) {
      setStatus(`Extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function changeScale(nextScale: number): Promise<void> {
    setScale(nextScale);
    if (pdfPage) {
      await renderPage(pdfPage, nextScale);
    }
  }

  async function goToPage(nextPageIndex: number): Promise<void> {
    if (!pdfDocument) {
      return;
    }
    const boundedPageIndex = Math.min(Math.max(nextPageIndex, 0), pdfDocument.numPages - 1);
    const page = await pdfDocument.getPage(boundedPageIndex + 1);
    setActivePageIndex(boundedPageIndex);
    setPdfPage(page);
    setSelectedWord(null);
    await renderPage(page, scale);
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
    setActivePageIndex(0);
    await renderFirstPage(bytes, scale);
    setStatus(`Project reopened: ${result.path}`);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Workflow">
        <h1>PDF Intelligence</h1>
        <p className="status" data-testid="status">
          {status}
        </p>
        <div className="button-stack">
          <button onClick={openPdf} data-testid="open-pdf">
            Open PDF
          </button>
          <button onClick={openProject} data-testid="open-project">
            Open Project
          </button>
          <button onClick={runExtraction} disabled={!loadedPdf} data-testid="run-extraction">
            Run Extraction
          </button>
          <button onClick={saveProject} disabled={!documentModel} data-testid="save-project">
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
        <div className="page-controls" aria-label="Page navigation">
          <button
            onClick={() => void goToPage(activePageIndex - 1)}
            disabled={!pdfDocument || activePageIndex === 0}
            data-testid="previous-page"
          >
            Prev
          </button>
          <span data-testid="page-indicator">
            Page {activePageIndex + 1} of {pdfDocument?.numPages ?? documentModel?.pageCount ?? 1}
          </span>
          <button
            onClick={() => void goToPage(activePageIndex + 1)}
            disabled={!pdfDocument || activePageIndex + 1 >= pdfDocument.numPages}
            data-testid="next-page"
          >
            Next
          </button>
        </div>
        <section className="inspector" aria-label="Selected word inspector">
          <h2>Selection</h2>
          {selectedWord ? (
            <dl data-testid="selection-details">
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
              <dt>Matches</dt>
              <dd data-testid="pattern-summary">
                {selectedPattern.length} occurrence{selectedPattern.length === 1 ? "" : "s"}
              </dd>
            </dl>
          ) : (
            <p>Select a highlighted word.</p>
          )}
        </section>
        {selectedWord ? (
          <section className="pattern-panel" aria-label="Same word pattern matches">
            <h2>Pattern Matches</h2>
            <ol data-testid="pattern-matches">
              {selectedPattern.slice(0, 20).map((word) => (
                <li key={word.objectId} data-testid="pattern-match">
                  Page {word.pageIndex + 1}: {word.text}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </aside>
      <section className="document-stage" aria-label="PDF page">
        <div className="page-frame">
          <canvas ref={canvasRef} aria-label="Rendered PDF page" />
          {viewport ? (
            <div className="overlay-layer" style={{ width: viewport.width, height: viewport.height }}>
              {pageWords.map((word) => (
                <button
                  key={word.objectId}
                  className={wordClassName(word, selectedWord, selectedPatternIds)}
                  data-testid="word-box"
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

function wordClassName(
  word: WordObject,
  selectedWord: WordObject | null,
  selectedPatternIds: Set<string>
): string {
  const classes = ["word-box"];
  if (selectedPatternIds.has(word.objectId)) {
    classes.push("pattern-match");
  }
  if (word.objectId === selectedWord?.objectId) {
    classes.push("selected");
  }
  return classes.join(" ");
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
