"use client";

import { Check, Copy } from "lucide-react";
import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { useTheme } from "@/lib/useTheme";

import "katex/dist/katex.min.css";

interface MarkdownProps {
  children: string;
}

/**
 * Rendered assistant output. Wraps react-markdown with three plugins:
 *   - remarkGfm: tables, task lists, strikethrough
 *   - remarkMath + rehypeKatex: $...$ inline and $$...$$ display math
 *
 * Code blocks are extracted into a dedicated <CodeBlock> with a header
 * (language label + Copy button). Inline code gets a subtle pill.
 *
 * The whole component is memoised on `children` — during a streaming
 * response, the parent re-renders the assistant message on every delta;
 * without memo we'd re-parse the entire markdown tree each time.
 */
export const Markdown = memo(function Markdown({ children }: MarkdownProps) {
  return (
    <div className="markdown-body text-[15px] leading-7 text-ink-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => (
            <p className="my-3 first:mt-0 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 ml-5 list-disc space-y-1 marker:text-ink-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 ml-5 list-decimal space-y-1 marker:text-ink-400">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-900 underline decoration-ink-400 underline-offset-2 hover:decoration-ink-900"
            >
              {children}
            </a>
          ),
          h1: ({ children }) => (
            <h1 className="mt-5 mb-2 text-[20px] font-semibold tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-2 text-[17px] font-semibold tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-1.5 text-[15px] font-semibold">
              {children}
            </h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-paper-400 pl-3 text-ink-500">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-5 border-paper-300" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg hairline">
              <table className="w-full text-[14px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-paper-300 bg-paper-300/30 px-3 py-1.5 text-left font-medium text-ink-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-paper-300/60 px-3 py-1.5 align-top last:border-0">
              {children}
            </td>
          ),
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className ?? "");
            const text = String(children ?? "").replace(/\n$/, "");

            if (!match) {
              // Inline code — subtle pill
              return (
                <code className="rounded bg-paper-300/60 px-1.5 py-0.5 text-[13.5px] font-mono text-ink-900 mx-0.5">
                  {children}
                </code>
              );
            }

            return <CodeBlock language={match[1]} code={text} />;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});

/**
 * Dedicated code block — header strip with language + copy button, body
 * rendered through Prism. Hover state stays subtle so a wall of code blocks
 * doesn't visually overwhelm the chat.
 */
function CodeBlock({ language, code }: { language: string; code: string }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API can fail in non-HTTPS contexts — ignore silently
    }
  };

  const codeStyle = theme === "dark" ? oneDark : oneLight;
  const codeBg = theme === "dark" ? "rgb(20 20 26)" : "#faf9f5";

  return (
    <div className="my-4 rounded-xl overflow-hidden hairline bg-paper-100">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-paper-300/40 border-b border-paper-300/50">
        <span className="text-[11px] uppercase tracking-[0.14em] font-mono text-ink-500">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 h-6 rounded-md text-[11px] text-ink-500 hover:text-ink-900 hover:bg-paper-300/60 transition-colors"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-600" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={codeStyle}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "14px 16px",
          background: codeBg,
          fontSize: 13.5,
        }}
        codeTagProps={{
          style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
