import { SortingTrayScene } from "./SortingTrayScene";
import { StorageShelfScene } from "./StorageShelfScene";
import { FamilyTreeScene } from "./FamilyTreeScene";
import { DecisionGateScene } from "./DecisionGateScene";
import { LinkedChainScene } from "./LinkedChainScene";
import { WorkbenchScene } from "./WorkbenchScene";
import { CityMapScene } from "./CityMapScene";
import { ConveyorLoopScene } from "./ConveyorLoopScene";
import { RecursionStairsScene } from "./RecursionStairsScene";
import { DeliveryDeskScene } from "./DeliveryDeskScene";
import { WorkshopScene } from "./WorkshopScene";
import { SceneAction } from "./types";

export const SceneRenderer = ({
  kind,
  initialData,
  actions,
  state,
}: {
  kind:
    | "sorting-tray"
    | "storage-shelf"
    | "family-tree"
    | "decision-gate"
    | "linked-chain"
    | "workbench"
    | "city-map"
    | "conveyor-loop"
    | "recursion-stairs"
    | "delivery-desk"
    | "workshop";
  initialData: unknown;
  actions: SceneAction[];
  state?: Record<string, string | number | boolean>;
}) => {
  switch (kind) {
    case "sorting-tray": {
      const data = initialData as { array: Array<{ id: string; value: number }> };
      return (
        <SortingTrayScene
          initialArray={data.array}
          actions={actions}
          state={state}
        />
      );
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
    case "linked-chain": {
      const data = initialData as {
        headId: string | null;
        nodes: Array<{ id: string; value: number; next: string | null }>;
      };
      return (
        <LinkedChainScene
          initialNodes={data.nodes}
          initialHeadId={data.headId}
          actions={actions}
        />
      );
    }
    case "workbench": {
      const data = initialData as {
        items: Array<{ id: string; value: unknown }>;
      };
      return (
        <WorkbenchScene
          initialItems={data.items}
          actions={actions}
        />
      );
    }
    case "city-map": {
      const data = initialData as {
        nodes: Array<{ id: string; value: number; x: number; y: number }>;
        edges: Array<{ from: string; to: string; weight?: number; directed?: boolean }>;
      };
      return <CityMapScene initialNodes={data.nodes} initialEdges={data.edges} actions={actions} />;
    }
    case "conveyor-loop": {
      const data = initialData as { items: Array<{ id: string; value: number }> };
      return <ConveyorLoopScene initialItems={data.items} actions={actions} />;
    }
    case "recursion-stairs": {
      const data = initialData as {
        frames: Array<{ id: string; label: string; depth: number; returnValue?: unknown }>;
      };
      return <RecursionStairsScene initialFrames={data.frames} actions={actions} />;
    }
    case "delivery-desk": {
      const data = initialData as { array: Array<{ id: string; value: number }> };
      return <DeliveryDeskScene initialArray={data.array} actions={actions} />;
    }
    case "workshop": {
      const data = initialData as {
        bitWidth: number;
        initialValue: number;
        secondValue?: number;
      };
      return <WorkshopScene initialData={data} actions={actions} />;
    }
    default:
      return null;
  }
};
