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

/** ISO2 → 大洲/区域 ID */
export const ISO_TO_REGION = {
  US: 'north-america', CA: 'north-america', MX: 'north-america', GL: 'north-america',
  GT: 'latin-america', BZ: 'latin-america', SV: 'latin-america', HN: 'latin-america',
  NI: 'latin-america', CR: 'latin-america', PA: 'latin-america', CU: 'latin-america',
  DO: 'latin-america', HT: 'latin-america', JM: 'latin-america', TT: 'latin-america',
  BB: 'latin-america', AG: 'latin-america', DM: 'latin-america', GD: 'latin-america',
  KN: 'latin-america', LC: 'latin-america', VC: 'latin-america', BS: 'latin-america',
  BR: 'latin-america', AR: 'latin-america', CL: 'latin-america', CO: 'latin-america',
  PE: 'latin-america', VE: 'latin-america', EC: 'latin-america', BO: 'latin-america',
  PY: 'latin-america', UY: 'latin-america', GY: 'latin-america', SR: 'latin-america',
  GB: 'europe', IE: 'europe', FR: 'europe', DE: 'europe', ES: 'europe', PT: 'europe',
  IT: 'europe', NL: 'europe', BE: 'europe', LU: 'europe', AT: 'europe', CH: 'europe',
  SE: 'europe', NO: 'europe', DK: 'europe', FI: 'europe', IS: 'europe', PL: 'europe',
  CZ: 'europe', SK: 'europe', HU: 'europe', RO: 'europe', BG: 'europe', GR: 'europe',
  HR: 'europe', SI: 'europe', RS: 'europe', BA: 'europe', ME: 'europe', MK: 'europe',
  AL: 'europe', EE: 'europe', LV: 'europe', LT: 'europe', UA: 'europe', BY: 'europe',
  MD: 'europe', XK: 'europe', CY: 'europe', MT: 'europe', AD: 'europe', MC: 'europe',
  SM: 'europe', RU: 'europe',
  CN: 'asia-pacific', JP: 'asia-pacific', KR: 'asia-pacific', TW: 'asia-pacific',
  HK: 'asia-pacific', IN: 'asia-pacific', PK: 'asia-pacific', BD: 'asia-pacific',
  TH: 'asia-pacific', VN: 'asia-pacific', MY: 'asia-pacific', SG: 'asia-pacific',
  ID: 'asia-pacific', PH: 'asia-pacific', AU: 'asia-pacific', NZ: 'asia-pacific',
  KZ: 'asia-pacific', UZ: 'asia-pacific', MN: 'asia-pacific', NP: 'asia-pacific',
  LK: 'asia-pacific', MM: 'asia-pacific', KH: 'asia-pacific', LA: 'asia-pacific',
  FJ: 'asia-pacific', PG: 'asia-pacific', TL: 'asia-pacific', BN: 'asia-pacific',
  AF: 'asia-pacific', BT: 'asia-pacific', MV: 'asia-pacific', KP: 'asia-pacific',
  KG: 'asia-pacific', TJ: 'asia-pacific', TM: 'asia-pacific', AZ: 'asia-pacific',
  AM: 'asia-pacific', GE: 'asia-pacific', CK: 'asia-pacific', KI: 'asia-pacific',
  MH: 'asia-pacific', FM: 'asia-pacific', PW: 'asia-pacific', NR: 'asia-pacific',
  TV: 'asia-pacific', WS: 'asia-pacific', TO: 'asia-pacific', SB: 'asia-pacific',
  VU: 'asia-pacific',
  AE: 'middle-east-africa', SA: 'middle-east-africa', IL: 'middle-east-africa',
  TR: 'middle-east-africa', IQ: 'middle-east-africa', IR: 'middle-east-africa',
  JO: 'middle-east-africa', LB: 'middle-east-africa', KW: 'middle-east-africa',
  OM: 'middle-east-africa', QA: 'middle-east-africa', BH: 'middle-east-africa',
  YE: 'middle-east-africa', PS: 'middle-east-africa', EG: 'middle-east-africa',
  ZA: 'middle-east-africa', NG: 'middle-east-africa', KE: 'middle-east-africa',
  GH: 'middle-east-africa', TZ: 'middle-east-africa', ET: 'middle-east-africa',
  MA: 'middle-east-africa', DZ: 'middle-east-africa', TN: 'middle-east-africa',
  AO: 'middle-east-africa', MZ: 'middle-east-africa', ZM: 'middle-east-africa',
  ZW: 'middle-east-africa', UG: 'middle-east-africa', SN: 'middle-east-africa',
  CI: 'middle-east-africa', CM: 'middle-east-africa', SD: 'middle-east-africa',
  SS: 'middle-east-africa', RW: 'middle-east-africa', BW: 'middle-east-africa',
  NA: 'middle-east-africa', MG: 'middle-east-africa', ML: 'middle-east-africa',
  BF: 'middle-east-africa', NE: 'middle-east-africa', TD: 'middle-east-africa',
  LY: 'middle-east-africa', SO: 'middle-east-africa', CD: 'middle-east-africa',
  CG: 'middle-east-africa', GA: 'middle-east-africa', GN: 'middle-east-africa',
  SL: 'middle-east-africa', LR: 'middle-east-africa', BJ: 'middle-east-africa',
  BI: 'middle-east-africa', CF: 'middle-east-africa', DJ: 'middle-east-africa',
  ER: 'middle-east-africa', GM: 'middle-east-africa', GW: 'middle-east-africa',
  CV: 'middle-east-africa', KM: 'middle-east-africa', ST: 'middle-east-africa',
  SC: 'middle-east-africa', MU: 'middle-east-africa', MR: 'middle-east-africa',
  MW: 'middle-east-africa', LS: 'middle-east-africa', SZ: 'middle-east-africa',
  SY: 'middle-east-africa', TG: 'middle-east-africa', GQ: 'middle-east-africa'
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
 * 按质心经纬度判定地图展示区域（地理分区）
 * @param {number} lng
 * @param {number} lat
 * @returns {string|null}
 */
export function regionIdFromCoordinates(lng, lat) {
  if (lat < -60) return null

  if (lng >= -170 && lng <= -30) {
    return lat >= 15 ? 'north-america' : 'latin-america'
  }

  if (lat >= 50 && lng >= -75 && lng <= -10) {
    return 'north-america'
  }

  if (lat >= 35 && lng >= -25 && lng <= 60) {
    return 'europe'
  }

  if (lat >= -35 && lat < 38 && lng >= -20 && lng <= 55) {
    return 'middle-east-africa'
  }

  if (lng > 55 || lat < 10 && lng > 95 || lat >= -50 && lat < 10 && lng >= 110) {
    return 'asia-pacific'
  }

  if (lat >= 10 && lng > 40 && lng <= 180) {
    return 'asia-pacific'
  }

  return 'middle-east-africa'
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
  if (
    primaryRegionId === 'europe' &&
    (geoRegion === 'latin-america' || geoRegion === 'north-america')
  ) {
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
