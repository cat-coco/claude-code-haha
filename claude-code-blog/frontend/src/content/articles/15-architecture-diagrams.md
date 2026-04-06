---
title: "Claude Code 项目架构图集"
description: "七张核心架构图，可视化呈现 Claude Code 的整体架构、模块依赖、启动流程、请求链路、工具系统、状态管理与 MCP 协议"
date: "2026-04-06"
order: 15
tags: ["architecture", "diagrams", "visual-reference", "mermaid"]
---

# Claude Code 项目架构图集

本文是 Claude Code 架构系列的可视化参考手册。七张核心架构图，覆盖从整体分层到细节交互的全部关键视角。每张图附带简要说明，帮助你快速建立对系统的直觉认知。

建议收藏本文，在阅读其他文章时随时回来对照。

---

## 1. 整体架构图（六层分层）

Claude Code 采用经典的分层架构，从上到下分为表现层、命令层、核心引擎层、服务层、工具层和基础设施层。每一层只依赖其下方的层，确保关注点分离。

```mermaid
graph TB
    subgraph L1["表现层 Presentation"]
        REPL["REPL.tsx<br/>主交互界面"]
        Messages["MessageList.tsx<br/>消息渲染"]
        ToolUI["ToolCallUI.tsx<br/>工具调用展示"]
        Permission["PermissionDialog.tsx<br/>权限确认"]
        StatusBar["StatusBar.tsx<br/>状态栏"]
    end

    subgraph L2["命令层 Command"]
        Parser["CommandParser<br/>输入解析"]
        Registry["CommandRegistry<br/>命令注册表"]
        SlashCmds["SlashCommands<br/>/help /clear /compact"]
        SkillInvoke["SkillInvoker<br/>Skill 触发"]
    end

    subgraph L3["核心引擎层 Core Engine"]
        QE["QueryEngine<br/>请求编排"]
        AL["AgentLoop<br/>多轮工具交互"]
        SP["StreamProcessor<br/>流式响应解析"]
        CTX["ContextBuilder<br/>上下文构建"]
        Prompt["PromptAssembler<br/>System Prompt 组装"]
    end

    subgraph L4["服务层 Services"]
        API["ClaudeAPI<br/>Anthropic API 客户端"]
        MCP["MCPManager<br/>MCP 协议管理"]
        Auth["AuthService<br/>认证与密钥"]
        Config["ConfigService<br/>配置加载"]
        Memory["MemoryService<br/>会话记忆"]
    end

    subgraph L5["工具层 Tools"]
        FileTools["文件工具<br/>Read/Write/Edit/Glob/Grep"]
        ExecTools["执行工具<br/>Bash/NotebookEdit"]
        WebTools["网络工具<br/>WebFetch/WebSearch"]
        MCPTools["MCP 工具<br/>动态注册"]
        GitTools["Git 工具<br/>内置 Git 操作"]
    end

    subgraph L6["基础设施层 Infrastructure"]
        FS["文件系统<br/>fs/promises"]
        Process["进程管理<br/>child_process"]
        Network["网络<br/>fetch/SSE"]
        Storage["持久化<br/>JSON/SQLite"]
        Sandbox["沙箱<br/>权限隔离"]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L3 --> L5
    L4 --> L6
    L5 --> L6

    style L1 fill:#e8f5e9
    style L2 fill:#e3f2fd
    style L3 fill:#fff3e0
    style L4 fill:#f3e5f5
    style L5 fill:#fce4ec
    style L6 fill:#efebe9
```

---

## 2. 模块依赖图

这张图展示了核心模块之间的 import 依赖关系。箭头方向表示"依赖于"。可以看到 QueryEngine 是依赖最密集的模块，它是整个系统的编排中心。

```mermaid
graph LR
    REPL["REPL.tsx"] --> QE["QueryEngine"]
    REPL --> CMD["CommandParser"]
    CMD --> QE
    CMD --> SR["SkillRegistry"]

    QE --> CTX["ContextBuilder"]
    QE --> PA["PromptAssembler"]
    QE --> API["ClaudeAPI"]
    QE --> SP["StreamProcessor"]
    QE --> TE["ToolExecutor"]
    QE --> AL["AgentLoop"]

    CTX --> GIT["GitService"]
    CTX --> MEM["MemoryService"]
    CTX --> CFG["ConfigService"]

    PA --> TR["ToolRegistry"]
    PA --> PERM["PermissionConfig"]

    TE --> TR
    TE --> PERM
    TE --> PC["PermissionChecker"]

    SP --> RENDER["Renderer"]

    TR --> FT["FileTools"]
    TR --> ET["ExecTools"]
    TR --> WT["WebTools"]
    TR --> MCPT["MCPTools"]

    MCPT --> MCM["MCPConnectionManager"]
    MCM --> MCPC["MCPClient"]

    SR --> BS["BundledSkills"]
    SR --> LD["LoadSkillsDir"]
    SR --> MSB["MCPSkillBuilder"]
    MSB --> MCM

    style QE fill:#ff922b,color:#fff
    style TR fill:#339af0,color:#fff
    style MCM fill:#7c3aed,color:#fff
```

