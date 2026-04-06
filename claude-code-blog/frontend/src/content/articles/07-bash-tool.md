---
title: "BashTool 源码解读：Shell 执行的安全边界"
description: "深入解析 Claude Code 的 BashTool 实现，探究 Shell 命令执行的安全沙箱、超时处理、输出管理等核心机制"
date: "2026-04-06"
author: "Claude Code Blog"
tags: ["claude-code", "bash-tool", "security", "sandbox", "typescript"]
series: "Claude Code 源码深度解析"
seriesIndex: 7
---

# BashTool 源码解读：Shell 执行的安全边界

BashTool 是 Claude Code 中最强大也最危险的工具。它赋予了 AI 直接执行 Shell 命令的能力，同时又必须在安全性上做到滴水不漏。本文将从源码层面解析 BashTool 如何在"赋能"与"约束"之间找到平衡。

## BashTool 核心职责

BashTool 的职责看似简单——执行用户或 LLM 提供的 Shell 命令——但其内部涉及进程管理、安全检查、输出处理等多个复杂子系统。

```typescript
import { z } from "zod";
import { Tool, ToolResult, ToolExecutionContext } from "../Tool";
import { ShellManager } from "./Shell";

const bashInputSchema = z.object({
  command: z.string().describe("The command to execute"),
  description: z.string().optional().describe("Clear description of what the command does"),
  timeout: z.number().max(600000).optional().describe("Timeout in milliseconds (max 600000)"),
  run_in_background: z.boolean().optional().describe("Run command in background"),
});

type BashInput = z.infer<typeof bashInputSchema>;

export const bashTool: Tool<BashInput> = {
  name: "Bash",
  description: "Executes a given bash command and returns its output.",
  inputSchema: bashInputSchema,
  category: "execution",
  requiresPermission: true,
  
  execute: async (input: BashInput, context: ToolExecutionContext): Promise<ToolResult> => {
    const { command, timeout, run_in_background } = input;
    
    // 1. 安全检查
    const safetyCheck = validateCommandSafety(command, context);
    if (!safetyCheck.allowed) {
      return {
        output: safetyCheck.reason,
        isError: true,
      };
    }
    
    // 2. 获取或创建 Shell 实例
    const shell = ShellManager.getInstance(context.workingDirectory);
    
    // 3. 执行命令
    const effectiveTimeout = timeout ?? 120000; // 默认 120 秒
    
    if (run_in_background) {
      return executeInBackground(shell, command, context);
    }
    
    const result = await shell.execute(command, {
      timeout: effectiveTimeout,
      abortSignal: context.abortSignal,
      onOutput: context.onProgress,
    });
    
    // 4. 格式化结果
    return formatExecutionResult(result);
  },
  
  formatInput: (input: BashInput) => {
    return input.description ?? input.command;
  },
};
```

注意 `formatInput` 方法的巧妙设计：当 LLM 提供了 `description` 参数时，优先展示描述而非原始命令。这让用户在审批权限时能更快理解命令意图。

## Shell.ts 封装

`Shell.ts` 是对 Node.js `child_process` 的高级封装，解决了进程生命周期管理中的多个棘手问题：

```typescript
import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";

interface ShellOptions {
  cwd: string;
  env?: Record<string, string>;
  shell?: string;
}

interface ExecuteOptions {
  timeout: number;
  abortSignal?: AbortSignal;
  onOutput?: (chunk: string) => void;
}

interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  killed: boolean;
}

export class ShellManager {
  private static instances: Map<string, ShellManager> = new Map();
  private process: ChildProcess | null = null;
  private cwd: string;
  
  static getInstance(cwd: string): ShellManager {
    // 复用同一工作目录的 Shell 实例
    if (!ShellManager.instances.has(cwd)) {
      ShellManager.instances.set(cwd, new ShellManager({ cwd }));
    }
    return ShellManager.instances.get(cwd)!;
  }
  
  constructor(private options: ShellOptions) {
    this.cwd = options.cwd;
  }
  
  async execute(command: string, opts: ExecuteOptions): Promise<ExecuteResult> {
    return new Promise((resolve, reject) => {
      let stdout = "";
      let stderr = "";
      let timedOut = false;
      
      const proc = spawn("bash", ["-c", command], {
        cwd: this.cwd,
        env: {
          ...process.env,
          ...this.options.env,
          // 禁用交互式特性
          TERM: "dumb",
          // 确保非交互模式
          DEBIAN_FRONTEND: "noninteractive",
        },
        stdio: ["pipe", "pipe", "pipe"],
      });
      
      // 超时处理
      const timer = setTimeout(() => {
        timedOut = true;
        proc.kill("SIGTERM");
        // 给进程一个优雅退出的机会
        setTimeout(() => {
          if (!proc.killed) {
            proc.kill("SIGKILL");
          }
        }, 5000);
      }, opts.timeout);
      
      // AbortSignal 处理
      if (opts.abortSignal) {
        opts.abortSignal.addEventListener("abort", () => {
          proc.kill("SIGTERM");
        });
      }
      
      proc.stdout?.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        stdout += text;
        opts.onOutput?.(text);
      });
      
      proc.stderr?.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      
      proc.on("close", (exitCode) => {
        clearTimeout(timer);
        resolve({
          stdout: truncateOutput(stdout),
          stderr: truncateOutput(stderr),
          exitCode,
          timedOut,
          killed: proc.killed,
        });
      });
      
      proc.on("error", reject);
    });
  }
}
```

