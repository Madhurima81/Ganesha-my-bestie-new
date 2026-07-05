param(
    [string]$DownloadsRoot = "$HOME\Downloads",
    [string]$LibraryRoot = "$HOME\Downloads\PRANA_KIDS_ASSET_LIBRARY_CLEAN"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Add-OriginalSourceImage {
    param(
        [string]$SourceName,
        [string]$DestinationDir,
        [string]$DestinationName
    )

    $sourcePath = Join-Path $DownloadsRoot $SourceName
    $destPath = Join-Path $DestinationDir $DestinationName

    if (-not (Test-Path -LiteralPath $sourcePath)) {
        return [pscustomobject]@{
            Source = $SourceName
            Destination = $destPath
            Status = 'Missing source'
        }
    }

    Ensure-Dir -Path $DestinationDir
    Copy-Item -LiteralPath $sourcePath -Destination $destPath -Force

    return [pscustomobject]@{
        Source = $SourceName
        Destination = $destPath
        Status = 'Copied'
    }
}

$copies = @(
    @{ Source='ChatGPT Image Jun 29, 2026, 07_11_51 PM.png'; Dest='01_Characters\Core\CHAR-001_Arin_Rabbit\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_11_55 PM.png'; Dest='01_Characters\Core\CHAR-001_Arin_Rabbit\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_11_38 PM.png'; Dest='01_Characters\Core\CHAR-002_Bodhi_Elephant\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_11_47 PM.png'; Dest='01_Characters\Core\CHAR-002_Bodhi_Elephant\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_25_19 PM.png'; Dest='01_Characters\Core\CHAR-003_Tara_Turtle\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_25_24 PM.png'; Dest='01_Characters\Core\CHAR-003_Tara_Turtle\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_26_24 PM.png'; Dest='01_Characters\Core\CHAR-004_Chinu_Squirrel\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_26_28 PM.png'; Dest='01_Characters\Core\CHAR-004_Chinu_Squirrel\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_26_32 PM.png'; Dest='01_Characters\Core\CHAR-005_Kavi_Monkey\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_26_36 PM.png'; Dest='01_Characters\Core\CHAR-005_Kavi_Monkey\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_29_45 PM.png'; Dest='01_Characters\Core\CHAR-006_Mira_Deer\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_29_51 PM.png'; Dest='01_Characters\Core\CHAR-006_Mira_Deer\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_26_14 PM.png'; Dest='01_Characters\Core\CHAR-007_Nayan_Fox\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_26_19 PM.png'; Dest='01_Characters\Core\CHAR-007_Nayan_Fox\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_30_00 PM.png'; Dest='01_Characters\Core\CHAR-008_Ved_Owl\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_30_06 PM.png'; Dest='01_Characters\Core\CHAR-008_Ved_Owl\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_30_10 PM.png'; Dest='01_Characters\Core\CHAR-009_Veer_Bear\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_49_30 PM.png'; Dest='01_Characters\Core\CHAR-009_Veer_Bear\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_32_22 PM.png'; Dest='01_Characters\Core\CHAR-010_Anu_Mouse\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_32_30 PM.png'; Dest='01_Characters\Core\CHAR-010_Anu_Mouse\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_56_43 PM.png'; Dest='01_Characters\Core\CHAR-011_Mayur_Peacock\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_38_23 PM.png'; Dest='01_Characters\Core\CHAR-011_Mayur_Peacock\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_38_10 PM.png'; Dest='01_Characters\Core\CHAR-012_Vani_Parrot\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_38_04 PM.png'; Dest='01_Characters\Core\CHAR-012_Vani_Parrot\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_37_56 PM.png'; Dest='01_Characters\Core\CHAR-013_Mitra_Dog\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_37_52 PM.png'; Dest='01_Characters\Core\CHAR-013_Mitra_Dog\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_37_46 PM.png'; Dest='01_Characters\Core\CHAR-014_Gauri_Cow\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_37_41 PM.png'; Dest='01_Characters\Core\CHAR-014_Gauri_Cow\Expressions'; Name='Original_Expression_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_37_29 PM.png'; Dest='01_Characters\Core\CHAR-015_Simha_Lion\Poses'; Name='Original_Pose_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 07_37_33 PM.png'; Dest='01_Characters\Core\CHAR-015_Simha_Lion\Expressions'; Name='Original_Expression_Sheet.png' },

    @{ Source='ChatGPT Image Jun 30, 2026, 05_01_38 PM.png'; Dest='01_Characters\Supporting'; Name='Original_Tier2_Master_Sheet.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_02_02 PM.png'; Dest='01_Characters\Supporting'; Name='Original_Supporting_Group_Sheet.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_14_36 PM (6).png'; Dest='01_Characters\Supporting'; Name='Original_Supporting_Expressions_Sheet_A.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_15_23 PM.png'; Dest='01_Characters\Supporting'; Name='Original_Supporting_Expressions_Sheet_B.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_15_29 PM.png'; Dest='01_Characters\Supporting'; Name='Original_Supporting_Master_Sheet_A.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_15_44 PM.png'; Dest='01_Characters\Supporting'; Name='Original_Supporting_Master_Sheet_B.png' },

    @{ Source='ChatGPT Image Jun 29, 2026, 07_23_15 PM.png'; Dest='02_Environments\Terrain'; Name='Original_Terrain_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 08_02_43 PM.png'; Dest='02_Environments\Trees'; Name='Original_Trees_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 08_03_12 PM.png'; Dest='02_Environments\Plants'; Name='Original_Plants_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 08_00_29 PM.png'; Dest='02_Environments\Water'; Name='Original_Water_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 08_02_46 PM.png'; Dest='02_Environments\Rocks'; Name='Original_Rocks_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 08_02_46 PM.png'; Dest='02_Environments\EnvironmentProps'; Name='Original_Environment_Props_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 08_03_00 PM.png'; Dest='02_Environments\SkyWeather'; Name='Original_Sky_Weather_Sheet.png' },
    @{ Source='ChatGPT Image Jun 29, 2026, 08_02_37 PM.png'; Dest='02_Environments\NatureDetails'; Name='Original_Nature_Details_Sheet.png' },

    @{ Source='ChatGPT Image Jun 30, 2026, 05_14_34 PM (1).png'; Dest='03_Props\Nature'; Name='Original_Nature_Props_Sheet.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_14_34 PM (2).png'; Dest='03_Props\Food'; Name='Original_Food_Props_Sheet.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_14_35 PM (3).png'; Dest='03_Props\Adventure'; Name='Original_Adventure_Props_Sheet.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_14_35 PM (4).png'; Dest='03_Props\Learning'; Name='Original_Learning_Props_Sheet.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_14_36 PM (5).png'; Dest='03_Props\Helping'; Name='Original_Helping_Props_Sheet.png' },

    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_35 PM (1).png'; Dest='04_Wisdom_Symbols\Bhagavad_Gita'; Name='Original_Gita_Symbols_Sheet_A.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_50 PM (1).png'; Dest='04_Wisdom_Symbols\Bhagavad_Gita'; Name='Original_Gita_Symbols_Sheet_B.png' },

    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_36 PM (2).png'; Dest='04_Wisdom_Symbols\Ganesha'; Name='Original_Ganesha_Symbols_Sheet_A.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_51 PM (5).png'; Dest='04_Wisdom_Symbols\Ganesha'; Name='Original_Ganesha_Symbols_Sheet_B.png' },

    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_36 PM (3).png'; Dest='04_Wisdom_Symbols\Hanuman'; Name='Original_Hanuman_Symbols_Sheet_A.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_36 PM (4).png'; Dest='04_Wisdom_Symbols\Hanuman'; Name='Original_Hanuman_Symbols_Sheet_B.png' },

    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_36 PM (4).png'; Dest='04_Wisdom_Symbols\Ancient_Wisdom'; Name='Original_Ancient_Wisdom_Sheet_A.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_50 PM (2).png'; Dest='04_Wisdom_Symbols\Ancient_Wisdom'; Name='Original_Ancient_Wisdom_Sheet_B.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_51 PM (3).png'; Dest='04_Wisdom_Symbols\Ancient_Wisdom'; Name='Original_Ancient_Wisdom_Sheet_C.png' },

    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_36 PM (4).png'; Dest='04_Wisdom_Symbols\World_Wisdom'; Name='Original_World_Wisdom_Sheet_A.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_51 PM (4).png'; Dest='04_Wisdom_Symbols\World_Wisdom'; Name='Original_World_Wisdom_Sheet_B.png' },

    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_51 PM (3).png'; Dest='04_Wisdom_Symbols\General'; Name='Original_General_Symbols_Sheet_A.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_51 PM (4).png'; Dest='04_Wisdom_Symbols\General'; Name='Original_General_Symbols_Sheet_B.png' },
    @{ Source='ChatGPT Image Jun 30, 2026, 05_10_51 PM (5).png'; Dest='04_Wisdom_Symbols\General'; Name='Original_General_Symbols_Sheet_C.png' }
)

$results = foreach ($copy in $copies) {
    Add-OriginalSourceImage `
        -SourceName $copy.Source `
        -DestinationDir (Join-Path $LibraryRoot $copy.Dest) `
        -DestinationName $copy.Name
}

$reportPath = Join-Path $LibraryRoot 'original_source_images_report.csv'
$results | Export-Csv -NoTypeInformation -Path $reportPath

$copiedCount = @($results | Where-Object Status -eq 'Copied').Count
$missingCount = @($results | Where-Object Status -eq 'Missing source').Count

Write-Host "Original source image copy complete."
Write-Host "Copied: $copiedCount"
Write-Host "Missing source files: $missingCount"
Write-Host "Report: $reportPath"
