import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Spin } from 'antd'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const ArticleList = lazy(() => import('./pages/ArticleList'))
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const Architecture = lazy(() => import('./pages/Architecture'))
const RequestFlow = lazy(() => import('./pages/RequestFlow'))
const About = lazy(() => import('./pages/About'))

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminArticles = lazy(() => import('./pages/admin/Articles'))
const AdminArticleEdit = lazy(() => import('./pages/admin/ArticleEdit'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))
const AdminTags = lazy(() => import('./pages/admin/Tags'))
const AdminComments = lazy(() => import('./pages/admin/Comments'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spin size="large" tip="加载中..." />
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<ArticleList />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/request-flow" element={<RequestFlow />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="article/new" element={<AdminArticleEdit />} />
          <Route path="article/edit/:id" element={<AdminArticleEdit />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="comments" element={<AdminComments />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
