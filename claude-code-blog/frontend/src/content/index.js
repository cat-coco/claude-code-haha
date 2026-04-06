// 文章索引 - 所有文章的元数据定义
// 文章内容通过 Markdown 文件加载

export const categories = [
  { id: 1, name: '快速入门', slug: 'getting-started', icon: '🚀', color: '#10b981', description: 'Claude Code 安装配置与基础使用教程' },
  { id: 2, name: '源码架构', slug: 'architecture', icon: '🏗️', color: '#3b82f6', description: '整体架构与设计模式深度解析' },
  { id: 3, name: '核心机制', slug: 'core-mechanism', icon: '⚙️', color: '#8b5cf6', description: '核心引擎、提示词系统、上下文管理' },
  { id: 4, name: '工具系统', slug: 'tool-system', icon: '🔧', color: '#f59e0b', description: '42个内置工具的源码级深度剖析' },
  { id: 5, name: '深度研究', slug: 'deep-dive', icon: '🔬', color: '#ef4444', description: '状态管理、权限安全等专题研究' },
  { id: 6, name: '扩展能力', slug: 'extensions', icon: '🧩', color: '#06b6d4', description: 'MCP协议、插件、Skills、多智能体' },
  { id: 7, name: '实战应用', slug: 'practice', icon: '⚡', color: '#f97316', description: '最佳实践与应用案例' },
  { id: 8, name: '请求流程', slug: 'request-flow', icon: '🔄', color: '#ec4899', description: '完整请求全链路解析' },
  { id: 9, name: '架构图集', slug: 'diagrams', icon: '📊', color: '#14b8a6', description: '各模块架构图与流程图' },
]

export const tags = [
  { id: 1, name: 'TypeScript', color: '#3178c6' },
  { id: 2, name: 'React', color: '#61dafb' },
  { id: 3, name: 'Ink', color: '#ff6b6b' },
  { id: 4, name: '源码解读', color: '#10b981' },
  { id: 5, name: '架构设计', color: '#3b82f6' },
  { id: 6, name: '工具实现', color: '#f59e0b' },
  { id: 7, name: 'MCP协议', color: '#8b5cf6' },
  { id: 8, name: '提示词工程', color: '#ec4899' },
  { id: 9, name: '安全机制', color: '#ef4444' },
  { id: 10, name: '性能优化', color: '#06b6d4' },
  { id: 11, name: '状态管理', color: '#14b8a6' },
  { id: 12, name: 'CLI开发', color: '#6366f1' },
  { id: 13, name: 'AI编程', color: '#f97316' },
  { id: 14, name: '实战案例', color: '#84cc16' },
  { id: 15, name: '流程图', color: '#a855f7' },
]

