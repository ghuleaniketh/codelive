import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import { useStepAudio, resolveAudioUrl } from "./useStepAudio";

function TestAudioComponent({
  narrationText,
  isPlaying,
  currentStepIndex,
}: {
  narrationText: string;
  isPlaying: boolean;
  currentStepIndex: number;
}) {
  const { isMuted, isLoading, isAudioPlaying } = useStepAudio({
    narrationText,
    isPlaying,
    currentStepIndex,
    enabled: false, // disable network fetch in static render test
  });

  return (
    <div>
      <span data-testid="muted">{isMuted ? "muted" : "unmuted"}</span>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="playing">{isAudioPlaying ? "playing" : "paused"}</span>
    </div>
  );
}

describe("useStepAudio", () => {
  it("initializes in unmuted and ready state when not fetching", () => {
    const queryClient = new QueryClient();
    const trpcClient = trpc.createClient({
      links: [httpBatchLink({ url: "http://localhost:4000/trpc" })],
    });

    const markup = renderToStaticMarkup(
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <TestAudioComponent
            narrationText="Step 1 comparison."
            isPlaying={true}
            currentStepIndex={0}
          />
        </QueryClientProvider>
      </trpc.Provider>
    );

    expect(markup).toContain("unmuted");
    expect(markup).toContain("ready");
    expect(markup).toContain("paused");
  });

  it("resolves relative audio URLs against backend base correctly", () => {
    expect(resolveAudioUrl(undefined)).toBeUndefined();
    expect(resolveAudioUrl("data:audio/wav;base64,123")).toBe("data:audio/wav;base64,123");
    expect(resolveAudioUrl("http://localhost:4000/audio/test.wav")).toBe("http://localhost:4000/audio/test.wav");
    
    const relativeResolved = resolveAudioUrl("/audio/abc.wav");
    expect(relativeResolved).toContain("/audio/abc.wav");
  });
});
