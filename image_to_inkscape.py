"""
Image-to-Inkscape Agent
=======================
Takes an image file, analyzes it using Claude's vision API,
generates SVG code that recreates it, and opens it in Inkscape.

Usage:
    python image_to_inkscape.py <image_path> [options]

Options:
    --width    Canvas width in px  (default: 2400)
    --height   Canvas height in px (default: 1800)
    --output   Output SVG path     (default: output.svg)
    --no-open  Don't auto-open in Inkscape
    --refine   Number of refinement passes (default: 0)

Environment:
    ANTHROPIC_API_KEY  - Your Anthropic API key (required)
"""

import anthropic
import base64
import argparse
import subprocess
import sys
import os
import re
import time


# ── Inkscape path detection ──────────────────────────────────────────────────

def find_inkscape() -> str | None:
    """Find Inkscape executable on the system."""
    common_paths = [
        # Windows
        r"C:\Program Files\Inkscape\bin\inkscape.exe",
        r"C:\Program Files (x86)\Inkscape\bin\inkscape.exe",
        # macOS
        "/Applications/Inkscape.app/Contents/MacOS/inkscape",
        # Linux
        "/usr/bin/inkscape",
        "/usr/local/bin/inkscape",
        "/snap/bin/inkscape",
    ]

    # Check PATH first
    import shutil
    path = shutil.which("inkscape")
    if path:
        return path

    # Check common install locations
    for p in common_paths:
        if os.path.isfile(p):
            return p

    return None


# ── Image encoding ───────────────────────────────────────────────────────────

