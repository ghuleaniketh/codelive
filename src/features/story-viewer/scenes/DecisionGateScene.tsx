import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

// Approximate glyph width for the medium font, used to wrap the condition text
// to fit inside the diamond instead of overflowing it.
const CHAR_WIDTH = sceneTokens.fontSizes.medium * 0.6;
const LINE_HEIGHT = 16;
const DIAMOND_WIDTH = 120;
const TEXT_AREA_WIDTH = DIAMOND_WIDTH - 16; // inner padding
const MAX_CHARS_PER_LINE = Math.max(6, Math.floor(TEXT_AREA_WIDTH / CHAR_WIDTH));

function wrapCondition(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= MAX_CHARS_PER_LINE) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    // Hard-break overly long single words so they never overflow a line.
    let chunk = word;
    while (chunk.length > MAX_CHARS_PER_LINE) {
      lines.push(chunk.slice(0, MAX_CHARS_PER_LINE));
      chunk = chunk.slice(MAX_CHARS_PER_LINE);
    }
    current = chunk;
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export const DecisionGateScene = ({
  condition,
  actions,
}: {
  condition: string;
  actions: SceneAction[];
}) => {
  const lines = wrapCondition(condition);
  const numLines = lines.length;
  const diamondHeight = Math.max(80, numLines * LINE_HEIGHT + 24);
  const cx = 60;
  const cy = diamondHeight / 2;
  const diamondPoints = `60 0, 120 ${cy}, 60 ${diamondHeight}, 0 ${cy}`;
  const viewBox = `0 0 200 ${diamondHeight}`;

  const textStartY = cy - ((numLines - 1) * LINE_HEIGHT) / 2;

  return (
    <svg
      viewBox={viewBox}
      width={200}
      height={diamondHeight}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      <g>
        <motion.polygon
          key="gate-shape"
          points={diamondPoints}
          fill={sceneTokens.colors.boxFill}
          stroke={sceneTokens.colors.boxStroke}
          strokeWidth={sceneTokens.strokeWidths.box}
          whileHover={{ fill: sceneTokens.colors.highlight }}
          whileTap={{ scale: 0.98 }}
        />
      </g>
      {actions.map((action, i) => {
        const { params } = action;
        if (action.component === "ConditionLabel" && action.action === "evaluate") {
          return (
            <motion.polygon
              key={`evaluate-${i}`}
              points={diamondPoints}
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
                x1={cx}
                y1={cy}
                x2={180}
                y2={cy}
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
                x1={cx}
                y1={cy}
                x2={0}
                y2={diamondHeight}
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
                x1={cx}
                y1={cy}
                x2={180}
                y2={cy}
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
                x1={cx}
                y1={cy}
                x2={0}
                y2={diamondHeight}
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
      <text
        x={cx}
        y={textStartY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={sceneTokens.colors.text}
        fontSize={sceneTokens.fontSizes.medium}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={cx} dy={i === 0 ? 0 : LINE_HEIGHT}>
            {line}
          </tspan>
        ))}
      </text>
    </svg>
  );
};
