import { useMemo } from "react";
import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

type AccNode = { id: string; value: number; x: number; y: number };
type AccEdge = { from: string; to: string; side?: "left" | "right" };

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

  const xSpacing = 72;
  const ySpacing = 72;
  const marginX = 36;
  const marginY = 36;
  const pos: Record<string, { x: number; y: number }> = {};
  order.forEach((id, i) => {
    pos[id] = { x: marginX + i * xSpacing, y: marginY + depth[id] * ySpacing };
  });

  const maxDepth = order.reduce((m, id) => Math.max(m, depth[id] ?? 0), 0);
  const width = Math.max(marginX * 2 + (order.length - 1) * xSpacing, 120);
  const height = Math.max(marginY * 2 + maxDepth * ySpacing, 140);
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

  const nodeRadius = sceneTokens.geometry.nodeRadius;

  const nodeShapes = nodes.map((node) => {
    const p = pos[node.id] ?? { x: node.x, y: node.y };
    return (
      <motion.circle
        key={node.id}
        cx={p.x}
        cy={p.y}
        r={nodeRadius}
        fill={sceneTokens.surfaces.card}
        stroke={sceneTokens.borders.contrast}
        strokeWidth={sceneTokens.geometry.stroke.default}
        whileHover={{ r: nodeRadius + 3, strokeWidth: sceneTokens.geometry.stroke.emphasis }}
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
        fill={sceneTokens.text.primary}
        fontSize={sceneTokens.typography.code.fontSize}
        fontWeight={600}
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
        stroke={sceneTokens.borders.contrast}
        strokeWidth={sceneTokens.geometry.stroke.default}
        strokeDasharray="4 4"
      />
    );
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
      aria-label="Family tree visualizer"
    >
      {nodes.length === 0 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.text.muted}
          fontSize={sceneTokens.typography.caption.fontSize}
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
              r={nodeRadius}
              fill={sceneTokens.status.active.fill}
              stroke={sceneTokens.status.active.stroke}
              strokeWidth={sceneTokens.geometry.stroke.emphasis}
              transition={{ duration: sceneTokens.motion.step }}
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
                r={nodeRadius}
                fill={sceneTokens.status.active.fill}
                stroke={sceneTokens.status.active.stroke}
                strokeWidth={sceneTokens.geometry.stroke.emphasis}
                transition={{ duration: sceneTokens.motion.step }}
              />
              <motion.circle
                cx={p2.x}
                cy={p2.y}
                r={nodeRadius}
                fill={sceneTokens.status.active.fill}
                stroke={sceneTokens.status.active.stroke}
                strokeWidth={sceneTokens.geometry.stroke.emphasis}
                transition={{ duration: sceneTokens.motion.step }}
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
              r={nodeRadius}
              fill={sceneTokens.status.mutated.fill}
              stroke={sceneTokens.status.mutated.stroke}
              strokeWidth={sceneTokens.geometry.stroke.emphasis}
              transition={{ duration: sceneTokens.motion.step }}
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
          const ghostX = base.x + 44;
          const ghostY = base.y - 32;
          return (
            <g key={`candidate-${i}-${existingId}-${candidateValue}`}>
              {node && (
                <motion.circle
                  cx={base.x}
                  cy={base.y}
                  r={nodeRadius}
                  fill={sceneTokens.status.active.fill}
                  stroke={sceneTokens.status.active.stroke}
                  strokeWidth={sceneTokens.geometry.stroke.emphasis}
                  transition={{ duration: sceneTokens.motion.step }}
                />
              )}
              <motion.line
                x1={base.x}
                y1={base.y}
                x2={ghostX}
                y2={ghostY}
                stroke={sceneTokens.status.active.stroke}
                strokeWidth={sceneTokens.geometry.stroke.subtle}
                strokeDasharray="3 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: sceneTokens.motion.step }}
              />
              <motion.circle
                cx={ghostX}
                cy={ghostY}
                r={nodeRadius}
                fill="transparent"
                stroke={sceneTokens.status.active.stroke}
                strokeWidth={sceneTokens.geometry.stroke.default}
                strokeDasharray="4 4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: sceneTokens.motion.step }}
              />
              <text
                x={ghostX}
                y={ghostY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={sceneTokens.status.active.glow}
                fontSize={sceneTokens.typography.code.fontSize}
                fontStyle="italic"
                fontWeight={600}
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
