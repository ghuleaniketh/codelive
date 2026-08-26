import { useCallback, useEffect, useState } from "react";

import type { ExecutionEvent, ExecutionTimeline } from "@shared/types/execution";

export function useExecution(timeline?: ExecutionTimeline) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentEvent: ExecutionEvent | undefined = timeline?.events[step];

  const next = useCallback(() => {
    setStep((current) =>
      Math.min(current + 1, Math.max((timeline?.events.length ?? 1) - 1, 0)),
    );
  }, [timeline]);

  const previous = useCallback(() => {
    setStep((current) => Math.max(current - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setStep(0);
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setStep(0);
  }, [timeline]);

  useEffect(() => {
    if (!isPlaying || !timeline || step >= timeline.events.length - 1) return;
    const timer = window.setTimeout(next, 900);
    return () => window.clearTimeout(timer);
  }, [isPlaying, next, step, timeline]);

  return { step, currentEvent, next, previous, reset, isPlaying, togglePlay: () => setIsPlaying((playing) => !playing), pause: () => setIsPlaying(false) };
}
