import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StoryViewerPage } from "./StoryViewerPage";
import type { Story } from "./types";

describe("StoryViewerPage Ergonomic Workbench Split Layout", () => {
  const mockStory: Story = {
    id: "test-story-1",
    submissionId: "test-sub-1",
    codeHash: "hash-123",
    createdAt: new Date().toISOString(),
    kind: "sorting-tray",
    language: "python",
    initialData: {
      array: [{ id: "0", value: 5 }, { id: "1", value: 3 }],
      code: "def sort(arr):\n    arr[0], arr[1] = arr[1], arr[0]",
    },
    steps: [
      {
        index: 0,
        stepType: "intro",
        codeLines: [1],
        text: "Compare 5 and 3 in the array",
        narrationText: "Since 5 > 3, they will swap.",
        state: { "arr[0]": 5, "arr[1]": 3 },
        sceneActions: [
          { component: "Box", action: "compare", params: { box1Id: "0", box2Id: "1" } },
        ],
      },
    ],
  };

  it("renders ProblemPanel, docked CodePanel + StatePanel, StorySlide, Scene, and anchored PlaybackControls", () => {
    const markup = renderToStaticMarkup(
      <StoryViewerPage
        story={mockStory}
        questionText="Sort an array"
        onBack={() => {}}
      />
    );

    // Header & Problem
    expect(markup).toContain("Story Viewer");
    expect(markup).toContain("Sort an array");

    // Left column: CodePanel and StatePanel
    expect(markup).toContain("def sort(arr):");
    expect(markup).toContain("Variable State");
    expect(markup).toContain("arr[0]");

    // Right column: StorySlide, Scene, Playback
    expect(markup).toContain("Compare 5 and 3 in the array");
    expect(markup).toContain("Since 5 &gt; 3, they will swap.");
    expect(markup).toContain("Sorting tray visualizer");
    expect(markup).toContain("Prev");
    expect(markup).toContain("Next");
    expect(markup).toContain("Speed:");
  });
});
