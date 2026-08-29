import { trpc } from "@/lib/trpc";

/**
 * Thin wrapper around the real `questions.solve` mutation.
 * Exposes the minimal surface the question-input page needs.
 */
export function useSolveQuestion() {
  const mutation = trpc.questions.solve.useMutation();
  return {
    solve: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}
