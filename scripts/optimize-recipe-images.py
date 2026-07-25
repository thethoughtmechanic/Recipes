from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "concepts" / "final-png"
OUTPUT = ROOT / "public" / "recipes"

OUTPUT.mkdir(parents=True, exist_ok=True)

for source_path in sorted(SOURCE.glob("*.png")):
    with Image.open(source_path) as image:
        optimized = image.convert("RGB").resize(
            (1200, 800),
            Image.Resampling.LANCZOS,
        )
        optimized.save(
            OUTPUT / f"{source_path.stem}.webp",
            "WEBP",
            quality=84,
            method=6,
        )
