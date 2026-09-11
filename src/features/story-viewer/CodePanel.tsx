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
        height: "100%",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        borderRadius: sceneTokens.radii.lg,
        border: `1px solid ${sceneTokens.borders.subtle}`,
        background: sceneTokens.surfaces.panel,
        overflow: "hidden",
      }}
      aria-label={`Code snippet in ${languageId}`}
    >
      {/* Code Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${sceneTokens.spacing[2]}px ${sceneTokens.spacing[4]}px`,
          borderBottom: `1px solid ${sceneTokens.borders.subtle}`,
          background: sceneTokens.surfaces.canvas,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: sceneTokens.typography.eyebrow.fontSize,
            fontWeight: sceneTokens.typography.eyebrow.fontWeight,
            letterSpacing: sceneTokens.typography.eyebrow.letterSpacing,
            textTransform: "uppercase",
            color: sceneTokens.text.secondary,
          }}
        >
          {languageId}
        </span>
        {highlightedSet.size > 0 && (
          <span
            style={{
              fontSize: sceneTokens.typography.caption.fontSize,
              color: sceneTokens.status.mutated.glow,
              fontWeight: 600,
            }}
          >
            Lines {Array.from(highlightedSet).join(", ")}
          </span>
        )}
      </div>

      {/* Code Lines Container */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowX: "auto",
          overflowY: "auto",
          padding: `${sceneTokens.spacing[2]}px 0`,
        }}
      >
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isHighlighted = highlightedSet.has(lineNum);
          return (
            <div
              key={lineNum}
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 22,
                padding: `2px ${sceneTokens.spacing[3]}px`,
                fontFamily: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
                fontSize: sceneTokens.typography.code.fontSize,
                lineHeight: 1.5,
                whiteSpace: "pre",
                color: isHighlighted ? sceneTokens.text.primary : sceneTokens.text.secondary,
                background: isHighlighted ? sceneTokens.status.mutated.fill : "transparent",
                borderLeft: isHighlighted
                  ? `3px solid ${sceneTokens.status.mutated.stroke}`
                  : "3px solid transparent",
              }}
            >
              {/* Line number gutter */}
              <span
                style={{
                  width: 32,
                  flexShrink: 0,
                  userSelect: "none",
                  textAlign: "right",
                  marginRight: sceneTokens.spacing[3],
                  color: isHighlighted ? sceneTokens.status.mutated.glow : sceneTokens.text.muted,
                  fontSize: sceneTokens.typography.caption.fontSize,
                }}
              >
                {lineNum}
              </span>
              <span>{line || " "}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};