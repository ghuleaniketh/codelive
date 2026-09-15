import { useMemo } from "react";
import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

type AccNode = { id: string; value: number; x: number; y: number; treeId?: string };
type AccEdge = { from: string; to: string; side?: "left" | "right"; treeId?: string };

function computeSingleTreeLayout(
  nodes: AccNode[],
  edges: AccEdge[],
  startX: number = 0
): {
  pos: Record<string, { x: number; y: number }>;
  groupWidth: number;
  maxDepth: number;
  centerX: number;
} {
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
  const marginX = 44;
  const marginTop = 54;
  const pos: Record<string, { x: number; y: number }> = {};
  order.forEach((id, i) => {
    pos[id] = { x: startX + marginX + i * xSpacing, y: marginTop + depth[id] * ySpacing };
  });

  const maxDepth = order.reduce((m, id) => Math.max(m, depth[id] ?? 0), 0);
  const groupWidth = order.length > 0 ? marginX * 2 + (order.length - 1) * xSpacing : 0;
  const centerX =
    order.length > 0 ? startX + marginX + ((order.length - 1) * xSpacing) / 2 : startX + marginX;
  return { pos, groupWidth, maxDepth, centerX };
}

function computeTreeLayout(
  nodes: AccNode[],
  edges: AccEdge[]
): {
  pos: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
  headers: Array<{ treeId: string; centerX: number }>;
} {
  if (nodes.length === 0) {
    return { pos: {}, width: 240, height: 160, headers: [] };
  }

  // 1. Group nodes by treeId (undefined/null/empty treeId maps to a single default group)
  const groupsMap = new Map<string | undefined, AccNode[]>();
  for (const node of nodes) {
    const key = node.treeId;
    const list = groupsMap.get(key);
    if (list) {
      list.push(node);
    } else {
      groupsMap.set(key, [node]);
    }
  }

  const groupGap = 48;
  const ySpacing = 72;
  const marginTop = 54;
  const marginBottom = 40;

  const allPos: Record<string, { x: number; y: number }> = {};
  const headers: Array<{ treeId: string; centerX: number }> = [];
  let currentStartX = 0;
  let globalMaxDepth = 0;

  groupsMap.forEach((groupNodes: AccNode[], treeId: string | undefined) => {
    const nodeIds = new Set(groupNodes.map((n: AccNode) => n.id));
    // Defensive: only allow edges where both nodes belong to this specific tree group
    const groupEdges = edges.filter(
      (e) =>
        nodeIds.has(e.from) &&
        nodeIds.has(e.to) &&
        (e.treeId === undefined || treeId === undefined || e.treeId === treeId)
    );

    const { pos, groupWidth, maxDepth, centerX } = computeSingleTreeLayout(
      groupNodes,
      groupEdges,
      currentStartX
    );

    Object.assign(allPos, pos);
    globalMaxDepth = Math.max(globalMaxDepth, maxDepth);

    if (treeId !== undefined && treeId !== "") {
      headers.push({ treeId, centerX });
    }

    currentStartX += groupWidth + groupGap;
  });

  const totalContentWidth = Math.max(0, currentStartX - groupGap);
  const width = Math.max(totalContentWidth + 40, 240);
  const height = Math.max(marginTop + marginBottom + globalMaxDepth * ySpacing, 160);

  return { pos: allPos, width, height, headers };
}

