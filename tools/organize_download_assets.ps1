param(
    [string]$SourceRoot = "$HOME\Downloads",
    [string]$LibraryRoot = "$HOME\Downloads\PRANA_KIDS_ASSET_LIBRARY",
    [switch]$Execute
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-SafeName {
    param([string]$Name)

    $safe = $Name.Trim()
    $safe = $safe -replace '[\\/:*?"<>|]', "-"
    $safe = $safe -replace '\s+', " "
    return $safe
}

function Get-DestinationCategory {
    param([string]$Name)

    $n = $Name.ToLowerInvariant()

    if ($n -match 'pranakids_symbols_batch') {
        return "04_Wisdom Symbols"
    }

    if ($n -match 'pranakids_tree_assets|pranakids_terrain_assets|pranakids_terrain_assets_v2') {
        return "02_Environments"
    }

    if ($n -match 'pranakids_props_batch|pranakids_props_batch_1|pranakids_nature_props|pranakids_nature_props_tight') {
        return "03_Props"
    }

    if ($n -match 'pranakids_characters_batch') {
        return "01_Characters"
    }

    if ($n -match 'pranakids_characters_batch|character|characters|mythology characters|kid|kids|animals|faces|emotions|feeling|zoo|bird|elephant|rabbit|turtle') {
        return "01_Characters"
    }

    if ($n -match 'terrain|tree|trees|nature|landscape|background|scene|forest|park|pond|underwater|beach|rainforest|arctic|desert|farm|sky|flower field|meadow') {
        return "02_Environments"
    }

    if ($n -match 'prop|props|food|fruit|fruits|bakery|ice-cream|instrument|travel|vehicle|vehicles|art-supplies|modak') {
        return "03_Props"
    }

    if ($n -match 'symbol|symbols|lotus|deity|ganesha magical world icons|icons|feather|flute') {
        return "04_Wisdom Symbols"
    }

    if ($n -match 'speech|bubble|bubbles|border|frame|button|sparkle|footprint|ui') {
        return "05_UI Elements"
    }

    if ($n -match 'layout|cover|hero|dialogue|reflection|resolution|activity') {
        return "06_Scene Layouts"
    }

    if ($n -match 'template|worksheet|carousel|reel|story') {
        return "07_Templates"
    }

    return "98_Unsorted Review"
}

function Get-CollectionName {
    param([string]$Name)

    if ($Name -match '^PranaKids_') {
        return "PranaKids Custom"
    }

    if ($Name -match '^speech_bubbles\d*$' -or $Name -match 'Speech-Bubbles') {
        return "Speech Bubbles"
    }

    if ($Name -match 'ganesha magical world icons') {
        return "Ganesha Icons"
    }

    return "External Packs"
}

$categories = @(
    "01_Characters",
    "02_Environments",
    "03_Props",
    "04_Wisdom Symbols",
    "05_UI Elements",
    "06_Scene Layouts",
    "07_Templates",
    "08_Brand Assets",
    "90_Inbox",
    "98_Unsorted Review",
    "99_Archive_Duplicates"
)

$includePatterns = @(
    "PranaKids_*",
    "*clipart*",
    "*Clipart*",
    "*animals*",
    "*Animals*",
    "*character*",
    "*Character*",
    "*background*",
    "*Background*",
    "*scene*",
    "*Scene*",
    "*symbol*",
    "*Symbol*",
    "*icons*",
    "*Icons*",
    "*speech*",
    "*Speech*",
    "*border*",
    "*Border*",
    "*tree*",
    "*Tree*",
    "*terrain*",
    "*Terrain*",
    "*nature*",
    "*Nature*",
    "*fruit*",
    "*Fruit*",
    "*bakery*",
    "*Bakery*",
    "*modak*",
    "*faces*",
    "*Faces*",
    "*emotions*",
    "*Feeling*",
    "*Underwater*",
    "*Beach*",
    "*Farm*",
    "*Rainforest*",
    "*Arctic*",
    "*Desert*",
    "*Zoo*",
    "*Musical*",
    "*Vehicles*",
    "*Travel-Icons*",
    "*Deity*",
    "*Outer-Space*",
    "*Astronaut*",
    "*India-Clipart*",
    "*ganesha magical world icons*"
)

$excludeRegex = @(
    'claude_files',
    '^app test$',
    '^attachments',
    '^files$',
    '^debugging ',
    '^fixing ',
    '^updated ',
    '^zone nav',
    'voice',
    '\baudio\b',
    '^backup ',
    '^drive-download-',
    '^flip',
    '^fitness ',
    '^book-',
    '^css-only-',
    '^svg-coloring-book',
    '^kids activity book$',
    '^family tree vo - ai studio$'
) -join '|'

if (-not (Test-Path -LiteralPath $SourceRoot)) {
    throw "Source root not found: $SourceRoot"
}

$dirs = Get-ChildItem -LiteralPath $SourceRoot -Directory | Where-Object {
    $name = $_.Name
    @($includePatterns | Where-Object { $name -like $_ }).Count -gt 0 -and
    $name -notmatch $excludeRegex -and
    $name -ne (Split-Path -Leaf $LibraryRoot)
}

$plan = foreach ($dir in $dirs | Sort-Object Name) {
    $category = Get-DestinationCategory -Name $dir.Name
    $collection = Get-CollectionName -Name $dir.Name
    $safeName = Get-SafeName -Name $dir.Name

    [pscustomobject]@{
        Source = $dir.FullName
        Category = $category
        Collection = $collection
        FolderName = $safeName
        Destination = Join-Path $LibraryRoot (Join-Path $category (Join-Path $collection $safeName))
        DuplicateHint = [bool]($dir.Name -match '\(\d+\)$')
    }
}

if (-not $Execute) {
    $plan | Sort-Object Category, Collection, FolderName | Format-Table Category, Collection, FolderName, DuplicateHint -AutoSize
    return
}

foreach ($category in $categories) {
    $target = Join-Path $LibraryRoot $category
    if (-not (Test-Path -LiteralPath $target)) {
        New-Item -ItemType Directory -Path $target | Out-Null
    }
}

$manifest = New-Object System.Collections.Generic.List[object]

foreach ($item in $plan) {
    $targetParent = Split-Path -Parent $item.Destination
    if (-not (Test-Path -LiteralPath $targetParent)) {
        New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
    }

    $finalDestination = $item.Destination
    if (Test-Path -LiteralPath $finalDestination) {
        $archiveParent = Join-Path $LibraryRoot "99_Archive_Duplicates"
        if (-not (Test-Path -LiteralPath $archiveParent)) {
            New-Item -ItemType Directory -Path $archiveParent -Force | Out-Null
        }

        $finalDestination = Join-Path $archiveParent $item.FolderName
        $suffix = 1
        while (Test-Path -LiteralPath $finalDestination) {
            $finalDestination = Join-Path $archiveParent ("{0}__dup{1}" -f $item.FolderName, $suffix)
            $suffix++
        }
    }

    Move-Item -LiteralPath $item.Source -Destination $finalDestination

    $manifest.Add([pscustomobject]@{
        Source = $item.Source
        Destination = $finalDestination
        Category = $item.Category
        Collection = $item.Collection
        MovedOn = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }) | Out-Null
}

$manifestPath = Join-Path $LibraryRoot "asset_manifest.csv"
$manifest | Export-Csv -NoTypeInformation -Path $manifestPath

Write-Host "Organized $($manifest.Count) folders into $LibraryRoot"
Write-Host "Manifest saved to $manifestPath"
