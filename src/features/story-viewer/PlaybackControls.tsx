import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export interface PlaybackControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRestart: () => void;
  onSeek?: (index: number) => void;
  onStepChange?: (index: number) => void;
  steps?: unknown[];
  speed?: number;
  setSpeed?: (speed: number) => void;
}

export function PlaybackControls({
  currentStepIndex,
  totalSteps,
  isPlaying = false,
  onTogglePlay,
  onNext,
  onPrev,
  onRestart,
  onSeek,
  onStepChange,
  steps: _steps,
  speed = 1,
  setSpeed,
}: PlaybackControlsProps) {
  const handleSeek = onSeek || onStepChange;
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 12px",
        background: "#14171B",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
        borderRadius: 10,
        boxSizing: "border-box",
      }}
    >
      {/* Navigation Buttons + Step Counter */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={currentStepIndex === 0}
          className="transition-all duration-150 hover:bg-white/10 hover:text-white hover:border-white/20"
          style={{
            color: "#EDEEF0",
            borderRadius: 6,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: 12,
            height: 28,
            padding: "0 10px",
          }}
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5 text-[#00F0FF]" /> Prev
        </Button>

        {onTogglePlay && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause autoplay (Space)" : "Start autoplay (Space)"}
            title={isPlaying ? "Pause autoplay (Space)" : "Start autoplay (Space)"}
            className="transition-all duration-150 hover:bg-[#38BDF8] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
            style={{
              color: isPlaying ? "#0B0D10" : "#EDEEF0",
              backgroundColor: isPlaying ? "#00F0FF" : "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: isPlaying ? "0 0 12px rgba(0, 240, 255, 0.4)" : "none",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              height: 28,
              minWidth: 70,
              padding: "0 10px",
            }}
          >
            {isPlaying ? (
              <>
                <Pause className="mr-1.5 h-3 w-3 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3 w-3 fill-current text-[#00F0FF]" /> Play
              </>
            )}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentStepIndex === totalSteps - 1}
          className="transition-all duration-150 hover:bg-white/10 hover:text-white hover:border-white/20"
          style={{
            color: "#EDEEF0",
            borderRadius: 6,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: 12,
            height: 28,
            padding: "0 10px",
          }}
        >
          Next <ChevronRight className="ml-1 h-3.5 w-3.5 text-[#00F0FF]" />
        </Button>

        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 12,
            fontWeight: 500,
            color: "#8C93A1",
            minWidth: 64,
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
          className="transition-all duration-150 hover:bg-white/10 hover:text-white hover:border-white/20"
          style={{
            color: "#8C93A1",
            borderRadius: 6,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontSize: 12,
            height: 28,
            padding: "0 8px",
            marginLeft: 2,
          }}
        >
          <RotateCcw className="mr-1 h-3 w-3" /> Restart
        </Button>
      </div>

      {/* Speed Selector & Scrubber */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 220px", justifyContent: "flex-end" }}>
        <span
          style={{
            fontSize: 12,
            color: "#8C93A1",
            whiteSpace: "nowrap",
          }}
        >
          Speed:
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {["1", "1.5", "2"].map((s) => {
            const isSelected = s === String(speed);
            return (
              <Button
                key={s}
                variant="ghost"
                size="sm"
                className="transition-all duration-150 hover:bg-white/10 hover:text-white"
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 11,
                  padding: "0 6px",
                  height: 24,
                  borderRadius: 6,
                  border: `1px solid ${isSelected ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.08)"}`,
                  background: isSelected ? "rgba(255, 255, 255, 0.15)" : "transparent",
                  color: isSelected ? "#EDEEF0" : "#8C93A1",
                  boxShadow: isSelected ? "inset 0 1px 0 rgba(255, 255, 255, 0.1)" : "none",
                  fontWeight: isSelected ? 600 : 400,
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
          onChange={(e) => handleSeek && handleSeek(Number(e.target.value))}
          style={{
            flex: "1 1 100px",
            minWidth: 80,
            maxWidth: 160,
            cursor: "pointer",
            height: 4,
            accentColor: "#00F0FF",
          }}
          aria-label="Story scrubber"
        />
      </div>
    </div>
  );
}