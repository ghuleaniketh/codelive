import { StoryViewerPage } from "@/features/story-viewer/StoryViewerPage";
import type { Story } from "@/features/story-viewer/types";

const demoStory: Story = {
  id: "demo-story-1",
  submissionId: "demo-sub-1",
  codeHash: "hash-demo",
  createdAt: new Date().toISOString(),
  kind: "sorting-tray",
  language: "python",
  initialData: {
    array: [
      { id: "0", value: 5 },
      { id: "1", value: 3 },
      { id: "2", value: 8 },
      { id: "3", value: 1 },
      { id: "4", value: 2 },
    ],
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
  },
  steps: [
    {
      index: 0,
      stepType: "intro",
      codeLines: [1, 2],
      text: "Initialize bubble sort on the array of 5 elements",
      narrationText: "We start by setting up our outer loop over the array.",
      state: { n: 5, i: 0 },
      sceneActions: [
        { component: "Box", action: "highlight", params: { boxId: "0" } },
      ],
    },
    {
      index: 1,
      stepType: "compare",
      codeLines: [4, 5],
      text: "Compare element at index 0 (5) with element at index 1 (3)",
      narrationText: "Since 5 is greater than 3, we need to swap them into ascending order.",
      state: { n: 5, i: 0, j: 0, "arr[0]": 5, "arr[1]": 3 },
      sceneActions: [
        { component: "Box", action: "compare", params: { box1Id: "0", box2Id: "1" } },
      ],
    },
  ],
};

export function StoryDemoPage() {
  return (
    <StoryViewerPage
      story={demoStory}
      questionText="Sort an array using bubble sort"
      onBack={() => {
        window.location.href = "/";
      }}
    />
  );
}
