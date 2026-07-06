# 全球CA能力官网页-1.16.1

## 1. 依据与结论

### 1.1 需求输入

| 项 | 内容 |
|---|---|
| 需求标题 | 全球CA能力官网页-1.16.1 |
| 版本 | 1.16.1 |
| 最新口径 | CA 现在门户没有入口，需要新增全球 CA 能力官网页 |
| 页面结构 | P1 Hero、P2 可交互 Map、P3 可分页卡片列表（每页 9 张）、P4 Feature Block、P5 Final CTA |
| 地图交互口径 | 点击国家后，在地图区域内出现选中国家、Provider 数量和 Provider 列表；P3 同步筛选但不是唯一列表入口 |
| 对标参考 | Ramp Global 的全球能力页节奏；EID Easy 的 provider card 密度和字段 |
| 交付范围 | Portal PC + Strapi CMS 均纳入本期范围 |

### 1.2 调研结论

| 来源 | 已确认信息 | 对本需求的约束 |
|---|---|---|
| [Ramp Global](https://ramp.com/global) | 页面采用全球化主张、能力说明、全球覆盖段落、平台能力段落、最终 CTA 的节奏，首页首屏直接表达全球能力和 CTA。 | 本页参考其“全球承诺 + 可探索能力 + 转化 CTA”的结构节奏，不复制金融场景文案、视觉皮肤和覆盖数字。 |
| [EID Easy provider integrations](https://www.eideasy.com/provider-integrations) | Provider 区域包含国家筛选，卡片字段呈现为 logo、类别、provider 名称、短描述、Learn more。 | P3 卡片字段与密度按该模式约束：小 logo、英文类别标签、Provider 名称、短描述、Learn more 链接。 |
| 本地设计草稿 `docs/notasign-ca-hub-page-design.md` | 已有 CA Hub 方向建议：地图/搜索/列表为固定交互体验，Provider 与国家数据由 Strapi 管理。 | PRD 继承“数据进 Strapi，交互留 Portal PC”的方向，但标题、入口和范围按本次最新口径重新收口。 |

### 1.3 现有工程分析

| 模块 | 代码已确认现状 | PRD 结论 |
|---|---|---|
| Graphify Gate | `graphify-out/GRAPH_REPORT.md` 已存在，图谱覆盖 7828 files、30682 nodes，满足架构分析前置要求。 | 本 PRD 的工程影响判断基于 Graphify Gate 后的代码扫描。 |
| Portal PC 技术栈 | `front-oversea-portal-pc/package.json` 显示 Nuxt 3.17.5、Vue 3.5、`@nuxtjs/i18n`、`@nuxtjs/strapi`、Tailwind、Element Plus、GSAP。 | 新页面应按 Nuxt 3 页面和组件实现，支持现有 i18n、SEO、Strapi 读取方式。 |
| Portal PC 当前路由 | `pages/product/[slug].vue` 已用于 Strapi 产品详情页，现有 `pages/` 下没有 `ca-hub` 页面。 | 本期需新增 CA 官网页路由，不能只在 Strapi 新建普通产品页。 |
| Portal PC 产品导航 | `useNavigation.ts` 通过 Strapi `showInMainNav=true` 拉取导航；Products 当前快照包含 Electronic Signature、Digital Signature、eSeal、Identify 等，没有 CA。 | 本期必须新增 CA 的门户入口，并保证 Products 导航可见。 |
| Portal PC 导航链接 | `ProductsDropdown.vue` 使用 `productsNav` 动态渲染 Products，并通过 `getNavLink` 生成 `/product/{slug}`。 | 推荐入口落在 Products 导航，目标路径为 `/product/ca-hub`。 |
| Portal PC CMS 路由辅助 | `useCmsLocalizedPage.ts` 已有 `"ca-hub": "ca-hub"` 映射，但当前没有对应页面与 Strapi pageType。 | 若研发选择独立 `/ca-hub` 路由，需要补齐前端页面和 Strapi 类型；本 PRD 默认使用 `/product/ca-hub` 以复用现有 Products 导航。 |
| Strapi 技术栈 | `front-oversea-strapi/package.json` 显示 Strapi 5.23.4、GraphQL、SEO、sitemap、users-permissions、MySQL。 | CMS 侧需通过 Strapi 5 content type / single type / media / draft publish 管理内容和数据。 |
| Strapi Page | `page/schema.json` 的 `pageType` 仅有 Solutions、Products、Products-Features、TopLevel；动态区块仅有 hero/text/features/cta/faq 等通用 blocks。 | 现有 Page 动态区块不足以承载交互地图和 CA 数据关系；需要新增 CA 数据模型或 CA 专用 settings。 |
| Strapi CA 数据 | `src/api` 下未发现 `ca-provider`、`country` 等 CA 专用内容类型。 | 本期 Strapi 必须新增国家和 CA/Provider 数据模型，不能硬编码在 Portal PC。 |

### 1.4 影响范围扫描

| Module Area | 分类 | 代码证据或排除原因 | PRD 影响 | 验收影响 |
|---|---|---|---|---|
| 管理与工作空间设置 | 不影响 | 本需求为官网 Portal PC 页面，不进入 SaaS 工作空间设置。 | 不新增工作空间配置。 | 回归确认工作空间设置入口和配置无变化。 |
| 权限与角色 | 本期涉及 | Portal 用户权限不变；Strapi 需控制 CA 内容编辑、发布、公开读取权限。 | 新增 Strapi 内容编辑权限和 public API 读取边界。 | 草稿未发布内容不得在正式页面展示；CMS 编辑角色可维护 CA 数据。 |
| 信封创建/编辑 | 不影响 | 页面不进入 `/app/task/create`，不改变发起签署流程。 | 不新增信封创建字段或流程。 | 创建信封主流程回归无变化。 |
| 模板创建/编辑/复用 | 不影响 | 本需求不触达模板。 | 模板能力不变。 | 模板列表、编辑、复用无需新增用例。 |
| 控件与字段模型 | 不影响 | 本需求展示 CA 能力，不改变签署控件模型。 | 不新增控件字段。 | 控件拖拽、必填校验、属性设置无需变化。 |
| 签署端 | 不影响 | 本需求为官网访客页面，不进入签署端。 | 签署体验不变。 | 签署端提交、拒签、重进流程无需变化。 |
| 在途更新 | 不影响 | 不涉及 sent envelope correction/update。 | 在途更新不变。 | 在途更新无需新增验收。 |
| 信封详情页 | 不影响 | 不读取 envelope detail。 | 详情页不变。 | 详情页状态、参与方进度无需变化。 |
| 信封历史记录 | 不影响 | 不生成 activity timeline。 | 历史记录不变。 | 历史记录无需新增文案。 |
| 审计报告 | 不影响 | 不生成签署证据、审计报告或证书文件。 | 审计产物不变。 | 审计报告导出无需变化。 |
| 最终文档/PDF/文件 | 不影响 | 官网页面不处理签署文件、PDF 合并、附件。 | 文件产物不变。 | 文档下载、最终 PDF 不新增验收。 |
| 通知与提醒 | 不影响 | 不触发 email/SMS/WhatsApp 通知。 | 通知模板不变。 | 通知链路无需新增测试。 |
| API/BFF/Open API/Webhook | 本期涉及 | 本期仅涉及 Strapi 内容 API；不涉及签署 Open API/Webhook 合约。 | 需定义 CA 内容读取接口和 Portal 查询方式；不得改变业务 API。 | 验收 Strapi published 数据可被 Portal 读取；Open API/Webhook 回归无变化。 |
| 身份/证书/TSP | 本期涉及 | 页面展示 CA/QTSP/TSP/身份方法等官网内容，但不接入运行时证书签署链路。 | Strapi 需维护 Provider 类型、国家、保证等级、支持用途等展示数据。 | 验收展示内容准确、无未确认法律承诺；不要求真实签署接入。 |
| 集成与特殊空间 | 本期不涉及 | 不新增 GxP、Singpass、第三方签署运行时集成。 | 只能作为内容字段展示，不承诺本期完成技术集成。 | 不做真实第三方流程验收。 |
| 本地化与文案 | 本期涉及 | Portal PC 支持 `zh`、`en`、`zh-HK`，Strapi Page 支持 i18n。 | 入口、页面文案、SEO、空状态、筛选项需本地化。 | 三语言路径、导航、meta、页面文案均需验证。 |
| 兼容与存量数据 | 本期涉及 | 当前无 CA 门户入口；Products 导航由 CMS 和 snapshot 支撑。 | 新入口不能挤压或破坏既有 Products 导航；无 CA 数据时页面有降级。 | 验收既有产品页仍可访问；CA 数据缺失时不白屏。 |
| 计费/套餐/开关 | 不影响 | 官网公开页，不进入套餐权益控制。 | 不新增套餐开关。 | 套餐、订阅、账单无需变化。 |

## 2. 需求背景与目标

### 2.1 需求背景

Nota Sign 需要在官网门户新增一个面向全球 CA 能力的公开页面，帮助访客理解不同国家或地区可支持的 CA、QTSP、TSP、电子签名、电子印章、eID Authentication 等能力。当前 Portal PC 没有 CA 入口，用户无法从官网导航进入该能力，也无法按国家查看支持的 CA 列表。

本需求要交付一个与 Ramp Global 类似节奏的官网页：首屏建立全球能力心智，中段通过可交互 Map 让用户按国家探索，随后用可分页 Provider 卡片列表建立能力可信度，每页展示 9 张卡片，再用 Feature Block 解释产品价值，最终引导联系销售。

### 2.2 需求目标与成功标准

| 目标类型 | 目标 | 成功标准 |
|---|---|---|
| 用户目标 | 官网访客可以从门户入口进入 CA 能力页，并按国家查看支持的 CA 列表。 | 用户从 Products 导航点击 CA 入口后进入页面；点击地图国家后显示该国家支持的 CA/Provider 列表。 |
| 业务目标 | 把 CA 能力从隐藏资产变成官网可展示、可转化的能力页。 | P1-P5 完整上线；Final CTA 可跳转 Contact Sales；SEO 可配置。 |
| 产品目标 | 页面结构接近 Ramp 的全球能力展示节奏，卡片密度接近 EID Easy provider cards。 | 页面顺序固定为 P1 Hero、P2 Map、P3 paginated cards、P4 Feature Block、P5 CTA；P3 每页 9 张、字段与分页结构验收通过。 |
| 工程目标 | Portal PC 负责交互体验，Strapi 负责内容和 CA 数据，不硬编码 Provider 列表。 | 修改 Strapi 数据后，Portal PC published 页面能自动展示新国家/Provider；无需发版改静态文案。 |
| 质量目标 | 地图清晰、交互流畅、可访问、移动端可用。 | 地图使用 SVG 或高 DPI 方案，无明显虚化；主要动效目标 60fps；支持键盘路径和 reduced motion。 |

## 3. 范围、角色与用户旅程

### 3.1 用户与场景

| 角色 | 场景 | 关注点 |
|---|---|---|
| 官网访客 | 想了解某个国家是否支持特定 CA 或高信任签署能力。 | 能快速找到国家、看到支持列表、进入销售咨询。 |
| 企业采购/法务/合规 | 评估跨国签署、QES/AES/eSeal/eID 能力覆盖。 | 展示内容必须可信、保守，不夸大法律效力。 |
| 销售/售前 | 用官网页承接客户询问，快速定位国家和 Provider。 | 页面可分享、CTA 明确、国家/Provider 数据可维护。 |
| CMS 编辑 | 在 Strapi 维护国家、Provider、卡片、Hero、CTA、SEO。 | 不需要研发改代码即可调整内容和展示顺序。 |
| Portal PC 访客 | 在桌面或移动端浏览页面。 | PC 端地图优先，移动端搜索/国家选择优先。 |

### 3.2 用户旅程

| 角色 | 前置条件 | 触发点 | 用户步骤 | 系统反馈 | 完成结果 | 异常分支 |
|---|---|---|---|---|---|---|
| 官网访客 | Portal PC 已上线 CA 入口 | 从 Products 导航点击 CA Hub | 进入 `/product/ca-hub`，浏览 Hero，点击 Explore coverage | 页面滚动到 P2 Map | 用户进入全球 CA 探索区 | 若 Strapi 数据不可用，页面展示基础文案和错误降级，不白屏 |
| 官网访客 | P2 Map 已加载 | 点击一个有数据的国家 | Hover 查看 tooltip，点击国家 | 国家高亮，地图区域出现选中国家、Provider 数量和 Provider 列表，P3 同步筛选 | 用户在地图区直接看到该国家支持的 CA/Provider 数量与列表 | 若国家无数据，展示空状态和 Contact Sales |
| 官网访客 | P3 卡片已加载 | 搜索或筛选 Provider | 输入关键词或选择 filter | 列表即时更新，URL query 同步 | 用户定位目标 Provider 并点击 Learn more/Contact Sales | 若无结果，显示清除筛选和联系销售 |
| CMS 编辑 | 有 Strapi 权限 | 需要新增或调整 CA 覆盖 | 新增国家或 Provider，维护关系、状态、排序、logo、文案并发布 | Portal PC published 页面读取新数据 | 官网展示更新后的覆盖能力 | 草稿状态不出现在正式页面；缺少必填字段无法发布 |
| 销售/售前 | 页面已上线 | 与客户沟通某国家能力 | 打开页面，选择国家，分享页面 URL | URL 带国家 query 可回显选择 | 客户可复现同一国家视图 | 如果 query 对应国家已下线，回退到默认视图并提示无数据 |

### 3.3 本期范围

| 范围项 | 要求 |
|---|---|
| Portal PC 入口 | 新增 CA 入口。默认位于 Products 导航，导航文案需本地化：英文 `CA Hub`，中文可用 `全球 CA 能力`，繁中对应本地化。 |
| Portal PC 路由 | 默认路径 `/product/ca-hub`，多语言路径遵循现有规则：`/en/product/ca-hub`、`/zh-HK/product/ca-hub`。如研发确认静态路由与 `[slug]` 冲突，必须产品确认后才可改为 `/ca-hub`。 |
| P1 Hero | 展示页面定位、主标题、说明、主 CTA、次 CTA，视觉上第一屏明确这是 CA/全球信任服务能力页。 |
| P2 Interactive Map | 可点击国家，点击后在地图区展示该国家的 Provider 数量和 Provider 列表；支持 hover/focus tooltip、选中态、空状态、移动端替代交互。 |
| P3 Card List | 可分页展示 Provider 卡片，每页 9 张，桌面 3x3；总数超过 9 张时显示 Previous、页码、Next 翻页控件。支持按 P2 国家选择同步筛选。 |
| P4 Feature Block | 展示 3-4 个 CA 能力价值点，解释国家覆盖、保证等级、Provider 路由、销售协助等能力。 |
| P5 Final CTA | 引导 Contact Sales，支持 CMS 配置文案和按钮链接。 |
| Strapi 内容模型 | 新增或扩展 CA 页面设置、国家、Provider、Provider 与国家关系、卡片排序、SEO、媒体资源。 |
| SEO 与 sitemap | 页面支持 meta title、description、canonical、hreflang、sitemap 收录；草稿预览不被索引。 |
| 本地化 | 页面文案、Provider 文案、国家名称、CTA、空状态、SEO 支持 `zh`、`en`、`zh-HK`。 |

### 3.4 本期不做范围

| 不做项 | 边界说明 |
|---|---|
| Provider 独立详情页 | 本期只要求官网页 P1-P5。P3 的 `Learn more` 作为 CMS 可配置链接，可指向 Contact Sales、外链或未来详情页，不在本期新增详情页。 |
| 真实 CA/TSP 技术接入 | 页面只展示能力与支持列表，不接入运行时签署、证书申请、签章、身份核验流程。 |
| 覆盖国家数量承诺 | 不写未经 Nota Sign 确认的 `190+`、`80+`、`160+` 等竞品数字。 |
| 法律效力保证 | 不承诺某 Provider 在所有场景下满足某法域法律效力，仅展示可维护的能力字段和保守说明。 |
| SaaS 后台配置入口 | 不在工作空间、管理员设置、套餐开关里新增配置。 |
| Open API/Webhook | 不新增或修改面向客户的签署 Open API/Webhook 合约。 |

### 3.5 不影响范围

信封创建、模板、控件、签署端、在途更新、信封详情、历史记录、审计报告、最终 PDF、通知、套餐权益、工作空间权限、既有产品页和既有 Solutions/Resources 导航均不得因本需求发生行为变化。

### 3.6 页面 Sections 定稿

以下为本期页面定稿内容。Strapi 默认内容、Portal PC 展示和 QA 验收均以本节为准；CMS 后台可维护字段，但上线内容不得偏离本节定义的 section title、content 和 CTA 语义。

#### P1 Hero

| 内容项 | English 定稿 | 简体中文定稿 |
|---|---|---|
| Eyebrow | CA Hub | CA Hub |
| Title | Find the right CA for every signing market | 为每个签署市场找到合适的 CA |
| Description | Explore certificate authorities, trust providers, and identity methods by country, assurance level, and signing workflow. | 按国家、保证等级和签署场景，探索 CA、信任服务商与身份认证方式。 |
| Supporting content | Use CA Hub to understand available providers before you design a high-trust signing flow. | 在设计高信任签署流程前，先确认可用 Provider 和覆盖路径。 |
| Primary CTA | Explore coverage | 查看覆盖能力 |
| Secondary CTA | Contact Sales | 联系销售 |

#### P2 Interactive Map

| 内容项 | English 定稿 | 简体中文定稿 |
|---|---|---|
| Section Title | Explore CA coverage by country | 按国家查看 CA 覆盖 |
| Section Description | Select a country to see available providers, coverage status, and supported signing methods. | 选择一个国家，查看可用 Provider、覆盖状态和支持的签署方式。 |
| Selected Country Panel Title | Providers in `{country}` | `{country}` 支持的 Provider |
| Provider Count | `{count} providers available` | 已支持 `{count}` 个 Provider |
| Provider List Label | CA list | CA 列表 |
| Empty State Title | No provider configured yet | 该国家暂无已配置 Provider |
| Empty State Description | Contact our team to confirm coverage and available trust-provider routes. | 请联系团队确认该国家的覆盖能力与可用信任服务路径。 |
| Empty State CTA | Contact Sales | 联系销售 |

#### P3 Provider Card List

| 内容项 | English 定稿 | 简体中文定稿 |
|---|---|---|
| Section Title | Featured CA and trust providers | Featured CA 与信任服务商 |
| Section Description | Browse providers used for digital signatures, electronic seals, and eID authentication across supported markets. | 浏览可用于数字签名、电子印章和 eID 认证场景的 Provider。 |
| Search Placeholder | Search country, CA, TSP, or method | 搜索国家、CA、TSP 或方式 |
| Clear Filters | Clear filters | 清除筛选 |
| Card CTA | Learn more | 了解更多 |
| No Result Title | No matching providers | 暂无匹配 Provider |
| No Result Description | Clear filters or contact sales to confirm coverage for your market. | 请清除筛选，或联系销售确认目标市场覆盖能力。 |
| Pagination Previous | Previous | 上一页 |
| Pagination Next | Next | 下一页 |
| Pagination Rule | Show 9 providers per page. Show pagination only when results exceed 9 providers. | 每页展示 9 个 Provider；仅当结果超过 9 个 Provider 时显示翻页。 |

P3 第一页默认 9 个卡片定稿如下。正式上线前内容负责人需确认 Provider 状态、国家覆盖和 logo 授权；文案不得补充未经确认的法律效力或覆盖数量承诺。若 Provider 总数超过 9 个，后续 Provider 按 `featured`、`sortOrder`、匹配度和名称排序进入第 2 页及后续页。

| # | Provider | Category | English card content | 简体中文卡片内容 |
|---:|---|---|---|---|
| 1 | ABA | ESIGNATURE | Certificate-backed signing option for Dominican Republic workflows, maintained as sales-assisted coverage. | 面向多米尼加共和国签署场景的证书签署选项，由销售协助确认覆盖。 |
| 2 | Adacom One-Shot | ESIGNATURE | One-shot signing option for guided certificate signing flows where a reusable digital ID is not required. | 适用于一次性证书签署流程的 Provider 选项，不要求用户预先持有可复用数字身份。 |
| 3 | Audkenni | ESIGNATURE | Nordic trust-provider option for online document signing workflows. | 面向北欧线上文件签署场景的信任服务 Provider 选项。 |
| 4 | Belgian ID Card | EID AUTHENTICATION | Belgian eID option for identity-backed signing and authentication journeys. | 面向比利时 eID 场景的身份认证与签署路径选项。 |
| 5 | BORICA B-trust | ESIGNATURE | Bulgaria-focused trust-provider option for certificate-backed document signing. | 面向保加利亚市场的证书签署 Provider 选项。 |
| 6 | certSIGN WebSign | ESIGNATURE | Web-based certificate signing option for supported European signing workflows. | 面向欧洲相关签署场景的 Web 证书签署选项。 |
| 7 | Chave Movel | EID AUTHENTICATION | Portugal mobile identity option for identity-backed signing and login flows. | 面向葡萄牙移动身份场景的签署与登录认证选项。 |
| 8 | Czech ID Card | EID AUTHENTICATION | Czech eID option for identity-backed authentication and signing journeys. | 面向捷克 eID 场景的身份认证与签署路径选项。 |
| 9 | DIIA | EID AUTHENTICATION | Mobile-first identity option for supported Ukraine identity and signing flows. | 面向乌克兰相关移动身份场景的认证与签署选项。 |

#### P4 Feature Block

| 内容项 | English 定稿 | 简体中文定稿 |
|---|---|---|
| Section Title | Plan high-trust signing by market | 按市场规划高信任签署 |
| Section Description | CA Hub helps teams compare provider paths before routing signers into digital signature, eSeal, or eID workflows. | CA Hub 帮助团队在设计数字签名、电子印章或 eID 流程前，对比不同市场的 Provider 路径。 |

| Feature | English Title | English Content | 简体中文标题 | 简体中文内容 |
|---|---|---|---|---|
| 1 | Coverage by market | Select a country and see which providers are configured for that market. | 按市场查看覆盖 | 选择国家后，查看该市场已配置的 Provider。 |
| 2 | Assurance-aware routing | Compare provider type, status, signature level, and supported use before implementation. | 按保证等级规划路径 | 在落地前对比 Provider 类型、状态、签名等级和支持用途。 |
| 3 | Provider data in one place | Keep CA, QTSP, TSP, and identity-provider coverage maintained in Strapi. | 集中维护 Provider 数据 | 在 Strapi 中集中维护 CA、QTSP、TSP 和身份 Provider 覆盖信息。 |
| 4 | Sales-assisted rollout | Use coverage data to start a focused conversation with Nota Sign. | 销售协助落地 | 基于覆盖数据，与 Nota Sign 开启更聚焦的方案沟通。 |

#### P5 Final CTA

| 内容项 | English 定稿 | 简体中文定稿 |
|---|---|---|
| Section Title | Plan your CA routing with Nota Sign | 与 Nota Sign 一起规划 CA 路由 |
| Section Description | Tell us where your signers are and what assurance level you need. We will help map the right provider path. | 告诉我们签署人所在市场和所需保证等级，我们将协助匹配合适的 Provider 路径。 |
| Primary CTA | Contact Sales | 联系销售 |

## 4. 功能定义与能力契约

### 4.1 功能定义

| 功能 | 分类 | 适用对象 | 触发方式 | 默认规则 | 完成条件 | 结果产物 |
|---|---|---|---|---|---|---|
| CA 门户入口 | Portal PC 导航 | 官网访客 | Products 导航点击 | CMS `showInMainNav=true` 后可见 | 可进入 CA 官网页 | 可见导航项和可访问 URL |
| CA 官网页 Hero | 页面内容 | 官网访客 | 打开页面 | 展示 CMS 配置内容 | Hero 文案、CTA、视觉正常 | P1 首屏 |
| Interactive Map | 页面交互 | 官网访客 | Hover/focus/click 国家 | 默认展示全部有数据国家；可选中默认国家 | 选中国家后显示 CA 列表 | P2 地图和国家列表 |
| Provider Card List | 页面内容、筛选与分页 | 官网访客 | 页面默认展示、筛选或翻页 | 每页 9 个 Provider，超过 9 个显示翻页 | 卡片字段完整，筛选和分页结果正确 | P3 3x3 卡片列表与分页控件 |
| Feature Block | 页面内容 | 官网访客 | 下滑浏览 | CMS 配置 3-4 个 feature | 内容展示完整 | P4 能力解释区 |
| Final CTA | 转化 | 官网访客 | 点击 CTA | 跳转 Contact Sales 或 CMS 配置链接 | 链接可访问并携带可选 query | P5 转化入口 |
| CA 数据维护 | Strapi CMS | CMS 编辑 | 新增/编辑/发布 | 草稿不展示，发布后展示 | 国家/Provider 数据被 Portal 读取 | CMS 数据和公开接口 |

### 4.2 功能需求（FR 能力契约）

#### FR1. Portal PC 入口与路由

| 编号 | 需求 |
|---|---|
| FR1.1 | 官网访客可在 Portal PC 主导航进入 CA 官网页，默认入口位于 Products 导航。 |
| FR1.2 | Portal PC 必须支持稳定公开路径 `/product/ca-hub`，并遵循现有多语言路径规则。 |
| FR1.3 | 导航文案、页面 URL、canonical、hreflang 必须与当前 locale 一致。 |
| FR1.4 | 入口上线不得影响 Products 下既有产品项的跳转、排序和 fallback 行为。 |

#### FR2. P1 Hero

| 编号 | 需求 |
|---|---|
| FR2.1 | 官网访客打开页面后，首屏必须明确识别为全球 CA 能力页，而不是普通产品详情页或营销落地页。 |
| FR2.2 | Hero 必须包含 eyebrow、H1、描述、主 CTA、次 CTA。 |
| FR2.3 | 主 CTA 默认跳转 P2 Map 或 P3 Directory 锚点；次 CTA 默认跳转 Contact Sales。 |
| FR2.4 | Hero 背景或媒体不得使用虚化地图截图；如使用地图/地球视觉，必须使用清晰矢量或高 DPI 资源。 |

#### FR3. P2 Interactive Map

| 编号 | 需求 |
|---|---|
| FR3.1 | 官网访客可在地图上 hover/focus 国家并看到国家名称和可用 Provider 数量。 |
| FR3.2 | 官网访客点击国家后，地图区域内必须出现选中国家详情面板，展示国家名称、Provider 数量和 Provider 列表。 |
| FR3.3 | Provider 数量必须按该国家关联的 published Provider 实时计算；同一 Provider 覆盖多个国家时，在当前国家只计数一次。 |
| FR3.4 | Provider 列表至少展示 Provider 名称、logo 或 fallback、category/providerType、status；可补充 signatureLevels、supportedUses 和 Learn more。 |
| FR3.5 | 有 Provider 数据的国家必须有明显可点击状态；无数据国家不得伪装成已覆盖。 |
| FR3.6 | 选中国家后，地图高亮、国家详情面板、Provider 数量、Provider 列表、P3 卡片筛选和 URL query 必须保持一致。 |
| FR3.7 | 国家筛选必须基于 Provider 与国家的多对多关系；同一个 Provider 关联 N 个国家时，点击任一已关联国家都应展示该 Provider。 |
| FR3.8 | 国家列表必须有键盘可访问路径，地图不能是唯一操作方式。 |
| FR3.9 | 移动端默认采用搜索/国家选择优先；点击国家后 Provider 数量和 Provider 列表展示在地图下方或 bottom sheet，不依赖 hover。 |
| FR3.10 | 地图动效目标 60fps，使用 transform/opacity 等低开销方式；支持 `prefers-reduced-motion` 降低动画。 |

#### FR4. P3 Provider Card List

| 编号 | 需求 |
|---|---|
| FR4.1 | P3 必须按每页 9 个 Provider 卡片展示，桌面布局为 3x3。 |
| FR4.2 | 每张卡片字段必须包含：小 logo、类别标签、Provider 名称、短描述、Learn more 链接。 |
| FR4.3 | 类别标签使用英文短标签，保持与 EID Easy card 类似的密度，例如 `ESIGNATURE`、`EID AUTHENTICATION`、`ESEALING`。 |
| FR4.4 | 同一断点下卡片必须等宽等高；Tablet 为 2 列，Mobile 为 1 列。 |
| FR4.5 | 卡片短描述必须控制长度，超长内容不挤压布局。 |
| FR4.6 | `Learn more` 链接由 Strapi 配置；未配置时默认指向 Contact Sales，并携带 Provider slug query。 |
| FR4.7 | 当 P2 选中国家后，P3 必须同步展示该国家相关 Provider；少于 9 个时展示实际数量，不补假数据；多于 9 个时按每页 9 个分页。 |
| FR4.8 | 同一个 Provider 覆盖多个国家时，P3 必须按 Provider slug 去重展示，不得因为多国家关系复制多张相同 Provider 卡片。 |
| FR4.9 | P3 结果超过 9 个 Provider 时必须显示分页控件，结构为 Previous、页码、Next；当前页码高亮，第一页禁用 Previous，最后一页禁用 Next。 |
| FR4.10 | P3 搜索、筛选、P2 国家选择变化后，分页必须回到第 1 页，并同步 URL query 中的 `page` 状态。 |

#### FR5. P4 Feature Block

| 编号 | 需求 |
|---|---|
| FR5.1 | P4 必须展示 3-4 个功能价值点，解释用户为什么需要 CA 能力页。 |
| FR5.2 | Feature 内容必须围绕国家覆盖、保证等级、Provider 路由、销售协助，不扩展到真实签署接入承诺。 |
| FR5.3 | Feature Block 可由 Strapi 配置标题、说明、卡片标题、卡片描述、图标或轻量视觉。 |

#### FR6. P5 Final CTA

| 编号 | 需求 |
|---|---|
| FR6.1 | P5 必须提供明确转化动作，默认 CTA 为 Contact Sales。 |
| FR6.2 | 若用户已选择国家或 Provider，CTA 可携带 `country`、`provider` query，便于销售承接。 |
| FR6.3 | CTA 文案、按钮、链接必须由 Strapi 配置并支持本地化。 |

#### FR7. Strapi 内容与数据

| 编号 | 需求 |
|---|---|
| FR7.1 | Strapi 必须支持维护 CA 官网页 P1、P4、P5 的文案、CTA、SEO、媒体。 |
| FR7.2 | Strapi 必须支持维护国家数据：国家名称、ISO2/ISO3、区域、地图 path id、排序、启用状态。 |
| FR7.3 | Strapi 必须支持维护 Provider 数据：名称、slug、logo、类别、短描述、国家关系、保证等级、支持用途、集成方式、状态、排序、Learn more 链接。 |
| FR7.4 | Provider 与国家必须是多对多关系：一个 Provider 可以覆盖 N 个国家，一个国家也可以关联 N 个 Provider。 |
| FR7.5 | Portal PC 必须根据 Provider-country 多对多关系计算某国家的 CA 列表，不能按“一个国家一条 Provider 记录”的方式复制数据。 |
| FR7.6 | Strapi 草稿状态不得在正式页面展示，发布后才对 Portal PC public 页面可见。 |
| FR7.7 | Strapi public API 仅暴露官网展示需要的 published 字段，不暴露内部备注、草稿、编辑字段。 |
| FR7.8 | Strapi 后台必须支持 CMS 编辑维护 CA Hub settings、国家、Provider、Provider-国家多对多关系、featured 排序、SEO 和媒体资源。 |
| FR7.9 | Strapi 后台必须提供发布前校验：Provider 至少关联 1 个国家，slug 唯一，category/status 必填，P3 第 1 页所需 9 个 Provider 必须处于可展示状态。 |
| FR7.10 | Strapi 后台必须支持预览与发布工作流，CMS 编辑可在发布前预览 Portal PC 页面效果，正式页面只读取 published 数据。 |

### 4.3 配置项

| 配置项 | 默认值/规则 | 可编辑位置 |
|---|---|---|
| 导航文案 | `CA Hub` / `全球 CA 能力` / 繁中本地化 | Strapi Page navLabel |
| 导航分组 | Products | Strapi Page navGroup |
| 导航排序 | 排在 Digital Signature/eSeal/Identify 附近，具体排序由产品确认 | Strapi Page navOrder |
| 页面路径 | `/product/ca-hub` | Portal PC 路由 + Strapi slug |
| Hero 文案 | CMS 配置 | CA Hub settings 或 Page 专用字段 |
| Provider page size | 固定每页 9 个 | Portal PC 固定规则，Strapi 不提供随意改页大小入口 |
| Featured Providers | 用于 P3 第 1 页排序，至少保证 9 个可展示 Provider | Strapi Provider featured/sortOrder 或 settings 关系 |
| 国家默认选择 | 默认无选中；可配置 featured country | Strapi settings |
| Empty state | CMS 配置 | Strapi settings |
| Final CTA | 默认 Contact Sales | Strapi settings |

## 5. 入口、流程与交互

### 5.1 入口与主流程

1. CMS 编辑在 Strapi 创建或维护 CA 导航记录，配置 `slug=ca-hub`、`navGroup=Products`、`showInMainNav=true`、本地化 `navLabel`。
2. Portal PC Products 导航读取 Strapi 导航数据并展示 CA 入口。
3. 官网访客点击 CA 入口进入 `/product/ca-hub`。
4. 页面按 P1-P5 顺序渲染。
5. 用户点击 P1 CTA 跳转 P2。
6. 用户点击 P2 国家，系统在地图区域展示该国家 Provider 数量和 Provider 列表，并同步 P3 筛选。
7. 用户在 P3 可搜索、筛选和翻页浏览 Provider；点击 Learn more 或 P5 CTA，进入 Contact Sales 或 CMS 配置链接。

### 5.2 页面与交互逻辑

| 角色 + 页面 | 用户动作 | 默认状态 | 系统反馈 | 异常处理 |
|---|---|---|---|---|
| 官网访客 + Products 导航 | Hover/click Products | Products 下出现 CA 入口 | 点击跳转 CA 页面 | CMS 导航失败时 fallback 不应破坏既有 Products 链接 |
| 官网访客 + P1 Hero | 点击 Explore coverage | Hero 展示主文案和 CTA | 平滑滚动到 P2 | 锚点不存在时跳转 P3 Directory |
| 官网访客 + P2 Map | Hover 国家 | tooltip 隐藏 | 显示国家名和 Provider 数量 | 无数据国家显示 `No provider configured yet` 或本地化文案 |
| 官网访客 + P2 Map | Click 国家 | 无选中或默认选中 | 国家高亮，详情面板显示国家名称、Provider 数量和 Provider rows，URL query 更新，P3 同步筛选 | 国家已下线则回到默认状态；无 Provider 时显示空状态和 Contact Sales |
| 官网访客 + P2 国家搜索 | 输入国家名 | 搜索框空 | 匹配国家，回车可选择 | 无结果显示空状态 |
| 官网访客 + P3 Cards | 输入搜索或点击筛选 | 默认第 1 页展示 9 张卡 | 卡片列表更新，结果数更新，分页回到第 1 页，Clear filters 出现 | 无结果显示清除筛选和 Contact Sales，隐藏分页 |
| 官网访客 + P3 Pagination | 点击 Previous、页码、Next | 当结果数超过 9 时显示分页 | 切换到目标页，当前页码高亮，URL query 更新 `page` | 第 1 页禁用 Previous，最后一页禁用 Next；结果小于等于 9 时隐藏分页 |
| 官网访客 + P3 Cards | 点击 Learn more | 链接可点击 | 跳转 CMS 配置 URL | 未配置 URL 时跳转 Contact Sales |
| CMS 编辑 + Strapi | 发布 Provider | 必填字段已填写 | Portal PC 展示新数据 | 缺 logo 使用 monogram fallback；缺必填字段阻止发布或不展示 |

### 5.3 状态与校验

| 状态 | 规则 |
|---|---|
| Loading | 地图和卡片数据加载时使用 skeleton 或轻量占位，不出现布局跳动。 |
| Empty country | 国家存在但无 Provider，显示空状态和 Contact Sales，不显示假 Provider。 |
| Empty search | 搜索无结果时显示 Clear filters 和 Contact Sales。 |
| Pagination | P3 结果超过 9 个 Provider 时显示翻页；筛选、搜索、国家选择变化后自动回到第 1 页。 |
| Error | Strapi 数据请求失败时展示静态兜底内容和 Contact Sales，并记录前端错误；页面不白屏。 |
| Disabled provider | Provider 状态为 `Planned` 或 `Needs confirmation` 时可展示状态，但不得作为已可用能力表达。 |
| Draft data | Strapi 草稿不得出现在正式页面。 |
| Locale fallback | 当前 locale 无 CA 内容时，可按现有产品页模式回退英文 canonical，但不得在当前语言 URL 渲染英文副本。 |
| Reduced motion | 用户系统开启 reduced motion 时，关闭地图动画和滚动增强动效。 |

## 6. 业务规则

| 规则 | 内容 |
|---|---|
| BR1. 不写虚假覆盖 | 页面不得使用未经 Nota Sign 数据确认的全球覆盖数量、国家数量、Provider 数量。 |
| BR2. 数据来源 | 国家、Provider、关系、状态、排序、logo、卡片文案必须来源于 Strapi。Portal PC 仅允许保留地图 SVG path 和展示逻辑。 |
| BR3. 状态表达 | Provider 状态至少区分 `Available`、`Sales-assisted`、`Planned`、`Needs confirmation`；只有已确认状态可作为支持列表中的可用能力展示。 |
| BR4. 法律表达 | 保证等级、QES/AES/SES、QTSP、CA 等字段仅作为展示分类，不得写成对所有使用场景的法律效力承诺。 |
| BR5. Learn more | 本期不新增 Provider 详情页；`Learn more` 必须有 CMS 可配置链接和默认 Contact Sales fallback。 |
| BR6. 导航入口 | CA 当前无门户入口，本期上线必须新增入口并可通过主导航访问。 |
| BR7. 视觉清晰 | 地图不得使用低清或被拉伸的 raster 贴图；地图线条和国家边界在桌面 Retina 和普通屏幕均应清晰。 |
| BR8. 性能 | 地图 hover/click 不得触发全页面重排；Provider 筛选使用前端轻量筛选或合理缓存。 |

## 7. 数据、结果与产物

### 7.1 Strapi 数据模型要求

#### 7.1.1 Page 导航记录

沿用现有 `api::page.page` 作为导航入口承载：

| 字段 | 要求 |
|---|---|
| title | 全球 CA 能力页对应的本地化 title |
| slug | `ca-hub` |
| pageType | 默认 `Products`；若新增专用 pageType，需同时改 Portal PC 取数与 sitemap |
| showInMainNav | `true` |
| navLabel | 本地化：`CA Hub` / `全球 CA 能力` / 繁中 |
| navGroup | `Products` |
| navOrder | 与产品导航顺序一致，由产品确认 |
| seo | 配置 meta title、description、canonical、ogImage |

#### 7.1.2 Single Type: `ca-hub-settings`

| 字段 | 类型 | 本地化 | 必填 | 说明 |
|---|---|---:|---:|---|
| heroEyebrow | string | 是 | 否 | P1 eyebrow |
| heroTitle | string | 是 | 是 | P1 H1 |
| heroDescription | text/richtext | 是 | 是 | P1 描述 |
| primaryCtaLabel | string | 是 | 是 | P1 主 CTA |
| primaryCtaUrl | string | 是 | 是 | 默认 `#ca-map` |
| secondaryCtaLabel | string | 是 | 否 | P1 次 CTA |
| secondaryCtaUrl | string | 是 | 否 | 默认 `/contact` |
| mapTitle | string | 是 | 是 | P2 标题 |
| mapDescription | text | 是 | 否 | P2 描述 |
| searchPlaceholder | string | 是 | 是 | P2/P3 搜索 placeholder |
| providerDirectoryTitle | string | 是 | 是 | P3 标题 |
| providerDirectoryDescription | text | 是 | 否 | P3 描述 |
| providerPageSize | integer | 否 | 是 | P3 每页数量，固定为 9，不开放 CMS 编辑 |
| featuredProviders | relation manyToMany -> ca-provider | 否 | 是 | P3 第 1 页优先展示 Provider，至少 9 个 |
| paginationPreviousLabel | string | 是 | 是 | P3 Previous 文案 |
| paginationNextLabel | string | 是 | 是 | P3 Next 文案 |
| featureTitle | string | 是 | 是 | P4 标题 |
| features | repeatable component | 是 | 是 | P4 3-4 项 |
| finalCtaTitle | string | 是 | 是 | P5 标题 |
| finalCtaDescription | text | 是 | 否 | P5 描述 |
| finalCtaButtonLabel | string | 是 | 是 | P5 CTA |
| finalCtaButtonUrl | string | 是 | 是 | 默认 `/contact` |
| emptyStateTitle | string | 是 | 是 | 空状态标题 |
| emptyStateDescription | text | 是 | 否 | 空状态描述 |
| seo | component shared.seo | 是 | 是 | 页面 SEO，可与 Page SEO 统一或同步 |

#### 7.1.3 Collection Type: `ca-country`

| 字段 | 类型 | 本地化 | 必填 | 说明 |
|---|---|---:|---:|---|
| name | string | 是 | 是 | 国家显示名 |
| iso2 | string | 否 | 是 | ISO2，唯一 |
| iso3 | string | 否 | 否 | ISO3 |
| region | enum | 否 | 是 | Europe、North America、Latin America、Asia Pacific、Middle East、Africa、Global |
| mapPathId | string | 否 | 否 | 与 SVG path 对应 |
| enabled | boolean | 否 | 是 | 是否启用 |
| sortOrder | integer | 否 | 否 | 排序 |
| providers | relation manyToMany -> ca-provider | 否 | 否 | 支持该国家的 Provider；与 `ca-provider.countries` 同步表达多对多覆盖关系 |

#### 7.1.4 Collection Type: `ca-provider`

| 字段 | 类型 | 本地化 | 必填 | 说明 |
|---|---|---:|---:|---|
| name | string | 否 | 是 | Provider 名称 |
| slug | uid | 否 | 是 | 唯一 slug |
| logo | media image | 否 | 否 | 小 logo |
| category | enum | 否 | 是 | `ESIGNATURE`、`EID AUTHENTICATION`、`ESEALING` 等 |
| providerType | enum | 否 | 是 | CA、QTSP、TSP、Identity Provider、Bank ID、Government eID |
| cardSummary | text | 是 | 是 | P3 短描述，建议不超过 140 English chars 或等量中文 |
| countries | relation manyToMany -> ca-country | 否 | 是 | 覆盖国家；允许一个 Provider 同时覆盖 N 个国家 |
| signatureLevels | multi enum | 否 | 否 | SES、AES、QES |
| supportedUses | multi enum | 否 | 否 | Digital signature、Electronic seal、eID authentication |
| integrationFlows | multi enum | 否 | 否 | Redirect、API、Mobile app、USB token、One-shot |
| status | enum | 否 | 是 | Available、Sales-assisted、Planned、Needs confirmation |
| featured | boolean | 否 | 否 | 是否优先进入 P3 第 1 页排序 |
| sortOrder | integer | 否 | 否 | 卡片排序 |
| learnMoreUrl | string | 是 | 否 | Learn more 链接 |
| sourceUrl | string | 否 | 否 | 内部溯源，不对 public 暴露 |
| internalNotes | richtext | 是 | 否 | 内部备注，不对 public 暴露 |

### 7.2 Strapi 后台管理需求

#### 7.2.1 后台菜单与内容管理对象

| 后台对象 | 类型 | 编辑用途 | 关键要求 |
|---|---|---|---|
| CA Hub Settings | Single Type | 维护 P1/P2/P3/P4/P5 文案、CTA、P3 第 1 页 Provider、翻页文案、空状态、SEO。 | 支持 i18n、draft/publish、preview；featuredProviders 上线前至少配置 9 个 published Provider。 |
| CA Countries | Collection Type | 维护国家基础信息和地图匹配信息。 | `iso2` 唯一；可启用/停用；可按 region 和 sortOrder 管理展示顺序。 |
| CA Providers | Collection Type | 维护 Provider 卡片、能力字段、状态、国家覆盖关系和 Learn more 链接。 | Provider 编辑页必须能一次关联多个国家；同一 Provider 只维护一条记录。 |
| Page 导航记录 | Collection Type | 维护 CA 官网页在 Products 导航中的入口。 | `showInMainNav=true`、`navGroup=Products`、`slug=ca-hub`，本地化 navLabel。 |
| Media Library | Strapi Media | 维护 Provider logo、Hero/Feature 视觉、SEO 图。 | Provider 无 logo 时 Portal PC 使用 fallback；后台不强制 logo 必填。 |

#### 7.2.2 Provider 与国家关系维护

| 规则 | 后台要求 |
|---|---|
| 关系方向 | 推荐以 `ca-provider.countries` 作为主维护入口；CMS 编辑在 Provider 编辑页选择一个或多个覆盖国家。 |
| 关系类型 | 必须是 many-to-many：一个 Provider 可覆盖 N 个国家，一个国家可关联 N 个 Provider。 |
| 国家侧回显 | `ca-country.providers` 可作为回显或辅助编辑，必须与 Provider 侧关系一致。 |
| 去重 | 后台不得要求编辑为每个国家复制一条 Provider；同一 Provider 的唯一识别以 `slug` 为准。 |
| 发布校验 | Provider 发布前至少关联 1 个 enabled 国家；如没有国家关系，正式页面不展示该 Provider。 |
| 下线影响 | 国家 disabled 后，Portal PC 不应再把该国家作为可点击覆盖国家；已关联 Provider 仍可在其他 enabled 国家中展示。 |

#### 7.2.3 字段校验与编辑规则

| 对象 | 校验规则 |
|---|---|
| CA Hub Settings | Hero title、description、mapTitle、featuredProviders、final CTA、SEO 必填；P3 第 1 页至少需要 9 个 published Provider，否则后台需提示不可上线。 |
| CA Country | `name`、`iso2`、`region`、`enabled` 必填；`iso2` 必须唯一且为 2 位大写字母；`mapPathId` 缺失时前端可按 ISO fallback，但需后台提示补齐。 |
| CA Provider | `name`、`slug`、`category`、`providerType`、`cardSummary`、`countries`、`status` 必填；`slug` 唯一；`cardSummary` 超长需提示。 |
| Provider status | `Available`、`Sales-assisted` 可进入默认展示；`Planned`、`Needs confirmation` 可展示状态但不得作为已可用能力表达。 |
| Learn more | `learnMoreUrl` 允许为空；为空时 Portal PC fallback 到 Contact Sales。 |
| 内部字段 | `sourceUrl`、`internalNotes` 仅后台可见，不进入 public API。 |

#### 7.2.4 预览、发布与权限

| 能力 | 要求 |
|---|---|
| 预览 | CMS 编辑可预览 CA Hub 页面，预览态可读取 draft settings/country/provider 数据；预览页必须 noindex。 |
| 发布 | 正式 Portal PC 只读取 published 数据；草稿、未发布关系、内部备注不展示。 |
| 权限 | 只有具备 Strapi 内容编辑权限的角色可创建/编辑/发布 CA Hub settings、country、provider；public 角色只能读取 published 展示字段。 |
| 审核 | 上线前需检查国家覆盖、Provider 状态、卡片数量、SEO、CTA 链接和竞品/法律数字禁用项。 |
| 运营维护 | 后台应支持按国家、region、providerType、status、featured 筛选 Provider，方便运营维护多国家覆盖关系。 |

### 7.3 Portal PC 组件要求

| 组件/页面 | 职责 |
|---|---|
| `pages/product/ca-hub.vue` | CA 官网页固定路由，组装 P1-P5，拉取 settings/countries/providers。 |
| `components/CaHub/CaHero.vue` | P1 Hero。 |
| `components/CaHub/CaInteractiveMap.vue` | P2 地图、hover/focus/click、选中态。 |
| `components/CaHub/CaCountryPanel.vue` | P2 选中国家详情面板，展示国家名称、Provider 数量和 Provider 列表。 |
| `components/CaHub/CaProviderFilters.vue` | P3 搜索与筛选。 |
| `components/CaHub/CaProviderCard.vue` | P3 卡片。 |
| `components/CaHub/CaFeatureBlock.vue` | P4 Feature。 |
| `components/CaHub/CaFinalCta.vue` | P5 CTA。 |

### 7.4 内容 API 要求

本期不新增签署业务 API。Portal PC 需要读取以下 Strapi published 内容：

| 数据 | 读取内容 |
|---|---|
| CA Hub settings | P1/P2/P3/P4/P5 文案、CTA、空状态、featuredProviders、pagination labels、SEO |
| CA countries | name、iso2、iso3、region、mapPathId、enabled、sortOrder |
| CA providers | name、slug、logo、category、providerType、cardSummary、countries、signatureLevels、supportedUses、integrationFlows、status、featured、sortOrder、learnMoreUrl |

接口实现可使用 Strapi REST 或 GraphQL，由研发确认；PRD 要求是 published 数据可被 Portal PC SSR/CSR 稳定读取，并且不会暴露草稿或内部字段。

### 7.5 文档/PDF/文件/审计产物

本需求不生成签署文档、PDF、附件、证书文件、审计报告或历史记录。唯一文件产物是 Strapi media 中上传的 Provider logo、Hero/Feature 视觉资源和页面 SEO 图。

## 8. 非功能、合规与异常处理

### 8.1 非功能与合规要求

| 类别 | 要求 | 验证方式 |
|---|---|---|
| 性能 | 页面首屏不因地图和 Provider 数据导致明显阻塞；地图交互目标 60fps。 | Lighthouse/DevTools trace；地图 hover/click 无持续卡顿。 |
| 清晰度 | 地图使用 SVG/vector 或高 DPI 资源，桌面 2x、普通屏均无明显虚化。 | 1920px 和移动端截图验收。 |
| 可访问性 | 地图国家必须有键盘替代路径；国家列表、搜索、卡片链接有可读 label；tooltip 支持 focus。 | 键盘完整操作；基础 a11y 检查通过。 |
| 本地化 | `zh`、`en`、`zh-HK` 文案、导航、SEO、空状态一致。 | 三语言 URL 逐一验收。 |
| SEO | canonical、hreflang、meta title、description、ogImage、sitemap 正常；preview/noindex 不收录。 | 查看页面 head 与 sitemap。 |
| 安全 | public API 不暴露 `internalNotes`、草稿、sourceUrl 等内部字段。 | API 响应字段检查。 |
| 合规表达 | 不写未经确认的法律效力承诺、认证承诺、覆盖数字。 | 内容审核清单通过。 |
| 兼容 | 既有 Products 导航和产品详情页不受影响。 | 回归 Electronic Signature、Digital Signature、eSeal、Identify 等链接。 |

### 8.2 异常处理

| 异常 | 页面处理 | 验收点 |
|---|---|---|
| Strapi settings 请求失败 | 展示基础兜底文案和 Contact Sales，不白屏。 | 页面可访问，控制台无阻断错误。 |
| countries 请求失败 | P2 展示错误降级和联系销售。 | P1/P3/P5 仍可展示。 |
| providers 请求失败 | P3 展示错误降级，P2 国家面板提示数据暂不可用。 | 页面不崩溃。 |
| Provider 无 logo | 使用中性 monogram fallback。 | 卡片布局不变形。 |
| 国家 query 不存在 | 回到默认视图，不报错。 | URL 手动输入无效国家可恢复。 |
| 当前 locale 无内容 | 按现有产品页规则回退英文 canonical 或展示本地化空状态。 | 不在中文 URL 渲染英文副本。 |
| 草稿未发布 | 正式页面不显示该数据。 | Strapi draft/publish 验收。 |

## 9. 文案定稿与 CMS 默认值

P1-P5 的 section title、description、CTA、P3 第 1 页 9 个卡片内容和分页文案以 `3.6 页面 Sections 定稿` 为准。以下为页面通用文案和关键 microcopy 的 CMS 默认值，正式上线不得改成未经产品确认的新口径。

| 位置 | English | 简体中文 |
|---|---|---|
| 导航 | CA Hub | 全球 CA 能力 |
| P1 Eyebrow | CA Hub | CA Hub |
| P1 H1 | Find the right CA for every signing market | 为每个签署市场找到合适的 CA |
| P1 Description | Explore certificate authorities, trust providers, and identity methods by country, assurance level, and signing workflow. | 按国家、保证等级和签署场景，探索 CA、信任服务商与身份认证方式。 |
| P1 Primary CTA | Explore coverage | 查看覆盖能力 |
| P1 Secondary CTA | Contact Sales | 联系销售 |
| P2 Title | Explore CA coverage by country | 按国家查看 CA 覆盖 |
| P2 Description | Select a country to see available providers, coverage status, and supported signing methods. | 选择一个国家，查看可用 Provider、覆盖状态和支持的签署方式。 |
| P2 Count | `{count} providers available` | 已支持 `{count}` 个 Provider |
| P2 List Title | Providers in `{country}` | `{country}` 支持的 Provider |
| P2 Empty | No provider configured yet | 该国家暂无已配置 Provider |
| P2 Empty Description | Contact our team to confirm coverage and available trust-provider routes. | 请联系团队确认该国家的覆盖能力与可用信任服务路径。 |
| P3 Title | Featured CA and trust providers | Featured CA 与信任服务商 |
| P3 Description | Browse providers used for digital signatures, electronic seals, and eID authentication across supported markets. | 浏览可用于数字签名、电子印章和 eID 认证场景的 Provider。 |
| P3 Search | Search country, CA, TSP, or method | 搜索国家、CA、TSP 或方式 |
| P3 Clear | Clear filters | 清除筛选 |
| P3 Learn more | Learn more | 了解更多 |
| P3 No Result | No matching providers | 暂无匹配 Provider |
| P4 Title | Plan high-trust signing by market | 按市场规划高信任签署 |
| P4 Description | CA Hub helps teams compare provider paths before routing signers into digital signature, eSeal, or eID workflows. | CA Hub 帮助团队在设计数字签名、电子印章或 eID 流程前，对比不同市场的 Provider 路径。 |
| P5 Title | Plan your CA routing with Nota Sign | 与 Nota Sign 一起规划 CA 路由 |
| P5 Description | Tell us where your signers are and what assurance level you need. We will help map the right provider path. | 告诉我们签署人所在市场和所需保证等级，我们将协助匹配合适的 Provider 路径。 |
| P5 CTA | Contact Sales | 联系销售 |

## 10. 验收标准

| 编号 | 验收标准 |
|---|---|
| AC1 | Portal PC Products 导航出现 CA 入口，点击后进入 `/product/ca-hub` 对应 locale 页面。 |
| AC2 | 既有 Products 导航项仍可正常跳转，排序和展示不被 CA 入口破坏。 |
| AC3 | CA 页面按 P1 Hero、P2 Interactive Map、P3 paginated cards、P4 Feature Block、P5 Final CTA 顺序展示。 |
| AC4 | P1 Hero 包含 eyebrow、H1、描述、主 CTA、次 CTA，CTA 链接可用。 |
| AC5 | P2 地图上有数据国家可 hover/focus/click；点击后国家高亮，并在地图区域展示国家名称、Provider 数量和该国家支持的 Provider 列表。 |
| AC6 | P2 无数据国家不展示假覆盖，必须有空状态和 Contact Sales。 |
| AC7 | 选中国家后，URL query、P2 选中态、P2 Provider 数量、P2 Provider 列表、P3 卡片筛选结果保持一致；Provider 数量必须等于去重后的 published Provider 列表数量。 |
| AC8 | 移动端可通过搜索或国家选择完成国家选择，不依赖精细地图点击。 |
| AC9 | P3 每页展示 9 个 Provider 卡片，桌面为 3x3，Tablet 为 2 列，Mobile 为 1 列；结果超过 9 个时显示 Previous、页码、Next 翻页控件，当前页高亮；点击 Previous、页码或 Next 后列表和 URL `page` query 同步更新。 |
| AC10 | P3 卡片字段完整：logo 或 fallback、类别标签、Provider 名称、短描述、Learn more。 |
| AC11 | P3 卡片同一断点等宽等高，最长 Provider 名称和描述不溢出、不遮挡。 |
| AC12 | `Learn more` 链接可由 CMS 配置；未配置时跳转 Contact Sales 并携带 Provider slug query。 |
| AC13 | Strapi 后台可维护 CA Hub Settings，并可编辑 P1/P2/P3/P4/P5 文案、CTA、P3 第 1 页 Provider、翻页文案、空状态和 SEO。 |
| AC14 | Strapi 后台可新增/编辑/发布国家和 Provider；Provider 编辑页可一次关联多个国家。 |
| AC15 | 一个 Provider 关联多个国家后，点击任一已关联国家都能展示该 Provider；P3 不出现重复 Provider 卡片。 |
| AC16 | Strapi 后台发布前校验生效：Provider 缺国家、slug 重复、必填字段缺失、P3 第 1 页不足 9 个可展示 Provider 时需提示。 |
| AC17 | Strapi 后台草稿预览可查看页面效果；正式 Portal PC 页面只展示 published 数据。 |
| AC18 | Strapi public API 不返回内部备注、sourceUrl、草稿字段。 |
| AC19 | 页面支持 `zh`、`en`、`zh-HK` 的导航、正文、空状态、SEO；缺 locale 时按既有 fallback 规则处理。 |
| AC20 | 页面 canonical、hreflang、meta title、description、ogImage、sitemap 收录规则正确；preview 页面 noindex 或不进 sitemap。 |
| AC21 | 地图在桌面和移动端截图中无明显虚化；交互动效目标 60fps，开启 reduced motion 后降低动画。 |
| AC22 | Strapi 请求失败、空数据、无 logo、无搜索结果、无效 URL query 均有降级状态，页面不白屏。 |
| AC23 | 页面内容不出现未经确认的覆盖数量、法律效力保证、真实接入承诺。 |
| AC24 | 信封创建、模板、控件、签署端、审计、最终 PDF、通知、Open API/Webhook、套餐权益回归无行为变化。 |

## 11. BMAD 质量门禁与 Party Mode 摘要

### 11.1 Targeted Questions

无阻塞问题。版本号已由用户确认 `1.16.1`，需求标题已由用户最终修正为 `全球CA能力官网页-1.16.1`，页面结构和 Portal PC/Strapi 范围已明确。

### 11.2 BMAD Gate

| 检查项 | 结论 |
|---|---|
| 标题规则 | 通过，使用用户最终标题。 |
| 工程证据 | 通过，已完成 Graphify Gate，并扫描 Portal PC/Strapi 关键路径。 |
| 影响范围 | 通过，已覆盖官网、Strapi、TSP 展示和签署主链路排除项。 |
| 可实现性 | 通过，明确 Portal PC 固定交互页 + Strapi 数据模型，避免将交互地图塞进普通动态区块。 |
| 风险控制 | 通过，加入无入口、无虚假覆盖数字、无法律效力承诺、地图清晰度和 60fps 要求。 |

### 11.3 Party Mode 决策摘要

| 角色 | 关键意见 | 已落实到 PRD |
|---|---|---|
| UX | 地图不能成为唯一操作路径，移动端应搜索/国家选择优先。 | FR3、交互逻辑、AC8。 |
| Frontend | 需要固定路由和组件化实现，地图用清晰矢量或高 DPI，不硬编码 Provider。 | FR1、FR3、FR7、7.3、AC21。 |
| Backend/Strapi | 需要国家、Provider、settings 数据模型、后台维护关系、多国家覆盖关系和 public API 字段边界。 | 7.1、7.2、7.4、AC13、AC14、AC15、AC16、AC17、AC18。 |
| QA/Test | 必须覆盖空状态、无效 query、草稿不可见、既有导航回归、无业务链路影响。 | 8.2、AC17、AC22、AC24。 |

## PRD 评分

总分：9.1/10

评分明细：

| 维度 | 分数 |
|---|---:|
| 业务目标与范围 | 1.0/1 |
| 用户旅程与角色 | 0.95/1 |
| 影响范围扫描 | 1.0/1 |
| 工程/API 约束 | 0.9/1 |
| UX 交互逻辑与状态边界 | 0.95/1 |
| 数据/API/结果处理 | 1.35/1.5 |
| 兼容性与模块边界 | 1.0/1 |
| 验收标准 | 1.0/1 |
| 监管/TSP/行业/市场风险 | 0.65/0.75 |
| 表达质量 | 0.7/0.75 |

结论：达到 8 分交付线，可进入 UX/技术方案拆解。剩余风险主要是 UI 设计稿需最终确认 P3 卡片精确尺寸，以及研发需验证 Nuxt 静态 `/product/ca-hub.vue` 与现有 `/product/[slug].vue` 的路由优先级。
