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
  // Rebuild queue state from its seed plus every action in the current story prefix.
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

  const gap = 90;
  const width = Math.max(300, items.length * gap + 96);

  return (
    <svg viewBox={`0 0 ${width} 150`} width={width} height={150} style={{ display: "block", maxWidth: "100%", height: "auto" }} aria-label="Queue conveyor loop">
      <rect x="25" y="55" width={width - 50} height="56" rx="28" fill="#e2e8f0" stroke={sceneTokens.colors.connector} strokeWidth="2" />
      <path d={`M 36 83 H ${width - 42}`} stroke="#94a3b8" strokeWidth="2" strokeDasharray="7 7" />
      <text x="32" y="35" fill={sceneTokens.colors.muted} fontSize="11" fontWeight="700">FRONT</text>
      <text x={width - 32} y="35" textAnchor="end" fill={sceneTokens.colors.muted} fontSize="11" fontWeight="700">BACK</text>
      {items.length === 0 && <text x={width / 2} y="88" textAnchor="middle" dominantBaseline="middle" fill={sceneTokens.colors.muted} fontSize={sceneTokens.fontSizes.small}>queue is empty</text>}
      <AnimatePresence initial={false}>
        {items.map((item, index) => {
          const highlighted = highlightedId === item.id;
          return (
            <motion.g
              key={item.id}
              initial={{ opacity: 0, x: items.length * gap + 60 }}
              animate={{ opacity: 1, x: index * gap }}
              exit={{ opacity: 0, x: -90, transition: { duration: 0.35 } }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <rect x="42" y="63" width="68" height="40" rx="10" fill={highlighted ? "#fbbf24" : sceneTokens.colors.boxFill} stroke={highlighted ? "#d97706" : sceneTokens.colors.boxStroke} strokeWidth={highlighted ? 3 : sceneTokens.strokeWidths.box} />
              <text x="76" y="83" textAnchor="middle" dominantBaseline="middle" fill={sceneTokens.colors.text} fontWeight="700" fontSize={sceneTokens.fontSizes.medium}>{item.value}</text>
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
};
