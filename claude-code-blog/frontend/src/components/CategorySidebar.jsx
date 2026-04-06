import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon, FolderIcon, FolderOpenIcon } from '@heroicons/react/24/outline';

export default function CategorySidebar({ categories = [], activeSlug }) {
  const [expandedSections, setExpandedSections] = useState(() => {
    // Auto-expand the section containing the active slug
    const expanded = {};
    categories.forEach((item) => {
      const hasActiveChild = item.children?.some((child) => child.slug === activeSlug);
      if (item.category.slug === activeSlug || hasActiveChild) {
        expanded[item.category.slug] = true;
      }
    });
    return expanded;
  });

  const toggleSection = (slug) => {
    setExpandedSections((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  if (!categories.length) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 p-4">
        暂无分类
      </div>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">文章分类</h3>
      </div>

      <ul className="py-1">
        {categories.map((item) => {
          const { category, children = [] } = item;
          const isExpanded = expandedSections[category.slug];
          const isActive = activeSlug === category.slug;
          const hasChildren = children.length > 0;

          return (
            <li key={category.slug}>
              {/* Parent Category */}
              <div
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  {isExpanded ? (
                    <FolderOpenIcon className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <FolderIcon className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{category.name}</span>
                  {category.articleCount != null && (
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {category.articleCount}
                    </span>
                  )}
                </Link>

                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSection(category.slug);
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-1 flex-shrink-0"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Children Categories */}
              {hasChildren && isExpanded && (
                <ul className="pb-1">
                  {children.map((child) => {
                    const isChildActive = activeSlug === child.slug;
                    return (
                      <li key={child.slug}>
                        <Link
                          to={`/category/${child.slug}`}
                          className={`flex items-center gap-2 pl-10 pr-4 py-2 text-sm transition-colors ${
                            isChildActive
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                        >
                          <span className="truncate">{child.name}</span>
                          {child.articleCount != null && (
                            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                              {child.articleCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
