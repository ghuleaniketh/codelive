export type SceneAction =
  | { component: "Box"; action: "compare" | "swap" | "highlight" | "setPointer"; params: Record<string, unknown> }
  | { component: "Slot"; action: "insert" | "lookup" | "highlight"; params: Record<string, unknown> }
  | { component: "TreeNode" | "TreeEdge"; action: "visit" | "compare" | "insertNode"; params: Record<string, unknown> }
  | { component: "ConditionLabel" | "PathTaken"; action: "evaluate" | "takePath"; params: Record<string, unknown> };

export interface SortingTrayInitialData {
  array: Array<{ id: string; value: number }>;
}

export interface StorageShelfInitialData {
  slots: Array<{ key: string; value: unknown | null }>;
}

export interface FamilyTreeInitialData {
  nodes: Array<{ id: string; value: number; x: number; y: number }>;
  edges: Array<{ from: string; to: string }>;
}

export interface DecisionGateInitialData {
  condition: string;
}