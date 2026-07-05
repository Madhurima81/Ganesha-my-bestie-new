param(
    [string]$RootPath = "$HOME\Downloads\PRANA KIDS",
    [int]$WeekNumber,
    [int]$StoryCount = 5
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Write-TextFile {
    param(
        [string]$Path,
        [string[]]$Lines
    )

    $parent = Split-Path -Parent $Path
    Ensure-Dir -Path $parent
    Set-Content -LiteralPath $Path -Value $Lines -Encoding UTF8
}

if ($WeekNumber -lt 1) {
    throw "WeekNumber must be 1 or greater."
}

if ($StoryCount -lt 1) {
    throw "StoryCount must be 1 or greater."
}

$rootFolders = @(
    '01_Master_Assets',
    '02_Master_Templates',
    '03_Weeks',
    '04_Master_Story_Catalog',
    '05_Final_Exports'
)

foreach ($folder in $rootFolders) {
    Ensure-Dir -Path (Join-Path $RootPath $folder)
}

$weekFolderName = 'Week {0:D2}' -f $WeekNumber
$weekPath = Join-Path $RootPath ("03_Weeks\{0}" -f $weekFolderName)
Ensure-Dir -Path $weekPath

Write-TextFile -Path (Join-Path $weekPath 'WEEK_OVERVIEW.md') -Lines @(
    "# $weekFolderName",
    '',
    'Use this file for the weekly theme, story lineup, and approvals summary.',
    '',
    'Theme:',
    'Weekly affirmation:',
    'Weekly challenge:',
    '',
    'Stories:',
    '- Story 01:',
    '- Story 02:',
    '- Story 03:',
    '- Story 04:',
    '- Story 05:'
)

$storyManifest = @(
    '# Story',
    '',
    'Story ID:',
    'Story Title:',
    'Value:',
    'Wisdom Track:',
    '',
    '## Final Story Text',
    '',
    '## Reflection',
    '',
    '## Affirmation',
    '',
    '## Tiny Challenge',
    '',
    '## Parent Note',
    '',
    '## Teacher Note'
)

$illustrationBrief = @(
    '# Illustration Brief',
    '',
    'Story ID:',
    'Main Character ID:',
    'Supporting Character IDs:',
    'Environment IDs:',
    'Prop IDs:',
    'Symbol ID:',
    '',
    '## Page Plan',
    '- Page 1:',
    '- Page 2:',
    '- Page 3:',
    '- Page 4:',
    '- Page 5:',
    '- Page 6:'
)

for ($storyIndex = 1; $storyIndex -le $StoryCount; $storyIndex++) {
    $storyFolderName = 'Story {0:D2}' -f $storyIndex
    $storyPath = Join-Path $weekPath $storyFolderName
    Ensure-Dir -Path $storyPath
    Ensure-Dir -Path (Join-Path $storyPath 'exports')

    Write-TextFile -Path (Join-Path $storyPath 'story.md') -Lines $storyManifest
    Write-TextFile -Path (Join-Path $storyPath 'illustration_brief.md') -Lines $illustrationBrief
}

Write-Host "Simple weekly story starter complete."
Write-Host "Created: $weekPath"
Write-Host "Stories: $StoryCount"
