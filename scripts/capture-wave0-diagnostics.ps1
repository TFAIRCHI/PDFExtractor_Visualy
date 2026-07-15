$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$python = Join-Path $repoRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
  throw "Missing .venv. Run scripts/setup-python.ps1 first."
}

$env:PYTHONPATH = Join-Path $repoRoot "services\extraction\src"
$fixtureDir = Join-Path $repoRoot "test-data\regressions\current-overlay-failure"
$artifactDir = Join-Path $repoRoot "artifacts\diagnostics"
New-Item -ItemType Directory -Force -Path $fixtureDir | Out-Null
New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null

$captureScript = @'
from __future__ import annotations

import json
import sys
from pathlib import Path

from reportlab.pdfgen import canvas

from extraction_service.native_pdf import extract_diagnostics

fixture_path = Path(sys.argv[1])
extraction_path = Path(sys.argv[2])
transform_path = Path(sys.argv[3])

pdf = canvas.Canvas(str(fixture_path), pagesize=(300, 220))
pdf.setFont("Helvetica", 12)
pdf.drawString(40, 160, "Alpha  Beta")
pdf.drawString(40, 130, "WideWord")
pdf.drawString(145, 130, "Neighbor")
pdf.save()

diagnostics = extract_diagnostics(str(fixture_path), max_pages=1)
page = diagnostics["pages"][0]
viewport_scale = 1.25
media_box = page["mediaBox"]
viewport_width = media_box["width"] * viewport_scale
viewport_height = media_box["height"] * viewport_scale

transform_trace = {
    "traceVersion": "0.1.0",
    "sourcePdf": str(fixture_path),
    "pageIndex": 0,
    "renderer": "pdf.js",
    "rendererViewport": {
        "scale": viewport_scale,
        "widthCssPx": viewport_width,
        "heightCssPx": viewport_height,
        "origin": "top-left CSS page space",
    },
    "extractor": "pypdf visitor_text",
    "extractorCoordinates": {
        "sourceOrigin": "bottom-left PDF user space",
        "xSource": "textMatrix[4]",
        "ySource": "textMatrix[5]",
        "semanticTopYFormula": "mediaBox.height - textMatrix[5] - fontSize",
    },
    "displayTransform": {
        "normalizedX": "sourceBBox.x / mediaBox.width",
        "normalizedY": "sourceBBox.y / mediaBox.height",
        "leftCssPx": "normalizedBBox.x * viewport.width",
        "topCssPx": "normalizedBBox.y * viewport.height",
        "widthCssPx": "normalizedBBox.width * viewport.width",
        "heightCssPx": "normalizedBBox.height * viewport.height",
    },
    "sampleSemanticWords": page["semanticWords"],
    "rawRuns": page["rawTextRuns"],
}

extraction_path.write_text(json.dumps(diagnostics, indent=2), encoding="utf-8")
transform_path.write_text(json.dumps(transform_trace, indent=2), encoding="utf-8")
'@

$tempScript = Join-Path $artifactDir "capture_wave0.py"
Set-Content -Path $tempScript -Value $captureScript -Encoding UTF8
try {
  & $python $tempScript `
    (Join-Path $fixtureDir "synthetic-run-geometry.pdf") `
    (Join-Path $artifactDir "current-page-extraction.json") `
    (Join-Path $artifactDir "current-transform-trace.json")
}
finally {
  Remove-Item -Force $tempScript -ErrorAction SilentlyContinue
}

Write-Host "Captured Wave 0 diagnostics:"
Write-Host "  Fixture: $(Join-Path $fixtureDir "synthetic-run-geometry.pdf")"
Write-Host "  Extraction: $(Join-Path $artifactDir "current-page-extraction.json")"
Write-Host "  Transform trace: $(Join-Path $artifactDir "current-transform-trace.json")"
