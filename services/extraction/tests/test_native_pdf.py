from pathlib import Path

from reportlab.pdfgen import canvas

from extraction_service.native_pdf import extract_diagnostics, extract_document
from fixtures.check_register_generator import generate_nonstandard_check_register


def test_extract_document_words_from_generated_pdf(tmp_path: Path) -> None:
    pdf_path = tmp_path / "sample.pdf"
    pdf = canvas.Canvas(str(pdf_path), pagesize=(200, 200))
    pdf.drawString(20, 150, "Invoice Total")
    pdf.save()

    document = extract_document(str(pdf_path), max_pages=1)

    assert document.pageCount == 1
    assert document.pages[0].words
    assert [word.text for word in document.pages[0].words[:2]] == ["Invoice", "Total"]
    assert all(0 <= word.normalizedBBox.x <= 1 for word in document.pages[0].words)


def test_extract_diagnostics_preserves_whitespace_runs(tmp_path: Path) -> None:
    pdf_path = tmp_path / "diagnostic.pdf"
    pdf = canvas.Canvas(str(pdf_path), pagesize=(200, 200))
    pdf.drawString(20, 150, "Alpha  Beta")
    pdf.save()

    diagnostics = extract_diagnostics(str(pdf_path), max_pages=1)

    page = diagnostics["pages"][0]  # type: ignore[index]
    runs = page["rawTextRuns"]  # type: ignore[index]
    words = page["semanticWords"]  # type: ignore[index]
    assert any(run["rawText"] == "Alpha  Beta\n" for run in runs)  # type: ignore[index]
    assert [word["text"] for word in words] == ["Alpha", "Beta"]  # type: ignore[index]


def test_extract_document_resolves_extensive_same_line_overlap(tmp_path: Path) -> None:
    pdf_path = tmp_path / "overlap.pdf"
    pdf = canvas.Canvas(str(pdf_path), pagesize=(200, 200))
    pdf.drawString(20, 150, "WIDEWIDE")
    pdf.drawString(50, 150, "NEXT")
    pdf.save()

    document = extract_document(str(pdf_path), max_pages=1)
    words = document.pages[0].words
    wide = next(word for word in words if word.text == "WIDEWIDE")
    next_word = next(word for word in words if word.text == "NEXT")

    assert wide.sourceBBox.x + wide.sourceBBox.width <= next_word.sourceBBox.x


def test_extracts_synthetic_nonstandard_check_register_without_empty_words(tmp_path: Path) -> None:
    pdf_path = tmp_path / "nonstandard-register-12p.pdf"
    manifest = generate_nonstandard_check_register(pdf_path, page_count=12)

    document = extract_document(str(pdf_path))

    assert document.pageCount == manifest.page_count
    assert len(document.pages) == manifest.page_count
    assert all(word.text.strip() for page in document.pages for word in page.words)
    assert any(word.text == "REGISTER" for page in document.pages for word in page.words)
    assert any(word.text == "CHK-012-0024" for word in document.pages[-1].words)
    for page in document.pages:
        assert all(0 <= word.normalizedBBox.x <= 1 for word in page.words)
        assert all(0 <= word.normalizedBBox.y <= 1 for word in page.words)
        assert all(word.normalizedBBox.width > 0 for word in page.words)
        assert all(word.normalizedBBox.height > 0 for word in page.words)
