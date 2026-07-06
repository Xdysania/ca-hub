# CA Hub 独立预览项目

与 `gitlab.fabigbig/front-oversea-pc` **完全解耦**，可单独开发与预览 CA Hub 官网页。

## 预览地址

```bash
cd CA_HUB
npm install
npm run dev
```

浏览器打开：**http://localhost:55857/product/ca-hub**

多语言路径：
- `http://localhost:55857/en/product/ca-hub`
- `http://localhost:55857/zh/product/ca-hub`
- `http://localhost:55857/zh-HK/product/ca-hub`

## 项目结构

```
CA_HUB/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.js
    ├── App.vue
    ├── router/          # 路由
    ├── i18n/            # 国际化
    ├── pages/           # CaHubPage.vue 页面入口
    ├── components/      # P1–P5 各区块组件
    └── styles/          # 全局样式
```

## 构建

```bash
npm run build    # 输出到 dist/
npm run preview  # 预览构建产物
```

## 说明

- 当前使用 **mock 数据**，后续可替换为 Strapi API
- 端口默认 `55857`，可在 `vite.config.js` 修改
- 需求文档见 `全球CA能力官网页-1.16.1.md`
