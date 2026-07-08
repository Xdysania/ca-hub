#!/usr/bin/env python3
"""
从 eideasy.com 抓取 Provider Integrations 全量数据并生成 provider-integrations.json。

数据来源：
- sitemap.xml → 全部 /supported-methods/* 页面
- 各详情页 → 名称、简介、Logo、国家（ISO2）、类别

用法: python3 scripts/scrape-eideasy-providers.py
"""

from __future__ import annotations

import html as htmlmod
import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / 'public' / 'data' / 'provider-integrations.json'
REGISTRY_PATH = ROOT / 'public' / 'data' / 'ca-registry.json'
SITEMAP_URL = 'https://www.eideasy.com/sitemap.xml'
BASE_URL = 'https://www.eideasy.com/supported-methods/'
SOURCE_URL = 'https://www.eideasy.com/provider-integrations'

NAME_OVERRIDES = {
    'Åland Islands': 'AX',
    'Russian Federation': 'RU',
    'Korea, Republic of': 'KR',
    'Korea, Democratic People\'s Republic of': 'KP',
    'Bolivia, Plurinational State of': 'BO',
    'Venezuela, Bolivarian Republic of': 'VE',
    'Moldova, Republic of': 'MD',
    'Taiwan, Province of China': 'TW',
    'Tanzania, United Republic of': 'TZ',
    'Czech Republic': 'CZ',
    'Dominican Republic': 'DO',
    'United States': 'US',
    'United Kingdom': 'GB',
    'United Arab Emirates': 'AE',
}

EUDIW_SLUG_HINTS = ('eudiw', 'wallet', 'valera')

DESCRIPTION_COUNTRY_HINTS = (
    ('dominican republic', 'DO'),
    ('bulgarian', 'BG'),
    ('belgian', 'BE'),
    ('belgium', 'BE'),
    ('portugal', 'PT'),
    ('portuguese', 'PT'),
    ('croatian', 'HR'),
    ('croatia', 'HR'),
    ('czech', 'CZ'),
    ('ukraine', 'UA'),
    ('ukrainian', 'UA'),
    ('iceland', 'IS'),
    ('greece', 'GR'),
    ('greek', 'GR'),
    ('romania', 'RO'),
    ('romanian', 'RO'),
    ('germany', 'DE'),
    ('german', 'DE'),
    ('estonia', 'EE'),
    ('estonian', 'EE'),
    ('latvia', 'LV'),
    ('latvian', 'LV'),
    ('lithuania', 'LT'),
    ('lithuanian', 'LT'),
    ('finland', 'FI'),
    ('finnish', 'FI'),
    ('sweden', 'SE'),
    ('swedish', 'SE'),
    ('norway', 'NO'),
    ('norwegian', 'NO'),
    ('denmark', 'DK'),
    ('danish', 'DK'),
    ('switzerland', 'CH'),
    ('swiss', 'CH'),
    ('chile', 'CL'),
    ('poland', 'PL'),
    ('polish', 'PL'),
    ('vietnam', 'VN'),
    ('vietnamese', 'VN'),
    ('china', 'CN'),
    ('chinese', 'CN'),
    ('malaysia', 'MY'),
    ('mexico', 'MX'),
    ('mexican', 'MX'),
    ('serbia', 'RS'),
    ('serbian', 'RS'),
    ('brazil', 'BR'),
    ('india', 'IN'),
    ('spain', 'ES'),
    ('spanish', 'ES'),
    ('italy', 'IT'),
    ('italian', 'IT'),
    ('france', 'FR'),
    ('french', 'FR'),
    ('netherlands', 'NL'),
    ('dutch', 'NL'),
    ('austria', 'AT'),
    ('australian', 'AU'),
    ('australia', 'AU'),
    ('united kingdom', 'GB'),
    ('united states', 'US'),
)


def fetch(url: str, retries: int = 3) -> str:
    """@param {string} url @returns {string}"""
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 CA-Hub-Scraper/1.0'})
    last_error = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=45) as response:
                return response.read().decode('utf-8', errors='replace')
        except (urllib.error.URLError, TimeoutError) as error:
            last_error = error
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f'Failed to fetch {url}: {last_error}')


def load_name_to_iso() -> dict[str, str]:
    """@returns {dict[str, str]}"""
    mapping = dict(NAME_OVERRIDES)
    if REGISTRY_PATH.exists():
        registry = json.loads(REGISTRY_PATH.read_text(encoding='utf-8'))
        for country in registry.get('countries', []):
            name = str(country.get('name', '')).strip()
            iso2 = str(country.get('iso2', '')).strip().upper()
            if name and iso2:
                mapping[name] = iso2
    return mapping


def slugify(name: str) -> str:
    """@param {string} name @returns {string}"""
    value = re.sub(r'[^\w\s-]', '', name.lower())
    value = re.sub(r'[\s_]+', '-', value.strip())
    return re.sub(r'-+', '-', value)[:80] or 'provider'


def infer_category(slug: str, action: str, html: str) -> str:
    """@param {string} slug @param {string} action @param {string} html @returns {string}"""
    slug_lower = slug.lower()
    action_lower = action.lower()

    if any(hint in slug_lower for hint in EUDIW_SLUG_HINTS) or 'eudiw' in action_lower:
        return 'EUDIW'

    signature_level = re.search(
        r'Signature level</div><div class="provider_meta_text">([^<]+)',
        html,
    )
    has_signature_level = bool(signature_level and signature_level.group(1).strip())

    if has_signature_level or any(token in action_lower for token in ('signature', 'sign-me', 'qes', 'seal')):
        return 'ESIGNATURE'

    if any(token in action_lower for token in ('login', 'auth', 'eid-login', 'ident')):
        return 'EID AUTHENTICATION'

    if 'login' in slug_lower:
        return 'EID AUTHENTICATION'

    return 'ESIGNATURE'


