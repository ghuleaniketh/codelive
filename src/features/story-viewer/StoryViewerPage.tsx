import { useEffect, useMemo, useState } from "react";
import { SceneRenderer } from "./scenes/SceneRenderer";
import { SceneAction } from "./scenes/types";
import { sceneTokens } from "./scenes/sceneTokens";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Pause, Play } from "lucide-react";
import { CodePanel } from "./CodePanel";
import { PlaybackControls } from "@/features/story-viewer/PlaybackControls";
import { StatePanel } from "@/features/story-viewer/StatePanel";
import { useStoryPlayback } from "./useStoryPlayback";
import { useStepAudio } from "./useStepAudio";
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
  initialAudioLanguage = "en-IN",
  onBack,
}: {
  story: Story;
  problemMeta?: ProblemMeta;
  questionText: string;
  initialAudioLanguage?: string;
  onBack: () => void;
}) {
  const steps = story?.steps ?? [];
  const total = steps.length;
  const effectiveProblemMeta = problemMeta ?? story?.problemMeta;
  const problemTitle =
    effectiveProblemMeta?.title ||
    (questionText ? questionText.slice(0, 60) : "") ||
    (story?.kind ? story.kind.replace(/-/g, " ").toUpperCase() : "ALGORITHM VISUALIZER");

  const [audioLanguage, setAudioLanguage] = useState(initialAudioLanguage);

  const {
    currentStepIndex,
    playbackStatus,
    playbackSpeed,
    isPlaying,
    isCompleted,
    togglePlay,
    goPrev,
    goNext,
    restart,
    goToStep,
    setSpeed,
    advance,
    stepIntervalMs,
  } = useStoryPlayback({
    totalSteps: total,
    autoPlay: true,
    enableInternalTimer: false,
  });

  const step = steps[currentStepIndex];

  const {
    isLoading: isAudioLoading,
    isAudioPlaying,
    isMuted,
    isAutoplayBlocked,
    toggleMute,
    unblockAudio,
  } = useStepAudio({
    narrationText: step?.narrationText,
    language: audioLanguage,
    playbackSpeed,
    isPlaying,
    isCompleted,
    currentStepIndex,
    stepIntervalMs,
    onAdvance: advance,
  });

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

  // Cumulative state: merge variable states from step 0 up to currentStepIndex
  // so variables defined in earlier steps (e.g. i=0 in outer loop) persist when inner loop variables (e.g. j=1) change!
  const currentState = useMemo(() => {
    const merged: Record<string, string | number | boolean> = {};
    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
      const s = steps[i];
      if (s?.state) {
        Object.assign(merged, s.state);
      }
    }
    return Object.keys(merged).length > 0 ? merged : undefined;
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
        position: "relative",
        height: "100vh",
        maxHeight: "100vh",
        width: "100%",
        color: "#EDEEF0",
        backgroundColor: "transparent",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:bg-[#1B1F24] hover:text-[#EDEEF0] transition-colors"
            style={{
              color: "#8C93A1",
              fontSize: 12,
              borderRadius: 6,
              border: "1px solid #22262B",
              background: "#14171B",
              height: 32,
            }}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5 text-[#8C93A1]" /> New problem
          </Button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              borderRadius: 6,
              background: "#14171B",
              border: "1px solid #22262B",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#EDEEF0",
              }}
            >
              Story viewer
            </span>
            <span style={{ color: "#8C93A1", fontSize: 11 }}>/</span>
            <span
              style={{
                fontSize: 11,
                fontFamily: "IBM Plex Mono, monospace",
                color: "#8C93A1",
              }}
            >
              {story?.kind || "algorithm-visualizer"}
            </span>
          </div>
        </div>

        {/* Top Header Right: Playback status */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Playback status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 6,
              backgroundColor: "#14171B",
              border: "1px solid #22262B",
              color: isPlaying ? "#E8A33D" : "#8C93A1",
              fontSize: 11,
              fontFamily: "IBM Plex Mono, monospace",
              fontWeight: 500,
            }}
          >
            {isPlaying ? (
              <>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#E8A33D",
                    display: "inline-block",
                  }}
                />
                running ({playbackSpeed}×)
              </>
            ) : playbackStatus === "completed" ? (
              <>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#5FBF77",
                    display: "inline-block",
                  }}
                />
                completed
              </>
            ) : (
              <>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#8C93A1",
                    display: "inline-block",
                  }}
                />
                paused
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Split Layout: Fullscreen Proportions (Left ~30%, Right ~70%) */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          flex: 1,
          minHeight: 0,
          display: "flex",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {/* Left Column (~30% width): Code & Variable State */}
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
            gap: 12,
          }}
        >
          <CodePanel
            code={storyCode ?? ""}
            language={storyLanguage ?? "python"}
            highlightedLines={currentCodeLines ?? []}
          />
          {currentState && (
            <div style={{ flexShrink: 0, maxHeight: 180, overflowY: "auto" }}>
              <StatePanel state={currentState} />
            </div>
          )}
        </div>

        {/* Right Column (~70% width): Scene (top) + Explanation & Playback (bottom) */}
        <div
          style={{
            flex: "1 1 70%",
            minWidth: 420,
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Visual Scene Stage Canvas */}
          <div
            style={{
              flex: "0 0 68%",
              minHeight: 320,
              backgroundColor: "#14171B",
              border: "1px solid #22262B",
              borderRadius: 10,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Top-Right Badge: Problem Title */}
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 12,
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
                    fontSize: 11,
                    fontFamily: "IBM Plex Mono, monospace",
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: 6,
                    backgroundColor: "#1B1F24",
                    color:
                      effectiveProblemMeta.difficultyGuess === "Easy"
                        ? "#5FBF77"
                        : "#E8A33D",
                    border: "1px solid #22262B",
                  }}
                >
                  {effectiveProblemMeta.difficultyGuess}
                </span>
              )}

              <div
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: "#1B1F24",
                  border: "1px solid #22262B",
                  color: "#EDEEF0",
                  fontSize: 12,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
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
                    borderRadius: 6,
                    background: "#1B1F24",
                    border: "1px solid #22262B",
                    color: "#5FA8D3",
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
                padding: "16px",
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
                  state={currentState}
                />
              ) : (
                <div style={{ textAlign: "center", color: "#8C93A1" }}>
                  <p style={{ fontWeight: 600 }}>Story kind: {story?.kind}</p>
                  <p style={{ marginTop: 8, fontSize: 12 }}>
                    This story kind isn't visualized yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Area: Narrative & Explanation + Playback Controls */}
          <div
            style={{
              flex: "1 1 30%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              justifyContent: "space-between",
            }}
          >
            {/* StorySlide Narrative & Explanation Card */}
            {step && (
              <section
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: 10,
                  border: "1px solid #22262B",
                  background: "#14171B",
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 4,
                  overflowY: "auto",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "IBM Plex Mono, monospace",
                        color: "#8C93A1",
                      }}
                    >
                      step {currentStepIndex + 1} / {total}
                    </span>

                    {step.stepType === "intro" && (
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "IBM Plex Mono, monospace",
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: 6,
                          backgroundColor: "#1B1F24",
                          color: "#5FA8D3",
                          border: "1px solid #22262B",
                        }}
                      >
                        goal
                      </span>
                    )}

                    {step.stepType === "summary" && (
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "IBM Plex Mono, monospace",
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: 6,
                          backgroundColor: "#1B1F24",
                          color: "#5FBF77",
                          border: "1px solid #22262B",
                        }}
                      >
                        summary
                      </span>
                    )}
                  </div>

                  {/* Narration voice indicator and control */}
                  <div
                    onClick={isAutoplayBlocked ? unblockAudio : toggleMute}
                    role="button"
                    tabIndex={0}
                    style={{
                      cursor: "pointer",
                      userSelect: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: "#1B1F24",
                      border: "1px solid #22262B",
                      fontSize: 11,
                      color: isAutoplayBlocked
                        ? "#E8A33D"
                        : isMuted
                        ? "#8C93A1"
                        : "#EDEEF0",
                      fontWeight: 400,
                    }}
                    title={
                      isAutoplayBlocked
                        ? "Autoplay blocked by browser — Click to enable sound"
                        : isMuted
                        ? "Narration muted — Click to unmute"
                        : isAudioLoading
                        ? "Generating Sarvam voice audio..."
                        : isAudioPlaying
                        ? "Sarvam AI Voice actively narrating — Click to mute"
                        : "Sarvam AI Voice Narration — Click to mute"
                    }
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: isAutoplayBlocked
                          ? "#E8A33D"
                          : isMuted
                          ? "#8C93A1"
                          : isAudioLoading
                          ? "#5FA8D3"
                          : isAudioPlaying
                          ? "#E8A33D"
                          : "#8C93A1",
                        display: "inline-block",
                      }}
                    />
                    <span>
                      {isAutoplayBlocked
                        ? "Enable sound"
                        : isAudioLoading
                        ? "Generating voice…"
                        : isMuted
                        ? "Voice muted"
                        : "Voice narration"}
                    </span>
                  </div>
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: "22px",
                    fontWeight: 600,
                    color: "#EDEEF0",
                  }}
                >
                  {step.text}
                </h2>

                {step.narrationText && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: "20px",
                      color: "#8C93A1",
                    }}
                  >
                    {step.narrationText}
                  </p>
                )}
              </section>
            )}

            {/* Playback Controls */}
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