param(
    [string]$SourceDoc = "$HOME\Downloads\Prana_Kids_Production_Bible_v2_With_Weekly_Workflow(1).docx",
    [string]$OutputDoc = "$HOME\Downloads\Prana_Kids_Production_Bible_v2_With_Weekly_Workflow_UPDATED.docx"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-ParagraphText {
    param(
        [System.Xml.XmlNode]$Paragraph,
        [System.Xml.XmlNamespaceManager]$Ns
    )

    (($Paragraph.SelectNodes('.//w:t', $Ns) | ForEach-Object { $_.'#text' }) -join '')
}

function Set-ParagraphText {
    param(
        [System.Xml.XmlNode]$Paragraph,
        [System.Xml.XmlNamespaceManager]$Ns,
        [string]$Text
    )

    $runs = @($Paragraph.SelectNodes('./w:r', $Ns))
    if ($runs.Count -eq 0) {
        $run = $Paragraph.OwnerDocument.CreateElement('w', 'r', $Ns.LookupNamespace('w'))
        $textNode = $Paragraph.OwnerDocument.CreateElement('w', 't', $Ns.LookupNamespace('w'))
        $run.AppendChild($textNode) | Out-Null
        $Paragraph.AppendChild($run) | Out-Null
        $runs = @($run)
    }

    $firstRun = $runs[0]
    $textNodes = @($firstRun.SelectNodes('./w:t', $Ns))
    if ($textNodes.Count -eq 0) {
        $textNode = $Paragraph.OwnerDocument.CreateElement('w', 't', $Ns.LookupNamespace('w'))
        $firstRun.AppendChild($textNode) | Out-Null
        $textNodes = @($textNode)
    }

    $textNodes[0].InnerText = $Text
    foreach ($extraText in @($textNodes | Select-Object -Skip 1)) {
        $extraText.ParentNode.RemoveChild($extraText) | Out-Null
    }

    foreach ($extraRun in @($runs | Select-Object -Skip 1)) {
        $Paragraph.RemoveChild($extraRun) | Out-Null
    }
}

function Replace-ParagraphWithMany {
    param(
        [System.Xml.XmlNode]$OldParagraph,
        [string[]]$NewTexts,
        [System.Xml.XmlNamespaceManager]$Ns
    )

    $parent = $OldParagraph.ParentNode
    $refNode = $OldParagraph

    foreach ($text in $NewTexts) {
        $clone = $OldParagraph.CloneNode($true)
        Set-ParagraphText -Paragraph $clone -Ns $Ns -Text $text
        $parent.InsertBefore($clone, $refNode) | Out-Null
    }

    $parent.RemoveChild($OldParagraph) | Out-Null
}

function Replace-ParagraphRange {
    param(
        [System.Xml.XmlNode[]]$Paragraphs,
        [int]$StartIndex,
        [int]$EndIndex,
        [string[]]$NewTexts,
        [System.Xml.XmlNamespaceManager]$Ns
    )

    $startParagraph = $Paragraphs[$StartIndex]
    $parent = $startParagraph.ParentNode
    $refNode = $startParagraph

    foreach ($text in $NewTexts) {
        $clone = $startParagraph.CloneNode($true)
        Set-ParagraphText -Paragraph $clone -Ns $Ns -Text $text
        $parent.InsertBefore($clone, $refNode) | Out-Null
    }

    for ($i = $StartIndex; $i -le $EndIndex; $i++) {
        $parent.RemoveChild($Paragraphs[$i]) | Out-Null
    }
}

$propParagraphs = @(
    'Nature (10)',
    '• NPR-001 Stick',
    '• NPR-002 Leaf',
    '• NPR-003 Feather',
    '• NPR-004 Nest',
    '• NPR-005 Acorn',
    '• NPR-006 Pinecone',
    '• NPR-007 Flower',
    '• NPR-008 Twig',
    '• NPR-009 Seed',
    '• NPR-010 Smooth Stone',
    'Food (10)',
    '• FOD-001 Apple',
    '• FOD-002 Mango',
    '• FOD-003 Banana',
    '• FOD-004 Carrot',
    '• FOD-005 Modak',
    '• FOD-006 Honey Pot',
    '• FOD-007 Berry Basket',
    '• FOD-008 Nuts',
    '• FOD-009 Watermelon Slice',
    '• FOD-010 Water Pot',
    'Adventure (10)',
    '• ADV-001 Basket',
    '• ADV-002 Rope',
    '• ADV-003 Bucket',
    '• ADV-004 Paper Boat',
    '• ADV-005 Lantern',
    '• ADV-006 Magnifying Glass',
    '• ADV-007 Small Flag',
    '• ADV-008 Map',
    '• ADV-009 Walking Stick',
    '• ADV-010 Backpack',
    'Learning (10)',
    '• LRN-001 Book',
    '• LRN-002 Scroll',
    '• LRN-003 Pencil',
    '• LRN-004 Paintbrush',
    '• LRN-005 Drawing Paper',
    '• LRN-006 Chalk',
    '• LRN-007 Blackboard',
    '• LRN-008 Music Drum',
    '• LRN-009 Flute',
    '• LRN-010 Bell',
    'Helping (10)',
    '• HLP-001 Watering Can',
    '• HLP-002 Broom',
    '• HLP-003 Wooden Cart',
    '• HLP-004 Clay Pot',
    '• HLP-005 Blanket',
    '• HLP-006 First Aid Pouch',
    '• HLP-007 Toy Box',
    '• HLP-008 Picnic Basket',
    '• HLP-009 Plant Pot',
    '• HLP-010 Lantern Pole',
    'Seasonal (10)',
    '• SEA-001 Kite',
    '• SEA-002 Umbrella',
    '• SEA-003 Garland',
    '• SEA-004 Lamp Diya',
    '• SEA-005 Gift Box',
    '• SEA-006 Flower Basket',
    '• SEA-007 Rangoli Tray',
    '• SEA-008 Small Drum',
    '• SEA-009 Decorative Bell',
    '• SEA-010 Festival Banner'
)

$symbolParagraphs = @(
    'Bhagavad Gita (12)',
    '• GIT-SYM-001 Peacock Feather',
    '• GIT-SYM-002 Flute',
    '• GIT-SYM-003 Conch Shankha',
    '• GIT-SYM-004 Chariot',
    '• GIT-SYM-005 Sudarshana Chakra',
    '• GIT-SYM-006 Lotus',
    '• GIT-SYM-007 Cow',
    '• GIT-SYM-008 Sun',
    '• GIT-SYM-009 Banyan Tree',
    '• GIT-SYM-010 Bow',
    '• GIT-SYM-011 Kurukshetra Battlefield',
    '• GIT-SYM-012 Divine Light',
    'Ganesha (12)',
    '• GAN-SYM-001 Modak',
    '• GAN-SYM-002 Mouse Mushika',
    '• GAN-SYM-003 Broken Tusk',
    '• GAN-SYM-004 Lotus',
    '• GAN-SYM-005 Axe Parashu',
    '• GAN-SYM-006 Noose Pasha',
    '• GAN-SYM-007 Rope',
    '• GAN-SYM-008 Blessing Hand',
    '• GAN-SYM-009 Large Ears',
    '• GAN-SYM-010 Trunk',
    '• GAN-SYM-011 Big Belly',
    '• GAN-SYM-012 Om',
    'Hanuman (10)',
    '• HAN-SYM-001 Mountain Sanjeevani',
    '• HAN-SYM-002 Gada Mace',
    '• HAN-SYM-003 Flag',
    '• HAN-SYM-004 Ring',
    '• HAN-SYM-005 Tail',
    '• HAN-SYM-006 Open Heart',
    '• HAN-SYM-007 Sun',
    '• HAN-SYM-008 Lotus',
    '• HAN-SYM-009 Leap Across Ocean',
    '• HAN-SYM-010 Folded Hands',
    'Ancient Wisdom (12)',
    '• AWS-SYM-001 Banyan Tree',
    '• AWS-SYM-002 Lamp Diya',
    '• AWS-SYM-003 River',
    '• AWS-SYM-004 Seed',
    '• AWS-SYM-005 Mountain',
    '• AWS-SYM-006 Fire',
    '• AWS-SYM-007 Wind',
    '• AWS-SYM-008 Moon',
    '• AWS-SYM-009 Clay Pot',
    '• AWS-SYM-010 Open Hands',
    '• AWS-SYM-011 Sunrise',
    '• AWS-SYM-012 Path',
    'World Wisdom (12)',
    '• WWS-SYM-001 Bamboo',
    '• WWS-SYM-002 Oak Tree',
    '• WWS-SYM-003 Moon',
    '• WWS-SYM-004 Stone',
    '• WWS-SYM-005 Water',
    '• WWS-SYM-006 Bridge',
    '• WWS-SYM-007 Lantern',
    '• WWS-SYM-008 Feather',
    '• WWS-SYM-009 Empty Bowl',
    '• WWS-SYM-010 Compass',
    '• WWS-SYM-011 Rainbow',
    '• WWS-SYM-012 Star',
    'General (6)',
    '• GEN-SYM-001 Bell',
    '• GEN-SYM-002 Scroll',
    '• GEN-SYM-003 Wheel',
    '• GEN-SYM-004 Heart',
    '• GEN-SYM-005 Helping Hands',
    '• GEN-SYM-006 Leaf'
)

$tempDir = Join-Path $env:TEMP ("prana-doc-update-" + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    Copy-Item -LiteralPath $SourceDoc -Destination $OutputDoc -Force
    $zip = [System.IO.Compression.ZipFile]::Open($OutputDoc, [System.IO.Compression.ZipArchiveMode]::Update)
    try {
        $entry = $zip.GetEntry('word/document.xml')
        $reader = New-Object System.IO.StreamReader($entry.Open())
        try {
            $xmlText = $reader.ReadToEnd()
        }
        finally {
            $reader.Dispose()
        }

        $xml = New-Object System.Xml.XmlDocument
        $xml.PreserveWhitespace = $true
        $xml.LoadXml($xmlText)

        $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
        $ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')

        $paragraphs = @($xml.SelectNodes('//w:body/w:p', $ns))
        $texts = @($paragraphs | ForEach-Object { Get-ParagraphText -Paragraph $_ -Ns $ns })

        $propHeaderIndex = [array]::IndexOf($texts, '4. Core Prop Library')
        if ($propHeaderIndex -lt 0) { throw 'Could not find prop section header.' }
        Replace-ParagraphWithMany -OldParagraph $paragraphs[$propHeaderIndex + 1] -NewTexts $propParagraphs -Ns $ns

        $paragraphs = @($xml.SelectNodes('//w:body/w:p', $ns))
        $texts = @($paragraphs | ForEach-Object { Get-ParagraphText -Paragraph $_ -Ns $ns })

        $part3SymbolHeaderIndex = [array]::IndexOf($texts, '5. Wisdom Symbol Library (Phase 1)')
        if ($part3SymbolHeaderIndex -lt 0) { throw 'Could not find Part 3 symbol header.' }
        Replace-ParagraphWithMany -OldParagraph $paragraphs[$part3SymbolHeaderIndex + 1] -NewTexts $symbolParagraphs -Ns $ns

        $paragraphs = @($xml.SelectNodes('//w:body/w:p', $ns))
        $texts = @($paragraphs | ForEach-Object { Get-ParagraphText -Paragraph $_ -Ns $ns })

        $phase1Index = [array]::IndexOf($texts, 'Phase 1 Symbol Set')
        $integrationIndex = [array]::IndexOf($texts, 'Symbol Integration Rules')
        if ($phase1Index -lt 0 -or $integrationIndex -lt 0 -or $integrationIndex -le $phase1Index) {
            throw 'Could not find Part 6 symbol range.'
        }
        Replace-ParagraphRange -Paragraphs $paragraphs -StartIndex ($phase1Index + 1) -EndIndex ($integrationIndex - 1) -NewTexts $symbolParagraphs -Ns $ns

        $newXmlPath = Join-Path $tempDir 'document.xml'
        $xml.Save($newXmlPath)

        $entry.Delete()
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $newXmlPath, 'word/document.xml') | Out-Null
    }
    finally {
        $zip.Dispose()
    }

    Write-Host "Updated production bible written to $OutputDoc"
}
finally {
    if (Test-Path -LiteralPath $tempDir) {
        Remove-Item -LiteralPath $tempDir -Recurse -Force
    }
}
