$ErrorActionPreference = "Continue"

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
