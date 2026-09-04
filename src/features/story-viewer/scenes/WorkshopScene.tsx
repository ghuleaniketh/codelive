import { useMemo } from "react";
import { motion } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction } from "./types";

type BitState = 0 | 1;

function decimalFromBits(bits: BitState[]): number {
  let acc = 0;
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === 1) {
      acc += 1 << (bits.length - 1 - i);
    }
  }
  return acc;
}

function bitsFromNumber(value: number, bitWidth: number): BitState[] {
  const bits: BitState[] = [];
  for (let i = bitWidth - 1; i >= 0; i--) {
    bits.push(((value >> i) & 1) as 0 | 1);
  }
  return bits;
}

export const WorkshopScene = ({
  initialData,
  actions,
}: {
  initialData: {
    bitWidth: number;
    initialValue: number;
    secondValue?: number;
  };
  actions: SceneAction[];
}) => {
  const bitWidth = Math.max(1, initialData?.bitWidth || 8);
  const hasSecond = initialData?.secondValue !== undefined;

  // Replay actions to accumulate bit state
  const currentBits = useMemo<BitState[]>(() => {
    let acc = bitsFromNumber(initialData?.initialValue ?? 0, bitWidth);

    for (const action of actions) {
      if (action.component !== "Bit") continue;

      switch (action.action) {
        case "setBit": {
          const { position, value } = action.params as {
            position: number;
            value: number;
          };
          if (position >= 0 && position < bitWidth) {
            acc[position] = value === 0 || value === 1 ? value : acc[position] === 0 ? 1 : 0;
          }
          break;
        }
        case "shiftLeft": {
          const { amount } = action.params as { amount: number };
          const shift = amount ?? 1;
          acc = acc.slice(shift).concat(Array(shift).fill(0) as BitState[]);
          break;
        }
        case "shiftRight": {
          const { amount } = action.params as { amount: number };
          const shift = amount ?? 1;
          const newAcc: BitState[] = [];
          for (let i = 0; i < bitWidth; i++) {
            if (i < shift) {
              newAcc.push(0 as BitState);
            } else {
              newAcc.push(acc[i - shift] as BitState);
            }
          }
          acc = newAcc;
          break;
        }
        case "applyOp": {
          const { operator, operandValue } = action.params as {
            operator: string;
            operandValue: number;
          };
          const mask = (1 << bitWidth) - 1;
          const accValue = decimalFromBits(acc);
          let result: number;
          switch (operator) {
            case "AND":
              result = (accValue & operandValue) & mask;
              break;
            case "OR":
              result = (accValue | operandValue) & mask;
              break;
            case "XOR":
              result = (accValue ^ operandValue) & mask;
              break;
            default:
              result = accValue;
          }
          acc = bitsFromNumber(result, bitWidth);
          break;
        }
        default:
          break;
      }
    }
    return acc;
  }, [actions, bitWidth, initialData?.initialValue]);

  // Track highlighted positions from actions
  const highlightedPositions = useMemo<number[]>(() => {
    for (let i = actions.length - 1; i >= 0; i--) {
      const a = actions[i];
      if (a.component === "Bit" && a.action === "highlight") {
        const { positions } = a.params as { positions: number[] };
        if (positions && positions.length > 0) {
          return positions;
        }
      }
    }
    return [];
  }, [actions]);

  // Derive active operation summary
  const lastOpAction = useMemo(() => {
    for (let i = actions.length - 1; i >= 0; i--) {
      const a = actions[i];
      if (a.component === "Bit" && a.action !== "highlight") {
        return a;
      }
    }
    return null;
  }, [actions]);

  const decimalValue = decimalFromBits(currentBits);

  // Layout calculations
  const cellWidth = Math.min(52, Math.max(28, 440 / bitWidth));
  const cellHeight = 44;
  const cellGap = 6;
  const stride = cellWidth + cellGap;
  const startX = hasSecond ? 48 : 24;
  const totalBitRowWidth = bitWidth * stride;

  const totalWidth = Math.max(startX + totalBitRowWidth + 120, 360);
  const totalHeight = hasSecond ? 190 : 130;

  const secondBits = hasSecond
    ? bitsFromNumber(initialData.secondValue!, bitWidth)
    : [];

  const renderOpLabel = () => {
    if (!lastOpAction) return null;
    let label = "";
    switch (lastOpAction.action) {
      case "setBit":
        label = `setBit(${lastOpAction.params.position}, ${lastOpAction.params.value})`;
        break;
      case "shiftLeft":
        label = `<< shiftLeft ${lastOpAction.params.amount ?? 1}`;
        break;
      case "shiftRight":
        label = `>> shiftRight ${lastOpAction.params.amount ?? 1}`;
        break;
      case "applyOp":
        label = `${lastOpAction.params.operator} ${lastOpAction.params.operandValue}`;
        break;
      default:
        break;
    }
    if (!label) return null;

    return (
      <g>
        <rect
          x={startX}
          y={hasSecond ? 150 : 92}
          width={label.length * 8 + 20}
          height={22}
          rx={sceneTokens.radii.sm}
          fill={sceneTokens.status.mutated.fill}
          stroke={sceneTokens.status.mutated.stroke}
          strokeWidth={sceneTokens.geometry.stroke.subtle}
        />
        <text
          x={startX + (label.length * 8 + 20) / 2}
          y={hasSecond ? 162 : 104}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.status.mutated.glow}
          fontSize={sceneTokens.typography.eyebrow.fontSize}
          fontWeight={700}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      width={totalWidth}
      height={totalHeight}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
      aria-label="Bitwise workshop visualizer"
    >
      {/* Row A Indicator */}
      {hasSecond && (
        <text
          x={20}
          y={20 + cellHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.text.muted}
          fontSize={sceneTokens.typography.caption.fontSize}
          fontWeight={700}
        >
          A
        </text>
      )}

      {/* Row A Bit Cells */}
      {currentBits.map((bit, i) => {
        const isHighlighted = highlightedPositions.includes(i);
        const bx = startX + i * stride;
        const by = 20;

        return (
          <g key={`bit-a-${i}`}>
            <motion.rect
              x={bx}
              y={by}
              width={cellWidth}
              height={cellHeight}
              rx={sceneTokens.radii.sm}
              fill={isHighlighted ? sceneTokens.status.active.fill : sceneTokens.surfaces.card}
              stroke={isHighlighted ? sceneTokens.status.active.stroke : sceneTokens.borders.contrast}
              strokeWidth={isHighlighted ? sceneTokens.geometry.stroke.emphasis : sceneTokens.geometry.stroke.default}
              transition={{ duration: sceneTokens.motion.step }}
            />
            <text
              x={bx + cellWidth / 2}
              y={by + cellHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={
                isHighlighted
                  ? sceneTokens.status.active.glow
                  : bit === 1
                  ? sceneTokens.text.primary
                  : sceneTokens.text.muted
              }
              fontSize={sceneTokens.typography.code.fontSize}
              fontWeight={700}
            >
              {bit}
            </text>
            <text
              x={bx + cellWidth / 2}
              y={by - 8}
              textAnchor="middle"
              fill={sceneTokens.text.muted}
              fontSize={9}
            >
              {bitWidth - 1 - i}
            </text>
          </g>
        );
      })}

      {/* Decimal Value readout */}
      <text
        x={startX + totalBitRowWidth + 24}
        y={20 + cellHeight / 2}
        textAnchor="start"
        dominantBaseline="middle"
        fill={sceneTokens.text.primary}
        fontSize={sceneTokens.typography.title.fontSize}
        fontWeight={700}
      >
        = {decimalValue}
      </text>

      {/* Row B Bit Cells (if second operand present) */}
      {hasSecond && (
        <>
          <text
            x={20}
            y={82 + cellHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={sceneTokens.text.muted}
            fontSize={sceneTokens.typography.caption.fontSize}
            fontWeight={700}
          >
            B
          </text>
          {secondBits.map((bit, i) => {
            const bx = startX + i * stride;
            const by = 82;
            return (
              <g key={`bit-b-${i}`}>
                <rect
                  x={bx}
                  y={by}
                  width={cellWidth}
                  height={cellHeight}
                  rx={sceneTokens.radii.sm}
                  fill={sceneTokens.surfaces.card}
                  stroke={sceneTokens.borders.contrast}
                  strokeWidth={sceneTokens.geometry.stroke.default}
                />
                <text
                  x={bx + cellWidth / 2}
                  y={by + cellHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={bit === 1 ? sceneTokens.text.primary : sceneTokens.text.muted}
                  fontSize={sceneTokens.typography.code.fontSize}
                  fontWeight={700}
                >
                  {bit}
                </text>
              </g>
            );
          })}
          <text
            x={startX + totalBitRowWidth + 24}
            y={82 + cellHeight / 2}
            textAnchor="start"
            dominantBaseline="middle"
            fill={sceneTokens.text.secondary}
            fontSize={sceneTokens.typography.narrative.fontSize}
            fontWeight={600}
          >
            = {initialData.secondValue}
          </text>
        </>
      )}

      {/* Operation badge label */}
      {renderOpLabel()}
    </svg>
  );
};