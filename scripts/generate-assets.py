from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ICON_SOURCE = ROOT / "assets" / "brand" / "whisk-in-motion-master.png"


def make_icon(size: int) -> Image.Image:
    source = Image.open(ICON_SOURCE).convert("RGB")
    return ImageOps.fit(
        source,
        (size, size),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )


og = Image.open(PUBLIC / "og.png").convert("RGB")
source_ratio = og.width / og.height
target_ratio = 1200 / 630

if source_ratio > target_ratio:
    crop_width = int(og.height * target_ratio)
    left = (og.width - crop_width) // 2
    og = og.crop((left, 0, left + crop_width, og.height))
else:
    crop_height = int(og.width / target_ratio)
    top = (og.height - crop_height) // 2
    og = og.crop((0, top, og.width, top + crop_height))

og.resize((1200, 630), Image.Resampling.LANCZOS).save(
    PUBLIC / "og.png",
    optimize=True,
)
make_icon(512).save(PUBLIC / "icon-512.png", optimize=True)
make_icon(192).save(PUBLIC / "icon-192.png", optimize=True)
make_icon(180).save(PUBLIC / "apple-touch-icon.png", optimize=True)
make_icon(32).save(PUBLIC / "icon-32.png", optimize=True)
make_icon(48).save(
    PUBLIC / "favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)
