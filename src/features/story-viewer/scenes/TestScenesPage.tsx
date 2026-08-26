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
    </div>
  </div>
);