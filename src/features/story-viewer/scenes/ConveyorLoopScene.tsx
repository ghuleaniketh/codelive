import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

type QueueItem = { id: string; value: number };

export const ConveyorLoopScene = ({
  initialItems,
  actions,
}: {
  initialItems: QueueItem[];
  actions: SceneAction[];
}) => {
  const { items, highlightedId } = useMemo(() => {
    const queue = initialItems.map((item) => ({ ...item }));
    let highlighted: string | null = null;

    for (const action of actions) {
      if (action.component !== "QueueItem") continue;
      if (action.action === "enqueue") {
        if (!queue.some((item) => item.id === action.params.itemId)) {
          queue.push({ id: action.params.itemId, value: action.params.value });
        }
      } else if (action.action === "dequeue") {
        const index = queue.findIndex((item) => item.id === action.params.itemId);
        if (index >= 0) queue.splice(index, 1);
        if (highlighted === action.params.itemId) highlighted = null;
      } else if (action.action === "highlight") {
        highlighted = action.params.itemId;
      }
    }
    return { items: queue, highlightedId: highlighted };
  }, [initialItems, actions]);

  const boxWidth = sceneTokens.geometry.box.width;
  const boxHeight = sceneTokens.geometry.box.height;
  const gap = 84;
  const width = Math.max(320, items.length * gap + 100);

  return (
    <svg
      viewBox={`0 0 ${width} 150`}
      width={width}
      height={150}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
      aria-label="Queue conveyor loop"
    >
      {/* Track base */}
      <rect
        x="24"
        y="52"
        width={width - 48}
        height="60"
        rx="30"
        fill={sceneTokens.surfaces.subtle}
        stroke={sceneTokens.borders.subtle}
        strokeWidth={sceneTokens.geometry.stroke.default}
      />
      {/* Midline dashed conveyor belt */}
      <path
        d={`M 36 82 H ${width - 36}`}
        stroke={sceneTokens.borders.contrast}
        strokeWidth={sceneTokens.geometry.stroke.subtle}
        strokeDasharray="6 6"
      />

      <text
        x="32"
        y="34"
        fill={sceneTokens.text.muted}
        fontSize={sceneTokens.typography.eyebrow.fontSize}
        fontWeight={700}
      >
        FRONT
      </text>
      <text
        x={width - 32}
        y="34"
        textAnchor="end"
        fill={sceneTokens.text.muted}
        fontSize={sceneTokens.typography.eyebrow.fontSize}
        fontWeight={700}
      >
        BACK
      </text>

      {items.length === 0 && (
        <text
          x={width / 2}
          y="84"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.text.muted}
          fontSize={sceneTokens.typography.caption.fontSize}
        >
          queue is empty
        </text>
      )}

      <AnimatePresence initial={false}>
        {items.map((item, index) => {
          const highlighted = highlightedId === item.id;
          return (
            <motion.g
              key={item.id}
              initial={{ opacity: 0, x: items.length * gap + 40 }}
              animate={{ opacity: 1, x: index * gap }}
              exit={{ opacity: 0, x: -80, transition: { duration: sceneTokens.motion.step } }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
              <rect
                x="40"
                y="61"
                width={boxWidth}
                height={boxHeight}
                rx={sceneTokens.radii.md}
                fill={highlighted ? sceneTokens.status.active.fill : sceneTokens.surfaces.card}
                stroke={highlighted ? sceneTokens.status.active.stroke : sceneTokens.borders.contrast}
                strokeWidth={highlighted ? sceneTokens.geometry.stroke.emphasis : sceneTokens.geometry.stroke.default}
              />
              <text
                x={40 + boxWidth / 2}
                y={61 + boxHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={highlighted ? sceneTokens.status.active.glow : sceneTokens.text.primary}
                fontWeight={700}
                fontSize={sceneTokens.typography.code.fontSize}
              >
                {item.value}
              </text>
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
};
