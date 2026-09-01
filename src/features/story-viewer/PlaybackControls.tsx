import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export interface PlaybackControlsProps {
  currentStepIndex: number;
  totalSteps: number;
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
        maxWidth: 920,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 8,
        padding: 8,
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Button variant="ghost" onClick={onPrev} disabled={currentStepIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Prev
        </Button>

        <span
          style={{
            fontSize: 12,
            color: "rgba(255, 255, 255, 0.7)",
            minWidth: 80,
            textAlign: "center",
          }}
        >
          step {currentStepIndex + 1} / {totalSteps}
        </span>

        <Button variant="ghost" onClick={onNext} disabled={currentStepIndex === totalSteps - 1}>
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <Button variant="ghost" onClick={onRestart} disabled={currentStepIndex === 0}>
        <RotateCcw className="mr-1 h-4 w-4" /> Restart
      </Button>

      <label
        style={{
          fontSize: 11,
          color: "rgba(255, 255, 255, 0.5)",
          whiteSpace: "nowrap",
        }}
      >
        Speed:
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {["1", "1.5", "2"].map((s) => (
          <Button
            key={s}
            variant="ghost"
            style={{
              fontSize: 11,
              padding: 4,
              border: `1px solid ${
                s === String(speed)
                  ? "rgba(255, 255, 255, 0.5)"
                  : "rgba(255, 255, 255, 0.2)"
              }`,
              borderRadius: 6,
              background:
                s === String(speed)
                  ? "rgba(59, 130, 246, 0.2)"
                  : "transparent",
            }}
            onClick={() => setSpeed && setSpeed(Number(s))}
          >
            {s}×
          </Button>
        ))}

        <input
          type="range"
          min="0"
          max={Math.max(totalSteps - 1, 0)}
          value={currentStepIndex}
          onChange={(e) => handleStepChange(Number(e.target.value))}
          style={{
            flex: 1,
            height: 8,
            WebkitAppearance: "none",
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.3)",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}