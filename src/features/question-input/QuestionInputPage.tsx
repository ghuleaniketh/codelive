import { useState, useEffect } from "react";
import { useSolveQuestion } from "./useSolveQuestion";
import { StoryViewerPage } from "../story-viewer/StoryViewerPage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ProgrammingLanguageSelector,
  SarvamVoiceLanguageSelector,
} from "@/components/LanguageSelectors";
import type { ProgrammingLanguage } from "@/lib/languageOptions";
import type { Story } from "../story-viewer/types";

interface PipelineStage {
  id: string;
  label: string;
  terminalLog: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "plan",
    label: "Plan",
    terminalLog: "> analyzing algorithmic constraints & planning approach…",
  },
  {
    id: "generate",
    label: "Generate",
    terminalLog: "> synthesizing optimal solution code…",
  },
  {
    id: "execute",
    label: "Execute",
    terminalLog: "> executing in sandbox runtime & recording trace…",
  },
  {
    id: "story",
    label: "Create story",
    terminalLog: "> generating interactive scene actions & narration…",
  },
  {
    id: "finalize",
    label: "Finalize",
    terminalLog: "> synchronizing timeline & assembling visual studio…",
  },
];

export function QuestionInputPage() {
  const [questionText, setQuestionText] = useState("");
  const [preferredLanguage, setPreferredLanguage] =
    useState<ProgrammingLanguage>("python");
  const [sarvamLanguage, setSarvamLanguage] = useState<string>("en-IN");
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
      { questionText, preferredLanguage, explanationLanguage: sarvamLanguage },
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
        initialAudioLanguage={sarvamLanguage}
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
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "32px 24px",
        backgroundColor: "transparent",
        color: "#EDEEF0",
        boxSizing: "border-box",
      }}
    >
      {/* Main Terminal-Style Container (Left-Aligned / Structured) */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#14171B",
            border: "1px solid #22262B",
            borderRadius: 10,
            padding: "32px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#E8A33D",
                  display: "inline-block",
                }}
              />
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#EDEEF0",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Code Story Studio
              </h1>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#8C93A1",
                margin: 0,
              }}
            >
              Interactive algorithm visualization with step-by-step code and narration.
            </p>
          </div>

          {!isLoading ? (
            /* Input Form */
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Problem Prompt Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  htmlFor="question-text"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#EDEEF0",
                  }}
                >
                  Algorithm problem statement
                </label>
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
                  placeholder="Describe an algorithm or paste a DSA problem (e.g. 'Binary search in sorted array' or 'Invert a binary tree')…"
                  rows={5}
                  style={{
                    background: "#0B0D10",
                    border: "1px solid #22262B",
                    color: "#EDEEF0",
                    fontSize: 13,
                    lineHeight: 1.6,
                    borderRadius: 6,
                    padding: "12px 14px",
                    minHeight: 120,
                    maxHeight: 240,
                    resize: "none",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Selectors Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                  alignItems: "end",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#8C93A1",
                    }}
                  >
                    Language
                  </label>
                  <ProgrammingLanguageSelector
                    value={preferredLanguage}
                    onChange={setPreferredLanguage}
                    size="default"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#8C93A1",
                    }}
                  >
                    Narration voice
                  </label>
                  <SarvamVoiceLanguageSelector
                    value={sarvamLanguage}
                    onChange={setSarvamLanguage}
                    size="default"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div
                  role="alert"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #22262B",
                    background: "#1B1F24",
                    color: "#E8A33D",
                    fontSize: 12,
                    fontFamily: "IBM Plex Mono, monospace",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Footer Row: Status + Primary CTA */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTop: "1px solid #22262B",
                }}
              >
                {/* AI Sandbox Ready Status */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#5FBF77",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: "#8C93A1",
                    }}
                  >
                    AI sandbox ready
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#8C93A1",
                      fontFamily: "IBM Plex Mono, monospace",
                    }}
                  >
                    Ctrl + Enter
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={!questionText.trim() || isLoading}
                    style={{
                      height: 36,
                      padding: "0 20px",
                      borderRadius: 6,
                      backgroundColor: "#E8A33D",
                      color: "#0B0D10",
                      fontWeight: 600,
                      fontSize: 13,
                      border: "none",
                      cursor: !questionText.trim() || isLoading ? "not-allowed" : "pointer",
                      opacity: !questionText.trim() || isLoading ? 0.5 : 1,
                    }}
                  >
                    Visualize
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Loading / Progress State: Terminal Status Ticker + Minimal Segmented Tracker */
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Segmented Step Tracker with hairline dividers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, 1fr)`,
                  border: "1px solid #22262B",
                  borderRadius: 6,
                  overflow: "hidden",
                  background: "#0B0D10",
                }}
              >
                {PIPELINE_STAGES.map((stage, idx) => {
                  const isDone = idx < activeStageIdx;
                  const isCurrent = idx === activeStageIdx;
                  return (
                    <div
                      key={stage.id}
                      style={{
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 11,
                        borderRight:
                          idx < PIPELINE_STAGES.length - 1
                            ? "1px solid #22262B"
                            : "none",
                        backgroundColor: isCurrent
                          ? "#1B1F24"
                          : "transparent",
                        color: isCurrent
                          ? "#EDEEF0"
                          : isDone
                          ? "#5FA8D3"
                          : "#8C93A1",
                        fontWeight: isCurrent ? 600 : 400,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: 10,
                          color: isCurrent
                            ? "#E8A33D"
                            : isDone
                            ? "#5FA8D3"
                            : "#8C93A1",
                        }}
                      >
                        {isDone ? "✓" : idx + 1}
                      </span>
                      <span>{stage.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Monospace Terminal Status Ticker */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 6,
                  border: "1px solid #22262B",
                  background: "#0B0D10",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 11,
                    fontFamily: "IBM Plex Mono, monospace",
                    color: "#8C93A1",
                  }}
                >
                  <span>
                    step {activeStageIdx + 1} / {PIPELINE_STAGES.length}
                  </span>
                  <span style={{ color: "#E8A33D" }}>{progressPercent}%</span>
                </div>

                {/* Terminal line */}
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: 13,
                    color: "#EDEEF0",
                    minHeight: 20,
                  }}
                >
                  {currentStage.terminalLog}
                </div>

                {/* Slim horizontal progress bar in flat accent */}
                <div
                  style={{
                    width: "100%",
                    height: 2,
                    backgroundColor: "#22262B",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      backgroundColor: "#E8A33D",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
