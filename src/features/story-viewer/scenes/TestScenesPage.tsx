import { SceneRenderer } from "@/features/story-viewer/scenes/SceneRenderer";
import { sceneTokens } from "@/features/story-viewer/scenes/sceneTokens";
import { SceneAction } from "@/features/story-viewer/scenes/types";

const sortingActions: SceneAction[] = [
  { component: "Box", action: "compare", params: { box1Id: "0", box2Id: "1" } },
  { component: "Box", action: "swap", params: { box1Id: "0", box2Id: "1" } },
  { component: "Box", action: "highlight", params: { boxId: "2" } },
  { component: "Box", action: "setPointer", params: { boxId: "1", label: "curr" } },
];

const shelfActions: SceneAction[] = [
  { component: "Slot", action: "insert", params: { key: "item1", value: "apple" } },
  { component: "Slot", action: "lookup", params: { key: "item1" } },
  { component: "Slot", action: "highlight", params: { key: "item2" } },
];

const treeActions: SceneAction[] = [
  { component: "TreeNode", action: "visit", params: { nodeId: "n1" } },
  { component: "TreeNode", action: "compare", params: { nodeId: "n1", otherId: "n2" } },
  { component: "TreeNode", action: "insertNode", params: { newNodeId: "n5", value: 55, parentId: "n2", side: "right" } },
  { component: "TreeNode", action: "compareCandidate", params: { nodeId: "n1", candidateValue: 25 } },
];

const gateActions: SceneAction[] = [
  { component: "ConditionLabel", action: "evaluate", params: { result: true } },
  { component: "PathTaken", action: "takePath", params: { taken: "true" } },
];

const chainBuildActions: SceneAction[] = [
  { component: "ListNode", action: "insertNode", params: { afterId: null, newNodeId: "c1", value: 10 } },
  { component: "ListNode", action: "setPointer", params: { name: "head", nodeId: "c1" } },
  { component: "ListNode", action: "insertNode", params: { afterId: "c1", newNodeId: "c2", value: 20 } },
  { component: "ListNode", action: "insertNode", params: { afterId: "c2", newNodeId: "c3", value: 30 } },
];

const chainReverseActions: SceneAction[] = [
  { component: "ListNode", action: "visit", params: { nodeId: "r1" } },
  { component: "ListNode", action: "updateNext", params: { nodeId: "r1", newNextId: null } },
  { component: "ListNode", action: "updateNext", params: { nodeId: "r2", newNextId: "r1" } },
  { component: "ListNode", action: "updateNext", params: { nodeId: "r3", newNextId: "r2" } },
  { component: "ListNode", action: "setPointer", params: { name: "head", nodeId: "r3" } },
];

const workbenchBuildAndPopActions: SceneAction[] = [
  { component: "WorkbenchItem", action: "push", params: { itemId: "w1", value: 10 } },
  { component: "WorkbenchItem", action: "push", params: { itemId: "w2", value: 20 } },
  { component: "WorkbenchItem", action: "push", params: { itemId: "w3", value: 30 } },
  { component: "WorkbenchItem", action: "highlight", params: { itemId: "w3" } },
  { component: "WorkbenchItem", action: "pop", params: { itemId: "w3" } },
];

const cityTraversalActions: SceneAction[] = [
  { component: "GraphNode", action: "visit", params: { nodeId: "a" } },
  { component: "GraphNode", action: "markVisited", params: { nodeId: "a" } },
  { component: "GraphEdge", action: "traverse", params: { from: "a", to: "b" } },
  { component: "GraphNode", action: "visit", params: { nodeId: "b" } },
  { component: "GraphNode", action: "markVisited", params: { nodeId: "b" } },
  { component: "GraphEdge", action: "traverse", params: { from: "b", to: "c" } },
  { component: "GraphNode", action: "visit", params: { nodeId: "c" } },
  { component: "GraphEdge", action: "highlight", params: { from: "a", to: "c" } },
];

