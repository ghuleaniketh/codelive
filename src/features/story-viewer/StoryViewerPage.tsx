import { useEffect, useMemo } from "react";
import { SceneRenderer } from "./scenes/SceneRenderer";
import { SceneAction } from "./scenes/types";
import { sceneTokens } from "./scenes/sceneTokens";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Pause, Play } from "lucide-react";
import { CodePanel } from "./CodePanel";
import { PlaybackControls } from "@/features/story-viewer/PlaybackControls";
import { StatePanel } from "@/features/story-viewer/StatePanel";
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
  const problemTitle =
    effectiveProblemMeta?.title ||
    (questionText ? questionText.slice(0, 60) : "") ||
    (story?.kind ? story.kind.replace(/-/g, " ").toUpperCase() : "ALGORITHM VISUALIZER");

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
        height: "100vh",
        maxHeight: "100vh",
        backgroundColor: sceneTokens.surfaces.canvas,
        color: sceneTokens.text.primary,
        padding: `${sceneTokens.spacing[3]}px ${sceneTokens.spacing[4]}px`,
        display: "flex",
        flexDirection: "column",
        gap: sceneTokens.spacing[3],
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: sceneTokens.spacing[3],
          flexShrink: 0,
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
              height: 32,
            }}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> New problem
          </Button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            <span style={{ color: sceneTokens.borders.contrast, fontSize: 12 }}>/</span>
            <span
              style={{
                fontSize: sceneTokens.typography.caption.fontSize,
                fontWeight: 600,
                color: sceneTokens.text.secondary,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {story?.kind || "Algorithm Visualizer"}
            </span>
          </div>
        </div>

        {/* Playback status pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 12px",
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

      {/* Main Workspace Split Layout: Fullscreen Proportions (Left ~30%, Right ~70%) */}
      <main
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          display: "flex",
          gap: sceneTokens.spacing[3],
          alignItems: "stretch",
        }}
      >
        {/* Left Column (~30% width, ~90% height of viewport): Code & Variable State */}
        <div
          style={{
            width: "30%",
            flex: "0 0 30%",
            minWidth: 300,
            maxWidth: 480,
            height: "100%",
            minHeight: 0,
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
          {step?.state && (
            <div style={{ flexShrink: 0, maxHeight: 180, overflowY: "auto" }}>
              <StatePanel state={step.state} />
            </div>
          )}
        </div>

        {/* Right Column (~70% width): Scene (top ~70%) + Explanation & Playback (bottom ~30%) */}
        <div
          style={{
            flex: "1 1 70%",
            minWidth: 420,
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: sceneTokens.spacing[3],
          }}
        >
          {/* Visual Scene Stage Canvas (Top ~68% height) */}
          <div
            style={{
              flex: "0 0 68%",
              minHeight: 340,
              backgroundColor: sceneTokens.surfaces.panel,
              border: `1px solid ${sceneTokens.borders.subtle}`,
              borderRadius: sceneTokens.radii.lg,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Top-Right Badge: Problem Title replacing the kind badge */}
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 14,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
                maxWidth: "70%",
              }}
            >
              {effectiveProblemMeta?.difficultyGuess && (
                <span
                  style={{
                    fontSize: sceneTokens.typography.caption.fontSize,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: sceneTokens.radii.full,
                    backgroundColor:
                      effectiveProblemMeta.difficultyGuess === "Easy"
                        ? sceneTokens.status.success.fill
                        : effectiveProblemMeta.difficultyGuess === "Medium"
                        ? sceneTokens.status.active.fill
                        : sceneTokens.status.error.fill,
                    color:
                      effectiveProblemMeta.difficultyGuess === "Easy"
                        ? sceneTokens.status.success.glow
                        : effectiveProblemMeta.difficultyGuess === "Medium"
                        ? sceneTokens.status.active.glow
                        : sceneTokens.status.error.glow,
                    border: `1px solid ${
                      effectiveProblemMeta.difficultyGuess === "Easy"
                        ? sceneTokens.status.success.stroke
                        : effectiveProblemMeta.difficultyGuess === "Medium"
                        ? sceneTokens.status.active.stroke
                        : sceneTokens.status.error.stroke
                    }`,
                  }}
                >
                  {effectiveProblemMeta.difficultyGuess}
                </span>
              )}

              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: sceneTokens.radii.full,
                  background: sceneTokens.surfaces.canvas,
                  border: `1px solid ${sceneTokens.borders.contrast}`,
                  color: sceneTokens.text.primary,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
                title={problemTitle}
              >
                {problemTitle}
              </div>

              {effectiveProblemMeta?.sourceLink && (
                <a
                  href={effectiveProblemMeta.sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: sceneTokens.radii.full,
                    background: sceneTokens.surfaces.canvas,
                    border: `1px solid ${sceneTokens.borders.subtle}`,
                    color: sceneTokens.status.mutated.glow,
                    textDecoration: "none",
                  }}
                  title="Open original problem source"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Centered Scene Stage Content */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto",
                padding: sceneTokens.spacing[4],
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
          </div>

          {/* Bottom Area (Remaining ~30% height): Explanation + Waveform + Playback Controls */}
          <div
            style={{
              flex: "1 1 30%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              gap: sceneTokens.spacing[2],
              justifyContent: "space-between",
            }}
          >
            {/* StorySlide Narrative & Explanation Card + Sarvam Voice Waveform Slot */}
            {step && (
              <section
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: sceneTokens.radii.lg,
                  border: `1px solid ${sceneTokens.borders.subtle}`,
                  background: sceneTokens.surfaces.panel,
                  padding: `${sceneTokens.spacing[2]}px ${sceneTokens.spacing[4]}px`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 4,
                  overflowY: "auto",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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
                          padding: "1px 8px",
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
                          padding: "1px 8px",
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

                  {/* Reserved space for Sarvam Voice Animation / Audio Waveform */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "2px 10px",
                      borderRadius: sceneTokens.radii.full,
                      background: sceneTokens.surfaces.canvas,
                      border: `1px solid ${sceneTokens.borders.subtle}`,
                      fontSize: 11,
                      color: sceneTokens.text.muted,
                      fontWeight: 500,
                    }}
                    title="Sarvam AI Audio Narration"
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: isPlaying ? sceneTokens.status.active.glow : sceneTokens.borders.contrast,
                        display: "inline-block",
                      }}
                    />
                    <span>Voice Narration</span>
                    {/* Futuristic audio waveform bars placeholder */}
                    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 12 }}>
                      <span
                        style={{
                          width: 2,
                          height: isPlaying ? 10 : 4,
                          backgroundColor: sceneTokens.status.active.glow,
                          borderRadius: 1,
                        }}
                      />
                      <span
                        style={{
                          width: 2,
                          height: isPlaying ? 13 : 6,
                          backgroundColor: sceneTokens.status.active.glow,
                          borderRadius: 1,
                        }}
                      />
                      <span
                        style={{
                          width: 2,
                          height: isPlaying ? 8 : 4,
                          backgroundColor: sceneTokens.status.active.glow,
                          borderRadius: 1,
                        }}
                      />
                      <span
                        style={{
                          width: 2,
                          height: isPlaying ? 11 : 5,
                          backgroundColor: sceneTokens.status.active.glow,
                          borderRadius: 1,
                        }}
                      />
                    </div>
                  </div>
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

            {/* Playback Controls anchored directly beneath scene and narrative */}
            <div style={{ flexShrink: 0 }}>
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
      </main>
    </div>
  );
}