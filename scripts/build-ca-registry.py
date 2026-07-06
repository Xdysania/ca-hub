#!/usr/bin/env python3
"""
从 CA总表可公开.xlsx 生成 public/data/ca-registry.json
用法: python3 scripts/build-ca-registry.py [xlsx路径]
"""

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_XLSX = Path.home() / 'Downloads' / 'CA总表可公开.xlsx'
OUT_PATH = ROOT / 'public' / 'data' / 'ca-registry.json'

CN_TO_ISO = {
    '中国': 'CN', '中国香港': 'HK', '香港': 'HK', '丹麦': 'DK', '乌克兰': 'UA', '保加利亚': 'BG',
    '克罗地亚': 'HR', '冰岛': 'IS', '印度': 'IN', '印度尼西亚': 'ID', '哥伦比亚': 'CO', '墨西哥': 'MX',
    '多米尼加共和国': 'DO', '多米尼加': 'DO', '奥地利': 'AT', '巴西': 'BR', '希腊': 'GR', '德国': 'DE',
    '意大利': 'IT', '拉脱维亚': 'LV', '挪威': 'NO', '捷克': 'CZ', '捷克共和国': 'CZ', '斯洛文尼亚': 'SI',
    '新加坡': 'SG', '智利': 'CL', '比利时': 'BE', '法国': 'FR', '波兰': 'PL', '泰国': 'TH',
    '爱沙尼亚': 'EE', '瑞典': 'SE', '瑞士': 'CH', '立陶宛': 'LT', '罗马尼亚': 'RO', '美国': 'US',
    '芬兰': 'FI', '英国': 'GB', '荷兰': 'NL', '葡萄牙': 'PT', '西班牙': 'ES', '越南': 'VN',
    '阿联酋': 'AE', '马来西亚': 'MY', '爱尔兰': 'IE', '卢森堡': 'LU', '马耳他': 'MT', '塞浦路斯': 'CY',
    '加拿大': 'CA', '澳大利亚': 'AU', '新西兰': 'NZ', '日本': 'JP', '韩国': 'KR', '南非': 'ZA',
    '以色列': 'IL', '土耳其': 'TR', '沙特阿拉伯': 'SA', '埃及': 'EG', '尼日利亚': 'NG', '肯尼亚': 'KE',
    '阿根廷': 'AR', '秘鲁': 'PE', '匈牙利': 'HU', '斯洛伐克': 'SK', '塞尔维亚': 'RS', '俄罗斯': 'RU',
    '菲律宾': 'PH', '巴基斯坦': 'PK', '奥兰群岛': 'FI', '台湾': 'TW', '中国大陆': 'CN',
}

ISO_TO_REGION = {
    'US': 'North America', 'CA': 'North America', 'MX': 'Latin America', 'BR': 'Latin America',
    'CL': 'Latin America', 'CO': 'Latin America', 'AR': 'Latin America', 'PE': 'Latin America', 'DO': 'Latin America',
    'GB': 'Europe', 'IE': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'ES': 'Europe', 'PT': 'Europe',
    'IT': 'Europe', 'NL': 'Europe', 'BE': 'Europe', 'LU': 'Europe', 'AT': 'Europe', 'CH': 'Europe',
    'SE': 'Europe', 'NO': 'Europe', 'DK': 'Europe', 'FI': 'Europe', 'IS': 'Europe', 'PL': 'Europe',
    'CZ': 'Europe', 'SK': 'Europe', 'HU': 'Europe', 'RO': 'Europe', 'BG': 'Europe', 'GR': 'Europe',
    'HR': 'Europe', 'SI': 'Europe', 'RS': 'Europe', 'EE': 'Europe', 'LV': 'Europe', 'LT': 'Europe', 'UA': 'Europe',
    'CN': 'Asia Pacific', 'HK': 'Asia Pacific', 'TW': 'Asia Pacific', 'JP': 'Asia Pacific', 'KR': 'Asia Pacific',
    'IN': 'Asia Pacific', 'ID': 'Asia Pacific', 'SG': 'Asia Pacific', 'MY': 'Asia Pacific', 'TH': 'Asia Pacific',
    'VN': 'Asia Pacific', 'PH': 'Asia Pacific', 'PK': 'Asia Pacific', 'AU': 'Asia Pacific', 'NZ': 'Asia Pacific',
    'AE': 'Middle East & Africa', 'ZA': 'Middle East & Africa', 'IL': 'Middle East & Africa', 'TR': 'Middle East & Africa',
    'EG': 'Middle East & Africa', 'NG': 'Middle East & Africa', 'KE': 'Middle East & Africa',
}

