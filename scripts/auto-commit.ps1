param(
  [int]$PollSeconds = 2,
  [string]$MessagePrefix = "wip(auto)"
)

$ErrorActionPreference = "Stop"

function Test-GitRepo {
  git rev-parse --is-inside-work-tree *> $null
  return $LASTEXITCODE -eq 0
}

if (-not (Test-GitRepo)) {
  Write-Error "Not inside a git repository."
  exit 1
}

Write-Host "Auto-commit running. Poll: $PollSeconds sec. Press Ctrl+C to stop."

while ($true) {
  try {
    git add -A
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
      $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
      $message = "${MessagePrefix}: $timestamp"
      git commit -m $message *> $null
      if ($LASTEXITCODE -eq 0) {
        Write-Host "Committed: $message"
      }
    }
  } catch {
    Write-Warning $_.Exception.Message
  }

  Start-Sleep -Seconds $PollSeconds
}