### 进程环境控制

Shell 创建时有几个重要的环境变量设置：

- `TERM=dumb`：禁用终端颜色和光标控制序列，避免输出中混入 ANSI escape codes
- `DEBIAN_FRONTEND=noninteractive`：防止 apt 等包管理器弹出交互式对话框
- 继承父进程的 `PATH` 等关键环境变量

### 工作目录持久化

一个重要的设计决策：每次 Bash 调用之间，工作目录会被重置。这意味着 `cd /some/path` 的效果不会持续到下一次调用。这是有意为之的安全设计——防止 LLM 通过 `cd` 命令逃逸到不受监控的目录。

## 安全机制

BashTool 的安全体系是多层防御的：

### 沙箱模式

在沙箱模式下，命令在受限环境中执行，限制了文件系统访问、网络访问等能力：

```typescript
function validateCommandSafety(
  command: string,
  context: ToolExecutionContext
): { allowed: boolean; reason: string } {
  // 第一层：命令黑名单检测
  const dangerousPatterns = [
    /rm\s+-rf\s+\//,           // rm -rf /
    /mkfs\./,                   // 格式化磁盘
    /dd\s+if=.*of=\/dev/,      // 直接写入设备
    />\s*\/dev\/sd[a-z]/,      // 重定向到磁盘设备
    /chmod\s+-R\s+777\s+\//,   // 递归修改根目录权限
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      return {
        allowed: false,
        reason: `Blocked: command matches dangerous pattern ${pattern}`,
      };
    }
  }
  
  // 第二层：交互式命令检测
  const interactivePatterns = [
    /\bgit\s+rebase\s+-i\b/,   // git rebase -i
    /\bgit\s+add\s+-i\b/,      // git add -i
    /\bvim?\b/,                 // vi/vim
    /\bnano\b/,                 // nano
    /\bless\b/,                 // less
  ];
  
  for (const pattern of interactivePatterns) {
    if (pattern.test(command)) {
      return {
        allowed: false,
        reason: `Blocked: interactive commands are not supported`,
      };
    }
  }
  
  // 第三层：破坏性 Git 操作警告
  const destructiveGitPatterns = [
    /git\s+push\s+--force/,
    /git\s+reset\s+--hard/,
    /git\s+clean\s+-f/,
    /git\s+checkout\s+\./,
  ];
  
  for (const pattern of destructiveGitPatterns) {
    if (pattern.test(command)) {
      // 不阻止，但标记需要额外确认
      context.permissions.requireExplicitApproval(command);
    }
  }
  
  return { allowed: true, reason: "" };
}
```

安全检查分为三个层级：

1. **硬阻止**：对 `rm -rf /` 等不可恢复的危险操作直接拒绝
2. **交互式拦截**：阻止需要用户交互的命令（如 vim、git rebase -i），因为非交互环境下这些命令会挂起
3. **软警告**：对破坏性 Git 操作标记需要额外确认，但不硬性阻止

### 命令描述审计

`description` 参数不仅用于用户展示，也是安全审计的一部分。系统会检查描述是否与命令实际行为一致，防止 LLM 用无害描述掩盖危险操作。

## 超时处理

超时机制是 BashTool 最精细的部分之一：