ISO_NAMES = {
    'CN': 'China', 'HK': 'Hong Kong', 'DK': 'Denmark', 'UA': 'Ukraine', 'BG': 'Bulgaria', 'HR': 'Croatia',
    'IS': 'Iceland', 'IN': 'India', 'ID': 'Indonesia', 'CO': 'Colombia', 'MX': 'Mexico', 'DO': 'Dominican Republic',
    'AT': 'Austria', 'BR': 'Brazil', 'GR': 'Greece', 'DE': 'Germany', 'IT': 'Italy', 'LV': 'Latvia', 'NO': 'Norway',
    'CZ': 'Czech Republic', 'SI': 'Slovenia', 'SG': 'Singapore', 'CL': 'Chile', 'BE': 'Belgium', 'FR': 'France',
    'PL': 'Poland', 'TH': 'Thailand', 'EE': 'Estonia', 'SE': 'Sweden', 'CH': 'Switzerland', 'LT': 'Lithuania',
    'RO': 'Romania', 'US': 'United States', 'FI': 'Finland', 'GB': 'United Kingdom', 'NL': 'Netherlands',
    'PT': 'Portugal', 'ES': 'Spain', 'VN': 'Vietnam', 'AE': 'United Arab Emirates', 'MY': 'Malaysia',
    'IE': 'Ireland', 'TW': 'Taiwan', 'CA': 'Canada', 'AU': 'Australia', 'JP': 'Japan', 'KR': 'South Korea',
    'IL': 'Israel', 'TR': 'Turkey', 'ZA': 'South Africa', 'AR': 'Argentina', 'PE': 'Peru', 'HU': 'Hungary',
    'SK': 'Slovakia', 'RS': 'Serbia', 'RU': 'Russia', 'PH': 'Philippines', 'PK': 'Pakistan',
}

REGION_CN = {
    '欧洲': 'Europe', '北美洲': 'North America', '拉丁美洲': 'Latin America', '亚太地区': 'Asia Pacific',
    '中东与非洲': 'Middle East & Africa', '亚洲': 'Asia Pacific', '非洲': 'Middle East & Africa',
}


def slugify(name: str) -> str:
    s = re.sub(r'[^\w\s-]', '', name.lower())
    s = re.sub(r'[\s_]+', '-', s.strip())
    s = re.sub(r'-+', '-', s)
    return s[:80] or 'provider'


def parse_countries(text: str, origin: str) -> list[str]:
    text = str(text or '').strip()
    origin_clean = re.sub(r'\s*\([^)]*\)', '', str(origin or '')).strip()
    found = []
    for cn in sorted(CN_TO_ISO.keys(), key=len, reverse=True):
        if cn in text:
            found.append(CN_TO_ISO[cn])
    found = list(dict.fromkeys(found))
    if found:
        return found
    if not text or re.search(r'全球|world|EU-wide|欧盟|绝大多数|大部分国家|http', text, re.I):
        iso = CN_TO_ISO.get(origin_clean)
        return [iso] if iso else []
    iso = CN_TO_ISO.get(text) or CN_TO_ISO.get(origin_clean)
    return [iso] if iso else []


