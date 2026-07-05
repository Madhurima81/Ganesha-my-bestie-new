param(
    [string]$SourceDoc = "$HOME\Downloads\Prana_Kids_Week01_Content_Pack_v2_FINAL.docx",
    [string]$OutputDoc = "$HOME\Downloads\Prana_Kids_Week01_Content_Pack_v2_FINAL_UPDATED.docx"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

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

function Insert-ParagraphsAfter {
    param(
        [System.Xml.XmlNode]$ReferenceParagraph,
        [string[]]$NewTexts,
        [System.Xml.XmlNamespaceManager]$Ns
    )

    $parent = $ReferenceParagraph.ParentNode
    $insertAfter = $ReferenceParagraph

    foreach ($text in $NewTexts) {
        $clone = $ReferenceParagraph.CloneNode($true)
        Set-ParagraphText -Paragraph $clone -Ns $Ns -Text $text
        $parent.InsertAfter($clone, $insertAfter) | Out-Null
        $insertAfter = $clone
    }
}

function Find-ParagraphIndexLike {
    param(
        [string[]]$Texts,
        [string]$Pattern
    )

    for ($i = 0; $i -lt $Texts.Count; $i++) {
        if ($Texts[$i] -like $Pattern) {
            return $i
        }
    }

    return -1
}

$tempDir = Join-Path $env:TEMP ("week01-content-update-" + [guid]::NewGuid().ToString())
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

        $replaceExactMap = @{
            'Use LAY-L01 to LAY-L09 only.' = 'Use locked Layout IDs. LAY-L01 to LAY-L09 are standard story pages; reserve LAY-L10 for activity use only.'
            'Use approved Character, Environment, Prop and Symbol IDs.' = 'Use locked Character, Environment, Prop and Symbol IDs. Do not send any story to design or dev without explicit asset IDs.'
            'Load correct character and environment assets.' = 'Load the locked character, environment, prop and symbol assets listed in the illustration brief.'
            'Trigger symbol animation on final page.' = 'Trigger the approved symbol animation on the final page only after the symbol ID is locked.'
            'Traditional Meaning: Seeing clearly without judgement.' = 'Traditional Meaning: Self-reflection and clear inner noticing. Final approved symbol ID must be assigned before production.'
        }

        foreach ($key in $replaceExactMap.Keys) {
            $index = [array]::IndexOf($texts, $key)
            if ($index -ge 0) {
                Set-ParagraphText -Paragraph $paragraphs[$index] -Ns $ns -Text $replaceExactMap[$key]
            }
        }

        $symbolConceptIndex = Find-ParagraphIndexLike -Texts $texts -Pattern 'Symbol:*Mirror*'
        if ($symbolConceptIndex -ge 0) {
            Set-ParagraphText -Paragraph $paragraphs[$symbolConceptIndex] -Ns $ns -Text 'Symbol: Pending approved locked ID – Mirror concept'
        }

        $weeklySymbolIndex = Find-ParagraphIndexLike -Texts $texts -Pattern '*Wisdom Symbol*Mirror*'
        if ($weeklySymbolIndex -ge 0) {
            Set-ParagraphText -Paragraph $paragraphs[$weeklySymbolIndex] -Ns $ns -Text '🪞 Wisdom Symbol Concept: Mirror (assign approved locked ID before production)'
        }

        $paragraphs = @($xml.SelectNodes('//w:body/w:p', $ns))
        $texts = @($paragraphs | ForEach-Object { Get-ParagraphText -Paragraph $_ -Ns $ns })

        $productionNoteIndex = [array]::IndexOf($texts, 'Use locked Character, Environment, Prop and Symbol IDs. Do not send any story to design or dev without explicit asset IDs.')
        if ($productionNoteIndex -ge 0) {
            Insert-ParagraphsAfter -ReferenceParagraph $paragraphs[$productionNoteIndex] -NewTexts @(
                'For every story, create a separate illustration brief with explicit Character IDs, Environment IDs, Prop IDs, Symbol ID and Layout IDs before production starts.'
            ) -Ns $ns
        }

        $paragraphs = @($xml.SelectNodes('//w:body/w:p', $ns))
        $texts = @($paragraphs | ForEach-Object { Get-ParagraphText -Paragraph $_ -Ns $ns })

        $illustrationHeaderIndex = [array]::IndexOf($texts, 'BATCH 8 – ILLUSTRATION PRODUCTION PACK (ALL 5 STORIES)')
        if ($illustrationHeaderIndex -ge 0) {
            Insert-ParagraphsAfter -ReferenceParagraph $paragraphs[$illustrationHeaderIndex] -NewTexts @(
                'Production lock note: add exact Character IDs, Environment IDs, Prop IDs, Symbol ID and Layout IDs to each page brief before illustration production.'
            ) -Ns $ns
        }

        $paragraphs = @($xml.SelectNodes('//w:body/w:p', $ns))
        $texts = @($paragraphs | ForEach-Object { Get-ParagraphText -Paragraph $_ -Ns $ns })

        $appHeaderIndex = [array]::IndexOf($texts, 'BATCH 9 – APP PRODUCTION PACK (ALL 5 STORIES)')
        if ($appHeaderIndex -ge 0) {
            Insert-ParagraphsAfter -ReferenceParagraph $paragraphs[$appHeaderIndex] -NewTexts @(
                'Production lock note: every mini-game must reference the same locked Character IDs, Environment IDs, Prop IDs, Symbol ID and Layout IDs as the illustration brief.'
            ) -Ns $ns
        }

        $newXmlPath = Join-Path $tempDir 'document.xml'
        $xml.Save($newXmlPath)

        $entry.Delete()
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $newXmlPath, 'word/document.xml') | Out-Null
    }
    finally {
        $zip.Dispose()
    }

    Write-Host "Updated Week 01 content pack written to $OutputDoc"
}
finally {
    if (Test-Path -LiteralPath $tempDir) {
        Remove-Item -LiteralPath $tempDir -Recurse -Force
    }
}
