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
  // Replay actions to accumulate stack state
  const items = useMemo(() => {
    const acc: AccItem[] = initialItems.map((n) => ({ ...n }));

    for (const action of actions) {
      if (action.component !== "WorkbenchItem") continue;
      switch (action.action) {
        case "push": {
          const { itemId, value } = action.params as {
            itemId: string;
            value: number | string;
          };
          acc.push({ id: itemId, value });
          break;
        }
        case "pop": {
          const { itemId } = action.params as { itemId: string };
          const idx = acc.findIndex((item) => item.id === itemId);
          if (idx >= 0) {
            acc.splice(idx, 1);
          }
          break;
        }
        default:
          break;
      }
    }
    return acc;
  }, [initialItems, actions]);

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

  const itemH = 38;
  const gap = sceneTokens.spacing[2];
  const startY = 36;
  const maxY = startY + items.length * (itemH + gap) + 24;
  const width = 220;
  const height = Math.max(maxY, 180);
  const boxX = 20;
  const boxWidth = width - 40;
  const centerX = width / 2; // Fixed text centering bug (boxX + boxWidth / 2 = 110)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
      aria-label="Workbench stack visualizer"
    >
      {items.length === 0 && (
        <text
          x={centerX}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.text.muted}
          fontSize={sceneTokens.typography.caption.fontSize}
        >
          (empty workbench)
        </text>
      )}

      {/* Stack base container indicator */}
      <line
        x1={boxX - 6}
        y1={startY + items.length * (itemH + gap) + 4}
        x2={boxX + boxWidth + 6}
        y2={startY + items.length * (itemH + gap) + 4}
        stroke={sceneTokens.borders.contrast}
        strokeWidth={sceneTokens.geometry.stroke.default}
      />

      {items.map((item, i) => {
        // Reverse so top of stack is visually at the top
        const reverseIdx = items.length - 1 - i;
        const y = startY + reverseIdx * (itemH + gap);
        const isHighlighted = lastHighlight?.itemId === item.id;

        const fill = isHighlighted
          ? sceneTokens.status.active.fill
          : sceneTokens.surfaces.card;
        const stroke = isHighlighted
          ? sceneTokens.status.active.stroke
          : sceneTokens.borders.contrast;
        const strokeWidth = isHighlighted
          ? sceneTokens.geometry.stroke.emphasis
          : sceneTokens.geometry.stroke.default;

        return (
          <g key={`workbench-${item.id}`}>
            <motion.rect
              x={boxX}
              y={y}
              width={boxWidth}
              height={itemH}
              rx={sceneTokens.radii.md}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              transition={{ duration: sceneTokens.motion.step }}
            />
            {/* Value label placed at true geometric center */}
            <text
              x={centerX}
              y={y + itemH / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isHighlighted ? sceneTokens.status.active.glow : sceneTokens.text.primary}
              fontSize={sceneTokens.typography.code.fontSize}
              fontWeight={600}
            >
              {String(item.value)}
            </text>

            {/* TOP indicator for topmost element */}
            {reverseIdx === 0 && (
              <text
                x={boxX + boxWidth + 8}
                y={y + itemH / 2}
                textAnchor="start"
                dominantBaseline="middle"
                fill={sceneTokens.status.mutated.glow}
                fontSize={sceneTokens.typography.eyebrow.fontSize}
                fontWeight={700}
              >
                ← TOP
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};