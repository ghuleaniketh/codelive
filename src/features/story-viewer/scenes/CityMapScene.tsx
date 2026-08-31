import { useMemo } from "react";
import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

type GraphNode = { id: string; value: number; x: number; y: number };
type GraphEdge = {
  id: string;
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
  added: boolean;
};

const edgeMatches = (edge: Pick<GraphEdge, "from" | "to">, from: string, to: string) =>
  edge.from === from && edge.to === to;

export const CityMapScene = ({
  initialNodes,
  initialEdges,
  actions,
}: {
  initialNodes: GraphNode[];
  initialEdges: Array<{ from: string; to: string; weight?: number; directed?: boolean }>;
  actions: SceneAction[];
}) => {
  // Replay the complete action prefix over the backend seed. This supports both
  // pre-populated traversal stories and graphs assembled from an empty seed.
  const { nodes, edges, exploringId, visitedIds, highlightedEdges, traversals, addedNodeIds } = useMemo(() => {
    const accumulatedNodes = initialNodes.map((node) => ({ ...node }));
    const accumulatedEdges: GraphEdge[] = initialEdges.map((edge, index) => ({
      ...edge,
      id: `initial-${index}`,
      added: false,
    }));
    const done = new Set<string>();
    const persistentHighlights = new Set<string>();
    const crossed: Array<{ id: string; from: string; to: string }> = [];
    const addedNodes = new Set<string>();
    let exploring: string | null = null;

    for (const action of actions) {
      if (action.component === "GraphNode") {
        if (action.action === "addNode") {
          const { newNodeId, value, x, y } = action.params;
          if (!accumulatedNodes.some((node) => node.id === newNodeId)) {
            accumulatedNodes.push({ id: newNodeId, value, x, y });
            addedNodes.add(newNodeId);
          }
        } else if (action.action === "visit") {
          exploring = action.params.nodeId;
        } else if (action.action === "markVisited") {
          done.add(action.params.nodeId);
          if (exploring === action.params.nodeId) exploring = null;
        }
      }

      if (action.component === "GraphEdge") {
        if (action.action === "addEdge") {
          const { from, to, weight, directed } = action.params;
          // An action prefix is replayed from scratch, so only guard malformed
          // duplicate backend events; parallel edges with different metadata stay valid.
          if (!accumulatedEdges.some((edge) => edgeMatches(edge, from, to) && edge.weight === weight && edge.directed === directed)) {
            accumulatedEdges.push({
              id: `action-${accumulatedEdges.length}`,
              from,
              to,
              weight,
              directed,
              added: true,
            });
          }
        } else if (action.action === "highlight") {
          persistentHighlights.add(`${action.params.from}\u0000${action.params.to}`);
        } else if (action.action === "traverse") {
          crossed.push({ id: `traverse-${crossed.length}`, ...action.params });
        }
      }
    }

    return {
      nodes: accumulatedNodes,
      edges: accumulatedEdges,
      exploringId: exploring,
      visitedIds: done,
      highlightedEdges: persistentHighlights,
      traversals: crossed,
      addedNodeIds: addedNodes,
    };
  }, [initialNodes, initialEdges, actions]);

  const { width, height, positions } = useMemo(() => {
    if (!nodes.length) return { width: 320, height: 180, positions: {} as Record<string, { x: number; y: number }> };
    const padding = 52;
    const xs = nodes.map((node) => node.x);
    const ys = nodes.map((node) => node.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const positions = Object.fromEntries(nodes.map((node) => [node.id, { x: node.x - minX + padding, y: node.y - minY + padding }]));
    return {
      width: Math.max(Math.max(...xs) - minX + padding * 2, 240),
      height: Math.max(Math.max(...ys) - minY + padding * 2, 160),
      positions,
    };
  }, [nodes]);

  const getEdgeLine = (from: string, to: string) => {
    const start = positions[from];
    const end = positions[to];
    if (!start || !end) return null;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const inset = 19;
    return {
      x1: start.x + (dx / length) * inset,
      y1: start.y + (dy / length) * inset,
      x2: end.x - (dx / length) * (inset + 2),
      y2: end.y - (dy / length) * (inset + 2),
      midX: (start.x + end.x) / 2,
      midY: (start.y + end.y) / 2,
    };
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ display: "block", maxWidth: "100%", height: "auto" }} aria-label="City map graph">
      <defs>
        <marker id="city-map-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={sceneTokens.colors.connector} />
        </marker>
      </defs>
      {!nodes.length && <text x={width / 2} y={height / 2} textAnchor="middle" dominantBaseline="middle" fill={sceneTokens.colors.muted} fontSize={sceneTokens.fontSizes.small}>(empty city map)</text>}

      {edges.map((edge) => {
        const line = getEdgeLine(edge.from, edge.to);
        if (!line) return null;
        const isHighlighted = highlightedEdges.has(`${edge.from}\u0000${edge.to}`);
        const stroke = isHighlighted ? "#7c3aed" : sceneTokens.colors.connector;
        return (
          <motion.g key={edge.id} initial={edge.added ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={stroke} strokeWidth={isHighlighted ? 4 : sceneTokens.strokeWidths.edge + 1} markerEnd={edge.directed ? "url(#city-map-arrow)" : undefined} />
            {edge.weight != null && <g><rect x={line.midX - 11} y={line.midY - 11} width="22" height="18" rx="7" fill="white" stroke={stroke} strokeWidth="1" /><text x={line.midX} y={line.midY - 1} textAnchor="middle" dominantBaseline="middle" fill={sceneTokens.colors.text} fontSize="11" fontWeight="700">{edge.weight}</text></g>}
          </motion.g>
        );
      })}

      {traversals.map((traversal) => {
        const line = getEdgeLine(traversal.from, traversal.to);
        if (!line) return null;
        return <motion.line key={traversal.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0] }} transition={{ duration: 0.9, times: [0, 0.65, 1] }} />;
      })}

      {nodes.map((node) => {
        const position = positions[node.id];
        const isExploring = exploringId === node.id;
        const isDone = visitedIds.has(node.id);
        const fill = isExploring ? "#fbbf24" : isDone ? "#cbd5e1" : sceneTokens.colors.boxFill;
        const stroke = isExploring ? "#d97706" : isDone ? "#64748b" : sceneTokens.colors.boxStroke;
        return <motion.g key={node.id} initial={addedNodeIds.has(node.id) ? { opacity: 0, scale: 0.65 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} style={{ transformOrigin: `${position.x}px ${position.y}px` }}>
          <circle cx={position.x} cy={position.y} r="18" fill={fill} stroke={stroke} strokeWidth={isExploring ? 3 : sceneTokens.strokeWidths.node} />
          <text x={position.x} y={position.y} textAnchor="middle" dominantBaseline="middle" fill={sceneTokens.colors.text} fontSize={sceneTokens.fontSizes.small} fontWeight="700">{node.value}</text>
          {isExploring && <text x={position.x} y={position.y + 32} textAnchor="middle" fill="#b45309" fontSize="10" fontWeight="700">exploring</text>}
          {isDone && !isExploring && <text x={position.x} y={position.y + 32} textAnchor="middle" fill={sceneTokens.colors.muted} fontSize="10">done</text>}
        </motion.g>;
      })}
    </svg>
  );
};
