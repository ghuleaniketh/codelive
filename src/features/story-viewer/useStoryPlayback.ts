import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type PlaybackStatus = "idle" | "playing" | "paused" | "completed";
export type PlaybackMode = "auto" | "manual";

export interface UseStoryPlaybackOptions {
  totalSteps: number;
  initialStep?: number;
  initialSpeed?: number;
  autoPlay?: boolean;
}

export interface UseStoryPlaybackResult {
  currentStepIndex: number;
  playbackStatus: PlaybackStatus;
  playbackMode: PlaybackMode;
  playbackSpeed: number;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  stepIntervalMs: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  goPrev: () => void;
  goNext: () => void;
  restart: () => void;
  goToStep: (index: number) => void;
  setSpeed: (speed: number) => void;
}

/**
 * Calculates step interval duration in milliseconds:
 * 1x -> 1200ms
 * 1.5x -> 800ms
 * 2x -> 500ms
 */
export function getStepIntervalMs(speed: number): number {
  if (speed >= 2) return 500;
  if (speed >= 1.5) return 800;
  return 1200;
}

export function useStoryPlayback({
  totalSteps,
  initialStep = 0,
  initialSpeed = 1,
  autoPlay = true,
}: UseStoryPlaybackOptions): UseStoryPlaybackResult {
  const [currentStepIndex, setCurrentStepIndex] = useState(() =>
    Math.max(0, Math.min(initialStep, Math.max(0, totalSteps - 1)))
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(initialSpeed);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(() =>
    autoPlay && totalSteps > 1 ? "auto" : "manual"
  );
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>(() => {
    if (totalSteps <= 1) return "completed";
    return autoPlay ? "playing" : "idle";
  });

  const stepIntervalMs = useMemo(() => getStepIntervalMs(playbackSpeed), [playbackSpeed]);

  // Keep references to state in refs to avoid stale closures in interval
  const currentStepRef = useRef(currentStepIndex);
  currentStepRef.current = currentStepIndex;

  const totalStepsRef = useRef(totalSteps);
  totalStepsRef.current = totalSteps;

  // Reset or adjust when totalSteps changes
  useEffect(() => {
    if (totalSteps <= 1) {
      setCurrentStepIndex(0);
      setPlaybackStatus("completed");
      setPlaybackMode("auto");
    } else if (autoPlay && playbackMode === "auto") {
      setCurrentStepIndex(0);
      setPlaybackStatus("playing");
    }
  }, [totalSteps, autoPlay]);

  // Autoplay timer loop
  useEffect(() => {
    if (playbackStatus !== "playing") return;
    if (totalStepsRef.current <= 1) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= totalStepsRef.current - 1) {
          setPlaybackStatus("completed");
          return totalStepsRef.current - 1;
        }
        return next;
      });
    }, stepIntervalMs);

    return () => clearInterval(timer);
  }, [playbackStatus, stepIntervalMs]);

  // Manual actions: all pause autoplay and set mode to "manual"
  const pause = useCallback(() => {
    setPlaybackStatus("paused");
    setPlaybackMode("manual");
  }, []);

  const play = useCallback(() => {
    setPlaybackMode("auto");
    setCurrentStepIndex((prev) => {
      // If at the end, restart from step 0
      if (prev >= totalStepsRef.current - 1) {
        return 0;
      }
      return prev;
    });
    setPlaybackStatus("playing");
  }, []);

  const togglePlay = useCallback(() => {
    if (playbackStatus === "playing") {
      pause();
    } else {
      play();
    }
  }, [playbackStatus, pause, play]);

  const goPrev = useCallback(() => {
    setPlaybackMode("manual");
    setPlaybackStatus("paused");
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setPlaybackMode("manual");
    setCurrentStepIndex((prev) => {
      const next = Math.min(totalStepsRef.current - 1, prev + 1);
      if (next >= totalStepsRef.current - 1) {
        setPlaybackStatus("completed");
      } else {
        setPlaybackStatus("paused");
      }
      return next;
    });
  }, []);

  const restart = useCallback(() => {
    setPlaybackMode("manual");
    setPlaybackStatus("paused");
    setCurrentStepIndex(0);
  }, []);

  const goToStep = useCallback((index: number) => {
    setPlaybackMode("manual");
    const clamped = Math.max(0, Math.min(totalStepsRef.current - 1, index));
    if (clamped >= totalStepsRef.current - 1) {
      setPlaybackStatus("completed");
    } else {
      setPlaybackStatus("paused");
    }
    setCurrentStepIndex(clamped);
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  return {
    currentStepIndex,
    playbackStatus,
    playbackMode,
    playbackSpeed,
    isPlaying: playbackStatus === "playing",
    isPaused: playbackStatus === "paused",
    isCompleted: playbackStatus === "completed",
    stepIntervalMs,
    play,
    pause,
    togglePlay,
    goPrev,
    goNext,
    restart,
    goToStep,
    setSpeed,
  };
}
