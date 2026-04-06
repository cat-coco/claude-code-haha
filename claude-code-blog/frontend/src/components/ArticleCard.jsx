import { Link } from 'react-router-dom';
import { EyeIcon, ClockIcon } from '@heroicons/react/24/outline';

const difficultyMap = {
  1: { label: '入门', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  2: { label: '中级', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  3: { label: '高级', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
  4: { label: '专家', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
};

export default function ArticleCard({ article }) {
  const {
    id,
    title,
    summary,
    coverImage,
    categoryName,
    tags = [],
    viewCount = 0,
    publishedAt,
    difficulty,
    readTime,
  } = article;

  const difficultyInfo = difficultyMap[difficulty] || difficultyMap[1];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Link
      to={`/article/${id}`}
      className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Category Badge */}
          {categoryName && (
            <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-600 text-white shadow-sm">
              {categoryName}
            </span>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Category badge (when no cover image) + Difficulty */}
        <div className="flex items-center gap-2 mb-3">
          {!coverImage && categoryName && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
              {categoryName}
            </span>
          )}
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${difficultyInfo.color}`}>
            {difficultyInfo.label}
          </span>
          {publishedAt && (
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
              {formatDate(publishedAt)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Summary */}
        {summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {typeof tag === 'string' ? tag : tag.name}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                +{tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer: View count & Read time */}
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-1">
            <EyeIcon className="h-3.5 w-3.5" />
            {viewCount.toLocaleString()} 阅读
          </span>
          {readTime && (
            <span className="flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />
              {readTime} 分钟
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
