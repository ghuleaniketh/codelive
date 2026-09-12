import { useState, useEffect } from "react";
import { useSolveQuestion } from "./useSolveQuestion";
import { StoryViewerPage } from "../story-viewer/StoryViewerPage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { sceneTokens } from "../story-viewer/scenes/sceneTokens";
import type { Story } from "../story-viewer/types";

interface PipelineStage {
  id: string;
  label: string;
  title: string;
  detail: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "plan",
    label: "Plan",
    title: "Analyzing & Planning Approaches",
    detail: "Evaluating candidate algorithms, Big-O time/space complexities, and selecting the optimal strategy...",
  },
  {
    id: "generate",
    label: "Generate",
    title: "Synthesizing Solution Code",
    detail: "Writing clean, optimal algorithm code and test cases tailored for step-by-step visualization...",
  },
  {
    id: "execute",
    label: "Execute",
    title: "Running Sandbox Execution",
    detail: "Executing code in isolated environment to capture stdout, variable states, and memory transitions...",
  },
  {
    id: "story",
    label: "Create Story",
    title: "Generating Visual Story Scenes",
    detail: "Synthesizing interactive scene actions, pointer movements, step narrations, and state animations...",
  },
  {
    id: "finalize",
    label: "Finalize",
    title: "Assembling Visual Studio",
    detail: "Synchronizing code lines with playback timeline and preparing your interactive story...",
  },
];

