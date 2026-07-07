/**
 * 地图国家名 → ISO2 映射（适配 world-map.json 中的 name 字段）
 */
export const NAME_TO_ISO = {
  Afghanistan: 'AF',
  Albania: 'AL',
  Algeria: 'DZ',
  Andorra: 'AD',
  'Antigua and Barb.': 'AG',
  Angola: 'AO',
  Argentina: 'AR',
  Armenia: 'AM',
  Australia: 'AU',
  Austria: 'AT',
  Azerbaijan: 'AZ',
  Bahamas: 'BS',
  Bahrain: 'BH',
  Bangladesh: 'BD',
  Barbados: 'BB',
  Belarus: 'BY',
  Belgium: 'BE',
  Belize: 'BZ',
  Benin: 'BJ',
  Bhutan: 'BT',
  Bolivia: 'BO',
  'Bosnia and Herz.': 'BA',
  Botswana: 'BW',
  Brazil: 'BR',
  Brunei: 'BN',
  Bulgaria: 'BG',
  'Burkina Faso': 'BF',
  Burundi: 'BI',
  'Cabo Verde': 'CV',
  Cambodia: 'KH',
  Cameroon: 'CM',
  Canada: 'CA',
  'Central African Rep.': 'CF',
  Chad: 'TD',
  Chile: 'CL',
  China: 'CN',
  Colombia: 'CO',
  Comoros: 'KM',
  Congo: 'CG',
  'Cook Is.': 'CK',
  'Costa Rica': 'CR',
  Croatia: 'HR',
  Cuba: 'CU',
  Cyprus: 'CY',
  Czechia: 'CZ',
  "Côte d'Ivoire": 'CI',
  'Dem. Rep. Congo': 'CD',
  Denmark: 'DK',
  Djibouti: 'DJ',
  Dominica: 'DM',
  'Dominican Rep.': 'DO',
  Ecuador: 'EC',
  Egypt: 'EG',
  'El Salvador': 'SV',
  'Eq. Guinea': 'GQ',
  Eritrea: 'ER',
  Estonia: 'EE',
  Ethiopia: 'ET',
  Fiji: 'FJ',
  Finland: 'FI',
  France: 'FR',
  Gabon: 'GA',
  Gambia: 'GM',
  Georgia: 'GE',
  Germany: 'DE',
  Ghana: 'GH',
  Greece: 'GR',
  Grenada: 'GD',
  Greenland: 'GL',
  Guatemala: 'GT',
  Guinea: 'GN',
  'Guinea-Bissau': 'GW',
  Guyana: 'GY',
  Haiti: 'HT',
  Honduras: 'HN',
  'Hong Kong': 'HK',
  Hungary: 'HU',
  Iceland: 'IS',
  India: 'IN',
  Indonesia: 'ID',
  Iran: 'IR',
  Iraq: 'IQ',
  Ireland: 'IE',
  Israel: 'IL',
  Italy: 'IT',
  Jamaica: 'JM',
  Japan: 'JP',
  Jordan: 'JO',
  Kazakhstan: 'KZ',
  Kenya: 'KE',
  Kiribati: 'KI',
  Kosovo: 'XK',
  Kuwait: 'KW',
  Kyrgyzstan: 'KG',
  Laos: 'LA',
  Latvia: 'LV',
  Lebanon: 'LB',
  Lesotho: 'LS',
  Liberia: 'LR',
  Libya: 'LY',
  Lithuania: 'LT',
  Luxembourg: 'LU',
  Macao: 'MO',
  Macedonia: 'MK',
  Madagascar: 'MG',
  Malawi: 'MW',
  Malaysia: 'MY',
  Maldives: 'MV',
  Mali: 'ML',
  Malta: 'MT',
  'Marshall Is.': 'MH',
  Mauritius: 'MU',
  Mauritania: 'MR',
  Mexico: 'MX',
  Micronesia: 'FM',
  Moldova: 'MD',
  Monaco: 'MC',
  Mongolia: 'MN',
  Montenegro: 'ME',
  Morocco: 'MA',
  Mozambique: 'MZ',
  Myanmar: 'MM',
  Nauru: 'NR',
  Namibia: 'NA',
  Nepal: 'NP',
  Netherlands: 'NL',
  'New Zealand': 'NZ',
  Nicaragua: 'NI',
  Niger: 'NE',
  Nigeria: 'NG',
  'North Korea': 'KP',
  Norway: 'NO',
  Oman: 'OM',
  Pakistan: 'PK',
  Palau: 'PW',
  Palestine: 'PS',
  Panama: 'PA',
  'Papua New Guinea': 'PG',
  Paraguay: 'PY',
  Peru: 'PE',
  Philippines: 'PH',
  Poland: 'PL',
  Portugal: 'PT',
  Qatar: 'QA',
  Romania: 'RO',
  Russia: 'RU',
  Rwanda: 'RW',
  'Saint Lucia': 'LC',
  Samoa: 'WS',
  'San Marino': 'SM',
  'São Tomé and Principe': 'ST',
  'S. Sudan': 'SS',
  'Saudi Arabia': 'SA',
  Senegal: 'SN',
  Serbia: 'RS',
  Seychelles: 'SC',
  'Sierra Leone': 'SL',
  Singapore: 'SG',
  'Solomon Is.': 'SB',
  Slovakia: 'SK',
  Slovenia: 'SI',
  Somalia: 'SO',
  'South Africa': 'ZA',
  'South Korea': 'KR',
  Spain: 'ES',
  'Sri Lanka': 'LK',
  'St. Kitts and Nevis': 'KN',
  'St. Vin. and Gren.': 'VC',
  Sudan: 'SD',
  Suriname: 'SR',
  Sweden: 'SE',
  Switzerland: 'CH',
  Syria: 'SY',
  Tajikistan: 'TJ',
  Tanzania: 'TZ',
  Thailand: 'TH',
  'Timor-Leste': 'TL',
  Togo: 'TG',
  Tonga: 'TO',
  'Trinidad and Tobago': 'TT',
  Tunisia: 'TN',
  Turkey: 'TR',
  Turkmenistan: 'TM',
  Uganda: 'UG',
  Ukraine: 'UA',
  'United Arab Emirates': 'AE',
  'United Kingdom': 'GB',
  'United States of America': 'US',
  Uruguay: 'UY',
  Uzbekistan: 'UZ',
  Vanuatu: 'VU',
  Venezuela: 'VE',
  Vietnam: 'VN',
  Yemen: 'YE',
  Zambia: 'ZM',
  Zimbabwe: 'ZW',
  eSwatini: 'SZ'
}

