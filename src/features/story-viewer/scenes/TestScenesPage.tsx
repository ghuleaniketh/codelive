import { SceneRenderer } from "@/features/story-viewer/scenes/SceneRenderer";
import { sceneTokens } from "@/features/story-viewer/scenes/sceneTokens";
import { SceneAction } from "@/features/story-viewer/scenes/types";

const sortingActions: SceneAction[] = [
  { component: "Box", action: "compare", params: { box1Id: "0", box2Id: "1" } },
  { component: "Box", action: "swap", params: { box1Id: "0", box2Id: "1" } },
  { component: "Box", action: "highlight", params: { boxId: "2" } },
];

const shelfActions: SceneAction[] = [
  { component: "Slot", action: "insert", params: { key: "item1" } },
  { component: "Slot", action: "lookup", params: { key: "item1" } },
  { component: "Slot", action: "highlight", params: { key: "item2" } },
];

const treeActions: SceneAction[] = [
  { component: "TreeNode", action: "visit", params: { nodeId: "n1" } },
  { component: "TreeNode", action: "compare", params: { node1Id: "n1", node2Id: "n2" } },
  { component: "TreeNode", action: "insertNode", params: { newId: "n3", newValue: 99, fromId: "n1", toId: "n2" } },
];

const gateActions: SceneAction[] = [
  { component: "ConditionLabel", action: "evaluate", params: { result: true } },
  { component: "PathTaken", action: "takePath", params: { taken: "true" } },
];

// "Build from empty": start with no nodes / no head, then insert 3 nodes.
// Demonstrates insertNode becoming the new head (afterId=null) and splicing
// in after a referenced node.
const chainBuildActions: SceneAction[] = [
  { component: "ListNode", action: "insertNode", params: { afterId: null, newNodeId: "c1", value: 10 } },
  { component: "ListNode", action: "setPointer", params: { name: "head", nodeId: "c1" } },
  { component: "ListNode", action: "insertNode", params: { afterId: "c1", newNodeId: "c2", value: 20 } },
  { component: "ListNode", action: "insertNode", params: { afterId: "c2", newNodeId: "c3", value: 30 } },
];

// "Reversal": an existing 3-node chain 1->2->3 gets its `next` pointers
// redirected via updateNext so it becomes 3->2->1, with head moved to n3.
const chainReverseActions: SceneAction[] = [
  { component: "ListNode", action: "visit", params: { nodeId: "r1" } },
  { component: "ListNode", action: "updateNext", params: { nodeId: "r1", newNextId: null } },
  { component: "ListNode", action: "updateNext", params: { nodeId: "r2", newNextId: "r1" } },
  { component: "ListNode", action: "updateNext", params: { nodeId: "r3", newNextId: "r2" } },
  { component: "ListNode", action: "setPointer", params: { name: "head", nodeId: "r3" } },
];

// "Build and pop": push 3 items onto the workbench stack, then pop them
// one at a time. Demonstrates push adds to top, pop removes from top, and
// Prev/Next correctly tracks the accumulating state (items disappear after pop).
const workbenchBuildAndPopActions: SceneAction[] = [
  { component: "WorkbenchItem", action: "push", params: { itemId: "w1", value: 10 } },
  { component: "WorkbenchItem", action: "push", params: { itemId: "w2", value: 20 } },
  { component: "WorkbenchItem", action: "push", params: { itemId: "w3", value: 30 } },
  { component: "WorkbenchItem", action: "pop", params: { itemId: "w3" } },
  { component: "WorkbenchItem", action: "pop", params: { itemId: "w2" } },
  { component: "WorkbenchItem", action: "pop", params: { itemId: "w1" } },
];

// Graph traversal fixture: when consumed one action at a time by StoryViewer,
// it shows a BFS-like visit -> done progression while the crossing road pulses.
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

// CASE B fixture: a graph constructed entirely through action replay.
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
  { component: "QueueItem", action: "dequeue", params: { itemId: "q2" } },
];

