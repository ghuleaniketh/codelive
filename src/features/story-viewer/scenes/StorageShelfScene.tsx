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
  const slots = initialSlots.map((slot, index) => (
    <motion.rect
      key={slot.key}
      x={index * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap)}
      y={40}
      width={sceneTokens.spacing.boxWidth}
      height={sceneTokens.spacing.boxHeight}
      fill={slot.value === null ? "#f1f5f9" : sceneTokens.colors.boxFill}
      stroke={sceneTokens.colors.boxStroke}
      strokeWidth={sceneTokens.strokeWidths.box}
      whileHover={{ strokeWidth: sceneTokens.strokeWidths.box + 2 }}
    >
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={sceneTokens.colors.text}
        fontSize={sceneTokens.fontSizes.medium}
>
        {slot.key}
      </motion.text>
      {slot.value !== null && (
        <motion.text
          x={sceneTokens.spacing.boxWidth - 10}
          y={sceneTokens.spacing.boxHeight / 2}
          textAnchor="end"
          dominantBaseline="middle"
          fill={sceneTokens.colors.text}
          fontSize={sceneTokens.fontSizes.small}
        >
          {String(slot.value)}
        </motion.text>
      )}
    </motion.rect>
  ));

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {slots}
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
    </div>
  );
};