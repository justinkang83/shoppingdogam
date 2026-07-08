$ErrorActionPreference = "SilentlyContinue"

$project = "C:\Users\DESKTOP\Documents\New project"
$nodePath = "C:\Program Files\nodejs"
$node = Join-Path $nodePath "node.exe"
$npm = Join-Path $nodePath "npm.cmd"
$log = Join-Path $project "server-watchdog.log"

$env:PATH = "$nodePath;$env:PATH"
Set-Location -LiteralPath $project

function Write-WatchdogLog($message) {
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -LiteralPath $log -Value "[$stamp] $message"
}

Write-WatchdogLog "watchdog started"

if (-not (Test-Path -LiteralPath (Join-Path $project ".next\BUILD_ID"))) {
  Write-WatchdogLog "build files not found, running build"
  & $npm run build 2>&1 | Add-Content -LiteralPath $log
}

while ($true) {
  $listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

  if (-not $listener) {
    Write-WatchdogLog "port 3000 is down, starting server"
    $process = Start-Process -FilePath $node -ArgumentList @("node_modules\next\dist\bin\next", "start", "-p", "3000") -WorkingDirectory $project -WindowStyle Hidden -PassThru
    Write-WatchdogLog "started server process id $($process.Id)"
    Start-Sleep -Seconds 8
  } else {
    Start-Sleep -Seconds 3
  }
}
