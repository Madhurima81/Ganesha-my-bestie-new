param(
    [string]$OutputRoot = "$HOME\Downloads\PRANA_KIDS_WEEK01_STORY_ASSETS\Week 01"
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

function To-BulletLines {
    param([string[]]$Items)

    if (-not $Items -or $Items.Count -eq 0) {
        return @('- None')
    }

    return @($Items | ForEach-Object { "- $_" })
}

function Expand-AssetLabel {
    param([string]$Asset)

    $map = @{
        'CHAR-001_Arin_Rabbit' = 'CHAR-001 - Arin Rabbit'
        'CHAR-004_Chinu_Squirrel' = 'CHAR-004 - Chinu Squirrel'
        'CHAR-005_Kavi_Monkey' = 'CHAR-005 - Kavi Monkey'
        'CHAR-008_Ved_Owl' = 'CHAR-008 - Ved Owl'
        'CHAR-010_Anu_Mouse' = 'CHAR-010 - Anu Mouse'
        'CHAR-012_Vani_Parrot' = 'CHAR-012 - Vani Parrot'
        'TER-002_ForestFloor.png' = 'TER-002 - Forest Floor'
        'TER-003_Meadow.png' = 'TER-003 - Meadow'
        'TER-005_DirtPath.png' = 'TER-005 - Dirt Path'
        'TER-006_RiverBank.png' = 'TER-006 - River Bank'
        'TER-008_Clearing.png' = 'TER-008 - Clearing'
        'TRE-001_OakTree.png' = 'TRE-001 - Oak Tree'
        'TRE-003_MangoTree.png' = 'TRE-003 - Mango Tree'
        'TRE-005_FloweringTree.png' = 'TRE-005 - Flowering Tree'
        'WAT-001_Stream.png' = 'WAT-001 - Stream'
        'WAT-004_SteppingStones.png' = 'WAT-004 - Stepping Stones'
        'PLT-003_Wildflowers.png' = 'PLT-003 - Wildflowers'
        'PLT-005_GrassTufts.png' = 'PLT-005 - Grass Tufts'
        'PLT-012_FallenLeaves.png' = 'PLT-012 - Fallen Leaves'
        'PRP-001_Branch.png' = 'PRP-001 - Branch'
        'SKY-001_BlueSky.png' = 'SKY-001 - Blue Sky'
        'ADV-001_Basket.png' = 'ADV-001 - Basket'
        'FOD-002_Mango.png' = 'FOD-002 - Mango'
        'HLP-008_Picnic_Basket.png' = 'HLP-008 - Picnic Basket'
        'NPR-005_Acorn.png' = 'NPR-005 - Acorn'
        'NPR-010_Smooth_Stone.png' = 'NPR-010 - Smooth Stone'
    }

    if ($map.ContainsKey($Asset)) {
        return $map[$Asset]
    }

    return $Asset
}

function Expand-AssetLabels {
    param([string[]]$Assets)

    if (-not $Assets -or $Assets.Count -eq 0) {
        return @()
    }

    return @($Assets | ForEach-Object { Expand-AssetLabel -Asset $_ })
}

$stories = @(
    @{
        Id = 'ST-W01-01'
        Folder = 'Story 01'
        Title = "Arin Rabbit's Wobbly Feet"
        Value = 'Self-Awareness'
        PageText = @(
            'Arin Rabbit loved exploring the meadow. One morning, he reached a tiny stream and suddenly his feet felt wobbly. He did not know why.',
            'Arin looked around. Maybe I am not brave enough to cross, he whispered. His tummy felt funny and his heart beat faster.',
            'Ved Owl landed beside him. What are you feeling right now, he asked gently. Arin paused and replied, I think I am feeling nervous.',
            'Ved smiled. That is a wonderful thing to notice. Everyone feels nervous sometimes. When we know what we are feeling, we can choose what to do next.',
            'Arin took one slow breath, then another. His feet still felt a little wobbly, but now he understood why. Carefully, he hopped across the stream.',
            'Arin smiled. I was not fearless, he said. I just noticed my feeling and kept going. Ved nodded. That is the beginning of wisdom.'
        )
        Characters = @('CHAR-001_Arin_Rabbit', 'CHAR-008_Ved_Owl')
        Environment = @('TER-003_Meadow.png', 'TER-006_RiverBank.png', 'WAT-001_Stream.png', 'WAT-004_SteppingStones.png', 'PLT-003_Wildflowers.png', 'PLT-005_GrassTufts.png', 'SKY-001_BlueSky.png')
        Props = @('NPR-010_Smooth_Stone.png')
        Symbol = 'Pending approved locked ID - Mirror concept'
        Pages = @(
            @{ Page='Page 1'; Layout='LAY-L02 Hero'; Characters=@('CHAR-001_Arin_Rabbit'); Environment=@('TER-003_Meadow.png','PLT-003_Wildflowers.png','PLT-005_GrassTufts.png','SKY-001_BlueSky.png'); Props=@(); Note='Establish Arin exploring the meadow before he reaches the stream.' },
            @{ Page='Page 2'; Layout='LAY-L04 Problem'; Characters=@('CHAR-001_Arin_Rabbit'); Environment=@('TER-006_RiverBank.png','WAT-001_Stream.png','SKY-001_BlueSky.png'); Props=@(); Note='Show Arin hesitating at the stream with nervous body language.' },
            @{ Page='Page 3'; Layout='LAY-L05 Dialogue'; Characters=@('CHAR-001_Arin_Rabbit','CHAR-008_Ved_Owl'); Environment=@('TER-006_RiverBank.png','WAT-001_Stream.png'); Props=@(); Note='Ved lands beside Arin and asks what he is feeling.' },
            @{ Page='Page 4'; Layout='LAY-L06 Reflection'; Characters=@('CHAR-001_Arin_Rabbit','CHAR-008_Ved_Owl'); Environment=@('TER-006_RiverBank.png','WAT-001_Stream.png'); Props=@(); Note='Keep this page calm and thoughtful while Ved explains the wisdom.' },
            @{ Page='Page 5'; Layout='LAY-L07 Action'; Characters=@('CHAR-001_Arin_Rabbit'); Environment=@('WAT-004_SteppingStones.png','WAT-001_Stream.png','TER-006_RiverBank.png'); Props=@(); Note='Arin starts crossing after noticing his feeling and breathing slowly.' },
            @{ Page='Page 6'; Layout='LAY-L09 Wisdom Symbol'; Characters=@('CHAR-001_Arin_Rabbit','CHAR-008_Ved_Owl'); Environment=@('TER-003_Meadow.png','SKY-001_BlueSky.png'); Props=@('NPR-010_Smooth_Stone.png'); Note='Closing wisdom moment. Mirror symbol concept still needs final approved asset ID.' }
        )
    },
    @{
        Id = 'ST-W01-02'
        Folder = 'Story 02'
        Title = "Kavi Monkey's Busy Mind"
        Value = 'Self-Awareness'
        PageText = @(
            'Kavi Monkey loved doing everything quickly. While gathering mangoes, he kept jumping from one idea to another.',
            'He forgot where he had placed his basket, dropped a mango, and felt annoyed. Everything is going wrong, he sighed.',
            'Ved Owl watched quietly and asked, What is your mind doing right now. Kavi stopped for a moment.',
            'My mind is racing everywhere, Kavi admitted. Ved smiled. When we notice our busy mind, we can gently slow it down.',
            'Kavi took three slow breaths, picked up one mango at a time, and soon finished his task calmly.',
            'Kavi laughed. My mind still has lots of ideas, but now I know how to notice them before they carry me away.'
        )
        Characters = @('CHAR-005_Kavi_Monkey', 'CHAR-008_Ved_Owl')
        Environment = @('TER-008_Clearing.png', 'TER-002_ForestFloor.png', 'TRE-003_MangoTree.png', 'PLT-005_GrassTufts.png', 'SKY-001_BlueSky.png')
        Props = @('ADV-001_Basket.png', 'FOD-002_Mango.png')
        Symbol = 'Pending approved locked ID - Mirror concept'
        Pages = @(
            @{ Page='Page 1'; Layout='LAY-L02 Hero'; Characters=@('CHAR-005_Kavi_Monkey'); Environment=@('TER-008_Clearing.png','TRE-003_MangoTree.png','SKY-001_BlueSky.png'); Props=@('ADV-001_Basket.png','FOD-002_Mango.png'); Note='Show Kavi in a bright active setting with the basket and mango task.' },
            @{ Page='Page 2'; Layout='LAY-L04 Problem'; Characters=@('CHAR-005_Kavi_Monkey'); Environment=@('TER-002_ForestFloor.png','TRE-003_MangoTree.png'); Props=@('ADV-001_Basket.png','FOD-002_Mango.png'); Note='Convey distraction and mild frustration as things go wrong.' },
            @{ Page='Page 3'; Layout='LAY-L05 Dialogue'; Characters=@('CHAR-005_Kavi_Monkey','CHAR-008_Ved_Owl'); Environment=@('TER-008_Clearing.png','TRE-003_MangoTree.png'); Props=@('ADV-001_Basket.png'); Note='Ved prompts Kavi to notice the busy mind.' },
            @{ Page='Page 4'; Layout='LAY-L06 Reflection'; Characters=@('CHAR-005_Kavi_Monkey','CHAR-008_Ved_Owl'); Environment=@('TER-008_Clearing.png'); Props=@(); Note='Make the pause feel quieter and more centered.' },
            @{ Page='Page 5'; Layout='LAY-L07 Action'; Characters=@('CHAR-005_Kavi_Monkey'); Environment=@('TER-008_Clearing.png','TRE-003_MangoTree.png'); Props=@('ADV-001_Basket.png','FOD-002_Mango.png'); Note='Show the one-mango-at-a-time calm action beat.' },
            @{ Page='Page 6'; Layout='LAY-L09 Wisdom Symbol'; Characters=@('CHAR-005_Kavi_Monkey','CHAR-008_Ved_Owl'); Environment=@('TER-008_Clearing.png','SKY-001_BlueSky.png'); Props=@('ADV-001_Basket.png'); Note='Closing wisdom moment. Mirror symbol concept still needs final approved asset ID.' }
        )
    },
    @{
        Id = 'ST-W01-03'
        Folder = 'Story 03'
        Title = "Anu Mouse's Tiny Voice"
        Value = 'Self-Awareness'
        PageText = @(
            'Anu Mouse loved helping others, but whenever someone asked for ideas, Anu stayed very quiet.',
            'During a forest picnic, everyone wondered how to cross a muddy patch. Anu knew a safe little path but did not say anything.',
            'Ved Owl noticed Anu hiding behind a log. What are you feeling right now, he asked gently.',
            'I am feeling shy, whispered Anu. Ved smiled. Thank you for noticing your feeling. Now decide what you would like to do.',
            'Anu took a deep breath and softly shared the idea. The friends happily crossed using the safe path.',
            'Anu realised that being aware of shyness made it easier to speak with courage. Every small voice matters.'
        )
        Characters = @('CHAR-010_Anu_Mouse', 'CHAR-008_Ved_Owl')
        Environment = @('TER-005_DirtPath.png', 'TER-008_Clearing.png', 'PLT-003_Wildflowers.png', 'PLT-005_GrassTufts.png', 'SKY-001_BlueSky.png')
        Props = @('HLP-008_Picnic_Basket.png')
        Symbol = 'Pending approved locked ID - Mirror concept'
        Pages = @(
            @{ Page='Page 1'; Layout='LAY-L02 Hero'; Characters=@('CHAR-010_Anu_Mouse'); Environment=@('TER-008_Clearing.png','PLT-003_Wildflowers.png','SKY-001_BlueSky.png'); Props=@('HLP-008_Picnic_Basket.png'); Note='Introduce Anu as kind and helpful in the picnic setting.' },
            @{ Page='Page 2'; Layout='LAY-L04 Problem'; Characters=@('CHAR-010_Anu_Mouse'); Environment=@('TER-005_DirtPath.png','TER-008_Clearing.png'); Props=@('HLP-008_Picnic_Basket.png'); Note='Show the muddy path problem and Anu holding back.' },
            @{ Page='Page 3'; Layout='LAY-L05 Dialogue'; Characters=@('CHAR-010_Anu_Mouse','CHAR-008_Ved_Owl'); Environment=@('TER-005_DirtPath.png'); Props=@(); Note='Ved notices Anu hiding and gently asks what she is feeling.' },
            @{ Page='Page 4'; Layout='LAY-L06 Reflection'; Characters=@('CHAR-010_Anu_Mouse','CHAR-008_Ved_Owl'); Environment=@('TER-008_Clearing.png'); Props=@(); Note='Quiet and reassuring page for naming shyness.' },
            @{ Page='Page 5'; Layout='LAY-L07 Action'; Characters=@('CHAR-010_Anu_Mouse'); Environment=@('TER-005_DirtPath.png'); Props=@(); Note='Anu shares the safe path idea after taking a breath.' },
            @{ Page='Page 6'; Layout='LAY-L09 Wisdom Symbol'; Characters=@('CHAR-010_Anu_Mouse','CHAR-008_Ved_Owl'); Environment=@('TER-008_Clearing.png','SKY-001_BlueSky.png'); Props=@(); Note='Closing wisdom moment. Mirror symbol concept still needs final approved asset ID.' }
        )
    },
    @{
        Id = 'ST-W01-04'
        Folder = 'Story 04'
        Title = "Chinu Squirrel's Missing Acorn"
        Value = 'Self-Awareness'
        PageText = @(
            'Chinu Squirrel carefully collected acorns for winter. One morning, the biggest acorn was missing.',
            'Chinu rushed around the forest feeling upset. Someone must have taken it, Chinu cried.',
            'Ved Owl gently asked, Before looking outside, what are you noticing inside.',
            'I am feeling frustrated, Chinu admitted. After taking a slow breath, Chinu looked around more carefully.',
            'The acorn was safely tucked beneath a pile of fallen leaves exactly where Chinu had left it.',
            'Chinu smiled. When I noticed my feelings first, I could think more clearly. Ved nodded with pride.'
        )
        Characters = @('CHAR-004_Chinu_Squirrel', 'CHAR-008_Ved_Owl')
        Environment = @('TER-002_ForestFloor.png', 'TRE-001_OakTree.png', 'PLT-012_FallenLeaves.png', 'PLT-005_GrassTufts.png', 'SKY-001_BlueSky.png')
        Props = @('NPR-005_Acorn.png')
        Symbol = 'Pending approved locked ID - Mirror concept'
        Pages = @(
            @{ Page='Page 1'; Layout='LAY-L02 Hero'; Characters=@('CHAR-004_Chinu_Squirrel'); Environment=@('TER-002_ForestFloor.png','TRE-001_OakTree.png','SKY-001_BlueSky.png'); Props=@('NPR-005_Acorn.png'); Note='Introduce Chinu collecting acorns in the forest.' },
            @{ Page='Page 2'; Layout='LAY-L04 Problem'; Characters=@('CHAR-004_Chinu_Squirrel'); Environment=@('TER-002_ForestFloor.png','PLT-012_FallenLeaves.png'); Props=@(); Note='Show upset searching energy after the acorn seems missing.' },
            @{ Page='Page 3'; Layout='LAY-L05 Dialogue'; Characters=@('CHAR-004_Chinu_Squirrel','CHAR-008_Ved_Owl'); Environment=@('TER-002_ForestFloor.png','TRE-001_OakTree.png'); Props=@(); Note='Ved guides Chinu inward before solving the problem.' },
            @{ Page='Page 4'; Layout='LAY-L06 Reflection'; Characters=@('CHAR-004_Chinu_Squirrel'); Environment=@('TER-002_ForestFloor.png','PLT-012_FallenLeaves.png'); Props=@(); Note='Use a calmer beat as Chinu names frustration.' },
            @{ Page='Page 5'; Layout='LAY-L07 Action'; Characters=@('CHAR-004_Chinu_Squirrel'); Environment=@('PLT-012_FallenLeaves.png','TER-002_ForestFloor.png'); Props=@('NPR-005_Acorn.png'); Note='Reveal the acorn tucked under fallen leaves.' },
            @{ Page='Page 6'; Layout='LAY-L09 Wisdom Symbol'; Characters=@('CHAR-004_Chinu_Squirrel','CHAR-008_Ved_Owl'); Environment=@('TER-002_ForestFloor.png','SKY-001_BlueSky.png'); Props=@('NPR-005_Acorn.png'); Note='Closing wisdom moment. Mirror symbol concept still needs final approved asset ID.' }
        )
    },
    @{
        Id = 'ST-W01-05'
        Folder = 'Story 05'
        Title = "Vani Parrot's Quiet Song"
        Value = 'Self-Awareness'
        PageText = @(
            'Vani Parrot loved singing with the other birds every morning. One day, Vani stayed unusually quiet.',
            'The joyful songs filled the forest, but Vani sat alone on a branch, feeling heavy inside.',
            'Ved Owl flew over and gently asked, What are you noticing in your heart today.',
            'Vani whispered, I think I am feeling sad. Ved nodded. Thank you for noticing. Feelings become easier to understand when we name them.',
            'After sitting quietly for a while, Vani joined the chorus with a soft song. It was not the loudest voice, but it was full of honesty.',
            'Vani smiled. My sadness did not stay forever. It helped me understand myself better. Ved replied, Every feeling has something to teach us.'
        )
        Characters = @('CHAR-012_Vani_Parrot', 'CHAR-008_Ved_Owl')
        Environment = @('TRE-005_FloweringTree.png', 'PRP-001_Branch.png', 'PLT-003_Wildflowers.png', 'SKY-001_BlueSky.png')
        Props = @()
        Symbol = 'Pending approved locked ID - Mirror concept'
        Pages = @(
            @{ Page='Page 1'; Layout='LAY-L02 Hero'; Characters=@('CHAR-012_Vani_Parrot'); Environment=@('TRE-005_FloweringTree.png','PRP-001_Branch.png','SKY-001_BlueSky.png'); Props=@(); Note='Open with Vani in the singing tree world.' },
            @{ Page='Page 2'; Layout='LAY-L04 Problem'; Characters=@('CHAR-012_Vani_Parrot'); Environment=@('PRP-001_Branch.png','TRE-005_FloweringTree.png'); Props=@(); Note='Show Vani sitting apart and feeling heavy.' },
            @{ Page='Page 3'; Layout='LAY-L05 Dialogue'; Characters=@('CHAR-012_Vani_Parrot','CHAR-008_Ved_Owl'); Environment=@('PRP-001_Branch.png','TRE-005_FloweringTree.png'); Props=@(); Note='Ved gently asks what Vani notices in the heart.' },
            @{ Page='Page 4'; Layout='LAY-L06 Reflection'; Characters=@('CHAR-012_Vani_Parrot','CHAR-008_Ved_Owl'); Environment=@('TRE-005_FloweringTree.png'); Props=@(); Note='Keep this page quiet and emotionally honest.' },
            @{ Page='Page 5'; Layout='LAY-L07 Action'; Characters=@('CHAR-012_Vani_Parrot'); Environment=@('TRE-005_FloweringTree.png','PRP-001_Branch.png'); Props=@(); Note='Vani softly rejoins the song.' },
            @{ Page='Page 6'; Layout='LAY-L09 Wisdom Symbol'; Characters=@('CHAR-012_Vani_Parrot','CHAR-008_Ved_Owl'); Environment=@('TRE-005_FloweringTree.png','SKY-001_BlueSky.png'); Props=@(); Note='Closing wisdom moment. Mirror symbol concept still needs final approved asset ID.' }
        )
    }
)

$combinedLines = @(
    '# Week 01 Combined Asset Sheet',
    '',
    'This sheet gives one quick view of all 5 stories, their selected assets, and per-page direction.'
)

$summary = @()

foreach ($story in $stories) {
    $storyDir = Join-Path $OutputRoot $story.Folder

    $storyGuideLines = @(
        "# $($story.Id) - $($story.Title)",
        '',
        "Value: $($story.Value)",
        "Wisdom Symbol: $($story.Symbol)",
        '',
        '## Story-Level Assets',
        'Characters:'
    ) + (To-BulletLines -Items (Expand-AssetLabels -Assets $story.Characters)) + @(
        'Environments:'
    ) + (To-BulletLines -Items (Expand-AssetLabels -Assets $story.Environment)) + @(
        'Props:'
    ) + (To-BulletLines -Items (Expand-AssetLabels -Assets $story.Props)) + @(
        '',
        '## Page-by-Page Design Guide'
    )

    for ($i = 0; $i -lt $story.Pages.Count; $i++) {
        $page = $story.Pages[$i]
        $pageText = $story.PageText[$i]
        $storyGuideLines += @(
            '',
            "### $($page.Page)",
            "Layout: $($page.Layout)",
            'Characters:'
        ) + (To-BulletLines -Items (Expand-AssetLabels -Assets $page.Characters)) + @(
            'Environments:'
        ) + (To-BulletLines -Items (Expand-AssetLabels -Assets $page.Environment)) + @(
            'Props:'
        ) + (To-BulletLines -Items (Expand-AssetLabels -Assets $page.Props)) + @(
            "Purpose: $($page.Note)",
            "Text: $pageText"
        )
    }

    Write-TextFile -Path (Join-Path $storyDir 'canva_design_guide.md') -Lines $storyGuideLines

    $combinedLines += @(
        '',
        "## $($story.Id) - $($story.Title)",
        "Story folder: $($story.Folder)",
        "Characters: $((Expand-AssetLabels -Assets $story.Characters) -join ', ')",
        "Environments: $((Expand-AssetLabels -Assets $story.Environment) -join ', ')",
        "Props: $(if ($story.Props.Count -gt 0) { (Expand-AssetLabels -Assets $story.Props) -join ', ' } else { 'None' })",
        "Symbol: $($story.Symbol)"
    )

    for ($i = 0; $i -lt $story.Pages.Count; $i++) {
        $page = $story.Pages[$i]
        $pageText = $story.PageText[$i]
        $combinedLines += @(
            "- $($page.Page): $($page.Layout) | Characters: $((Expand-AssetLabels -Assets $page.Characters) -join ', ') | Environments: $((Expand-AssetLabels -Assets $page.Environment) -join ', ') | Props: $(if ($page.Props.Count -gt 0) { (Expand-AssetLabels -Assets $page.Props) -join ', ' } else { 'None' })",
            "  Text: $pageText"
        )
    }

    $summary += [pscustomobject]@{
        StoryID = $story.Id
        Title = $story.Title
        Characters = ($story.Characters -join '; ')
        EnvironmentFiles = $story.Environment.Count
        PropFiles = $story.Props.Count
        Pages = $story.Pages.Count
        Symbol = $story.Symbol
    }
}

Write-TextFile -Path (Join-Path $OutputRoot 'WEEK01_COMBINED_ASSET_SHEET.md') -Lines $combinedLines
$summary | Export-Csv -NoTypeInformation -Path (Join-Path $OutputRoot 'WEEK01_COMBINED_ASSET_SHEET.csv')

Write-Host "Week 01 page asset picks created under $OutputRoot"