export function QuestionInputPage() {
  const [questionText, setQuestionText] = useState("");
  const [story, setStory] = useState<Story | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const { solve, isLoading } = useSolveQuestion();

  // Cycle through backend pipeline stages while loading
  useEffect(() => {
    if (!isLoading) {
      setActiveStageIdx(0);
      return;
    }

    const stageIntervals = [2200, 2600, 1800, 3000];
    let currentIdx = 0;
    let timerId: ReturnType<typeof setTimeout>;

    const advanceStage = () => {
      if (currentIdx < PIPELINE_STAGES.length - 1) {
        const nextDelay = stageIntervals[currentIdx] || 2500;
        timerId = setTimeout(() => {
          currentIdx += 1;
          setActiveStageIdx(currentIdx);
          advanceStage();
        }, nextDelay);
      }
    };

    advanceStage();

    return () => {
      clearTimeout(timerId);
    };
  }, [isLoading]);

  const handleSubmit = () => {
    if (!questionText.trim() || isLoading) return;
    setErrorMsg(null);
    setActiveStageIdx(0);
    solve(
      { questionText },
      {
        onSuccess: (data) => {
          setStory(data as unknown as Story);
        },
        onError: (err: { message?: string }) =>
          setErrorMsg(err?.message || "Failed to solve problem."),
      }
    );
  };

  if (story) {
    return (
      <StoryViewerPage
        story={story}
        questionText={questionText}
        onBack={() => {
          setStory(null);
          setErrorMsg(null);
          setQuestionText("");
        }}
      />
    );
  }

  const currentStage = PIPELINE_STAGES[activeStageIdx] || PIPELINE_STAGES[0];
  const progressPercent = Math.min(
    96,
    Math.round(((activeStageIdx + 1) / PIPELINE_STAGES.length) * 100)
  );

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Background Live Wallpaper Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Subtle Atmospheric Dark Tint Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(9, 13, 22, 0.45)",
          backdropFilter: "blur(4px)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Floating Minimal Glassmorphic Card Container */}
      <motion.div
        layout
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 680,
          background: "rgba(15, 23, 42, 0.70)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: sceneTokens.radii.xl,
          padding: "36px 40px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
          minHeight: 280,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <AnimatePresence mode="wait">
          {!isLoading ? (
            /* Input Form View */
            <motion.div
              key="input-form"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(6px)", transition: { duration: 0.25 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Header Branding */}
              <div>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    color: sceneTokens.text.primary,
                    margin: 0,
                  }}
                >
                  Code Story Studio
                </h1>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: sceneTokens.text.muted,
                    letterSpacing: "0.02em",
                    display: "block",
                    marginTop: 2,
                  }}
                >
                  Interactive Algorithmic Visualizer
                </span>
              </div>

              {/* Minimal Transparent Input Field */}
              <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
                <Textarea
                  id="question-text"
                  value={questionText}
                  onChange={(e) => {
                    setQuestionText(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Describe any algorithm or paste a DSA problem statement…"
                  rows={5}
                  className="focus-visible:ring-1 focus-visible:ring-[#38bdf8] focus-visible:border-[#38bdf8] transition-all"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: sceneTokens.text.primary,
                    fontSize: 15,
                    lineHeight: 1.6,
                    borderRadius: sceneTokens.radii.lg,
                    padding: "16px 18px",
                    minHeight: 120,
                    maxHeight: 220,
                    overflowY: "auto",
                    resize: "none",
                    outline: "none",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                />
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div
                  role="alert"
                  style={{
                    padding: "12px 16px",
                    borderRadius: sceneTokens.radii.md,
                    border: `1px solid ${sceneTokens.status.error.stroke}`,
                    background: sceneTokens.status.error.fill,
                    color: sceneTokens.status.error.glow,
                    fontSize: sceneTokens.typography.caption.fontSize,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Submit Action Button */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 12, color: sceneTokens.text.muted }}>
                  Tip: Press <kbd style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", fontSize: 11 }}>Ctrl</kbd> + <kbd style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", fontSize: 11 }}>Enter</kbd> to solve
                </span>

                <Button
                  onClick={handleSubmit}
                  disabled={!questionText.trim() || isLoading}
                  className="hover:opacity-90 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                  style={{
                    height: 42,
                    padding: "0 24px",
                    borderRadius: sceneTokens.radii.full,
                    backgroundColor: sceneTokens.status.active.stroke,
                    color: "#090d16",
                    fontWeight: 700,
                    fontSize: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 16px rgba(245, 158, 11, 0.3)",
                    cursor: !questionText.trim() || isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <span>Visualize</span>
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Centered Real-Time Backend Progress Loader */
            <motion.div
              key="loading-state"
              initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)", transition: { duration: 0.25 } }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "16px 0",
                gap: "24px",
              }}
            >
              {/* Centered Glowing Orbital Animation */}
              <div
                style={{
                  position: "relative",
                  width: 84,
                  height: 84,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Outer Glow Halo */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.35, 0.65, 0.35],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(245, 158, 11, 0.15) 60%, transparent 75%)",
                    filter: "blur(10px)",
                  }}
                />

                {/* Rotating Dashed Orbit Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    border: "2px dashed rgba(56, 189, 248, 0.6)",
                    boxSizing: "border-box",
                  }}
                />

                {/* Counter-rotating Accent Ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute",
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(245, 158, 11, 0.5)",
                    borderTopColor: "transparent",
                    borderBottomColor: "transparent",
                    boxSizing: "border-box",
                  }}
                />

                {/* Pulsing Center Core */}
                <motion.div
                  animate={{
                    scale: [0.85, 1.15, 0.85],
                    boxShadow: [
                      "0 0 10px rgba(56, 189, 248, 0.5)",
                      "0 0 22px rgba(245, 158, 11, 0.8)",
                      "0 0 10px rgba(56, 189, 248, 0.5)",
                    ],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: sceneTokens.status.active.stroke,
                  }}
                />
              </div>

              {/* Dynamic Stage Text */}
              <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: "8px" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStage.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        color: sceneTokens.text.primary,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {currentStage.title}
                    </h2>
                    <p
                      style={{
                        margin: "6px 0 0 0",
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: sceneTokens.text.secondary,
                      }}
                    >
                      {currentStage.detail}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Shimmering Progress Bar */}
              <div style={{ width: "100%", maxWidth: 460 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: sceneTokens.text.muted,
                  }}
                >
                  <span>Step {activeStageIdx + 1} of {PIPELINE_STAGES.length}</span>
                  <span style={{ color: sceneTokens.status.active.glow }}>{progressPercent}%</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: sceneTokens.radii.full,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <motion.div
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #f59e0b 100%)",
                      borderRadius: sceneTokens.radii.full,
                      boxShadow: "0 0 12px rgba(56, 189, 248, 0.6)",
                    }}
                  />
                </div>
              </div>

              {/* Stage Step Timeline Indicators */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isDone = idx < activeStageIdx;
                  const isCurrent = idx === activeStageIdx;
                  return (
                    <div
                      key={stage.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        borderRadius: sceneTokens.radii.full,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: isCurrent
                          ? "rgba(245, 158, 11, 0.15)"
                          : isDone
                          ? "rgba(56, 189, 248, 0.12)"
                          : "rgba(255, 255, 255, 0.03)",
                        border: `1px solid ${
                          isCurrent
                            ? sceneTokens.status.active.stroke
                            : isDone
                            ? "rgba(56, 189, 248, 0.4)"
                            : "rgba(255, 255, 255, 0.06)"
                        }`,
                        color: isCurrent
                          ? sceneTokens.status.active.glow
                          : isDone
                          ? "#38bdf8"
                          : sceneTokens.text.muted,
                        transition: "all 0.3s ease",
                      }}
                    >
                      <span>{isDone ? "✓" : idx + 1}</span>
                      <span>{stage.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
