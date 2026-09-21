import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StoryViewerPage } from "./StoryViewerPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";
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
    problemMeta: {
      title: "Sort An Array",
      difficultyGuess: "Medium",
      sourceLink: "https://leetcode.com/problems/sort-an-array",
    },
    approachInfo: {
      label: "Opposite-ends two pointers",
      technique: "Two Pointers",
      complexity: {
        time: "O(n)",
        space: "O(1)",
      },
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
      {
        index: 1,
        stepType: "step",
        codeLines: [2],
        text: "Swap 5 and 3",
        narrationText: "Now sorted.",
        state: { "arr[0]": 3, "arr[1]": 5 },
        sceneActions: [],
      },
    ],
  };

  it("renders redesigned header with title, approachInfo subtitle, complexity badges, and workbench layout", () => {
    const queryClient = new QueryClient();
    const trpcClient = trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:4000/trpc",
        }),
      ],
    });

    const markup = renderToStaticMarkup(
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <StoryViewerPage
            story={mockStory}
            questionText="Sort an array"
            onBack={() => {}}
          />
        </QueryClientProvider>
      </trpc.Provider>
    );

    // Header Title & Subtitle & Badges
    expect(markup).toContain("Sort An Array");
    expect(markup).toContain("Opposite-ends two pointers");
    expect(markup).toContain("Medium");
    expect(markup).toContain("time");
    expect(markup).toContain("O(n)");
    expect(markup).toContain("space");
    expect(markup).toContain("O(1)");
    expect(markup).toContain("step");

    // Left column: CodePanel and StatePanel
    expect(markup).toContain("def");
    expect(markup).toContain("sort");
    expect(markup).toContain("arr");
    expect(markup).toContain("Variable state");
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
