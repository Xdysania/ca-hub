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
  Liechtenstein: 'LI',
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
  Vatican: 'VA',
  Vanuatu: 'VU',
  Venezuela: 'VE',
  Vietnam: 'VN',
  Yemen: 'YE',
  Zambia: 'ZM',
  Zimbabwe: 'ZW',
  eSwatini: 'SZ',
  'Puerto Rico': 'PR'
}

/** ISO2 → 地图展示区域 ID（8 区精确划分，对齐设计稿下拉菜单） */
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
  // North America（Ramp：仅 US / CA / MX，不含格陵兰、中美洲、加勒比）
  US: 'north-america', CA: 'north-america', MX: 'north-america',

  // Caribbean and Central America（Ramp：中美洲七国 + 加勒比群岛，不含墨西哥与南美大陆）
  GT: 'caribbean-central-america', BZ: 'caribbean-central-america', SV: 'caribbean-central-america',
  HN: 'caribbean-central-america', NI: 'caribbean-central-america', CR: 'caribbean-central-america',
  PA: 'caribbean-central-america', CU: 'caribbean-central-america', DO: 'caribbean-central-america',
  HT: 'caribbean-central-america', JM: 'caribbean-central-america', TT: 'caribbean-central-america',
  BB: 'caribbean-central-america', AG: 'caribbean-central-america', DM: 'caribbean-central-america',
  GD: 'caribbean-central-america', KN: 'caribbean-central-america', LC: 'caribbean-central-america',
  VC: 'caribbean-central-america', BS: 'caribbean-central-america', PR: 'caribbean-central-america',

  // South America（Ramp：南美大陆十二国 + 法属圭亚那，不含巴拿马/中美洲）
  BR: 'south-america', AR: 'south-america', CL: 'south-america', CO: 'south-america',
  PE: 'south-america', VE: 'south-america', EC: 'south-america', BO: 'south-america',
  PY: 'south-america', UY: 'south-america', GY: 'south-america', SR: 'south-america',

  // Europe（Ramp：含乌、摩，不含俄、白、土耳其、高加索）
  GB: 'europe', IE: 'europe', FR: 'europe', DE: 'europe', ES: 'europe', PT: 'europe',
  IT: 'europe', NL: 'europe', BE: 'europe', LU: 'europe', AT: 'europe', CH: 'europe',
  SE: 'europe', NO: 'europe', DK: 'europe', FI: 'europe', IS: 'europe', PL: 'europe',
  CZ: 'europe', SK: 'europe', HU: 'europe', RO: 'europe', BG: 'europe', GR: 'europe',
  HR: 'europe', SI: 'europe', RS: 'europe', BA: 'europe', ME: 'europe', MK: 'europe',
  AL: 'europe', EE: 'europe', LV: 'europe', LT: 'europe', XK: 'europe', CY: 'europe',
  MT: 'europe', AD: 'europe', LI: 'europe', MC: 'europe', SM: 'europe', VA: 'europe',
  UA: 'europe', MD: 'europe',

  // Asia（Ramp：含俄罗斯、中亚、东亚、南亚、东南亚；中东保持独立）
  CN: 'asia', JP: 'asia', KR: 'asia', TW: 'asia', HK: 'asia', MO: 'asia',
  IN: 'asia', PK: 'asia', BD: 'asia', TH: 'asia', VN: 'asia', MY: 'asia', SG: 'asia',
  ID: 'asia', PH: 'asia', KZ: 'asia', UZ: 'asia', MN: 'asia', NP: 'asia', LK: 'asia',
  MM: 'asia', KH: 'asia', LA: 'asia', TL: 'asia', BN: 'asia', AF: 'asia', BT: 'asia',
  MV: 'asia', KP: 'asia', KG: 'asia', TJ: 'asia', TM: 'asia', AZ: 'asia', AM: 'asia',
  GE: 'asia', RU: 'asia',

  // Oceania
  AU: 'oceania', NZ: 'oceania', FJ: 'oceania', PG: 'oceania', CK: 'oceania', KI: 'oceania',
  MH: 'oceania', FM: 'oceania', PW: 'oceania', NR: 'oceania', TV: 'oceania', WS: 'oceania',
  TO: 'oceania', SB: 'oceania', VU: 'oceania',

  // Middle East（Ramp：含土耳其、伊朗、伊拉克、黎凡特与阿拉伯半岛；不含埃及、阿富汗、高加索）
  AE: 'middle-east', SA: 'middle-east', IL: 'middle-east', TR: 'middle-east',
  IQ: 'middle-east', IR: 'middle-east', JO: 'middle-east', LB: 'middle-east',
  KW: 'middle-east', OM: 'middle-east', QA: 'middle-east', BH: 'middle-east',
  YE: 'middle-east', PS: 'middle-east', SY: 'middle-east',

  // Africa（Ramp：保留北非西段、撒哈拉以南与埃及/埃塞；去掉利比亚、苏丹带、非洲之角东端）
  EG: 'africa', ZA: 'africa', NG: 'africa', KE: 'africa', GH: 'africa', TZ: 'africa',
  ET: 'africa', MA: 'africa', DZ: 'africa', TN: 'africa', AO: 'africa', MZ: 'africa',
  ZM: 'africa', ZW: 'africa', UG: 'africa', SN: 'africa', CI: 'africa', CM: 'africa',
  RW: 'africa', BW: 'africa', NA: 'africa', MG: 'africa',
  ML: 'africa', BF: 'africa', NE: 'africa', TD: 'africa',
  CD: 'africa', CG: 'africa', GA: 'africa', GN: 'africa', SL: 'africa', LR: 'africa',
  BJ: 'africa', BI: 'africa', CF: 'africa', GM: 'africa',
  GW: 'africa', CV: 'africa', KM: 'africa', ST: 'africa', SC: 'africa', MU: 'africa',
  MR: 'africa', MW: 'africa', LS: 'africa', SZ: 'africa', TG: 'africa', GQ: 'africa'
}

