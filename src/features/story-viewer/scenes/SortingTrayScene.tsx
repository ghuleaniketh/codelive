import { useMemo } from "react";
import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

export const SortingTrayScene = ({
  initialArray,
  actions,
  state,
}: {
  initialArray: Array<{ id: string; value: number }>;
  actions: SceneAction[];
  state?: Record<string, string | number | boolean>;
}) => {
  // Replay swap actions from steps 0..current so array order accumulates
  const currentArray = useMemo(() => {
    const arr = initialArray.map((item) => ({ ...item }));
    for (const action of actions) {
      if (action.component === "Box" && action.action === "swap") {
        const { box1Id, box2Id } = action.params as { box1Id: string; box2Id: string };
        const idx1 = arr.findIndex((a) => a.id === String(box1Id));
        const idx2 = arr.findIndex((a) => a.id === String(box2Id));
        if (idx1 >= 0 && idx2 >= 0) {
          const temp = arr[idx1];
          arr[idx1] = arr[idx2];
          arr[idx2] = temp;
        }
      }
    }
    return arr;
  }, [initialArray, actions]);

  // Identify active comparison IDs (highlights both box1Id and box2Id)
  const comparedIds = useMemo(() => {
    const set = new Set<string>();
    for (const action of actions) {
      if (action.component === "Box" && action.action === "compare") {
        const { box1Id, box2Id } = action.params as { box1Id: string; box2Id: string };
        if (box1Id != null) set.add(String(box1Id));
        if (box2Id != null) set.add(String(box2Id));
      }
    }
    return set;
  }, [actions]);

  // Identify general highlight IDs
  const highlightedIds = useMemo(() => {
    const set = new Set<string>();
    for (const action of actions) {
      if (action.component === "Box" && action.action === "highlight") {
        const { boxId } = action.params as { boxId: string };
        if (boxId != null) set.add(String(boxId));
      }
    }
    return set;
  }, [actions]);

  // Pointer labels map: boxId -> label (from setPointer actions)
  const pointers = useMemo(() => {
    const map = new Map<string, string>();
    for (const action of actions) {
      if (action.component === "Box" && action.action === "setPointer") {
        const { boxId, label } = action.params as { boxId: string; label: string };
        if (boxId != null && label != null) {
          map.set(String(boxId), String(label));
        }
      }
    }
    return map;
  }, [actions]);

  // Derive current loop index pointer from state (e.g. state.j)
  const statePointerIndex = useMemo(() => {
    if (state == null) return undefined;
    const j = state["j"];
    if (j == null) return undefined;
    return Number(j);
  }, [state]);

  const boxWidth = sceneTokens.geometry.box.width;
  const boxHeight = sceneTokens.geometry.box.height;
  const gap = sceneTokens.spacing[3];
  const stride = boxWidth + gap;
  const marginX = sceneTokens.spacing[5];
  const boxY = 28;
  const width = Math.max(currentArray.length * stride + marginX * 2, 340);
  const height = 110;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
      aria-label="Sorting tray visualizer"
    >
      {currentArray.map((item, index) => {
        const targetX = marginX + index * stride;
        const isCompared = comparedIds.has(item.id);
        const isHighlighted = highlightedIds.has(item.id);
        const pointerLabel = pointers.get(item.id);

        const fill = isCompared || isHighlighted
          ? sceneTokens.status.active.fill
          : sceneTokens.surfaces.card;
        const stroke = isCompared
          ? sceneTokens.status.active.stroke
          : isHighlighted
          ? sceneTokens.status.active.glow
          : sceneTokens.borders.contrast;
        const strokeWidth = isCompared || isHighlighted
          ? sceneTokens.geometry.stroke.emphasis
          : sceneTokens.geometry.stroke.default;

        return (
          <motion.g
            key={item.id}
            initial={false}
            animate={{ x: targetX }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
              duration: sceneTokens.motion.step,
            }}
          >
            {/* Box slot */}
            <rect
              x={0}
              y={boxY}
              width={boxWidth}
              height={boxHeight}
              rx={sceneTokens.radii.md}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />

            {/* Value label */}
            <text
              x={boxWidth / 2}
              y={boxY + boxHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isCompared || isHighlighted ? sceneTokens.status.active.glow : sceneTokens.text.primary}
              fontSize={sceneTokens.typography.code.fontSize}
              fontWeight={600}
            >
              {item.value}
            </text>

            {/* Index label above box */}
            <text
              x={boxWidth / 2}
              y={boxY - 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={sceneTokens.text.muted}
              fontSize={sceneTokens.typography.eyebrow.fontSize}
              fontWeight={sceneTokens.typography.eyebrow.fontWeight}
            >
              [{index}]
            </text>

            {/* Pointer below box if set */}
            {/* Pointer below box if set (from setPointer actions) */}
            {pointerLabel && (
              <g>
                <text
                  x={boxWidth / 2}
                  y={boxY + boxHeight + 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={sceneTokens.status.mutated.glow}
                  fontSize={sceneTokens.typography.caption.fontSize}
                  fontWeight={600}
                >
                  ↑ {pointerLabel}
                </text>
              </g>
            )}

            {/* State-derived pointer: show "↑ j" at the current loop index */}
            {statePointerIndex !== undefined && index === statePointerIndex && (
              <g>
                <text
                  x={boxWidth / 2}
                  y={boxY + boxHeight + 20}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={sceneTokens.status.mutated.glow}
                  fontSize={sceneTokens.typography.caption.fontSize}
                  fontWeight={600}
                >
                  ↑ j
                </text>
              </g>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
};
