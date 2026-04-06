import React from 'react'
import MermaidDiagram from '../components/MermaidDiagram'

const overallArchitecture = `graph TB
    subgraph "入口层 Entry Layer"
        CLI[cli.tsx<br/>CLI入口]
        MAIN[main.tsx<br/>主程序804KB]
    end
    subgraph "UI层 Presentation Layer"
        REPL[REPL.tsx<br/>交互界面]
        COMP[144个React组件<br/>Components]
        INK[Ink渲染引擎<br/>Terminal UI]
    end
    subgraph "核心引擎 Core Engine"
        QE[QueryEngine.ts<br/>请求执行引擎46KB]
        QP[query.ts<br/>请求处理68KB]
        CMD[commands.ts<br/>60+斜杠命令]
    end
    subgraph "工具系统 Tool System"
        TOOLS[42个内置工具<br/>Tool Registry]
        FILE[文件工具<br/>Read/Edit/Write]
        BASH[执行工具<br/>Bash/REPL]
        SEARCH[搜索工具<br/>Grep/Glob/Web]
        AGENT[智能体工具<br/>Agent/Task]
    end
    subgraph "服务层 Service Layer"
        API[API客户端<br/>claude.ts 125KB]
        MCP[MCP协议<br/>服务管理]
        AUTH[OAuth认证]
        ANALYTICS[数据分析]
    end
    subgraph "基础设施 Infrastructure"
        STATE[状态管理<br/>Zustand-like Store]
        PERM[权限系统<br/>Auto/Manual/Policy]
        CTX[上下文管理<br/>Context & Memory]
        PLUGIN[插件系统<br/>Skills & Plugins]
    end
    CLI --> MAIN --> REPL
    REPL --> COMP
    COMP --> INK
    REPL --> QE
    QE --> QP
    QE --> CMD
    QE --> TOOLS
    TOOLS --> FILE & BASH & SEARCH & AGENT
    QP --> API
    API --> MCP
    API --> AUTH
    STATE --> REPL
    PERM --> TOOLS
    CTX --> QP
    PLUGIN --> TOOLS`

const moduleDependencies = `graph LR
    subgraph "入口"
        cli[cli.tsx]
        main[main.tsx]
    end
    subgraph "UI"
        repl[REPL.tsx]
        components[Components]
    end
    subgraph "Core"
        query[query.ts]
        engine[QueryEngine.ts]
        commands[commands.ts]
    end
    subgraph "Tools"
        registry[ToolRegistry]
        builtins[42 Tools]
    end
    subgraph "Services"
        claude[claude.ts]
        mcp[McpClient]
        auth[OAuth]
    end
    subgraph "State"
        store[Store]
        context[Context]
        memory[Memory]
    end

    cli --> main
    main --> repl
    repl --> components
    repl --> engine
    engine --> query
    engine --> commands
    engine --> registry
    registry --> builtins
    query --> claude
    claude --> mcp
    claude --> auth
    store --> repl
    store --> engine
    context --> query
    memory --> context`

const stateArchitecture = `graph TD
    subgraph "状态来源"
        USER[用户输入]
        API_RES[API响应]
        TOOL_RES[工具结果]
        CONFIG[配置文件]
    end
    subgraph "状态管理层"
        STORE[Global Store<br/>Zustand-like]
        SESSION[Session State<br/>会话状态]
        MSG[Message History<br/>消息历史]
        PERM_STATE[Permission State<br/>权限状态]
    end
    subgraph "消费者"
        REPL_UI[REPL UI<br/>界面渲染]
        QUERY_E[Query Engine<br/>请求处理]
        TOOL_E[Tool Executor<br/>工具执行]
        CONTEXT_B[Context Builder<br/>上下文构建]
    end

    USER --> STORE
    API_RES --> MSG
    TOOL_RES --> MSG
    CONFIG --> STORE

    STORE --> SESSION
    STORE --> MSG
    STORE --> PERM_STATE

    SESSION --> REPL_UI
    MSG --> QUERY_E
    MSG --> CONTEXT_B
    PERM_STATE --> TOOL_E`

