import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

function wrapCondition(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    let chunk = word;
    while (chunk.length > maxCharsPerLine) {
      lines.push(chunk.slice(0, maxCharsPerLine));
      chunk = chunk.slice(maxCharsPerLine);
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
  // Determine text scale based on condition length to prevent diamond overflow
  const condLength = condition?.length ?? 0;
  const isLong = condLength > 24;
  const isVeryLong = condLength > 44;

  const fontSize = isVeryLong
    ? sceneTokens.typography.eyebrow.fontSize
    : isLong
    ? sceneTokens.typography.caption.fontSize
    : sceneTokens.typography.code.fontSize;
  const lineHeight = fontSize + 4;
  const maxChars = isVeryLong ? 18 : isLong ? 14 : 12;

  const lines = wrapCondition(condition || "", maxChars);
  const numLines = lines.length;

  // Diamond geometry scaled proportionally to text
  const diamondWidth = Math.max(160, Math.min(260, Math.max(...lines.map((l) => l.length)) * (fontSize * 0.65) + 60));
  const diamondHeight = Math.max(90, numLines * lineHeight + 44);
  const cx = diamondWidth / 2;
  const cy = diamondHeight / 2;

  const diamondPoints = `${cx} 0, ${diamondWidth} ${cy}, ${cx} ${diamondHeight}, 0 ${cy}`;

  // Paths layout: Right (True), Bottom (False)
  const rightPathEndX = diamondWidth + 60;
  const bottomPathEndY = diamondHeight + 36;
  const totalWidth = rightPathEndX + 20;
  const totalHeight = bottomPathEndY + 20;

  // Active evaluation state
  const isEvaluating = actions.some(
    (a) => a.component === "ConditionLabel" && a.action === "evaluate"
  );

  // Path taken status
  const pathTakenAction = actions.find(
    (a) => a.component === "PathTaken" && (a.action === "takePath" || a.action === "evaluate")
  );
  const isTrueTaken =
    pathTakenAction?.params?.taken === "true" || pathTakenAction?.params?.result === true;
  const isFalseTaken =
    pathTakenAction?.params?.taken === "false" || pathTakenAction?.params?.result === false;

  const textStartY = cy - ((numLines - 1) * lineHeight) / 2;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      width={totalWidth}
      height={totalHeight}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
      aria-label="Decision gate condition visualizer"
    >
      <defs>
        <marker id="dg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={sceneTokens.borders.contrast} />
        </marker>
        <marker id="dg-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={sceneTokens.status.active.stroke} />
        </marker>
      </defs>

      {/* True Path (Right) */}
      <line
        x1={diamondWidth}
        y1={cy}
        x2={rightPathEndX}
        y2={cy}
        stroke={isTrueTaken ? sceneTokens.status.success.stroke : sceneTokens.borders.contrast}
        strokeWidth={isTrueTaken ? sceneTokens.geometry.stroke.emphasis : sceneTokens.geometry.stroke.default}
        markerEnd={isTrueTaken ? "url(#dg-arrow-active)" : "url(#dg-arrow)"}
      />
      <text
        x={diamondWidth + 8}
        y={cy - 8}
        fill={isTrueTaken ? sceneTokens.status.success.glow : sceneTokens.text.muted}
        fontSize={sceneTokens.typography.eyebrow.fontSize}
        fontWeight={700}
      >
        TRUE
      </text>

      {/* False Path (Bottom) */}
      <line
        x1={cx}
        y1={diamondHeight}
        x2={cx}
        y2={bottomPathEndY}
        stroke={isFalseTaken ? sceneTokens.status.active.stroke : sceneTokens.borders.contrast}
        strokeWidth={isFalseTaken ? sceneTokens.geometry.stroke.emphasis : sceneTokens.geometry.stroke.default}
        markerEnd={isFalseTaken ? "url(#dg-arrow-active)" : "url(#dg-arrow)"}
      />
      <text
        x={cx + 8}
        y={diamondHeight + 20}
        fill={isFalseTaken ? sceneTokens.status.active.glow : sceneTokens.text.muted}
        fontSize={sceneTokens.typography.eyebrow.fontSize}
        fontWeight={700}
      >
        FALSE
      </text>

      {/* Diamond Gate */}
      <motion.polygon
        points={diamondPoints}
        fill={isEvaluating ? sceneTokens.status.active.fill : sceneTokens.surfaces.card}
        stroke={isEvaluating ? sceneTokens.status.active.stroke : sceneTokens.borders.contrast}
        strokeWidth={isEvaluating ? sceneTokens.geometry.stroke.emphasis : sceneTokens.geometry.stroke.default}
        transition={{ duration: sceneTokens.motion.step }}
      />

      {/* Wrapped Condition Text */}
      <text
        x={cx}
        y={textStartY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isEvaluating ? sceneTokens.status.active.glow : sceneTokens.text.primary}
        fontSize={fontSize}
        fontWeight={600}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={cx} dy={i === 0 ? 0 : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </svg>
  );
};
