import type { ExecutionEvent } from "@shared/types/execution";
import { getArrayStateChanges, getVariableStateChanges } from "@shared/types/executionTimeline";

/**
 * Normalizes any validated timeline event for the current execution-state UI.
 * It accepts preview, mock, fixture, or future runtime events without assigning
 * execution truth; the caller remains responsible for the visible mode label.
 */
export function getExecutionTraceVisualState(event: ExecutionEvent) {
  const snapshot = event.snapshot;
  const frames = snapshot?.callStack ?? [];
  return {
    variables: snapshot?.variables ?? [],
    arrays: Object.entries(snapshot?.arrays ?? {}),
    pointers: snapshot?.pointers ?? [],
    frames,
    recursiveFrames: frames.filter((frame) => Boolean(frame.recursive) || /recursive/i.test(frame.name)),
    variableChanges: getVariableStateChanges(event),
    arrayChanges: getArrayStateChanges(event),
    exception: event.exception ?? snapshot?.exception,
    output: event.output,
  };
}
