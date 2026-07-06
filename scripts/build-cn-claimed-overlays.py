#!/usr/bin/env python3
"""
从 Natural Earth 50m 争议区提取中国主张领土面，生成 cn-claimed-territories.geojson。

数据源：ne_50m_admin_0_breakaway_disputed_areas（Public Domain）
筛选条件：properties.ADM0_A3_CN === 'CHN'（含藏南/South Tibet、阿克赛钦等）
"""

from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

SOURCE_URL = (
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/"
    "master/geojson/ne_50m_admin_0_breakaway_disputed_areas.geojson"
)
ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "public" / "data" / "cn-claimed-territories.geojson"


def slugify(value: str) -> str:
    """@param {str} value @returns {str}"""
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def main() -> None:
    with urllib.request.urlopen(SOURCE_URL, timeout=60) as response:
        data = json.load(response)

    features = []
    for feature in data.get("features", []):
        props = feature.get("properties") or {}
        if props.get("ADM0_A3_CN") != "CHN":
            continue

        brk_name = props.get("BRK_NAME") or props.get("NAME") or "claimed-area"
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "id": slugify(brk_name),
                    "name": props.get("NAME_ALT") or brk_name,
                    "brkName": brk_name,
                    "note": props.get("NOTE_BRK"),
                    "source": "Natural Earth 50m disputed areas (China claim)",
                },
                "geometry": feature["geometry"],
            }
        )

    output = {
        "type": "FeatureCollection",
        "name": "cn-claimed-territories",
        "metadata": {
            "source": "nvkelso/natural-earth-vector ne_50m_admin_0_breakaway_disputed_areas",
            "license": "Public Domain",
            "criteria": "ADM0_A3_CN === CHN",
            "includes": [
                "Arunachal Pradesh (South Tibet / 藏南)",
                "Aksai Chin",
                "Demchok and other China-India western disputed valleys",
                "Shaksgam Valley",
            ],
        },
        "features": features,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(features)} features to {OUT_PATH}")


if __name__ == "__main__":
    main()
