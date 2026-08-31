import { useMemo } from "react";
import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

type AccNode = { id: string; value: number; x: number; y: number };
type AccEdge = { from: string; to: string; side?: "left" | "right" };

// Deterministic BST-style layout: in-order traversal left->right, depth -> y.
// This lets nodes inserted into an initially-empty tree receive stable
// coordinates so the SVG can reflow/resize as the tree grows.
function computeTreeLayout(
  nodes: AccNode[],
  edges: AccEdge[]
): { pos: Record<string, { x: number; y: number }>; width: number; height: number } {
  const leftOf: Record<string, string> = {};
  const rightOf: Record<string, string> = {};
  const hasParent = new Set<string>();
  edges.forEach((e) => {
    if (e.side === "left") leftOf[e.from] = e.to;
    else rightOf[e.from] = e.to;
    hasParent.add(e.to);
  });

  const roots = nodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id);
  const depth: Record<string, number> = {};
  const order: string[] = [];

  const visit = (id: string | undefined, d: number) => {
    if (!id) return;
    depth[id] = d;
    visit(leftOf[id], d + 1);
    order.push(id);
    visit(rightOf[id], d + 1);
  };
  roots.forEach((r) => visit(r, 0));
  nodes.forEach((n) => {
    if (depth[n.id] === undefined) {
      depth[n.id] = 0;
      order.push(n.id);
    }
  });

  const xSpacing = 70;
  const ySpacing = 70;
  const marginX = 35;
  const marginY = 35;
  const pos: Record<string, { x: number; y: number }> = {};
  order.forEach((id, i) => {
    pos[id] = { x: marginX + i * xSpacing, y: marginY + depth[id] * ySpacing };
  });

  const maxDepth = order.reduce((m, id) => Math.max(m, depth[id] ?? 0), 0);
  const width = Math.max(marginX * 2 + (order.length - 1) * xSpacing, 80);
  const height = Math.max(marginY * 2 + maxDepth * ySpacing, 120);
  return { pos, width, height };
}