const cityBuildActions: SceneAction[] = [
  { component: "GraphNode", action: "addNode", params: { newNodeId: "start", value: 1, x: 60, y: 80 } },
  { component: "GraphNode", action: "addNode", params: { newNodeId: "park", value: 2, x: 190, y: 45 } },
  { component: "GraphEdge", action: "addEdge", params: { from: "start", to: "park", weight: 4, directed: true } },
  { component: "GraphNode", action: "addNode", params: { newNodeId: "museum", value: 3, x: 210, y: 150 } },
  { component: "GraphEdge", action: "addEdge", params: { from: "park", to: "museum", weight: 2, directed: false } },
];

const queueDrainActions: SceneAction[] = [
  { component: "QueueItem", action: "enqueue", params: { itemId: "q1", value: 10 } },
  { component: "QueueItem", action: "enqueue", params: { itemId: "q2", value: 20 } },
  { component: "QueueItem", action: "highlight", params: { itemId: "q1" } },
  { component: "QueueItem", action: "dequeue", params: { itemId: "q1" } },
];

const recursionActions: SceneAction[] = [
  { component: "CallFrame", action: "pushFrame", params: { frameId: "f0", label: "factorial(3)", depth: 0 } },
  { component: "CallFrame", action: "pushFrame", params: { frameId: "f1", label: "factorial(2)", depth: 1 } },
  { component: "CallFrame", action: "pushFrame", params: { frameId: "f2", label: "factorial(1)", depth: 2 } },
  { component: "CallFrame", action: "returnValue", params: { frameId: "f2", value: 1 } },
  { component: "CallFrame", action: "popFrame", params: { frameId: "f2" } },
  { component: "CallFrame", action: "returnValue", params: { frameId: "f1", value: 2 } },
  { component: "CallFrame", action: "backtrack", params: { frameId: "f1" } },
];

const binarySearchActions: SceneAction[] = [
  { component: "SearchItem", action: "checkIndex", params: { index: 3 } },
  { component: "SearchItem", action: "narrowRange", params: { low: 4, high: 6 } },
  { component: "SearchItem", action: "checkIndex", params: { index: 5 } },
  { component: "SearchItem", action: "found", params: { index: 5 } },
];

const workshopActions: SceneAction[] = [
  { component: "Bit", action: "setBit", params: { position: 3, value: 1 } },
  { component: "Bit", action: "applyOp", params: { operator: "AND", operandValue: 15 } },
  { component: "Bit", action: "highlight", params: { positions: [2, 3] } },
];

function SceneCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 720,
        backgroundColor: sceneTokens.surfaces.panel,
        border: `1px solid ${sceneTokens.borders.subtle}`,
        borderRadius: sceneTokens.radii.lg,
        padding: sceneTokens.spacing.padding,
        display: "flex",
        flexDirection: "column",
        gap: sceneTokens.spacing[3],
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3
          style={{
            fontSize: sceneTokens.typography.title.fontSize,
            fontWeight: sceneTokens.typography.title.fontWeight,
            color: sceneTokens.text.primary,
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ overflowX: "auto", padding: 8 }}>
        {children}
      </div>
    </div>
  );
}

