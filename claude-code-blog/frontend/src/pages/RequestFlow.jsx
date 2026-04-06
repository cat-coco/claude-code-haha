import React from 'react'
import MermaidDiagram from '../components/MermaidDiagram'

const fullSequenceDiagram = `sequenceDiagram
    participant U as 用户
    participant R as REPL
    participant Q as QueryEngine
    participant C as Context
    participant A as Anthropic API
    participant T as Tool System
    participant S as State Store

    U->>R: 输入文本/命令
    R->>Q: 提交查询
    Q->>C: 构建上下文
    C-->>Q: System Prompt + Messages
    Q->>A: 发送API请求(流式)
    A-->>Q: 响应流(text/tool_use)
    Q->>T: 执行工具调用
    T-->>Q: 工具执行结果
    Q->>A: 发送工具结果(继续对话)
    A-->>Q: 最终响应
    Q->>S: 更新状态
    Q->>R: 渲染结果
    R->>U: 显示输出`

const steps = [
  {
    number: 1,
    title: '用户输入',
    source: 'src/components/REPL.tsx / TextInput',
    description: '用户在终端中输入文本或命令。REPL 组件使用 Ink 的 TextInput 捕获键盘输入，支持多行编辑、历史记录、Tab 补全等功能。输入提交后进入命令解析阶段。',
    diagram: `sequenceDiagram
    participant User as 用户终端
    participant TI as TextInput组件
    participant REPL as REPL.tsx

    User->>TI: 键盘输入
    TI->>TI: 实时渲染输入
    User->>TI: Enter提交
    TI->>REPL: onSubmit(text)
    REPL->>REPL: 判断输入类型`,
    code: `// REPL.tsx 中的输入处理
const handleSubmit = (text: string) => {
  if (text.startsWith('/')) {
    // 斜杠命令处理
    handleSlashCommand(text)
  } else {
    // 自然语言查询
    submitQuery(text)
  }
}`,
  },
  {
    number: 2,
    title: '命令解析',
    source: 'src/core/commands.ts',
    description: '输入文本首先判断是否为斜杠命令（以 / 开头）。commands.ts 注册了 60+ 个斜杠命令，包括 /help, /model, /compact, /memory 等。如果不是命令，则作为自然语言查询进入请求流程。',
    diagram: `flowchart TD
    INPUT[用户输入] --> CHECK{以/开头?}
    CHECK -->|是| PARSE[解析斜杠命令]
    CHECK -->|否| QUERY[进入查询流程]
    PARSE --> MATCH{匹配命令?}
    MATCH -->|是| EXEC[执行命令]
    MATCH -->|否| ERROR[显示错误提示]
    EXEC --> RESULT[命令结果]`,
    code: `// commands.ts 命令注册示例
const commands = {
  '/help': { desc: '显示帮助信息', handler: showHelp },
  '/model': { desc: '切换模型', handler: switchModel },
  '/compact': { desc: '压缩对话历史', handler: compactHistory },
  '/memory': { desc: '管理长期记忆', handler: manageMemory },
  // ... 60+ 个命令
}`,
  },
  {
    number: 3,
    title: '上下文构建',
    source: 'src/core/context.ts / systemPrompt.ts',
    description: 'Context Builder 负责组装完整的 System Prompt。它会收集多种上下文信息：项目的 CLAUDE.md 配置、当前 git 状态、长期记忆（Memory）、会话历史、可用工具列表等，最终构建出发送给 API 的完整系统提示。',
    diagram: `flowchart LR
    subgraph "上下文来源"
        CLAUDE_MD[CLAUDE.md<br/>项目配置]
        GIT[Git状态<br/>分支/变更]
        MEMORY[Memory<br/>长期记忆]
        SESSION[Session<br/>会话信息]
        TOOLS_DEF[Tools<br/>工具定义]
    end
    subgraph "构建过程"
        BUILDER[Context Builder]
        PROMPT[System Prompt]
    end

    CLAUDE_MD --> BUILDER
    GIT --> BUILDER
    MEMORY --> BUILDER
    SESSION --> BUILDER
    TOOLS_DEF --> BUILDER
    BUILDER --> PROMPT`,
    code: `// 上下文构建伪代码
async function buildContext(session) {
  const parts = []

  // 1. 基础系统提示
  parts.push(BASE_SYSTEM_PROMPT)

  // 2. 项目配置
  const claudeMd = await readClaudeMd(session.cwd)
  if (claudeMd) parts.push(claudeMd)

  // 3. Git 状态
  const gitStatus = await getGitStatus(session.cwd)
  parts.push(formatGitContext(gitStatus))

  // 4. 长期记忆
  const memory = await loadMemory()
  if (memory) parts.push(memory)

  return parts.join('\\n\\n')
}`,
  },
  {
    number: 4,
    title: '消息规范化',
    source: 'src/core/query.ts',
    description: '在发送请求前，query.ts 会对消息历史进行规范化处理。包括 token 计数、超长对话的自动压缩（auto-compaction）、消息格式转换等。确保请求不超过模型的上下文窗口限制。',
    diagram: `flowchart TD
    MESSAGES[消息历史] --> COUNT[Token计数]
    COUNT --> CHECK{超过限制?}
    CHECK -->|是| COMPACT[自动压缩]
    CHECK -->|否| FORMAT[格式化消息]
    COMPACT --> FORMAT
    FORMAT --> NORMALIZE[规范化处理]
    NORMALIZE --> READY[准备就绪]`,
    code: `// 消息规范化处理
function normalizeMessages(messages, maxTokens) {
  const tokenCount = countTokens(messages)

  if (tokenCount > maxTokens * 0.8) {
    // 触发自动压缩
    messages = autoCompact(messages, {
      keepSystemPrompt: true,
      keepRecentN: 10,
      summarizeOlder: true,
    })
  }

  return messages.map(normalizeMessage)
}`,
  },
  {
    number: 5,
    title: 'API 请求',
    source: 'src/services/claude.ts',
    description: 'claude.ts（125KB）负责与 Anthropic API 通信。它构建完整的请求载荷，包括模型选择、工具定义、系统提示和消息历史，然后发起流式（streaming）请求。支持多种认证方式和重试机制。',
    diagram: `sequenceDiagram
    participant QE as QueryEngine
    participant CLIENT as claude.ts
    participant API as Anthropic API

    QE->>CLIENT: 发起请求
    CLIENT->>CLIENT: 构建请求载荷
    CLIENT->>CLIENT: 添加认证头
    CLIENT->>API: POST /v1/messages (stream)
    API-->>CLIENT: SSE event: message_start
    API-->>CLIENT: SSE event: content_block_start
    API-->>CLIENT: SSE event: content_block_delta (多次)
    API-->>CLIENT: SSE event: message_stop
    CLIENT-->>QE: 流式返回响应块`,
    code: `// API 请求构建
const request = {
  model: 'claude-sonnet-4-20250514',
  max_tokens: 16384,
  system: systemPrompt,
  messages: normalizedMessages,
  tools: toolDefinitions,
  stream: true,
  metadata: { user_id: sessionId },
}`,
  },
  {
    number: 6,
    title: '响应流处理',
    source: 'src/core/QueryEngine.ts',
    description: 'QueryEngine 接收 API 的流式响应，逐块处理三种类型的内容块：text（文本响应）、tool_use（工具调用请求）、thinking（思考过程）。文本块实时渲染到终端，工具调用块触发工具执行流程。',
    diagram: `flowchart TD
    STREAM[响应流] --> PARSE[解析SSE事件]
    PARSE --> TYPE{内容块类型}
    TYPE -->|text| RENDER[实时渲染文本]
    TYPE -->|tool_use| TOOL[提取工具调用]
    TYPE -->|thinking| THINK[处理思考过程]
    RENDER --> UI[更新UI]
    TOOL --> EXEC[进入工具执行]
    THINK --> UI`,
    code: `// 流式响应处理
for await (const event of stream) {
  switch (event.type) {
    case 'content_block_delta':
      if (event.delta.type === 'text_delta') {
        // 实时渲染文本到终端
        appendText(event.delta.text)
      } else if (event.delta.type === 'input_json_delta') {
        // 累积工具调用参数
        accumulateToolInput(event.delta.partial_json)
      }
      break
    case 'content_block_stop':
      if (currentBlock.type === 'tool_use') {
        // 执行工具调用
        await executeTool(currentBlock)
      }
      break
  }
}`,
  },
  {
    number: 7,
    title: '工具执行',
    source: 'src/tools/ (42 个工具文件)',
    description: '当 API 返回 tool_use 块时，工具系统首先进行权限检查（Auto/Manual/Policy），然后在沙箱环境中执行工具，最后捕获执行结果。权限检查可能需要用户确认（Manual 模式）。',
    diagram: `flowchart TD
    CALL[工具调用请求] --> FIND[查找工具定义]
    FIND --> PERM{权限检查}
    PERM -->|Auto| EXEC[直接执行]
    PERM -->|Manual| ASK[请求用户确认]
    PERM -->|Policy| POLICY[策略评估]
    ASK -->|允许| EXEC
    ASK -->|拒绝| DENY[返回拒绝]
    POLICY -->|通过| EXEC
    POLICY -->|拒绝| DENY
    EXEC --> SANDBOX[沙箱执行]
    SANDBOX --> RESULT[捕获结果]
    RESULT --> FORMAT_R[格式化结果]`,
    code: `// 工具执行流程
async function executeTool(toolCall) {
  const tool = registry.get(toolCall.name)

  // 1. 权限检查
  const permission = await checkPermission(tool, toolCall.input)
  if (permission === 'denied') {
    return { error: 'Permission denied by user' }
  }

  // 2. 沙箱执行
  const result = await tool.execute(toolCall.input, {
    cwd: session.cwd,
    timeout: tool.timeout,
  })

  // 3. 结果捕获
  return formatToolResult(result)
}`,
  },
  {
    number: 8,
    title: '循环迭代',
    source: 'src/core/QueryEngine.ts',
    description: '这是 Agent Loop 的核心。如果 API 响应中包含工具调用，工具执行完毕后，结果会作为新消息发送回 API，让模型继续推理。这个循环会一直持续，直到模型返回纯文本响应（不再需要工具调用）。',
    diagram: `flowchart TD
    START[接收API响应] --> CHECK{包含tool_use?}
    CHECK -->|否| DONE[循环结束]
    CHECK -->|是| EXEC[执行工具]
    EXEC --> RESULT[收集结果]
    RESULT --> SEND[发送工具结果给API]
    SEND --> RECV[接收新响应]
    RECV --> CHECK
    DONE --> RENDER[最终渲染]`,
    code: `// Agent Loop 核心逻辑
async function agentLoop(initialMessages) {
  let messages = [...initialMessages]

  while (true) {
    const response = await callAPI(messages)

    const toolUses = response.content
      .filter(b => b.type === 'tool_use')

    if (toolUses.length === 0) {
      // 没有工具调用，循环结束
      return response
    }

    // 执行所有工具调用
    const results = await Promise.all(
      toolUses.map(executeTool)
    )

    // 将结果加入消息历史
    messages.push(
      { role: 'assistant', content: response.content },
      { role: 'user', content: results }
    )
  }
}`,
  },
  {
    number: 9,
    title: '结果渲染',
    source: 'src/components/ (144 个组件)',
    description: '最终响应通过 Ink 渲染引擎呈现在终端中。文本使用 Markdown 格式渲染，代码块支持语法高亮，工具调用过程显示为可折叠的面板。整个渲染过程是响应式的，实时更新。',
    diagram: `flowchart LR
    RESPONSE[最终响应] --> PARSE_R[解析内容块]
    PARSE_R --> TEXT_R[文本渲染]
    PARSE_R --> CODE_R[代码高亮]
    PARSE_R --> TOOL_R[工具面板]
    TEXT_R --> INK_R[Ink渲染]
    CODE_R --> INK_R
    TOOL_R --> INK_R
    INK_R --> TERMINAL[终端输出]`,
    code: `// 响应渲染组件
function MessageBlock({ content }) {
  return content.map((block, i) => {
    switch (block.type) {
      case 'text':
        return <MarkdownRenderer key={i} text={block.text} />
      case 'tool_use':
        return <ToolUseBlock key={i} tool={block} />
      case 'tool_result':
        return <ToolResultBlock key={i} result={block} />
    }
  })
}`,
  },
  {
    number: 10,
    title: '历史记录',
    source: 'src/state/store.ts / memory.ts',
    description: '请求完成后，完整的对话记录被保存到会话状态中。如果用户使用了 /memory 命令或触发了自动记忆，关键信息会持久化到长期记忆（Memory）。同时，分析数据会被记录用于改进体验。',
    diagram: `flowchart TD
    COMPLETE[请求完成] --> SAVE_MSG[保存消息历史]
    COMPLETE --> UPDATE_MEM[更新长期记忆]
    COMPLETE --> LOG_ANALYTICS[记录分析数据]
    SAVE_MSG --> SESSION_STORE[Session Store]
    UPDATE_MEM --> MEMORY_FILE[Memory文件]
    LOG_ANALYTICS --> ANALYTICS_SVC[Analytics服务]`,
    code: `// 会话保存与记忆更新
async function onRequestComplete(response, session) {
  // 1. 保存到会话
  store.appendMessage({
    role: 'assistant',
    content: response.content,
  })

  // 2. 更新记忆 (如果需要)
  if (shouldUpdateMemory(response)) {
    await memory.append(extractKeyInfo(response))
  }

  // 3. 分析日志
  analytics.log({
    type: 'query_complete',
    toolsUsed: response.toolCalls.length,
    duration: response.duration,
  })
}`,
  },
]