export const FamilyTreeScene = ({
  initialNodes,
  initialEdges,
  actions,
}: {
  initialNodes: Array<{ id: string; value: number; x: number; y: number }>;
  initialEdges: Array<{ from: string; to: string }>;
  actions: SceneAction[];
}) => {
  // ACCUMULATED state: replay all actions (steps 0..current) over the seed so
  // an empty initialData builds up, and Prev/Next rebuilds deterministically.
  const { nodes, edges } = useMemo(() => {
    const accNodes: AccNode[] = initialNodes.map((n) => ({ ...n }));
    const accEdges: AccEdge[] = initialEdges.map((e) => ({ ...e }));
    for (const action of actions) {
      if (
        (action.component === "TreeNode" || action.component === "TreeEdge") &&
        action.action === "insertNode"
      ) {
        const p = action.params as {
          parentId?: string | null;
          newNodeId: string;
          value: number;
          side?: "left" | "right";
        };
        if (!accNodes.some((n) => n.id === p.newNodeId)) {
          accNodes.push({ id: p.newNodeId, value: p.value, x: 0, y: 0 });
        }
        if (p.parentId != null && p.parentId !== "" && p.parentId !== "null") {
          accEdges.push({
            from: p.parentId,
            to: p.newNodeId,
            side: p.side,
          });
        }
      }
    }
    return { nodes: accNodes, edges: accEdges };
  }, [initialNodes, initialEdges, actions]);

  const { pos, width, height } = useMemo(
    () => computeTreeLayout(nodes, edges),
    [nodes, edges]
  );

  const nodeShapes = nodes.map((node) => {
    const p = pos[node.id] ?? { x: node.x, y: node.y };
    return (
      <motion.circle
        key={node.id}
        cx={p.x}
        cy={p.y}
        r={16}
        fill={sceneTokens.colors.boxFill}
        stroke={sceneTokens.colors.boxStroke}
        strokeWidth={sceneTokens.strokeWidths.node}
        whileHover={{ r: 20, strokeWidth: sceneTokens.strokeWidths.node + 2 }}
        whileTap={{ scale: 0.95 }}
      />
    );
  });

  const nodeLabels = nodes.map((node) => {
    const p = pos[node.id] ?? { x: node.x, y: node.y };
    return (
      <text
        key={`label-${node.id}`}
        x={p.x}
        y={p.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={sceneTokens.colors.text}
        fontSize={sceneTokens.fontSizes.small}
      >
        {node.value}
      </text>
    );
  });

  const edgeShapes = edges.map((edge) => {
    const from = pos[edge.from];
    const to = pos[edge.to];
    if (!from || !to) return null;
    return (
      <motion.line
        key={`edge-${edge.from}-${edge.to}`}
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={sceneTokens.colors.connector}
        strokeWidth={sceneTokens.strokeWidths.edge}
        strokeDasharray="5, 5"
        whileHover={{ strokeWidth: sceneTokens.strokeWidths.edge + 2 }}
      />
    );
  });

  const treeViewBox = `0 0 ${width} ${height}`;

  return (
    <svg
      viewBox={treeViewBox}
      width={width}
      height={height}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      {nodes.length === 0 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.muted}
          fontSize={sceneTokens.fontSizes.small}
        >
          (empty tree)
        </text>
      )}
      {edgeShapes}
      {nodeShapes}
      {actions.map((action, i) => {
        if (action.component === "TreeNode" && action.action === "visit") {
          const { nodeId } = action.params as { nodeId: string };
          const p = pos[nodeId];
          if (!p) return null;
          return (
            <motion.circle
              key={`visit-${i}-${nodeId}`}
              cx={p.x}
              cy={p.y}
              r={16}
              fill={sceneTokens.colors.highlight}
              stroke={sceneTokens.colors.highlight}
              strokeWidth={sceneTokens.strokeWidths.node + 2}
              transition={{ duration: 0.3 }}
            />
          );
        }
        if (action.component === "TreeNode" && action.action === "compare") {
          const { nodeId, otherId } = action.params as {
            nodeId: string;
            otherId: string;
          };
          const p1 = pos[nodeId];
          const p2 = pos[otherId];
          if (!p1 || !p2) return null;
          return (
            <g key={`compare-${i}-${nodeId}-${otherId}`}>
              <motion.circle
                cx={p1.x}
                cy={p1.y}
                r={16}
                fill={sceneTokens.colors.highlight}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.node + 2}
                transition={{ duration: 0.3 }}
              />
              <motion.circle
                cx={p2.x}
                cy={p2.y}
                r={16}
                fill={sceneTokens.colors.highlight}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.node + 2}
                transition={{ duration: 0.3 }}
              />
            </g>
          );
        }
        if (
          action.component === "TreeNode" &&
          action.action === "insertNode"
        ) {
          const { newNodeId } = action.params as { newNodeId: string };
          const p = pos[newNodeId];
          if (!p) return null;
          return (
            <motion.circle
              key={`insert-${i}-${newNodeId}`}
              cx={p.x}
              cy={p.y}
              r={16}
              fill={sceneTokens.colors.highlight}
              stroke={sceneTokens.colors.highlight}
              strokeWidth={sceneTokens.strokeWidths.node + 2}
              transition={{ duration: 0.4 }}
            />
          );
        }
        if (
          action.component === "TreeNode" &&
          action.action === "compareCandidate"
        ) {
          const params = action.params as {
            nodeId?: string | number;
            existingNodeId?: string | number;
            candidateValue?: number | string;
            value?: number | string;
          };
          const existingId = String(params.nodeId ?? params.existingNodeId ?? "");
          const candidateValue = params.candidateValue ?? params.value;
          if (candidateValue === undefined) return null;
          const node = nodes.find((n) => n.id === existingId);
          const base = node ? pos[node.id] : { x: width / 2, y: height / 2 };
          const ghostX = base.x + 48;
          const ghostY = base.y - 34;
          return (
            <g key={`candidate-${i}-${existingId}-${candidateValue}`}>
              {node && (
                <motion.circle
                  cx={base.x}
                  cy={base.y}
                  r={16}
                  fill={sceneTokens.colors.highlight}
                  stroke={sceneTokens.colors.highlight}
                  strokeWidth={sceneTokens.strokeWidths.node + 2}
                  transition={{ duration: 0.3 }}
                />
              )}
              <motion.line
                x1={base.x}
                y1={base.y}
                x2={ghostX}
                y2={ghostY}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={1}
                strokeDasharray="3,3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.3 }}
              />
              <motion.circle
                cx={ghostX}
                cy={ghostY}
                r={16}
                fill="transparent"
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.node}
                strokeDasharray="4,4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <text
                x={ghostX}
                y={ghostY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={sceneTokens.colors.highlight}
                fontSize={sceneTokens.fontSizes.small}
                fontStyle="italic"
              >
                {String(candidateValue)}
              </text>
            </g>
          );
        }
        return null;
      })}
      {nodeLabels}
    </svg>
  );
};
