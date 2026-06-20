# 首个 npm 发布说明

本文档描述 `pi-directory-context` 第一次发布到 npm 时的最小步骤。

## 发布前检查

在仓库根目录执行：

```bash
npm run prepublishOnly
```

当前会执行：
- `npm run check:import`
- `npm run pack:check`

通过标准：
- 扩展入口 `extensions/directory-context.ts` 可以被直接导入
- `npm pack --dry-run` 输出中包含预期发布文件

## 发布前需要你确认的事项

### 1. npm 登录状态

确认本机已经登录 npm：

```bash
npm whoami
```

如果未登录：

```bash
npm login
```

### 2. 包名可用性

确认 `pi-directory-context` 尚未被占用：

```bash
npm view pi-directory-context name
```

如果返回 `E404`，通常表示这个包名还没有被发布。

### 3. 仓库内容

建议在发布前至少确认这些文件已经存在且内容正确：
- `package.json`
- `README.md`
- `CHANGELOG.md`
- `extensions/directory-context.ts`
- `src/directory-context/index.ts`
- `src/directory-context/context.ts`

## 首次发布步骤

### 1. 确认版本号

当前版本是：

```json
"version": "0.1.0"
```

如果准备首次发布 `0.1.0`，保持不变即可。

如果要调整版本，可修改 `package.json` 后再执行发布前检查。

### 2. 本地打包预览

```bash
npm pack --dry-run
```

确认 tarball 中没有意外文件，例如：
- `.git/`
- `node_modules/`
- 本地缓存文件
- 临时测试文件

### 3. 正式发布

```bash
npm publish
```

如果后续改为 scoped package，通常需要：

```bash
npm publish --access public
```

## 发布后验证

### 1. npm 安装验证

等待 npm 同步完成后，可以执行：

```bash
pi install npm:pi-directory-context
```

### 2. Pi 加载验证

安装后重启 Pi，或执行：

```text
/reload
```

验证点：
- Pi 能成功加载扩展
- system prompt 中出现 `<environment_context>` 注入片段

## 常见问题

### 包名已被占用

如果 `pi-directory-context` 已被占用，你需要：
- 改 `package.json` 里的 `name`
- 同步更新 `README.md` 中的安装示例

### peer dependency 提示

当前包把 `@earendil-works/pi-coding-agent` 放在 `peerDependencies`，这是符合 Pi package 文档约定的。只要安装环境中有 Pi，一般不需要额外处理。

### 是否需要编译

当前不需要。

这个包采用 TypeScript 直载方案，Pi 可直接加载 `.ts` 扩展入口。只有在你后续需要额外导出普通 Node 库接口、类型产物、或更复杂的构建流程时，才建议引入 `tsc` 或其他构建链。
