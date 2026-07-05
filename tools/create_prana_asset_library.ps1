param(
    [string]$DownloadsRoot = "$HOME\Downloads",
    [string]$OutputRoot = "$HOME\Downloads\PRANA_KIDS_ASSET_LIBRARY_CLEAN"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Write-ZipEntries {
    param(
        [string]$ZipPath,
        [string]$DestinationDir,
        [scriptblock]$NameTransform,
        [scriptblock]$EntryFilter
    )

    if (-not (Test-Path -LiteralPath $ZipPath)) {
        return
    }

    Ensure-Dir -Path $DestinationDir
    $zip = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
    try {
        foreach ($entry in $zip.Entries) {
            if ([string]::IsNullOrWhiteSpace($entry.Name)) { continue }
            if ($EntryFilter -and -not (& $EntryFilter $entry.Name)) { continue }

            $targetName = if ($NameTransform) { & $NameTransform $entry.Name } else { $entry.Name }
            if ([string]::IsNullOrWhiteSpace($targetName)) { continue }

            $destPath = Join-Path $DestinationDir $targetName
            $entryStream = $entry.Open()
            try {
                $fileStream = [System.IO.File]::Create($destPath)
                try {
                    $entryStream.CopyTo($fileStream)
                }
                finally {
                    $fileStream.Dispose()
                }
            }
            finally {
                $entryStream.Dispose()
            }
        }
    }
    finally {
        $zip.Dispose()
    }
}

function Normalize-CharacterFileName {
    param([string]$Name)

    $base = [System.IO.Path]::GetFileNameWithoutExtension($Name)
    $ext = [System.IO.Path]::GetExtension($Name)

    if ($base -match '^(CHAR-\d{3})_(.+)$') {
        $id = $matches[1]
        $rest = $matches[2]

        if ($rest -like 'Pose_*') {
            return "$id" + "_" + $rest + $ext
        }

        if ($rest -like 'Expression_*') {
            return "$id" + "_" + $rest + $ext
        }

        return "$id" + "_Expression_" + $rest + $ext
    }

    return $Name
}

Ensure-Dir -Path $OutputRoot

$rootDirs = @(
    '01_Characters\Core',
    '01_Characters\Supporting',
    '02_Environments\Terrain',
    '02_Environments\Trees',
    '02_Environments\Plants',
    '02_Environments\Water',
    '02_Environments\Rocks',
    '02_Environments\EnvironmentProps',
    '02_Environments\SkyWeather',
    '02_Environments\NatureDetails',
    '03_Props\Nature',
    '03_Props\Food',
    '03_Props\Adventure',
    '03_Props\Learning',
    '03_Props\Helping',
    '03_Props\Seasonal',
    '04_Wisdom_Symbols\Bhagavad_Gita',
    '04_Wisdom_Symbols\Ganesha',
    '04_Wisdom_Symbols\Hanuman',
    '04_Wisdom_Symbols\Ancient_Wisdom',
    '04_Wisdom_Symbols\World_Wisdom',
    '04_Wisdom_Symbols\General',
    '05_UI_Elements',
    '06_Scene_Layouts',
    '07_Templates',
    '08_Brand_Assets',
    '90_Inbox',
    '99_Reference_Docs'
)

foreach ($dir in $rootDirs) {
    Ensure-Dir -Path (Join-Path $OutputRoot $dir)
}

$coreCharacters = @(
    @{ Id='CHAR-001'; Name='Arin_Rabbit' },
    @{ Id='CHAR-002'; Name='Bodhi_Elephant' },
    @{ Id='CHAR-003'; Name='Tara_Turtle' },
    @{ Id='CHAR-004'; Name='Chinu_Squirrel' },
    @{ Id='CHAR-005'; Name='Kavi_Monkey' },
    @{ Id='CHAR-006'; Name='Mira_Deer' },
    @{ Id='CHAR-007'; Name='Nayan_Fox' },
    @{ Id='CHAR-008'; Name='Ved_Owl' },
    @{ Id='CHAR-009'; Name='Veer_Bear' },
    @{ Id='CHAR-010'; Name='Anu_Mouse' },
    @{ Id='CHAR-011'; Name='Mayur_Peacock' },
    @{ Id='CHAR-012'; Name='Vani_Parrot' },
    @{ Id='CHAR-013'; Name='Mitra_Dog' },
    @{ Id='CHAR-014'; Name='Gauri_Cow' },
    @{ Id='CHAR-015'; Name='Simha_Lion' }
)

foreach ($char in $coreCharacters) {
    $baseDir = Join-Path $OutputRoot ("01_Characters\Core\{0}_{1}" -f $char.Id, $char.Name)
    $exprDir = Join-Path $baseDir 'Expressions'
    $poseDir = Join-Path $baseDir 'Poses'
    Ensure-Dir -Path $exprDir
    Ensure-Dir -Path $poseDir

    $exprZip = Join-Path $DownloadsRoot ("{0}_Expressions.zip" -f $char.Id)
    $poseZip = Join-Path $DownloadsRoot ("{0}_Poses.zip" -f $char.Id)

    Write-ZipEntries -ZipPath $exprZip -DestinationDir $exprDir -NameTransform ${function:Normalize-CharacterFileName}
    Write-ZipEntries -ZipPath $poseZip -DestinationDir $poseDir -NameTransform ${function:Normalize-CharacterFileName}
}

$supportingDir = Join-Path $OutputRoot '01_Characters\Supporting'
$supportingZip = Join-Path $DownloadsRoot 'PranaKids_Characters_Batch_2.zip'
Write-ZipEntries -ZipPath $supportingZip -DestinationDir $supportingDir -EntryFilter {
    param($entryName)
    $entryName -notmatch '^SUP-016_Parrot_'
}

$environmentMap = @(
    @{ Zip='PranaKids_Terrain_Assets.zip'; Dest='02_Environments\Terrain' },
    @{ Zip='PranaKids_Terrain_Assets_v2.zip'; Dest='02_Environments\Terrain' },
    @{ Zip='PranaKids_Tree_Assets.zip'; Dest='02_Environments\Trees' },
    @{ Zip='PranaKids_Plant_Assets.zip'; Dest='02_Environments\Plants' },
    @{ Zip='PranaKids_Water_Assets.zip'; Dest='02_Environments\Water' },
    @{ Zip='PranaKids_Rocks_Wood_Assets.zip'; Dest='02_Environments\Rocks'; Filter={ param($n) $n -like 'ROC-*' } },
    @{ Zip='PranaKids_Rocks_Wood_Assets.zip'; Dest='02_Environments\EnvironmentProps'; Filter={ param($n) $n -like 'PRP-*' } },
    @{ Zip='PranaKids_Sky_Assets.zip'; Dest='02_Environments\SkyWeather' },
    @{ Zip='PranaKids_Nature_Details_Assets.zip'; Dest='02_Environments\NatureDetails' }
)

foreach ($item in $environmentMap) {
    $zipPath = Join-Path $DownloadsRoot $item.Zip
    $dest = Join-Path $OutputRoot $item.Dest
    $entryFilter = if ($item.ContainsKey('Filter')) { $item.Filter } else { $null }
    Write-ZipEntries -ZipPath $zipPath -DestinationDir $dest -EntryFilter $entryFilter
}

$propMap = @(
    @{ Zip='PranaKids_Props_Batch.zip'; Prefix='NPR-'; Dest='03_Props\Nature' },
    @{ Zip='PranaKids_Props_Batch.zip'; Prefix='FOD-'; Dest='03_Props\Food' },
    @{ Zip='PranaKids_Props_Batch.zip'; Prefix='ADV-'; Dest='03_Props\Adventure' },
    @{ Zip='PranaKids_Props_Batch.zip'; Prefix='LRN-'; Dest='03_Props\Learning' },
    @{ Zip='PranaKids_Props_Batch.zip'; Prefix='HLP-'; Dest='03_Props\Helping' },
    @{ Zip='PranaKids_Props_Batch.zip'; Prefix='SEA-'; Dest='03_Props\Seasonal' }
)

foreach ($item in $propMap) {
    $zipPath = Join-Path $DownloadsRoot $item.Zip
    $dest = Join-Path $OutputRoot $item.Dest
    $prefix = $item.Prefix
    Write-ZipEntries -ZipPath $zipPath -DestinationDir $dest -EntryFilter {
        param($entryName)
        $entryName -like ($prefix + '*')
    }
}

$symbolGroups = @{
    'GIT-SYM-' = 'Bhagavad_Gita'
    'GAN-SYM-' = 'Ganesha'
    'HAN-SYM-' = 'Hanuman'
    'AWS-SYM-' = 'Ancient_Wisdom'
    'WWS-SYM-' = 'World_Wisdom'
    'GEN-SYM-' = 'General'
}

$symbolZip = Join-Path $DownloadsRoot 'PranaKids_Symbols_Batch.zip'
foreach ($prefix in $symbolGroups.Keys) {
    $dest = Join-Path $OutputRoot ("04_Wisdom_Symbols\{0}" -f $symbolGroups[$prefix])
    $symbolPrefix = $prefix
    Write-ZipEntries -ZipPath $symbolZip -DestinationDir $dest -EntryFilter {
        param($entryName)
        $entryName -like ($symbolPrefix + '*')
    }
}

$summary = @()
$summary += [pscustomobject]@{ Section='Core Character Folders'; Count=(Get-ChildItem -LiteralPath (Join-Path $OutputRoot '01_Characters\Core') -Directory).Count }
$summary += [pscustomobject]@{ Section='Supporting Character Files'; Count=(Get-ChildItem -LiteralPath (Join-Path $OutputRoot '01_Characters\Supporting') -File).Count }
$summary += [pscustomobject]@{ Section='Environment Files'; Count=(Get-ChildItem -LiteralPath (Join-Path $OutputRoot '02_Environments') -Recurse -File).Count }
$summary += [pscustomobject]@{ Section='Prop Files'; Count=(Get-ChildItem -LiteralPath (Join-Path $OutputRoot '03_Props') -Recurse -File).Count }
$summary += [pscustomobject]@{ Section='Symbol Files'; Count=(Get-ChildItem -LiteralPath (Join-Path $OutputRoot '04_Wisdom_Symbols') -Recurse -File).Count }

$summaryPath = Join-Path $OutputRoot 'library_build_summary.csv'
$summary | Export-Csv -NoTypeInformation -Path $summaryPath

Write-Host "Created library at $OutputRoot"
Write-Host "Summary written to $summaryPath"
$summary | Format-Table -AutoSize
