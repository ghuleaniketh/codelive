import { useState } from "react";
import { useSolveQuestion } from "./useSolveQuestion";
import { StoryViewerPage } from "../story-viewer/StoryViewerPage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { sceneTokens } from "../story-viewer/scenes/sceneTokens";
import type { Story } from "../story-viewer/types";

const EXAMPLE_PROMPTS = [
  "Sort an array of integers in ascending order using bubble sort.",
  "Insert the values [50, 30, 70, 20, 40, 60, 80] into a binary search tree.",
];

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
        onError: (err: { message?: string }) => setErrorMsg(err?.message || "Failed to solve problem."),
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
        minHeight: "100vh",
        backgroundColor: sceneTokens.surfaces.canvas,
        color: sceneTokens.text.primary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: sceneTokens.spacing[6],
        gap: sceneTokens.spacing[5],
      }}
    >
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: sceneTokens.spacing[2], marginBottom: sceneTokens.spacing[2] }}>
          <Sparkles className="h-6 w-6" style={{ color: sceneTokens.status.active.glow }} aria-hidden="true" />
          <h1
            style={{
              fontSize: sceneTokens.typography.display.fontSize,
              lineHeight: `${sceneTokens.typography.display.lineHeight}px`,
              fontWeight: sceneTokens.typography.display.fontWeight,
              letterSpacing: sceneTokens.typography.display.letterSpacing,
              margin: 0,
            }}
          >
            Solve a DSA problem
          </h1>
        </div>
        <p
          style={{
            fontSize: sceneTokens.typography.body.fontSize,
            lineHeight: `${sceneTokens.typography.body.lineHeight}px`,
            color: sceneTokens.text.secondary,
            marginBottom: sceneTokens.spacing[4],
            marginTop: 0,
          }}
        >
          Paste a problem statement. We generate code, run it, and build a step-by-step
          visual story you can walk through. This takes several seconds.
        </p>

        <label
          htmlFor="question-text"
          style={{
            display: "block",
            fontSize: sceneTokens.typography.eyebrow.fontSize,
            fontWeight: sceneTokens.typography.eyebrow.fontWeight,
            letterSpacing: sceneTokens.typography.eyebrow.letterSpacing,
            textTransform: "uppercase",
            color: sceneTokens.text.secondary,
            marginBottom: sceneTokens.spacing[2],
          }}
        >
          Problem statement
        </label>
        <Textarea
          id="question-text"
          value={questionText}
          onChange={(e) => {
            setQuestionText(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder="e.g. Sort an array of integers in ascending order…"
          rows={8}
          className="focus-visible:ring-1 focus-visible:ring-[#38bdf8] focus-visible:border-[#38bdf8] transition-all"
          style={{
            background: sceneTokens.surfaces.panel,
            borderColor: sceneTokens.borders.contrast,
            color: sceneTokens.text.primary,
            fontSize: sceneTokens.typography.body.fontSize,
            lineHeight: 1.6,
            borderRadius: sceneTokens.radii.md,
          }}
        />

        <div style={{ marginTop: sceneTokens.spacing[3], display: "flex", flexWrap: "wrap", gap: sceneTokens.spacing[2] }}>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setQuestionText(prompt)}
              className="hover:border-[#38bdf8] hover:text-[#f8fafc] hover:bg-[#162238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
              style={{
                fontSize: sceneTokens.typography.caption.fontSize,
                padding: `${sceneTokens.spacing[1]}px ${sceneTokens.spacing[3]}px`,
                borderRadius: sceneTokens.radii.full,
                border: `1px solid ${sceneTokens.borders.contrast}`,
                background: sceneTokens.surfaces.panel,
                color: sceneTokens.text.secondary,
                cursor: "pointer",
                transition: `all ${sceneTokens.motion.micro}s ease`,
              }}
            >
              Use example: {prompt.length > 38 ? prompt.slice(0, 38) + "…" : prompt}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div
            role="alert"
            style={{
              marginTop: sceneTokens.spacing[4],
              padding: sceneTokens.spacing[3],
              borderRadius: sceneTokens.radii.md,
              border: `1px solid ${sceneTokens.status.error.stroke}`,
              background: sceneTokens.status.error.fill,
              color: sceneTokens.status.error.glow,
              fontSize: sceneTokens.typography.code.fontSize,
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
              marginTop: sceneTokens.spacing[4],
              padding: `${sceneTokens.spacing[4]}px`,
              borderRadius: sceneTokens.radii.lg,
              border: `1px solid ${sceneTokens.borders.subtle}`,
              background: sceneTokens.surfaces.panel,
              display: "flex",
              flexDirection: "column",
              gap: sceneTokens.spacing[2],
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: sceneTokens.spacing[3] }}>
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: sceneTokens.status.mutated.glow }} />
              <div>
                <p style={{ margin: 0, fontSize: sceneTokens.typography.narrative.fontSize, fontWeight: 700, color: sceneTokens.text.primary }}>
                  Constructing your Code Story…
                </p>
                <p style={{ margin: 0, fontSize: sceneTokens.typography.caption.fontSize, color: sceneTokens.text.secondary }}>
                  Synthesizing algorithm logic, variable traces, and scene step actions.
                </p>
              </div>
            </div>
            <div
              style={{
                width: "100%",
                height: 4,
                backgroundColor: sceneTokens.surfaces.card,
                borderRadius: sceneTokens.radii.full,
                overflow: "hidden",
                marginTop: sceneTokens.spacing[1],
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

        <Button
          onClick={handleSubmit}
          disabled={!questionText.trim() || isLoading}
          className="hover:opacity-90 active:scale-[0.99] transition-all focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          style={{
            marginTop: sceneTokens.spacing[4],
            width: "100%",
            height: 44,
            borderRadius: sceneTokens.radii.md,
            backgroundColor: sceneTokens.status.active.stroke,
            color: "#090d16",
            fontWeight: 700,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Solving problem…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Solve
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
