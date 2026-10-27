#!/usr/bin/env python3
"""structure.py — structural evidence from a single reference image.

MISSION 025, Phase 3. The existing pipeline measured colour and nothing else:
saturation, hue, light share. Layout, hierarchy, density and spacing were all
inferred from a three-way archetype or simply authored by hand.

This extracts what a single screenshot can actually support, and nothing more:

  observed   measured from pixels — band segmentation, column estimates,
             whitespace ratio, edge density, colour shares
  inferred   derived by a stated rule from the observed values

It deliberately does NOT report responsive behaviour, typography identity or
interaction states. One flat collage cannot support those, and the mission
forbids fabricating them.

Usage: python3 structure.py <image> [--json]
"""
import json
import sys

from PIL import Image
import numpy as np


def analyse(path):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    a = np.asarray(im, dtype=np.float32)
    lum = (0.2126 * a[:, :, 0] + 0.7152 * a[:, :, 1] + 0.0722 * a[:, :, 2]) / 255.0

    # ---- row-band segmentation -------------------------------------------
    # A band is a contiguous run of rows with above-average visual activity.
    row_act = np.abs(np.diff(lum, axis=1)).mean(axis=1)
    thr = row_act.mean() + row_act.std() * 0.10
    active = row_act > thr
    bands = []
    start = None
    for i, v in enumerate(active):
        if v and start is None:
            start = i
        elif not v and start is not None:
            if i - start >= max(4, h // 200):
                bands.append((start, i))
            start = None
    if start is not None and h - start >= max(4, h // 200):
        bands.append((start, h))
    band_info = []
    for (y0, y1) in bands:
        seg = lum[y0:y1, :]
        col_act = np.abs(np.diff(seg, axis=0)).mean(axis=0)
        cthr = col_act.mean() + col_act.std() * 0.5
        cols = int((col_act > cthr).sum())
        band_info.append({
            "y0": int(y0), "y1": int(y1), "heightPct": round((y1 - y0) / h * 100, 1),
            "edgeColumns": cols,
        })

    # ---- repeated-block detection ----------------------------------------
    # A card grid or a row list repeats blocks of similar height. Detect the
    # period of that repetition from the row-activity autocorrelation; this is
    # a measurement of vertical periodicity, not a claim about what the blocks
    # contain.
    sig = row_act - row_act.mean()
    ac = np.correlate(sig, sig, mode="full")[len(sig) - 1:]
    ac = ac / (ac[0] + 1e-9)
    lo, hi = max(8, h // 40), min(len(ac) - 1, h // 3)
    period = None
    if hi > lo:
        seg = ac[lo:hi]
        k = int(np.argmax(seg))
        if seg[k] > 0.25:
            period = int(lo + k)
    repeat_count = int(round(h / period)) if period else 0

    # ---- media vs text balance -------------------------------------------
    # Large regions with almost no horizontal edge activity are flat: in these
    # boards that is usually a photo or a colour field. Fine, frequent edges
    # are text. The ratio is a crude but real measurement.
    win = max(8, h // 80)
    flat = (np.abs(np.diff(lum, axis=1)).mean(axis=1) < 0.012).mean()
    texty = (np.abs(np.diff(lum, axis=1)).mean(axis=1) > 0.05).mean()

    # ---- vertical grid columns -------------------------------------------
    col_act = np.abs(np.diff(lum, axis=0)).mean(axis=0)
    cthr = col_act.mean() + col_act.std() * 1.2
    col_peaks = int((col_act > cthr).sum())
    gutter_frac = float((col_act < col_act.mean() * 0.5).mean())

    # ---- navigation prominence -------------------------------------------
    top = lum[: max(1, h // 12), :]
    top_activity = float(np.abs(np.diff(top, axis=1)).mean()) if top.size else 0.0
    body_activity = float(np.abs(np.diff(lum, axis=1)).mean())

    # ---- whitespace and detail -------------------------------------------
    near_white = float((lum > 0.94).mean())
    edges = float(np.abs(np.diff(lum, axis=1)).mean())
    flat_regions = float((np.abs(np.diff(lum, axis=1)) < 0.01).mean())

    # ---- colour ----------------------------------------------------------
    small = im.resize((96, 96))
    px = np.asarray(small).reshape(-1, 3)
    q = (px // 24 * 24).astype(np.uint8)
    uniq, counts = np.unique(q, axis=0, return_counts=True)
    order = np.argsort(-counts)[:6]
    clusters = [{"hex": "#%02X%02X%02X" % tuple(int(c) for c in uniq[i]),
                 "sharePct": round(float(counts[i]) / len(px) * 100, 1)} for i in order]

    mx = px.max(axis=1).astype(np.float32)
    mn = px.min(axis=1).astype(np.float32)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    saturated = float((sat >= 0.25).mean() * 100)
    light_share = float((lum > 0.7).mean() * 100)

    return {
        "image": path,
        "canvas": {"w": w, "h": h, "aspect": round(w / h, 3)},
        "observed": {
            "bandCount": len(band_info),
        # A tall marketing collage is a grid of screens, not a single page, so
        # band segmentation is approximate on those. Stated, not hidden.
        "segmentationConfidence": ("low" if h / w > 4 else "medium" if h / w > 1.6 else "high"),
            "bands": band_info,
            "whitespacePct": round(near_white * 100, 1),
            "edgeDensity": round(edges, 4),
            "flatRegionPct": round(flat_regions * 100, 1),
            "clusters": clusters,
            "saturatedPct": round(saturated, 2),
            "lightPct": round(light_share, 1),
            "repeatedBlockPeriodPx": period,
            "repeatedBlockCount": repeat_count,
            "flatRegionPct2": round(float(flat) * 100, 1),
            "textEdgePct": round(float(texty) * 100, 1),
            "columnEdgeCount": col_peaks,
            "gutterFraction": round(gutter_frac, 3),
            "topBandActivityRatio": round(top_activity / (body_activity + 1e-9), 3),
        },
    }


def infer(obs):
    """Rules applied to observed values. Every output names its basis."""
    out = {}
    bands = obs["bandCount"]
    out["layoutPattern"] = {
        "value": ("grid-collage" if bands >= 6 else "stacked-sections" if bands >= 3 else "single-surface"),
        "basis": f"{bands} horizontal activity bands",
        "kind": "inferred",
    }
    ws = obs["whitespacePct"]
    out["density"] = {
        "value": "airy" if ws >= 60 else "dense" if ws <= 30 else "moderate",
        "basis": f"{ws}% near-white pixels",
        "kind": "inferred",
    }
    ed = obs["edgeDensity"]
    out["detail"] = {
        "value": "high" if ed >= 0.06 else "low" if ed <= 0.02 else "medium",
        "basis": f"mean horizontal edge {ed}",
        "kind": "inferred",
    }
    # repetition -> the reference shows a repeated block pattern or a single surface
    rc = obs.get("repeatedBlockCount") or 0
    out["repetition"] = {
        "value": ("repeating-blocks" if rc >= 4 else "few-blocks" if rc >= 2 else "single-surface"),
        "basis": f"vertical periodicity gives ~{rc} repeated blocks of {obs.get('repeatedBlockPeriodPx')}px",
        "kind": "inferred",
        "confidence": "medium" if rc >= 2 else "low",
    }
    # media vs text
    flat2 = obs.get("flatRegionPct2", 0)
    out["mediaBalance"] = {
        "value": ("media-led" if flat2 >= 55 else "text-led" if flat2 <= 30 else "mixed"),
        "basis": f"{flat2}% of rows are flat (photo/colour field proxy) against {obs.get('textEdgePct')}% text-dense rows",
        "kind": "inferred",
        "confidence": "low",
    }
    # grid columns
    cols = obs.get("columnEdgeCount", 0)
    out["gridStructure"] = {
        "value": ("multi-column" if cols >= 6 else "two-column" if cols >= 3 else "single-column"),
        "basis": f"{cols} strong vertical edges, gutter fraction {obs.get('gutterFraction')}",
        "kind": "inferred",
        "confidence": "low",
    }
    out["navigationProminence"] = {
        "value": ("prominent-header" if obs.get("topBandActivityRatio", 0) > 1.1 else "quiet-header"),
        "basis": f"top-band activity is {obs.get('topBandActivityRatio')}x the body average",
        "kind": "inferred",
        "confidence": "low",
    }
    out["paletteRegister"] = {
        "value": ("committed" if obs["saturatedPct"] >= 25 else "neutral" if obs["saturatedPct"] < 8 else "mixed"),
        "basis": f"{obs['saturatedPct']}% of pixels at saturation >= 0.25",
        "kind": "inferred",
    }
    return out


UNKNOWABLE = [
    "what any block contains — periodicity measures repetition, not semantics",
    "whether a flat region is a photograph, an illustration or a colour field",
    "interaction affordances and their placement",
    "responsive behaviour across breakpoints — a single flat collage shows one width",
    "typography identity (typeface, weights, tracking) — pixels do not carry font names",
    "interaction states (hover, focus, disabled, error) — a static board shows none",
    "copy tone and content hierarchy beyond block position",
    "spacing rhythm in absolute units — no scale reference is present",
]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: structure.py <image>", file=sys.stderr)
        sys.exit(2)
    r = analyse(sys.argv[1])
    r["inferred"] = infer(r["observed"])
    r["unknowable"] = UNKNOWABLE
    print(json.dumps(r, indent=2))
