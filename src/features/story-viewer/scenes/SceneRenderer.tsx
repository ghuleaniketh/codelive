import { SortingTrayScene } from "./SortingTrayScene";
import { StorageShelfScene } from "./StorageShelfScene";
import { FamilyTreeScene } from "./FamilyTreeScene";
import { DecisionGateScene } from "./DecisionGateScene";
import { SceneAction } from "./types";

export const SceneRenderer = ({
  kind,
  initialData,
  actions,
}: {
  kind:
    | "sorting-tray"
    | "storage-shelf"
    | "family-tree"
    | "decision-gate";
  initialData: unknown;
  actions: SceneAction[];
}) => {
  switch (kind) {
    case "sorting-tray": {
      const data = initialData as { array: Array<{ id: string; value: number }> };
      return <SortingTrayScene initialArray={data.array} actions={actions} />;
    }
    case "storage-shelf": {
      const data = initialData as {
        slots: Array<{ key: string; value: unknown | null }>;
      };
      return <StorageShelfScene initialSlots={data.slots} actions={actions} />;
    }
    case "family-tree": {
      const data = initialData as {
        nodes: Array<{ id: string; value: number; x: number; y: number }>;
        edges: Array<{ from: string; to: string }>;
      };
      return <FamilyTreeScene initialNodes={data.nodes} initialEdges={data.edges} actions={actions} />;
    }
    case "decision-gate": {
      const data = initialData as { condition: string };
      return <DecisionGateScene condition={data.condition} actions={actions} />;
    }
    default:
      return null;
  }
};