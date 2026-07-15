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
    text: str
    x: float
    y: float
    font_size: float


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
        runs: list[TextRun] = []

        def visitor_text(
            text: str,
            _cm: Any,
            tm: list[float],
            _font_dict: dict[str, Any] | None,
            font_size: float,
        ) -> None:
            cleaned = text.strip()
            if not cleaned:
                return
            runs.append(TextRun(text=cleaned, x=float(tm[4]), y=float(tm[5]), font_size=float(font_size)))

        page.extract_text(visitor_text=visitor_text)
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