const toolSystemArchitecture = `graph TB
    subgraph "工具注册中心 Tool Registry"
        REG[ToolRegistry<br/>工具注册与发现]
    end
    subgraph "文件操作 File Operations"
        READ[Read<br/>文件读取]
        WRITE[Write<br/>文件写入]
        EDIT[Edit<br/>文件编辑]
        MFREAD[MultiFileRead<br/>多文件读取]
    end
    subgraph "搜索工具 Search Tools"
        GREP[Grep<br/>内容搜索]
        GLOB[Glob<br/>文件匹配]
        WEB_S[WebSearch<br/>网络搜索]
        WEB_F[WebFetch<br/>网页获取]
    end
    subgraph "执行工具 Execution Tools"
        BASH_T[Bash<br/>Shell执行]
        REPL_T[REPL<br/>交互式执行]
        NOTEBOOK[NotebookEdit<br/>Jupyter编辑]
    end
    subgraph "智能体工具 Agent Tools"
        AGENT_T[Agent<br/>子智能体]
        TASK[Task<br/>任务管理]
        TODO[TodoWrite<br/>待办管理]
    end
    subgraph "MCP工具 MCP Tools"
        MCP_T[MCP Tools<br/>外部服务工具]
        GH[GitHub<br/>代码仓库]
        SLACK[Slack<br/>团队通信]
    end
    subgraph "权限系统 Permission System"
        AUTO[Auto<br/>自动批准]
        MANUAL[Manual<br/>手动确认]
        POLICY[Policy<br/>策略规则]
    end

    REG --> READ & WRITE & EDIT & MFREAD
    REG --> GREP & GLOB & WEB_S & WEB_F
    REG --> BASH_T & REPL_T & NOTEBOOK
    REG --> AGENT_T & TASK & TODO
    REG --> MCP_T
    MCP_T --> GH & SLACK

    AUTO --> REG
    MANUAL --> REG
    POLICY --> REG`

const directoryTree = [
  { name: 'claude-code/', indent: 0, desc: '项目根目录' },
  { name: 'src/', indent: 1, desc: '源码目录 (1900+ 文件)' },
  { name: 'cli.tsx', indent: 2, desc: 'CLI 入口文件' },
  { name: 'main.tsx', indent: 2, desc: '主程序入口 (804KB)' },
  { name: 'components/', indent: 2, desc: 'React 组件 (144 个)' },
  { name: 'REPL.tsx', indent: 3, desc: '交互式界面' },
  { name: 'MessageList.tsx', indent: 3, desc: '消息列表' },
  { name: 'ToolUseBlock.tsx', indent: 3, desc: '工具调用展示' },
  { name: '...', indent: 3, desc: '' },
  { name: 'core/', indent: 2, desc: '核心引擎' },
  { name: 'query.ts', indent: 3, desc: '请求处理 (68KB)' },
  { name: 'QueryEngine.ts', indent: 3, desc: '请求执行引擎 (46KB)' },
  { name: 'commands.ts', indent: 3, desc: '60+ 斜杠命令' },
  { name: 'tools/', indent: 2, desc: '工具系统 (42 个工具)' },
  { name: 'Read.ts', indent: 3, desc: '文件读取工具' },
  { name: 'Edit.ts', indent: 3, desc: '文件编辑工具' },
  { name: 'Bash.ts', indent: 3, desc: 'Shell 执行工具' },
  { name: 'Grep.ts', indent: 3, desc: '内容搜索工具' },
  { name: 'Agent.ts', indent: 3, desc: '子智能体工具' },
  { name: '...', indent: 3, desc: '' },
  { name: 'services/', indent: 2, desc: '服务层' },
  { name: 'claude.ts', indent: 3, desc: 'API 客户端 (125KB)' },
  { name: 'mcp/', indent: 3, desc: 'MCP 协议实现' },
  { name: 'auth/', indent: 3, desc: 'OAuth 认证' },
  { name: 'state/', indent: 2, desc: '状态管理' },
  { name: 'store.ts', indent: 3, desc: '全局状态' },
  { name: 'context.ts', indent: 3, desc: '上下文管理' },
  { name: 'permissions/', indent: 2, desc: '权限系统' },
  { name: 'hooks/', indent: 2, desc: 'React Hooks' },
  { name: 'utils/', indent: 2, desc: '工具函数' },
]

