import { useMemo } from "react";
import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

type AccNode = { id: string; value: number; next: string | null };

export const LinkedChainScene = ({
  initialNodes,
  initialHeadId,
  actions,
}: {
  initialNodes: Array<{ id: string; value: number; next: string | null }>;
  initialHeadId: string | null;
  actions: SceneAction[];
}) => {
  // ACCUMULATED state: replay every action (steps 0..current) on top of the
  // seed, exactly like FamilyTreeScene/StorageShelfScene. This is what makes
  // "build from empty" work and keeps Prev/Next deterministic.
  const { headId, nodes, pointers } = useMemo(() => {
    const acc = new Map<string, AccNode>(
      initialNodes.map((n) => [n.id, { ...n }])
    );
    let head: string | null = initialHeadId;
    const ptrs: Record<string, string | null> = {};

    for (const action of actions) {
      if (action.component !== "ListNode") continue;
      switch (action.action) {
        case "insertNode": {
          const p = action.params as {
            afterId: string | null;
            newNodeId: string;
            value: number;
          };
          if (acc.has(p.newNodeId)) break;
          const node: AccNode = { id: p.newNodeId, value: p.value, next: null };
          acc.set(p.newNodeId, node);
          if (p.afterId == null || p.afterId === "") {
            node.next = head;
            head = p.newNodeId;
          } else {
            const after = acc.get(p.afterId);
            if (after) {
              node.next = after.next;
              after.next = p.newNodeId;
            }
          }
          break;
        }
        case "removeNode": {
          const p = action.params as { nodeId: string };
          if (!acc.has(p.nodeId)) break;
          const removedNext = acc.get(p.nodeId)?.next ?? null;
          acc.forEach((n) => {
            if (n.next === p.nodeId) n.next = removedNext;
          });
          if (head === p.nodeId) head = removedNext;
          acc.delete(p.nodeId);
          break;
        }
        case "updateNext": {
          const p = action.params as { nodeId: string; newNextId: string | null };
          const node = acc.get(p.nodeId);
          if (node) node.next = p.newNextId;
          break;
        }
        case "setPointer": {
          const p = action.params as { name: string; nodeId: string | null };
          ptrs[p.name] = p.nodeId;
          break;
        }
        default:
          break;
      }
    }
    return {
      headId: head,
      nodes: Array.from(acc.values()),
      pointers: ptrs,
    };
  }, [initialNodes, initialHeadId, actions]);

  // Layout ALL accumulated nodes horizontally. No head-reachability filter:
  // every node that exists in state after replaying steps 0..current is shown,
  // with its actual `next` pointer visualized by an arrow. This is essential for
  // reversal stories where head/next are mid-redirect — hiding "unreachable" nodes
  // would make nodes appear/disappear mid-animation, which is the exact bug reported.
  const nodeW = 70;
  const nodeH = 44;
  const gapX = 56;
  const marginX = 40;
  const baseY = 60;
  const pointerY = baseY + nodeH + 36;

  const contentWidth =
    marginX * 2 + (nodes.length - 1) * (nodeW + gapX) + nodeW;
  const width = Math.max(contentWidth, 120);
  const height = pointerY + 40;

  // Positions: nodes laid out left-to-right in accumulated order
  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((node, i) => {
    positions[node.id] = { x: marginX + i * (nodeW + gapX), y: baseY };
  });

  // Node shapes: show ALL accumulated nodes
  const nodeShapes = nodes.map((node, i) => {
    const p = positions[node.id];
    return (
      <g key={`node-${node.id}`}>
        <motion.rect
          x={p.x}
          y={p.y}
          width={nodeW}
          height={nodeH}
          rx={sceneTokens.radii.card / 2}
          fill={sceneTokens.colors.boxFill}
          stroke={sceneTokens.colors.boxStroke}
          strokeWidth={sceneTokens.strokeWidths.box}
          whileHover={{ strokeWidth: sceneTokens.strokeWidths.box + 2 }}
        />
        <text
          x={p.x + nodeW / 2}
          y={p.y + nodeH / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.text}
          fontSize={sceneTokens.fontSizes.medium}
        >
          {node.value}
        </text>
      </g>
    );
  });

  // Outgoing `next` arrow for each node, following its actual `next` pointer.
  // If next is null or points to a node not in accumulated state, no arrow.
  const arrowShapes = nodes.map((node) => {
    const p = positions[node.id];
    if (!node.next || !positions[node.next]) return null;
    const from = p;
    const to = positions[node.next];
    const x1 = from.x + nodeW;
    const y1 = from.y + nodeH / 2;
    const x2 = to.x;
    const y2 = to.y + nodeH / 2;
    return (
      <motion.line
        key={`arrow-${node.id}-${node.next}`}
        x1={x1}
        y1={y1}
        x2={x2 - 6}
        y2={y2}
        stroke={sceneTokens.colors.connector}
        strokeWidth={sceneTokens.strokeWidths.connector}
        markerEnd="url(#lc-arrow)"
      />
    );
  });

  // Pointer markers: for each named pointer (head, slow, fast, etc.), render
  // a labeled marker below the node it points to. If nodeId is null, show "→ ∅".
  const pointersByNode: Record<string, string[]> = {};
  const nullPointers: string[] = [];
  Object.entries(pointers).forEach(([name, target]) => {
    if (target == null || target === "") nullPointers.push(name);
    else {
      // render under any node that exists in accumulated state
      const targetNode = nodes.find((n) => n.id === target);
      if (targetNode) {
        (pointersByNode[target] ??= []).push(name);
      }
    }
  });

  const pointerShapes = nodes.flatMap((node) => {
    const p = positions[node.id];
    const names = pointersByNode[node.id] ?? [];
    return names.map((name, i) => (
      <g key={`ptr-${node.id}-${name}`}>
        <motion.line
          x1={p.x + nodeW / 2}
          y1={p.y + nodeH}
          x2={p.x + nodeW / 2}
          y2={pointerY - 4 + i * 16}
          stroke={sceneTokens.colors.highlight}
          strokeWidth={sceneTokens.strokeWidths.connector}
          markerEnd="url(#lc-ptr)"
        />
        <text
          x={p.x + nodeW / 2}
          y={pointerY + 12 + i * 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.highlight}
          fontSize={sceneTokens.fontSizes.small}
          fontWeight="bold"
        >
          {name}
        </text>
      </g>
    ));
  });

  const nullPointerShapes =
    nullPointers.length > 0 ? (
      <text
        x={width / 2}
        y={pointerY + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={sceneTokens.colors.muted}
        fontSize={sceneTokens.fontSizes.small}
        fontStyle="italic"
      >
        {nullPointers.map((n) => `${n} → ∅`).join("   ")}
      </text>
    ) : null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      <defs>
        <marker
          id="lc-arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill={sceneTokens.colors.connector} />
        </marker>
        <marker
          id="lc-ptr"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill={sceneTokens.colors.highlight} />
        </marker>
      </defs>

      {nodes.length === 0 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.muted}
          fontSize={sceneTokens.fontSizes.small}
        >
          (empty list)
        </text>
      )}

      {arrowShapes}
      {nodeShapes}

      {/* Action highlights for the current step(s). */}
      {actions.map((action, i) => {
        if (action.component !== "ListNode") return null;
        if (action.action === "visit") {
          const { nodeId } = action.params as { nodeId: string };
          const p = positions[nodeId];
          if (!p) return null;
          return (
            <motion.rect
              key={`visit-${i}-${nodeId}`}
              x={p.x}
              y={p.y}
              width={nodeW}
              height={nodeH}
              rx={sceneTokens.radii.card / 2}
              fill={sceneTokens.colors.highlight}
              stroke={sceneTokens.colors.highlight}
              strokeWidth={sceneTokens.strokeWidths.box + 2}
              transition={{ duration: 0.3 }}
            />
          );
        }
        if (action.action === "insertNode") {
          const { newNodeId } = action.params as { newNodeId: string };
          const p = positions[newNodeId];
          if (!p) return null;
          return (
            <motion.rect
              key={`insert-${i}-${newNodeId}`}
              x={p.x}
              y={p.y}
              width={nodeW}
              height={nodeH}
              rx={sceneTokens.radii.card / 2}
              fill={sceneTokens.colors.highlight}
              stroke={sceneTokens.colors.highlight}
              strokeWidth={sceneTokens.strokeWidths.box + 2}
              transition={{ duration: 0.4 }}
            />
          );
        }
        if (action.action === "removeNode") {
          const { nodeId } = action.params as { nodeId: string };
          const p = positions[nodeId];
          if (!p) return null;
          return (
            <motion.rect
              key={`remove-${i}-${nodeId}`}
              x={p.x}
              y={p.y}
              width={nodeW}
              height={nodeH}
              rx={sceneTokens.radii.card / 2}
              fill={sceneTokens.colors.muted}
              stroke={sceneTokens.colors.muted}
              strokeWidth={sceneTokens.strokeWidths.box + 2}
              transition={{ duration: 0.3 }}
            />
          );
        }
        if (action.action === "updateNext") {
          const { nodeId } = action.params as { nodeId: string };
          const p = positions[nodeId];
          if (!p) return null;
          return (
            <motion.rect
              key={`upd-${i}-${nodeId}`}
              x={p.x}
              y={p.y}
              width={nodeW}
              height={nodeH}
              rx={sceneTokens.radii.card / 2}
              fill="transparent"
              stroke={sceneTokens.colors.highlight}
              strokeWidth={sceneTokens.strokeWidths.box + 2}
              strokeDasharray="4,4"
              transition={{ duration: 0.3 }}
            />
          );
        }
        if (action.action === "setPointer") {
          const { name, nodeId } = action.params as {
            name: string;
            nodeId: string | null;
          };
          const p = nodeId ? positions[nodeId] : null;
          if (!p) return null;
          return (
            <motion.text
              key={`ptr-hl-${i}-${name}`}
              x={p.x + nodeW / 2}
              y={pointerY + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={sceneTokens.colors.highlight}
              fontSize={sceneTokens.fontSizes.small}
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {name}
            </motion.text>
          );
        }
        return null;
      })}

      {pointerShapes}
      {nullPointerShapes}
    </svg>
  );
};