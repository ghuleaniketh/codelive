import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { sceneTokens } from "./scenes/sceneTokens";

export interface PlaybackControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRestart: () => void;
  steps: any[];
  onStepChange: (index: number) => void;
  speed?: number;
  setSpeed?: (speed: number) => void;
}

export function PlaybackControls({
  currentStepIndex,
  totalSteps,
  isPlaying = false,
  onTogglePlay,
  onPrev,
  onNext,
  onRestart,
  steps,
  onStepChange,
  speed = 1,
  setSpeed,
}: PlaybackControlsProps) {
  const handleStepChange = (index: number) => {
    onStepChange(index);
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: sceneTokens.spacing[3],
        padding: `${sceneTokens.spacing[2]}px ${sceneTokens.spacing[3]}px`,
        background: sceneTokens.surfaces.panel,
        border: `1px solid ${sceneTokens.borders.subtle}`,
        borderRadius: sceneTokens.radii.lg,
      }}
    >
      {/* Navigation Buttons + Step Counter */}
      <div style={{ display: "flex", alignItems: "center", gap: sceneTokens.spacing[2] }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={currentStepIndex === 0}
          className="hover:bg-[#162238] hover:text-[#f8fafc] focus-visible:ring-1 focus-visible:ring-[#38bdf8]"
          style={{
            color: sceneTokens.text.primary,
            borderRadius: sceneTokens.radii.md,
            fontSize: sceneTokens.typography.caption.fontSize,
          }}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Prev
        </Button>

        {onTogglePlay && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause autoplay (Space)" : "Start autoplay (Space)"}
            title={isPlaying ? "Pause autoplay (Space)" : "Start autoplay (Space)"}
            className="hover:border-[#38bdf8] focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            style={{
              color: isPlaying ? sceneTokens.status.active.glow : sceneTokens.text.primary,
              backgroundColor: isPlaying ? sceneTokens.status.active.fill : "transparent",
              border: `1px solid ${isPlaying ? sceneTokens.status.active.stroke : sceneTokens.borders.subtle}`,
              borderRadius: sceneTokens.radii.md,
              fontSize: sceneTokens.typography.caption.fontSize,
              fontWeight: 600,
              minWidth: 72,
              transition: `all ${sceneTokens.motion.micro}s ease`,
            }}
          >
            {isPlaying ? (
              <>
                <Pause className="mr-1.5 h-3.5 w-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> Play
              </>
            )}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentStepIndex === totalSteps - 1}
          className="hover:bg-[#162238] hover:text-[#f8fafc] focus-visible:ring-1 focus-visible:ring-[#38bdf8]"
          style={{
            color: sceneTokens.text.primary,
            borderRadius: sceneTokens.radii.md,
            fontSize: sceneTokens.typography.caption.fontSize,
          }}
        >
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>

        <span
          style={{
            fontSize: sceneTokens.typography.caption.fontSize,
            fontWeight: 600,
            color: sceneTokens.text.secondary,
            minWidth: 76,
            textAlign: "center",
          }}
        >
          {currentStepIndex + 1} / {totalSteps}
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRestart}
          disabled={currentStepIndex === 0}
          className="hover:bg-[#162238] hover:text-[#f8fafc] focus-visible:ring-1 focus-visible:ring-[#38bdf8]"
          style={{
            color: sceneTokens.text.secondary,
            borderRadius: sceneTokens.radii.md,
            fontSize: sceneTokens.typography.caption.fontSize,
            marginLeft: 2,
          }}
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restart
        </Button>
      </div>

      {/* Speed Selector & Scrubber */}
      <div style={{ display: "flex", alignItems: "center", gap: sceneTokens.spacing[2], flex: "1 1 240px", justifyContent: "flex-end" }}>
        <span
          style={{
            fontSize: sceneTokens.typography.caption.fontSize,
            color: sceneTokens.text.muted,
            whiteSpace: "nowrap",
          }}
        >
          Speed:
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["1", "1.5", "2"].map((s) => {
            const isSelected = s === String(speed);
            return (
              <Button
                key={s}
                variant="ghost"
                size="sm"
                className="hover:border-[#38bdf8] hover:text-[#f8fafc] focus-visible:ring-1 focus-visible:ring-[#38bdf8]"
                style={{
                  fontSize: sceneTokens.typography.caption.fontSize,
                  padding: "2px 8px",
                  height: 26,
                  borderRadius: sceneTokens.radii.sm,
                  border: `1px solid ${isSelected ? sceneTokens.status.active.stroke : sceneTokens.borders.subtle}`,
                  background: isSelected ? sceneTokens.status.active.fill : "transparent",
                  color: isSelected ? sceneTokens.status.active.glow : sceneTokens.text.secondary,
                  fontWeight: isSelected ? 700 : 500,
                  transition: `all ${sceneTokens.motion.micro}s ease`,
                }}
                onClick={() => setSpeed && setSpeed(Number(s))}
              >
                {s}×
              </Button>
            );
          })}
        </div>

        <input
          type="range"
          min="0"
          max={Math.max(totalSteps - 1, 0)}
          value={currentStepIndex}
          onChange={(e) => handleStepChange(Number(e.target.value))}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          style={{
            flex: "1 1 120px",
            minWidth: 80,
            maxWidth: 180,
            height: 6,
            accentColor: sceneTokens.status.active.stroke,
            borderRadius: sceneTokens.radii.full,
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}