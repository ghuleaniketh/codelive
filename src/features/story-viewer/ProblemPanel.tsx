import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { sceneTokens } from "./scenes/sceneTokens";
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

  const difficultyStatus =
    problemMeta?.difficultyGuess === "Easy"
      ? sceneTokens.status.success
      : problemMeta?.difficultyGuess === "Medium"
      ? sceneTokens.status.active
      : problemMeta?.difficultyGuess === "Hard"
      ? sceneTokens.status.error
      : null;

  const difficultyBadge = difficultyStatus && (
    <Badge
      variant="outline"
      key={problemMeta?.difficultyGuess}
      style={{
        backgroundColor: difficultyStatus.fill,
        color: difficultyStatus.glow,
        borderColor: difficultyStatus.stroke,
        fontWeight: 700,
        fontSize: sceneTokens.typography.caption.fontSize,
        padding: "2px 8px",
        borderRadius: sceneTokens.radii.full,
      }}
    >
      {problemMeta?.difficultyGuess}
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
        color: sceneTokens.status.mutated.glow,
        fontSize: sceneTokens.typography.caption.fontSize,
        fontWeight: 600,
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
        padding: `${sceneTokens.spacing[3]}px ${sceneTokens.spacing[4]}px`,
        background: sceneTokens.surfaces.panel,
        borderRadius: sceneTokens.radii.lg,
        border: `1px solid ${sceneTokens.borders.subtle}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: sceneTokens.spacing[3],
        }}
      >
        {problemMeta?.title && (
          <h2
            style={{
              margin: 0,
              fontSize: sceneTokens.typography.title.fontSize,
              fontWeight: sceneTokens.typography.title.fontWeight,
              color: sceneTokens.text.primary,
            }}
          >
            {problemMeta.title}
          </h2>
        )}

        {difficultyBadge}
        {sourceLink}
      </div>

      {questionText && (
        <details style={{ marginTop: problemMeta?.title || problemMeta?.difficultyGuess ? sceneTokens.spacing[2] : 0 }}>
          <summary
            style={{
              fontSize: sceneTokens.typography.eyebrow.fontSize,
              fontWeight: sceneTokens.typography.eyebrow.fontWeight,
              letterSpacing: sceneTokens.typography.eyebrow.letterSpacing,
              textTransform: "uppercase",
              color: sceneTokens.text.secondary,
              marginBottom: 4,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Problem Statement (expand)
          </summary>
          <p
            style={{
              fontSize: sceneTokens.typography.body.fontSize,
              color: sceneTokens.text.secondary,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              margin: `${sceneTokens.spacing[2]}px 0 0 0`,
              padding: sceneTokens.spacing[3],
              background: sceneTokens.surfaces.card,
              borderRadius: sceneTokens.radii.md,
              border: `1px solid ${sceneTokens.borders.subtle}`,
            }}
          >
            {questionText}
          </p>
        </details>
      )}
    </div>
  );
}