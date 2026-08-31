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
  // Effective width available for the SVG: parent section has maxWidth=920
  // with padding=12 on each side, leaving ~880px of content width.
  const EFFECTIVE_WIDTH = 880;

  // Calculate box width dynamically: minimum 20px (readable), maximum 80px
  // (original size), scaled down as bitWidth grows so total width stays bounded.
  // For bitWidth=8: boxWidth=80, total=640px; bitWidth=16: boxWidth=55, total=880px;
  // bitWidth=32: boxWidth=27.5, total=880px. All fit without overflow.
  const boxWidth = Math.min(80, Math.max(20, EFFECTIVE_WIDTH / initialData.bitWidth));

  // ACCUMULATED bit state: replay every action from steps 0..current on top
  // of the seed initialData. This is the established cumulative-replay pattern.
  const bitStates = useMemo<BitState[][]>(() => {
    // Seed from initialValue
    let acc = bitsFromNumber(initialData.initialValue, initialData.bitWidth);

    for (const action of actions) {
      if (action.component !== "Bit") continue;

      switch (action.action) {
        case "setBit": {
          const { position, value } = action.params as {
            position: number;
            value: number;
          };
          if (position >= 0 && position < initialData.bitWidth) {
            acc[position] = value === 0 || value === 1 ? value : acc[position] === 0 ? 1 : 0;
          }
          break;
        }
        case "shiftLeft": {
          const { amount } = action.params as { amount: number };
          const shift = amount ?? 1;
          // All bits slide left; bits that fall off the MSA disappear;
          // new 0s appear at the LSB (right) end.
          acc = acc.slice(shift).concat(Array(shift).fill(0) as BitState[]);
          break;
        }
        case "shiftRight": {
          const { amount } = action.params as { amount: number };
          const shift = amount ?? 1;
          const newAcc: BitState[] = [];
          for (let i = 0; i < initialData.bitWidth; i++) {
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
          const mask = (1 << initialData.bitWidth) - 1;
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
          acc = bitsFromNumber(result, initialData.bitWidth);
          break;
        }
        case "highlight": {
          // Highlight does not change bit values; we track it separately for rendering.
          break;
        }
        default:
          break;
      }
    }
    return [acc];
  }, [actions, initialData.bitWidth, initialData.initialValue, initialData.secondValue]);

  const currentBits = bitStates[bitStates.length - 1];

  // Track highlighted positions from the most recent highlight action
  const highlightedPositions = useMemo<number[]>(() => {
    const pos: number[] = [];
    for (let i = actions.length - 1; i >= 0; i--) {
      const a = actions[i];
      if (a.component !== "Bit") continue;
      if (a.action === "highlight") {
        const { positions } = a.params as { positions: number[] };
        if (positions && positions.length > 0) {
          return positions;
        }
      }
    }
    return pos;
  }, [actions]);

  const decimalValue = decimalFromBits(currentBits);

  // Highlight styling: amber overlay for specified positions
  const bitHighlights = currentBits.map((_bit, i) => {
    if (highlightedPositions.includes(i)) {
      return {
        fill: "rgba(254, 217, 57, 0.4)",
        stroke: "#fbbf24",
        strokeWidth: 2,
      };
    }
    return {
      fill: sceneTokens.colors.boxFill,
      stroke: sceneTokens.colors.boxStroke,
      strokeWidth: 1,
    };
  });

  // Effective total width used for positioning.
  const totalBitWidth = initialData.bitWidth * boxWidth;

  return (
    <div>
      {/* Labels above the bit rows */}
      {initialData.secondValue !== undefined && (
        <text
          x={EFFECTIVE_WIDTH / 2 + 20}
          y={15}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.muted}
          fontSize={sceneTokens.fontSizes.small}
        >
          A
        </text>
      )}
      {initialData.secondValue !== undefined && (
        <text
          x={EFFECTIVE_WIDTH / 2 + 20}
          y={95}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.muted}
          fontSize={sceneTokens.fontSizes.small}
        >
          B
        </text>
      )}

      <svg
        viewBox={`0 0 ${totalBitWidth + 40} ${130}`}
        width={totalBitWidth + 40}
        height={130}
        style={{ display: "block", marginBottom: 20 }}
      >
        {/* First row of bits */}
        {currentBits.map((bit, i) => (
          <g
            key={`bit-${i}`}
            transform={`translate(${40 + i * boxWidth})`}
          >
            <motion.rect
              x={0}
              y={0}
              width={70}
              height={70}
              rx={8}
              fill={bitHighlights[i].fill}
              stroke={bitHighlights[i].stroke}
              strokeWidth={bitHighlights[i].strokeWidth}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
            <text
              x={35}
              y={45}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={bit === 0 ? sceneTokens.colors.muted : sceneTokens.colors.text}
              fontSize={sceneTokens.fontSizes.medium}
            >
              {bit}
            </text>
          </g>
        ))}

        {/* Second row of bits (below the first row) */}
        {initialData.secondValue !== undefined && (
          <g transform="translate(0, 90)">
            {bitsFromNumber(initialData.secondValue, initialData.bitWidth).map((bit, i) => (
              <g
                key={`bit2-${i}`}
                transform={`translate(${40 + i * boxWidth})`}
              >
                <motion.rect
                  x={0}
                  y={0}
                  width={70}
                  height={70}
                  rx={8}
                  fill={sceneTokens.colors.boxFill}
                  stroke={sceneTokens.colors.boxStroke}
                  strokeWidth={1}
                />
                <text
                  x={35}
                  y={45}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={bit === 0 ? sceneTokens.colors.muted : sceneTokens.colors.text}
                  fontSize={sceneTokens.fontSizes.medium}
                >
                  {bit}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Decimal value label - centered on effective width */}
        <text
          x={EFFECTIVE_WIDTH / 2 + 20}
          y={55}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={sceneTokens.colors.text}
          fontSize={sceneTokens.fontSizes.medium}
        >
          = {decimalValue}
        </text>
      </svg>

      {/* Operation labels below the bit row */}
      {actions.map((action, i) => {
        if (action.component !== "Bit") return null;

        switch (action.action) {
          case "setBit": {
            const { position, value } = action.params as {
              position: number;
              value: number;
            };
            const xPos = 40 + position * boxWidth + boxWidth / 2;
            return (
              <text
                key={`sp-${i}`}
                x={xPos}
                y={100}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#10b981"
                fontSize={sceneTokens.fontSizes.small}
              >
                setBit({position}, {value})
              </text>
            );
          }
          case "shiftLeft": {
            return (
              <text
                key={`sl-${i}`}
                x={40 + boxWidth / 2}
                y={100}
                textAnchor="start"
                dominantBaseline="middle"
                fill="#fbbf24"
                fontSize={sceneTokens.fontSizes.small}
              >
                shiftLeft {action.params.amount ?? 1}
              </text>
            );
          }
          case "shiftRight": {
            const lastIdx = initialData.bitWidth - 1;
            const xPos = 40 + lastIdx * boxWidth + boxWidth / 2;
            return (
              <text
                key={`sr-${i}`}
                x={xPos}
                y={100}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#fbbf24"
                fontSize={sceneTokens.fontSizes.small}
              >
                shiftRight {action.params.amount ?? 1}
              </text>
            );
          }
          case "applyOp": {
            // Visual "AND"/"OR"/"XOR" operand is now rendered as the second row
            // of bit boxes above; keep a minimal text label for the operator.
            const { operator, operandValue } = action.params as {
              operator: string;
              operandValue: number;
            };
            return (
              <text
                key={`ao-${i}`}
                x={EFFECTIVE_WIDTH / 2 + 20}
                y={100}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fbbf24"
                fontSize={sceneTokens.fontSizes.small}
              >
                {operator} {operandValue}
              </text>
            );
          }
          case "highlight": {
            const { positions } = action.params as { positions: number[] };
            return (
              <text
                key={`hl-${i}`}
                x={EFFECTIVE_WIDTH / 2 + 20}
                y={100}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fbbf24"
                fontSize={sceneTokens.fontSizes.small}
              >
                highlight positions {positions.join(",")}
              </text>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
};