export default function RequestFlow() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">一次完整的 Claude Code 请求流程</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            从用户输入到结果展示，10 个步骤深入理解 Claude Code 的工作机制
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Full Sequence Diagram */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">完整流程时序图</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
            <MermaidDiagram chart={fullSequenceDiagram} />
          </div>
        </section>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-indigo-500 hidden lg:block" />

          <div className="space-y-12">
            {steps.map((step) => (
              <section key={step.number} className="relative">
                {/* Step number badge */}
                <div className="flex items-start gap-6">
                  <div className="hidden lg:flex w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg relative z-10">
                    {step.number}
                  </div>

                  <div className="flex-1">
                    {/* Step header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="lg:hidden inline-flex w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white items-center justify-center text-lg font-bold flex-shrink-0">
                          {step.number}
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <code className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{step.source}</code>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Diagram */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-x-auto">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">流程图</h4>
                        <MermaidDiagram chart={step.diagram} />
                      </div>

                      {/* Code */}
                      <div className="bg-gray-900 rounded-xl shadow-sm p-4 overflow-x-auto">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">关键代码</h4>
                        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Summary */}
        <section className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">流程总结</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">核心特点</h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">&#9679;</span>
                  <span>流式处理：从 API 请求到终端渲染，全程流式传输</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">&#9679;</span>
                  <span>Agent Loop：工具调用形成自动化循环，直到任务完成</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">&#9679;</span>
                  <span>权限控制：每次工具调用都经过权限系统审查</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">&#9679;</span>
                  <span>上下文管理：智能压缩确保不超出上下文窗口</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">关键文件</h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <code className="text-purple-600 bg-purple-50 px-1 rounded text-xs">query.ts</code>
                  <span>68KB - 请求处理核心</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-purple-600 bg-purple-50 px-1 rounded text-xs">QueryEngine.ts</code>
                  <span>46KB - 执行引擎</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-purple-600 bg-purple-50 px-1 rounded text-xs">claude.ts</code>
                  <span>125KB - API 客户端</span>
                </li>
                <li className="flex items-start gap-2">
                  <code className="text-purple-600 bg-purple-50 px-1 rounded text-xs">commands.ts</code>
                  <span>60+ 斜杠命令</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
