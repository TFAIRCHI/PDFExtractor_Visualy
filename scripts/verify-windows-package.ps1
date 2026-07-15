$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$packageJson = Get-Content (Join-Path $repoRoot "package.json") -Raw | ConvertFrom-Json
$version = $packageJson.version

$installerPath = Join-Path $repoRoot "installers\dev\PDF Intelligence Setup $version.exe"
$unpackedExePath = Join-Path $repoRoot "installers\dev\win-unpacked\PDF Intelligence.exe"
$sidecarPath = Join-Path $repoRoot "installers\dev\win-unpacked\resources\sidecar\extraction-service.exe"

$requiredArtifacts = @(
  $installerPath,
  $unpackedExePath,
  $sidecarPath
)

foreach ($artifact in $requiredArtifacts) {
  if (-not (Test-Path $artifact)) {
    throw "Missing package artifact: $artifact"
  }

  $item = Get-Item $artifact
  if ($item.Length -le 0) {
    throw "Package artifact is empty: $artifact"
  }
}

$process = [System.Diagnostics.Process]::new()
$process.StartInfo.FileName = $sidecarPath
$process.StartInfo.UseShellExecute = $false
$process.StartInfo.RedirectStandardInput = $true
$process.StartInfo.RedirectStandardOutput = $true
$process.StartInfo.RedirectStandardError = $true
$process.StartInfo.CreateNoWindow = $true

if (-not $process.Start()) {
  throw "Failed to start packaged sidecar: $sidecarPath"
}

try {
  $request = '{"jsonrpc":"2.0","id":1,"method":"health.check"}'
  $process.StandardInput.WriteLine($request)
  $process.StandardInput.Close()

  $responseLine = $process.StandardOutput.ReadLine()
  if (-not $process.WaitForExit(10000)) {
    $process.Kill()
    throw "Packaged sidecar health check timed out."
  }

  if ($process.ExitCode -ne 0) {
    $stderr = $process.StandardError.ReadToEnd()
    throw "Packaged sidecar exited with code $($process.ExitCode): $stderr"
  }

  $response = $responseLine | ConvertFrom-Json
  if ($response.result.ok -ne $true -or $response.result.service -ne "extraction") {
    throw "Unexpected packaged sidecar health response: $responseLine"
  }
}
finally {
  if (-not $process.HasExited) {
    $process.Kill()
  }
}

Write-Host "Verified Windows package artifacts:"
Write-Host "  Installer: $installerPath"
Write-Host "  App executable: $unpackedExePath"
Write-Host "  Sidecar executable: $sidecarPath"
