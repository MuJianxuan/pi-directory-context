# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2026-07-04

### Fixed
- 修复 `context.ts` 中阻止扩展导入的损坏实现。
- 移除 `<cwd>` 注入，避免在 system prompt 中重复暴露当前目录。
- 将 `<workspace><root>` 固定为当前目录绝对路径，不再向上查找 `.git` 推断 workspace root。

### Changed
- 同步更新 `README.md` 中的注入说明与 XML 示例，匹配当前行为。

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
