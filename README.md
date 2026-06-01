# 桌面壁纸应用 (Desktop Wallpaper App)

一个使用 Electron + React + Node.js 构建的现代化桌面壁纸应用。

## 功能特性

- 🖼️ **壁纸浏览**: 浏览本地和在线壁纸资源
- 🎨 **壁纸分类**: 支持按分类筛选壁纸
- 💾 **收藏功能**: 收藏喜欢的壁纸
- 🖱️ **一键设置**: 点击即可设置为桌面壁纸
- 📁 **本地导入**: 支持导入本地图片作为壁纸
- 🌙 **深色模式**: 支持明暗主题切换
- 📱 **多分辨率支持**: 自适应不同屏幕分辨率

## 技术栈

- **Electron**: 桌面应用框架
- **React**: 前端UI框架
- **Node.js**: 后端运行环境
- **TypeScript**: 类型安全
- **TailwindCSS**: 样式框架
- **SQLite**: 本地数据库

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 打包应用

```bash
# Windows
npm run package:win

# macOS
npm run package:mac

# Linux
npm run package:linux
```

## 项目结构

```
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── index.ts          # 主进程入口
│   │   ├── wallpaper.ts      # 壁纸设置逻辑
│   │   └── database.ts       # 数据库操作
│   ├── renderer/             # React 渲染进程
│   │   ├── components/       # 组件目录
│   │   ├── pages/            # 页面目录
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── types/            # TypeScript 类型定义
│   │   └── index.tsx         # 渲染进程入口
│   └── shared/               # 共享代码
├── public/                   # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── electron-builder.json5
```

## 使用说明

1. **浏览壁纸**: 在首页浏览推荐壁纸
2. **搜索壁纸**: 使用搜索框搜索特定壁纸
3. **设置壁纸**: 点击壁纸卡片上的"设置壁纸"按钮
4. **收藏壁纸**: 点击心形图标收藏壁纸
5. **导入壁纸**: 点击导入按钮选择本地图片

## 开发说明

### 主进程与渲染进程通信

使用 Electron 的 IPC 机制进行进程间通信：

- `ipcRenderer`: 渲染进程向主进程发送消息
- `ipcMain`: 主进程接收并处理消息

### 壁纸设置原理

通过调用系统 API 设置桌面壁纸：
- Windows: 使用 `wallpaper` 包
- macOS: 使用 AppleScript
- Linux: 使用 `gsettings` 或 `feh`

## 许可证

MIT License
