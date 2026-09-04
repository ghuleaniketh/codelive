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

  const boxWidth = sceneTokens.geometry.box.width;
  const boxHeight = sceneTokens.geometry.box.height;
  const gap = sceneTokens.spacing[3];
  const marginX = sceneTokens.spacing[5];
  const width = Math.max(340, initialArray.length * (boxWidth + gap) + marginX * 2);

  return (
    <svg
      viewBox={`0 0 ${width} 150`}
      width={width}
      height={150}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
      aria-label="Delivery desk binary search"
    >
      <text
        x={marginX}
        y="24"
        fill={sceneTokens.text.muted}
        fontSize={sceneTokens.typography.eyebrow.fontSize}
        fontWeight={700}
      >
        SEARCH RANGE: {exhausted ? "none" : `${range[0]} – ${range[1]}`}
      </text>

      {initialArray.map((item, index) => {
        const eliminated = exhausted || index < range[0] || index > range[1];
        const found = foundIndex === index;
        const checked = checkedIndex === index && !found;

        const fill = found
          ? sceneTokens.status.success.fill
          : checked
          ? sceneTokens.status.active.fill
          : eliminated
          ? sceneTokens.status.eliminated.fill
          : sceneTokens.surfaces.card;

        const stroke = found
          ? sceneTokens.status.success.stroke
          : checked
          ? sceneTokens.status.active.stroke
          : eliminated
          ? sceneTokens.borders.subtle
          : sceneTokens.borders.contrast;

        const strokeWidth = found || checked
          ? sceneTokens.geometry.stroke.emphasis
          : sceneTokens.geometry.stroke.default;

        const x = marginX + index * (boxWidth + gap);

        return (
          <motion.g
            key={item.id}
            animate={{ opacity: eliminated ? 0.45 : 1 }}
            transition={{ duration: sceneTokens.motion.step }}
          >
            <rect
              x={x}
              y="50"
              width={boxWidth}
              height={boxHeight}
              rx={sceneTokens.radii.md}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            <text
              x={x + boxWidth / 2}
              y={50 + boxHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={
                found
                  ? sceneTokens.status.success.glow
                  : checked
                  ? sceneTokens.status.active.glow
                  : sceneTokens.text.primary
              }
              fontSize={sceneTokens.typography.code.fontSize}
              fontWeight={700}
            >
              {item.value}
            </text>
            <text
              x={x + boxWidth / 2}
              y={50 + boxHeight + 18}
              textAnchor="middle"
              fill={sceneTokens.text.muted}
              fontSize={sceneTokens.typography.eyebrow.fontSize}
            >
              idx {index}
            </text>
          </motion.g>
        );
      })}

      {exhausted && (
        <g>
          <rect
            x={width / 2 - 100}
            y="118"
            width="200"
            height="24"
            rx={sceneTokens.radii.sm}
            fill={sceneTokens.status.exhausted.fill}
            stroke={sceneTokens.status.exhausted.stroke}
            strokeWidth={sceneTokens.geometry.stroke.subtle}
          />
          <text
            x={width / 2}
            y="130"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={sceneTokens.status.exhausted.glow}
            fontSize={sceneTokens.typography.eyebrow.fontSize}
            fontWeight={700}
          >
            not found — search exhausted
          </text>
        </g>
      )}
    </svg>
  );
};
