import React, { useMemo } from "react";
import { Code2 } from "lucide-react";

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
  const lang = (language || "python").toString().toLowerCase().trim();
  if (SYNTAX_LANGUAGES.has(lang)) {
    return lang;
  }
  return "python";
}

function getFileExtension(lang: string): string {
  switch (lang) {
    case "python":
      return "solution.py";
    case "typescript":
      return "solution.ts";
    case "javascript":
      return "solution.js";
    case "cpp":
    case "c":
      return "solution.cpp";
    case "java":
      return "Solution.java";
    default:
      return `solution.${lang}`;
  }
}

// Terminal Theme Color Tokens
const TERMINAL_THEME = {
  bg: "#0B0D10",
  tabBg: "#0B0D10",
  tabBarBg: "#14171B",
  activeTabTopBorder: "#00F0FF",
  gutter: "#8C93A1",
  activeGutter: "#EDEEF0",
  activeLineBg: "#1B1F24",
  activeLineBorder: "#00F0FF",
  text: "#EDEEF0",
  keyword: "#5FA8D3",
  controlKeyword: "#00F0FF",
  function: "#EDEEF0",
  string: "#5FBF77",
  number: "#5FA8D3",
  comment: "#8C93A1",
  type: "#5FA8D3",
  variable: "#EDEEF0",
  punctuation: "#8C93A1",
};

const CONTROL_KEYWORDS = new Set([
  "if", "elif", "else", "for", "while", "return", "break", "continue",
  "yield", "try", "except", "finally", "raise", "throw", "catch", "switch",
  "case", "default", "with", "in", "is", "not", "and", "or"
]);

const OTHER_KEYWORDS = new Set([
  "def", "class", "import", "from", "as", "lambda", "async", "await", "function",
  "const", "let", "var", "new", "typeof", "instanceof", "pass", "None", "True",
  "False", "true", "false", "null", "undefined", "self", "this", "global", "nonlocal"
]);

const TYPE_NAMES = new Set([
  "int", "float", "str", "bool", "list", "dict", "set", "tuple", "void",
  "number", "string", "boolean", "any", "List", "Dict", "Set", "Tuple", "Optional"
]);

function highlightLine(line: string): React.ReactNode {
  if (!line) return " ";

  const tokenRegex = /(#[^\n]*|\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|[a-zA-Z_$][a-zA-Z0-9_$]*|[^\s\w]+|\s+)/g;

  const elements: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    const text = match[0];
    idx++;

    // Comment
    if (text.startsWith("#") || text.startsWith("//")) {
      elements.push(
        <span key={idx} style={{ color: TERMINAL_THEME.comment, fontStyle: "italic" }}>
          {text}
        </span>
      );
      continue;
    }

    // String literal
    if (
      (text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith("'") && text.endsWith("'")) ||
      (text.startsWith("`") && text.endsWith("`"))
    ) {
      elements.push(
        <span key={idx} style={{ color: TERMINAL_THEME.string }}>
          {text}
        </span>
      );
      continue;
    }

    // Number literal
    if (/^\d+(\.\d+)?$/.test(text)) {
      elements.push(
        <span key={idx} style={{ color: TERMINAL_THEME.number }}>
          {text}
        </span>
      );
      continue;
    }

    // Control Keyword
    if (CONTROL_KEYWORDS.has(text)) {
      elements.push(
        <span key={idx} style={{ color: TERMINAL_THEME.controlKeyword, fontWeight: 500 }}>
          {text}
        </span>
      );
      continue;
    }

    // Other Keyword
    if (OTHER_KEYWORDS.has(text)) {
      elements.push(
        <span key={idx} style={{ color: TERMINAL_THEME.keyword, fontWeight: 500 }}>
          {text}
        </span>
      );
      continue;
    }

    // Type names
    if (TYPE_NAMES.has(text)) {
      elements.push(
        <span key={idx} style={{ color: TERMINAL_THEME.type }}>
          {text}
        </span>
      );
      continue;
    }

    // Function call lookahead: check if next non-whitespace char in line is '('
    const remaining = line.slice(tokenRegex.lastIndex);
    if (/^\s*\(/.test(remaining) && /^[a-zA-Z_$]/.test(text)) {
      elements.push(
        <span key={idx} style={{ color: TERMINAL_THEME.function, fontWeight: 500 }}>
          {text}
        </span>
      );
      continue;
    }

    // Variable / identifier
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(text)) {
      elements.push(
        <span key={idx} style={{ color: TERMINAL_THEME.variable }}>
          {text}
        </span>
      );
      continue;
    }

    // Punctuation / Operators / Whitespace
    elements.push(
      <span key={idx} style={{ color: TERMINAL_THEME.punctuation }}>
        {text}
      </span>
    );
  }

  return elements.length > 0 ? elements : line;
}

