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
  "ledger-grid",
  "timeline-track",
]) as ReadonlySet<string>;

export function StoryViewerPage({
  story,
  problemMeta,
  questionText,
  initialAudioLanguage = "en-IN",
  initialStep = 0,
  autoPlay = true,
  onBack,
}: {
  story: Story;
  problemMeta?: ProblemMeta;
  questionText: string;
  initialAudioLanguage?: string;
  initialStep?: number;
  autoPlay?: boolean;
  onBack: () => void;
}) {
  const steps = story?.steps ?? [];
  const total = steps.length;
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const effectiveProblemMeta = problemMeta ?? story?.problemMeta;
  const problemTitle =
    effectiveProblemMeta?.title ||
    (questionText ? questionText.slice(0, 60) : "") ||
    (story?.kind ? story.kind.replace(/-/g, " ").toUpperCase() : "ALGORITHM VISUALIZER");

  const approachLabel =
    story?.approachInfo?.label ||
    (story?.kind ? story.kind.replace(/-/g, " ") : undefined);
  const timeComplexity =
    story?.approachInfo?.complexity?.time ||
    "O(n)";
  const spaceComplexity =
    story?.approachInfo?.complexity?.space ||
    "O(1)";

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
    initialStep,
    autoPlay,
    enableInternalTimer: false,
  });

  const step = steps[currentStepIndex];

  const {
    isAudioPlaying,
    isMuted,
    isAutoplayBlocked,
    isUsingSpeechFallback,
    toggleMute,
    unblockAudio,
  } = useStepAudio({
    audioUrl: step?.audioUrl,
    narrationText: step?.narrationText,
    language: initialAudioLanguage,
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

  // Compute interactive background with subtle hover spotlight effect
  const canvasBgImage = useMemo(() => {
    const hoverSpotlight = mousePos
      ? `radial-gradient(260px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 240, 255, 0.045) 0%, transparent 75%), `
      : "";
    return `${hoverSpotlight}radial-gradient(ellipse 70% 45% at 50% 0%, rgba(0, 240, 255, 0.08) 0%, transparent 75%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(95, 168, 211, 0.04) 0%, transparent 80%), radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)`;
  }, [mousePos]);

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
      {/* Top Slim Navigation Bar */}
      <header
        style={{
          position: "relative",
          zIndex: 20,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="transition-all duration-150 hover:bg-white/10 hover:text-white"
          style={{
            color: "#EDEEF0",
            fontSize: 12,
            borderRadius: 6,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            background: "#14171B",
            height: 30,
          }}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5 text-[#00F0FF]" /> New problem
        </Button>
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
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseLeave={() => setMousePos(null)}
            style={{
              flex: "0 0 68%",
              minHeight: 320,
              backgroundColor: "#0D1015",
              backgroundImage: canvasBgImage,
              backgroundSize: mousePos
                ? "100% 100%, 100% 100%, 100% 100%, 32px 32px, 32px 32px, 32px 32px"
                : "100% 100%, 100% 100%, 32px 32px, 32px 32px, 32px 32px",
              border: mousePos
                ? "1px solid rgba(255, 255, 255, 0.13)"
                : "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5), inset 0 0 100px rgba(0, 0, 0, 0.55)",
              borderRadius: 10,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "border-color 0.25s ease",
            }}
          >
            {/* Top-Left Canvas Overlay: Slide Status & Progress Dots */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 14,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
                pointerEvents: "auto",
              }}
            >
              {/* Playback status pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 8px",
                  borderRadius: 6,
                  backgroundColor: "rgba(20, 23, 27, 0.85)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: isPlaying ? "#00F0FF" : "#8C93A1",
                  fontSize: 11,
                  fontFamily: "IBM Plex Mono, monospace",
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: isPlaying
                      ? "#00F0FF"
                      : playbackStatus === "completed"
                      ? "#5FBF77"
                      : "#8C93A1",
                    boxShadow: isPlaying ? "0 0 6px rgba(0, 240, 255, 0.6)" : "none",
                    display: "inline-block",
                  }}
                />
                {isPlaying ? `${playbackSpeed}×` : playbackStatus === "completed" ? "completed" : "paused"}
              </div>

              {/* Minimal Progress Dots */}
              {total > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 0",
                  }}
                >
                  {steps.map((_, idx) => {
                    const isCurrent = idx === currentStepIndex;
                    const isPast = idx < currentStepIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => goToStep(idx)}
                        title={`Jump to step ${idx + 1}`}
                        style={{
                          height: isCurrent ? 5 : 4,
                          width: isCurrent ? 16 : 6,
                          borderRadius: 3,
                          backgroundColor: isCurrent
                            ? "#00F0FF"
                            : isPast
                            ? "rgba(0, 240, 255, 0.45)"
                            : "rgba(255, 255, 255, 0.2)",
                          boxShadow: isCurrent ? "0 0 8px rgba(0, 240, 255, 0.6)" : "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top-Right Canvas Overlay: Problem Title & Approach Subtitle with Clear Hierarchy */}
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 14,
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 4,
                maxWidth: "60%",
                pointerEvents: "auto",
              }}
            >
              {/* Primary Header Row: Problem Title + Badges */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {/* Step counter badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "2px 7px",
                    borderRadius: 6,
                    backgroundColor: "rgba(20, 23, 27, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: 11,
                    fontFamily: "IBM Plex Mono, monospace",
                    color: "#EDEEF0",
                  }}
                >
                  <span style={{ color: "#8C93A1" }}>step</span>
                  <span style={{ fontWeight: 600 }}>
                    {currentStepIndex + 1}/{total}
                  </span>
                </div>

                {/* Difficulty badge */}
                {effectiveProblemMeta?.difficultyGuess && (
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "IBM Plex Mono, monospace",
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: 6,
                      backgroundColor: "rgba(20, 23, 27, 0.85)",
                      color:
                        effectiveProblemMeta.difficultyGuess === "Easy"
                          ? "#5FBF77"
                          : effectiveProblemMeta.difficultyGuess === "Hard"
                          ? "#EF4444"
                          : "#E8A33D",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                    }}
                  >
                    {effectiveProblemMeta.difficultyGuess}
                  </span>
                )}

                {/* Prominent Problem Title */}
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#EDEEF0",
                    letterSpacing: "-0.015em",
                    lineHeight: 1.2,
                    maxWidth: 320,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={problemTitle}
                >
                  {problemTitle}
                </h2>

                {effectiveProblemMeta?.sourceLink && (
                  <a
                    href={effectiveProblemMeta.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: "rgba(20, 23, 27, 0.85)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#5FA8D3",
                      textDecoration: "none",
                    }}
                    title="Open original problem source"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Subtitle Row: Approach label + Time & Space Complexity */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {approachLabel && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#00F0FF",
                      fontFamily: "IBM Plex Mono, monospace",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {approachLabel}
                  </span>
                )}

                {/* Time Complexity Chip */}
                {timeComplexity && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "1px 6px",
                      borderRadius: 5,
                      backgroundColor: "rgba(20, 23, 27, 0.85)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: 11,
                      fontFamily: "IBM Plex Mono, monospace",
                      color: "#EDEEF0",
                    }}
                  >
                    <span style={{ color: "#8C93A1" }}>time</span>
                    <span style={{ color: "#5FA8D3", fontWeight: 600 }}>
                      {timeComplexity}
                    </span>
                  </div>
                )}

                {/* Space Complexity Chip */}
                {spaceComplexity && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "1px 6px",
                      borderRadius: 5,
                      backgroundColor: "rgba(20, 23, 27, 0.85)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      fontSize: 11,
                      fontFamily: "IBM Plex Mono, monospace",
                      color: "#EDEEF0",
                    }}
                  >
                    <span style={{ color: "#8C93A1" }}>space</span>
                    <span style={{ color: "#5FBF77", fontWeight: 600 }}>
                      {spaceComplexity}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom-Left Canvas Overlay: Time Complexity and Space Complexity */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 14,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
                pointerEvents: "auto",
              }}
            >
              {/* Time Complexity Badge */}
              {timeComplexity && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 8px",
                    borderRadius: 6,
                    backgroundColor: "rgba(20, 23, 27, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: 11,
                    fontFamily: "IBM Plex Mono, monospace",
                    color: "#EDEEF0",
                  }}
                >
                  <span style={{ color: "#8C93A1" }}>time</span>
                  <span style={{ color: "#5FA8D3", fontWeight: 600 }}>
                    {timeComplexity}
                  </span>
                </div>
              )}

              {/* Space Complexity Badge */}
              {spaceComplexity && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 8px",
                    borderRadius: 6,
                    backgroundColor: "rgba(20, 23, 27, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: 11,
                    fontFamily: "IBM Plex Mono, monospace",
                    color: "#EDEEF0",
                  }}
                >
                  <span style={{ color: "#8C93A1" }}>space</span>
                  <span style={{ color: "#5FBF77", fontWeight: 600 }}>
                    {spaceComplexity}
                  </span>
                </div>
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
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
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
                          border: "1px solid rgba(255, 255, 255, 0.12)",
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
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                        }}
                      >
                        summary
                      </span>
                    )}
                  </div>

                  {/* Narration voice indicator and sound controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: isAutoplayBlocked ? "rgba(0, 240, 255, 0.15)" : "#1B1F24",
                        border: `1px solid ${isAutoplayBlocked ? "#00F0FF" : "rgba(255, 255, 255, 0.12)"}`,
                        boxShadow: isAutoplayBlocked ? "0 0 10px rgba(0, 240, 255, 0.3)" : "none",
                        fontSize: 11,
                        color: isAutoplayBlocked
                          ? "#00F0FF"
                          : isMuted
                          ? "#8C93A1"
                          : "#EDEEF0",
                        fontWeight: isAutoplayBlocked ? 600 : 400,
                      }}
                      title={
                        isAutoplayBlocked
                          ? "Autoplay blocked by browser — Click to enable sound"
                          : isMuted
                          ? "Narration muted — Click to unmute"
                          : isAudioPlaying
                          ? "Voice actively narrating — Click to mute"
                          : "Voice narration — Click to mute"
                      }
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: isAutoplayBlocked
                            ? "#00F0FF"
                            : isMuted
                            ? "#8C93A1"
                            : isAudioPlaying
                            ? "#00F0FF"
                            : "#8C93A1",
                          display: "inline-block",
                        }}
                      />
                      <span>
                        {isAutoplayBlocked
                          ? "Enable sound"
                          : isMuted
                          ? "Voice muted"
                          : isAudioPlaying
                          ? "Voice playing"
                          : isUsingSpeechFallback
                          ? "Web speech voice"
                          : "Voice narration"}
                      </span>
                    </div>
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