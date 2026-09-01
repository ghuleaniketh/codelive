import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { ProblemMeta } from "./types";

export function ProblemPanel({
  problemMeta,
  questionText,
}: {
  problemMeta?: ProblemMeta;
  questionText: string;
}) {
  if (!problemMeta?.title && !problemMeta?.difficultyGuess && !problemMeta?.sourceLink && !questionText) {
    return null;
  }

  const difficultyStyle =
    problemMeta?.difficultyGuess === "Easy"
      ? { backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#6ee7b7", borderColor: "rgba(16, 185, 129, 0.4)" }
      : problemMeta?.difficultyGuess === "Medium"
      ? { backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#fcd34d", borderColor: "rgba(245, 158, 11, 0.4)" }
      : problemMeta?.difficultyGuess === "Hard"
      ? { backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", borderColor: "rgba(239, 68, 68, 0.4)" }
      : undefined;

  const difficultyBadge = problemMeta?.difficultyGuess && (
    <Badge
      variant="outline"
      key={problemMeta.difficultyGuess}
      style={{
        ...difficultyStyle,
        fontWeight: 600,
        fontSize: 12,
        padding: "2px 8px",
      }}
    >
      {problemMeta.difficultyGuess}
    </Badge>
  );

  const sourceLink = problemMeta?.sourceLink && (
    <a
      href={problemMeta.sourceLink}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        textDecoration: "none",
        color: "#60a5fa",
        fontSize: 13,
        fontWeight: 500,
      }}
      title="Open problem link"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      <span>Source</span>
    </a>
  );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 920,
        margin: "0 auto 8px",
        padding: 14,
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: 16,
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {problemMeta?.title && (
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#f8fafc",
            }}
          >
            {problemMeta.title}
          </h3>
        )}

        {problemMeta?.difficultyGuess && difficultyBadge}

        {problemMeta?.sourceLink && sourceLink}
      </div>

      {questionText && (
        <details style={{ marginTop: (problemMeta?.title || problemMeta?.difficultyGuess || problemMeta?.sourceLink) ? 10 : 0 }}>
          <summary
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255, 255, 255, 0.5)",
              marginBottom: 4,
              cursor: "pointer",
            }}
          >
            Problem statement
          </summary>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255, 255, 255, 0.8)",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {questionText}
          </p>
        </details>
      )}
    </div>
  );
}