const recursionActions: SceneAction[] = [
  { component: "CallFrame", action: "pushFrame", params: { frameId: "f0", label: "factorial(3)", depth: 0 } },
  { component: "CallFrame", action: "pushFrame", params: { frameId: "f1", label: "factorial(2)", depth: 1 } },
  { component: "CallFrame", action: "pushFrame", params: { frameId: "f2", label: "factorial(1)", depth: 2 } },
  { component: "CallFrame", action: "returnValue", params: { frameId: "f2", value: 1 } },
  { component: "CallFrame", action: "popFrame", params: { frameId: "f2" } },
  { component: "CallFrame", action: "returnValue", params: { frameId: "f1", value: 2 } },
  { component: "CallFrame", action: "backtrack", params: { frameId: "f1" } },
  { component: "CallFrame", action: "popFrame", params: { frameId: "f1" } },
];

const binarySearchActions: SceneAction[] = [
  { component: "SearchItem", action: "checkIndex", params: { index: 7 } },
  { component: "SearchItem", action: "narrowRange", params: { low: 4, high: 6 } },
  { component: "SearchItem", action: "checkIndex", params: { index: 8 } },
  { component: "SearchItem", action: "narrowRange", params: { low: 4, high: 4 } },
  { component: "SearchItem", action: "checkIndex", params: { index: 4 } },
  { component: "SearchItem", action: "found", params: { index: 4 } },
];

export const TestScenesPage = () => (
  <div
    style={{
      padding: sceneTokens.spacing.padding,
      gap: sceneTokens.spacing.gap,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: sceneTokens.colors.background,
      color: sceneTokens.colors.text,
    }}
  >
    <h2 style={{ marginBottom: sceneTokens.spacing.gap, fontSize: sceneTokens.fontSizes.large }}>
      Scene Renderer Demo
    </h2>
    <div style={{ display: "flex", gap: sceneTokens.spacing.gap, marginBottom: sceneTokens.spacing.gap }}>
      <SceneRenderer
        kind="sorting-tray"
        initialData={{ array: [{ id: "0", value: 5 }, { id: "1", value: 3 }, { id: "2", value: 8 }, { id: "3", value: 1 }, { id: "4", value: 9 } ]}}
        actions={sortingActions}
      />
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
      <SceneRenderer
        kind="family-tree"
        initialData={{
          nodes: [
            { id: "n1", value: 10, x: 200, y: 200 },
            { id: "n2", value: 20, x: 400, y: 200 },
            { id: "n3", value: 30, x: 100, y: 400 },
            { id: "n4", value: 40, x: 500, y: 400 },
          ],
          edges: [
            { from: "n1", to: "n3" },
            { from: "n1", to: "n4" },
            { from: "n2", to: "n3" },
            { from: "n2", to: "n4" },
          ],
        }}
        actions={treeActions}
      />
      <SceneRenderer
        kind="decision-gate"
        initialData={{ condition: "x > 5" }}
        actions={gateActions}
      />
      <SceneRenderer
        kind="linked-chain"
        initialData={{ headId: null, nodes: [] }}
        actions={chainBuildActions}
      />
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
      <SceneRenderer
        kind="workbench"
        initialData={{ items: [] }}
        actions={workbenchBuildAndPopActions}
      />
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
      <SceneRenderer kind="city-map" initialData={{ nodes: [], edges: [] }} actions={cityBuildActions} />
      <SceneRenderer kind="conveyor-loop" initialData={{ items: [] }} actions={queueDrainActions} />
      <SceneRenderer kind="recursion-stairs" initialData={{ frames: [] }} actions={recursionActions} />
      <SceneRenderer
        kind="delivery-desk"
        initialData={{ array: [3, 7, 11, 18, 24, 31, 42].map((value) => ({ id: String(value), value })) }}
        actions={binarySearchActions}
      />
    </div>
  </div>
);
