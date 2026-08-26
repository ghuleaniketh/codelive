import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

export const DecisionGateScene = ({
  condition,
  actions,
}: {
  condition: string;
  actions: SceneAction[];
}) => {
  const gateWidth = 120;
  const gateHeight = 80;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <g>
        <motion.polygon
          key="gate-shape"
          points={`60 0, 120 40, 60 80, 0 40`}
          fill={sceneTokens.colors.boxFill}
          stroke={sceneTokens.colors.boxStroke}
          strokeWidth={sceneTokens.strokeWidths.box}
          whileHover={{ fill: sceneTokens.colors.highlight }}
          whileTap={{ scale: 0.98 }}
        />
        <motion.text
          key="gate-text"
          x="60"
          y="40"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.text}
          fontSize={sceneTokens.fontSizes.medium}
        >
          {condition}
        </motion.text>
      </g>
      {actions.map((action, i) => {
        const { params } = action;
        if (action.component === "ConditionLabel" && action.action === "evaluate") {
          return (
            <motion.polygon
              key={`evaluate-${i}`}
              points={`60 0, 120 40, 60 80, 0 40`}
              fill={sceneTokens.colors.boxFill}
              stroke={sceneTokens.colors.highlight}
              strokeWidth={sceneTokens.strokeWidths.box + 2}
              transition={{ duration: 0.3 }}
            />
          );
        }
        if (action.component === "PathTaken" && action.action === "takePath") {
          const taken = params.taken;
          if (taken === "true") {
            return (
              <motion.line
                key={`true-path-${i}`}
                x1={60}
                y1={40}
                x2={180}
                y2={40}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.edge + 2}
                strokeLinecap="round"
                transition={{ duration: 0.3 }}
              />
            );
          } else {
            return (
              <motion.line
                key={`false-path-${i}`}
                x1={60}
                y1={40}
                x2={0}
                y2={80}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.edge + 2}
                strokeLinecap="round"
                transition={{ duration: 0.3 }}
              />
            );
          }
        }
        if (action.component === "PathTaken" && action.action === "evaluate") {
          if (params?.result === true) {
            return (
              <motion.line
                key={`eval-true-${i}`}
                x1={60}
                y1={40}
                x2={180}
                y2={40}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.edge + 2}
                strokeDasharray="5, 5"
                transition={{ duration: 0.3 }}
              />
            );
          } else {
            return (
              <motion.line
                key={`eval-false-${i}`}
                x1={60}
                y1={40}
                x2={0}
                y2={80}
                stroke={sceneTokens.colors.highlight}
                strokeWidth={sceneTokens.strokeWidths.edge + 2}
                strokeDasharray="5, 5"
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