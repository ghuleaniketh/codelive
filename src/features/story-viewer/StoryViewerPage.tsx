import { useMemo, useState } from "react";
import { SceneRenderer } from "./scenes/SceneRenderer";
import { SceneAction } from "./scenes/types";
import { sceneTokens } from "./scenes/sceneTokens";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { CodePanel } from "./CodePanel";

/** Shape of a Story returned by the real backend `questions.solve` mutation. */
export interface StoryData {
  id: string;
  submissionId: string;
  codeHash: string;
  language: string;
  kind: string;
  initialData: {
    bitWidth: number;
    initialValue: number;
    secondValue?: number;
    code?: string;
  };
  steps: Array<{
    index: number;
    text: string;
    narrationText: string;
    stepType: "intro" | "summary" | undefined;
    sceneActions: SceneAction[];
    codeLines?: number[];
  }>;
  createdAt: string | Date;
}

const SUPPORTED_KINDS = new Set([
  "sorting-tray",
  "storage-shelf",
  "family-tree",
  "decision-gate",
  "linked-chain",
  "workbench",
  "city-map",
  "conveyor-loop",
  "recursion-stairs",
  "delivery-desk",
  "workshop",
]) as ReadonlySet<string>;

export function StoryViewerPage({
  story,
  onBack,
}: {
  story: StoryData;
  onBack: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const steps = story.steps ?? [];
  const total = steps.length;
  const step = steps[current];

  // Cumulative actions: replay steps 0..current so scene state ACCUMULATES and
  // Prev/Next rebuild deterministically (state at step N depends on every
  // insert/insertNode action from step 0 through N, never just the current one).
  const actions = useMemo(() => {
    const list: SceneAction[] = [];
    for (let i = 0; i <= current && i < steps.length; i++) {
      const s = steps[i];
      if (s?.sceneActions) list.push(...(s.sceneActions as SceneAction[]));
    }
    return list;
  }, [steps, current]);

  const isSupported = SUPPORTED_KINDS.has(story.kind);

  const goPrev = () => setCurrent((c) => Math.max(0, c - 1));
  const goNext = () => setCurrent((c) => Math.min(total - 1, c + 1));
  const restart = () => setCurrent(0);

  // Code and language from the story/initialData for the syntax highlighter
  const storyCode = story.initialData?.code;
  const storyLanguage = story.language;
  // Highlighted lines for the current step (codeLines from that step)
  const currentCodeLines = step?.codeLines;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: sceneTokens.colors.background,
        color: sceneTokens.colors.text,
        padding: sceneTokens.spacing.padding,
        display: "flex",
        flexDirection: "column",
        gap: sceneTokens.spacing.gap,
        alignItems: "center",
      }}
    >
      <header
        style={{
          width: "100%",
          maxWidth: 920,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: sceneTokens.spacing.gap,
        }}
      >
        <div>
          <p
            style={{
              fontSize: sceneTokens.fontSizes.small,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: sceneTokens.colors.muted,
            }}
          >
            Story viewer
          </p>
          <h1 style={{ fontSize: sceneTokens.fontSizes.large, fontWeight: 800 }}>
            {story.kind}
          </h1>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← New problem
        </Button>
      </header>

      <section
        style={{
          width: "100%",
          maxWidth: 920,
          display: "flex",
          gap: sceneTokens.spacing.gap,
        }}
      >
        {/* Left column: CodePanel */}
        {storyCode && storyLanguage ? (
          <div
            style={{
              flex: "1",
              maxWidth: 430,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <CodePanel
              code={storyCode}
              language={storyLanguage}
              highlightedLines={currentCodeLines ?? []}
            />
          </div>
        ) : (
          <div
            style={{
              flex: "1",
              maxWidth: 430,
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed",
              borderColor: sceneTokens.colors.connector,
              borderRadius: sceneTokens.radii.card,
              background: "rgba(255,255,255,0.03)",
              color: sceneTokens.colors.muted,
              fontSize: sceneTokens.fontSizes.small,
            }}
          >
            <p>Connect problem to see code</p>
          </div>
        )}

        {/* Right column: Scene + step controls */}
        <div
          style={{
            flex: "1",
            minWidth: 0,
            maxWidth: 560,
          }}
        >
          {isSupported ? (
            <SceneRenderer
              kind={
                story.kind as
                  | "sorting-tray"
                  | "storage-shelf"
                  | "family-tree"
                  | "decision-gate"
                  | "linked-chain"
                  | "workbench"
                  | "city-map"
                  | "conveyor-loop"
                  | "recursion-stairs"
                  | "delivery-desk"
                  | "workshop"
              }
              initialData={story.initialData}
              actions={actions}
            />
          ) : (
            <div style={{ textAlign: "center", color: sceneTokens.colors.muted }}>
              <p style={{ fontWeight: 700 }}>Story kind " {story.kind}"</p>
              <p style={{ marginTop: 8, fontSize: sceneTokens.fontSizes.small }}>
                This story kind isn't visualized yet. The backend generated{" "}
                {total} step(s), but no scene renderer is wired for it.
              </p>
            </div>
          )}

          {step && (
            <section
              style={{
                width: "100%",
                maxWidth: 920,
                borderRadius: sceneTokens.radii.card,
                border: `1px solid ${sceneTokens.colors.connector}`,
                background: "rgba(0,0,0,0.15)",
                padding: sceneTokens.spacing.padding,
                marginTop: sceneTokens.spacing.gap,
              }}
            >
              <p
                style={{
                  fontSize: sceneTokens.fontSizes.small,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: sceneTokens.colors.muted,
                }}
              >
                Step {current + 1} of {total}
              </p>
              {step.stepType === "intro" && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: 4,
                    background: `rgba(59, 130, 246, 0.15)`,
                    borderRadius: `${sceneTokens.radii.card}`,
                    fontSize: sceneTokens.fontSizes.small,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: sceneTokens.colors.text,
                    fontWeight: 600,
                    marginLeft: 4,
                  }}
                >
                  GOAL
                </span>
              )}
              {step.stepType === "summary" && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: 4,
                    background: `rgba(251, 191, 37, 0.15)`,
                    borderRadius: `${sceneTokens.radii.card}`,
                    fontSize: sceneTokens.fontSizes.small,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#f59e0b",
                    fontWeight: 600,
                    marginLeft: 4,
                  }}
                >
                  SUMMARY
                </span>
              )}
              <p
                style={{ marginTop: 8, fontSize: sceneTokens.fontSizes.medium, fontWeight: 600 }}>
                {step.text}
              </p>
              {step.narrationText && (
                <p
                  style={{
                    marginTop: 6,
                    fontSize: sceneTokens.fontSizes.small,
                    color: sceneTokens.colors.muted,
                  }}
                >
                  {step.narrationText}
                </p>
              )}
              {actions.length > 0 && (
                <p
                  style={{
                    marginTop: 10,
                    fontSize: sceneTokens.fontSizes.small,
                    fontFamily: "ui-monospace, monospace",
                    color: sceneTokens.colors.muted,
                  }}
                >
                  sceneActions: {actions.map((a) => a.action).join(", ") || "—"}
                </p>
              )}
            </section>
          )}
        </div>
      </section>

      <div
        style={{
          width: "100%",
          maxWidth: 920,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: sceneTokens.spacing.gap,
          marginTop: sceneTokens.spacing.gap,
        }}
      >
        <Button variant="outline" onClick={goPrev} disabled={current === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Prev
        </Button>
        <span style={{ fontSize: sceneTokens.fontSizes.small, color: sceneTokens.colors.muted }}>
          {current + 1} / {total}
        </span>
        <div style={{ display: "flex", gap: sceneTokens.spacing.gap }}>
          <Button variant="ghost" onClick={restart} disabled={current === 0}>
            <RotateCcw className="mr-1 h-4 w-4" /> Restart
          </Button>
          <Button onClick={goNext} disabled={current === total - 1}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}