def encode_image(image_path: str) -> tuple[str, str]:
    """Read and base64-encode an image file. Returns (base64_data, media_type)."""
    ext = os.path.splitext(image_path)[1].lower()
    media_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
    }

    media_type = media_types.get(ext)
    if not media_type:
        print(f"[ERROR] Unsupported image format: {ext}")
        print(f"        Supported: {', '.join(media_types.keys())}")
        sys.exit(1)

    with open(image_path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("utf-8")

    return data, media_type


# ── SVG extraction ───────────────────────────────────────────────────────────

def extract_svg(text: str) -> str:
    """Extract SVG code from Claude's response."""
    # Try to find SVG in code blocks first
    patterns = [
        r"```svg\s*(.*?)```",
        r"```xml\s*(.*?)```",
        r"```\s*(<svg.*?</svg>)\s*```",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1).strip()

    # Try to find raw <svg>...</svg>
    match = re.search(r"(<svg.*?</svg>)", text, re.DOTALL)
    if match:
        return match.group(1).strip()

    return ""


# ── System prompt ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert SVG artist and Inkscape designer. Your job is to analyze images and recreate them as clean, editable SVG code.

RULES:
1. Output ONLY the SVG code inside a ```svg code block. No explanations before or after.
2. The SVG must be a complete, valid SVG file with proper XML declaration and namespaces.
3. Use the exact canvas dimensions specified by the user.
4. Recreate the image as faithfully as possible using SVG elements:
   - Use <rect>, <circle>, <ellipse>, <path>, <polygon>, <line> for shapes
   - Use <linearGradient>, <radialGradient> for gradients
   - Use <filter> with <feGaussianBlur>, <feDropShadow>, etc. for effects
   - Use <text> for any text content (try to match fonts)
   - Use <g> to group related elements
   - Use <defs> for reusable components, gradients, and filters
   - Use <use> with xlink:href for repeated elements
   - Use <clipPath> and <mask> when needed
5. Match colors as closely as possible (use hex codes).
6. Match positions, sizes, and proportions accurately.
7. Layer elements properly (back to front).
8. For complex curves, use cubic/quadratic Bezier paths.
9. Include xmlns:xlink="http://www.w3.org/1999/xlink" if using xlink:href.
10. Make it look GOOD in Inkscape - use proper structure so elements are easy to edit.

IMPORTANT: Be thorough. Include ALL visual elements you see in the image. Don't skip small details like shadows, glows, subtle gradients, or decorative elements."""


# ── Main generation ──────────────────────────────────────────────────────────

def generate_svg(
    client: anthropic.Anthropic,
    image_data: str,
    media_type: str,
    width: int,
    height: int,
    extra_instructions: str = "",
) -> str:
    """Send image to Claude and get SVG code back."""

    user_prompt = f"Recreate this image as SVG. Canvas size: {width}x{height} pixels."
    if extra_instructions:
        user_prompt += f"\n\nAdditional instructions: {extra_instructions}"

    print("[AGENT] Analyzing image and generating SVG...")
    start = time.time()

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=16000,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": user_prompt,
                    },
                ],
            }
        ],
    )

    elapsed = time.time() - start
    print(f"[AGENT] Generated in {elapsed:.1f}s  (tokens: {response.usage.input_tokens} in / {response.usage.output_tokens} out)")

    # Extract SVG from response
    full_text = response.content[0].text
    svg_code = extract_svg(full_text)

    if not svg_code:
        print("[ERROR] Could not extract SVG from response.")
        print("[DEBUG] Full response:")
        print(full_text[:2000])
        sys.exit(1)

    return svg_code


# ── Refinement pass ──────────────────────────────────────────────────────────

def refine_svg(
    client: anthropic.Anthropic,
    image_data: str,
    media_type: str,
    current_svg: str,
    width: int,
    height: int,
    pass_number: int,
) -> str:
    """Compare original image with current SVG and refine."""

    print(f"[AGENT] Refinement pass {pass_number}...")
    start = time.time()

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=16000,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": f"""Here is my current SVG attempt to recreate the image above.
Canvas size: {width}x{height}.

Current SVG:
```svg
{current_svg}
```

Compare the original image with this SVG carefully. Identify what's missing, what's wrong,
and what could be improved. Then output a COMPLETE improved SVG that is more faithful to
the original image. Output ONLY the improved SVG in a ```svg code block.""",
                    },
                ],
            }
        ],
    )

    elapsed = time.time() - start
    print(f"[AGENT] Refined in {elapsed:.1f}s  (tokens: {response.usage.input_tokens} in / {response.usage.output_tokens} out)")

    full_text = response.content[0].text
    svg_code = extract_svg(full_text)

    if not svg_code:
        print(f"[WARN] Refinement pass {pass_number} failed to produce SVG. Keeping previous version.")
        return current_svg

    return svg_code


# ── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Image-to-Inkscape Agent: Recreate images as editable SVG in Inkscape",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python image_to_inkscape.py photo.png
  python image_to_inkscape.py logo.jpg --width 1920 --height 1080
  python image_to_inkscape.py design.png --output my_design.svg --refine 1
  python image_to_inkscape.py icon.png --no-open
        """,
    )
    parser.add_argument("image", help="Path to the input image file")
    parser.add_argument("--width", type=int, default=2400, help="SVG canvas width (default: 2400)")
    parser.add_argument("--height", type=int, default=1800, help="SVG canvas height (default: 1800)")
    parser.add_argument("--output", "-o", default=None, help="Output SVG file path (default: <image_name>.svg)")
    parser.add_argument("--no-open", action="store_true", help="Don't open in Inkscape after generation")
    parser.add_argument("--refine", type=int, default=0, help="Number of refinement passes (0-3, default: 0)")
    parser.add_argument("--instructions", "-i", default="", help="Extra instructions for the AI (e.g. 'make the blue darker')")

    args = parser.parse_args()

    # ── Validate input ────────────────────────────────────────────────────
    if not os.path.isfile(args.image):
        print(f"[ERROR] Image not found: {args.image}")
        sys.exit(1)

    # ── API key check ─────────────────────────────────────────────────────
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("[ERROR] ANTHROPIC_API_KEY environment variable is not set.")
        print("        Set it with:  set ANTHROPIC_API_KEY=sk-ant-...")
        print("        Or:           export ANTHROPIC_API_KEY=sk-ant-...")
        sys.exit(1)

    # ── Determine output path ─────────────────────────────────────────────
    if args.output:
        output_path = args.output
    else:
        base = os.path.splitext(os.path.basename(args.image))[0]
        output_path = os.path.join(os.path.dirname(args.image) or ".", f"{base}_inkscape.svg")

    # ── Encode image ──────────────────────────────────────────────────────
    print(f"[AGENT] Loading image: {args.image}")
    image_data, media_type = encode_image(args.image)
    file_size_mb = len(base64.b64decode(image_data)) / (1024 * 1024)
    print(f"[AGENT] Image size: {file_size_mb:.1f} MB ({media_type})")
    print(f"[AGENT] Canvas: {args.width} x {args.height}")

    # ── Initialize client ─────────────────────────────────────────────────
    client = anthropic.Anthropic()

    # ── Generate SVG ──────────────────────────────────────────────────────
    svg_code = generate_svg(
        client, image_data, media_type,
        args.width, args.height, args.instructions,
    )

    # ── Refinement passes ─────────────────────────────────────────────────
    refine_count = min(args.refine, 3)  # Cap at 3
    for i in range(1, refine_count + 1):
        svg_code = refine_svg(
            client, image_data, media_type,
            svg_code, args.width, args.height, i,
        )

    # ── Save SVG ──────────────────────────────────────────────────────────
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg_code)

    file_size_kb = os.path.getsize(output_path) / 1024
    print(f"[AGENT] Saved: {output_path} ({file_size_kb:.1f} KB)")

    # ── Open in Inkscape ──────────────────────────────────────────────────
    if not args.no_open:
        inkscape = find_inkscape()
        if inkscape:
            print(f"[AGENT] Opening in Inkscape...")
            abs_path = os.path.abspath(output_path)
            subprocess.Popen([inkscape, abs_path])
            print(f"[AGENT] Done! Inkscape is opening your file.")
        else:
            print("[WARN] Inkscape not found on this system.")
            print(f"       Open the SVG manually: {os.path.abspath(output_path)}")
    else:
        print(f"[AGENT] Done! Open in Inkscape: {os.path.abspath(output_path)}")


if __name__ == "__main__":
    main()