export const FamilyTreeScene = ({
  initialNodes,
  initialEdges,
  actions,
}: {
  initialNodes: Array<{ id: string; value: number; x: number; y: number; treeId?: string }>;
  initialEdges: Array<{ from: string; to: string; side?: "left" | "right"; treeId?: string }>;
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
          treeId?: string;
        };
        if (!accNodes.some((n) => n.id === p.newNodeId)) {
          accNodes.push({ id: p.newNodeId, value: p.value, x: 0, y: 0, treeId: p.treeId });
        }
        if (p.parentId != null && p.parentId !== "" && p.parentId !== "null") {
          accEdges.push({
            from: p.parentId,
            to: p.newNodeId,
            side: p.side,
            treeId: p.treeId,
          });
        }
      }
    }
    return { nodes: accNodes, edges: accEdges };
  }, [initialNodes, initialEdges, actions]);

  const { pos, width, height, headers } = useMemo(
    () => computeTreeLayout(nodes, edges),
    [nodes, edges]
  );

  const nodeMap = useMemo(() => {
    const map = new Map<string, AccNode>();
    for (const node of nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [nodes]);

  const nodeRadius = sceneTokens.geometry.nodeRadius;

  const { visitedNodeIds, comparedNodeIds, activeNodeId } = useMemo(() => {
    const visited = new Set<string>();
    const compared = new Set<string>();
    let active: string | null = null;

    for (const action of actions) {
      if (action.component === "TreeNode") {
        if (action.action === "visit") {
          const { nodeId } = action.params as { nodeId: string };
          if (nodeId) {
            visited.add(String(nodeId));
            active = String(nodeId);
          }
        } else if (action.action === "compare") {
          const { nodeId, otherId } = action.params as { nodeId: string; otherId: string };
          if (nodeId) compared.add(String(nodeId));
          if (otherId) compared.add(String(otherId));
        } else if (action.action === "insertNode") {
          const { newNodeId } = action.params as { newNodeId: string };
          if (newNodeId) {
            visited.add(String(newNodeId));
            active = String(newNodeId);
          }
        }
      }
    }
    return { visitedNodeIds: visited, comparedNodeIds: compared, activeNodeId: active };
  }, [actions]);

  const nodeShapes = nodes.map((node, index) => {
    const p = pos[node.id] ?? { x: node.x, y: node.y };
    const isCompared = comparedNodeIds.has(node.id);
    const isActive = activeNodeId === node.id;
    const isVisited = visitedNodeIds.has(node.id) && !isCompared && !isActive;

    const fill = isCompared || isActive
      ? sceneTokens.status.active.fill
      : isVisited
      ? sceneTokens.status.mutated.fill
      : sceneTokens.surfaces.card;

    const stroke = isCompared || isActive
      ? sceneTokens.status.active.stroke
      : isVisited
      ? sceneTokens.status.mutated.stroke
      : sceneTokens.borders.contrast;

    const strokeWidth = isCompared || isActive || isVisited
      ? sceneTokens.geometry.stroke.emphasis
      : sceneTokens.geometry.stroke.default;

    return (
      <motion.circle
        key={`node-${node.treeId ?? ""}-${node.id}-${index}`}
        cx={p.x}
        cy={p.y}
        r={nodeRadius}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        whileHover={{ r: nodeRadius + 2 }}
      />
    );
  });

  const nodeLabels = nodes.map((node, index) => {
    const p = pos[node.id] ?? { x: node.x, y: node.y };
    return (
      <text
        key={`label-${node.treeId ?? ""}-${node.id}-${index}`}
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

  const edgeShapes = edges.map((edge, index) => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return null;
    // Defensive check: NEVER draw edge between nodes with different treeIds
    if (fromNode.treeId !== toNode.treeId) return null;

    const from = pos[edge.from];
    const to = pos[edge.to];
    if (!from || !to) return null;
    return (
      <motion.line
        key={`edge-${edge.treeId ?? ""}-${edge.from}-${edge.to}-${index}`}
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
      {headers.map((header) => (
        <text
          key={`tree-header-${header.treeId}`}
          x={header.centerX}
          y={24}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.text.secondary}
          fontSize={sceneTokens.typography.caption.fontSize}
          fontWeight={600}
          letterSpacing="0.05em"
        >
          {header.treeId.startsWith("Tree") ? header.treeId : `Tree ${header.treeId}`}
        </text>
      ))}
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
          const base = node && pos[node.id] ? pos[node.id] : { x: width / 2, y: 54 };
          
          const rawGhostX = base.x + 44;
          const rawGhostY = base.y - 30;

          // Ensure ghost node never clips against top, bottom, or sides
          const safeMinY = nodeRadius + 6;
          const safeMaxY = height - (nodeRadius + 6);
          const safeMinX = nodeRadius + 6;
          const safeMaxX = width - (nodeRadius + 6);

          const ghostY = Math.max(safeMinY, Math.min(safeMaxY, rawGhostY));
          let ghostX = rawGhostX;
          if (ghostX > safeMaxX) {
            ghostX = Math.max(safeMinX, base.x - 44);
          }
          return (
            <g key={`candidate-${i}-${existingId}-${candidateValue}`}>
              {/* Connector line between compared node and ghost node */}
              <line
                x1={base.x}
                y1={base.y}
                x2={ghostX}
                y2={ghostY}
                stroke={sceneTokens.status.active.stroke}
                strokeWidth={sceneTokens.geometry.stroke.subtle}
                strokeDasharray="3 3"
              />
              {/* Solid background mask circle: occludes any tree edge lines passing behind */}
              <circle
                cx={ghostX}
                cy={ghostY}
                r={nodeRadius}
                fill={sceneTokens.surfaces.panel}
              />
              {/* Active tinted overlay and dashed candidate circle */}
              <circle
                cx={ghostX}
                cy={ghostY}
                r={nodeRadius}
                fill={sceneTokens.status.active.fill}
                stroke={sceneTokens.status.active.stroke}
                strokeWidth={sceneTokens.geometry.stroke.default}
                strokeDasharray="4 4"
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
