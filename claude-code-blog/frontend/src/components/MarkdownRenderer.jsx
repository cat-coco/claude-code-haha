import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidDiagram from './MermaidDiagram';

function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
      aria-label="Copy code"
    >
      {copied ? '已复制!' : '复制'}
    </button>
  );
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="markdown-body prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            // Inline code
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono text-pink-600 dark:text-pink-400"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Mermaid code blocks
            if (language === 'mermaid') {
              return <MermaidDiagram chart={codeString} />;
            }

            // Regular code blocks with syntax highlighting
            if (language) {
              return (
                <div className="relative group not-prose">
                  <CopyButton code={codeString} />
                  <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    showLineNumbers
                    wrapLines
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // Code block without language
            return (
              <div className="relative group not-prose">
                <CopyButton code={codeString} />
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code {...props}>{children}</code>
                </pre>
              </div>
            );
          },

          // Enhance other elements
          a({ node, children, href, ...props }) {
            const isExternal = href && (href.startsWith('http') || href.startsWith('//'));
            return (
              <a
                href={href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },

          img({ node, src, alt, ...props }) {
            return (
              <figure className="my-6">
                <img
                  src={src}
                  alt={alt}
                  className="rounded-lg shadow-md mx-auto max-w-full"
                  loading="lazy"
                  {...props}
                />
                {alt && (
                  <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },

          table({ node, children, ...props }) {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
                  {children}
                </table>
              </div>
            );
          },

          blockquote({ node, children, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-indigo-500 dark:border-indigo-400 pl-4 italic text-gray-600 dark:text-gray-400 my-4"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
