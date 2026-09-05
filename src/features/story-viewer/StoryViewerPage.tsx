import { useEffect, useMemo } from "react";
import { SceneRenderer } from "./scenes/SceneRenderer";
import { SceneAction } from "./scenes/types";
import { sceneTokens } from "./scenes/sceneTokens";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pause, Play } from "lucide-react";
import { CodePanel } from "./CodePanel";
import { PlaybackControls } from "@/features/story-viewer/PlaybackControls";
import { StatePanel } from "@/features/story-viewer/StatePanel";
import { ProblemPanel } from "@/features/story-viewer/ProblemPanel";
import { useStoryPlayback } from "./useStoryPlayback";
import { getStoryShortcutAction } from "@/lib/learning/storyControls";
import type { Story, ProblemMeta } from "./types";

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
  problemMeta,
  questionText,
  onBack,
}: {
  story: Story;
  problemMeta?: ProblemMeta;
  questionText: string;
  onBack: () => void;
}) {
  const steps = story?.steps ?? [];
  const total = steps.length;
  const effectiveProblemMeta = problemMeta ?? story?.problemMeta;

  const {
    currentStepIndex,
    playbackStatus,
    playbackSpeed,
    isPlaying,
    togglePlay,
    goPrev,
    goNext,
    restart,
    goToStep,
    setSpeed,
  } = useStoryPlayback({
    totalSteps: total,
    autoPlay: true,
  });

  const step = steps[currentStepIndex];

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

  // Global keyboard shortcuts: Space (toggle-play), Left/A (prev), Right/D (next), R (restart)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = getStoryShortcutAction(event);
      if (!action) return;

      if (action === "toggle-play") {
        event.preventDefault();
        togglePlay();
      } else if (action === "previous") {
        event.preventDefault();
        goPrev();
      } else if (action === "next") {
        event.preventDefault();
        goNext();
      } else if (action === "restart") {
        event.preventDefault();
        restart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, goPrev, goNext, restart]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: sceneTokens.surfaces.canvas,
        color: sceneTokens.text.primary,
        padding: sceneTokens.spacing[5],
        display: "flex",
        flexDirection: "column",
        gap: sceneTokens.spacing[4],
        alignItems: "center",
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          width: "100%",
          maxWidth: 1200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: sceneTokens.spacing[3],
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: sceneTokens.spacing[3] }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            style={{
              color: sceneTokens.text.secondary,
              fontSize: sceneTokens.typography.caption.fontSize,
              borderRadius: sceneTokens.radii.md,
              border: `1px solid ${sceneTokens.borders.subtle}`,
              background: sceneTokens.surfaces.panel,
            }}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> New problem
          </Button>

          <div>
            <span
              style={{
                fontSize: sceneTokens.typography.eyebrow.fontSize,
                fontWeight: sceneTokens.typography.eyebrow.fontWeight,
                letterSpacing: sceneTokens.typography.eyebrow.letterSpacing,
                textTransform: "uppercase",
                color: sceneTokens.text.muted,
              }}
            >
              Story Viewer
            </span>
            <h1
              style={{
                fontSize: sceneTokens.typography.title.fontSize,
                fontWeight: sceneTokens.typography.title.fontWeight,
                margin: 0,
                color: sceneTokens.text.primary,
              }}
            >
              {story?.kind || "Algorithm Visualizer"}
            </h1>
          </div>
        </div>

        {/* Playback status pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            borderRadius: sceneTokens.radii.full,
            backgroundColor: isPlaying ? sceneTokens.status.active.fill : sceneTokens.surfaces.panel,
            border: `1px solid ${isPlaying ? sceneTokens.status.active.stroke : sceneTokens.borders.subtle}`,
            color: isPlaying ? sceneTokens.status.active.glow : sceneTokens.text.muted,
            fontSize: sceneTokens.typography.caption.fontSize,
            fontWeight: 600,
          }}
        >
          {isPlaying ? (
            <>
              <Play className="h-3 w-3 fill-current animate-pulse" /> Autoplaying ({playbackSpeed}×)
            </>
          ) : playbackStatus === "completed" ? (
            <>Completed</>
          ) : (
            <>
              <Pause className="h-3 w-3 fill-current" /> Paused
            </>
          )}
        </div>
      </header>

      {/* Header Area Problem Panel + Collapsible Summary */}
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <ProblemPanel problemMeta={effectiveProblemMeta} questionText={questionText} />
      </div>

      {/* Main Ergonomic Workbench Split Layout */}
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          display: "flex",
          flexWrap: "wrap",
          gap: sceneTokens.spacing[5],
          alignItems: "flex-start",
        }}
      >
        {/* Left Column (38% width): CodePanel docked directly above StatePanel */}
        <div
          style={{
            flex: "0 0 38%",
            minWidth: 320,
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            gap: sceneTokens.spacing[3],
          }}
        >
          <CodePanel
            code={storyCode ?? ""}
            language={storyLanguage ?? "python"}
            highlightedLines={currentCodeLines ?? []}
          />
          <StatePanel state={step?.state} />
        </div>

        {/* Right Column (58% width): StorySlide -> SceneRenderer -> PlaybackControls */}
        <div
          style={{
            flex: "1 1 56%",
            minWidth: 340,
            display: "flex",
            flexDirection: "column",
            gap: sceneTokens.spacing[3],
          }}
        >
          {/* StorySlide Narrative Card */}
          {step && (
            <section
              style={{
                width: "100%",
                borderRadius: sceneTokens.radii.lg,
                border: `1px solid ${sceneTokens.borders.subtle}`,
                background: sceneTokens.surfaces.panel,
                padding: `${sceneTokens.spacing[3]}px ${sceneTokens.spacing[4]}px`,
                display: "flex",
                flexDirection: "column",
                gap: sceneTokens.spacing[2],
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: sceneTokens.spacing[2] }}>
                <span
                  style={{
                    fontSize: sceneTokens.typography.eyebrow.fontSize,
                    fontWeight: sceneTokens.typography.eyebrow.fontWeight,
                    letterSpacing: sceneTokens.typography.eyebrow.letterSpacing,
                    textTransform: "uppercase",
                    color: sceneTokens.text.muted,
                  }}
                >
                  Step {currentStepIndex + 1} of {total}
                </span>

                {step.stepType === "intro" && (
                  <span
                    style={{
                      fontSize: sceneTokens.typography.eyebrow.fontSize,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      padding: "2px 8px",
                      borderRadius: sceneTokens.radii.full,
                      backgroundColor: sceneTokens.status.mutated.fill,
                      color: sceneTokens.status.mutated.glow,
                      border: `1px solid ${sceneTokens.status.mutated.stroke}`,
                    }}
                  >
                    GOAL
                  </span>
                )}

                {step.stepType === "summary" && (
                  <span
                    style={{
                      fontSize: sceneTokens.typography.eyebrow.fontSize,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      padding: "2px 8px",
                      borderRadius: sceneTokens.radii.full,
                      backgroundColor: sceneTokens.status.active.fill,
                      color: sceneTokens.status.active.glow,
                      border: `1px solid ${sceneTokens.status.active.stroke}`,
                    }}
                  >
                    SUMMARY
                  </span>
                )}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: sceneTokens.typography.narrative.fontSize,
                  lineHeight: `${sceneTokens.typography.narrative.lineHeight}px`,
                  fontWeight: sceneTokens.typography.narrative.fontWeight,
                  color: sceneTokens.text.primary,
                }}
              >
                {step.text}
              </h2>

              {step.narrationText && (
                <p
                  style={{
                    margin: 0,
                    fontSize: sceneTokens.typography.body.fontSize,
                    lineHeight: `${sceneTokens.typography.body.lineHeight}px`,
                    color: sceneTokens.text.secondary,
                  }}
                >
                  {step.narrationText}
                </p>
              )}
            </section>
          )}

          {/* Visual Scene Stage Canvas */}
          <div
            style={{
              width: "100%",
              backgroundColor: sceneTokens.surfaces.panel,
              border: `1px solid ${sceneTokens.borders.subtle}`,
              borderRadius: sceneTokens.radii.lg,
              padding: sceneTokens.spacing[4],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 260,
              overflowX: "auto",
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
              state={step?.state}
            />
            ) : (
              <div style={{ textAlign: "center", color: sceneTokens.text.muted }}>
                <p style={{ fontWeight: 700 }}>Story kind: {story?.kind}</p>
                <p style={{ marginTop: 8, fontSize: sceneTokens.typography.caption.fontSize }}>
                  This story kind isn't visualized yet.
                </p>
              </div>
            )}
          </div>

          {/* Playback Controls anchored directly beneath scene */}
          <PlaybackControls
            currentStepIndex={currentStepIndex}
            totalSteps={total}
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onPrev={goPrev}
            onNext={goNext}
            onRestart={restart}
            steps={steps}
            onStepChange={goToStep}
            speed={playbackSpeed}
            setSpeed={setSpeed}
          />
        </div>
      </div>
    </div>
  );
}