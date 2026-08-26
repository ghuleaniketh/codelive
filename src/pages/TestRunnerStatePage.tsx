import { trpc } from "@/lib/trpc";

export function TestRunnerState() {
  const { data, isLoading, isError } = trpc.execution.getRunnerState.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div style={{ color: "red" }}>Error: {String(isError)}</div>;

  // Expose result globally for test verification
  if (typeof window !== "undefined") {
    ;(window as any).__RUNNER_STATE_RESULT = data;
  }

  return <pre style={{ fontFamily: "monospace", fontSize: "12px" }}>{JSON.stringify(data, null, 2)}</pre>;
}