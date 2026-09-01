import type { SceneAction } from "./scenes/types";

export type ProblemMeta = {
  title?: string;
  difficultyGuess?: "Easy" | "Medium" | "Hard";
  sourceLink?: string;
};

export type StoryStep = {
  index: number;
  text: string;
  narrationText: string;
  state?: Record<string, string | number | boolean>;
  codeLines?: number[];
  sceneActions: SceneAction[];
  stepType?: string;
};

export type StoryKind =
  | "sorting-tray"
  | "storage-shelf"
  | "decision-gate"
  | "family-tree"
  | "linked-chain"
  | "city-map"
  | "recursion-stairs"
  | "conveyor-loop"
  | "workshop"
  | "delivery-desk"
  | "workbench";

export type Story = {
  id: string;
  submissionId: string;
  codeHash: string;
  language: string;
  kind: StoryKind;
  initialData: any;
  steps: StoryStep[];
  problemMeta?: ProblemMeta;
  createdAt: Date | string;
};
