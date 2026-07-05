param(
    [string]$RootPath = "$HOME\Downloads\PRANA KIDS",
    [int]$WeekNumber,
    [int]$StoryCount = 5,
    [switch]$IncludeStoryManifests
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
    '01_Master Assets',
    '02_Master Templates',
    '03_Weekly Content',
    '04_Social Media Exports',
    '05_App Assets',
    '06_Brand Assets'
)

foreach ($folder in $rootFolders) {
    Ensure-Dir -Path (Join-Path $RootPath $folder)
}

$weekFolderName = 'Week {0:D2}' -f $WeekNumber
$weekPath = Join-Path $RootPath ("03_Weekly Content\{0}" -f $weekFolderName)
Ensure-Dir -Path $weekPath

$storySubfolders = @(
    '01_Master Story',
    '02_Copy',
    '03_References',
    '04_Exports\Instagram Carousel',
    '04_Exports\Story Status',
    '04_Exports\Reel',
    '04_Exports\Printable PDF',
    '04_Exports\Website',
    '05_Asset Picks\Characters',
    '05_Asset Picks\Environments',
    '05_Asset Picks\Props',
    '05_Asset Picks\Wisdom Symbols',
    '06_Working Files',
    '07_Approvals'
)

$platformGuide = @(
    '# Platform Output Guide',
    '',
    'Instagram Carousel: 1080 x 1350, 6 pages',
    'Story / Status: 1080 x 1920, 4 pages',
    'Reel: 1080 x 1920',
    'Printable: A4 Portrait PDF',
    'Website: responsive blog/story format'
)

$manifestTemplate = @(
    '# Story Manifest',
    '',
    'Story Title:',
    'Theme:',
    'Value / Lesson:',
    'Primary Character:',
    'Supporting Characters:',
    '',
    '## Asset Picks',
    '- Characters:',
    '- Environments:',
    '- Props:',
    '- Wisdom Symbols:',
    '',
    '## Scene Layout Plan',
    '- L01 Cover:',
    '- L02 Hero:',
    '- L03 Discovery:',
    '- L04 Problem:',
    '- L05 Dialogue:',
    '- L06 Reflection:',
    '- L07 Action:',
    '- L08 Resolution:',
    '- L09 Wisdom Symbol:',
    '- L10 Activity:',
    '',
    '## Copy Notes',
    '- Carousel caption:',
    '- Story text:',
    '- Reel hook:',
    '- Website summary:'
)

$createdStories = @()

for ($storyIndex = 1; $storyIndex -le $StoryCount; $storyIndex++) {
    $storyFolderName = 'Story {0:D2}' -f $storyIndex
    $storyPath = Join-Path $weekPath $storyFolderName
    Ensure-Dir -Path $storyPath

    foreach ($subfolder in $storySubfolders) {
        Ensure-Dir -Path (Join-Path $storyPath $subfolder)
    }

    Write-TextFile -Path (Join-Path $storyPath 'README.md') -Lines @(
        "# $weekFolderName - $storyFolderName",
        '',
        'Master story first, then export to all required formats.',
        '',
        'Workflow:',
        'Story -> Illustrations -> Carousel -> Story/Status -> Reel -> PDF -> Website'
    )

    Write-TextFile -Path (Join-Path $storyPath '04_Exports\PLATFORM_GUIDE.md') -Lines $platformGuide

    if ($IncludeStoryManifests) {
        Write-TextFile -Path (Join-Path $storyPath '01_Master Story\story_manifest.md') -Lines $manifestTemplate
    }

    $createdStories += [pscustomobject]@{
        Week = $weekFolderName
        Story = $storyFolderName
        Path = $storyPath
    }
}

$summaryPath = Join-Path $weekPath 'week_setup_summary.csv'
$createdStories | Export-Csv -NoTypeInformation -Path $summaryPath

Write-Host "Weekly story starter complete."
Write-Host "Root: $RootPath"
Write-Host "Created: $weekFolderName"
Write-Host "Stories: $StoryCount"
Write-Host "Summary: $summaryPath"
