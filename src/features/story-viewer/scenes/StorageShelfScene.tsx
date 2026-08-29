import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

export const StorageShelfScene = ({
  initialSlots,
  actions,
}: {
  initialSlots: Array<{ key: string; value: unknown | null }>;
  actions: SceneAction[];
}) => {
  const slotShapes = initialSlots.map((slot, index) => {
    const bx = index * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap);
    const by = 40;
    return (
      <motion.rect
        key={slot.key}
        x={bx}
        y={by}
        width={sceneTokens.spacing.boxWidth}
        height={sceneTokens.spacing.boxHeight}
        fill={slot.value === null ? "#f1f5f9" : sceneTokens.colors.boxFill}
        stroke={sceneTokens.colors.boxStroke}
        strokeWidth={sceneTokens.strokeWidths.box}
        whileHover={{ strokeWidth: sceneTokens.strokeWidths.box + 2 }}
      />
    );
  });

  const slotLabels = initialSlots.map((slot, index) => {
    const bx = index * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap);
    const by = 40;
    return (
      <g key={`label-${slot.key}`}>
        <text
          x={bx + sceneTokens.spacing.boxWidth / 2}
          y={by + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.text}
          fontSize={sceneTokens.fontSizes.medium}
        >
          {slot.key}
        </text>
        {slot.value !== null && (
          <text
            x={bx + sceneTokens.spacing.boxWidth - 10}
            y={by + 30}
            textAnchor="end"
            dominantBaseline="middle"
            fill={sceneTokens.colors.text}
            fontSize={sceneTokens.fontSizes.small}
          >
            {String(slot.value)}
          </text>
        )}
      </g>
    );
  });

  const shelfWidth = initialSlots.length * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap);
  const shelfHeight = 40 + sceneTokens.spacing.boxHeight + 20;
  const shelfViewBox = `0 0 ${shelfWidth} ${shelfHeight}`;

  return (
    <svg
      viewBox={shelfViewBox}
      width={shelfWidth}
      height={shelfHeight}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      {slotShapes}
      {actions.map((action, i) => {
        if (action.component === "Slot" && action.action === "insert") {
          const { params } = action;
          const slot = initialSlots.find((s) => s.key === params.key);
          if (slot) {
            const idx = initialSlots.indexOf(slot);
            return (
              <motion.rect
                key={`insert-${i}-${slot.key}`}
                x={idx * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap)}
                y={40}
                width={sceneTokens.spacing.boxWidth}
                height={sceneTokens.spacing.boxHeight}
                fill={sceneTokens.colors.highlight}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.box + 2}
                transition={{ duration: 0.3 }}
              />
            );
          }
        }
        if (action.component === "Slot" && action.action === "lookup") {
          const { params } = action;
          const slot = initialSlots.find((s) => s.key === params.key);
          if (slot) {
            const idx = initialSlots.indexOf(slot);
            return (
              <motion.rect
                key={`lookup-${i}-${slot.key}`}
                x={idx * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap)}
                y={40}
                width={sceneTokens.spacing.boxWidth}
                height={sceneTokens.spacing.boxHeight}
                fill={sceneTokens.colors.highlight}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.box + 2}
                transition={{ duration: 0.3 }}
              />
            );
          }
        }
        if (action.component === "Slot" && action.action === "highlight") {
          const { params } = action;
          const slot = initialSlots.find((s) => s.key === params.key);
          if (slot) {
            const idx = initialSlots.indexOf(slot);
            return (
              <motion.rect
                key={`highlight-${i}-${slot.key}`}
                x={idx * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap)}
                y={40}
                width={sceneTokens.spacing.boxWidth}
                height={sceneTokens.spacing.boxHeight}
                fill={sceneTokens.colors.highlight}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.box + 2}
                transition={{ duration: 0.3 }}
              />
            );
          }
        }
        return null;
      })}
      {slotLabels}
    </svg>
  );
};