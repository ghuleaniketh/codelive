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
  const nodeShapes = initialNodes.map((node) => (
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
    />
  ));

  const nodeLabels = initialNodes.map((node) => (
    <text
      key={`label-${node.id}`}
      x={node.x}
      y={node.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={sceneTokens.colors.text}
      fontSize={sceneTokens.fontSizes.small}
    >
      {node.value}
    </text>
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

  const treePad = 40;
  const treeWidth = Math.max(...initialNodes.map((n) => n.x), 0) + treePad;
  const treeHeight = Math.max(...initialNodes.map((n) => n.y), 0) + treePad;
  const treeViewBox = `0 0 ${treeWidth} ${treeHeight}`;

  return (
    <svg
      viewBox={treeViewBox}
      width={treeWidth}
      height={treeHeight}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      {edges}
      {nodeShapes}
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
              <g key={`compare-${i}-${node1.id}-${node2.id}`}>
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
              </g>
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
            <g key={`insert-${i}-${newNode.id}`}>
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
              <text
                x={newNode.x}
                y={newNode.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={sceneTokens.colors.text}
                fontSize={sceneTokens.fontSizes.small}
              >
                {newNode.value}
              </text>
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
            </g>
          );
        }
        if (
          action.component === "TreeNode" &&
          action.action === "compareCandidate"
        ) {
          // Visualise an incoming value being compared against an existing node:
          // highlight the existing node, draw a dashed "ghost" node near it showing
          // the candidateValue, and a dashed connector between them.
          const params = action.params as {
            nodeId?: string | number;
            existingNodeId?: string | number;
            candidateValue?: number | string;
            value?: number | string;
          };
          const existingId = String(
            params.nodeId ?? params.existingNodeId ?? ""
          );
          const candidateValue =
            params.candidateValue ?? params.value;
          if (candidateValue === undefined) return null;

          const node = initialNodes.find((n) => n.id === existingId);
          const baseX = node ? node.x : 200;
          const baseY = node ? node.y : 200;
          const ghostX = baseX + 48;
          const ghostY = baseY - 34;

          return (
            <g key={`candidate-${i}-${existingId}-${candidateValue}`}>
              {node && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={16}
                  fill={sceneTokens.colors.highlight}
                  stroke={sceneTokens.colors.highlight}
                  strokeWidth={sceneTokens.strokeWidths.node + 2}
                  transition={{ duration: 0.3 }}
                />
              )}
              <motion.line
                x1={baseX}
                y1={baseY}
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