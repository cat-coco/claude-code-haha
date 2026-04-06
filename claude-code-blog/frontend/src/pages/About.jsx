import React from 'react'
import { Link } from 'react-router-dom'

const claudeCodeStack = [
  { name: 'TypeScript', desc: '主要编程语言，强类型保障' },
  { name: 'React', desc: 'UI 组件化开发框架' },
  { name: 'Ink', desc: '终端 UI 渲染引擎，将 React 渲染到终端' },
  { name: 'Zustand-like Store', desc: '轻量级状态管理' },
  { name: 'MCP Protocol', desc: 'Model Context Protocol，外部工具集成' },
  { name: 'OAuth 2.0', desc: '认证授权机制' },
]

const blogStack = [
  { name: 'Spring Boot 3', desc: '后端框架，提供 RESTful API' },
  { name: 'React 18', desc: '前端框架，SPA 单页应用' },
  { name: 'Tailwind CSS', desc: '原子化 CSS 框架' },
  { name: 'MySQL 8', desc: '关系型数据库' },
  { name: 'MyBatis-Plus', desc: 'ORM 框架' },
  { name: 'Ant Design', desc: '后台管理 UI 组件库' },
]

const links = [
  { name: 'Claude Code 官方文档', url: 'https://docs.anthropic.com/en/docs/claude-code', desc: 'Anthropic 官方文档' },
  { name: 'Anthropic', url: 'https://www.anthropic.com', desc: 'Claude 的创建者' },
  { name: 'GitHub - Claude Code', url: 'https://github.com/anthropics/claude-code', desc: '源码仓库' },
]

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">关于本站</h1>
          <p className="text-xl text-purple-100">
            全网最深度的 Claude Code 源码解析博客
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Purpose */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">项目初衷</h2>
          <div className="text-gray-600 space-y-4 leading-relaxed">
            <p>
              Claude Code 是 Anthropic 推出的一款强大的 AI 编程助手，它能直接在终端中帮助开发者
              编写、调试和管理代码。其源码包含 1900+ 文件，涵盖了工具系统、Agent Loop、MCP 协议、
              权限管理等众多精妙的架构设计。
            </p>
            <p>
              然而，面对如此庞大的代码库，很多开发者难以找到入口，不知道从何处开始阅读。
              本站的目标就是成为你的 Claude Code 源码导读，通过深入浅出的文章、精心绘制的架构图、
              逐行的代码解读，帮助你真正理解 Claude Code 的设计思想和实现细节。
            </p>
            <p>
              无论你是想学习大型 TypeScript 项目的架构设计，还是想了解 AI Agent 的工程实践，
              亦或是想为 Claude Code 贡献代码，本站都能为你提供有价值的参考。
            </p>
          </div>
        </section>

        {/* Claude Code Tech Stack */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Claude Code 技术栈</h2>
          <p className="text-gray-500 mb-6">Claude Code 源码所使用的核心技术</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {claudeCodeStack.map((tech) => (
              <div key={tech.name} className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                  <p className="text-sm text-gray-500">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Blog Tech Stack */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">博客技术栈</h2>
          <p className="text-gray-500 mb-6">本站使用的技术栈</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {blogStack.map((tech) => (
              <div key={tech.name} className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border border-purple-100">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                  <p className="text-sm text-gray-500">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">联系方式</h2>
          <div className="text-gray-600 space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>邮箱：contact@example.com</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>GitHub：github.com/example</span>
            </div>
          </div>
        </section>

        {/* Acknowledgments */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">致谢</h2>
          <div className="text-gray-600 space-y-4 leading-relaxed">
            <p>
              感谢 <strong>Anthropic</strong> 团队创建了 Claude 和 Claude Code 这样优秀的产品。
              Claude Code 的源码展示了 AI Agent 工程化的最佳实践，是学习大型 TypeScript 项目
              架构设计的绝佳范例。
            </p>
            <p>
              感谢 <strong>Claude Code 团队</strong> 的所有贡献者，他们精心设计的工具系统、
              权限模型和 MCP 协议，为整个 AI 开发工具生态树立了标杆。
            </p>
            <p>
              感谢所有读者的支持和反馈，你们的鼓励是我们持续创作的动力。
            </p>
          </div>
        </section>

        {/* Links */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">相关链接</h2>
          <div className="space-y-3">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all group"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {link.name}
                  </h4>
                  <p className="text-sm text-gray-500">{link.desc}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">准备好开始探索了吗？</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/articles"
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              浏览文章
            </Link>
            <Link
              to="/architecture"
              className="inline-flex items-center justify-center px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
            >
              查看架构
            </Link>
            <Link
              to="/request-flow"
              className="inline-flex items-center justify-center px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
            >
              请求流程
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
