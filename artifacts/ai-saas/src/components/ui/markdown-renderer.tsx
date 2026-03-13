import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <div className="relative my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg group">
              <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-b border-white/5">
                <span className="text-xs font-mono text-muted-foreground">{match[1]}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                  className="text-xs text-muted-foreground hover:text-white transition-colors"
                >
                  Copy
                </button>
              </div>
              <SyntaxHighlighter
                style={vscDarkPlus as any}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: 0, padding: '1rem', background: '#111113' }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props}>
              {children}
            </code>
          );
        }
      }}
      className={`prose prose-invert prose-indigo max-w-none w-full ${className}`}
    >
      {content}
    </ReactMarkdown>
  );
}
