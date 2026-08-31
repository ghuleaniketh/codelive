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
  // Frames are replayed from the seed on every step. We deliberately show every
  // frame still in accumulated state, even if a partial unwind looks irregular.
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

  const stepHeight = 68;
  const height = Math.max(150, (Math.max(-1, ...frames.map((frame) => frame.depth)) + 1) * stepHeight + 70);

  return (
    <svg viewBox={`0 0 430 ${height}`} width={430} height={height} style={{ display: "block", maxWidth: "100%", height: "auto" }} aria-label="Recursion call stack">
      <text x="30" y="27" fill={sceneTokens.colors.muted} fontSize="11" fontWeight="700">ROOT CALL</text>
      {frames.length === 0 && <text x="215" y={height / 2} textAnchor="middle" fill={sceneTokens.colors.muted} fontSize={sceneTokens.fontSizes.small}>call stack is empty</text>}
      <AnimatePresence initial={false}>
        {frames.map((frame) => {
          const isBacktracking = backtrackedIds.has(frame.id);
          const y = 42 + frame.depth * stepHeight;
          const x = 30 + frame.depth * 24;
          const width = 350 - frame.depth * 24;
          return (
            <motion.g
              key={frame.id}
              initial={{ opacity: 0, y: y - 22 }}
              animate={{ opacity: 1, y }}
              exit={{ opacity: 0, x: 46, transition: { duration: 0.32 } }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
              <rect x={x} y="0" width={Math.max(155, width)} height="48" rx="10" fill={isBacktracking ? "#ffedd5" : sceneTokens.colors.boxFill} stroke={isBacktracking ? "#ea580c" : sceneTokens.colors.boxStroke} strokeWidth={isBacktracking ? 3 : sceneTokens.strokeWidths.box} />
              <text x={x + 16} y="24" dominantBaseline="middle" fill={sceneTokens.colors.text} fontSize={sceneTokens.fontSizes.medium} fontWeight="700" textDecoration={isBacktracking ? "line-through" : undefined}>{frame.label}</text>
              <text x={x + Math.max(155, width) - 14} y="24" textAnchor="end" dominantBaseline="middle" fill={isBacktracking ? "#c2410c" : sceneTokens.colors.muted} fontSize="11" fontWeight="700">{isBacktracking ? "backtrack" : frame.returnValue !== undefined ? `returns ${String(frame.returnValue)}` : `depth ${frame.depth}`}</text>
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
};
