import { useState } from "react";
import { useSolveQuestion } from "./useSolveQuestion";
import { StoryViewerPage } from "../story-viewer/StoryViewerPage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "Sort an array of integers in ascending order using bubble sort.",
  "Insert the values [50, 30, 70, 20, 40, 60, 80] into a binary search tree.",
];

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
        onError: (err) => setErrorMsg(err.message),
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
        backgroundColor: "#0b1220",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Sparkles className="h-6 w-6 text-amber-300" aria-hidden="true" />
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Solve a DSA problem</h1>
        </div>
        <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 16 }}>
          Paste a problem statement. We generate code, run it, and build a step-by-step
          visual story you can walk through. This takes several seconds.
        </p>

        <label
          htmlFor="question-text"
          style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}
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
          style={{
            marginTop: 8,
            background: "#0f172a",
            borderColor: "#1e293b",
            color: "#e2e8f0",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        />

        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setQuestionText(prompt)}
              style={{
                fontSize: 12,
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid #1e293b",
                background: "#0f172a",
                color: "#cbd5e1",
                cursor: "pointer",
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
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #f87171",
              background: "rgba(248,113,113,0.12)",
              color: "#fecaca",
              fontSize: 13,
              whiteSpace: "pre-wrap",
            }}
          >
            {errorMsg}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!questionText.trim() || isLoading}
          style={{ marginTop: 16, width: "100%", height: 44 }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating story…
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