/** ISO2 → 地图展示区域 ID（8 区，对齐 Ramp Browse regions） */
export const REGION_IDS = [
  'africa',
  'asia',
  'caribbean-central-america',
  'europe',
  'middle-east',
  'north-america',
  'south-america',
  'oceania'
]

export const ISO_TO_REGION = {
  US: 'north-america', CA: 'north-america', MX: 'north-america', GL: 'north-america',
  GT: 'caribbean-central-america', BZ: 'caribbean-central-america', SV: 'caribbean-central-america',
  HN: 'caribbean-central-america', NI: 'caribbean-central-america', CR: 'caribbean-central-america',
  PA: 'caribbean-central-america', CU: 'caribbean-central-america', DO: 'caribbean-central-america',
  HT: 'caribbean-central-america', JM: 'caribbean-central-america', TT: 'caribbean-central-america',
  BB: 'caribbean-central-america', AG: 'caribbean-central-america', DM: 'caribbean-central-america',
  GD: 'caribbean-central-america', KN: 'caribbean-central-america', LC: 'caribbean-central-america',
  VC: 'caribbean-central-america', BS: 'caribbean-central-america',
  BR: 'south-america', AR: 'south-america', CL: 'south-america', CO: 'south-america',
  PE: 'south-america', VE: 'south-america', EC: 'south-america', BO: 'south-america',
  PY: 'south-america', UY: 'south-america', GY: 'south-america', SR: 'south-america',
  GB: 'europe', IE: 'europe', FR: 'europe', DE: 'europe', ES: 'europe', PT: 'europe',
  IT: 'europe', NL: 'europe', BE: 'europe', LU: 'europe', AT: 'europe', CH: 'europe',
  SE: 'europe', NO: 'europe', DK: 'europe', FI: 'europe', IS: 'europe', PL: 'europe',
  CZ: 'europe', SK: 'europe', HU: 'europe', RO: 'europe', BG: 'europe', GR: 'europe',
  HR: 'europe', SI: 'europe', RS: 'europe', BA: 'europe', ME: 'europe', MK: 'europe',
  AL: 'europe', EE: 'europe', LV: 'europe', LT: 'europe', XK: 'europe', CY: 'europe',
  MT: 'europe', AD: 'europe', MC: 'europe', SM: 'europe',
  /** 波兰–罗马尼亚以东：不计入欧洲批量高亮（对齐 Ramp 全球视图） */
  RU: 'asia', BY: 'asia', UA: 'asia', MD: 'asia',
  CN: 'asia', JP: 'asia', KR: 'asia', TW: 'asia', HK: 'asia', MO: 'asia',
  IN: 'asia', PK: 'asia', BD: 'asia', TH: 'asia', VN: 'asia', MY: 'asia', SG: 'asia',
  ID: 'asia', PH: 'asia', KZ: 'asia', UZ: 'asia', MN: 'asia', NP: 'asia', LK: 'asia',
  MM: 'asia', KH: 'asia', LA: 'asia', TL: 'asia', BN: 'asia', AF: 'asia', BT: 'asia',
  MV: 'asia', KP: 'asia', KG: 'asia', TJ: 'asia', TM: 'asia', AZ: 'asia', AM: 'asia',
  GE: 'asia',
  AU: 'oceania', NZ: 'oceania', FJ: 'oceania', PG: 'oceania', CK: 'oceania', KI: 'oceania',
  MH: 'oceania', FM: 'oceania', PW: 'oceania', NR: 'oceania', TV: 'oceania', WS: 'oceania',
  TO: 'oceania', SB: 'oceania', VU: 'oceania',
  AE: 'middle-east', SA: 'middle-east', IL: 'middle-east', TR: 'middle-east',
  IQ: 'middle-east', IR: 'middle-east', JO: 'middle-east', LB: 'middle-east',
  KW: 'middle-east', OM: 'middle-east', QA: 'middle-east', BH: 'middle-east',
  YE: 'middle-east', PS: 'middle-east', SY: 'middle-east',
  EG: 'africa', ZA: 'africa', NG: 'africa', KE: 'africa', GH: 'africa', TZ: 'africa',
  ET: 'africa', MA: 'africa', DZ: 'africa', TN: 'africa', AO: 'africa', MZ: 'africa',
  ZM: 'africa', ZW: 'africa', UG: 'africa', SN: 'africa', CI: 'africa', CM: 'africa',
  SD: 'africa', SS: 'africa', RW: 'africa', BW: 'africa', NA: 'africa', MG: 'africa',
  ML: 'africa', BF: 'africa', NE: 'africa', TD: 'africa', LY: 'africa', SO: 'africa',
  CD: 'africa', CG: 'africa', GA: 'africa', GN: 'africa', SL: 'africa', LR: 'africa',
  BJ: 'africa', BI: 'africa', CF: 'africa', DJ: 'africa', ER: 'africa', GM: 'africa',
  GW: 'africa', CV: 'africa', KM: 'africa', ST: 'africa', SC: 'africa', MU: 'africa',
  MR: 'africa', MW: 'africa', LS: 'africa', SZ: 'africa', TG: 'africa', GQ: 'africa'
}