---

## 3. 启动流程图

Claude Code 的启动过程分为五个阶段：环境检测、配置加载、服务初始化、MCP 连接和 UI 挂载。整个过程在约 1-3 秒内完成。

```mermaid
sequenceDiagram
    participant CLI as CLI Entry<br/>bin/claude.ts
    participant ENV as EnvDetector
    participant CFG as ConfigLoader
    participant AUTH as AuthService
    participant TR as ToolRegistry
    participant MCP as MCPManager
    participant SR as SkillRegistry
    participant UI as Ink App<br/>REPL.tsx

    CLI->>ENV: 1. 检测运行环境
    ENV-->>CLI: platform, shell, isGitRepo, nodeVersion

    CLI->>CFG: 2. 加载配置
    CFG->>CFG: ~/.claude/settings.json
    CFG->>CFG: .claude/settings.json (项目级)
    CFG->>CFG: 环境变量覆盖
    CFG-->>CLI: mergedConfig

    CLI->>AUTH: 3. 验证认证
    AUTH->>AUTH: 检查 API Key
    AUTH-->>CLI: authenticated

    CLI->>TR: 4. 注册内置工具
    TR->>TR: 注册 Read/Write/Edit/Bash/Glob/Grep...
    TR-->>CLI: 42 tools registered

    CLI->>MCP: 5. 初始化 MCP 连接
    MCP->>MCP: 读取 .claude/mcp.json
    MCP->>MCP: 并行连接所有 Server
    MCP->>TR: 注册 MCP 工具
    MCP-->>CLI: MCP ready (N servers)

    CLI->>SR: 6. 加载 Skills
    SR->>SR: 内置 Skills
    SR->>SR: 目录 Skills
    SR->>SR: MCP Skills
    SR-->>CLI: Skills ready

    CLI->>UI: 7. 挂载 Ink 应用
    UI->>UI: render(<App />)
    UI-->>CLI: REPL ready

    Note over CLI,UI: 启动完成，等待用户输入
```

---

## 4. 请求流程图（完整版）

这是最详细的请求流程图，展示了从用户输入到最终渲染的全部参与者和交互。特别注意 Agent Loop 部分——它是 Claude Code 自主完成复杂任务的核心机制。

```mermaid
sequenceDiagram
    actor U as User
    participant R as REPL
    participant P as Parser
    participant C as ContextBuilder
    participant Q as QueryEngine
    participant A as ClaudeAPI
    participant S as StreamProcessor
    participant PC as PermissionChecker
    participant T as ToolExecutor
    participant RD as Renderer
    participant ST as StateStore

    U->>R: 输入消息 + Enter

    R->>P: processInput(text)
    P->>P: 是斜杠命令?

    alt 斜杠命令
        P->>P: 执行命令 handler
        P-->>R: 命令结果
    else 自然语言
        P->>C: buildContext()

        par 并行收集
            C->>C: git status
            C->>C: git branch
            C->>C: 读取 CLAUDE.md
            C->>C: 加载会话记忆
        end

        C-->>Q: ConversationContext

        Q->>Q: buildSystemPrompt()
        Q->>Q: 添加 user message 到历史

        loop Agent Loop (最多 50 轮)
            Q->>A: 流式 API 请求
            A-->>S: SSE 事件流

            S->>S: 解析 content blocks

            par 实时渲染
                S->>RD: text delta
                RD->>U: 终端输出
            end

            alt 包含 tool_use blocks
                loop 每个工具调用
                    S->>PC: canUseTool(name, input)

                    alt 需要确认
                        PC->>U: 显示确认对话框
                        U-->>PC: 用户决定
                    end

                    PC-->>S: allowed/denied

                    alt 允许执行
                        S->>T: execute(tool, input)
                        T-->>S: ToolResult
                    else 拒绝执行
                        S-->>S: 生成拒绝结果
                    end
                end

                S->>Q: 工具结果数组
                Q->>Q: 添加到对话历史
                Note over Q: 继续下一轮 Agent Loop
            else 仅 text blocks
                Note over Q: Agent Loop 结束
            end
        end

        Q->>ST: persistAfterRequest()

        par 并行持久化
            ST->>ST: 保存对话历史
            ST->>ST: 更新会话记忆
            ST->>ST: 记录使用统计
            ST->>ST: 更新最近文件
        end
    end
```

