# 毛线颜色组合生成器 (Yarn Color Combinations)

这是一个基于 React + Vite + Tailwind CSS 的单页面应用，用于生成和追踪毛线颜色的排列组合。

## 功能特点

- **6种基础颜色**：黄、蓝、红、棕、深黄、绿
- **智能组合生成**：自动生成 108 种不重复的 4 色组合
- **进度追踪**：使用 LocalStorage 记录已完成的组合
- **响应式设计**：适配各种屏幕尺寸
- **可视化反馈**：完成状态标注和进度条显示

## 技术栈

- React 18
- Vite
- Tailwind CSS
- Lucide React (图标)

## 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 构建生产版本：
   ```bash
   npm run build
   ```

## 部署

本项目可以直接部署到 Vercel。

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 框架预设选择 Vite
4. 点击 Deploy 即可

## 颜色配置

可以在 `src/utils/colors.js` 中修改基础颜色配置。