/** Natural Earth 50m：中国大陆 numeric id */
export const CHINA_MAINLAND_ID = '156'

/**
 * 不参与任何大洲批量高亮的国家（Ramp 地图交互定义）
 */
export const MAP_NAMES_WITHOUT_REGION = new Set([
  'Greenland',
  'Belarus',
  'Libya',
  'Sudan',
  'S. Sudan',
  'Somalia',
  'Djibouti',
  'Eritrea'
])

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
 * 无 ISO 时按质心判断是否属加勒比/中美洲（Ramp 范围，不含墨西哥与南美北岸）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isCaribbeanCentralAmericaByCoordinates(lng, lat) {
  // 巴哈马（须先于 lat>=25 的北美兜底规则）
  if (lat >= 20 && lat <= 30.5 && lng >= -81 && lng <= -69) return true
  // 中美洲地峡（墨西哥以南、巴拿马运河段）
  if (lat >= 7.4 && lat <= 17.9 && lng >= -92.3 && lng <= -76) return true
  // 大安的列斯群岛（古巴、牙买加、海地、多米尼加、波多黎各）
  if (lat >= 17 && lat <= 24 && lng >= -85 && lng <= -64) return true
  // 小安的列斯群岛（特立尼达等）
  if (lat >= 10 && lat <= 18 && lng >= -67 && lng <= -59.5) return true
  return false
}

