from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "public" / "products" / "pomelli-bdna-image-0530.webp"
OUT_DIR = ROOT / "public" / "products"
FONT = Path(r"C:\Windows\Fonts\arialbd.ttf")


@dataclass(frozen=True)
class Variant:
    slug: str
    label: str
    dose: str
    detail_lines: tuple[str, ...] = ()


VARIANTS = [
    Variant("glp-rt-50mg", "GLP-RT", "50mg"),
    Variant("bpc-157-2mg", "BPC-157", "2mg"),
    Variant("bpc-157-5mg", "BPC-157", "5mg"),
    Variant("bpc-157-10mg", "BPC-157", "10mg"),
    Variant("cjc-1295-with-dac-2mg", "CJC-1295 with DAC", "2mg"),
    Variant("cjc-1295-with-dac-5mg", "CJC-1295 with DAC", "5mg"),
    Variant("cjc-1295-with-dac-10mg", "CJC-1295 with DAC", "10mg"),
    Variant(
        "klow-blend-80mg-total",
        "KLOW Blend",
        "80mg total",
        ("GHK-Cu 50mg + BPC-157 10mg", "+ TB-500 10mg + KPV 10mg"),
    ),
    Variant("dsip-2mg", "DSIP", "2mg"),
    Variant("dsip-5mg", "DSIP", "5mg"),
    Variant("dsip-10mg", "DSIP", "10mg"),
    Variant("dsip-15mg", "DSIP", "15mg"),
    Variant("cjc-1295-no-dac-2mg", "CJC-1295 no DAC", "2mg"),
    Variant("cjc-1295-no-dac-5mg", "CJC-1295 no DAC", "5mg"),
    Variant("cjc-1295-no-dac-10mg", "CJC-1295 no DAC", "10mg"),
    Variant("nad-plus-100mg", "NAD+", "100mg"),
    Variant("nad-plus-250mg", "NAD+", "250mg"),
    Variant("nad-plus-500mg", "NAD+", "500mg"),
    Variant("nad-plus-1000mg", "NAD+", "1000mg"),
    Variant("selank-5mg", "Selank", "5mg"),
    Variant("selank-10mg", "Selank", "10mg"),
    Variant("hcg-5000-iu", "HCG", "5000 IU"),
    Variant("hcg-10000-iu", "HCG", "10000 IU"),
    Variant("pt-141-10mg", "PT-141", "10mg"),
    Variant("glutathione-600mg", "Glutathione", "600mg"),
    Variant("glutathione-1000mg", "Glutathione", "1000mg"),
    Variant("glutathione-1500mg", "Glutathione", "1500mg"),
    Variant("aod-9604-2mg", "AOD-9604", "2mg"),
    Variant("aod-9604-5mg", "AOD-9604", "5mg"),
    Variant("aod-9604-10mg", "AOD-9604", "10mg"),
    Variant("epithalon-10mg", "Epithalon", "10mg"),
    Variant("epithalon-50mg", "Epithalon", "50mg"),
    Variant("kpv-5mg", "KPV", "5mg"),
    Variant("kpv-10mg", "KPV", "10mg"),
    Variant("igf-1-lr3-100mcg", "IGF-1 LR3", "100mcg"),
    Variant("igf-1-lr3-0-1mg", "IGF-1 LR3", "0.1mg"),
    Variant("igf-1-lr3-1mg", "IGF-1 LR3", "1mg"),
    Variant("5-amino-1mq-5mg", "5-Amino-1MQ", "5mg"),
    Variant("5-amino-1mq-10mg", "5-Amino-1MQ", "10mg"),
    Variant("5-amino-1mq-20mg", "5-Amino-1MQ", "20mg"),
    Variant("5-amino-1mq-50mg", "5-Amino-1MQ", "50mg"),
    Variant("ghrp-6-5mg", "GHRP-6", "5mg"),
    Variant("ghrp-6-10mg", "GHRP-6", "10mg"),
    Variant("cerebrolysin-60mg", "Cerebrolysin", "60mg"),
    Variant("kisspeptin-5mg", "Kisspeptin", "5mg"),
    Variant("kisspeptin-10mg", "Kisspeptin", "10mg"),
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
    draw.text((512, y), text, font=font, fill=(19, 21, 27), anchor="mm")


def render(variant: Variant) -> Path:
    image = Image.open(TEMPLATE).convert("RGB")
    draw = ImageDraw.Draw(image)

    if variant.detail_lines:
        rebuild_label_band(image, 365, 614, 666, 766)
        draw_centered(draw, variant.label, 638, fitted_font(variant.label, 40, 28, 330))
        y = 681
        for line in variant.detail_lines:
            draw_centered(draw, line, y, fitted_font(line, 23, 16, 355))
            y += 24
        draw_centered(draw, variant.dose, 746, fitted_font(variant.dose, 31, 24, 270))
    else:
        rebuild_label_band(image, 390, 620, 634, 744)
        draw_centered(draw, variant.label, 653, fitted_font(variant.label, 49, 27, 340))
        draw_centered(draw, variant.dose, 717, fitted_font(variant.dose, 40, 28, 245))

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
