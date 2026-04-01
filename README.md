# 智能温室大棚监测小程序 · Smart Greenhouse Monitoring

![WeChat Mini Program](https://img.shields.io/badge/WeChat-MiniProgram-07C160?style=for-the-badge&logo=wechat&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=222)
![MQTT over WebSocket](https://img.shields.io/badge/MQTT-WebSocket-660066?style=for-the-badge&logo=eclipsemosquitto&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-WeChat%20DevTools-2B2B2B?style=for-the-badge)

一个面向物联网（IoT）教学与实训场景的微信小程序项目，围绕 **温室环境实时监测**、**MQTT 数据接入**、**ESP32 摄像头预览** 展开。  
项目采用原生小程序技术栈，页面结构由 WXML 组织，样式由 WXSS 定义，业务逻辑由 JS 驱动，配置由 JSON 管理，适合课程设计、毕业设计和硬件联调实验快速落地。

---

## ✨ 功能特性（Features）

- 🌱 **首页引导（Home Dashboard）**：展示系统简介、功能入口、运行状态和作者信息，支持一键跳转传感器页面。
- 📡 **MQTT 实时监测（Sensor Monitor）**：通过 `wx.connectSocket` 与 MQTT Broker 建立 WebSocket 连接，手动完成 CONNECT / SUBSCRIBE 报文发送，实时接收并解析环境数据。
- 🚨 **阈值告警（Threshold Alarm）**：温度、湿度、水位、空气质量异常时触发 UI 高亮与振动提醒，提升告警可感知性。
- 📷 **ESP32-CAM 预览（Camera Stream）**：支持 IP 输入智能补全（协议、端口、路径），并提供连接历史记录与快速回填。
- 💾 **本地持久化（Local Storage）**：MQTT 参数与摄像头历史记录使用 `wx.setStorageSync` / `wx.getStorageSync` 保存，重启后可继续使用。
- 🎨 **移动端友好 UI（Mobile-first UI）**：使用 `rpx`、渐变卡片、动效和栅格布局，兼顾视觉一致性与手机端适配。

---

## 🖼️ 预览图（Preview）

> 当前仓库未包含完整页面截图/GIF，以下使用项目内静态资源占位展示。建议后续补充 `screenshots/*.png` 或 `demo.gif` 以便在 GitHub 首页直观预览。

| 模块 | 预览 |
|:---|:---:|
| 项目标识 | <img src="./ICON/爱吃橘子.jpg" alt="project-logo" width="220" /> |
| 首页 Tab 图标 | <img src="./images/首页-选中状态.png" alt="home-icon" width="120" /> |
| 传感器 Tab 图标 | <img src="./images/传感器-选中状态.png" alt="sensor-icon" width="120" /> |
| 摄像头 Tab 图标 | <img src="./images/摄像头_选中状态.png" alt="camera-icon" width="120" /> |

---

## 🚀 快速上手（Quick Start）

### 1) 克隆仓库

```bash
git clone <YOUR_REPO_URL> miniprogram-10 && cd miniprogram-10
```

### 2) 安装依赖

```bash
npm install
```

### 3) 微信开发者工具构建 NPM

1. 打开微信开发者工具并导入项目根目录。  
2. 菜单栏执行：**工具 → 构建 npm**。  
3. 在「详情 → 本地设置」中勾选：  
   - 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书  
   - 启用 npm

### 4) 本地预览与调试

- 启动本地 MQTT Broker（如 EMQX），确保 WebSocket 监听端口可用（默认示例：`8083`）。
- 在小程序「传感器」页面配置 `Host / Port / Topic` 后连接。
- 在「摄像头」页面输入 ESP32-CAM IP（可仅输入 IP，程序会自动补全端口与路径）。

### 5) 上传发布

1. 微信开发者工具中点击 **上传**。  
2. 填写版本号与备注。  
3. 登录微信公众平台完成提审与发布流程。

### 6) 一行命令直接导入微信开发者工具

```powershell
"C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat" open --project "$PWD"
```

---

## 📁 目录结构（Structure）

```text
miniprogram-10/
├─ app.js
├─ app.json
├─ app.wxss
├─ package.json
├─ package-lock.json
├─ project.config.json
├─ sitemap.json
├─ sensor.js
├─ pages/
│  ├─ home/
│  │  ├─ home.wxml
│  │  ├─ home.wxss
│  │  ├─ home.js
│  │  └─ home.json
│  ├─ sensor/
│  │  ├─ sensor.wxml
│  │  ├─ sensor.wxss
│  │  ├─ sensor.js
│  │  └─ sensor.json
│  └─ camera/
│     ├─ camera.wxml
│     ├─ camera.wxss
│     ├─ camera.js
│     └─ camera.json
├─ components/
│  └─ navigation-bar/
│     ├─ navigation-bar.wxml
│     ├─ navigation-bar.wxss
│     ├─ navigation-bar.js
│     └─ navigation-bar.json
├─ images/
├─ ICON/
└─ docs & notes
   ├─ MQTT连接故障排查.md
   ├─ 真机调试MQTT连接指南.md
   ├─ 使用说明.txt
   └─ 项目说明.txt
```

---

## ⚙️ 配置说明（Configuration）

### app.json 关键字段

| 字段 | 当前值/状态 | 说明 |
|:---|:---|:---|
| `pages` | `home / sensor / camera` | 小程序主路由，按数组顺序注册页面 |
| `tabBar` | 三个 Tab（首页、传感器、摄像头） | 底部导航入口 |
| `window.navigationBarTitleText` | `智能温室大棚监测` | 全局导航栏标题 |
| `permission.scope.camera` | 已声明 | 摄像头权限用途说明 |
| `style` | `v2` | 使用新样式编译体系 |
| `lazyCodeLoading` | `requiredComponents` | 启用按需组件懒加载 |

### 云开发环境 ID（CloudBase Env ID）

| 项 | 当前状态 |
|:---|:---|
| `wx.cloud.init` | 未使用 |
| `cloudfunctions/` | 未创建 |
| Environment ID | 暂未配置 |

说明：当前项目不依赖云开发，核心通信链路为 **Mini Program ↔ MQTT Broker（WebSocket）**。若后续需要云函数、云数据库或对象存储，请在 `app.js` 增加 `wx.cloud.init({ env: "your-env-id" })` 并新增 `cloudfunctions` 目录。

### 域名白名单（Domain Whitelist）

| 场景 | 当前策略 |
|:---|:---|
| 开发阶段（本地 IP / HTTP） | 依赖开发者工具关闭合法域名校验 |
| 生产阶段 | 建议配置 HTTPS 域名并在小程序后台加入业务域名白名单 |

---

## 🧩 组件与 API 文档（Docs & Links）

### 项目内组件 / 业务代码

- 自定义导航组件：[`components/navigation-bar`](./components/navigation-bar)
- 传感器业务页：[`pages/sensor/sensor.js`](./pages/sensor/sensor.js)
- 摄像头业务页：[`pages/camera/camera.js`](./pages/camera/camera.js)
- 全局配置入口：[`app.json`](./app.json)

### 微信官方 API 文档

- `wx.connectSocket`：<https://developers.weixin.qq.com/miniprogram/dev/api/network/websocket/wx.connectSocket.html>
- `SocketTask.send`：<https://developers.weixin.qq.com/miniprogram/dev/api/network/websocket/SocketTask.send.html>
- `wx.setStorageSync`：<https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.setStorageSync.html>
- `wx.getStorageSync`：<https://developers.weixin.qq.com/miniprogram/dev/api/storage/wx.getStorageSync.html>
- `wx.vibrateShort`：<https://developers.weixin.qq.com/miniprogram/dev/api/device/vibrate/wx.vibrateShort.html>

---

## 🧠 架构与实现分析（Architecture Notes）

### 核心功能模块

1. **Home 模块**：品牌与系统入口展示，承担导航与状态感知。  
2. **Sensor 模块**：MQTT 连接、二进制报文构造、PUBLISH 解析、数据映射与告警反馈。  
3. **Camera 模块**：视频流 URL 规范化、连通性反馈、历史记录管理。  
4. **UI 组件层**：`navigation-bar` 组件提供统一顶部栏能力（当前页面尚未广泛接入）。  

### 技术栈

- 前端框架：WeChat Mini Program 原生框架（WXML + WXSS + JS + JSON）
- 通信协议：MQTT over WebSocket（手写简化报文）
- 运行环境：微信开发者工具 / 微信客户端
- 依赖管理：NPM（`package-lock.json` 中可见 `mqtt`、`events`、`stream-browserify`）

### 第三方库引用与依赖现状

- `package-lock.json` 记录了 `mqtt` 相关依赖树。  
- `package.json` 当前 `dependencies` 为空，存在与 lock 文件不一致的情况。  
- 业务代码目前走原生 `wx.connectSocket`，并未直接 `import mqtt`，属于“可选依赖已安装但未启用 SDK API”的状态。

### 数据流方案（Data Flow）

`STM32 / 上位机` → `MQTT Broker` → `小程序 WebSocket` → `MQTT 报文解析` → `setData` → `WXML 实时渲染` → `阈值判断与告警反馈`。

### 错误处理策略（Error Handling）

- **输入校验**：配置项不能为空，非法输入通过 `wx.showToast` 反馈。  
- **连接异常处理**：`connectSocket fail`、`onError`、`onClose` 分场景提示。  
- **数据解析保护**：`try...catch` 包裹 JSON 解析，防止异常 payload 影响页面可用性。  
- **可视化反馈**：`showLoading`、`showModal`、`status bar`、`告警样式` 共同增强可观测性。  

---

## 🤝 贡献指南（Contributing）

欢迎提交 Issue / PR 改进功能与稳定性。建议遵循以下协作规范：

### 分支命名（Branch Naming）

- `feature/<module>-<short-desc>`
- `fix/<module>-<short-desc>`
- `refactor/<module>-<short-desc>`

示例：`feature/sensor-threshold-persist`

### 提交信息（Commit Message）

推荐使用 Conventional Commits：

```text
feat(sensor): add mqtt reconnect backoff
fix(camera): handle invalid ip input
refactor(home): simplify card layout
docs(readme): improve quick start
```

### PR 流程（Pull Request Workflow）

1. 从 `main` 拉取最新代码并创建功能分支。  
2. 本地自测通过后提交，保持单一主题变更。  
3. 发起 PR，描述改动动机、影响范围、截图与测试步骤。  
4. 通过 Review 后合并。

---


## 📄 开源协议（License）

本项目采用 **ISC License**，详见 `package.json` 中 `license` 字段。

---

## 🗓️ 更新日志（Changelog）

本节遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 规范，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-04-02

### Added

- 新增首页、传感器、摄像头三个业务页面与 TabBar 导航。  
- 新增 MQTT 参数配置弹窗与本地缓存机制。  
- 新增 MQTT 二进制 CONNECT / SUBSCRIBE 报文发送与消息解析。  
- 新增阈值告警视觉反馈与振动提醒。  
- 新增摄像头地址智能补全与历史记录。  
- 新增 `navigation-bar` 自定义组件代码。  

### Changed

- 统一全局主题色为绿色系，提升页面视觉一致性。  

### Fixed

- 优化 MQTT 连接失败与异常提示，提升排错效率。  

---

## 📌 说明补充（Notes）

- 当前仓库未内置云函数（Cloud Functions）与云数据库（Cloud Database）逻辑。  
- 当前 `project.config.json` 中 `appid` 已配置，导入后可直接进行本地编译与联调。  
- 若你用于教学演示，建议优先阅读仓库内 `MQTT连接故障排查.md` 与 `真机调试MQTT连接指南.md`。

