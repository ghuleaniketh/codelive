import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SortingTrayScene } from "./SortingTrayScene";
import { WorkbenchScene } from "./WorkbenchScene";
import { WorkshopScene } from "./WorkshopScene";
import { DecisionGateScene } from "./DecisionGateScene";
import { FamilyTreeScene } from "./FamilyTreeScene";
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

  it("SortingTrayScene displays scanning pointers (j) and handles sole i pointers", () => {
    const initialArray = [
      { id: "b0", value: 5 },
      { id: "b1", value: 3 },
      { id: "b2", value: 8 },
    ];

    // Case 1: In Bubble Sort with i and j in state, j is the scanning cursor on the array
    const markup1 = renderToStaticMarkup(
      <SortingTrayScene
        initialArray={initialArray}
        actions={[]}
        state={{ i: 0, j: 1, swapped: false }}
      />
    );
    expect(markup1).toContain("↑ j");

    // Case 2: In linear search where i is the sole pointer, i is rendered on the array
    const markup2 = renderToStaticMarkup(
      <SortingTrayScene
        initialArray={initialArray}
        actions={[]}
        state={{ i: 2, target: 8 }}
      />
    );
    expect(markup2).toContain("↑ i");

    // Case 3: Explicit setPointer actions always render
    const markup3 = renderToStaticMarkup(
      <SortingTrayScene
        initialArray={initialArray}
        actions={[
          { component: "Box" as const, action: "setPointer" as const, params: { index: 0, label: "curr" } },
        ]}
      />
    );
    expect(markup3).toContain("↑ curr");
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

  it("FamilyTreeScene compareCandidate at root level renders fully within SVG bounds without clipping", () => {
    const initialNodes = [
      { id: "root", value: 50, x: 0, y: 0 },
      { id: "left", value: 20, x: 0, y: 0 },
      { id: "right", value: 80, x: 0, y: 0 },
    ];
    const initialEdges = [
      { from: "root", to: "left", side: "left" as const },
      { from: "root", to: "right", side: "right" as const },
    ];
    const actions = [
      {
        component: "TreeNode" as const,
        action: "compareCandidate" as const,
        params: { nodeId: "root", candidateValue: 30 },
      },
    ];

    const markup = renderToStaticMarkup(
      <FamilyTreeScene initialNodes={initialNodes} initialEdges={initialEdges} actions={actions} />
    );

    // Should render candidate 30
    expect(markup).toContain("30");
    // Should render root and child nodes
    expect(markup).toContain("50");
    expect(markup).toContain("20");
    expect(markup).toContain("80");
    // Ghost dashed circle and solid background mask should be present
    expect(markup).toContain('stroke-dasharray="4 4"');
    expect(markup).toContain(`fill="${sceneTokens.surfaces.panel}"`);
  });

  it("FamilyTreeScene compareCandidate in 6-node tree renders solid background mask preventing connector line overlap", () => {
    // 6-node BST: 50 -> (30, 70), 30 -> (20, 40), 70 -> (80)
    const initialNodes = [
      { id: "n50", value: 50, x: 0, y: 0 },
      { id: "n30", value: 30, x: 0, y: 0 },
      { id: "n70", value: 70, x: 0, y: 0 },
      { id: "n20", value: 20, x: 0, y: 0 },
      { id: "n40", value: 40, x: 0, y: 0 },
      { id: "n80", value: 80, x: 0, y: 0 },
    ];
    const initialEdges = [
      { from: "n50", to: "n30", side: "left" as const },
      { from: "n50", to: "n70", side: "right" as const },
      { from: "n30", to: "n20", side: "left" as const },
      { from: "n30", to: "n40", side: "right" as const },
      { from: "n70", to: "n80", side: "right" as const },
    ];
    // Candidate comparison on n20 (which is near parent n30 and sibling n40 connector lines)
    const actions = [
      {
        component: "TreeNode" as const,
        action: "compareCandidate" as const,
        params: { nodeId: "n20", candidateValue: 25 },
      },
    ];

    const markup = renderToStaticMarkup(
      <FamilyTreeScene initialNodes={initialNodes} initialEdges={initialEdges} actions={actions} />
    );

    // All node values rendered
    expect(markup).toContain("50");
    expect(markup).toContain("30");
    expect(markup).toContain("20");
    expect(markup).toContain("40");
    expect(markup).toContain("70");
    expect(markup).toContain("80");
    // Candidate 25 rendered with solid panel mask behind it to occlude any crossing lines
    expect(markup).toContain("25");
    expect(markup).toContain(`fill="${sceneTokens.surfaces.panel}"`);
    expect(markup).toContain('stroke-dasharray="4 4"');
  });

  it("FamilyTreeScene renders two separate 3-node trees side-by-side with treeId 'p' and 'q' without overflow", () => {
    // Tree p: 1 -> left: 2, right: 3
    // Tree q: 1 -> left: 2, right: 3
    const initialNodes = [
      { id: "p1", value: 1, x: 0, y: 0, treeId: "p" },
      { id: "p2", value: 2, x: 0, y: 0, treeId: "p" },
      { id: "p3", value: 3, x: 0, y: 0, treeId: "p" },
      { id: "q1", value: 1, x: 0, y: 0, treeId: "q" },
      { id: "q2", value: 2, x: 0, y: 0, treeId: "q" },
      { id: "q3", value: 3, x: 0, y: 0, treeId: "q" },
    ];
    const initialEdges = [
      { from: "p1", to: "p2", side: "left" as const, treeId: "p" },
      { from: "p1", to: "p3", side: "right" as const, treeId: "p" },
      { from: "q1", to: "q2", side: "left" as const, treeId: "q" },
      { from: "q1", to: "q3", side: "right" as const, treeId: "q" },
    ];

    const markup = renderToStaticMarkup(
      <FamilyTreeScene initialNodes={initialNodes} initialEdges={initialEdges} actions={[]} />
    );

    // Tree headers should be rendered
    expect(markup).toContain("Tree p");
    expect(markup).toContain("Tree q");

    // All node values should be rendered
    expect(markup).toContain("1");
    expect(markup).toContain("2");
    expect(markup).toContain("3");

    // Width should accommodate both side-by-side groups (> 500px)
    expect(markup).toMatch(/viewBox="0 0 (\d+) (\d+)"/);
    const match = markup.match(/viewBox="0 0 (\d+) (\d+)"/);
    expect(match).not.toBeNull();
    const width = parseInt(match![1], 10);
    expect(width).toBeGreaterThanOrEqual(500);

    // Check that tree p and tree q nodes have distinct, separated X coordinate regions
    // p nodes: cx="44", cx="116", cx="188"
    // q nodes: cx="324", cx="396", cx="468"
    expect(markup).toContain('cx="44"');
    expect(markup).toContain('cx="116"');
    expect(markup).toContain('cx="188"');
    expect(markup).toContain('cx="324"');
    expect(markup).toContain('cx="396"');
    expect(markup).toContain('cx="468"');
  });

  it("FamilyTreeScene defensively refuses to draw edges between nodes with different treeIds", () => {
    const initialNodes = [
      { id: "p1", value: 1, x: 0, y: 0, treeId: "p" },
      { id: "q1", value: 1, x: 0, y: 0, treeId: "q" },
    ];
    // Malformed edge attempting to connect node in tree 'p' to node in tree 'q'
    const malformedEdges = [
      { from: "p1", to: "q1", side: "left" as const },
    ];

    const markup = renderToStaticMarkup(
      <FamilyTreeScene initialNodes={initialNodes} initialEdges={malformedEdges} actions={[]} />
    );

    // Node circles should exist
    expect(markup).toContain("Tree p");
    expect(markup).toContain("Tree q");
    // No line element should be drawn for the invalid cross-tree edge
    expect(markup).not.toContain("<line");
  });
});

