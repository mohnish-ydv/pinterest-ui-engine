"""analyze_image.py — deterministic pixel analysis of a reference image.
Emits JSON: dominant colour clusters (quantized, with pixel share),
saturation distribution, and the share of the largest hue family.
Usage: python3 analyze_image.py <image> [clusters]
No colour naming or design judgement is performed here — interpretation
lives in the design spec, where it is labelled as interpretation."""
import colorsys
import json
import sys
from collections import Counter

from PIL import Image


def main():
    path = sys.argv[1]
    k = int(sys.argv[2]) if len(sys.argv) > 2 else 12
    im = Image.open(path).convert("RGB")
    # M036: the 240px thumbnail erased the very thing being measured. On a
    # tall multi-screen board, saturated brand colours (buttons, accents)
    # occupy a few percent of pixels; crushed 25x, they quantised into the
    # background greys and the "most saturated cluster" came out as slate
    # grey. Sample at up to 1200px on the long edge instead.
    im.thumbnail((1200, 1200))
    px = list(im.getdata())
    n = len(px)

    # saturation distribution
    sats = []
    hues = Counter()
    for r, g, b in px:
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        sats.append(s)
        if s >= 0.10 and v >= 0.08:
            hues[int(h * 360) // 20 * 20] += 1
    sat25 = sum(1 for s in sats if s >= 0.25) / n * 100
    sat03 = sum(1 for s in sats if s >= 0.03) / n * 100
    coloured = sum(hues.values())
    modal_bin, modal_count = hues.most_common(1)[0] if hues else (None, 0)

    # Dominant clusters via 4-bit-per-channel quantization. M036: report
    # each bin's MEAN colour, not its corner — the corner value dragged
    # every cluster toward grey (#F0F0F0, #606070) and threw away the
    # saturation the spec derivation is looking for.
    q = Counter()
    sums = {}
    for r, g, b in px:
        key = (r >> 4 << 4, g >> 4 << 4, b >> 4 << 4)
        q[key] += 1
        s = sums.setdefault(key, [0, 0, 0])
        s[0] += r; s[1] += g; s[2] += b
    clusters = []
    for c, cnt in q.most_common(k):
        s = sums[c]
        mean = [round(s[0] / cnt), round(s[1] / cnt), round(s[2] / cnt)]
        clusters.append({"rgb": mean, "hex": "#%02X%02X%02X" % tuple(mean), "share_pct": round(cnt / n * 100, 2)})

    print(json.dumps({
        "image": path,
        "sampled_px": n,
        "sat_ge_0.25_pct": round(sat25, 2),
        "sat_ge_0.03_pct": round(sat03, 2),
        "modal_hue_bin_deg": modal_bin,
        "hue_family_share_of_coloured_pct": round(modal_count / coloured * 100, 1) if coloured else 0,
        "clusters": clusters,
    }, indent=2))


if __name__ == "__main__":
    main()
