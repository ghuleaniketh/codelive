import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getStepIntervalMs } from "./useStoryPlayback";
import { PlaybackControls } from "./PlaybackControls";
import { getStoryShortcutAction } from "@/lib/learning/storyControls";

describe("useStoryPlayback & Playback System", () => {
  it("scales step interval correctly based on playback speed", () => {
    expect(getStepIntervalMs(1)).toBe(1200);
    expect(getStepIntervalMs(1.5)).toBe(800);
    expect(getStepIntervalMs(2)).toBe(500);
    // Boundary check
    expect(getStepIntervalMs(2.5)).toBe(500);
    expect(getStepIntervalMs(0.5)).toBe(1200);
  });

  it("getStoryShortcutAction correctly maps keyboard shortcuts", () => {
    // Space and K -> toggle-play
    expect(getStoryShortcutAction({ key: " " } as KeyboardEvent)).toBe("toggle-play");
    expect(getStoryShortcutAction({ key: "k" } as KeyboardEvent)).toBe("toggle-play");

    // ArrowLeft and A -> previous
    expect(getStoryShortcutAction({ key: "ArrowLeft" } as KeyboardEvent)).toBe("previous");
    expect(getStoryShortcutAction({ key: "a" } as KeyboardEvent)).toBe("previous");
    expect(getStoryShortcutAction({ key: "A" } as KeyboardEvent)).toBe("previous");

    // ArrowRight and D -> next
    expect(getStoryShortcutAction({ key: "ArrowRight" } as KeyboardEvent)).toBe("next");
    expect(getStoryShortcutAction({ key: "d" } as KeyboardEvent)).toBe("next");
    expect(getStoryShortcutAction({ key: "D" } as KeyboardEvent)).toBe("next");

    // R -> restart
    expect(getStoryShortcutAction({ key: "r" } as KeyboardEvent)).toBe("restart");
    expect(getStoryShortcutAction({ key: "R" } as KeyboardEvent)).toBe("restart");

    // Ignores text inputs
    expect(
      getStoryShortcutAction({
        key: " ",
        target: { tagName: "INPUT" } as unknown as HTMLElement,
      } as unknown as KeyboardEvent)
    ).toBeNull();

    expect(
      getStoryShortcutAction({
        key: "a",
        target: { tagName: "TEXTAREA" } as unknown as HTMLElement,
      } as unknown as KeyboardEvent)
    ).toBeNull();

    // Ignores modified keys
    expect(
      getStoryShortcutAction({
        key: " ",
        ctrlKey: true,
      } as unknown as KeyboardEvent)
    ).toBeNull();
  });

  it("PlaybackControls renders Play button when paused and Pause button when playing", () => {
    const pausedMarkup = renderToStaticMarkup(
      <PlaybackControls
        currentStepIndex={0}
        totalSteps={5}
        isPlaying={false}
        onTogglePlay={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
        onRestart={() => {}}
        steps={[]}
        onStepChange={() => {}}
        speed={1}
      />
    );
    expect(pausedMarkup).toContain("Play");
    expect(pausedMarkup).toContain("Speed:");
    expect(pausedMarkup).toContain("1 / 5");

    const playingMarkup = renderToStaticMarkup(
      <PlaybackControls
        currentStepIndex={2}
        totalSteps={5}
        isPlaying={true}
        onTogglePlay={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
        onRestart={() => {}}
        steps={[]}
        onStepChange={() => {}}
        speed={1.5}
      />
    );
    expect(playingMarkup).toContain("Pause");
    expect(playingMarkup).toContain("3 / 5");
  });
});
