# 白怿个人主页 · 工程说明

## 文件夹结构

```
markbunee.github.io/
├── index.html          # 入口页：加载动画 + 主页（第一页）
├── README.md           # 本说明
├── css/
│   └── style.css       # 全局样式、导航、Hero、主页与内页布局
├── js/
│   └── main.js         # 首页加载时长与主内容显隐
├── pages/
│   ├── resume.html     # 简历页
│   └── notice.html     # 公告页
└── assets/             # 静态资源，加载视频请放 loading.mp4
```

## 页面与导航

- **打开界面**：加载阶段为黑色背景 + 居中加载视频 + 中间白色文字「MedCraft」，约 2.5 秒后过渡到第一页。视频路径：`assets/loading.mp4`（请自行放入视频文件）。
- **第一页（主页）**：黑色背景，居中显示同一段视频与白色「MedCraft」。
- **右上角导航**（三个按钮）：
  1. **主页** → `index.html`（第一页）。
  2. **简历** → `pages/resume.html`。
  3. **公告** → `pages/notice.html`。

## 使用方式

- 本地：用浏览器直接打开 `index.html`，或使用本地服务器（如 `npx serve .`）避免部分路径问题。
- 部署：将整个文件夹推送到 GitHub 仓库 `markbunee.github.io` 即可通过 `https://markbunee.github.io` 访问。
