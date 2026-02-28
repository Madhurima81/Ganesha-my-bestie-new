"""
Fix emoji mojibake across all JSX/JS source files.

The corruption pattern: UTF-8 multi-byte sequences for emojis were saved
as if each byte were a Windows-1252 (cp1252) character, producing garbled
sequences like  ðŸ˜Š  instead of  😊.

Fix: encode each non-ASCII character sequence back to cp1252 bytes,
then decode those bytes as UTF-8.
"""

import re
import os

def fix_mojibake_sequence(seq):
    # Pass 1: try whole sequence as cp1252 bytes → UTF-8
    try:
        return seq.encode('cp1252').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass

    # Pass 2: try whole sequence as latin-1 bytes → UTF-8
    try:
        return seq.encode('latin-1').decode('utf-8')
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass

    # Pass 3: mixed — encode char-by-char (cp1252 preferred, latin-1 fallback)
    try:
        byte_arr = bytearray()
        for c in seq:
            try:
                byte_arr.extend(c.encode('cp1252'))
            except UnicodeEncodeError:
                try:
                    byte_arr.extend(c.encode('latin-1'))
                except UnicodeEncodeError:
                    return seq  # Contains a char we can't map — give up
        return byte_arr.decode('utf-8')
    except (UnicodeDecodeError, Exception):
        return seq  # Leave unchanged if still can't fix

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            original = f.read()
    except UnicodeDecodeError:
        print(f"  SKIP (unreadable): {filepath}")
        return False

    # Only process files that contain non-ASCII (potential mojibake)
    if not any(ord(c) > 127 for c in original):
        return False

    fixed = re.sub(r'[^\x00-\x7F]+', lambda m: fix_mojibake_sequence(m.group(0)), original)

    if fixed != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed)
        print(f"  FIXED: {os.path.relpath(filepath)}")
        return True
    return False

src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
extensions = ('.jsx', '.js', '.ts', '.tsx')

fixed_count = 0
checked_count = 0

for root, dirs, files in os.walk(src_dir):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'dist', 'build')]
    for file in files:
        if file.endswith(extensions):
            filepath = os.path.join(root, file)
            checked_count += 1
            if fix_file(filepath):
                fixed_count += 1

print(f"\nChecked {checked_count} files. Fixed {fixed_count} files.")
