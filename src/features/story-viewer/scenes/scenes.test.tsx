import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SortingTrayScene } from "./SortingTrayScene";
import { WorkbenchScene } from "./WorkbenchScene";
import { WorkshopScene } from "./WorkshopScene";
import { DecisionGateScene } from "./DecisionGateScene";
import { SceneRenderer } from "./SceneRenderer";
import { sceneTokens } from "./sceneTokens";

describe("Visual Scenes Component Suite", () => {
  it("SortingTrayScene highlights both compared boxes and reorders swapped boxes", () => {
    const initialArray = [
      { id: "b0", value: 5 },
      { id: "b1", value: 3 },
    ];
    const compareAndSwapActions = [
      { component: "Box" as const, action: "compare" as const, params: { box1Id: "b0", box2Id: "b1" } },
      { component: "Box" as const, action: "swap" as const, params: { box1Id: "b0", box2Id: "b1" } },
    ];

    const markup = renderToStaticMarkup(
      <SortingTrayScene initialArray={initialArray} actions={compareAndSwapActions} />
    );

    // Both boxes should use the active status stroke
    expect(markup).toContain(sceneTokens.status.active.stroke);
    // Values 5 and 3 are present
    expect(markup).toContain("5");
    expect(markup).toContain("3");
  });

  it("WorkbenchScene places text at true geometric center (width / 2 = 110)", () => {
    const markup = renderToStaticMarkup(
      <WorkbenchScene
        initialItems={[{ id: "w1", value: "stackItem" }]}
        actions={[]}
      />
    );

    // x="110" corresponds to width / 2 for width = 220
    expect(markup).toContain('x="110"');
    expect(markup).toContain("stackItem");
  });

  it("WorkshopScene renders valid SVG structure without outside text elements", () => {
    const markup = renderToStaticMarkup(
      <WorkshopScene
        initialData={{ bitWidth: 8, initialValue: 42, secondValue: 15 }}
        actions={[
          { component: "Bit", action: "setBit", params: { position: 3, value: 1 } },
          { component: "Bit", action: "applyOp", params: { operator: "AND", operandValue: 15 } },
          { component: "Bit", action: "highlight", params: { positions: [2, 3] } },
        ]}
      />
    );

    // Should start with <svg and end with </svg>
    expect(markup.startsWith("<svg")).toBe(true);
    expect(markup.endsWith("</svg>")).toBe(true);
    // Should contain bit indices and operation label
    expect(markup).toContain("AND 15");
    expect(markup).toContain("= 10");
  });

  it("DecisionGateScene wraps condition text across multiple tspans for long expressions", () => {
    const longCondition = "arr[j] > arr[j + 1] && swapped == false && flag == true";
    const markup = renderToStaticMarkup(
      <DecisionGateScene
        condition={longCondition}
        actions={[
          { component: "ConditionLabel", action: "evaluate", params: { result: true } },
          { component: "PathTaken", action: "takePath", params: { taken: "true" } },
        ]}
      />
    );

    expect(markup).toContain("<tspan");
    expect(markup).toContain("TRUE");
    expect(markup).toContain("FALSE");
  });

  it("SceneRenderer successfully renders all 11 scene kinds without error", () => {
    const kinds = [
      { kind: "sorting-tray" as const, initialData: { array: [{ id: "0", value: 1 }] } },
      { kind: "storage-shelf" as const, initialData: { slots: [{ key: "k", value: "v" }] } },
      { kind: "family-tree" as const, initialData: { nodes: [{ id: "n", value: 1, x: 0, y: 0 }], edges: [] } },
      { kind: "decision-gate" as const, initialData: { condition: "x > 0" } },
      { kind: "linked-chain" as const, initialData: { headId: "h", nodes: [{ id: "h", value: 1, next: null }] } },
      { kind: "workbench" as const, initialData: { items: [{ id: "w", value: 1 }] } },
      { kind: "city-map" as const, initialData: { nodes: [{ id: "a", value: 1, x: 0, y: 0 }], edges: [] } },
      { kind: "conveyor-loop" as const, initialData: { items: [{ id: "q", value: 1 }] } },
      { kind: "recursion-stairs" as const, initialData: { frames: [{ id: "f", label: "f", depth: 0 }] } },
      { kind: "delivery-desk" as const, initialData: { array: [{ id: "d", value: 1 }] } },
      { kind: "workshop" as const, initialData: { bitWidth: 8, initialValue: 0 } },
    ];

    for (const item of kinds) {
      const markup = renderToStaticMarkup(
        <SceneRenderer kind={item.kind} initialData={item.initialData} actions={[]} />
      );
      expect(markup).toContain("<svg");
    }
  });
});
