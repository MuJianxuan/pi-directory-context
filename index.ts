/**
 * Directory Context Injection Extension for Pi
 * 
 * 基于 Codex 的设计，在 agent 启动时注入当前工作目录的环境上下文信息。
 * 使用 XML 格式确保模型能清晰理解工作环境。
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import { execSync } from "node:child_process";

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event, ctx) => {
    // 收集环境上下文信息
    const context = await collectEnvironmentContext(ctx.cwd);
    
    // 构建 XML 格式的上下文注入
    const contextXml = buildContextXml(context);
    
    // 追加到系统提示词
    const enhancedPrompt = `${event.systemPrompt}\n\n${contextXml}`;
    
    return {
      systemPrompt: enhancedPrompt,
    };
  });
}

/**
 * 环境上下文数据结构
 */
interface EnvironmentContext {
  cwd: string;
  workspaceRoot?: string;
  currentDate: string;
  timezone: string;
  shell: {
    type: string;
    path: string;
  };
  os: {
    platform: string;
    arch: string;
    release: string;
    type: string;
  };
  runtime: {
    name: string;
    version: string;
  };
}

/**
 * 收集环境上下文信息
 */
async function collectEnvironmentContext(cwd: string): Promise<EnvironmentContext> {
  const context: EnvironmentContext = {
    cwd,
    currentDate: new Date().toISOString().split('T')[0],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    shell: detectShell(),
    os: collectOsInfo(),
    runtime: detectRuntime(),
  };

  // 尝试检测工作区根目录（查找 .git）
  context.workspaceRoot = findWorkspaceRoot(cwd);

  return context;
}

/**
 * 检测当前 Shell 类型和路径
 */
function detectShell(): { type: string; path: string } {
  const shellPath = process.env.SHELL || '';
  const shellType = path.basename(shellPath) || 'unknown';
  
  return {
    type: shellType,
    path: shellPath,
  };
}

/**
 * 收集操作系统信息
 */
function collectOsInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    type: os.type(),
  };
}

/**
 * 检测运行时环境（Node.js 或 Bun）
 */
function detectRuntime(): { name: string; version: string } {
  // 检测是否为 Bun
  if (typeof Bun !== 'undefined') {
    return {
      name: 'Bun',
      version: Bun.version || 'unknown',
    };
  }
  
  // 默认为 Node.js
  return {
    name: 'Node.js',
    version: process.version,
  };
}

/**
 * 查找工作区根目录（向上查找 .git）
 */
function findWorkspaceRoot(startDir: string): string | undefined {
  let currentDir = startDir;
  
  while (true) {
    const gitPath = path.join(currentDir, '.git');
    
    try {
      if (fs.existsSync(gitPath)) {
        return currentDir;
      }
    } catch {
      // 权限错误或其他问题，忽略
    }
    
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // 已经到达文件系统根目录
      break;
    }
    currentDir = parentDir;
  }
  
  return undefined;
}

/**
 * 构建 XML 格式的环境上下文
 */
function buildContextXml(context: EnvironmentContext): string {
  const lines: string[] = [];
  
  lines.push('<environment_context>');
  
  // 当前工作目录
  lines.push(`  <cwd>${escapeXml(context.cwd)}</cwd>`);
  
  // 工作区根目录（如果找到）
  if (context.workspaceRoot) {
    lines.push('  <workspace>');
    lines.push(`    <root>${escapeXml(context.workspaceRoot)}</root>`);
    lines.push('  </workspace>');
  }
  
  // Shell 信息
  lines.push(`  <shell type="${escapeXml(context.shell.type)}">${escapeXml(context.shell.path)}</shell>`);
  
  // 日期和时区
  lines.push(`  <current_date>${context.currentDate}</current_date>`);
  lines.push(`  <timezone>${context.timezone}</timezone>`);
  
  // 操作系统信息
  lines.push('  <operating_system>');
  lines.push(`    <platform>${context.os.platform}</platform>`);
  lines.push(`    <arch>${context.os.arch}</arch>`);
  lines.push(`    <type>${escapeXml(context.os.type)}</type>`);
  lines.push(`    <release>${escapeXml(context.os.release)}</release>`);
  lines.push('  </operating_system>');
  
  // 运行时信息
  lines.push('  <runtime>');
  lines.push(`    <name>${context.runtime.name}</name>`);
  lines.push(`    <version>${context.runtime.version}</version>`);
  lines.push('  </runtime>');
  
  lines.push('</environment_context>');
  
  return lines.join('\n');
}

/**
 * XML 转义
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