---

## 5. 工具系统图（按类别分组）

Claude Code 内置了 42 个工具，按功能分为六大类。MCP 工具是动态注册的，数量取决于连接了多少 MCP Server。

```mermaid
graph TB
    subgraph Core["核心工具 (7)"]
        Read["Read<br/>读取文件"]
        Write["Write<br/>写入文件"]
        Edit["Edit<br/>编辑文件"]
        Glob["Glob<br/>文件搜索"]
        Grep["Grep<br/>内容搜索"]
        Bash["Bash<br/>Shell 执行"]
        ToolSearch["ToolSearch<br/>工具搜索"]
    end

    subgraph Web["网络工具 (2)"]
        WebFetch["WebFetch<br/>HTTP 请求"]
        WebSearch["WebSearch<br/>网页搜索"]
    end

    subgraph Notebook["Notebook 工具 (2)"]
        NBRead["NotebookRead<br/>读取 Notebook"]
        NBEdit["NotebookEdit<br/>编辑 Notebook"]
    end

    subgraph Agent["Agent 工具 (2)"]
        SubAgent["Agent<br/>子代理任务"]
        TodoWrite["TodoWrite<br/>任务管理"]
    end

    subgraph Skill["Skill 工具 (1)"]
        SkillTool["Skill<br/>调用技能"]
    end

    subgraph MCP["MCP 动态工具 (N)"]
        GH["mcp__github__*<br/>GitHub 操作"]
        DB["mcp__database__*<br/>数据库查询"]
        Custom["mcp__custom__*<br/>自定义工具"]
        More["...<br/>更多 MCP 工具"]
    end

    Registry["ToolRegistry<br/>统一注册表"]

    Registry --> Core
    Registry --> Web
    Registry --> Notebook
    Registry --> Agent
    Registry --> Skill
    Registry --> MCP

    style Registry fill:#ff922b,color:#fff
    style Core fill:#339af0,color:#fff
    style Web fill:#51cf66,color:#fff
    style Notebook fill:#be4bdb,color:#fff
    style Agent fill:#fcc419,color:#333
    style Skill fill:#ff6b6b,color:#fff
    style MCP fill:#7c3aed,color:#fff
```

---

## 6. 状态管理图

Claude Code 的状态分布在多个层级：运行时状态在内存中，持久状态写入文件系统。这张图展示了各状态的数据流向。

```mermaid
graph TB
    subgraph Runtime["运行时状态 (内存)"]
        Conv["对话历史<br/>Message[]"]
        Stream["流式缓冲<br/>text buffer"]
        ToolState["工具状态<br/>执行中/完成"]
        UIState["UI 状态<br/>processing/idle"]
        MCPState["MCP 连接状态<br/>connected/error"]
    end

    subgraph Persistent["持久状态 (文件系统)"]
        Sessions["~/.claude/sessions/<br/>对话历史 JSON"]
        Config["~/.claude/settings.json<br/>用户配置"]
        Memory["~/.claude/memory/<br/>会话记忆"]
        Stats["~/.claude/stats/<br/>使用统计"]
        MCPTokens["~/.claude/mcp-tokens/<br/>OAuth Token"]
    end

    subgraph Project["项目级状态"]
        ClaudeMD["CLAUDE.md<br/>项目指令"]
        ProjConfig[".claude/settings.json<br/>项目配置"]
        MCPConfig[".claude/mcp.json<br/>MCP 配置"]
        Skills[".claude/skills/<br/>自定义技能"]
    end

    Conv -->|"请求结束"| Sessions
    Conv -->|"记忆提取"| Memory
    ToolState -->|"统计记录"| Stats
    MCPState -->|"Token 刷新"| MCPTokens

    Sessions -->|"恢复会话"| Conv
    Config -->|"启动加载"| UIState
    Memory -->|"上下文注入"| Conv
    MCPTokens -->|"认证"| MCPState

    ClaudeMD -->|"每次请求读取"| Conv
    ProjConfig -->|"覆盖全局配置"| Config
    MCPConfig -->|"初始化连接"| MCPState
    Skills -->|"注册技能"| ToolState

    style Runtime fill:#fff3e0
    style Persistent fill:#e3f2fd
    style Project fill:#e8f5e9
```

