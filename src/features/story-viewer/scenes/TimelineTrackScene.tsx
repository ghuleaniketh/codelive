import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sceneTokens } from "./sceneTokens";
import { SceneAction, TimelineTrackInitialData } from "./types";

interface TimelineTrackSceneProps {
  initialData?: TimelineTrackInitialData;
  actions: SceneAction[];
  state?: Record<string, string | number | boolean>;
}

interface IntervalState {
  id: string;
  start: number;
  end: number;
  label?: string;
  status: "idle" | "active" | "compare" | "merged" | "discarded" | "result";
}

export const TimelineTrackScene: React.FC<TimelineTrackSceneProps> = ({
  initialData,
  actions,
  state,
}) => {
  // Replay actions to build the timeline state
  const timelineState = useMemo(() => {
    let rawIntervals: IntervalState[] = [];

    if (initialData?.intervals) {
      rawIntervals = initialData.intervals.map((inv) => ({
        id: inv.id,
        start: inv.start,
        end: inv.end,
        label: inv.label,
        status: "idle",
      }));
    }

    let minVal = initialData?.min;
    let maxVal = initialData?.max;
    let activeId: string | null = null;
    let compareId: string | null = null;
    let overlapResult: boolean | null = null;

    for (const action of actions) {
      if (action.component === "IntervalBar") {
        const p = action.params as Record<string, any>;
        switch (action.action) {
          case "initTimeline": {
            if (p.min != null) minVal = Number(p.min);
            if (p.max != null) maxVal = Number(p.max);
            if (Array.isArray(p.intervals)) {
              rawIntervals = p.intervals.map((inv: any) => ({
                id: String(inv.id),
                start: Number(inv.start),
                end: Number(inv.end),
                label: inv.label,
                status: "idle",
              }));
            }
            break;
          }
          case "highlight": {
            activeId = String(p.id);
            compareId = null;
            overlapResult = null;
            for (const inv of rawIntervals) {
              if (inv.id === activeId && inv.status !== "merged" && inv.status !== "result") {
                inv.status = "active";
              } else if (inv.status === "active" || inv.status === "compare") {
                inv.status = "idle";
              }
            }
            break;
          }
          case "compareOverlap": {
            activeId = String(p.idA);
            compareId = String(p.idB);
            overlapResult = Boolean(p.overlaps);
            for (const inv of rawIntervals) {
              if (inv.id === activeId) {
                inv.status = "active";
              } else if (inv.id === compareId) {
                inv.status = "compare";
              } else if (inv.status === "active" || inv.status === "compare") {
                inv.status = "idle";
              }
            }
            break;
          }
          case "merge": {
            const intoId = String(p.intoId);
            const fromIds = new Set(Array.isArray(p.fromIds) ? p.fromIds.map(String) : []);
            const newStart = Number(p.newStart);
            const newEnd = Number(p.newEnd);

            // Remove or merge fromIds into intoId
            const existingInto = rawIntervals.find((inv) => inv.id === intoId);
            if (existingInto) {
              existingInto.start = newStart;
              existingInto.end = newEnd;
              existingInto.label = `[${newStart}, ${newEnd}]`;
              existingInto.status = "merged";
            } else {
              rawIntervals.push({
                id: intoId,
                start: newStart,
                end: newEnd,
                label: `[${newStart}, ${newEnd}]`,
                status: "merged",
              });
            }

            // Remove other fromIds that merged into intoId
            rawIntervals = rawIntervals.filter(
              (inv) => inv.id === intoId || !fromIds.has(inv.id)
            );

            activeId = intoId;
            compareId = null;
            overlapResult = null;
            break;
          }
          case "discard": {
            const discardId = String(p.id);
            const target = rawIntervals.find((inv) => inv.id === discardId);
            if (target) {
              target.status = "discarded";
            }
            if (activeId === discardId) activeId = null;
            if (compareId === discardId) compareId = null;
            break;
          }
          case "markResult": {
            const resultId = String(p.id);
            const target = rawIntervals.find((inv) => inv.id === resultId);
            if (target) {
              target.status = "result";
            }
            break;
          }
        }
      }
    }

    // Auto-compute axis bounds if not provided
    if (minVal == null || maxVal == null) {
      if (rawIntervals.length > 0) {
        const starts = rawIntervals.map((i) => i.start);
        const ends = rawIntervals.map((i) => i.end);
        minVal = Math.min(...starts, 0);
        maxVal = Math.max(...ends, 10);
      } else {
        minVal = 0;
        maxVal = 20;
      }
    }

    // Ensure non-zero range
    if (maxVal <= minVal) maxVal = minVal + 10;

    return {
      intervals: rawIntervals,
      min: minVal,
      max: maxVal,
      activeId,
      compareId,
      overlapResult,
    };
  }, [initialData, actions]);

  const { intervals, min, max, activeId, compareId, overlapResult } = timelineState;

  // Compute lane assignment to stack overlapping bars in rows
  const { lanes, intervalLanes } = useMemo(() => {
    // Sort intervals by start, then by end
    const sorted = [...intervals].sort((a, b) => a.start - b.start || a.end - b.end);
    const laneEndings: number[] = [];
    const mapping = new Map<string, number>();

    for (const inv of sorted) {
      // Find lowest lane where previous interval end <= current start
      let placedLane = -1;
      for (let l = 0; l < laneEndings.length; l++) {
        if (laneEndings[l] <= inv.start) {
          placedLane = l;
          laneEndings[l] = inv.end;
          break;
        }
      }
      if (placedLane === -1) {
        placedLane = laneEndings.length;
        laneEndings.push(inv.end);
      }
      mapping.set(inv.id, placedLane);
    }

    return {
      lanes: Math.max(laneEndings.length, 1),
      intervalLanes: mapping,
    };
  }, [intervals]);

  // Number line ticks generation
  const range = max - min;
  let tickStep = 1;
  if (range > 30) tickStep = 5;
  else if (range > 15) tickStep = 2;

  const ticks: number[] = [];
  const startTick = Math.floor(min / tickStep) * tickStep;
  for (let t = startTick; t <= max; t += tickStep) {
    if (t >= min && t <= max) {
      ticks.push(t);
    }
  }

  const getPositionPercent = (val: number) => {
    return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
  };

  const LANE_HEIGHT = 44;
  const TRACK_PADDING_TOP = 20;
  const totalTrackHeight = TRACK_PADDING_TOP + lanes * LANE_HEIGHT + 60;

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-auto p-4"
      style={{ backgroundColor: sceneTokens.colors.bg }}
    >
      {/* Top Meta / Legend Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-3 px-3 py-2 rounded border border-[#22262B] bg-[#14171B]/80 backdrop-blur text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-[#8C93A1] uppercase tracking-wider text-[10px]">
            Timeline Track
          </span>
          {activeId && (
            <span className="font-mono text-[#E8A33D] font-medium bg-[#1B1F24] px-2 py-0.5 rounded border border-[#E8A33D]/30">
              Active: {activeId}
            </span>
          )}
          {compareId && (
            <span className="font-mono text-[#5FA8D3] font-medium bg-[#1B1F24] px-2 py-0.5 rounded border border-[#5FA8D3]/30">
              Comparing: {compareId} {overlapResult !== null && (overlapResult ? "(Overlaps)" : "(No Overlap)")}
            </span>
          )}
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm border"
              style={{
                borderColor: sceneTokens.colors.border,
                backgroundColor: sceneTokens.colors.surface,
              }}
            />
            <span className="text-[#8C93A1]">Idle</span>
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
                borderColor: sceneTokens.colors.accentCool,
                backgroundColor: "rgba(95, 168, 211, 0.15)",
              }}
            />
            <span className="text-[#8C93A1]">Compare</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm border"
              style={{
                borderColor: sceneTokens.colors.success,
                backgroundColor: "rgba(95, 191, 119, 0.25)",
              }}
            />
            <span className="text-[#8C93A1]">Merged</span>
          </div>
        </div>
      </div>

      {/* Main Timeline Card */}
      <div
        className="relative w-full max-w-2xl rounded-lg border border-[#22262B] bg-[#14171B] p-6 shadow-xl overflow-hidden flex flex-col justify-between"
        style={{ minHeight: `${totalTrackHeight}px` }}
      >
        {/* Interval Bars Stacking Area */}
        <div className="relative w-full flex-1" style={{ minHeight: `${lanes * LANE_HEIGHT}px` }}>
          {/* Subtle horizontal lane guide lines */}
          {Array.from({ length: lanes }).map((_, l) => (
            <div
              key={`lane-guide-${l}`}
              className="absolute left-0 right-0 border-b border-[#22262B]/40"
              style={{ top: `${l * LANE_HEIGHT + 36}px` }}
            />
          ))}

          {/* Render Intervals */}
          <AnimatePresence>
            {intervals.map((inv) => {
              const laneIndex = intervalLanes.get(inv.id) ?? 0;
              const leftPct = getPositionPercent(inv.start);
              const rightPct = getPositionPercent(inv.end);
              const widthPct = Math.max(rightPct - leftPct, 4);

              // Styling per status
              let borderColor = sceneTokens.borders.subtle;
              let bgColor = sceneTokens.surfaces.card;
              let textColor = sceneTokens.text.primary;
              let opacity = 1;
              let shadow = "none";
              let statusTag: string | null = null;

              if (inv.status === "active") {
                borderColor = sceneTokens.colors.accent;
                bgColor = sceneTokens.surfaces.raised;
                textColor = sceneTokens.colors.textPrimary;
                shadow = "0 0 10px rgba(232, 163, 61, 0.35)";
                statusTag = "ACTIVE";
              } else if (inv.status === "compare") {
                borderColor = sceneTokens.colors.accentCool;
                bgColor = "rgba(95, 168, 211, 0.15)";
                textColor = sceneTokens.colors.accentCool;
                shadow = "0 0 10px rgba(95, 168, 211, 0.35)";
                statusTag = "CHECK";
              } else if (inv.status === "merged") {
                borderColor = sceneTokens.colors.success;
                bgColor = "rgba(95, 191, 119, 0.22)";
                textColor = sceneTokens.colors.textPrimary;
                shadow = "0 0 12px rgba(95, 191, 119, 0.4)";
                statusTag = "MERGED";
              } else if (inv.status === "result") {
                borderColor = sceneTokens.colors.success;
                bgColor = "rgba(95, 191, 119, 0.15)";
                textColor = sceneTokens.colors.textPrimary;
                statusTag = "RESULT";
              } else if (inv.status === "discarded") {
                borderColor = "#22262B";
                bgColor = "transparent";
                textColor = sceneTokens.colors.textSecondary;
                opacity = 0.35;
                statusTag = "SKIP";
              }

              return (
                <motion.div
                  key={`interval-bar-${inv.id}`}
                  className="absolute rounded flex items-center justify-between px-2 font-mono text-xs select-none"
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    top: `${laneIndex * LANE_HEIGHT}px`,
                    height: "32px",
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    borderWidth: inv.status !== "idle" && inv.status !== "discarded" ? "2px" : "1px",
                    borderStyle: inv.status === "discarded" ? "dashed" : "solid",
                    color: textColor,
                    opacity,
                    boxShadow: shadow,
                  }}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                >
                  {/* Center Label / Range */}
                  <span className="font-bold tracking-tight text-xs mx-auto">
                    {inv.label || `[${inv.start}, ${inv.end}]`}
                  </span>

                  {/* Status Badge */}
                  {statusTag && (
                    <div
                      className="absolute -top-2.5 -right-1 px-1 py-0.2 rounded text-[7px] font-bold tracking-widest uppercase shadow"
                      style={{
                        backgroundColor:
                          inv.status === "merged" || inv.status === "result"
                            ? sceneTokens.colors.success
                            : inv.status === "compare"
                            ? sceneTokens.colors.accentCool
                            : inv.status === "active"
                            ? sceneTokens.colors.accent
                            : "#22262B",
                        color: "#0B0D10",
                      }}
                    >
                      {statusTag}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Horizontal Number Line Axis */}
        <div className="relative w-full pt-6 mt-4 border-t border-[#22262B]">
          {/* Axis Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#22262B]" />

          {/* Ticks & Number Labels */}
          <div className="relative w-full h-8">
            {ticks.map((t) => {
              const posPct = getPositionPercent(t);
              return (
                <div
                  key={`tick-${t}`}
                  className="absolute flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${posPct}%`, top: "-1px" }}
                >
                  {/* Tick marker */}
                  <div className="w-[1.5px] h-2 bg-[#8C93A1]/50" />
                  {/* Number Label */}
                  <span className="text-[10px] font-mono text-[#8C93A1] mt-1">{t}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
