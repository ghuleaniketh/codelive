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

  const difficultyBadge = problemMeta?.difficultyGuess && (
    <Badge
      variant="outline"
      key={problemMeta.difficultyGuess}
      style={{
        backgroundColor: "#1B1F24",
        color: problemMeta.difficultyGuess === "Easy" ? "#5FBF77" : "#E8A33D",
        borderColor: "#22262B",
        fontWeight: 500,
        fontSize: 11,
        padding: "2px 8px",
        borderRadius: 6,
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
        color: "#5FA8D3",
        fontSize: 12,
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
        maxWidth: 1200,
        margin: "0 auto",
        padding: "12px 16px",
        background: "#14171B",
        borderRadius: 10,
        border: "1px solid #22262B",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {problemMeta?.title && (
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#EDEEF0",
            }}
          >
            {problemMeta.title}
          </h2>
        )}

        {difficultyBadge}
        {sourceLink}
      </div>

      {questionText && (
        <details style={{ marginTop: problemMeta?.title || problemMeta?.difficultyGuess ? 8 : 0 }}>
          <summary
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "#8C93A1",
              marginBottom: 4,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Problem statement (expand)
          </summary>
          <p
            style={{
              fontSize: 13,
              color: "#8C93A1",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              margin: "8px 0 0 0",
              padding: "12px",
              background: "#0B0D10",
              borderRadius: 6,
              border: "1px solid #22262B",
            }}
          >
            {questionText}
          </p>
        </details>
      )}
    </div>
  );
}