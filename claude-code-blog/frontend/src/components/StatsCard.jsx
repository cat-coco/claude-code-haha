import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

export default function StatsCard({ title, value, icon, color = '#6366f1', trend, suffix }) {
  const trendIsPositive = trend > 0;
  const trendIsNegative = trend < 0;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 transition-all hover:shadow-lg"
    >
      {/* Background Decoration */}
      <div
        className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between">
        {/* Icon */}
        <div
          className="flex items-center justify-center h-12 w-12 rounded-lg text-white text-xl"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>

        {/* Trend */}
        {trend != null && trend !== 0 && (
          <div
            className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-medium ${
              trendIsPositive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
            }`}
          >
            {trendIsPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix && (
            <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
              {suffix}
            </span>
          )}
        </div>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {title}
        </div>
      </div>
    </div>
  );
}