export const CodePanel = ({
  code,
  language,
  highlightedLines,
}: CodePanelProps) => {
  const languageId = resolveLanguageId(language);
  const fileName = getFileExtension(languageId);

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
        borderRadius: 10,
        border: "1px solid #00F0FF",
        boxShadow: "0 0 15px rgba(0, 240, 255, 0.2)",
        background: "#14171B",
        overflow: "hidden",
      }}
      aria-label={`Code snippet in ${languageId}`}
    >
      {/* Tab Bar Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: TERMINAL_THEME.tabBarBg,
          borderBottom: "1px solid #22262B",
          flexShrink: 0,
          height: 36,
          paddingRight: 12,
        }}
      >
        {/* Active Tab */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 14px",
            height: "100%",
            background: TERMINAL_THEME.tabBg,
            borderTop: `2px solid ${TERMINAL_THEME.activeTabTopBorder}`,
            borderRight: "1px solid #22262B",
            fontSize: 12,
            fontFamily: "IBM Plex Mono, monospace",
            color: "#EDEEF0",
            fontWeight: 500,
          }}
        >
          <Code2 className="h-3.5 w-3.5 text-[#8C93A1]" />
          <span>{fileName}</span>
        </div>

        {/* Highlighted Line Badge */}
        {highlightedSet.size > 0 && (
          <span
            style={{
              fontSize: 11,
              fontFamily: "IBM Plex Mono, monospace",
              color: "#00F0FF",
              backgroundColor: "#1B1F24",
              border: "1px solid rgba(0, 240, 255, 0.4)",
              boxShadow: "0 0 6px rgba(0, 240, 255, 0.2)",
              padding: "2px 8px",
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            line {Array.from(highlightedSet).join(", ")}
          </span>
        )}
      </div>

      {/* Code Editor Body */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowX: "auto",
          overflowY: "auto",
          padding: "10px 0",
          backgroundColor: TERMINAL_THEME.bg,
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
                padding: "1px 12px",
                fontFamily: "IBM Plex Mono, ui-monospace, monospace",
                fontSize: 13,
                lineHeight: 1.55,
                whiteSpace: "pre",
                backgroundColor: isHighlighted ? TERMINAL_THEME.activeLineBg : "transparent",
                borderLeft: isHighlighted
                  ? `2px solid ${TERMINAL_THEME.activeLineBorder}`
                  : "2px solid transparent",
              }}
            >
              {/* Line number gutter */}
              <span
                style={{
                  width: 32,
                  flexShrink: 0,
                  userSelect: "none",
                  textAlign: "right",
                  marginRight: 16,
                  color: isHighlighted ? TERMINAL_THEME.activeGutter : TERMINAL_THEME.gutter,
                  fontSize: 12,
                  fontFamily: "IBM Plex Mono, ui-monospace, monospace",
                  fontWeight: 400,
                }}
              >
                {lineNum}
              </span>
              <span
                style={{
                  fontFamily: "IBM Plex Mono, ui-monospace, monospace",
                }}
              >
                {highlightLine(line)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};