---

## 7. MCP 协议交互图

这张图展示了 Claude Code 作为 MCP Client 与多个 MCP Server 交互的完整生命周期，包括初始化握手、工具发现、工具调用和错误恢复。

```mermaid
sequenceDiagram
    participant CC as Claude Code<br/>(MCP Client)
    participant CM as ConnectionManager
    participant T1 as Stdio Transport
    participant T2 as SSE Transport
    participant S1 as GitHub Server
    participant S2 as Database Server

    Note over CC,S2: === 初始化阶段 ===

    CC->>CM: initializeFromConfig()

    par 并行连接
        CM->>T1: 启动子进程
        T1->>S1: spawn("npx @anthropic/mcp-server-github")
        S1-->>T1: process ready
        CM->>T1: initialize(capabilities)
        T1->>S1: JSON-RPC: initialize
        S1-->>T1: serverCapabilities
        CM->>T1: notifications/initialized
    and
        CM->>T2: HTTP 连接
        T2->>S2: GET /sse
        S2-->>T2: SSE stream opened
        CM->>T2: initialize(capabilities)
        T2->>S2: JSON-RPC: initialize
        S2-->>T2: serverCapabilities
        CM->>T2: notifications/initialized
    end

    Note over CC,S2: === 工具发现 ===

    CC->>CM: getAllTools()
    par
        CM->>S1: tools/list
        S1-->>CM: [create_pr, list_issues, ...]
    and
        CM->>S2: tools/list
        S2-->>CM: [query_sql, list_tables, ...]
    end
    CM-->>CC: 合并工具列表

    Note over CC,S2: === 工具调用 ===

    CC->>CM: callTool("mcp__github__create_pr", args)
    CM->>S1: tools/call(name="create_pr", args)
    S1->>S1: 调用 GitHub API
    S1-->>CM: {content: [{type: "text", text: "PR #42 created"}]}
    CM-->>CC: MCPToolResult

    Note over CC,S2: === 健康检查与重连 ===

    loop 每 30 秒
        CM->>S1: ping
        S1-->>CM: pong
        CM->>S2: ping
        S2--xCM: 连接断开!

        CM->>CM: 检测到 S2 失败
        CM->>T2: 重新建立连接
        T2->>S2: GET /sse (重连)
        S2-->>T2: SSE stream reopened
        CM->>S2: initialize (重新握手)
        S2-->>CM: serverCapabilities
        CM->>CM: S2 恢复正常
    end

    Note over CC,S2: === 资源订阅 (可选) ===

    CC->>CM: subscribeResource("db://tables/users")
    CM->>S2: resources/subscribe(uri)
    S2-->>CM: subscribed

    S2->>CM: notifications/resources/updated(uri)
    CM->>CC: onResourceUpdated(uri)
    CC->>CM: readResource(uri)
    CM->>S2: resources/read(uri)
    S2-->>CM: resource content
    CM-->>CC: 最新数据
```

---

## 图集使用建议

这七张图覆盖了 Claude Code 架构的不同维度：

| 图表 | 回答的问题 |
|------|-----------|
| 整体架构图 | 系统由哪些层组成？各层的职责是什么？ |
| 模块依赖图 | 改动一个模块会影响哪些其他模块？ |
| 启动流程图 | 从命令行启动到 REPL 就绪经历了什么？ |
| 请求流程图 | 一个用户请求的完整生命周期是怎样的？ |
| 工具系统图 | 有哪些工具可用？如何分类？ |
| 状态管理图 | 状态保存在哪里？如何流转？ |
| MCP 协议图 | 外部服务是如何接入的？ |

建议在以下场景回顾对应的图表：

- **开始贡献代码**：先看整体架构图和模块依赖图，了解改动的影响范围
- **调试问题**：对照请求流程图，定位问题出在哪个环节
- **开发扩展**：参考工具系统图和 MCP 协议图，选择合适的扩展方式
- **优化性能**：结合启动流程图和状态管理图，找到瓶颈点

架构图不是文档的终点，而是理解系统的起点。带着这些图去阅读源码，你会发现一切都变得清晰了。