def map_category(ca_type: str, tag: str) -> str:
    t = str(ca_type or '')
    tag = str(tag or '')
    if 'IdP' in t or '身份' in tag:
        return 'EID AUTHENTICATION'
    return 'ESIGNATURE'


def map_sig(level: str) -> list[str]:
    level = str(level or '').upper()
    out = []
    if 'QES' in level:
        out.append('QES')
    if 'AES' in level or 'ADES' in level:
        out.append('AES')
    if 'EID' in level or '身份' in level:
        out.append('eID')
    return out or ['AES']


def read_xlsx(path: Path) -> list[dict]:
    ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    with zipfile.ZipFile(path) as z:
        shared = []
        root = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in root.findall('m:si', ns):
            shared.append(''.join((t.text or '') for t in si.findall('.//m:t', ns)))
        sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = []
        for row in sheet.findall('m:sheetData/m:row', ns):
            vals = []
            for c in row.findall('m:c', ns):
                v = c.find('m:v', ns)
                if v is None:
                    vals.append('')
                else:
                    vals.append(shared[int(v.text)] if c.get('t') == 's' else v.text)
            rows.append(vals)
    headers = rows[0]
    return [{headers[i]: (r[i] if i < len(r) else '') for i in range(len(headers))} for r in rows[1:]]


def build_registry(xlsx_path: Path) -> dict:
    providers = []
    country_map = {}
    skipped = []

    for row in read_xlsx(xlsx_path):
        name = str(row.get('CA名称', '')).strip()
        if not name:
            continue
        origin = str(row.get('来源国家', '')).strip()
        region_cn = str(row.get('CA区域', '')).strip()
        countries_iso = parse_countries(str(row.get('支持的国家', '')), origin)
        if not countries_iso:
            skipped.append(name)
            continue
        desc = str(row.get('CA介绍', '')).strip()
        website = str(row.get('官方网址', '')).split('\n')[0].strip()
        base_slug = slugify(name)
        slug = base_slug
        n = 2
        while any(p['slug'] == slug for p in providers):
            slug = f'{base_slug}-{n}'
            n += 1
        region = REGION_CN.get(region_cn, 'Europe')
        providers.append({
            'slug': slug,
            'name': name,
            'category': map_category(row.get('CA类型', ''), row.get('CA标签', '')),
            'providerType': str(row.get('CA类型', '') or 'CA'),
            'cardSummary': {'en': desc, 'zh': desc},
            'countries': countries_iso,
            'signatureLevels': map_sig(row.get('签名等级', '')),
            'status': 'Available',
            'featured': len(providers) < 12,
            'sortOrder': len(providers) + 1,
            'tag': str(row.get('CA标签', '')),
            'originCountry': origin,
            'region': region,
            'website': website,
            'learnMoreUrl': website if website.startswith('http') else None,
            'hashSigning': str(row.get('Hash签名', '')),
            'enterpriseCert': str(row.get('企业证书', '')),
        })
        for iso in countries_iso:
            if iso not in country_map:
                country_map[iso] = {
                    'iso2': iso,
                    'name': ISO_NAMES.get(iso, iso),
                    'region': ISO_TO_REGION.get(iso, 'Europe'),
                    'enabled': True,
                    'sortOrder': len(country_map) + 1,
                }

    countries = sorted(country_map.values(), key=lambda x: x['name'])
    return {
        'countries': countries,
        'providers': providers,
        'meta': {
            'generatedAt': __import__('datetime').date.today().isoformat(),
            'source': xlsx_path.name,
            'skipped': skipped,
        },
    }


def main():
    xlsx = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSX
    if not xlsx.exists():
        raise SystemExit(f'找不到文件: {xlsx}')
    data = build_registry(xlsx)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'已写入 {OUT_PATH}')
    print(f'国家 {len(data["countries"])} 个, Provider {len(data["providers"])} 个')


if __name__ == '__main__':
    main()
