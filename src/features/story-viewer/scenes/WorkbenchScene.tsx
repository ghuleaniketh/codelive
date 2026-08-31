import { useMemo } from "react";
import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

type AccItem = { id: string; value: unknown };

export const WorkbenchScene = ({
  initialItems,
  actions,
}: {
  initialItems: Array<{ id: string; value: unknown }>;
  actions: SceneAction[];
}) => {
  // ACCUMULATED state: replay every action (steps 0..current) on top of the
  // seed initialData.items. push adds to top, pop removes from top, peek/highlight
  // just observe. This is the established pattern — state at step N depends on
  // all push/pop actions from step 0 through N.
  const items = useMemo(() => {
    // Seed: copy initial items bottom-to-top (last = top)
    const acc: AccItem[] = initialItems.map((n) => ({ ...n }));

    for (const action of actions) {
      if (action.component !== "WorkbenchItem") continue;
      switch (action.action) {
        case "push": {
          const { itemId, value } = action.params as {
            itemId: string;
            value: number | string;
          };
          // Add new item at the top (push onto the end)
          acc.push({ id: itemId, value });
          break;
        }
        case "pop": {
          const { itemId } = action.params as { itemId: string };
          // Pop removes the current top item.
          // The backend must supply itemId matching the actual top; we still
          // defensively locate it by id and remove it if found.
          const idx = acc.findIndex((item) => item.id === itemId);
          if (idx >= 0) {
            acc.splice(idx, 1);
          }
          // If itemId was not the current top, the accumulated state may now
          // have a different top — that's fine; the backend's validation will
          // catch mismatches, and we stay safe by just removing whatever was found.
          break;
        }
        case "peek": {
          // Peek does not remove; we just note the action for highlighting.
          // No state change needed beyond what the highlight rendering below
          // will show.
          break;
        }
        case "highlight": {
          // General highlight — no state change.
          break;
        }
        default:
          break;
      }
    }
    return acc;
  }, [initialItems, actions]);

  // Highlight the item referenced by the most recent highlight/peek action,
  // if any. We look at the last such action in the current step's actions.
  const lastHighlight = useMemo(() => {
    for (let i = actions.length - 1; i >= 0; i--) {
      const a = actions[i];
      if (a.component !== "WorkbenchItem") continue;
      if (a.action === "highlight" || a.action === "peek") {
        const { itemId } = a.params as { itemId: string };
        return { action: a.action, itemId };
      }
    }
    return null;
  }, [actions]);

  // Render items top-to-bottom in SVG (visually top of stack at top).
  // We reverse so index 0 = top of stack, rendering downwards.
  const itemH = 36;
  const gap = 8;
  const startY = 40;
  const maxY = startY + items.length * (itemH + gap) + 20;
  const width = 200;
  const height = Math.max(maxY, 200);

  // Highlight color/style matching other scenes
  const highlightColor = sceneTokens.colors.highlight;
  const highlightStroke = sceneTokens.strokeWidths.node + 2;

  const itemShapes = items.map((item, i) => {
    // i = 0 is bottom in accumulated order; render top-to-bottom
    const reverseIdx = items.length - 1 - i;
    const y = startY + reverseIdx * (itemH + gap);
    const isHighlighted = lastHighlight?.itemId === item.id;

    return (
      <g key={`workbench-${item.id}`}>
        <motion.rect
          x={20}
          y={y}
          width={width - 40}
          height={itemH}
          rx={sceneTokens.radii.card / 2}
          fill={sceneTokens.colors.boxFill}
          stroke={isHighlighted ? highlightColor : sceneTokens.colors.boxStroke}
          strokeWidth={isHighlighted ? highlightStroke : sceneTokens.strokeWidths.box}
          whileHover={{ strokeWidth: (sceneTokens.strokeWidths.box + 2) * 1.5 }}
        />
        <text
          x={(width - 40) / 2}
          y={y + 18}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.text}
          fontSize={sceneTokens.fontSizes.small}
        >
          {String(item.value)}
        </text>
      </g>
    );
  });

  // Highlight overlay for the current step's highlight/peek action
  const highlightShapes = actions.map((action, i) => {
    if (action.component !== "WorkbenchItem") return null;
    if (action.action !== "highlight" && action.action !== "peek") return null;
    const { itemId } = action.params as { itemId: string };
    const item = items.find((it) => it.id === itemId);
    if (!item) return null;
    const reverseIdx = items.length - 1 - items.findIndex((it) => it.id === itemId);
    const y = startY + reverseIdx * (itemH + gap);
    return (
      <motion.rect
        key={`wh-highlight-${i}-${itemId}`}
        x={20}
        y={startY + reverseIdx * (itemH + gap)}
        width={width - 40}
        height={itemH}
        rx={sceneTokens.radii.card / 2}
        fill="rgba(255, 191, 36, 0.3)"
        stroke={highlightColor}
        strokeWidth={highlightStroke}
        strokeDasharray="4,4"
        transition={{ duration: 0.3 }}
      />
    );
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      {items.length === 0 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.muted}
          fontSize={sceneTokens.fontSizes.small}
        >
          (empty workbench)
        </text>
      )}

      {itemShapes}
      {highlightShapes}
    </svg>
  );
};