from pathlib import Path

from reportlab.pdfgen import canvas

from extraction_service.native_pdf import extract_diagnostics, extract_document


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
