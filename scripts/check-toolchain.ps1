$ErrorActionPreference = "Continue"

$cargoBin = Join-Path $env:USERPROFILE ".cargo\bin"
if (Test-Path $cargoBin) {
  $env:Path = "$cargoBin;$env:Path"
}

Write-Host "Node:" (node --version)
Write-Host "npm:" (npm --version)
Write-Host "Python:" (python --version)

if (Get-Command rustc -ErrorAction SilentlyContinue) {
  Write-Host "rustc:" (rustc --version)
} else {
  Write-Host "rustc: missing"
}

if (Get-Command cargo -ErrorAction SilentlyContinue) {
  Write-Host "cargo:" (cargo --version)
} else {
  Write-Host "cargo: missing"
}
