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
        const p = action.params as Record<string, unknown> | undefined;
        let idxA = p?.indexA as number | undefined;
        let idxB = p?.indexB as number | undefined;

        if (idxA == null && p?.box1Id != null) {
          const found = arr.findIndex((b) => b.id === String(p.box1Id));
          if (found !== -1) idxA = found;
        }
        if (idxB == null && p?.box2Id != null) {
          const found = arr.findIndex((b) => b.id === String(p.box2Id));
          if (found !== -1) idxB = found;
        }

        if (
          idxA != null && idxB != null &&
          idxA >= 0 && idxA < arr.length &&
          idxB >= 0 && idxB < arr.length
        ) {
          const temp = arr[idxA];
          arr[idxA] = arr[idxB];
          arr[idxB] = temp;
        }
      }
    }
    return arr;
  }, [initialArray, actions]);

  // Identify active comparison indices (highlights both indexA and indexB or box1Id and box2Id)
  const comparedIndices = useMemo(() => {
    const set = new Set<number>();
    for (const action of actions) {
      if (action.component === "Box" && action.action === "compare") {
        const p = action.params as Record<string, unknown> | undefined;
        if (p?.indexA != null) set.add(Number(p.indexA));
        if (p?.indexB != null) set.add(Number(p.indexB));
        if (p?.box1Id != null) {
          const idx = currentArray.findIndex((b) => b.id === String(p.box1Id));
          if (idx !== -1) set.add(idx);
        }
        if (p?.box2Id != null) {
          const idx = currentArray.findIndex((b) => b.id === String(p.box2Id));
          if (idx !== -1) set.add(idx);
        }
      }
    }
    return set;
  }, [actions, currentArray]);

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

  // Map index -> array of pointer labels (combining setPointer actions and state variables like i, j, etc.)
  const pointersByIndex = useMemo(() => {
    const map = new Map<number, string[]>();

    const addPointer = (idx: number, label: string) => {
      if (idx >= 0 && idx < currentArray.length) {
        const list = map.get(idx) || [];
        if (!list.includes(label)) {
          list.push(label);
        }
        map.set(idx, list);
      }
    };

    // 1. Explicit setPointer actions
    for (const action of actions) {
      if (action.component === "Box" && action.action === "setPointer") {
        const p = action.params as Record<string, unknown> | undefined;
        const label = p?.label ? String(p.label) : p?.name ? String(p.name) : undefined;
        let targetIndex: number | undefined;
        if (p?.index != null && typeof p.index === "number") {
          targetIndex = p.index;
        } else if (p?.boxId != null) {
          const found = currentArray.findIndex((b) => b.id === String(p.boxId));
          if (found !== -1) targetIndex = found;
        }
        if (targetIndex != null && label) {
          addPointer(targetIndex, label);
        }
      }
    }

    // 2. Variable state pointers (e.g. i, j, k, left, right, mid, min_idx, etc.)
    if (state) {
      const priorityOrder = ["i", "j", "k", "ptr", "left", "right", "mid", "low", "high", "min_idx", "key"];
      const keys = Object.keys(state).sort((a, b) => {
        const idxA = priorityOrder.indexOf(a);
        const idxB = priorityOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });

      for (const key of keys) {
        const val = state[key];
        if (typeof val === "number" && Number.isInteger(val)) {
          if (val >= 0 && val < currentArray.length) {
            addPointer(val, key);
          }
        } else if (typeof val === "string" && /^\d+$/.test(val)) {
          const num = Number(val);
          if (num >= 0 && num < currentArray.length) {
            addPointer(num, key);
          }
        }
      }
    }

    return map;
  }, [actions, state, currentArray]);

  const boxWidth = 60;
  const boxHeight = 40;
  const gap = 12;
  const stride = boxWidth + gap;
  const marginX = 16;
  const boxY = 26;
  const width = Math.max(currentArray.length * stride + marginX * 2, 320);
  const height = 108;
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
        const slotPointers = pointersByIndex.get(index) || [];
        const pointerText = slotPointers.length > 0 ? `↑ ${slotPointers.join(", ")}` : null;

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

            {/* Pointer(s) below box (from actions or state i, j, etc.) */}
            {pointerText && (
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
                  {pointerText}
                </text>
              </g>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
};
