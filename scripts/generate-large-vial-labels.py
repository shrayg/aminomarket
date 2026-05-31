from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "scripts" / "assets" / "large-vial-template.png"
OUT_DIR = ROOT / "public" / "products"
FONT = Path(r"C:\Windows\Fonts\arialbd.ttf")


@dataclass(frozen=True)
class Variant:
    slug: str
    label: str
    detail_lines: tuple[str, ...]


VARIANTS = [
    Variant("bacteriostatic-water-3ml", "Bacteriostatic Water", ("3mL",)),
    Variant("bacteriostatic-water-10ml", "Bacteriostatic Water", ("10mL",)),
    Variant("l-carnitine-5000mg", "L-Carnitine", ("5000mg",)),
    Variant("l-carnitine-500mg-per-ml-10ml", "L-Carnitine", ("500mg/mL", "10mL")),
]


def rebuild_label_band(image: Image.Image, x0: int, y0: int, x1: int, y1: int) -> None:
    pixels = image.load()
    for y in range(y0, y1 + 1):
        left = pixels[x0 - 3, y]
        right = pixels[x1 + 3, y]
        span = x1 - x0
        for x in range(x0, x1 + 1):
            ratio = (x - x0) / span
            pixels[x, y] = tuple(
                round(left[channel] * (1 - ratio) + right[channel] * ratio)
                for channel in range(3)
            )


def fitted_font(text: str, max_size: int, min_size: int, max_width: int) -> ImageFont.FreeTypeFont:
    for size in range(max_size, min_size - 1, -1):
        font = ImageFont.truetype(FONT, size)
        left, _, right, _ = font.getbbox(text)
        if right - left <= max_width:
            return font
    return ImageFont.truetype(FONT, min_size)


def draw_centered(draw: ImageDraw.ImageDraw, text: str, y: int, font: ImageFont.FreeTypeFont) -> None:
    draw.text((627, y), text, font=font, fill=(18, 19, 23), anchor="mm")


def render(variant: Variant) -> Path:
    image = Image.open(TEMPLATE).convert("RGB")
    draw = ImageDraw.Draw(image)
    rebuild_label_band(image, 380, 775, 875, 955)

    draw_centered(draw, variant.label, 817, fitted_font(variant.label, 59, 36, 510))
    if len(variant.detail_lines) == 1:
        draw_centered(draw, variant.detail_lines[0], 917, fitted_font(variant.detail_lines[0], 58, 40, 330))
    else:
        draw_centered(draw, variant.detail_lines[0], 895, fitted_font(variant.detail_lines[0], 48, 36, 360))
        draw_centered(draw, variant.detail_lines[1], 943, fitted_font(variant.detail_lines[1], 45, 34, 260))

    out = OUT_DIR / f"generated-{variant.slug}.webp"
    image.save(out, "WEBP", quality=94, method=6)
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--slug", help="Render only one variant slug")
    args = parser.parse_args()
    selected = [variant for variant in VARIANTS if not args.slug or variant.slug == args.slug]
    if args.slug and not selected:
        raise SystemExit(f"Unknown slug: {args.slug}")
    for variant in selected:
        print(render(variant))


if __name__ == "__main__":
    main()
