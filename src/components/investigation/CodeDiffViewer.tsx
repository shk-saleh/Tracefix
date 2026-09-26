"use client";

import { useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { FileCode, Loader2 } from "lucide-react";
import type { editor as MonacoEditor } from "monaco-editor";

// Lazy-load Monaco — must never run on SSR (uses window/document)
const MonacoEditorComponent = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-[#0d0d14]">
        <Loader2 size={16} className="text-[#6b7280] animate-spin" />
      </div>
    ),
  }
);

interface CodeDiffViewerProps {
  diff: string;
  filePath?: string;
  language?: string;
  isLoading?: boolean;
  height?: number;
}

// Compute Monaco delta decorations from a unified diff string
function buildDecorations(
  diff: string
): MonacoEditor.IModelDeltaDecoration[] {
  const decorations: MonacoEditor.IModelDeltaDecoration[] = [];
  const lines = diff.split("\n");

  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    if (line.startsWith("+") && !line.startsWith("+++")) {
      decorations.push({
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "diff-added-line",
          glyphMarginClassName: "diff-added-glyph",
        },
      });
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      decorations.push({
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "diff-removed-line",
          glyphMarginClassName: "diff-removed-glyph",
        },
      });
    }
  });

  return decorations;
}

export default function CodeDiffViewer({
  diff,
  filePath,
  language = "typescript",
  isLoading = false,
  height = 360,
}: CodeDiffViewerProps) {
  const decorationIdsRef = useRef<string[]>([]);

  const handleEditorMount = useCallback(
    (editorInstance: MonacoEditor.IStandaloneCodeEditor) => {
      // Apply diff line decorations
      const decorations = buildDecorations(diff);
      decorationIdsRef.current = editorInstance.deltaDecorations([], decorations);
    },
    [diff]
  );

  if (isLoading) {
    return (
      <div
        className="rounded-xl border border-[#1e1e2e] overflow-hidden bg-[#0d0d14] flex items-center justify-center"
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={20} className="text-[#6b7280] animate-spin" />
          <span className="text-xs text-[#6b7280]">Generating patch…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1e1e2e] overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d0d14] border-b border-[#1e1e2e]">
        <div className="flex items-center gap-2">
          <FileCode size={13} className="text-[#6b7280]" aria-hidden="true" />
          <span className="text-xs font-mono text-[#9ca3af] truncate max-w-[260px]">
            {filePath ?? "patch.diff"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#86efac] border border-[#22c55e]/20">
            +{diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).length}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ef4444]/10 text-[#fca5a5] border border-[#ef4444]/20">
            -{diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---")).length}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1a1a24] text-[#6b7280]">
            Patch
          </span>
        </div>
      </div>

      {/* Monaco editor */}
      <div style={{ height }}>
        {/*
          Inject diff line highlight CSS once into the page.
          Monaco decorations reference class names — we define them here.
        */}
        <style>{`
          .diff-added-line   { background: rgba(34,197,94,0.10) !important; }
          .diff-removed-line { background: rgba(239,68,68,0.10)  !important; }
          .diff-added-glyph::before   { content: '+'; color: #22c55e; font-size: 11px; font-weight: bold; margin-left: 4px; }
          .diff-removed-glyph::before { content: '-'; color: #ef4444; font-size: 11px; font-weight: bold; margin-left: 4px; }
        `}</style>
        <MonacoEditorComponent
          height={height}
          language={language}
          value={diff}
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            wordWrap: "off",
            renderLineHighlight: "none",
            folding: false,
            glyphMargin: true,
            lineDecorationsWidth: 4,
            padding: { top: 12, bottom: 12 },
            overviewRulerLanes: 0,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>
    </div>
  );
}