export const TestScenesPage = () => (
  <div
    style={{
      padding: sceneTokens.spacing[6],
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: sceneTokens.surfaces.canvas,
      color: sceneTokens.text.primary,
      gap: sceneTokens.spacing[6],
    }}
  >
    <header style={{ textAlign: "center", marginBottom: 12 }}>
      <h1 style={{ fontSize: sceneTokens.typography.display.fontSize, fontWeight: 800, margin: 0 }}>
        Visual Scene Harness
      </h1>
      <p style={{ color: sceneTokens.text.secondary, marginTop: 6, fontSize: sceneTokens.typography.body.fontSize }}>
        Live rendering verification for all 11 real-world visual scene renderers.
      </p>
    </header>

    <div
      style={{
        width: "100%",
        maxWidth: 760,
        display: "flex",
        flexDirection: "column",
        gap: sceneTokens.spacing[5],
        alignItems: "center",
      }}
    >
      <SceneCard title="1. Sorting Tray (Bubble Sort)">
        <SceneRenderer
          kind="sorting-tray"
          initialData={{ array: [{ id: "0", value: 5 }, { id: "1", value: 3 }, { id: "2", value: 8 }, { id: "3", value: 1 }, { id: "4", value: 9 }] }}
          actions={sortingActions}
        />
      </SceneCard>

      <SceneCard title="2. Storage Shelf (Hash Map)">
        <SceneRenderer
          kind="storage-shelf"
          initialData={{
            slots: [
              { key: "item1", value: "apple" },
              { key: "item2", value: null },
              { key: "item3", value: "banana" },
            ],
          }}
          actions={shelfActions}
        />
      </SceneCard>

      <SceneCard title="3. Family Tree (BST)">
        <SceneRenderer
          kind="family-tree"
          initialData={{
            nodes: [
              { id: "n1", value: 50, x: 200, y: 200 },
              { id: "n2", value: 70, x: 400, y: 200 },
              { id: "n3", value: 30, x: 100, y: 400 },
              { id: "n4", value: 40, x: 500, y: 400 },
            ],
            edges: [
              { from: "n1", to: "n3" },
              { from: "n1", to: "n2" },
              { from: "n2", to: "n4" },
            ],
          }}
          actions={treeActions}
        />
      </SceneCard>

      <SceneCard title="4. Decision Gate (Condition Branch)">
        <SceneRenderer
          kind="decision-gate"
          initialData={{ condition: "arr[j] > arr[j + 1] && swapped == false" }}
          actions={gateActions}
        />
      </SceneCard>

      <SceneCard title="5. Linked Chain (Build & Connect)">
        <SceneRenderer
          kind="linked-chain"
          initialData={{ headId: null, nodes: [] }}
          actions={chainBuildActions}
        />
      </SceneCard>

      <SceneCard title="6. Linked Chain (Pointer Reversal)">
        <SceneRenderer
          kind="linked-chain"
          initialData={{
            headId: "r1",
            nodes: [
              { id: "r1", value: 1, next: "r2" },
              { id: "r2", value: 2, next: "r3" },
              { id: "r3", value: 3, next: null },
            ],
          }}
          actions={chainReverseActions}
        />
      </SceneCard>

      <SceneCard title="7. Workbench (Stack Push & Pop)">
        <SceneRenderer
          kind="workbench"
          initialData={{ items: [] }}
          actions={workbenchBuildAndPopActions}
        />
      </SceneCard>

      <SceneCard title="8. City Map (Graph Traversal)">
        <SceneRenderer
          kind="city-map"
          initialData={{
            nodes: [
              { id: "a", value: 1, x: 70, y: 110 },
              { id: "b", value: 2, x: 185, y: 55 },
              { id: "c", value: 3, x: 290, y: 120 },
              { id: "d", value: 4, x: 175, y: 180 },
            ],
            edges: [
              { from: "a", to: "b", weight: 3, directed: true },
              { from: "b", to: "c", weight: 2, directed: true },
              { from: "a", to: "c", weight: 7 },
              { from: "b", to: "d", weight: 1 },
            ],
          }}
          actions={cityTraversalActions}
        />
      </SceneCard>

      <SceneCard title="9. Conveyor Loop (Queue)">
        <SceneRenderer kind="conveyor-loop" initialData={{ items: [] }} actions={queueDrainActions} />
      </SceneCard>

      <SceneCard title="10. Delivery Desk (Binary Search)">
        <SceneRenderer
          kind="delivery-desk"
          initialData={{ array: [3, 7, 11, 18, 24, 31, 42].map((value) => ({ id: String(value), value })) }}
          actions={binarySearchActions}
        />
      </SceneCard>

      <SceneCard title="11. Recursion Stairs (Call Stack & Backtrack)">
        <SceneRenderer kind="recursion-stairs" initialData={{ frames: [] }} actions={recursionActions} />
      </SceneCard>

      <SceneCard title="12. Workshop (Bitwise Manipulation)">
        <SceneRenderer
          kind="workshop"
          initialData={{ bitWidth: 8, initialValue: 42, secondValue: 15 }}
          actions={workshopActions}
        />
      </SceneCard>
    </div>
  </div>
);
