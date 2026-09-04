import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

type CallFrame = { id: string; label: string; depth: number; returnValue?: unknown };

export const RecursionStairsScene = ({
  initialFrames,
  actions,
}: {
  initialFrames: CallFrame[];
  actions: SceneAction[];
}) => {
  const { frames, backtrackedIds } = useMemo(() => {
    const stack = initialFrames.map((frame) => ({ ...frame }));
    const backtracked = new Set<string>();

    for (const action of actions) {
      if (action.component !== "CallFrame") continue;
      if (action.action === "pushFrame") {
        if (!stack.some((frame) => frame.id === action.params.frameId)) {
          stack.push({
            id: action.params.frameId,
            label: action.params.label,
            depth: action.params.depth,
          });
        }
        backtracked.delete(action.params.frameId);
      } else if (action.action === "returnValue") {
        const frame = stack.find((entry) => entry.id === action.params.frameId);
        if (frame) frame.returnValue = action.params.value;
      } else if (action.action === "backtrack") {
        backtracked.add(action.params.frameId);
      } else if (action.action === "popFrame") {
        const index = stack.findIndex((frame) => frame.id === action.params.frameId);
        if (index >= 0) stack.splice(index, 1);
      }
    }

    return { frames: stack.sort((a, b) => a.depth - b.depth), backtrackedIds: backtracked };
  }, [initialFrames, actions]);

  const stepHeight = 60;
  const height = Math.max(160, (Math.max(-1, ...frames.map((frame) => frame.depth)) + 1) * stepHeight + 70);

  return (
    <svg
      viewBox={`0 0 430 ${height}`}
      width={430}
      height={height}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
      aria-label="Recursion call stack stairs"
    >
      <text
        x="30"
        y="26"
        fill={sceneTokens.text.muted}
        fontSize={sceneTokens.typography.eyebrow.fontSize}
        fontWeight={700}
      >
        ROOT CALL
      </text>

      {frames.length === 0 && (
        <text
          x="215"
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.text.muted}
          fontSize={sceneTokens.typography.caption.fontSize}
        >
          call stack is empty
        </text>
      )}

      <AnimatePresence initial={false}>
        {frames.map((frame) => {
          const isBacktracking = backtrackedIds.has(frame.id);
          const y = 40 + frame.depth * stepHeight;
          const x = 30 + frame.depth * 22;
          const width = 360 - frame.depth * 22;

          const fill = isBacktracking
            ? sceneTokens.status.backtrack.fill
            : sceneTokens.surfaces.card;
          const stroke = isBacktracking
            ? sceneTokens.status.backtrack.stroke
            : sceneTokens.borders.contrast;
          const strokeWidth = isBacktracking
            ? sceneTokens.geometry.stroke.emphasis
            : sceneTokens.geometry.stroke.default;

          return (
            <motion.g
              key={frame.id}
              initial={{ opacity: 0, y: y - 20 }}
              animate={{ opacity: 1, y }}
              exit={{ opacity: 0, x: 44, transition: { duration: sceneTokens.motion.step } }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
              <rect
                x={x}
                y="0"
                width={Math.max(160, width)}
                height="46"
                rx={sceneTokens.radii.md}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
              <text
                x={x + 16}
                y="23"
                dominantBaseline="middle"
                fill={isBacktracking ? sceneTokens.status.backtrack.glow : sceneTokens.text.primary}
                fontSize={sceneTokens.typography.code.fontSize}
                fontWeight={700}
                textDecoration={isBacktracking ? "line-through" : undefined}
              >
                {frame.label}
              </text>
              <text
                x={x + Math.max(160, width) - 14}
                y="23"
                textAnchor="end"
                dominantBaseline="middle"
                fill={isBacktracking ? sceneTokens.status.backtrack.glow : sceneTokens.text.muted}
                fontSize={sceneTokens.typography.caption.fontSize}
                fontWeight={600}
              >
                {isBacktracking
                  ? "backtrack"
                  : frame.returnValue !== undefined
                  ? `returns ${String(frame.returnValue)}`
                  : `depth ${frame.depth}`}
              </text>
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
};