export const articles = [
  {
    id: 1,
    title: 'Claude Code 是什么？一文带你全面了解',
    slug: 'what-is-claude-code',
    summary: '全面介绍 Claude Code 的定位、核心功能、技术架构和与其他 AI 编程工具的对比，帮助你快速了解这款 1900+ 文件的强大 AI 编程助手。',
    categoryId: 1,
    tagIds: [1, 4, 12, 13],
    difficulty: 1,
    sourceFile: 'src/entrypoints/cli.tsx',
    isTop: true,
    isRecommended: true,
    viewCount: 4856,
    wordCount: 3200,
    readTime: 11,
    publishedAt: '2026-01-15',
    mdFile: '01-what-is-claude-code.md',
  },
  {
    id: 2,
    title: 'Claude Code 源码架构全景解析',
    slug: 'architecture-overview',
    summary: '深入剖析 Claude Code 的六层架构设计：入口层、UI层、核心引擎、工具系统、服务层和基础设施层，配合完整架构图解读 1900+ 源文件的组织方式。',
    categoryId: 2,
    tagIds: [1, 2, 4, 5],
    difficulty: 2,
    sourceFile: 'src/main.tsx',
    isTop: true,
    isRecommended: true,
    viewCount: 4012,
    wordCount: 4500,
    readTime: 15,
    publishedAt: '2026-01-22',
    mdFile: '02-architecture-overview.md',
  },
  {
    id: 3,
    title: '从 cli.tsx 到 REPL：Claude Code 启动流程深度剖析',
    slug: 'startup-flow',
    summary: '完整追踪 Claude Code 从命令行输入到 REPL 界面显示的全过程，解读 cli.tsx 快速路径机制、setup.ts 初始化和 main.tsx 的 TUI 启动逻辑。',
    categoryId: 2,
    tagIds: [1, 4, 5, 12],
    difficulty: 3,
    sourceFile: 'src/entrypoints/cli.tsx',
    isRecommended: true,
    viewCount: 3456,
    wordCount: 3800,
    readTime: 13,
    publishedAt: '2026-02-01',
    mdFile: '03-startup-flow.md',
  },
  {
    id: 4,
    title: 'QueryEngine 源码解读：请求执行引擎的工作原理',
    slug: 'query-engine',
    summary: '深入解析 Claude Code 的核心——QueryEngine.ts（46.6KB），包括消息处理流程、工具调用循环、错误重试机制和 Token 管理策略。',
    categoryId: 3,
    tagIds: [1, 4, 5, 8],
    difficulty: 3,
    sourceFile: 'src/QueryEngine.ts',
    isRecommended: true,
    viewCount: 3890,
    wordCount: 4200,
    readTime: 14,
    publishedAt: '2026-02-10',
    mdFile: '04-query-engine.md',
  },
  {
    id: 5,
    title: 'Claude Code 提示词系统：System Prompt 的构建与优化',
    slug: 'prompt-system',
    summary: '解读 query.ts（68.7KB）中的提示词构建流水线，包括系统提示词生成、上下文注入、消息规范化和自动压缩机制。',
    categoryId: 3,
    tagIds: [1, 4, 8, 10],
    difficulty: 3,
    sourceFile: 'src/query.ts',
    viewCount: 2780,
    wordCount: 3600,
    readTime: 12,
    publishedAt: '2026-02-18',
    mdFile: '05-prompt-system.md',
  },
  {
    id: 6,
    title: '深入 Claude Code 工具系统：42个内置工具全解析',
    slug: 'tool-system-overview',
    summary: '全面解析 Claude Code 的工具系统架构，包括 Tool 接口定义、工具注册机制、权限检查流程，以及 42 个工具的分类介绍。',
    categoryId: 4,
    tagIds: [1, 4, 5, 6],
    difficulty: 2,
    sourceFile: 'src/tools.ts',
    isRecommended: true,
    viewCount: 3210,
    wordCount: 3400,
    readTime: 11,
    publishedAt: '2026-02-25',
    mdFile: '06-tool-system.md',
  },
  {
    id: 7,
    title: 'BashTool 源码解读：Shell 执行的安全边界',
    slug: 'bash-tool',
    summary: '深入 BashTool 实现，解读 Shell.ts 封装、沙箱机制、超时处理、输出捕获和安全策略的设计细节。',
    categoryId: 4,
    tagIds: [1, 4, 6, 9],
    difficulty: 3,
    sourceFile: 'src/tools/BashTool/',
    viewCount: 2340,
    wordCount: 3000,
    readTime: 10,
    publishedAt: '2026-03-01',
    mdFile: '07-bash-tool.md',
  },
  {
    id: 8,
    title: 'FileReadTool 与文件操作工具族源码解析',
    slug: 'file-tools',
    summary: '解析 FileReadTool、FileEditTool、FileWriteTool 三大文件操作工具的实现，包括缓存机制、行号处理和文件类型检测。',
    categoryId: 4,
    tagIds: [1, 4, 6],
    difficulty: 2,
    sourceFile: 'src/tools/FileReadTool/',
    viewCount: 1980,
    wordCount: 2800,
    readTime: 9,
    publishedAt: '2026-03-05',
    mdFile: '08-file-tools.md',
  },
  {
    id: 9,
    title: 'AgentTool 源码解读：子智能体的诞生与协作',
    slug: 'agent-tool',
    summary: '深入解析 Claude Code 最复杂的工具之一——AgentTool，了解子智能体的创建、Worktree 隔离、上下文保持和 SendMessage 通信机制。',
    categoryId: 4,
    tagIds: [1, 4, 5, 6],
    difficulty: 4,
    sourceFile: 'src/tools/AgentTool/',
    viewCount: 2670,
    wordCount: 3500,
    readTime: 12,
    publishedAt: '2026-03-10',
    mdFile: '09-agent-tool.md',
  },
  {
    id: 10,
    title: 'AppStateStore 架构：Claude Code 状态管理深度研究',
    slug: 'state-management',
    summary: '解析 Claude Code 类 Zustand 的状态管理方案，包括 AppState Context Provider、状态树结构、选择器模式和 React Hooks 集成。',
    categoryId: 5,
    tagIds: [1, 2, 4, 11],
    difficulty: 3,
    sourceFile: 'src/state/AppStateStore.ts',
    viewCount: 2120,
    wordCount: 3200,
    readTime: 11,
    publishedAt: '2026-03-15',
    mdFile: '10-state-management.md',
  },
  {
    id: 11,
    title: '权限与安全机制：Claude Code 如何保护你的系统',
    slug: 'permissions-security',
    summary: '深入解读 Claude Code 的多层权限模型：Auto/Manual/Bypass/Policy 四种模式、工具白名单机制、危险操作检测和企业策略管控。',
    categoryId: 5,
    tagIds: [1, 4, 9],
    difficulty: 3,
    sourceFile: 'src/utils/permissions/',
    viewCount: 2450,
    wordCount: 3000,
    readTime: 10,
    publishedAt: '2026-03-18',
    mdFile: '11-permissions-security.md',
  },
  {
    id: 12,
    title: 'MCP 协议集成：Claude Code 的扩展基石',
    slug: 'mcp-protocol',
    summary: '全面解读 Model Context Protocol 在 Claude Code 中的实现，包括 MCP 客户端、服务发现、工具/资源/提示词解析和 OAuth 认证流程。',
    categoryId: 6,
    tagIds: [1, 4, 5, 7],
    difficulty: 3,
    sourceFile: 'src/services/mcp/',
    isRecommended: true,
    viewCount: 2890,
    wordCount: 3800,
    readTime: 13,
    publishedAt: '2026-03-22',
    mdFile: '12-mcp-protocol.md',
  },
  {
    id: 13,
    title: 'Skills 与 Plugin 系统：构建你自己的扩展',
    slug: 'skills-plugins',
    summary: '解读 Claude Code 的技能系统和插件架构，了解内置技能的实现方式和如何创建自定义扩展。',
    categoryId: 6,
    tagIds: [1, 4, 6],
    difficulty: 2,
    sourceFile: 'src/skills/',
    viewCount: 1870,
    wordCount: 2600,
    readTime: 9,
    publishedAt: '2026-03-28',
    mdFile: '13-skills-plugins.md',
  },
  {
    id: 14,
    title: '一次完整的 Claude Code 请求流程',
    slug: 'complete-request-flow',
    summary: '端到端追踪一次 Claude Code 请求的全链路：从用户输入、命令解析、上下文构建、API 调用、工具执行到结果渲染的 10 个关键步骤。',
    categoryId: 8,
    tagIds: [1, 4, 5, 15],
    difficulty: 2,
    sourceFile: 'src/QueryEngine.ts',
    isTop: true,
    isRecommended: true,
    viewCount: 4520,
    wordCount: 5000,
    readTime: 17,
    publishedAt: '2026-04-01',
    mdFile: '14-request-flow.md',
  },
  {
    id: 15,
    title: 'Claude Code 项目架构图集',
    slug: 'architecture-diagrams',
    summary: '收录 Claude Code 核心架构图：整体架构、模块依赖、状态流转、工具系统、请求流程等，每张图配有详细解读。',
    categoryId: 9,
    tagIds: [4, 5, 15],
    difficulty: 1,
    sourceFile: 'src/',
    isRecommended: true,
    viewCount: 3680,
    wordCount: 2000,
    readTime: 7,
    publishedAt: '2026-04-05',
    mdFile: '15-architecture-diagrams.md',
  },
]

// 辅助函数
export function getArticlesByCategory(categorySlug) {
  const cat = categories.find(c => c.slug === categorySlug)
  if (!cat) return []
  return articles.filter(a => a.categoryId === cat.id)
}

export function getArticleBySlug(slug) {
  return articles.find(a => a.slug === slug)
}

export function getArticleById(id) {
  return articles.find(a => a.id === id)
}

export function getCategoryById(id) {
  return categories.find(c => c.id === id)
}

export function getTagById(id) {
  return tags.find(t => t.id === id)
}

export function getArticleTags(article) {
  return (article.tagIds || []).map(id => tags.find(t => t.id === id)).filter(Boolean)
}

export function getRecommendedArticles(limit = 6) {
  return articles.filter(a => a.isRecommended).slice(0, limit)
}

export function getTopArticles(limit = 10) {
  return [...articles].sort((a, b) => b.viewCount - a.viewCount).slice(0, limit)
}
