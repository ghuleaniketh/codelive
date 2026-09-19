import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction, LedgerGridInitialData } from "./types";

interface LedgerGridSceneProps {
  initialData?: LedgerGridInitialData;
  actions: SceneAction[];
  state?: Record<string, string | number | boolean>;
}

export const LedgerGridScene: React.FC<LedgerGridSceneProps> = ({
  initialData,
  actions,
  state,
}) => {
  // Replay actions to build the current state of the 2D grid
  const sceneState = useMemo(() => {
    let rows = initialData?.rows ?? 6;
    let cols = initialData?.cols ?? 4;
    let rowLabels = initialData?.rowLabels ? [...initialData.rowLabels] : [];
    let colLabels = initialData?.colLabels ? [...initialData.colLabels] : [];

    // Initialize 2D grid
    let grid: (number | string | null)[][] = [];
    if (initialData?.initialGrid) {
      grid = initialData.initialGrid.map((row) => [...row]);
    } else {
      for (let r = 0; r < rows; r++) {
        grid.push(new Array(cols).fill(null));
      }
    }

    let activeCell: { row: number; col: number } | null = null;
    const dependencySources = new Set<string>();
    let dependencies: Array<{
      from: { row: number; col: number };
      to: { row: number; col: number };
    }> = [];
    const baseCells = new Set<string>();
    const finalCells = new Set<string>();

    for (const action of actions) {
      if (action.component === "Cell") {
        const p = action.params as Record<string, any>;
        switch (action.action) {
          case "initGrid": {
            if (p.rows != null) rows = Number(p.rows);
            if (p.cols != null) cols = Number(p.cols);
            if (p.rowLabels) rowLabels = [...p.rowLabels];
            if (p.colLabels) colLabels = [...p.colLabels];
            grid = [];
            for (let r = 0; r < rows; r++) {
              grid.push(new Array(cols).fill(null));
            }
            break;
          }
          case "setValue": {
            const r = Number(p.row);
            const c = Number(p.col);
            if (r >= 0 && r < rows && c >= 0 && c < cols) {
              if (!grid[r]) grid[r] = new Array(cols).fill(null);
              grid[r][c] = p.value;
            }
            break;
          }
          case "highlight": {
            const r = Number(p.row);
            const c = Number(p.col);
            activeCell = { row: r, col: c };
            dependencySources.clear();
            dependencies = [];
            break;
          }
          case "showDependency": {
            const r = Number(p.row);
            const c = Number(p.col);
            activeCell = { row: r, col: c };
            dependencySources.clear();
            dependencies = [];
            if (Array.isArray(p.dependsOn)) {
              for (const dep of p.dependsOn) {
                const dr = Number(dep.row);
                const dc = Number(dep.col);
                dependencySources.add(`${dr},${dc}`);
                dependencies.push({
                  from: { row: dr, col: dc },
                  to: { row: r, col: c },
                });
              }
            }
            break;
          }
          case "markBase": {
            const r = Number(p.row);
            const c = Number(p.col);
            baseCells.add(`${r},${c}`);
            break;
          }
          case "markFinal": {
            const r = Number(p.row);
            const c = Number(p.col);
            finalCells.add(`${r},${c}`);
            activeCell = { row: r, col: c };
            break;
          }
        }
      }
    }

    return {
      rows,
      cols,
      rowLabels,
      colLabels,
      grid,
      activeCell,
      dependencySources,
      dependencies,
      baseCells,
      finalCells,
    };
  }, [initialData, actions]);

  const {
    rows,
    cols,
    rowLabels,
    colLabels,
    grid,
    activeCell,
    dependencySources,
    dependencies,
    baseCells,
    finalCells,
  } = sceneState;

  // Coordinate math for SVG connectors
  const CELL_WIDTH = 58;
  const CELL_HEIGHT = 46;
  const HEADER_WIDTH = 68;
  const HEADER_HEIGHT = 42;
  const GAP = 6;
  const PAD = 16;

  const totalSvgWidth = PAD * 2 + HEADER_WIDTH + GAP + cols * (CELL_WIDTH + GAP);
  const totalSvgHeight = PAD * 2 + HEADER_HEIGHT + GAP + rows * (CELL_HEIGHT + GAP);

  const getCellCenter = (row: number, col: number) => {
    const x = PAD + HEADER_WIDTH + GAP + col * (CELL_WIDTH + GAP) + CELL_WIDTH / 2;
    const y = PAD + HEADER_HEIGHT + GAP + row * (CELL_HEIGHT + GAP) + CELL_HEIGHT / 2;
    return { x, y };
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-auto p-4"
      style={{ backgroundColor: sceneTokens.colors.bg }}
    >
      {/* Top Meta / Legend Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-3 px-3 py-2 rounded border border-[#22262B] bg-[#14171B]/80 backdrop-blur text-xs">
        <div className="flex items-center space-x-4">
          <span className="font-mono text-[#8C93A1] uppercase tracking-wider text-[10px]">
            2D DP Ledger Grid
          </span>
          {activeCell && (
            <span className="font-mono text-[#E8A33D] font-medium bg-[#1B1F24] px-2 py-0.5 rounded border border-[#E8A33D]/30">
              Target: dp[{activeCell.row}][{activeCell.col}]
            </span>
          )}
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm border"
              style={{
                borderColor: sceneTokens.colors.success,
                backgroundColor: "rgba(95, 191, 119, 0.15)",
              }}
            />
            <span className="text-[#8C93A1]">Base</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm border"
              style={{
                borderColor: sceneTokens.colors.accentCool,
                backgroundColor: "rgba(95, 168, 211, 0.15)",
              }}
            />
            <span className="text-[#8C93A1]">Depends</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm border"
              style={{
                borderColor: sceneTokens.colors.accent,
                backgroundColor: sceneTokens.colors.surfaceRaised,
              }}
            />
            <span className="text-[#8C93A1]">Active</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm border"
              style={{
                borderColor: sceneTokens.colors.success,
                backgroundColor: sceneTokens.colors.success,
              }}
            />
            <span className="text-[#8C93A1]">Result</span>
          </div>
        </div>
      </div>

      {/* Grid Canvas Area with SVG overlay for arrows */}
      <div
        className="relative rounded-lg border border-[#22262B] bg-[#14171B] p-4 shadow-xl overflow-auto max-w-full max-h-full"
        style={{
          minWidth: Math.min(totalSvgWidth + 10, 680),
          minHeight: Math.min(totalSvgHeight + 10, 420),
        }}
      >
        {/* SVG Overlay for Dependency Connection Lines */}
        <svg
          className="absolute inset-0 pointer-events-none z-20"
          width={totalSvgWidth}
          height={totalSvgHeight}
        >
          <defs>
            <marker
              id="dep-arrow-head"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 1 2 L 8 5 L 1 8 z"
                fill={sceneTokens.colors.accentCool}
              />
            </marker>
          </defs>

          {/* Render dependency arrows */}
          <AnimatePresence>
            {dependencies.map((dep, idx) => {
              const start = getCellCenter(dep.from.row, dep.from.col);
              const end = getCellCenter(dep.to.row, dep.to.col);

              // Calculate shortened line endpoints so arrow head hits cell edge cleanly
              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist === 0) return null;

              const shortenEnd = 16;
              const targetX = end.x - (dx / dist) * shortenEnd;
              const targetY = end.y - (dy / dist) * shortenEnd;

              // Bezier curve control point offset
              const midX = (start.x + targetX) / 2;
              const midY = (start.y + targetY) / 2;
              const normalX = -dy / dist;
              const normalY = dx / dist;
              const curveOffset = dist > 60 ? 10 : 0;
              const ctrlX = midX + normalX * curveOffset;
              const ctrlY = midY + normalY * curveOffset;

              const pathD = `M ${start.x} ${start.y} Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`;

              return (
                <g key={`dep-arrow-${dep.from.row}-${dep.from.col}-${dep.to.row}-${dep.to.col}-${idx}`}>
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke={sceneTokens.colors.accentCool}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    markerEnd="url(#dep-arrow-head)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                  <motion.circle
                    cx={start.x}
                    cy={start.y}
                    r={3}
                    fill={sceneTokens.colors.accentCool}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  />
                </g>
              );
            })}
          </AnimatePresence>
        </svg>

        {/* 2D Grid Table */}
        <div className="relative z-10 flex flex-col gap-[6px]">
          {/* Top Header Row (Corner + Column Headers) */}
          <div className="flex gap-[6px] items-center">
            {/* Corner Cell */}
            <div
              className="flex items-center justify-center rounded border border-[#22262B] bg-[#0B0D10] text-[#8C93A1] font-mono text-[11px] font-medium"
              style={{
                width: `${HEADER_WIDTH}px`,
                height: `${HEADER_HEIGHT}px`,
              }}
            >
              <span>i \ j</span>
            </div>

            {/* Column Headers */}
            {Array.from({ length: cols }).map((_, c) => {
              const label = colLabels[c] !== undefined ? colLabels[c] : "";
              const isColActive = activeCell?.col === c;
              return (
                <div
                  key={`col-header-${c}`}
                  className={`flex flex-col items-center justify-center rounded border font-mono transition-colors duration-200 ${
                    isColActive
                      ? "border-[#5FA8D3]/50 bg-[#1B1F24] text-[#5FA8D3]"
                      : "border-[#22262B] bg-[#0B0D10] text-[#8C93A1]"
                  }`}
                  style={{
                    width: `${CELL_WIDTH}px`,
                    height: `${HEADER_HEIGHT}px`,
                  }}
                >
                  <span className="text-[10px] text-[#8C93A1] leading-none">
                    {c}
                  </span>
                  <span className="text-xs font-semibold text-[#EDEEF0] leading-tight">
                    {label === "" ? "ε" : label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid Rows */}
          {Array.from({ length: rows }).map((_, r) => {
            const rowLabel = rowLabels[r] !== undefined ? rowLabels[r] : "";
            const isRowActive = activeCell?.row === r;

            return (
              <div key={`grid-row-${r}`} className="flex gap-[6px] items-center">
                {/* Left Row Header */}
                <div
                  className={`flex items-center justify-between px-2 rounded border font-mono transition-colors duration-200 ${
                    isRowActive
                      ? "border-[#5FA8D3]/50 bg-[#1B1F24] text-[#5FA8D3]"
                      : "border-[#22262B] bg-[#0B0D10] text-[#8C93A1]"
                  }`}
                  style={{
                    width: `${HEADER_WIDTH}px`,
                    height: `${CELL_HEIGHT}px`,
                  }}
                >
                  <span className="text-[10px] text-[#8C93A1]">{r}</span>
                  <span className="text-xs font-semibold text-[#EDEEF0]">
                    {rowLabel === "" ? "ε" : rowLabel}
                  </span>
                </div>

                {/* Row Data Cells */}
                {Array.from({ length: cols }).map((_, c) => {
                  const cellKey = `${r},${c}`;
                  const val = grid[r]?.[c];
                  const hasValue = val !== null && val !== undefined;
                  const isActive = activeCell?.row === r && activeCell?.col === c;
                  const isDepSource = dependencySources.has(cellKey);
                  const isBase = baseCells.has(cellKey);
                  const isFinal = finalCells.has(cellKey);

                  // Cell Styling Logic based on tokens
                  let borderColor = sceneTokens.borders.subtle;
                  let bgColor = sceneTokens.surfaces.card;
                  let textColor = sceneTokens.text.primary;
                  let shadow = "none";

                  if (isFinal) {
                    borderColor = sceneTokens.colors.success;
                    bgColor = "rgba(95, 191, 119, 0.22)";
                    textColor = sceneTokens.colors.textPrimary;
                    shadow = "0 0 12px rgba(95, 191, 119, 0.35)";
                  } else if (isActive) {
                    borderColor = sceneTokens.colors.accent;
                    bgColor = sceneTokens.surfaces.raised;
                    textColor = sceneTokens.colors.textPrimary;
                    shadow = "0 0 10px rgba(232, 163, 61, 0.3)";
                  } else if (isDepSource) {
                    borderColor = sceneTokens.colors.accentCool;
                    bgColor = "rgba(95, 168, 211, 0.15)";
                    textColor = sceneTokens.colors.accentCool;
                  } else if (isBase) {
                    borderColor = "rgba(95, 191, 119, 0.6)";
                    bgColor = "rgba(95, 191, 119, 0.08)";
                  } else if (!hasValue) {
                    borderColor = sceneTokens.borders.subtle;
                    bgColor = sceneTokens.colors.bg;
                    textColor = sceneTokens.text.secondary;
                  }

                  return (
                    <motion.div
                      key={`cell-${cellKey}`}
                      className="relative flex items-center justify-center rounded font-mono font-semibold select-none"
                      style={{
                        width: `${CELL_WIDTH}px`,
                        height: `${CELL_HEIGHT}px`,
                        backgroundColor: bgColor,
                        borderColor: borderColor,
                        borderWidth: isActive || isDepSource || isFinal ? "2px" : "1px",
                        borderStyle: !hasValue && !isActive ? "dashed" : "solid",
                        color: textColor,
                        boxShadow: shadow,
                      }}
                      animate={{
                        scale: isActive ? 1.04 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {/* Cell Coordinate indicator (small corner watermark) */}
                      <span className="absolute top-0.5 left-1 text-[8px] text-[#8C93A1]/50 font-mono select-none pointer-events-none">
                        {r},{c}
                      </span>

                      {/* Main Cell Value */}
                      <span className="text-sm font-bold tracking-tight">
                        {hasValue ? String(val) : "—"}
                      </span>

                      {/* Final Result Tag */}
                      {isFinal && (
                        <div
                          className="absolute -top-2 -right-1 px-1 py-0.2 rounded text-[7px] font-bold tracking-widest text-[#0B0D10] uppercase shadow"
                          style={{ backgroundColor: sceneTokens.colors.success }}
                        >
                          RES
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
