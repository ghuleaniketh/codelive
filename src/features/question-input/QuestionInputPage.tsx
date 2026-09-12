import { useState } from "react";
import { useSolveQuestion } from "./useSolveQuestion";
import { StoryViewerPage } from "../story-viewer/StoryViewerPage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { sceneTokens } from "../story-viewer/scenes/sceneTokens";
import type { Story } from "../story-viewer/types";

export function QuestionInputPage() {
  const [questionText, setQuestionText] = useState("");
  const [story, setStory] = useState<Story | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { solve, isLoading } = useSolveQuestion();

  const handleSubmit = () => {
    if (!questionText.trim() || isLoading) return;
    setErrorMsg(null);
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

      {/* Floating Minimal Glassmorphic Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 680,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: sceneTokens.radii.xl,
          padding: "36px 40px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
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

        {/* Dedicated Loading Card when solving */}
        {isLoading && (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: sceneTokens.radii.lg,
              border: `1px solid ${sceneTokens.borders.subtle}`,
              background: "rgba(15, 23, 42, 0.8)",
              display: "flex",
              flexDirection: "column",
              gap: sceneTokens.spacing[2],
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: sceneTokens.status.mutated.glow }} />
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: sceneTokens.text.primary }}>
                  Constructing your Code Story…
                </p>
                <p style={{ margin: 0, fontSize: 12, color: sceneTokens.text.secondary }}>
                  Synthesizing algorithm logic, variable traces, and visual steps.
                </p>
              </div>
            </div>
            <div
              style={{
                width: "100%",
                height: 3,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: sceneTokens.radii.full,
                overflow: "hidden",
                marginTop: 4,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: sceneTokens.status.mutated.stroke,
                  animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            </div>
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
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Solving…
              </>
            ) : (
              <span>Visualize</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