```typescript
// 超时配置
const TIMEOUT_CONFIG = {
  default: 120_000,    // 默认 2 分钟
  maximum: 600_000,    // 最大 10 分钟
  gracePeriod: 5_000,  // SIGTERM 后的等待期
};

// 优雅退出策略
async function handleTimeout(proc: ChildProcess): Promise<void> {
  // 第一步：发送 SIGTERM，允许进程清理资源
  proc.kill("SIGTERM");
  
  // 第二步：等待 grace period
  await new Promise((resolve) =>
    setTimeout(resolve, TIMEOUT_CONFIG.gracePeriod)
  );
  
  // 第三步：如果进程仍在运行，强制终止
  if (!proc.killed) {
    proc.kill("SIGKILL");
  }
}
```

超时策略采用了两阶段终止：先发 `SIGTERM` 给进程一个优雅退出的机会（比如清理临时文件），5秒后如果仍未退出则用 `SIGKILL` 强制终止。

### 后台执行模式

对于长时间运行的命令，BashTool 提供了后台执行模式：

```typescript
async function executeInBackground(
  shell: ShellManager,
  command: string,
  context: ToolExecutionContext
): Promise<ToolResult> {
  const taskId = generateTaskId();
  
  // 启动后台任务，不等待完成
  const taskPromise = shell.execute(command, {
    timeout: TIMEOUT_CONFIG.maximum,
    abortSignal: context.abortSignal,
  });
  
  // 注册完成回调
  taskPromise.then((result) => {
    notifyTaskComplete(taskId, result);
  });
  
  // 立即返回任务 ID
  return {
    output: `Background task started with ID: ${taskId}. You will be notified when it completes.`,
    metadata: { taskId, isBackground: true },
  };
}
```

后台模式的核心在于"启动即返回"。LLM 不需要等待命令完成，可以继续处理其他任务。当命令完成时，系统会通过通知机制告知 LLM 结果。

## 输出处理

命令输出的处理也有讲究：

```typescript
const MAX_OUTPUT_LENGTH = 100_000; // 100KB

function truncateOutput(output: string): string {
  if (output.length <= MAX_OUTPUT_LENGTH) {
    return output;
  }
  
  const half = Math.floor(MAX_OUTPUT_LENGTH / 2);
  const head = output.slice(0, half);
  const tail = output.slice(-half);
  const omitted = output.length - MAX_OUTPUT_LENGTH;
  
  return `${head}\n\n... [${omitted} characters omitted] ...\n\n${tail}`;
}

function formatExecutionResult(result: ExecuteResult): ToolResult {
  const parts: string[] = [];
  
  if (result.stdout) {
    parts.push(result.stdout);
  }
  
  if (result.stderr) {
    parts.push(`STDERR:\n${result.stderr}`);
  }
  
  if (result.timedOut) {
    parts.push(`\nCommand timed out after the specified timeout period.`);
  }
  
  if (result.exitCode !== null && result.exitCode !== 0) {
    parts.push(`\nExit code: ${result.exitCode}`);
  }
  
  return {
    output: parts.join("\n") || "(no output)",
    isError: result.exitCode !== 0,
    metadata: {
      exitCode: result.exitCode,
      timedOut: result.timedOut,
    },
  };
}
```

输出截断策略是"保留首尾"：保留前50KB和后50KB，中间部分省略。这种策略比只保留开头更有用，因为命令的关键输出往往在末尾（如编译错误信息）。

## 工作目录管理的设计哲学

每次 Bash 调用都从固定工作目录开始执行，这个设计决策值得深入讨论。

```typescript
// 工作目录不会在调用间持久化
// 每次调用都从 context.workingDirectory 开始
const proc = spawn("bash", ["-c", command], {
  cwd: context.workingDirectory,
  // ...
});
```

这意味着以下代码不会按预期工作：

```bash
# 第一次调用
cd /tmp && mkdir test

# 第二次调用 —— 工作目录回到初始值，不是 /tmp
ls  # 列出的是初始工作目录，不是 /tmp
```

这个看似不便的设计实际上解决了多个问题：

1. **可预测性**：每次调用的行为不依赖于之前的状态
2. **安全性**：防止工作目录被意外修改到敏感位置
3. **可重放性**：单个命令调用可以独立重放和调试

## 总结

BashTool 的设计体现了"受控的强大"这一理念。它给予 LLM 充分的系统操作能力，同时通过沙箱、命令过滤、超时控制、输出截断等多重机制确保安全性。每一层防御都不是多余的——它们共同构成了一个纵深防御体系，使得即使某一层被突破，整体仍然安全。
