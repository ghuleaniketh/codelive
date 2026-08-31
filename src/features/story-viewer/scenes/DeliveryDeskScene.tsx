import { useMemo } from "react";
import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

type SearchItem = { id: string; value: number };

export const DeliveryDeskScene = ({
  initialArray,
  actions,
}: {
  initialArray: SearchItem[];
  actions: SceneAction[];
}) => {
  // Search state is the accumulated prefix: every range restriction remains in
  // effect until a later narrowRange replaces it, so Prev/Next is deterministic.
  const { checkedIndex, range, foundIndex, exhausted } = useMemo(() => {
    let checked: number | null = null;
    let activeRange: [number, number] = [0, initialArray.length - 1];
    let found: number | null = null;
    let isExhausted = false;

    for (const action of actions) {
      if (action.component !== "SearchItem") continue;
      if (action.action === "checkIndex") {
        checked = action.params.index;
      } else if (action.action === "narrowRange") {
        activeRange = [action.params.low, action.params.high];
      } else if (action.action === "found") {
        found = action.params.index;
        isExhausted = false;
      } else if (action.action === "exhausted") {
        isExhausted = true;
        found = null;
        checked = null;
      }
    }

    return { checkedIndex: checked, range: activeRange, foundIndex: found, exhausted: isExhausted };
  }, [initialArray.length, actions]);

  const boxWidth = 62;
  const gap = 14;
  const width = Math.max(340, initialArray.length * (boxWidth + gap) + 36);

  return (
    <svg viewBox={`0 0 ${width} 150`} width={width} height={150} style={{ display: "block", maxWidth: "100%", height: "auto" }} aria-label="Delivery desk binary search">
      <text x="18" y="23" fill={sceneTokens.colors.muted} fontSize="11" fontWeight="700">SEARCH RANGE: {exhausted ? "none" : `${range[0]}–${range[1]}`}</text>
      {initialArray.map((item, index) => {
        const eliminated = exhausted || index < range[0] || index > range[1];
        const found = foundIndex === index;
        const checked = checkedIndex === index && !found;
        const fill = found ? "#86efac" : checked ? "#fbbf24" : eliminated ? "#e2e8f0" : sceneTokens.colors.boxFill;
        const stroke = found ? "#16a34a" : checked ? "#d97706" : eliminated ? "#cbd5e1" : sceneTokens.colors.boxStroke;
        const x = 18 + index * (boxWidth + gap);
        return (
          <motion.g key={item.id} animate={{ opacity: eliminated ? 0.42 : 1 }} transition={{ duration: 0.25 }}>
            <rect x={x} y="55" width={boxWidth} height="45" rx="9" fill={fill} stroke={stroke} strokeWidth={found || checked ? 3 : sceneTokens.strokeWidths.box} />
            <text x={x + boxWidth / 2} y="77" textAnchor="middle" dominantBaseline="middle" fill={sceneTokens.colors.text} fontSize={sceneTokens.fontSizes.medium} fontWeight="700">{item.value}</text>
            <text x={x + boxWidth / 2} y="119" textAnchor="middle" fill={sceneTokens.colors.muted} fontSize="10">index {index}</text>
          </motion.g>
        );
      })}
      {exhausted && <g><rect x={width / 2 - 82} y="126" width="164" height="20" rx="9" fill="#fee2e2" stroke="#ef4444" /><text x={width / 2} y="137" textAnchor="middle" dominantBaseline="middle" fill="#b91c1c" fontSize="11" fontWeight="700">not found — search exhausted</text></g>}
    </svg>
  );
};
