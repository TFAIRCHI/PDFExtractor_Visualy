from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


@dataclass(frozen=True)
class CheckRegisterManifest:
    page_count: int
    rows_per_page: int
    repeated_token: str
    overlap_tokens: tuple[str, str]


def generate_nonstandard_check_register(
    pdf_path: Path,
    *,
    page_count: int = 12,
    rows_per_page: int = 24,
) -> CheckRegisterManifest:
    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(pdf_path), pagesize=letter)
    width, height = letter
    balance = 12500.0
    repeated_token = "REGISTER"

    for page_number in range(1, page_count + 1):
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(36, height - 36, f"CHECK {repeated_token} - SYNTHETIC BANK QA")
        pdf.setFont("Helvetica", 8)
        pdf.drawRightString(width - 36, height - 36, f"PAGE {page_number:03d} OF {page_count:03d}")
        pdf.drawString(36, height - 52, "ACCOUNT QA-CHK-000012")

        y = height - 78
        pdf.setFont("Helvetica-Bold", 7)
        pdf.drawString(36, y, "CHECK")
        pdf.drawString(105, y, "DATE")
        pdf.drawString(158, y, "PAYEE MEMO")
        pdf.drawRightString(438, y, "DEBIT")
        pdf.drawRightString(505, y, "BALANCE")
        pdf.drawString(528, y, "STATUS")
        y -= 16

        pdf.setFont("Helvetica", 7)
        if page_number == 1:
            pdf.drawString(36, y, "WIDEWIDE")
            pdf.drawString(66, y, "NEXT")
            y -= 14

        for row_number in range(1, rows_per_page + 1):
            global_row = ((page_number - 1) * rows_per_page) + row_number
            amount = -1 * (20 + (global_row % 13) * 7.13)
            balance += amount
            row_height = 12 if row_number % 5 else 18
            check_id = f"CHK-{page_number:03d}-{row_number:04d}"
            payee = f"PAYEE_{page_number:03d}_{row_number:04d}"
            memo = f"MEMO_{page_number:03d}_{row_number:04d}"
            status = "VOID" if row_number % 11 == 0 else ("PENDING" if row_number % 7 == 0 else "CLEARED")

            pdf.drawString(36, y, check_id)
            pdf.drawString(105, y, f"07/{(row_number % 28) + 1:02d}/26")
            pdf.drawString(158, y, payee)
            pdf.drawString(250, y, memo)
            pdf.drawRightString(438, y, f"({abs(amount):,.2f})")
            pdf.drawRightString(505, y, f"{balance:,.2f}")
            pdf.drawString(528, y, status)

            if row_number % 5 == 0:
                pdf.drawString(174, y - 8, f"SECOND_LINE_{page_number:03d}_{row_number:04d}")

            y -= row_height

        pdf.setFont("Helvetica-Bold", 8)
        pdf.drawString(36, 34, f"ENDING BALANCE PAGE_{page_number:03d}")
        pdf.drawRightString(width - 36, 34, f"{balance:,.2f}")
        pdf.showPage()

    pdf.save()
    return CheckRegisterManifest(
        page_count=page_count,
        rows_per_page=rows_per_page,
        repeated_token=repeated_token,
        overlap_tokens=("WIDEWIDE", "NEXT"),
    )
