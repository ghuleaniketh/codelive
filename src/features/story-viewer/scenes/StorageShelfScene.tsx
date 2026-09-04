import { useMemo } from "react";
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
  // Replay actions to build accumulated slot state
  const slots = useMemo(() => {
    const acc = initialSlots.map((s) => ({ ...s }));
    for (const action of actions) {
      if (action.component === "Slot" && action.action === "insert") {
        const { key, value } = action.params as {
          key: string;
          value: unknown;
        };
        const existing = acc.find((s) => s.key === key);
        if (existing) {
          existing.value = value;
        } else {
          acc.push({ key, value });
        }
      }
    }
    return acc;
  }, [initialSlots, actions]);

  const boxWidth = sceneTokens.geometry.box.width;
  const boxHeight = sceneTokens.geometry.box.height;
  const gap = sceneTokens.spacing[3];
  const stride = boxWidth + gap;
  const marginX = sceneTokens.spacing[5];
  const boxY = 32;

  const contentWidth = marginX * 2 + slots.length * stride;
  const width = Math.max(contentWidth, 320);
  const height = 110;

  const getActionHighlight = (action: SceneAction): { idx: number; isInsert: boolean } | null => {
    if (action.component === "Slot" && action.action === "insert") {
      const { key } = action.params as { key: string };
      const idx = slots.findIndex((s) => s.key === key);
      return idx >= 0 ? { idx, isInsert: true } : null;
    }
    if (action.component === "Slot" && action.action === "lookup") {
      const { key } = action.params as { key: string; found?: boolean };
      const idx = slots.findIndex((s) => s.key === key);
      return idx >= 0 ? { idx, isInsert: false } : null;
    }
    if (action.component === "Slot" && action.action === "highlight") {
      const p = action.params as { key?: string; indices?: unknown };
      if (p.key != null) {
        const idx = slots.findIndex((s) => s.key === p.key);
        return idx >= 0 ? { idx, isInsert: false } : null;
      }
      const idxArr = Array.isArray(p.indices) ? p.indices : [];
      if (idxArr.length > 0) {
        const i = Number(idxArr[0]);
        return i >= 0 && i < slots.length ? { idx: i, isInsert: false } : null;
      }
    }
    return null;
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
      aria-label="Storage shelf hash visualizer"
    >
      {slots.length === 0 && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.text.muted}
          fontSize={sceneTokens.typography.caption.fontSize}
        >
          (empty shelf)
        </text>
      )}

      {slots.map((slot, index) => {
        const bx = marginX + index * stride;
        const isEmpty = slot.value === null || slot.value === undefined;

        return (
          <g key={slot.key}>
            {/* Slot Box */}
            <motion.rect
              x={bx}
              y={boxY}
              width={boxWidth}
              height={boxHeight}
              rx={sceneTokens.radii.md}
              fill={isEmpty ? sceneTokens.status.eliminated.fill : sceneTokens.surfaces.card}
              stroke={isEmpty ? sceneTokens.borders.subtle : sceneTokens.borders.contrast}
              strokeWidth={sceneTokens.geometry.stroke.default}
            />

            {/* Key header label */}
            <text
              x={bx + boxWidth / 2}
              y={boxY + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={sceneTokens.text.secondary}
              fontSize={sceneTokens.typography.caption.fontSize}
              fontWeight={500}
            >
              {slot.key}
            </text>

            {/* Value label */}
            {!isEmpty && (
              <text
                x={bx + boxWidth / 2}
                y={boxY + 28}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={sceneTokens.text.primary}
                fontSize={sceneTokens.typography.code.fontSize}
                fontWeight={700}
              >
                {String(slot.value)}
              </text>
            )}
          </g>
        );
      })}

      {/* Action highlights */}
      {actions.map((action, i) => {
        const res = getActionHighlight(action);
        if (!res) return null;
        const bx = marginX + res.idx * stride;
        const statusConfig = res.isInsert ? sceneTokens.status.mutated : sceneTokens.status.active;

        return (
          <motion.rect
            key={`hl-${i}-${action.action}-${res.idx}`}
            x={bx}
            y={boxY}
            width={boxWidth}
            height={boxHeight}
            rx={sceneTokens.radii.md}
            fill={statusConfig.fill}
            stroke={statusConfig.stroke}
            strokeWidth={sceneTokens.geometry.stroke.emphasis}
            transition={{ duration: sceneTokens.motion.step }}
          />
        );
      })}
    </svg>
  );
};
