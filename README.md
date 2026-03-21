# resume_Builder

基于 `Vite + React + TypeScript + kisstate` 的简历生成器。

## 启动方式

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 架构分层

```text
src
├─ app                       # 入口与全局样式
├─ entities/resume/model     # 核心类型与 kisstate store
├─ features/resume-builder   # 编辑器模块
├─ features/resume-preview   # PDF 预览模块
└─ shared                    # 通用工具与类型声明
```

## 关键设计

- `ResumeStore` 使用 `@ObservableClass` 管理简历状态。
- 组件使用 `observer` 自动订阅状态变更。
- `localStorage` 支持新旧 key 兼容（`resume-builder:data:v2` / `data`）。
- 编辑态与预览态解耦，便于后续扩展模板和导出能力。
