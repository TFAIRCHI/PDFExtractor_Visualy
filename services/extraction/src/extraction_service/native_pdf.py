from __future__ import annotations

from dataclasses import dataclass
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import Any

from pypdf import PdfReader

from .geometry import clamp_bbox, normalize_bbox
from .models import BBox, DocumentModel, PageModel, Provenance, WordObject


@dataclass(frozen=True)
class TextRun:
    run_index: int
    raw_text: str
    text: str
    x: float
    y: float
    font_size: float
    cm: list[float]
    tm: list[float]
    font_name: str | None


def inspect_document(pdf_path: str) -> dict[str, object]:
    path = _validate_pdf_path(pdf_path)
    reader = PdfReader(str(path))
    return {
        "sourcePath": str(path),
        "pageCount": len(reader.pages),
        "isEncrypted": bool(reader.is_encrypted),
    }


def extract_document(pdf_path: str, max_pages: int | None = None) -> DocumentModel:
    path = _validate_pdf_path(pdf_path)
    reader = PdfReader(str(path))
    page_limit = len(reader.pages) if max_pages is None else min(max_pages, len(reader.pages))
    pages: list[PageModel] = []
    engine_version = _pypdf_version()

    for page_index in range(page_limit):
        page = reader.pages[page_index]
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        rotation = float(page.get("/Rotate", 0) or 0)
        runs = _collect_text_runs(page)
        words = _runs_to_words(runs, page_index, width, height, engine_version)
        pages.append(
            PageModel(
                pageIndex=page_index,
                width=width,
                height=height,
                rotation=rotation,
                words=words,
            )
        )

    return DocumentModel(sourcePath=str(path), pageCount=len(reader.pages), pages=pages)


def extract_diagnostics(pdf_path: str, max_pages: int | None = None) -> dict[str, object]:
    path = _validate_pdf_path(pdf_path)
    reader = PdfReader(str(path))
    page_limit = len(reader.pages) if max_pages is None else min(max_pages, len(reader.pages))
    engine_version = _pypdf_version()
    pages: list[dict[str, object]] = []

    for page_index in range(page_limit):
        page = reader.pages[page_index]
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        rotation = float(page.get("/Rotate", 0) or 0)
        cropbox = page.cropbox
        runs = _collect_text_runs(page)
        words = _runs_to_words(runs, page_index, width, height, engine_version)
        pages.append(
            {
                "pageIndex": page_index,
                "mediaBox": {
                    "left": float(page.mediabox.left),
                    "bottom": float(page.mediabox.bottom),
                    "right": float(page.mediabox.right),
                    "top": float(page.mediabox.top),
                    "width": width,
                    "height": height,
                },
                "cropBox": {
                    "left": float(cropbox.left),
                    "bottom": float(cropbox.bottom),
                    "right": float(cropbox.right),
                    "top": float(cropbox.top),
                    "width": float(cropbox.width),
                    "height": float(cropbox.height),
                },
                "rotation": rotation,
                "rawTextRuns": [_diagnostic_run(run) for run in runs],
                "semanticWords": [word.model_dump() for word in words],
                "transformAssumptions": {
                    "extractorSource": "pypdf visitor_text tm[4]/tm[5]",
                    "sourceOrigin": "PDF user space, bottom-left origin before app conversion",
                    "semanticBoxFormula": "top_y = mediaBox.height - tm[5] - font_size",
                    "rendererSource": "pdf.js page.getViewport({ scale }) in renderer",
                    "displayFormula": "normalized bbox multiplied by pdf.js viewport width and height",
                    "devicePixelRatioHandling": "canvas backing store is scaled, overlay remains CSS pixels",
                },
            }
        )

    return {
        "diagnosticsVersion": "0.1.0",
        "sourcePath": str(path),
        "engine": "pypdf",
        "engineVersion": engine_version,
        "pageCount": len(reader.pages),
        "pages": pages,
    }


def _collect_text_runs(page: Any) -> list[TextRun]:
    runs: list[TextRun] = []

    def visitor_text(
        text: str,
        cm: list[float],
        tm: list[float],
        font_dict: dict[str, Any] | None,
        font_size: float,
    ) -> None:
        cleaned = text.strip()
        font_name = None
        if font_dict is not None:
            raw_font_name = font_dict.get("/BaseFont")
            font_name = str(raw_font_name) if raw_font_name is not None else None
        runs.append(
            TextRun(
                run_index=len(runs),
                raw_text=text,
                text=cleaned,
                x=float(tm[4]),
                y=float(tm[5]),
                font_size=float(font_size),
                cm=[float(value) for value in cm],
                tm=[float(value) for value in tm],
                font_name=font_name,
            )
        )

    page.extract_text(visitor_text=visitor_text)
    return runs


def _diagnostic_run(run: TextRun) -> dict[str, object]:
    return {
        "runIndex": run.run_index,
        "rawText": run.raw_text,
        "cleanedText": run.text,
        "isWhitespaceOnly": run.raw_text.strip() == "",
        "skippedBySemanticExtraction": run.text == "",
        "xFromTextMatrix": run.x,
        "yFromTextMatrix": run.y,
        "fontSize": run.font_size,
        "fontName": run.font_name,
        "currentTransformationMatrix": run.cm,
        "textMatrix": run.tm,
    }


def _runs_to_words(
    runs: list[TextRun],
    page_index: int,
    page_width: float,
    page_height: float,
    engine_version: str,
) -> list[WordObject]:
    words: list[WordObject] = []
    provenance = Provenance(engine="pypdf", engineVersion=engine_version)
    for run_index, run in enumerate(runs):
        parts = run.text.split()
        if not parts:
            continue
        total_chars = sum(len(part) for part in parts)
        cursor_x = run.x
        estimated_char_width = max(run.font_size * 0.5, 1.0)
        for part_index, part in enumerate(parts):
            width = max(len(part) * estimated_char_width, 1.0)
            height = max(run.font_size, 1.0)
            top_y = page_height - run.y - height
            source = clamp_bbox(
                BBox(x=cursor_x, y=top_y, width=width, height=height),
                page_width,
                page_height,
            )
            words.append(
                WordObject(
                    objectId=f"p{page_index}-r{run_index}-w{part_index}",
                    pageIndex=page_index,
                    text=part,
                    sourceBBox=source,
                    normalizedBBox=normalize_bbox(source, page_width, page_height),
                    confidence=_estimate_confidence(part, total_chars),
                    provenance=provenance,
                )
            )
            cursor_x += width + estimated_char_width
    return words


def _estimate_confidence(text: str, run_chars: int) -> float:
    if not text:
        return 0.0
    if run_chars <= 0:
        return 0.5
    return 0.78


def _validate_pdf_path(pdf_path: str) -> Path:
    path = Path(pdf_path).expanduser().resolve()
    if path.suffix.lower() != ".pdf":
        raise ValueError("Only PDF files are supported.")
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"PDF not found: {path}")
    return path


def _pypdf_version() -> str:
    try:
        return version("pypdf")
    except PackageNotFoundError:
        return "unknown"
