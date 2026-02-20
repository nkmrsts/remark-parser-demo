import { useEffect, useState } from "react";
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'

import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

const INITIAL = `## Try Remark

You can try remark here.

1. item one
2. item two
   - sublist
   - sublist

\`\`\`ts
const x: number = 42;
console.log(x);
\`\`\`

Inline math: $E=mc^2$

Block math:

$$
\\int_0^\\infty e^{-x} dx = 1
$$
`;

export default function App() {
  const [markdown, setMarkdown] = useState(INITIAL);
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string>("");

  const processor = unified()
    .use(remarkParse) // マークダウンのパース
    .use(remarkGfm) // GFMサポート
    .use(remarkMath) // 数式の処理
    .use(remarkRehype, { allowDangerousHtml: true }) // HTMLへの変換
    .use(rehypeKatex) // KaTeXでの数式レンダリング
    .use(rehypeStringify, { allowDangerousHtml: true }) // HTMLのシリアライズ

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const file = await processor.process(markdown);
        if (!cancelled) setHtml(String(file));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [markdown, processor]);

  const [activeTab, setActiveTab] = useState<"preview" | "html">("preview");

  return (
    <div className="h-screen bg-neutral-50">
      <header className="h-12 border-b bg-white px-4 flex items-center gap-3">
        <div className="font-semibold">remark parser demo</div>
        {error ? (
          <div className="text-sm text-red-600 truncate">{error}</div>
        ) : null}
      </header>

      <main className="grid grid-cols-2 w-7xl m-auto px-4 h-[calc(100vh-3rem)]">
        {/* Left: Editor */}
        <section className="p-3 border-r">
          <div className="h-8.5 mb-2 text-sm font-medium text-neutral-700">Markdown</div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
            className="w-full h-[calc(80%-1.5rem)] resize-none rounded-md border bg-white p-3 font-mono text-sm leading-5 shadow-sm outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </section>

        {/* Right: Preview */}
        <section className="p-3 overflow-y-scroll">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-neutral-700">Output</div>

            <div className="inline-flex rounded-md border bg-white p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={[
                  "px-3 py-1 text-sm rounded",
                  activeTab === "preview"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100",
                ].join(" ")}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("html")}
                className={[
                  "px-3 py-1 text-sm rounded",
                  activeTab === "html"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100",
                ].join(" ")}
              >
                HTML
              </button>
            </div>
          </div>

          <div className="h-[calc(80%-1.5rem)] overflow-auto rounded-md border bg-white p-4 shadow-sm">
            {activeTab === "preview" ? (
              <article
                className="prose prose-neutral max-w-none prose-pre:bg-neutral-50 prose-pre:border prose-pre:border-neutral-200"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <pre className="whitespace-pre-wrap break-words text-sm leading-6">
                {html}
              </pre>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
