import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pagination } from 'antd'
import { categories as allCategories, articles as allArticles, getArticleTags, getCategoryById } from '../content/index.js'
import ArticleCard from '../components/ArticleCard'

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [articles, setArticles] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cat = allCategories.find(c => c.slug === slug || String(c.id) === slug)
    setCategory(cat || null)
  }, [slug])

  useEffect(() => {
    setLoading(true)
    setError(null)
    try {
      if (category?.id) {
        const filtered = allArticles
          .filter(a => a.categoryId === category.id)
          .map(a => ({ ...a, categoryName: getCategoryById(a.categoryId)?.name || '', tags: getArticleTags(a) }))
        setTotal(filtered.length)
        const start = (page - 1) * pageSize
        setArticles(filtered.slice(start, start + pageSize))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
    fetchArticles()
  }, [slug, category, page, pageSize])

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const accentColor = category?.color || '#7c3aed'

  return (
    <div className="min-h-screen">
      {/* Category Header */}
      <div
        className="relative py-16"
        style={{
          background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}08 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-purple-600">首页</Link>
            <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900">{category?.name || slug}</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            {category?.name || slug}
          </h1>
          {category?.description && (
            <p className="text-gray-600 text-lg max-w-3xl">{category.description}</p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            共 {total} 篇文章
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 text-lg">该分类下暂无文章</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {total > pageSize && (
          <div className="mt-8 flex justify-center">
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={handlePageChange}
              showTotal={(t) => `共 ${t} 篇`}
            />
          </div>
        )}
      </div>
    </div>
  )
}
