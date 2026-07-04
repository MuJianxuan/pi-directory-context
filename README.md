# pi-directory-context

`pi-directory-context` 是一个 Pi extension package。

它会在 `before_agent_start` 阶段，把当前工作目录相关的环境上下文注入到 system prompt，帮助模型更快理解自己所处的执行环境。

## 当前能力

注入的信息包括：
- `workspaceRoot`（当前目录绝对路径）
- `currentDate`
- `timezone`
- `shell`
- `operating_system`
- `runtime`

注入格式示例：

```xml
<environment_context>
  <workspace>
    <root>/path/to/project</root>
  </workspace>
  <shell type="zsh">/bin/zsh</shell>
  <current_date>2026-06-20</current_date>
  <timezone>Asia/Shanghai</timezone>
  <operating_system>
    <platform>darwin</platform>
    <arch>arm64</arch>
    <type>Darwin</type>
    <release>24.3.0</release>
  </operating_system>
  <runtime>
    <name>Node.js</name>
    <version>v25.0.0</version>
  </runtime>
</environment_context>
```

## 安装

### 本地路径安装

```bash
pi install /absolute/path/to/pi-directory-context
```

或在当前目录附近：

```bash
pi install ./pi-directory-context
```

### npm 安装

等你正式发布到 npm 后可用：

```bash
pi install npm:pi-directory-context
```

### 临时试用

只在当前运行中加载：

```bash
pi -e ./pi-directory-context
```

## 使用

安装后重新启动 Pi，或执行：

```text
/reload
```

这个包通过 `package.json` 里的 `pi.extensions` 声明扩展入口：

- `extensions/directory-context.ts`

Pi 会加载该入口，并注册环境上下文注入逻辑。

## 开发

当前采用 TypeScript 直载方案，不引入编译产物，便于快速迭代：

```bash
npm run check:import
npm run pack:check
```

这两个命令分别用于：
- 验证扩展入口可以被 Node 的 TypeScript 直载能力导入
- 预览 npm 打包时会包含哪些文件

## 首次发布

如果这是你第一次把它发布到 npm，建议按下面顺序执行：

```bash
npm whoami
npm run prepublishOnly
npm publish
```

如果你后续改用 scoped package，例如 `@your-scope/pi-directory-context`，通常需要：

```bash
npm publish --access public
```

更完整的首次发布步骤见：
- `.docs/first-npm-release.md`

## 目录结构

```text
pi-directory-context/
├── extensions/
│   └── directory-context.ts
├── src/
│   └── directory-context/
│       ├── context.ts
│       └── index.ts
├── index.ts
├── package.json
└── README.md
```

说明：
- `extensions/` 是 Pi 发现和加载的扩展入口层
- `src/` 是内部实现层
- 根 `index.ts` 当前保留为兼容入口，便于平滑过渡

## 面向后续扩展库演进

你当前目标是先做成“可安装的单扩展包”，后续再演进为“多扩展库”。

为了减少后续搬迁成本，这个仓库已经按“入口层 + 实现层”拆开。后面如果要增加新的扩展，建议继续按下面模式扩展：

```text
extensions/
  another-extension.ts
src/
  another-extension/
    index.ts
```

这样未来只需要在 `package.json` 的 `pi.extensions` 中继续追加入口即可。