/** Natural Earth 50m：中国大陆 numeric id */
export const CHINA_MAINLAND_ID = '156'

/** 地图上与中国同一视觉/交互主体的属地块（台湾、港澳） */
export const CHINA_UNIFIED_TERRITORY_IDS = new Set(['158', '344', '446'])

/** 钓鱼岛诸岛近似中心坐标 [lng, lat]（Natural Earth 划入日本，叠加中国属地块） */
export const DIAOYU_ISLAND_COORDS = [
  [123.473, 25.746],
  [123.478, 25.756],
  [123.455, 25.746]
]

/**
 * 藏南等争议区叠加数据（由 scripts/build-cn-claimed-overlays.py 生成）
 * 来源：Natural Earth 50m ne_50m_admin_0_breakaway_disputed_areas，ADM0_A3_CN === CHN
 */
export const CN_CLAIMED_TERRITORIES_SOURCE =
  'Natural Earth 50m disputed areas (China administrative perspective)'

/**
 * 是否为需与中国大陆统一展示/交互的属地块
 * @param {string|null|undefined} numericId
 * @param {string} [mapName]
 * @returns {boolean}
 */
export function isChinaUnifiedTerritory(numericId, mapName) {
  const id = numericId ? String(numericId) : ''
  if (id && CHINA_UNIFIED_TERRITORY_IDS.has(id)) return true
  return mapName === 'Taiwan' || mapName === 'Hong Kong' || mapName === 'Macao'
}

