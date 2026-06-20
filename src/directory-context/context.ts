import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export interface EnvironmentContext {
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

export async function collectEnvironmentContext(
  cwd: string,
): Promise<EnvironmentContext> {
  const context: EnvironmentContext = {
    cwd,
    currentDate: new Date().toISOString().split("T")[0],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    shell: detectShell(),
    os: collectOsInfo(),
    runtime: detectRuntime(),
  };

  context.workspaceRoot = findWorkspaceRoot(cwd);

  return context;
}

function detectShell(): { type: string; path: string } {
  const shellPath = process.env.SHELL || "";
  const shellType = path.basename(shellPath) || "unknown";

  return {
    type: shellType,
    path: shellPath,
  };
}

function collectOsInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    type: os.type(),
  };
}

function detectRuntime(): { name: string; version: string } {
  if (typeof Bun !== "undefined") {
    return {
      name: "Bun",
      version: Bun.version || "unknown",
    };
  }

  return {
    name: "Node.js",
    version: process.version,
  };
}

function findWorkspaceRoot(startDir: string): string | undefined {
  let currentDir = startDir;

  while (true) {
    const gitPath = path.join(currentDir, ".git");

    try {
      if (fs.existsSync(gitPath)) {
        return currentDir;
      }
    } catch {
      // Ignore permission errors and continue scanning upward.
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return undefined;
}

export function buildContextXml(context: EnvironmentContext): string {
  const lines: string[] = [];

  lines.push("<environment_context>");
  lines.push(`  <cwd>${escapeXml(context.cwd)}</cwd>`);

  if (context.workspaceRoot) {
    lines.push("  <workspace>");
    lines.push(`    <root>${escapeXml(context.workspaceRoot)}</root>`);
    lines.push("  </workspace>");
  }

  lines.push(
    `  <shell type="${escapeXml(context.shell.type)}">${escapeXml(context.shell.path)}</shell>`,
  );
  lines.push(`  <current_date>${context.currentDate}</current_date>`);
  lines.push(`  <timezone>${context.timezone}</timezone>`);

  lines.push("  <operating_system>");
  lines.push(`    <platform>${context.os.platform}</platform>`);
  lines.push(`    <arch>${context.os.arch}</arch>`);
  lines.push(`    <type>${escapeXml(context.os.type)}</type>`);
  lines.push(`    <release>${escapeXml(context.os.release)}</release>`);
  lines.push("  </operating_system>");

  lines.push("  <runtime>");
  lines.push(`    <name>${context.runtime.name}</name>`);
  lines.push(`    <version>${context.runtime.version}</version>`);
  lines.push("  </runtime>");

  lines.push("</environment_context>");

  return lines.join("\n");
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
