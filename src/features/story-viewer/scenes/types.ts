export type SceneAction =
  | { component: "Box"; action: "compare" | "swap" | "highlight" | "setPointer"; params: Record<string, unknown> }
  | { component: "Slot"; action: "insert" | "lookup" | "highlight"; params: Record<string, unknown> }
  | { component: "TreeNode" | "TreeEdge"; action: "visit" | "compare" | "insertNode" | "compareCandidate"; params: Record<string, unknown> }
  | { component: "ConditionLabel" | "PathTaken"; action: "evaluate" | "takePath"; params: Record<string, unknown> }
  | {
      component: "ListNode";
      action: "visit" | "insertNode" | "removeNode" | "updateNext" | "setPointer";
      params: Record<string, unknown>;
    }
  | {
      component: "WorkbenchItem";
      action: "push" | "pop" | "peek" | "highlight";
      params: Record<string, unknown>;
    }
  | {
      component: "GraphNode";
      action: "visit" | "markVisited";
      params: Record<string, unknown> & { nodeId: string };
    }
  | {
      component: "GraphNode";
      action: "addNode";
      params: Record<string, unknown> & { newNodeId: string; value: number; x: number; y: number };
    }
  | {
      component: "GraphEdge";
      action: "addEdge";
      params: Record<string, unknown> & { from: string; to: string; weight?: number; directed?: boolean };
    }
  | {
      component: "GraphEdge";
      action: "traverse" | "highlight";
      params: Record<string, unknown> & { from: string; to: string };
    }
  | {
      component: "QueueItem";
      action: "enqueue";
      params: Record<string, unknown> & { itemId: string; value: number };
    }
  | {
      component: "QueueItem";
      action: "dequeue" | "highlight";
      params: Record<string, unknown> & { itemId: string };
    }
  | {
      component: "CallFrame";
      action: "pushFrame";
      params: Record<string, unknown> & { frameId: string; label: string; depth: number };
    }
  | {
      component: "CallFrame";
      action: "popFrame" | "backtrack";
      params: Record<string, unknown> & { frameId: string };
    }
  | {
      component: "CallFrame";
      action: "returnValue";
      params: Record<string, unknown> & { frameId: string; value: unknown };
    }
  | {
      component: "SearchItem";
      action: "checkIndex" | "found";
      params: Record<string, unknown> & { index: number };
    }
  | {
      component: "SearchItem";
      action: "narrowRange";
      params: Record<string, unknown> & { low: number; high: number };
    }
  | {
      component: "SearchItem";
      action: "exhausted";
      params: Record<string, unknown>;
    }
  | {
      component: "Bit";
      action: "setBit" | "shiftLeft" | "shiftRight" | "applyOp" | "highlight";
      params: Record<string, unknown> & {
        position?: number;
        value?: number;
        amount?: number;
        operator?: string;
        operandValue?: number;
        positions?: number[];
      };
    };

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

export interface LinkedChainInitialData {
  headId: string | null;
  nodes: Array<{ id: string; value: number; next: string | null }>;
}

export interface WorkbenchInitialData {
  items: Array<{ id: string; value: unknown }>;
}

export interface CityMapInitialData {
  nodes: Array<{ id: string; value: number; x: number; y: number }>;
  edges: Array<{ from: string; to: string; weight?: number; directed?: boolean }>;
}

export interface ConveyorLoopInitialData {
  items: Array<{ id: string; value: number }>;
}

export interface RecursionStairsInitialData {
  frames: Array<{ id: string; label: string; depth: number; returnValue?: unknown }>;
}

export interface DeliveryDeskInitialData {
  array: Array<{ id: string; value: number }>;
}

export interface WorkshopInitialData {
  bitWidth: number;
  initialValue: number;
}
