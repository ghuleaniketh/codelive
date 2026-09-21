import { StoryViewerPage } from "@/features/story-viewer/StoryViewerPage";
import type { Story } from "@/features/story-viewer/types";

const mergeIntervalsStory: Story = {
  id: "merge-intervals-demo",
  submissionId: "intervals-sub-1",
  codeHash: "hash-intervals",
  createdAt: new Date().toISOString(),
  kind: "timeline-track",
  language: "python",
  problemMeta: {
    title: "Merge Intervals",
    difficultyGuess: "Medium",
  },
  approachInfo: {
    label: "Sort and Merge Intervals",
    complexity: {
      time: "O(n log n)",
      space: "O(n)",
    },
  },
  initialData: {
    min: 0,
    max: 20,
    intervals: [
      { id: "i1", start: 1, end: 3, label: "[1, 3]" },
      { id: "i2", start: 2, end: 6, label: "[2, 6]" },
      { id: "i3", start: 8, end: 10, label: "[8, 10]" },
      { id: "i4", start: 15, end: 18, label: "[15, 18]" },
    ],
    code: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged`,
  },
  steps: [
    {
      index: 0,
      stepType: "init",
      codeLines: [1, 2, 3],
      text: "Initialize intervals [[1,3], [2,6], [8,10], [15,18]] sorted by start time along the timeline.",
      narrationText: "We place all intervals on the timeline sorted by their start points.",
      state: { "intervals": "[[1,3],[2,6],[8,10],[15,18]]", "merged": "[]" },
      sceneActions: [
        {
          component: "IntervalBar",
          action: "initTimeline",
          params: {
            min: 0,
            max: 20,
            intervals: [
              { id: "i1", start: 1, end: 3, label: "[1, 3]" },
              { id: "i2", start: 2, end: 6, label: "[2, 6]" },
              { id: "i3", start: 8, end: 10, label: "[8, 10]" },
              { id: "i4", start: 15, end: 18, label: "[15, 18]" },
            ],
          },
        },
      ],
    },
    {
      index: 1,
      stepType: "compare",
      codeLines: [4, 5, 7],
      text: "Compare interval [1, 3] with [2, 6]. Since 2 <= 3, the intervals overlap!",
      narrationText: "We check the active interval against the next one. They overlap because two is less than three.",
      state: { "active": "[1, 3]", "candidate": "[2, 6]", "overlaps": true },
      sceneActions: [
        {
          component: "IntervalBar",
          action: "compareOverlap",
          params: { idA: "i1", idB: "i2", overlaps: true },
        },
      ],
    },
    {
      index: 2,
      stepType: "merge",
      codeLines: [7, 8],
      text: "Merge [1, 3] and [2, 6] into a single combined interval [1, max(3, 6)] = [1, 6].",
      narrationText: "We merge them together, extending the end point out to six.",
      state: { "merged[-1]": "[1, 6]", "newEnd": 6 },
      sceneActions: [
        {
          component: "IntervalBar",
          action: "merge",
          params: {
            intoId: "i1",
            fromIds: ["i1", "i2"],
            newStart: 1,
            newEnd: 6,
          },
        },
      ],
    },
    {
      index: 3,
      stepType: "compare",
      codeLines: [4, 5],
      text: "Compare [1, 6] with [8, 10]. Since 8 > 6, they do not overlap. Add [1, 6] to output and proceed.",
      narrationText: "Comparing one-six with eight-ten shows no overlap, so one-six is finalized.",
      state: { "active": "[1, 6]", "candidate": "[8, 10]", "overlaps": false },
      sceneActions: [
        {
          component: "IntervalBar",
          action: "compareOverlap",
          params: { idA: "i1", idB: "i3", overlaps: false },
        },
        {
          component: "IntervalBar",
          action: "markResult",
          params: { id: "i1" },
        },
      ],
    },
    {
      index: 4,
      stepType: "final",
      codeLines: [9],
      text: "Remaining intervals [8, 10] and [15, 18] have no further overlaps. Final merged result is [[1,6], [8,10], [15,18]].",
      narrationText: "All intervals processed. Our final non-overlapping intervals are one-six, eight-ten, and fifteen-eighteen.",
      state: { "result": "[[1,6],[8,10],[15,18]]" },
      sceneActions: [
        {
          component: "IntervalBar",
          action: "markResult",
          params: { id: "i1" },
        },
        {
          component: "IntervalBar",
          action: "markResult",
          params: { id: "i3" },
        },
        {
          component: "IntervalBar",
          action: "markResult",
          params: { id: "i4" },
        },
      ],
    },
  ],
};

export function StoryDemoPage() {
  const params = new URLSearchParams(window.location.search);
  const stepParam = params.get("step");
  const initialStep = stepParam !== null ? Math.max(0, Math.min(4, parseInt(stepParam, 10))) : 0;

  return (
    <StoryViewerPage
      story={mergeIntervalsStory}
      initialStep={initialStep}
      autoPlay={false}
      questionText="Merge all overlapping intervals in [[1,3],[2,6],[8,10],[15,18]]"
      onBack={() => {
        window.location.href = "/";
      }}
    />
  );
}
