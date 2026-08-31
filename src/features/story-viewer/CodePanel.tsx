import { useMemo } from "react";

import { sceneTokens } from "./scenes/sceneTokens";

type CodePanelProps = {
  code: string;
  language: string;
  highlightedLines: number[];
};

const SYNTAX_LANGUAGES = new Set([
  "javascript",
  "python",
  "java",
  "c",
  "cpp",
  "css",
  "html",
  "typescript",
]);

function resolveLanguageId(language: string): string {
  const lang = (language || "javascript").toString().toLowerCase().trim();
  if (SYNTAX_LANGUAGES.has(lang)) {
    return lang;
  }
  return "javascript";
}

export const CodePanel = ({
  code,
  language,
  highlightedLines,
}: CodePanelProps) => {
  const languageId = resolveLanguageId(language);
  const safeCode = useMemo(() => {
    if (typeof code === "string" && code.trim()) return code;
    if (code == null) return "";
    return JSON.stringify(code, null, 2);
  }, [code]);

  const highlightedSet = useMemo(
    () => new Set(highlightedLines.filter((n) => typeof n === "number" && n > 0)),
    [highlightedLines]
  );

  const lines = useMemo(() => safeCode.split("\n"), [safeCode]);

  if (!safeCode) return null;

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        borderRadius: 12,
        border: `1px solid ${sceneTokens.colors.connector}`,
        background: "rgba(15, 23, 42, 0.72)",
        padding: "8px 0",
      }}
      aria-label={`Code snippet in ${languageId}`}
    >
      {lines.map((line, idx) => {
        const isHighlighted = highlightedSet.has(idx + 1);
        return (
          <div
            key={idx + 1}
            style={{
              display: "flex",
              alignItems: "center",
              minHeight: 20,
              padding: "4px 12px",
              fontFamily: '"SF Mono", "Fira Mono", "Ubuntu Mono", monospace',
              fontSize: 13,
              lineHeight: 1.6,
              whiteSpace: "pre",
              color: sceneTokens.colors.text,
              background: isHighlighted ? "rgba(59, 130, 246, 0.22)" : "transparent",
            }}
          >
            {line || " "}
          </div>
        );
      })}
    </div>
  );
};