def infer_countries_from_description(description: str) -> list[str]:
    """@param {string} description @returns {list[str]}"""
    text = description.lower()
    found: list[str] = []
    for hint, iso2 in DESCRIPTION_COUNTRY_HINTS:
        if hint in text and iso2 not in found:
            found.append(iso2)
    return found


def extract_countries(html: str, description: str, name_to_iso: dict[str, str]) -> tuple[list[str], list[str]]:
    """@param {string} html @param {string} description @param {dict} name_to_iso @returns {tuple}"""
    coverage_match = re.search(
        r'Demographic Coverage</div>.*?Support</div>',
        html,
        re.DOTALL,
    )
    scope = coverage_match.group(0) if coverage_match else html

    iso_codes = re.findall(
        r'class="country_item w-dyn-item"><div class="text-style-allcaps">([^<]+)</div>',
        scope,
    )
    country_names = re.findall(r'fs-list-field="Country"[^>]*>([^<]+)<', scope)

    countries: list[str] = []
    for code in iso_codes:
        normalized = code.strip().upper()
        if re.fullmatch(r'[A-Z]{2}', normalized) and normalized not in countries:
            countries.append(normalized)

    resolved_names: list[str] = []
    if not countries:
        for name in country_names:
            normalized_name = htmlmod.unescape(name.strip())
            resolved_names.append(normalized_name)
            iso2 = name_to_iso.get(normalized_name)
            if iso2 and iso2 not in countries:
                countries.append(iso2)

    if not countries:
        countries = infer_countries_from_description(description)

    return countries, resolved_names


def parse_provider_page(html: str, slug: str, name_to_iso: dict[str, str]) -> dict:
    """@param {string} html @param {string} slug @param {dict} name_to_iso @returns {dict}"""
    name_match = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
    intro_match = re.search(
        r'<h1[^>]*>[^<]+</h1>.*?<p class="text-size-large">([^<]+)',
        html,
        re.DOTALL,
    )
    meta_match = re.search(r'content="([^"]+)" name="description"', html)
    logo_match = re.search(r'class="provider_meta_logo"[^>]*src="([^"]+)"', html)
    if not logo_match:
        logo_match = re.search(r'class="providers_logo"[^>]*src="([^"]+)"', html)

    action_match = re.search(r'Action type</div><div class="provider_meta_text">([^<]+)', html)
    action = action_match.group(1).strip() if action_match else ''

    name = htmlmod.unescape(name_match.group(1).strip()) if name_match else slug
    if intro_match:
        description = htmlmod.unescape(intro_match.group(1).strip())
    elif meta_match:
        description = htmlmod.unescape(meta_match.group(1).strip())
    else:
        description = ''

    countries, country_names = extract_countries(html, description, name_to_iso)

    return {
        'slug': slug or slugify(name),
        'name': name,
        'category': infer_category(slug, action, html),
        'cardSummary': {
            'en': description,
            'zh': description,
            'zh-HK': description,
        },
        'countries': countries,
        'countryNames': country_names,
        'logo': logo_match.group(1) if logo_match else None,
        'featured': False,
        'sortOrder': 0,
        'status': 'Available',
        'learnMoreUrl': f'{BASE_URL}{slug}',
        'actionType': action or None,
    }


def get_supported_method_slugs() -> list[str]:
    """@returns {list[str]}"""
    xml = fetch(SITEMAP_URL)
    urls = re.findall(r'<loc>(https://www\.eideasy\.com/supported-methods/[^<]+)</loc>', xml)
    slugs: list[str] = []
    seen = set()
    for url in urls:
        if '/es/' in url:
            continue
        slug = url.rstrip('/').split('/')[-1]
        if slug and slug not in seen:
            seen.add(slug)
            slugs.append(slug)
    return slugs


def main() -> None:
    name_to_iso = load_name_to_iso()
    slugs = get_supported_method_slugs()
    providers: list[dict] = []
    errors: list[str] = []

    print(f'Fetching {len(slugs)} providers from {SOURCE_URL} ...')

    for index, slug in enumerate(slugs, start=1):
        url = f'{BASE_URL}{slug}'
        try:
            html = fetch(url)
            provider = parse_provider_page(html, slug, name_to_iso)
            provider['sortOrder'] = index
            provider['featured'] = index <= 15
            providers.append(provider)
            print(f'[{index}/{len(slugs)}] {provider["name"]} ({len(provider["countries"])} countries)')
        except Exception as error:  # noqa: BLE001 - collect per-item scrape failures
            errors.append(f'{slug}: {error}')
            print(f'[{index}/{len(slugs)}] ERROR {slug}: {error}')
        time.sleep(0.15)

    payload = {
        'meta': {
            'source': SOURCE_URL,
            'generatedAt': time.strftime('%Y-%m-%d'),
            'providerCount': len(providers),
            'errors': errors,
        },
        'providers': providers,
    }

    OUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'Wrote {len(providers)} providers to {OUT_PATH}')


if __name__ == '__main__':
    main()
