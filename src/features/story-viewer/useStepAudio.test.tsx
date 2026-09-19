import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { useStepAudio, resolveAudioUrl } from "./useStepAudio";

function TestAudioComponent({
  audioUrl,
  narrationText,
  isPlaying,
  currentStepIndex,
}: {
  audioUrl?: string;
  narrationText: string;
  isPlaying: boolean;
  currentStepIndex: number;
}) {
  const { isMuted, isLoading, isAudioPlaying, isUsingSpeechFallback, audioUrl: currentAudioUrl } = useStepAudio({
    audioUrl,
    narrationText,
    isPlaying,
    currentStepIndex,
  });

  return (
    <div>
      <span data-testid="muted">{isMuted ? "muted" : "unmuted"}</span>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="playing">{isAudioPlaying ? "playing" : "paused"}</span>
      <span data-testid="fallback">{isUsingSpeechFallback ? "speech-fallback" : "audio-track"}</span>
      <span data-testid="url">{currentAudioUrl || "none"}</span>
    </div>
  );
}

describe("useStepAudio", () => {
  it("initializes ready and plays pre-generated audioUrl without generation queries", () => {
    const markup = renderToStaticMarkup(
      <TestAudioComponent
        audioUrl="https://example.com/step-1.wav"
        narrationText="Step 1 comparison."
        isPlaying={false}
        currentStepIndex={0}
      />
    );

    expect(markup).toContain("unmuted");
    expect(markup).toContain("ready");
    expect(markup).toContain("paused");
    expect(markup).toContain("https://example.com/step-1.wav");
  });

  it("resolves relative and absolute audio URLs correctly", () => {
    expect(resolveAudioUrl(undefined)).toBeUndefined();
    expect(resolveAudioUrl(null)).toBeUndefined();
    expect(resolveAudioUrl("data:audio/wav;base64,123")).toBe("data:audio/wav;base64,123");
    expect(resolveAudioUrl("blob:http://localhost/1234")).toBe("blob:http://localhost/1234");
    expect(resolveAudioUrl("http://localhost:4000/audio/test.wav")).toBe("http://localhost:4000/audio/test.wav");
    expect(resolveAudioUrl("https://example.com/audio/test.wav")).toBe("https://example.com/audio/test.wav");

    const relativeResolved = resolveAudioUrl("/audio/abc.wav");
    expect(relativeResolved).toContain("/audio/abc.wav");
  });
});
