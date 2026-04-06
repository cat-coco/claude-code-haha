import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pagination } from 'antd'
import { articles as allArticles, categories as allCategories, getArticleTags, getCategoryById } from '../content/index.js'
import ArticleCard from '../components/ArticleCard'
import CategorySidebar from '../components/CategorySidebar'

const difficultyOptions = [
  { label: '全部难度', value: '' },
  { label: '入门', value: 'beginner' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'advanced' },
]

const sortOptions = [
  { label: '最新', value: 'latest' },
  { label: '最热', value: 'popular' },
]

export default function ArticleList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const page = parseInt(searchParams.get('page')) || 1
  const pageSize = parseInt(searchParams.get('pageSize')) || 12
  const categoryId = searchParams.get('categoryId') || ''
  const keyword = searchParams.get('keyword') || ''
  const difficulty = searchParams.get('difficulty') || ''
  const sort = searchParams.get('sort') || 'latest'

  const [searchInput, setSearchInput] = useState(keyword)

  const updateParams = useCallback((updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    if (updates.page === undefined && !('page' in updates)) {
      newParams.set('page', '1')
    }
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  useEffect(() => {
    // 从本地内容构建分类树
    const tree = allCategories.map(c => ({ category: c, children: [] }))
    setCategories(tree)
  }, [])

  useEffect(() => {
    setLoading(true)
    // 本地文章过滤和分页
    let filtered = [...allArticles]
    if (categoryId) filtered = filtered.filter(a => a.categoryId === Number(categoryId))
    if (keyword) filtered = filtered.filter(a => a.title.includes(keyword) || a.summary.includes(keyword))
    if (difficulty) {
      const diffMap = { beginner: 1, intermediate: 2, advanced: 3 }
      filtered = filtered.filter(a => a.difficulty === diffMap[difficulty])
    }
    if (sort === 'popular') {
      filtered.sort((a, b) => b.viewCount - a.viewCount)
    } else {
      filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    }
    setTotal(filtered.length)
    const start = (page - 1) * pageSize
    const paged = filtered.slice(start, start + pageSize).map(a => ({
      ...a,
      categoryName: getCategoryById(a.categoryId)?.name || '',
      tags: getArticleTags(a),
    }))
    setArticles(paged)
    setLoading(false)
  }, [page, pageSize, categoryId, keyword, difficulty, sort])

  const handleSearch = (e) => {
    e.preventDefault()
    updateParams({ keyword: searchInput, page: '1' })
  }

  const handlePageChange = (newPage, newPageSize) => {
    updateParams({ page: String(newPage), pageSize: String(newPageSize) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <CategorySidebar
              categories={categories}
              activeSlug={categoryId}
            />
          </div>
        </aside>

        {/* Mobile sidebar toggle */}
        <button
          className="lg:hidden fixed bottom-6 left-6 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">文章分类</h3>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CategorySidebar
                categories={categories}
                activeSlug={categoryId}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Filter bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="搜索文章..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
              <select
                value={difficulty}
                onChange={(e) => updateParams({ difficulty: e.target.value, page: '1' })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? '加载中...' : `共 ${total} 篇文章`}
            </p>
          </div>

          {/* Article grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16" />
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">暂无文章</p>
              <p className="text-gray-400 text-sm mt-1">试试其他搜索条件吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div className="mt-8 flex justify-center">
              <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(t) => `共 ${t} 篇`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
