# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-06-20

### Added
- 初始化 Git 仓库并推送到 GitHub。
- 将单文件扩展整理为可安装的 Pi package 骨架。
- 新增 `extensions/` 入口层与 `src/directory-context/` 实现层。
- 新增 `package.json`、`.gitignore`、`README.md`。
- 新增发布前校验脚本：`check:import`、`pack:check`、`prepublishOnly`。
- 新增首个 npm 发布说明文档。

### Changed
- 根 `index.ts` 调整为兼容转发入口，实际扩展实现迁移到 `src/directory-context/index.ts`。