export default function Architecture() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Claude Code 项目架构全景</h1>
          <p className="text-xl text-indigo-100 max-w-3xl">
            从入口到工具执行，从状态管理到权限系统，全面解析 Claude Code 的架构设计
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Section 1: Overall Architecture */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">1</span>
              整体架构概览
            </h2>
            <p className="text-gray-600 text-lg max-w-4xl">
              Claude Code 采用分层架构设计，从 CLI 入口到基础设施层，共分为 6 个主要层次。
              每一层都有明确的职责边界，通过清晰的接口进行通信。整个项目包含 1900+ 源文件，
              核心代码量超过 300KB，是一个典型的大型 TypeScript + React (Ink) 应用。
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
            <MermaidDiagram chart={overallArchitecture} />
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-1">入口层</h4>
              <p className="text-sm text-gray-500">CLI 参数解析、主程序初始化、环境检测</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-1">UI 层</h4>
              <p className="text-sm text-gray-500">基于 Ink 的终端 UI，144 个 React 组件</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-1">核心引擎</h4>
              <p className="text-sm text-gray-500">请求处理、命令系统、Agent Loop 核心</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-1">工具系统</h4>
              <p className="text-sm text-gray-500">42 个内置工具，统一注册与调度</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-1">服务层</h4>
              <p className="text-sm text-gray-500">API 通信、MCP 协议、认证授权</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-1">基础设施</h4>
              <p className="text-sm text-gray-500">状态管理、权限系统、插件机制</p>
            </div>
          </div>
        </section>

        {/* Section 2: Directory Structure */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">2</span>
              目录结构
            </h2>
            <p className="text-gray-600 text-lg max-w-4xl">
              Claude Code 的源码组织清晰，按功能模块划分目录。以下是核心目录和关键文件的结构概览：
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl shadow-sm p-6 overflow-x-auto">
            <div className="font-mono text-sm">
              {directoryTree.map((item, idx) => (
                <div key={idx} className="flex items-start" style={{ paddingLeft: `${item.indent * 24}px` }}>
                  <span className={`${item.name === '...' ? 'text-gray-500' : item.indent < 2 ? 'text-blue-400' : item.name.includes('/') ? 'text-yellow-400' : 'text-green-400'}`}>
                    {item.name.includes('/') ? '\u{1F4C1} ' : item.name === '...' ? '' : '\u{1F4C4} '}
                    {item.name}
                  </span>
                  {item.desc && (
                    <span className="text-gray-500 ml-4">{'// '}{item.desc}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Module Dependencies */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">3</span>
              模块依赖关系
            </h2>
            <p className="text-gray-600 text-lg max-w-4xl">
              模块之间的依赖关系体现了数据和控制的流向。从入口到服务层，形成了清晰的单向依赖链。
              状态管理模块贯穿全局，为各层提供统一的状态访问接口。
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
            <MermaidDiagram chart={moduleDependencies} />
          </div>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">关键设计原则</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>- 单向数据流：入口 &rarr; UI &rarr; Core &rarr; Services，避免循环依赖</li>
              <li>- 依赖注入：工具系统通过 Registry 模式解耦</li>
              <li>- 状态隔离：每个会话维护独立的状态空间</li>
              <li>- 接口抽象：服务层通过统一接口对接不同 API 提供商</li>
            </ul>
          </div>
        </section>

        {/* Section 4: State Management */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">4</span>
              状态管理架构
            </h2>
            <p className="text-gray-600 text-lg max-w-4xl">
              Claude Code 采用类似 Zustand 的轻量级状态管理方案。状态按职责划分为会话状态、
              消息历史和权限状态三大类，分别服务于不同的消费者模块。
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
            <MermaidDiagram chart={stateArchitecture} />
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Session State</h4>
              <p className="text-sm text-gray-500">
                管理当前会话的全局状态，包括用户配置、界面模式、工作目录等。
                由 REPL UI 直接消费用于界面渲染。
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Message History</h4>
              <p className="text-sm text-gray-500">
                维护完整的对话历史，包括用户消息、助手响应、工具调用结果。
                支持 auto-compaction 自动压缩机制。
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Permission State</h4>
              <p className="text-sm text-gray-500">
                追踪工具权限状态，记录用户的授权决策。支持 Auto、Manual、Policy 三种模式。
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Context Builder</h4>
              <p className="text-sm text-gray-500">
                从状态中提取信息构建 System Prompt，整合 CLAUDE.md、git 状态、Memory 等上下文。
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Tool System */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-lg font-bold">5</span>
              工具系统架构
            </h2>
            <p className="text-gray-600 text-lg max-w-4xl">
              工具系统是 Claude Code 的核心竞争力，共包含 42 个内置工具，覆盖文件操作、搜索、
              执行、智能体和 MCP 扩展五大类。所有工具通过统一的 ToolRegistry 注册和调度，
              并受权限系统约束。
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
            <MermaidDiagram chart={toolSystemArchitecture} />
          </div>
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-4">工具分类概览</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-2">文件操作 (4 个)</h5>
                <p className="text-sm text-blue-600">Read, Write, Edit, MultiFileRead</p>
                <p className="text-xs text-blue-500 mt-1">文件的读取、写入、编辑和批量操作</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 mb-2">搜索工具 (4 个)</h5>
                <p className="text-sm text-green-600">Grep, Glob, WebSearch, WebFetch</p>
                <p className="text-xs text-green-500 mt-1">代码搜索、文件匹配和网络信息获取</p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                <h5 className="font-semibold text-orange-800 mb-2">执行工具 (3 个)</h5>
                <p className="text-sm text-orange-600">Bash, REPL, NotebookEdit</p>
                <p className="text-xs text-orange-500 mt-1">Shell 命令执行和交互式环境</p>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                <h5 className="font-semibold text-purple-800 mb-2">智能体工具 (3 个)</h5>
                <p className="text-sm text-purple-600">Agent, Task, TodoWrite</p>
                <p className="text-xs text-purple-500 mt-1">子智能体调度和任务管理</p>
              </div>
              <div className="bg-pink-50 border border-pink-100 rounded-lg p-4">
                <h5 className="font-semibold text-pink-800 mb-2">MCP 工具 (动态)</h5>
                <p className="text-sm text-pink-600">GitHub, Slack, 自定义服务...</p>
                <p className="text-xs text-pink-500 mt-1">通过 MCP 协议动态注册的外部工具</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-2">权限系统</h5>
                <p className="text-sm text-gray-600">Auto, Manual, Policy</p>
                <p className="text-xs text-gray-500 mt-1">三级权限控制，保障安全执行</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
