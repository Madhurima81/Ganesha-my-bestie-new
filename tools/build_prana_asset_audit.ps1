param(
    [string]$LibraryRoot = "$HOME\Downloads\PRANA_KIDS_ASSET_LIBRARY",
    [string]$OutputRoot = "$PWD\asset-audit"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-ExpectedAsset {
    param(
        [string]$Category,
        [string]$Id,
        [string]$Label,
        [string]$ExpectedFile
    )

    [pscustomobject]@{
        Category = $Category
        Id = $Id
        Label = $Label
        ExpectedFile = $ExpectedFile
    }
}

function Get-NormalizedName {
    param([string]$Name)

    return ($Name.ToLowerInvariant() -replace '[^a-z0-9]', '')
}

function Get-RecentBatchFiles {
    param([string]$Root)

    $targets = @(
        (Join-Path $Root '01_Characters\PranaKids Custom\PranaKids_Characters_Batch'),
        (Join-Path $Root '01_Characters\PranaKids Custom\PranaKids_Characters_Batch_1'),
        (Join-Path $Root '02_Environments\PranaKids Custom\PranaKids_Terrain_Assets'),
        (Join-Path $Root '02_Environments\PranaKids Custom\PranaKids_Terrain_Assets_v2'),
        (Join-Path $Root '02_Environments\PranaKids Custom\PranaKids_Tree_Assets'),
        (Join-Path $Root '03_Props\PranaKids Custom\PranaKids_Nature_Props'),
        (Join-Path $Root '03_Props\PranaKids Custom\PranaKids_Nature_Props_Tight'),
        (Join-Path $Root '03_Props\PranaKids Custom\PranaKids_Props_Batch'),
        (Join-Path $Root '03_Props\PranaKids Custom\PranaKids_Props_Batch_1'),
        (Join-Path $Root '04_Wisdom Symbols\PranaKids Custom\PranaKids_Symbols_Batch')
    ) | Where-Object { Test-Path -LiteralPath $_ }

    Get-ChildItem -LiteralPath $targets -Recurse -File | ForEach-Object {
        [pscustomobject]@{
            Name = $_.Name
            BaseName = $_.BaseName
            FullName = $_.FullName
            NormalizedName = Get-NormalizedName -Name $_.Name
            NormalizedBase = Get-NormalizedName -Name $_.BaseName
        }
    }
}

$expected = New-Object System.Collections.Generic.List[object]

$coreCharacters = @(
    @{ Id = 'CHAR-001'; Label = 'Arin_Rabbit' },
    @{ Id = 'CHAR-002'; Label = 'Bodhi_Elephant' },
    @{ Id = 'CHAR-003'; Label = 'Tara_Turtle' },
    @{ Id = 'CHAR-004'; Label = 'Chinu_Squirrel' },
    @{ Id = 'CHAR-005'; Label = 'Kavi_Monkey' },
    @{ Id = 'CHAR-006'; Label = 'Mira_Deer' },
    @{ Id = 'CHAR-007'; Label = 'Nayan_Fox' },
    @{ Id = 'CHAR-008'; Label = 'Ved_Owl' },
    @{ Id = 'CHAR-009'; Label = 'Veer_Bear' },
    @{ Id = 'CHAR-010'; Label = 'Anu_Mouse' },
    @{ Id = 'CHAR-011'; Label = 'Mayur_Peacock' },
    @{ Id = 'CHAR-012'; Label = 'Vani_Parrot' },
    @{ Id = 'CHAR-013'; Label = 'Mitra_Dog' },
    @{ Id = 'CHAR-014'; Label = 'Gauri_Cow' },
    @{ Id = 'CHAR-015'; Label = 'Simha_Lion' }
)

foreach ($character in $coreCharacters) {
    $expected.Add((New-ExpectedAsset -Category 'Character' -Id $character.Id -Label $character.Label -ExpectedFile "$($character.Id)_")) | Out-Null
}

$environmentAssets = @(
    @{ Id='TER-001'; Label='GrassPatch' }, @{ Id='TER-002'; Label='ForestFloor' }, @{ Id='TER-003'; Label='Meadow' }, @{ Id='TER-004'; Label='Hill' },
    @{ Id='TER-005'; Label='DirtPath' }, @{ Id='TER-006'; Label='RiverBank' }, @{ Id='TER-007'; Label='PondEdge' }, @{ Id='TER-008'; Label='Clearing' },
    @{ Id='TRE-001'; Label='OakTree' }, @{ Id='TRE-002'; Label='BanyanTree' }, @{ Id='TRE-003'; Label='MangoTree' }, @{ Id='TRE-004'; Label='PineTree' },
    @{ Id='TRE-005'; Label='FloweringTree' }, @{ Id='TRE-006'; Label='HollowTree' }, @{ Id='TRE-007'; Label='TreeStump' }, @{ Id='TRE-008'; Label='FallenLog' },
    @{ Id='PLT-001'; Label='Bush' }, @{ Id='PLT-002'; Label='Fern' }, @{ Id='PLT-003'; Label='Wildflowers' }, @{ Id='PLT-004'; Label='FlowerPatch' },
    @{ Id='PLT-005'; Label='GrassTufts' }, @{ Id='PLT-006'; Label='Bamboo' }, @{ Id='PLT-007'; Label='Mushrooms' }, @{ Id='PLT-008'; Label='Reeds' },
    @{ Id='PLT-009'; Label='Vines' }, @{ Id='PLT-010'; Label='BerryBush' }, @{ Id='PLT-011'; Label='LotusLeaves' }, @{ Id='PLT-012'; Label='FallenLeaves' },
    @{ Id='WAT-001'; Label='Stream' }, @{ Id='WAT-002'; Label='Pond' }, @{ Id='WAT-003'; Label='River' }, @{ Id='WAT-004'; Label='SteppingStones' },
    @{ Id='WAT-005'; Label='LilyPads' }, @{ Id='WAT-006'; Label='TinyBridge' },
    @{ Id='ROC-001'; Label='SmallRock' }, @{ Id='ROC-002'; Label='LargeRock' }, @{ Id='ROC-003'; Label='Pebbles' }, @{ Id='ROC-004'; Label='FlatRock' }, @{ Id='ROC-005'; Label='CaveEntrance' },
    @{ Id='PRP-001'; Label='Branch' }, @{ Id='PRP-002'; Label='FallenLog' }, @{ Id='PRP-003'; Label='WoodenSign' }, @{ Id='PRP-004'; Label='Fence' },
    @{ Id='PRP-005'; Label='RopeBridge' }, @{ Id='PRP-006'; Label='LogSeat' }, @{ Id='PRP-007'; Label='WoodenCrate' }, @{ Id='PRP-008'; Label='Barrel' },
    @{ Id='SKY-001'; Label='BlueSky' }, @{ Id='SKY-002'; Label='Clouds' }, @{ Id='SKY-003'; Label='Sunrise' }, @{ Id='SKY-004'; Label='Sunset' },
    @{ Id='SKY-005'; Label='MoonAndStars' }, @{ Id='SKY-006'; Label='LightRain' }, @{ Id='SKY-007'; Label='Rainbow' }, @{ Id='SKY-008'; Label='GentleWind' },
    @{ Id='DET-001'; Label='Butterfly' }, @{ Id='DET-002'; Label='Bee' }, @{ Id='DET-003'; Label='Dragonfly' }, @{ Id='DET-004'; Label='Feather' },
    @{ Id='DET-005'; Label='Acorn' }, @{ Id='DET-006'; Label='Pinecone' }, @{ Id='DET-007'; Label='Seeds' }, @{ Id='DET-008'; Label='FallenFruit' },
    @{ Id='DET-009'; Label='SmallFlowers' }, @{ Id='DET-010'; Label='TinyMushrooms' }
)

foreach ($asset in $environmentAssets) {
    $expected.Add((New-ExpectedAsset -Category 'Environment' -Id $asset.Id -Label $asset.Label -ExpectedFile "$($asset.Id)_$($asset.Label).png")) | Out-Null
}

$propAssets = @(
    'NPR-001_Stick','NPR-002_Leaf','NPR-003_Feather','NPR-004_Nest','NPR-005_Acorn','NPR-006_Pinecone','NPR-007_Flower','NPR-008_Twig','NPR-009_Seed','NPR-010_Smooth_Stone',
    'FOD-001_Apple','FOD-002_Mango','FOD-003_Banana','FOD-004_Carrot','FOD-005_Modak','FOD-006_Honey_Pot','FOD-007_Berry_Basket','FOD-008_Nuts','FOD-009_Watermelon_Slice','FOD-010_Water_Pot',
    'ADV-001_Basket','ADV-002_Rope','ADV-003_Bucket','ADV-004_Paper_Boat','ADV-005_Lantern','ADV-006_Magnifying_Glass','ADV-007_Small_Flag','ADV-008_Map','ADV-009_Walking_Stick','ADV-010_Backpack',
    'LRN-001_Book','LRN-002_Scroll','LRN-003_Pencil','LRN-004_Paintbrush','LRN-005_Drawing_Paper','LRN-006_Chalk','LRN-007_Blackboard','LRN-008_Music_Drum','LRN-009_Flute','LRN-010_Bell',
    'HLP-001_Watering_Can','HLP-002_Broom','HLP-003_Wooden_Cart','HLP-004_Clay_Pot','HLP-005_Blanket','HLP-006_First_Aid_Pouch','HLP-007_Toy_Box','HLP-008_Picnic_Basket','HLP-009_Plant_Pot','HLP-010_Lantern_Pole',
    'SEA-001_Kite','SEA-002_Umbrella','SEA-003_Garland','SEA-004_Lamp_Diya','SEA-005_Gift_Box','SEA-006_Flower_Basket','SEA-007_Rangoli_Tray','SEA-008_Small_Drum','SEA-009_Decorative_Bell','SEA-010_Festival_Banner'
)

foreach ($asset in $propAssets) {
    $parts = $asset.Split('_', 2)
    $expected.Add((New-ExpectedAsset -Category 'Prop' -Id $parts[0] -Label $parts[1] -ExpectedFile "$asset.png")) | Out-Null
}

$symbolAssets = @(
    'GIT-SYM-001_Peacock_Feather','GIT-SYM-002_Flute','GIT-SYM-003_Conch_Shankha','GIT-SYM-004_Chariot','GIT-SYM-005_Sudarshana_Chakra','GIT-SYM-006_Lotus','GIT-SYM-007_Cow','GIT-SYM-008_Sun','GIT-SYM-009_Banyan_Tree','GIT-SYM-010_Bow','GIT-SYM-011_Kurukshetra_Battlefield','GIT-SYM-012_Divine_Light',
    'GAN-SYM-001_Modak','GAN-SYM-002_Mouse_Mushika','GAN-SYM-003_Broken_Tusk','GAN-SYM-004_Lotus','GAN-SYM-005_Axe_Parashu','GAN-SYM-006_Noose_Pasha','GAN-SYM-007_Rope','GAN-SYM-008_Blessing_Hand','GAN-SYM-009_Large_Ears','GAN-SYM-010_Trunk','GAN-SYM-011_Big_Belly','GAN-SYM-012_Om',
    'HAN-SYM-001_Mountain_Sanjeevani','HAN-SYM-002_Gada_Mace','HAN-SYM-003_Flag','HAN-SYM-004_Ring','HAN-SYM-005_Tail','HAN-SYM-006_Open_Heart','HAN-SYM-007_Sun','HAN-SYM-008_Lotus','HAN-SYM-009_Leap_Across_Ocean','HAN-SYM-010_Folded_Hands',
    'AWS-SYM-001_Banyan_Tree','AWS-SYM-002_Lamp_Diya','AWS-SYM-003_River','AWS-SYM-004_Seed','AWS-SYM-005_Mountain','AWS-SYM-006_Fire','AWS-SYM-007_Wind','AWS-SYM-008_Moon','AWS-SYM-009_Clay_Pot','AWS-SYM-010_Open_Hands','AWS-SYM-011_Sunrise','AWS-SYM-012_Path',
    'WWS-SYM-001_Bamboo','WWS-SYM-002_Oak_Tree','WWS-SYM-003_Moon','WWS-SYM-004_Stone','WWS-SYM-005_Water','WWS-SYM-006_Bridge','WWS-SYM-007_Lantern','WWS-SYM-008_Feather','WWS-SYM-009_Empty_Bowl','WWS-SYM-010_Compass','WWS-SYM-011_Rainbow','WWS-SYM-012_Star',
    'GEN-SYM-001_Bell','GEN-SYM-002_Scroll','GEN-SYM-003_Wheel','GEN-SYM-004_Heart','GEN-SYM-005_Helping_Hands','GEN-SYM-006_Leaf'
)

foreach ($asset in $symbolAssets) {
    $parts = $asset.Split('_', 2)
    $expected.Add((New-ExpectedAsset -Category 'Symbol' -Id $parts[0] -Label $parts[1] -ExpectedFile "$asset.png")) | Out-Null
}

$files = @(Get-RecentBatchFiles -Root $LibraryRoot)
$audit = foreach ($item in $expected) {
    $normalizedExpected = Get-NormalizedName -Name $item.ExpectedFile
    $normalizedId = Get-NormalizedName -Name $item.Id
    $labelVariants = @(
        (Get-NormalizedName -Name $item.Label),
        (Get-NormalizedName -Name ($item.Label -replace '_', '')),
        (Get-NormalizedName -Name ($item.Label -replace '_', ' '))
    ) | Select-Object -Unique

    $matches = @($files | Where-Object {
        $_.NormalizedName -eq $normalizedExpected -or
        $_.NormalizedBase -eq $normalizedExpected -or
        (
            $_.NormalizedName -match [regex]::Escape($normalizedId) -and
            ($labelVariants | Where-Object { $_ -and $_.Length -gt 0 -and $_.Length -ge 3 -and $_ -ne $normalizedId -and $_ -in @($_.NormalizedName, $_.NormalizedBase) }) 
        )
    })

    if ($item.Category -eq 'Character' -and $matches.Count -eq 0) {
        $matches = @($files | Where-Object { $_.NormalizedName -match [regex]::Escape($normalizedId) -or $_.NormalizedBase -match [regex]::Escape($normalizedId) })
    }

    [pscustomobject]@{
        Category = $item.Category
        Id = $item.Id
        Label = $item.Label
        ExpectedFile = $item.ExpectedFile
        Status = if ($matches.Count -gt 0) { 'Found' } else { 'Missing' }
        MatchCount = $matches.Count
        Matches = ($matches | Select-Object -ExpandProperty Name -Unique) -join '; '
    }
}

if (-not (Test-Path -LiteralPath $OutputRoot)) {
    New-Item -ItemType Directory -Path $OutputRoot | Out-Null
}

$csvPath = Join-Path $OutputRoot 'prana_asset_audit.csv'
$mdPath = Join-Path $OutputRoot 'prana_asset_audit_summary.md'

$audit | Export-Csv -NoTypeInformation -Path $csvPath

$summary = New-Object System.Collections.Generic.List[string]
$summary.Add('# Prana Asset Audit') | Out-Null
$summary.Add('') | Out-Null

foreach ($category in 'Character', 'Environment', 'Prop', 'Symbol') {
    $group = @($audit | Where-Object { $_.Category -eq $category })
    $found = @($group | Where-Object { $_.Status -eq 'Found' }).Count
    $missing = @($group | Where-Object { $_.Status -eq 'Missing' }).Count
    $summary.Add("## $category") | Out-Null
    $summary.Add("- Found: $found") | Out-Null
    $summary.Add("- Missing: $missing") | Out-Null
    if ($missing -gt 0) {
        $summary.Add('') | Out-Null
        $summary.Add('Missing IDs:') | Out-Null
        foreach ($row in $group | Where-Object { $_.Status -eq 'Missing' }) {
            $summary.Add("- $($row.Id) $($row.Label)") | Out-Null
        }
    }
    $summary.Add('') | Out-Null
}

$summary | Set-Content -LiteralPath $mdPath

Write-Host "Audit CSV: $csvPath"
Write-Host "Audit Summary: $mdPath"
$audit | Group-Object Category, Status | Sort-Object Name | Select-Object Name, Count | Format-Table -AutoSize
