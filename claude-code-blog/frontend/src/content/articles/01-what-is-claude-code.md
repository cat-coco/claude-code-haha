---
title: "Claude Code 是什么？一文带你全面了解"
date: "2026-04-06"
slug: "what-is-claude-code"
tags: ["claude-code", "AI编程", "CLI工具", "入门"]
---

# Claude Code 是什么？一文带你全面了解

## 引言

如果你还在用传统 IDE 插件做代码补全，那你可能错过了 AI 编程工具的下一次范式转移。**Claude Code** 是 Anthropic 推出的命令行 AI 编程助手，它不是浏览器插件，不是 IDE 扩展——它直接运行在你的终端里，拥有完整的文件系统访问能力和 Agent 自主决策能力。

本文将从源码层面，带你全面了解 Claude Code 的核心能力、技术架构和使用方式。

## 核心数据一览

在深入之前，先看一组来自源码分析的硬数据：

| 指标 | 数值 |
|------|------|
| TypeScript 源文件数 | 1900+ |
| 内置工具 (Tools) | 42 个 |
| 斜杠命令 (Slash Commands) | 60+ 个 |
| React 组件 | 144 个 |
| 自定义 Hooks | 89 个 |
| 核心引擎文件大小 | 47KB (QueryEngine.ts) |
| API 客户端文件大小 | 126KB (claude.ts) |

这不是一个玩具项目，这是一个工业级的 AI Agent 系统。

## 核心功能

### 1. 代码生成与编辑

Claude Code 最基本的能力是理解你的需求并生成代码。但与简单的代码补全不同，它能够：

```typescript
// Claude Code 内置的文件编辑工具接口
interface EditTool {
  name: "Edit";
  parameters: {
    file_path: string;      // 绝对路径
    old_string: string;     // 要替换的原始文本
    new_string: string;     // 替换后的新文本
    replace_all?: boolean;  // 是否全局替换
  };
}
```

它采用精确的字符串替换策略，而不是重写整个文件。这意味着它可以精准地修改一个 500 行文件中的某 3 行代码，而不会影响其他部分。

### 2. 文件系统操作

Claude Code 拥有完整的文件系统访问能力：

- **Read**: 读取任意文件，支持偏移量和行数限制
- **Write**: 创建或覆盖文件
- **Glob**: 基于模式的文件搜索（替代 `find` 命令）
- **Grep**: 基于正则表达式的内容搜索（基于 ripgrep）

### 3. Shell 命令执行

```typescript
// Bash 工具：直接在终端执行命令
interface BashTool {
  name: "Bash";
  parameters: {
    command: string;
    timeout?: number;           // 最大 600000ms
    run_in_background?: boolean; // 后台执行
  };
}
```

这让 Claude Code 能够运行测试、安装依赖、执行构建——任何你在终端里能做的事情，它都能做。

### 4. 多智能体协作

Claude Code 支持通过 `Agent` 工具启动子智能体。主智能体可以把复杂任务拆分，分配给子智能体并行执行。每个子智能体拥有独立的上下文和工具集，完成后将结果汇报给主智能体。

### 5. Web 搜索与 MCP 集成

通过 WebSearch 和 WebFetch 工具，Claude Code 可以实时搜索互联网获取最新信息。同时支持 MCP（Model Context Protocol）协议，可以接入任意外部服务。

## 技术栈

Claude Code 的技术栈选型非常有意思：

```
TypeScript        - 核心语言，类型安全
React + Ink       - 终端 UI 框架（是的，用 React 渲染终端界面）
Anthropic SDK     - 与 Claude API 通信
Commander.js      - CLI 参数解析
Zod              - 运行时类型校验
```

**为什么用 React 渲染终端？** Ink 是一个将 React 组件渲染为终端输出的框架。这意味着 Claude Code 的 144 个 UI 组件都是标准的 React 组件，使用 Hooks、Context、状态管理——只不过渲染目标是终端而不是浏览器。

```tsx
// 典型的 Ink 终端组件示例
import { Box, Text } from "ink";
import { useState } from "react";

const StatusBar: React.FC<{ model: string; tokens: number }> = ({
  model,
  tokens,
}) => {
  return (
    <Box borderStyle="round" paddingX={1}>
      <Text color="cyan">Model: {model}</Text>
      <Text color="yellow"> | Tokens: {tokens.toLocaleString()}</Text>
    </Box>
  );
};
```

## 与竞品对比

| 特性 | Claude Code | GitHub Copilot | Cursor |
|------|-------------|----------------|--------|
| 运行环境 | 终端 CLI | IDE 插件 | 独立 IDE |
| 文件系统访问 | 完整访问 | 有限 | 有限 |
| Shell 执行 | 原生支持 | 不支持 | 有限支持 |
| Agent 能力 | 多级智能体 | 无 | 有限 |
| 上下文范围 | 整个项目 | 当前文件/标签页 | 项目级 |
| 可扩展性 | MCP + 插件 | 扩展 API | 插件 |
| 版本控制集成 | 深度 Git 集成 | 基础 | 基础 |

Claude Code 的核心差异化在于：**它是一个真正的 Agent，而不是一个补全工具**。它可以自主规划、执行多步骤任务、操作文件系统、运行命令，并根据结果调整策略。

## 三种运行模式

### 1. TUI 交互模式（默认）

```bash
claude
```

启动交互式终端界面，支持多轮对话、实时反馈、权限确认。

### 2. Headless 打印模式

```bash
claude --print "重构 src/utils.ts 中的 parseConfig 函数"
```

非交互式执行，适合 CI/CD 管道和脚本自动化。输入提示，直接输出结果。

### 3. Recovery CLI 模式

当会话异常中断时，Claude Code 提供恢复机制，可以从上次中断点继续执行。

## 快速开始

### 安装

```bash
npm install -g @anthropic-ai/claude-code
```

### 基本使用

```bash
# 启动交互式会话
claude

# 直接执行任务
claude --print "解释这个项目的目录结构"

# 指定模型
claude --model claude-sonnet-4-20250514

# 继续上次会话
claude --continue

# 使用斜杠命令
# 进入交互模式后输入:
# /help          - 查看所有命令
# /model         - 切换模型
# /compact       - 压缩上下文
# /memory        - 管理项目记忆
```

### 配置 CLAUDE.md

在项目根目录创建 `CLAUDE.md` 文件，写入项目特定的指令：

```markdown
# 项目约定

- 使用 pnpm 作为包管理器
- 测试命令: pnpm test
- 代码风格: 使用 Prettier + ESLint
- 提交信息格式: conventional commits
```

Claude Code 会在每次会话开始时自动读取这个文件，将其注入到系统提示中。

## 总结

Claude Code 代表了 AI 编程工具的一个重要方向：**从被动补全到主动 Agent**。它不只是帮你写代码，而是帮你完成整个软件工程流程——理解需求、搜索代码、修改文件、运行测试、提交代码。

在后续的系列文章中，我们将深入源码，逐步拆解 Claude Code 的架构设计、启动流程、执行引擎、提示词系统等核心模块。如果你对 AI Agent 的工程实现感兴趣，这个系列不容错过。
