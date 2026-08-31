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
  // ACCUMULATED state: replay every action (steps 0..current) on top of the
  // initial seed. This is what makes an empty initialData build up correctly
  // and what makes Prev/Next deterministic (state at step N depends on all
  // insert actions from step 0 through N, not just the current step).
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

  const stride = sceneTokens.spacing.boxWidth + sceneTokens.spacing.gap;

  const slotShapes = slots.map((slot, index) => {
    const bx = index * stride;
    const by = 40;
    return (
      <motion.rect
        key={slot.key}
        x={bx}
        y={by}
        width={sceneTokens.spacing.boxWidth}
        height={sceneTokens.spacing.boxHeight}
        fill={slot.value === null ? "#f1f5f9" : sceneTokens.colors.boxFill}
        stroke={sceneTokens.colors.boxStroke}
        strokeWidth={sceneTokens.strokeWidths.box}
        whileHover={{ strokeWidth: sceneTokens.strokeWidths.box + 2 }}
      />
    );
  });

  const slotLabels = slots.map((slot, index) => {
    const bx = index * stride;
    const by = 40;
    return (
      <g key={`label-${slot.key}`}>
        <text
          x={bx + sceneTokens.spacing.boxWidth / 2}
          y={by + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.text}
          fontSize={sceneTokens.fontSizes.medium}
        >
          {slot.key}
        </text>
        {slot.value !== null && slot.value !== undefined && (
          <text
            x={bx + sceneTokens.spacing.boxWidth - 10}
            y={by + 30}
            textAnchor="end"
            dominantBaseline="middle"
            fill={sceneTokens.colors.text}
            fontSize={sceneTokens.fontSizes.small}
          >
            {String(slot.value)}
          </text>
        )}
      </g>
    );
  });

  const contentWidth = slots.length * stride;
  const shelfWidth = Math.max(contentWidth, 40);
  const shelfHeight = Math.max(40 + sceneTokens.spacing.boxHeight + 20, 120);
  const shelfViewBox = `0 0 ${shelfWidth} ${shelfHeight}`;

  const highlightFor = (action: SceneAction): number | null => {
    if (action.component === "Slot" && action.action === "insert") {
      const { key } = action.params as { key: string };
      const idx = slots.findIndex((s) => s.key === key);
      return idx;
    }
    if (action.component === "Slot" && action.action === "lookup") {
      const { key } = action.params as { key: string; found?: boolean };
      const idx = slots.findIndex((s) => s.key === key);
      return idx;
    }
    if (action.component === "Slot" && action.action === "highlight") {
      const p = action.params as { key?: string; indices?: unknown };
      if (p.key != null) {
        return slots.findIndex((s) => s.key === p.key);
      }
      const idxArr = Array.isArray(p.indices) ? p.indices : [];
      if (idxArr.length > 0) {
        const i = Number(idxArr[0]);
        return i >= 0 && i < slots.length ? i : null;
      }
    }
    return null;
  };

  return (
    <svg
      viewBox={shelfViewBox}
      width={shelfWidth}
      height={shelfHeight}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    >
      {slots.length === 0 && (
        <text
          x={shelfWidth / 2}
          y={shelfHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.muted}
          fontSize={sceneTokens.fontSizes.small}
        >
          (empty shelf)
        </text>
      )}
      {slotShapes}
      {actions.map((action, i) => {
        const idx = highlightFor(action);
        if (idx === null || idx < 0) return null;
        const bx = idx * stride;
        return (
          <motion.rect
            key={`hl-${i}-${action.action}-${idx}`}
            x={bx}
            y={40}
            width={sceneTokens.spacing.boxWidth}
            height={sceneTokens.spacing.boxHeight}
            fill={sceneTokens.colors.highlight}
            stroke={sceneTokens.colors.highlight}
            strokeWidth={sceneTokens.strokeWidths.box + 2}
            transition={{ duration: 0.3 }}
          />
        );
      })}
      {slotLabels}
    </svg>
  );
};