/**
 * 国界 mesh 是否应绘制（中国大陆与合一属地块之间不画分隔缝）
 * @param {string} idA
 * @param {string} idB
 * @returns {boolean}
 */
export function shouldDrawBorderBetween(idA, idB) {
  const chinaGroup = new Set([CHINA_MAINLAND_ID, ...CHINA_UNIFIED_TERRITORY_IDS])
  if (chinaGroup.has(String(idA)) && chinaGroup.has(String(idB))) return false
  return true
}

/**
 * @param {string} mapName
 * @returns {string|null}
 */
export function mapNameToIso(mapName) {
  return NAME_TO_ISO[mapName] || null
}

/**
 * @param {string} iso
 * @returns {string|null}
 */
export function isoToRegionId(iso) {
  return ISO_TO_REGION[iso] || null
}

/**
 * 地图交互用区域 ID（批量悬浮高亮、区域面板归属）
 * @param {string} iso
 * @returns {string|null}
 */
export function isoToMapRegionId(iso) {
  return isoToRegionId(iso)
}

/**
 * 按质心经纬度判定地图展示区域（地理分区）
 * @param {number} lng
 * @param {number} lat
 * @returns {string|null}
 */
export function regionIdFromCoordinates(lng, lat) {
  if (lat < -60) return null

  if (
    (lng >= 110 && lat <= -8) ||
    (lng >= 140 && lat < 12 && lat >= -50) ||
    (lng >= 165 && lat < 5)
  ) {
    return 'oceania'
  }

  if (lng >= -170 && lng <= -30) {
    if (lat >= 23) return 'north-america'
    if (lat >= 7 && lng >= -118 && lng <= -77) return 'caribbean-central-america'
    if (lat >= 10 && lat < 23 && lng >= -95) return 'caribbean-central-america'
    if (lat >= 5 && lat < 25 && lng >= -85) return 'caribbean-central-america'
    if (lat < 15) return 'south-america'
    return 'north-america'
  }

  if (lat >= 36 && lng >= -12 && lng <= 32) return 'europe'
  if (lat >= 35 && lng >= -25 && lng <= 28) return 'europe'

  if (lat >= 12 && lat <= 42 && lng >= 26 && lng <= 63) return 'middle-east'

  if (lat >= -35 && lat < 38 && lng >= -20 && lng <= 55) return 'africa'

  if (lng > 25 || lat > 5) return 'asia'

  return 'africa'
}

/**
 * 欧洲母国海外属地在美洲时按地理区域展示，避免法属圭亚那等误归入欧洲
 * @param {string|null} primaryRegionId
 * @param {number} lng
 * @param {number} lat
 * @param {boolean} isPrimaryPart
 * @returns {string|null}
 */
export function resolvePolygonDisplayRegion(primaryRegionId, lng, lat, isPrimaryPart) {
  if (!primaryRegionId || isPrimaryPart) return primaryRegionId

  const geoRegion = regionIdFromCoordinates(lng, lat)
  const europeOverseasTargets = new Set([
    'caribbean-central-america',
    'south-america',
    'north-america'
  ])
  if (primaryRegionId === 'europe' && europeOverseasTargets.has(geoRegion)) {
    return geoRegion
  }

  return primaryRegionId
}

/**
 * @param {import('geojson').Geometry|object} geometry
 * @returns {object[]}
 */
export function extractPolygonGeometries(geometry) {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return [geometry]
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(coords => ({ type: 'Polygon', coordinates: coords }))
  }
  return []
}
