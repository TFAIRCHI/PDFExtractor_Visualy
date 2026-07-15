$ErrorActionPreference = "Stop"

function Find-Uv {
  $command = Get-Command uv -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $wingetUv = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages\astral-sh.uv_Microsoft.Winget.Source_8wekyb3d8bbwe\uv.exe"
  if (Test-Path $wingetUv) {
    return $wingetUv
  }

  throw "uv is not installed. Install it with: winget install --id astral-sh.uv -e"
}

$uv = Find-Uv
if (-not (Test-Path ".venv")) {
  & $uv venv .venv --python 3.11
}
& $uv pip install -e "services/extraction[dev]"
& $uv lock --project services/extraction
