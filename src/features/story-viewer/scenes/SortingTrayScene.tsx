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
        const { indexA, indexB } = action.params as {
          indexA: number;
          indexB: number;
        };
        if (
          indexA >= 0 && indexA < arr.length &&
          indexB >= 0 && indexB < arr.length
        ) {
          const temp = arr[indexA];
          arr[indexA] = arr[indexB];
          arr[indexB] = temp;
        }
      }
    }
    return arr;
  }, [initialArray, actions]);

  // Identify active comparison indices (highlights both indexA and indexB)
  const comparedIndices = useMemo(() => {
    const set = new Set<number>();
    for (const action of actions) {
      if (action.component === "Box" && action.action === "compare") {
        const { indexA, indexB } = action.params as {
          indexA: number;
          indexB: number;
        };
        if (indexA != null) set.add(indexA);
        if (indexB != null) set.add(indexB);
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

  const boxWidth = 60;
  const boxHeight = 40;
  const gap = 12;
  const stride = boxWidth + gap;
  const marginX = 16;
  const boxY = 26;
  const width = Math.max(currentArray.length * stride + marginX * 2, 320);
  const height = 100;
  const valueFontSize = 14;
  const indexFontSize = 11;
  const pointerFontSize = 11;

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
        const isCompared = comparedIndices.has(index);
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
              fontSize={valueFontSize}
              fontWeight={600}
            >
              {item.value}
            </text>

            {/* Index label above box */}
            <text
              x={boxWidth / 2}
              y={boxY - 9}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={sceneTokens.text.muted}
              fontSize={indexFontSize}
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
                  y={boxY + boxHeight + 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={sceneTokens.status.mutated.glow}
                  fontSize={pointerFontSize}
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
                  y={boxY + boxHeight + 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={sceneTokens.status.mutated.glow}
                  fontSize={pointerFontSize}
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