/**
 * 无 ISO 时按质心判断是否属南美大陆（Ramp：巴拿马以南，含法属圭亚那）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isSouthAmericaByCoordinates(lng, lat) {
  if (lat >= -56 && lat <= 13 && lng >= -82 && lng <= -34) {
    if (isCaribbeanCentralAmericaByCoordinates(lng, lat)) return false
    return true
  }
  return false
}

/**
 * 乌克兰范围（坐标兜底，确保归入欧洲）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isUkraineByCoordinates(lng, lat) {
  return lat >= 44 && lat <= 52.5 && lng >= 22 && lng <= 40.5
}

/**
 * 摩尔多瓦范围（坐标兜底，确保归入欧洲）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isMoldovaByCoordinates(lng, lat) {
  return lat >= 45.4 && lat <= 48.5 && lng >= 26.5 && lng <= 30.5
}

/**
 * 俄国范围（坐标兜底排除，不参与欧洲批量高亮）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isRussiaByCoordinates(lng, lat) {
  if (isUkraineByCoordinates(lng, lat)) return false
  if (isMoldovaByCoordinates(lng, lat)) return false
  if (lat < 41) return false
  // 加里宁格勒
  if (lat >= 54 && lat <= 55.5 && lng >= 19 && lng <= 21) return true
  // 俄欧洲部分（约乌拉尔以西）
  if (lat >= 41 && lat <= 60 && lng >= 30 && lng <= 60) return true
  // 俄北与远东
  if (lat > 60 && lng >= 28) return true
  if (lng >= 60) return true
  return false
}

/**
 * 白俄罗斯范围（坐标兜底排除）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isBelarusByCoordinates(lng, lat) {
  return lat >= 51 && lat <= 56.5 && lng >= 27 && lng <= 32.5
}

/**
 * 高加索三国范围（坐标兜底排除，归属亚洲）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isCaucasusByCoordinates(lng, lat) {
  return lat >= 38.5 && lat <= 44.5 && lng >= 39.5 && lng <= 48.5
}

/**
 * 土耳其欧洲侧范围（色雷斯）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isTurkeyEuropeByCoordinates(lng, lat) {
  return lat >= 40 && lat <= 42.5 && lng >= 25.5 && lng <= 29.8
}

/**
 * 无 ISO 时按质心判断是否属欧洲（Ramp：含乌、摩，不含俄、白、土耳其、高加索）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isEuropeByCoordinates(lng, lat) {
  if (isTurkeyEuropeByCoordinates(lng, lat)) return true
  if (isUkraineByCoordinates(lng, lat)) return true
  if (isMoldovaByCoordinates(lng, lat)) return true
  if (isRussiaByCoordinates(lng, lat)) return false
  if (isBelarusByCoordinates(lng, lat)) return false
  if (isCaucasusByCoordinates(lng, lat)) return false
  // 冰岛
  if (lat >= 63 && lng >= -25 && lng <= -13) return true
  // 欧洲大陆（含乌克兰、摩尔多瓦）
  if (lat >= 35 && lat <= 71 && lng >= -25 && lng <= 40.5) {
    if (lat < 42 && lng >= 35) return false
    if (lat < 42 && lng >= 26 && lng < 35) return false
    return true
  }
  return false
}

/**
 * 非洲东段需排除的国家带（Ramp 视觉中保持浅色）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isAfricaExcludedByCoordinates(lng, lat) {
  // 利比亚
  if (lat >= 19 && lat <= 34 && lng >= 9 && lng <= 26) return true
  // 苏丹与南苏丹
  if (lat >= 3 && lat <= 23 && lng >= 21 && lng <= 39) return true
  // 非洲之角东端：厄立特里亚、吉布提、索马里
  if (lat >= -2 && lat <= 19 && lng >= 41 && lng <= 52) return true
  return false
}

/**
 * 无 ISO 时按质心判断是否属非洲（Ramp：不含利比亚、苏丹带与非洲之角东端）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isAfricaByCoordinates(lng, lat) {
  if (lat < -35 || lat >= 38 || lng < -25 || lng > 55) return false
  if (isAfricaExcludedByCoordinates(lng, lat)) return false
  return true
}

/**
 * 无 ISO 时按质心判断是否属中东（Ramp：不含埃及、阿富汗、巴基斯坦与高加索）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isMiddleEastByCoordinates(lng, lat) {
  if (isCaucasusByCoordinates(lng, lat)) return false
  // 土耳其
  if (lat >= 35.5 && lat <= 42.5 && lng >= 26 && lng <= 45.5) return true
  // 黎凡特 + 两河流域 + 伊朗
  if (lat >= 24 && lat <= 39.5 && lng >= 34 && lng <= 63) return true
  // 阿拉伯半岛
  if (lat >= 12 && lat <= 31.5 && lng >= 34 && lng <= 60.5) return true
  return false
}

/**
 * 无 ISO 时按质心判断是否属大洋洲（Ramp：澳新、巴新与南太平洋岛链，不含印尼）
 * @param {number} lng
 * @param {number} lat
 * @returns {boolean}
 */
