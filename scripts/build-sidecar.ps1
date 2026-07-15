$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

$python = Join-Path $repoRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
  throw "Missing .venv. Run scripts/setup-python.ps1 first."
}

$outputDir = "dist\sidecar"
$workDir = "build\sidecar"
$sidecarExe = Join-Path $outputDir "extraction-service.exe"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $workDir | Out-Null

$inputs = @(
  "scripts\extraction-service-runner.py",
  "services\extraction\pyproject.toml"
) + (Get-ChildItem -Recurse -File "services\extraction\src" | ForEach-Object { $_.FullName })

if (Test-Path $sidecarExe) {
  $exeTime = (Get-Item $sidecarExe).LastWriteTimeUtc
  $newerInput = $inputs | Where-Object { (Get-Item $_).LastWriteTimeUtc -gt $exeTime } | Select-Object -First 1
  if (-not $newerInput) {
    Write-Host "Sidecar executable is up to date: $sidecarExe"
    exit 0
  }
}

& $python -m PyInstaller `
  --clean `
  --noconfirm `
  --onefile `
  --name extraction-service `
  --paths services/extraction/src `
  --distpath $outputDir `
  --workpath $workDir `
  scripts/extraction-service-runner.py
