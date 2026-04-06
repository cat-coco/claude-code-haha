# Claude Code 项目架构图集

本文收录了 Claude Code 核心架构的所有关键图表，每张图配有简要说明。适合作为快速参考手册使用。

## 1. 整体架构图

Claude Code 采用六层架构设计，从用户终端到 Anthropic API 的完整技术栈。

```mermaid
graph TB
    subgraph Entry["入口层"]
        CLI["cli.tsx"]
        MAIN["main.tsx 804KB"]
        SETUP["setup.ts 21KB"]
    end
    subgraph UI["UI层"]
        REPL["REPL.tsx"]
        COMP["144个组件"]
        INK["Ink渲染引擎"]
    end
    subgraph Core["核心引擎"]
        QE["QueryEngine 47KB"]
        QP["query.ts 69KB"]
        CMD["commands.ts 25KB"]
    end
    subgraph Tools["工具系统"]
        T42["42个内置工具"]
    end
    subgraph Services["服务层"]
        API["claude.ts 126KB"]
        MCP["MCP协议"]
        AUTH["OAuth认证"]
    end
    subgraph Infra["基础设施"]
        STATE["状态管理"]
        PERM["权限系统"]
        PLUGIN["插件系统"]
    end

    Entry --> UI --> Core --> Tools
    Core --> Services
    Infra --> UI & Core & Tools
```

## 2. 启动流程时序图

从用户在终端输入命令到 REPL 界面显示的完整启动链路。

```mermaid
sequenceDiagram
    participant U as 用户终端
    participant CLI as cli.tsx
    participant S as setup.ts
    participant M as main.tsx
    participant R as REPL.tsx

    U->>CLI: 输入 claude 命令
    CLI->>CLI: 解析参数 & Feature Flags
    CLI->>S: 初始化系统
    S->>S: Node版本检查
    S->>S: 工作目录 & Git检测
    S->>S: 权限初始化
    S->>M: 启动TUI
    M->>M: 加载配置/插件/MCP
    M->>R: React/Ink 渲染
    R-->>U: 显示 REPL 界面
```

## 3. 请求处理全流程

一次完整的用户请求从输入到响应的全链路。

```mermaid
sequenceDiagram
    participant U as 用户
    participant R as REPL
    participant Q as QueryEngine
    participant C as Context Builder
    participant A as Anthropic API
    participant T as Tool System
    participant S as State Store

    U->>R: 输入文本
    R->>Q: 提交查询
    Q->>C: 构建上下文
    C-->>Q: System Prompt + Messages
    Q->>A: 流式 API 请求
    A-->>Q: text / tool_use blocks
    
    loop Agent Loop
        Q->>T: 执行工具调用
        T-->>Q: 工具结果
        Q->>A: 回传结果继续对话
        A-->>Q: 下一步响应
    end
    
    Q->>S: 更新状态
    Q->>R: 渲染结果
    R->>U: 显示输出
```

## 4. 工具系统分类图

42个内置工具按功能分为6大类。

```mermaid
graph TB
    ROOT["42个内置工具"]
    
    ROOT --> FILE["文件操作 5个"]
    ROOT --> EXEC["执行工具 3个"]
    ROOT --> SEARCH["搜索工具 2个"]
    ROOT --> AGENT["智能体工具 4个"]
    ROOT --> MCPT["MCP工具 3个"]
    ROOT --> OTHER["其他工具 25个"]
    
    FILE --> FR["FileReadTool"]
    FILE --> FE["FileEditTool"]
    FILE --> FW["FileWriteTool"]
    FILE --> GL["GlobTool"]
    FILE --> GR["GrepTool"]
    
    EXEC --> BT["BashTool"]
    EXEC --> PS["PowerShellTool"]
    EXEC --> RP["REPLTool"]
    
    SEARCH --> WS["WebSearchTool"]
    SEARCH --> WF["WebFetchTool"]
    
    AGENT --> AT["AgentTool"]
    AGENT --> TC["TaskCreateTool"]
    AGENT --> SM["SendMessageTool"]
    AGENT --> AQ["AskUserQuestion"]
    
    MCPT --> MT["MCPTool"]
    MCPT --> LR["ListMcpResources"]
    MCPT --> RR["ReadMcpResource"]
```

## 5. 状态管理架构图

类 Zustand 的轻量级状态管理方案。

```mermaid
graph LR
    subgraph Store["AppStateStore"]
        S1["messages[]"]
        S2["tools[]"]
        S3["commands[]"]
        S4["selectedModel"]
        S5["appMode"]
        S6["permissions"]
    end
    
    Store --> CTX["React Context"]
    CTX --> SEL["Selectors"]
    
    SEL --> H1["useAppStore()"]
    SEL --> H2["useSettings()"]
    SEL --> H3["useMainLoopModel()"]
    
    H1 --> C1["REPL组件"]
    H2 --> C2["Settings组件"]
    H3 --> C3["Query组件"]
```

## 6. MCP 协议交互图

Model Context Protocol 的客户端-服务器交互架构。

```mermaid
graph TB
    subgraph Client["Claude Code MCP Client"]
        CONFIG["配置管理"]
        CONN["连接管理器"]
        OAUTH["OAuth认证"]
    end
    
    subgraph Transport["传输层"]
        STDIO["Stdio"]
        SSE["SSE"]
    end
    
    subgraph Server["MCP Servers"]
        GH["GitHub Server"]
        FS["Filesystem Server"]
        DB["Database Server"]
        CUSTOM["自定义Server"]
    end
    
    Client --> Transport --> Server
    
    Server --> TOOLS_R["Tools 工具发现"]
    Server --> RES["Resources 资源"]
    Server --> PROMPTS["Prompts 模板"]
```

## 7. 权限检查流程图

工具执行前的权限验证链路。

```mermaid
flowchart TD
    A[工具调用请求] --> B{检查权限模式}
    B -->|Auto| C{是安全工具?}
    B -->|Manual| D[弹出确认对话框]
    B -->|Bypass| E[直接允许]
    B -->|Policy| F{检查企业策略}
    
    C -->|是| E
    C -->|否| D
    D -->|用户允许| E
    D -->|用户拒绝| G[记录到deniedTools]
    F -->|允许| E
    F -->|禁止| G
    
    E --> H[执行工具]
    G --> I[返回拒绝信息]
```

## 核心文件大小参考

| 文件 | 大小 | 职责 |
|------|------|------|
| main.tsx | 804 KB | CLI主程序 |
| claude.ts | 126 KB | API客户端 |
| ConsoleOAuthFlow.tsx | 80 KB | OAuth界面 |
| ContextVisualization.tsx | 76 KB | Token可视化 |
| query.ts | 69 KB | 请求处理 |
| interactiveHelpers.tsx | 57 KB | 交互帮助 |
| QueryEngine.ts | 47 KB | 执行引擎 |
| Tool.ts | 30 KB | 工具定义 |
| commands.ts | 25 KB | 命令注册 |
| setup.ts | 21 KB | 初始化 |

这些架构图完整呈现了 Claude Code 从宏观到微观的技术设计全貌。
