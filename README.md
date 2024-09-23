# ZGGUI 📱💡

**ZGGUI** 是一个基于 Vue 3、UniApp 和 TypeScript 的多端适配移动端 UI 组件库，旨在为移动端应用提供一套简洁、优雅且高效的 UI 解决方案。支持小程序、H5、App 多端使用，帮助开发者快速构建跨平台应用。

## ✨ 特性

- 🖥️ **多端适配**：支持微信小程序、H5、iOS 和 Android 应用开发。
- 🚀 **高性能**：基于 Vue 3 和 UniApp，性能优秀。
- 🔒 **TypeScript 支持**：使用 TypeScript 开发，提供完善的类型定义。
- 🎨 **简洁易用**：组件设计简洁、易用，支持多种 UI 场景。
- 🛠️ **灵活定制**：提供丰富的主题和样式定制能力。

## 📦 安装

```bash
npm install zgg-ui
```

## ⚠️ 注意

在使用过程中，请全局引入以下样式文件，确保组件正常显示样式：

```ts
import { createApp } from 'vue'
import 'zgg-ui/styles/ZCG.less' // 全局样式
import 'zgg-ui/styles/ZCGstyle.less' // 自定义样式
import 'zgg-ui/styles/transition.less' // 动画样式

const app = createApp(App)
app.mount('#app')
```

> 内置图标文件 `zgg-ui/styles/iconfont.css` 使用 [iconfont](https://www.iconfont.cn/) 的方式引入，具体用法请查看 [Iconfont 官方网站](https://www.iconfont.cn/)。

## 📚 文档

查看完整文档及使用指南，请访问 [ZGGUI 官方网站](https://ui.zcgnav.cn)。

## 💻 源码与贡献

欢迎访问 [GitHub 仓库](https://github.com/zh-ZCG/ZGGUI) 了解更多细节，并提出问题或贡献代码。
