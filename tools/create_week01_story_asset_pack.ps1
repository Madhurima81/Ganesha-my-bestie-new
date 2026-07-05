param(
    [string]$LibraryRoot = "$HOME\Downloads\PRANA_KIDS_ASSET_LIBRARY_CLEAN",
    [string]$OutputRoot = "$HOME\Downloads\PRANA_KIDS_WEEK01_STORY_ASSETS"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Copy-IfExists {
    param(
        [string]$SourcePath,
        [string]$DestinationPath
    )

    if (Test-Path -LiteralPath $SourcePath) {
        $parent = Split-Path -Parent $DestinationPath
        Ensure-Dir -Path $parent
        Copy-Item -LiteralPath $SourcePath -Destination $DestinationPath -Force
        return $true
    }

    return $false
}

function Copy-CharacterFolder {
    param(
        [string]$CharacterFolderName,
        [string]$DestinationDir
    )

    $source = Join-Path $LibraryRoot ("01_Characters\Core\{0}" -f $CharacterFolderName)
    if (Test-Path -LiteralPath $source) {
        Ensure-Dir -Path $DestinationDir
        Copy-Item -LiteralPath $source -Destination (Join-Path $DestinationDir $CharacterFolderName) -Recurse -Force
        return $true
    }

    return $false
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

function To-BulletLines {
    param([string[]]$Items)

    if (-not $Items -or $Items.Count -eq 0) {
        return @('- None')
    }

    return @($Items | ForEach-Object { "- $_" })
}

$weekDir = Join-Path $OutputRoot 'Week 01'
Ensure-Dir -Path $weekDir

$stories = @(
    @{
        Id = 'ST-W01-01'
        StoryFolder = 'Story 01'
        Title = "Arin Rabbit's Wobbly Feet"
        Characters = @('CHAR-001_Arin_Rabbit', 'CHAR-008_Ved_Owl')
        Environment = @(
            '02_Environments\Terrain\TER-003_Meadow.png',
            '02_Environments\Terrain\TER-006_RiverBank.png',
            '02_Environments\Water\WAT-001_Stream.png',
            '02_Environments\Water\WAT-004_SteppingStones.png',
            '02_Environments\Plants\PLT-003_Wildflowers.png',
            '02_Environments\Plants\PLT-005_GrassTufts.png',
            '02_Environments\SkyWeather\SKY-001_BlueSky.png'
        )
        Props = @(
            '03_Props\Nature\NPR-010_Smooth_Stone.png'
        )
        Notes = @(
            'Story focus: Arin notices nervous feelings before crossing the stream.',
            'Best-fit visual set: meadow, river bank, stream, stepping stones, grass, wildflowers, blue sky.',
            'Symbol note: mirror concept is mentioned in the content pack but no locked mirror asset exists in the current symbol library.'
        )
    },
    @{
        Id = 'ST-W01-02'
        StoryFolder = 'Story 02'
        Title = "Kavi Monkey's Busy Mind"
        Characters = @('CHAR-005_Kavi_Monkey', 'CHAR-008_Ved_Owl')
        Environment = @(
            '02_Environments\Terrain\TER-008_Clearing.png',
            '02_Environments\Terrain\TER-002_ForestFloor.png',
            '02_Environments\Trees\TRE-003_MangoTree.png',
            '02_Environments\Plants\PLT-005_GrassTufts.png',
            '02_Environments\SkyWeather\SKY-001_BlueSky.png'
        )
        Props = @(
            '03_Props\Adventure\ADV-001_Basket.png',
            '03_Props\Food\FOD-002_Mango.png'
        )
        Notes = @(
            'Story focus: Kavi slows down while gathering mangoes.',
            'Best-fit visual set: clearing/forest floor with mango tree, basket, and mango prop.',
            'Symbol note: no locked Week 01 mirror asset available yet.'
        )
    },
    @{
        Id = 'ST-W01-03'
        StoryFolder = 'Story 03'
        Title = "Anu Mouse's Tiny Voice"
        Characters = @('CHAR-010_Anu_Mouse', 'CHAR-008_Ved_Owl')
        Environment = @(
            '02_Environments\Terrain\TER-005_DirtPath.png',
            '02_Environments\Terrain\TER-008_Clearing.png',
            '02_Environments\Plants\PLT-003_Wildflowers.png',
            '02_Environments\Plants\PLT-005_GrassTufts.png',
            '02_Environments\SkyWeather\SKY-001_BlueSky.png'
        )
        Props = @(
            '03_Props\Helping\HLP-008_Picnic_Basket.png'
        )
        Notes = @(
            'Story focus: Anu shares a shy idea during a forest picnic.',
            'Best-fit visual set: dirt path/clearing, picnic basket, soft outdoor details.',
            'Symbol note: no locked Week 01 mirror asset available yet.'
        )
    },
    @{
        Id = 'ST-W01-04'
        StoryFolder = 'Story 04'
        Title = "Chinu Squirrel's Missing Acorn"
        Characters = @('CHAR-004_Chinu_Squirrel', 'CHAR-008_Ved_Owl')
        Environment = @(
            '02_Environments\Terrain\TER-002_ForestFloor.png',
            '02_Environments\Trees\TRE-001_OakTree.png',
            '02_Environments\Plants\PLT-012_FallenLeaves.png',
            '02_Environments\Plants\PLT-005_GrassTufts.png',
            '02_Environments\SkyWeather\SKY-001_BlueSky.png'
        )
        Props = @(
            '03_Props\Nature\NPR-005_Acorn.png'
        )
        Notes = @(
            'Story focus: Chinu notices frustration before solving the missing-acorn problem.',
            'Best-fit visual set: forest floor, oak tree, fallen leaves, acorn prop.',
            'Symbol note: no locked Week 01 mirror asset available yet.'
        )
    },
    @{
        Id = 'ST-W01-05'
        StoryFolder = 'Story 05'
        Title = "Vani Parrot's Quiet Song"
        Characters = @('CHAR-012_Vani_Parrot', 'CHAR-008_Ved_Owl')
        Environment = @(
            '02_Environments\Trees\TRE-005_FloweringTree.png',
            '02_Environments\EnvironmentProps\PRP-001_Branch.png',
            '02_Environments\Plants\PLT-003_Wildflowers.png',
            '02_Environments\SkyWeather\SKY-001_BlueSky.png'
        )
        Props = @()
        Notes = @(
            'Story focus: Vani notices sadness and slowly rejoins the morning song.',
            'Best-fit visual set: flowering tree, branch perch, bright open sky.',
            'Symbol note: no locked Week 01 mirror asset available yet.'
        )
    }
)

$summary = @()

foreach ($story in $stories) {
    $storyDir = Join-Path $weekDir $story.StoryFolder
    $assetsDir = Join-Path $storyDir 'assets'
    Ensure-Dir -Path $assetsDir

    $copiedCharacters = @()
    foreach ($character in $story.Characters) {
        if (Copy-CharacterFolder -CharacterFolderName $character -DestinationDir $assetsDir) {
            $copiedCharacters += $character
        }
    }

    $copiedEnvironment = @()
    foreach ($relativePath in $story.Environment) {
        $source = Join-Path $LibraryRoot $relativePath
        $destination = Join-Path $assetsDir ([System.IO.Path]::GetFileName($relativePath))
        if (Copy-IfExists -SourcePath $source -DestinationPath $destination) {
            $copiedEnvironment += [System.IO.Path]::GetFileName($relativePath)
        }
    }

    $copiedProps = @()
    foreach ($relativePath in $story.Props) {
        $source = Join-Path $LibraryRoot $relativePath
        $destination = Join-Path $assetsDir ([System.IO.Path]::GetFileName($relativePath))
        if (Copy-IfExists -SourcePath $source -DestinationPath $destination) {
            $copiedProps += [System.IO.Path]::GetFileName($relativePath)
        }
    }

    Write-TextFile -Path (Join-Path $assetsDir 'PENDING_SYMBOL_SELECTION.txt') -Lines @(
        'Week 01 content pack references a mirror concept, but no locked mirror symbol asset exists in the current approved symbol library.',
        'Assign the final approved symbol ID before design/dev production.'
    )

    $assetNoteLines = @(
        "# $($story.Id) - $($story.Title)",
        '',
        '## Selected Characters'
    ) + (To-BulletLines -Items $copiedCharacters) + @(
        '',
        '## Selected Environments'
    ) + (To-BulletLines -Items $copiedEnvironment) + @(
        '',
        '## Selected Props'
    ) + ($(if ($copiedProps.Count -gt 0) { To-BulletLines -Items $copiedProps } else { @('- None copied for this story.') })) + @(
        '',
        '## Notes'
    ) + (To-BulletLines -Items $story.Notes)

    Write-TextFile -Path (Join-Path $storyDir 'asset_selection.md') -Lines $assetNoteLines

    $summary += [pscustomobject]@{
        StoryID = $story.Id
        StoryFolder = $story.StoryFolder
        Characters = ($copiedCharacters -join '; ')
        EnvironmentFiles = $copiedEnvironment.Count
        PropFiles = $copiedProps.Count
    }
}

$summaryPath = Join-Path $weekDir 'week01_asset_pack_summary.csv'
$summary | Export-Csv -NoTypeInformation -Path $summaryPath

Write-Host "Week 01 story asset pack created at $weekDir"
Write-Host "Summary written to $summaryPath"
