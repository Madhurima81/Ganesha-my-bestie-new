param(
  [string]$AssetsRoot = "src",
  [string]$CodeRoot = "src",
  [switch]$Apply,
  [string]$ReportDir = "docs/reports"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$assetsRootPath = (Resolve-Path -LiteralPath $AssetsRoot).Path
$codeRootPath = (Resolve-Path -LiteralPath $CodeRoot).Path
$reportPathRoot = Join-Path (Get-Location) $ReportDir
if (-not (Test-Path -LiteralPath $reportPathRoot)) {
  New-Item -ItemType Directory -Path $reportPathRoot | Out-Null
}

$imageExtensions = @(".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")
$codeExtensions = @(".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".json")

function Is-BackupLikeCodeFile {
  param([System.IO.FileInfo]$File)
  $n = $File.Name
  $d = $File.DirectoryName

  if ($d -match "(?i)[\\/](archive|archives|backup|backups|old|temp|tmp)[\\/]") { return $true }
  if ($n -match "(?i)(^|[ _-])(backup|copy|old|fixed|original|draft|temp|tmp)([ _.-]|$)") { return $true }
  if ($n -match "(?i)(^|[ _-])v\d+([ _.-]|$)") { return $true }
  return $false
}

function Test-ImageReferenceInText {
  param(
    [string]$Text,
    [string]$RelativePathFromRoot,
    [string]$FileName
  )

  $rp = [regex]::Escape($RelativePathFromRoot.Replace("\", "/"))
  $fn = [regex]::Escape($FileName)

  return ($Text -match $rp) -or ($Text -match $fn)
}

$images = Get-ChildItem -Path $assetsRootPath -Recurse -File | Where-Object {
  $imageExtensions -contains $_.Extension.ToLower()
} | Where-Object {
  $_.FullName -notmatch "(?i)[\\/]old-images[\\/]"
}

$codeFiles = Get-ChildItem -Path $codeRootPath -Recurse -File | Where-Object {
  $codeExtensions -contains $_.Extension.ToLower()
}

$codeCache = @()
foreach ($codeFile in $codeFiles) {
  try {
    $text = Get-Content -LiteralPath $codeFile.FullName -Raw -ErrorAction Stop
    $codeCache += [pscustomobject]@{
      Path = $codeFile.FullName
      IsBackupLike = Is-BackupLikeCodeFile -File $codeFile
      Text = $text
    }
  }
  catch {
    Write-Warning "Skipping unreadable file: $($codeFile.FullName)"
  }
}

$records = @()
foreach ($img in $images) {
  $relativePath = $img.FullName.Substring($assetsRootPath.Length).TrimStart('\', '/').Replace("\", "/")
  $usedInAllCode = $false
  $usedInPrimaryCode = $false

  foreach ($code in $codeCache) {
    if (Test-ImageReferenceInText -Text $code.Text -RelativePathFromRoot $relativePath -FileName $img.Name) {
      $usedInAllCode = $true
      if (-not $code.IsBackupLike) {
        $usedInPrimaryCode = $true
        break
      }
    }
  }

  $records += [pscustomobject]@{
    ImagePath = $img.FullName
    RelativePath = $relativePath
    UsedInAllCode = $usedInAllCode
    UsedInPrimaryCode = $usedInPrimaryCode
    CandidateForQuarantine = (-not $usedInPrimaryCode)
  }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $reportPathRoot "image-quarantine-report-$timestamp.csv"
$records | Sort-Object CandidateForQuarantine, RelativePath | Export-Csv -NoTypeInformation -LiteralPath $reportFile

$candidates = $records | Where-Object { $_.CandidateForQuarantine }

Write-Output "AssetsRoot: $assetsRootPath"
Write-Output "CodeRoot: $codeRootPath"
Write-Output "Images scanned: $($records.Count)"
Write-Output "Quarantine candidates (dry run): $($candidates.Count)"
Write-Output "Report: $reportFile"

if (-not $Apply) {
  Write-Output ""
  Write-Output "Sample candidates:"
  $candidates | Select-Object -First 40 -ExpandProperty RelativePath
  return
}

$moved = 0
foreach ($candidate in $candidates) {
  $source = $candidate.ImagePath
  if (-not (Test-Path -LiteralPath $source)) { continue }

  $sourceDir = [System.IO.Path]::GetDirectoryName($source)
  $fileName = [System.IO.Path]::GetFileName($source)
  $targetDir = Join-Path $sourceDir "old-images"
  if (-not (Test-Path -LiteralPath $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir | Out-Null
  }

  $target = Join-Path $targetDir $fileName
  if (Test-Path -LiteralPath $target) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    $ext = [System.IO.Path]::GetExtension($fileName)
    $target = Join-Path $targetDir ($baseName + "-" + (Get-Date -Format "yyyyMMddHHmmss") + $ext)
  }

  Move-Item -LiteralPath $source -Destination $target
  $moved++
}

Write-Output ""
Write-Output "Moved to old-images: $moved"
