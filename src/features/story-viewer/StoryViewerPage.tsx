import { useMemo, useState, useEffect } from "react";
import { SceneRenderer } from "./scenes/SceneRenderer";
import { SceneAction } from "./scenes/types";
import { sceneTokens } from "./scenes/sceneTokens";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { CodePanel } from "./CodePanel";
import { PlaybackControls } from "@/features/story-viewer/PlaybackControls";
import { StatePanel } from "@/features/story-viewer/StatePanel";
import { ProblemPanel } from "@/features/story-viewer/ProblemPanel";

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

import type { Story, ProblemMeta } from "./types";

export function StoryViewerPage({
  story,
  problemMeta,
  questionText,
  onBack,
}: {
  story: Story;
  problemMeta?: ProblemMeta;
  questionText: string;
  onBack: () => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = story?.steps ?? [];
  const total = steps.length;
  const step = steps[currentStepIndex];
  const effectiveProblemMeta = problemMeta ?? story?.problemMeta;

  // Cumulative actions: replay steps 0..currentStepIndex so scene state ACCUMULATES
  // and Prev/Next/restart rebuild deterministically.
  const actions = useMemo(() => {
    const list: SceneAction[] = [];
    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
      const s = steps[i];
      if (s?.sceneActions) list.push(...(s.sceneActions as SceneAction[]));
    }
    return list;
  }, [steps, currentStepIndex]);

  const isSupported = SUPPORTED_KINDS.has(story?.kind);

  // Derive code/language from the story
  const storyCode = story?.initialData?.code;
  const storyLanguage = story?.language;
  const currentCodeLines = step?.codeLines;

  const goPrev = () => {
    setCurrentStepIndex((c) => Math.max(0, c - 1));
  };
  const goNext = () => {
    setCurrentStepIndex((c) => Math.min(total - 1, c + 1));
  };
  const restart = () => {
    setCurrentStepIndex(0);
  };

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
            {story?.kind || "Problem"}
          </h1>
        </div>
        <Button variant="outline" onClick={onBack}>
          ← New problem
        </Button>
      </header>

      <ProblemPanel problemMeta={effectiveProblemMeta} questionText={questionText} />

      <div
        style={{
          width: "100%",
          maxWidth: 920,
          display: "flex",
          gap: sceneTokens.spacing.gap,
          marginBottom: sceneTokens.spacing.gap,
        }}
      >
        <div
          style={{
            flex: "1",
            minWidth: 0,
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: sceneTokens.radii.card,
            padding: sceneTokens.spacing.padding,
          }}
        >
          <CodePanel
            code={storyCode ?? ""}
            language={storyLanguage ?? "python"}
            highlightedLines={currentCodeLines ?? []}
          />
        </div>

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
                story?.kind as
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
              initialData={story?.initialData ?? {}}
              actions={actions}
            />
          ) : (
            <div style={{ textAlign: "center", color: sceneTokens.colors.muted }}>
              <p style={{ fontWeight: 700 }}>Story kind</p>
              <p style={{ marginTop: 8, fontSize: sceneTokens.fontSizes.small }}>
                This story kind isn't visualized yet.
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
                Step {currentStepIndex + 1} of {total}
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
      </div>

      <StatePanel
        state={step?.state}
      />

      <PlaybackControls
        currentStepIndex={currentStepIndex}
        totalSteps={total}
        onPrev={goPrev}
        onNext={goNext}
        onRestart={restart}
        steps={steps}
        onStepChange={setCurrentStepIndex}
      />
    </div>
  );
}