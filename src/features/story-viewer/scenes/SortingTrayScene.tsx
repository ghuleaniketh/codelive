import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

const trayViewBox = "0 0 500 100";

export const SortingTrayScene = ({
  initialArray,
  actions,
}: {
  initialArray: Array<{ id: string; value: number }>;
  actions: SceneAction[];
}) => {
  const boxShapes = initialArray.map((item, index) => {
    const bx = index * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap);
    const by = 40;
    return (
      <motion.rect
        key={item.id}
        x={bx}
        y={by}
        width={sceneTokens.spacing.boxWidth}
        height={sceneTokens.spacing.boxHeight}
        fill={sceneTokens.colors.boxFill}
        stroke={sceneTokens.colors.boxStroke}
        strokeWidth={sceneTokens.strokeWidths.box}
        whileHover={{ strokeWidth: sceneTokens.strokeWidths.box + 2 }}
        whileTap={{ scale: 0.95 }}
      />
    );
  });

  const boxLabels = initialArray.map((item, index) => {
    const bx = index * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap);
    const by = 40;
    return (
      <text
        key={`label-${item.id}`}
        x={bx + sceneTokens.spacing.boxWidth / 2}
        y={by + sceneTokens.spacing.boxHeight / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={sceneTokens.colors.text}
        fontSize={sceneTokens.fontSizes.medium}
      >
        {item.value}
      </text>
    );
  });

  const actionElements = actions.map((action, i) => {
    if (action.component === "Box" && action.action === "compare") {
      const { params } = action;
      const box1 = initialArray.find((a) => a.id === params.box1Id);
      const box2 = initialArray.find((a) => a.id === params.box2Id);
      if (box1 && box2) {
        const idx1 = initialArray.indexOf(box1);
        const idx2 = initialArray.indexOf(box2);
        return (
          <motion.rect
            key={`compare-${i}-${box1.id}-${box2.id}`}
            x={idx1 * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap)}
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
    if (action.component === "Box" && action.action === "swap") {
      const { params } = action;
      const box1 = initialArray.find((a) => a.id === params.box1Id);
      const box2 = initialArray.find((a) => a.id === params.box2Id);
      if (box1 && box2) {
        const idx1 = initialArray.indexOf(box1);
        const idx2 = initialArray.indexOf(box2);
        return (
          <motion.rect
            key={`swap-${i}-${box1.id}-${box2.id}`}
            x={idx2 * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap)}
            y={40}
            width={sceneTokens.spacing.boxWidth}
            height={sceneTokens.spacing.boxHeight}
            fill={sceneTokens.colors.boxFill}
            stroke={sceneTokens.colors.boxStroke}
            strokeWidth={sceneTokens.strokeWidths.box}
            transition={{ duration: 0.4 }}
          />
        );
      }
    }
    if (action.component === "Box" && action.action === "highlight") {
      const { params } = action;
      const box = initialArray.find((a) => a.id === params.boxId);
      if (box) {
        const idx = initialArray.indexOf(box);
        return (
          <motion.rect
            key={`highlight-${i}-${box.id}`}
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
    if (action.component === "Box" && action.action === "setPointer") {
      const { params } = action;
      const box = initialArray.find((a) => a.id === params.boxId);
      if (box) {
        const idx = initialArray.indexOf(box);
        const centerX = idx * (sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap) + sceneTokens.spacing.boxWidth / 2;
        return (
          <text
            x={centerX}
            y={75}
            textAnchor="middle"
            fill={sceneTokens.colors.text}
            fontSize={sceneTokens.fontSizes.small}
          >
            {String(params.label || "")}
          </text>
        );
      }
    }
    return null;
  });

  return (
    <svg
      viewBox={trayViewBox}
      width={500}
      height={100}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      {boxShapes}
      {actionElements}
      {boxLabels}
    </svg>
  );
};