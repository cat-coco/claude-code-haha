import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articles as allArticles, getArticleById, getArticleTags, getCategoryById, getRecommendedArticles } from '../content/index.js'
import { loadArticleContent } from '../utils/loadArticle.js'
import MarkdownRenderer from '../components/MarkdownRenderer'

const difficultyMap = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-700' },
  intermediate: { label: '中级', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: '高级', color: 'bg-red-100 text-red-700' },
}

function generateToc(content) {
  if (!content) return []
  const headingRegex = /^(#{1,4})\s+(.+)$/gm
  const toc = []
  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].replace(/[`*_~]/g, '')
    const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '')
    toc.push({ level, text, id })
  }
  return toc
}

export default function ArticleDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [recommendedArticles, setRecommendedArticles] = useState([])
  const [comments, setComments] = useState([])
  const [commentTotal, setCommentTotal] = useState(0)
  const [liked, setLiked] = useState(false)
  const [activeHeading, setActiveHeading] = useState('')
  const [commentForm, setCommentForm] = useState({
    nickname: '',
    email: '',
    content: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const toc = useMemo(() => generateToc(article?.content), [article?.content])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        setError(null)
        // 从本地内容加载文章
        const articleMeta = getArticleById(Number(id))
        if (!articleMeta) throw new Error('文章不存在')
        const content = await loadArticleContent(articleMeta.mdFile)
        const res = {
          ...articleMeta,
          content,
          categoryName: getCategoryById(articleMeta.categoryId)?.name || '',
          tags: getArticleTags(articleMeta),
        }
        setArticle(res)

        // 相关文章（同分类）
        const related = allArticles
          .filter(a => a.categoryId === res.categoryId && a.id !== res.id)
          .slice(0, 3)
          .map(a => ({ ...a, categoryName: getCategoryById(a.categoryId)?.name || '' }))
        setRelatedArticles(related)

        // 推荐文章
        const recommended = getRecommendedArticles(5)
          .filter(a => a.id !== res.id)
          .slice(0, 5)
          .map(a => ({ ...a, categoryName: getCategoryById(a.categoryId)?.name || '' }))
        setRecommendedArticles(recommended)
      } catch (err) {
        console.error('Failed to fetch article:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
    window.scrollTo({ top: 0 })
  }, [id])

  useEffect(() => {
    const fetchComments = async () => {
      // 评论功能需要后端支持，当前使用空数据
      setComments([])
      setCommentTotal(0)
    }
    if (id) fetchComments()
  }, [id])

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
      let current = ''
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 120) {
          current = heading.id
        }
      })
      setActiveHeading(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentForm.nickname.trim() || !commentForm.content.trim()) return
    try {
      setSubmitting(true)
      await commentApi.save({
        articleId: parseInt(id),
        nickname: commentForm.nickname,
        email: commentForm.email,
        content: commentForm.content,
      })
      setCommentForm({ nickname: '', email: '', content: '' })
      const res = await commentApi.list(id, { page: 1, pageSize: 50 })
      setComments(res?.records || res?.list || res || [])
      setCommentTotal(res?.total || 0)
    } catch (err) {
      console.error('Failed to submit comment:', err)
      alert('评论提交失败，请稍后再试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg className="mx-auto w-16 h-16 text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">文章加载失败</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link to="/articles" className="text-purple-600 hover:text-purple-700">返回文章列表</Link>
      </div>
    )
  }

  if (!article) return null

  const diff = difficultyMap[article.difficulty] || difficultyMap.beginner

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Left sidebar - Table of Contents */}
        <aside className="hidden xl:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">目录</h3>
            <nav className="space-y-1 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {toc.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  className={`block text-sm py-1 border-l-2 transition-colors ${
                    activeHeading === item.id
                      ? 'border-purple-600 text-purple-600 font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-purple-600">首页</Link>
            <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {article.categoryName && (
              <>
                <Link to={`/category/${article.categorySlug || article.categoryId}`} className="hover:text-purple-600">
                  {article.categoryName}
                </Link>
                <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            <span className="text-gray-900 truncate">{article.title}</span>
          </nav>

          {/* Article header */}
          <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              {article.author && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {article.author}
                </span>
              )}
              {article.createTime && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(article.createTime).toLocaleDateString('zh-CN')}
                </span>
              )}
              {article.readTime && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {article.readTime} 分钟阅读
                </span>
              )}
              {article.viewCount !== undefined && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {article.viewCount} 次阅读
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diff.color}`}>
                {diff.label}
              </span>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag.id || tag}
                    className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full"
                  >
                    {tag.name || tag}
                  </span>
                ))}
              </div>
            )}

            {/* Source file path */}
            {article.sourceFile && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600 mb-6">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>对应源码: </span>
                <code className="text-purple-600 font-mono">{article.sourceFile}</code>
              </div>
            )}

            {/* Article content */}
            <div className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-a:text-purple-600">
              <MarkdownRenderer content={article.content || ''} />
            </div>

            {/* Like button */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                  liked
                    ? 'bg-red-50 text-red-500 border border-red-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                }`}
              >
                <svg className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-medium">{liked ? '已点赞' : '点赞'}</span>
                {article.likeCount > 0 && <span className="text-sm">({article.likeCount + (liked ? 1 : 0)})</span>}
              </button>
            </div>
          </article>

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">相关文章</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedArticles.map((a) => (
                  <Link
                    key={a.id}
                    to={`/article/${a.id}`}
                    className="group p-4 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all"
                  >
                    <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
                      {a.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{a.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              评论 {commentTotal > 0 && <span className="text-gray-400 text-base">({commentTotal})</span>}
            </h3>

            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="昵称 *"
                  value={commentForm.nickname}
                  onChange={(e) => setCommentForm({ ...commentForm, nickname: e.target.value })}
                  required
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="邮箱（选填）"
                  value={commentForm.email}
                  onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <textarea
                placeholder="写下你的评论..."
                value={commentForm.content}
                onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-4"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {submitting ? '提交中...' : '发表评论'}
              </button>
            </form>

            {/* Comments list */}
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">暂无评论，来做第一个评论的人吧</p>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold flex-shrink-0">
                      {(comment.nickname || '匿名')[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.nickname || '匿名'}</span>
                        <span className="text-xs text-gray-400">
                          {comment.createTime && new Date(comment.createTime).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Article info card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">文章信息</h3>
              <div className="space-y-3 text-sm">
                {article.wordCount && (
                  <div className="flex justify-between text-gray-600">
                    <span>字数</span>
                    <span className="font-medium">{article.wordCount.toLocaleString()}</span>
                  </div>
                )}
                {article.readTime && (
                  <div className="flex justify-between text-gray-600">
                    <span>阅读时间</span>
                    <span className="font-medium">{article.readTime} 分钟</span>
                  </div>
                )}
                {article.viewCount !== undefined && (
                  <div className="flex justify-between text-gray-600">
                    <span>阅读量</span>
                    <span className="font-medium">{article.viewCount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended articles */}
            {recommendedArticles.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">推荐阅读</h3>
                <div className="space-y-3">
                  {recommendedArticles.map((a) => (
                    <Link
                      key={a.id}
                      to={`/article/${a.id}`}
                      className="block text-sm text-gray-600 hover:text-purple-600 transition-colors line-clamp-2"
                    >
                      {a.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
