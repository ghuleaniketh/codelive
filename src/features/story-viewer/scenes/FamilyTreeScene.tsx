import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

export const FamilyTreeScene = ({
  initialNodes,
  initialEdges,
  actions,
}: {
  initialNodes: Array<{ id: string; value: number; x: number; y: number }>;
  initialEdges: Array<{ from: string; to: string }>;
  actions: SceneAction[];
}) => {
  const nodes = initialNodes.map((node) => (
    <motion.circle
      key={node.id}
      cx={node.x}
      cy={node.y}
      r={16}
      fill={sceneTokens.colors.boxFill}
      stroke={sceneTokens.colors.boxStroke}
      strokeWidth={sceneTokens.strokeWidths.node}
      whileHover={{ r: 20, strokeWidth: sceneTokens.strokeWidths.node + 2 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.text
        x="0"
        y="3"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={sceneTokens.colors.text}
        fontSize={sceneTokens.fontSizes.small}
      >
        {node.value}
      </motion.text>
    </motion.circle>
  ));

  const edges = initialEdges.map((edge) => {
    const fromNode = initialNodes.find((n) => n.id === edge.from);
    const toNode = initialNodes.find((n) => n.id === edge.to);
    if (!fromNode || !toNode) return null;
    return (
      <motion.line
        key={`edge-${edge.from}-${edge.to}`}
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={sceneTokens.colors.connector}
        strokeWidth={sceneTokens.strokeWidths.edge}
        strokeDasharray="5, 5"
        whileHover={{ strokeWidth: sceneTokens.strokeWidths.edge + 2 }}
      />
    );
  });

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {edges}
      {nodes}
      {actions.map((action, i) => {
        if (action.component === "TreeNode" && action.action === "visit") {
          const { params } = action;
          const node = initialNodes.find((n) => n.id === params.nodeId);
          if (node) {
            return (
              <motion.circle
                key={`visit-${i}-${node.id}`}
                cx={node.x}
                cy={node.y}
                r={16}
                fill={sceneTokens.colors.highlight}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.node + 2}
                transition={{ duration: 0.3 }}
              />
            );
          }
        }
        if (action.component === "TreeNode" && action.action === "compare") {
          const { params } = action;
          const node1 = initialNodes.find((n) => n.id === params.node1Id);
          const node2 = initialNodes.find((n) => n.id === params.node2Id);
          if (node1 && node2) {
            return (
              <>
                <motion.circle
                  key={`compare1-${i}-${node1.id}-${node2.id}`}
                  cx={node1.x}
                  cy={node1.y}
                  r={16}
                  fill={sceneTokens.colors.highlight}
                  stroke={sceneTokens.colors.highlight}
                  strokeWidth={sceneTokens.strokeWidths.node + 2}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  key={`compare2-${i}-${node1.id}-${node2.id}`}
                  cx={node2.x}
                  cy={node2.y}
                  r={16}
                  fill={sceneTokens.colors.highlight}
                  stroke={sceneTokens.colors.highlight}
                  strokeWidth={sceneTokens.strokeWidths.node + 2}
                  transition={{ duration: 0.3 }}
                />
              </>
            );
          }
        }
        if (action.component === "TreeNode" && action.action === "insertNode") {
          const { newId, newValue, fromId, toId, x, y } = action.params as {
            newId: string;
            newValue: number;
            fromId: string;
            toId: string;
            x?: number;
            y?: number;
          };
          const newNode = {
            id: newId,
            value: newValue,
            x: x ?? 400,
            y: y ?? 100,
          };
          const targetEdge = initialEdges.find(
            (e) => e.from === fromId && e.to === toId
          );
          return (
            <>
              <motion.circle
                key={`insert-node-${i}-${newNode.id}`}
                cx={newNode.x}
                cy={newNode.y}
                r={16}
                fill={sceneTokens.colors.highlight}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.node + 2}
                transition={{ duration: 0.4, from: { opacity: 0, scale: 0 } }}
              />
              {targetEdge && (
                <motion.line
                  key={`insert-edge-${i}-${targetEdge.from}-${targetEdge.to}`}
                  x1={initialNodes.find((n) => n.id === targetEdge.from)?.x ?? 0}
                  y1={initialNodes.find((n) => n.id === targetEdge.from)?.y ?? 0}
                  x2={newNode.x}
                  y2={newNode.y}
                  stroke={sceneTokens.colors.highlight}
                  strokeWidth={sceneTokens.strokeWidths.edge + 2}
                  strokeDasharray="5, 5"
                  transition={{ duration: 0.4 }}
                />
              )}
            </>
          );
        }
        return null;
      })}
    </div>
  );
};