function isOceaniaByCoordinates(lng, lat) {
  // 澳大利亚与塔斯马尼亚
  if (lat >= -45 && lat <= -10 && lng >= 112 && lng <= 154) return true
  // 新西兰
  if (lat >= -48 && lat <= -33 && lng >= 166 && lng <= 179.9) return true
  // 巴布亚新几内亚
  if (lat >= -12 && lat <= 2 && lng >= 140 && lng <= 156) return true
  // 美拉尼西亚/波利尼西亚西段/密克罗尼西亚主要岛链
  if (lat >= -25 && lat <= 15 && lng >= 160 && lng <= 179.9) return true
  // 国际日期线另一侧的小岛链（斐济、萨摩亚、汤加、库克群岛等）
  if (lat >= -25 && lat <= 15 && lng >= -180 && lng <= -150) return true
  return false
}

/**
 * 按质心经纬度精准判定地图展示区域（修复了原版范围过大、导致离岛划分混乱的 Bug）
 * @param {number} lng
 * @param {number} lat
 * @returns {string|null}
 */
export function regionIdFromCoordinates(lng, lat) {
  if (lat < -60) return null // 南极洲

  // 格陵兰：不归入北美（Ramp 北美仅 US/CA/MX）
  if (lng >= -73 && lng <= -12 && lat >= 59) return null

  // 大洋洲跨日期线岛链需先判定，避免被美洲负经度兜底误收
  if (isOceaniaByCoordinates(lng, lat)) return 'oceania'

  // 美洲区 (Americas)
  if (lng >= -170 && lng <= -30) {
    if (isCaribbeanCentralAmericaByCoordinates(lng, lat)) return 'caribbean-central-america'
    if (lat >= 25) return 'north-america'
    if (isSouthAmericaByCoordinates(lng, lat)) return 'south-america'
    return 'north-america'
  }

  // 欧洲（Ramp：不含俄、白、土耳其、高加索）
  if (isEuropeByCoordinates(lng, lat)) return 'europe'

  // 中东（Ramp：含土耳其、伊朗、伊拉克、黎凡特与阿拉伯半岛）
  if (isMiddleEastByCoordinates(lng, lat)) return 'middle-east'

  // 非洲（Ramp：不含利比亚、苏丹带与非洲之角东端）
  if (isAfricaByCoordinates(lng, lat)) return 'africa'

  // 亚洲 (Asia) - 兜底东半球其余部分
  if (lng >= 25) return 'asia'

  return 'africa'
}

/**
 * 欧洲母国海外属地在其他大洲时，精准纠偏到其实际的地理位置
 * @param {string|null} primaryRegionId
 * @param {number} lng
 * @param {number} lat
 * @param {boolean} isPrimaryPart
 * @returns {string|null}
 */
export function resolvePolygonDisplayRegion(primaryRegionId, lng, lat, isPrimaryPart) {
  if (!primaryRegionId || isPrimaryPart) return primaryRegionId

  const geoRegion = regionIdFromCoordinates(lng, lat)

  // 补全所有可能存在欧洲离岛的实际物理大洲
  const europeOverseasTargets = new Set([
    'caribbean-central-america',
    'south-america',
    'north-america',
    'africa',
    'oceania',
    'asia'
  ])

  if (primaryRegionId === 'europe' && europeOverseasTargets.has(geoRegion)) {
    return geoRegion
  }

  // 中东国家位于欧洲侧的碎块（如土耳其色雷斯）按实际地理位置归入欧洲
  if (primaryRegionId === 'middle-east' && geoRegion === 'europe') {
    return 'europe'
  }

  // 北美本土三国：海外属地（如波多黎各）按实际地理位置纠偏
  if (primaryRegionId === 'north-america' && geoRegion && geoRegion !== 'north-america') {
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
