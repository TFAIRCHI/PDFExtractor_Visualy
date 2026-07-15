from pathlib import Path

from reportlab.pdfgen import canvas

from extraction_service.native_pdf import extract_document


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
