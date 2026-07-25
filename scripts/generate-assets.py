from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"


def make_icon(size: int) -> Image.Image:
    image = Image.new("RGB", (size, size), "#1E1814")
    draw = ImageDraw.Draw(image)

    margin = int(size * 0.12)
    draw.rounded_rectangle(
        (margin, margin, size - margin, size - margin),
        radius=int(size * 0.18),
        fill="#1B4FD8",
    )
    center = size / 2
    plate_radius = size * 0.28
    draw.ellipse(
        (
            center - plate_radius,
            center - plate_radius,
            center + plate_radius,
            center + plate_radius,
        ),
        fill="#F2EEE3",
    )
    yolk_radius = size * 0.095
    draw.ellipse(
        (
            center - yolk_radius,
            center - yolk_radius,
            center + yolk_radius,
            center + yolk_radius,
        ),
        fill="#C4A43E",
    )
    return image


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
