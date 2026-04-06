import { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
});

export default function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const uniqueId = useId();
  const mermaidId = `mermaid-${uniqueId.replace(/:/g, '-')}`;

  useEffect(() => {
    if (!chart || !containerRef.current) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const renderDiagram = async () => {
      try {
        // Clear previous content
        containerRef.current.innerHTML = '';

        const { svg } = await mermaid.render(mermaidId, chart.trim());

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Mermaid rendering error:', err);
          setError(err.message || 'Failed to render diagram');
          setLoading(false);
          // Clean up error element mermaid may have inserted into DOM
          const errorEl = document.getElementById('d' + mermaidId);
          if (errorEl) errorEl.remove();
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart, mermaidId]);

  if (!chart) return null;

  return (
    <div className="my-6">
      {loading && !error && (
        <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500">
          <svg
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm">加载图表中...</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">图表渲染失败</p>
          <pre className="text-xs text-red-500 dark:text-red-400 overflow-x-auto whitespace-pre-wrap">
            {error}
          </pre>
          <details className="mt-2">
            <summary className="text-xs text-red-400 cursor-pointer hover:text-red-500">
              查看源代码
            </summary>
            <pre className="mt-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
              {chart}
            </pre>
          </details>
        </div>
      )}

      <div
        ref={containerRef}
        className={`mermaid flex justify-center overflow-x-auto ${loading && !error ? 'hidden' : ''}`}
      />
    </div>
  );
}
